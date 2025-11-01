#!/usr/bin/env node
/**
 * Example usage of the PromptToQuery SDK for JavaScript/Node.js
 */

const path = require('path');
const fs = require('fs');

// Add the SDK to the path
const sdkPath = path.join(__dirname, '..', '..', 'sdk', 'javascript', 'src');
const { PromptToQuery, PromptToQueryError } = require(sdkPath);

async function main() {
  // Check for API key
  const apiKey = process.env.OPENAI_API_KEY || process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.error('Error: Please set OPENAI_API_KEY or ANTHROPIC_API_KEY environment variable');
    process.exit(1);
  }

  // Determine which provider to use
  const llmProvider = process.env.OPENAI_API_KEY ? 'openai' : 'anthropic';

  // Path to schema
  const schemaPath = path.join(__dirname, '..', 'schema.json');

  console.log(`Initializing PromptToQuery with ${llmProvider}...`);

  try {
    // Initialize the SDK
    const ptq = new PromptToQuery({
      llmProvider,
      apiKey,
      dbSchemaPath: schemaPath
    });

    console.log(`SDK Version: ${ptq.getVersion()}\n`);

    // Example queries
    const prompts = [
      'Get all active users',
      'Find products with price greater than 100 dollars',
      'Count orders from last month',
      'Get top 10 products by sales with their categories',
      'Find users who logged in during the last 7 days',
      'Get all orders with status \'delivered\' sorted by date descending',
    ];

    for (let i = 0; i < prompts.length; i++) {
      const prompt = prompts[i];
      console.log(`${i + 1}. Prompt: ${prompt}`);
      try {
        const query = await ptq.generateQuery(prompt);
        console.log(`   Query: ${JSON.stringify(query, null, 2)}\n`);
      } catch (error) {
        console.log(`   Error: ${error.message}\n`);
      }
    }
  } catch (error) {
    if (error instanceof PromptToQueryError) {
      console.error(`Initialization failed: ${error.message}`);
    } else {
      console.error(`Unexpected error: ${error.message}`);
    }
    process.exit(1);
  }
}

main().catch(console.error);
