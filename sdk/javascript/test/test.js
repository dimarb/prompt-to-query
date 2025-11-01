#!/usr/bin/env node

/**
 * Basic tests for PromptToQuery SDK
 *
 * These tests verify that the SDK loads correctly and basic functionality works.
 * For full integration tests with LLM providers, you need to set API keys.
 */

const path = require('path');
const { PromptToQuery, PromptToQueryError } = require('../src/index.js');

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  gray: '\x1b[90m'
};

let passed = 0;
let failed = 0;
let skipped = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`${colors.green}✓${colors.reset} ${name}`);
    passed++;
  } catch (error) {
    console.log(`${colors.red}✗${colors.reset} ${name}`);
    console.log(`  ${colors.gray}${error.message}${colors.reset}`);
    failed++;
  }
}

function skip(name, reason) {
  console.log(`${colors.yellow}⊘${colors.reset} ${name} ${colors.gray}(${reason})${colors.reset}`);
  skipped++;
}

console.log(`${colors.blue}Running PromptToQuery SDK Tests${colors.reset}\n`);

// Test 1: Module loading
test('should load module without errors', () => {
  if (!PromptToQuery) {
    throw new Error('PromptToQuery class not exported');
  }
  if (!PromptToQueryError) {
    throw new Error('PromptToQueryError class not exported');
  }
});

// Test 2: PromptToQueryError class
test('should create PromptToQueryError instances', () => {
  const error = new PromptToQueryError('test error');
  if (!(error instanceof Error)) {
    throw new Error('PromptToQueryError should extend Error');
  }
  if (error.name !== 'PromptToQueryError') {
    throw new Error('Error name should be PromptToQueryError');
  }
  if (error.message !== 'test error') {
    throw new Error('Error message not preserved');
  }
});

// Test 3: Constructor validation
test('should throw error when no schema provided', () => {
  try {
    new PromptToQuery({
      llmProvider: 'openai',
      apiKey: 'test-key'
      // No schema provided
    });
    throw new Error('Should have thrown an error');
  } catch (error) {
    if (!error.message.includes('dbSchema') && !error.message.includes('dbSchemaPath')) {
      throw new Error('Error message should mention schema requirement');
    }
  }
});

// Test 4: Check library file detection
test('should detect library files correctly', () => {
  const fs = require('fs');
  const os = require('os');

  const platform = os.platform();
  const buildDir = path.join(__dirname, '..', '..', '..', 'core', 'build');

  const expectedExtensions = {
    'linux': '.so',
    'darwin': '.dylib',
    'win32': '.dll'
  };

  const ext = expectedExtensions[platform];
  if (!ext) {
    throw new Error(`Unknown platform: ${platform}`);
  }

  // Check if at least one library file exists
  if (!fs.existsSync(buildDir)) {
    throw new Error(`Build directory not found: ${buildDir}`);
  }

  const files = fs.readdirSync(buildDir);
  const hasLibrary = files.some(f => f.includes('prompttoquery') && f.endsWith(ext));

  if (!hasLibrary) {
    throw new Error(`No library files found in ${buildDir} with extension ${ext}`);
  }
});

// Integration tests - only run if API keys are available
const hasOpenAI = !!process.env.OPENAI_API_KEY;
const hasAnthropic = !!process.env.ANTHROPIC_API_KEY;

if (!hasOpenAI && !hasAnthropic) {
  console.log(`\n${colors.yellow}Integration Tests Skipped${colors.reset}`);
  console.log(`${colors.gray}Set OPENAI_API_KEY or ANTHROPIC_API_KEY to run integration tests${colors.reset}\n`);
} else {
  console.log(`\n${colors.blue}Running Integration Tests${colors.reset}\n`);

  // Create a simple test schema
  const testSchema = {
    users: {
      fields: {
        name: 'string',
        email: 'string',
        status: 'string',
        created_at: 'date'
      }
    },
    products: {
      fields: {
        name: 'string',
        price: 'number',
        category: 'string'
      }
    }
  };

  if (hasOpenAI) {
    test('should initialize with OpenAI', () => {
      const ptq = new PromptToQuery({
        llmProvider: 'openai',
        apiKey: process.env.OPENAI_API_KEY,
        dbSchema: testSchema
      });

      if (!ptq) {
        throw new Error('Failed to create PromptToQuery instance');
      }

      const version = ptq.getVersion();
      if (!version || typeof version !== 'string') {
        throw new Error('getVersion() should return a string');
      }
    });

    // Note: We skip actual query generation in tests to avoid API costs
    skip('should generate query with OpenAI', 'Skipped to avoid API costs');
  }

  if (hasAnthropic) {
    test('should initialize with Anthropic', () => {
      const ptq = new PromptToQuery({
        llmProvider: 'anthropic',
        apiKey: process.env.ANTHROPIC_API_KEY,
        dbSchema: testSchema
      });

      if (!ptq) {
        throw new Error('Failed to create PromptToQuery instance');
      }

      const version = ptq.getVersion();
      if (!version || typeof version !== 'string') {
        throw new Error('getVersion() should return a string');
      }
    });

    skip('should generate query with Anthropic', 'Skipped to avoid API costs');
  }
}

// Print summary
console.log('\n' + '─'.repeat(50));
console.log(`${colors.blue}Test Summary${colors.reset}`);
console.log('─'.repeat(50));
console.log(`${colors.green}Passed:${colors.reset}  ${passed}`);
console.log(`${colors.red}Failed:${colors.reset}  ${failed}`);
console.log(`${colors.yellow}Skipped:${colors.reset} ${skipped}`);
console.log('─'.repeat(50));

if (failed > 0) {
  console.log(`\n${colors.red}Tests failed!${colors.reset}\n`);
  process.exit(1);
} else {
  console.log(`\n${colors.green}All tests passed!${colors.reset}\n`);
  process.exit(0);
}
