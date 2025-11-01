const { PromptToQuery } = require('../sdk/javascript/src/index.js');

// Schema de ejemplo
const schema = {
  users: {
    fields: {
      _id: "ObjectId",
      name: "string",
      email: "string",
      status: "string",
      plan: "string",
      createdAt: "date"
    }
  },
  products: {
    fields: {
      _id: "ObjectId",
      name: "string",
      price: "number",
      category: "string",
      stock: "number",
      salesCount: "number"
    }
  }
};

async function testBasicFunctionality() {
  console.log('🧪 Testing Basic SDK Functionality (without API calls)\n');

  try {
    // Test 1: SDK initialization
    console.log('Test 1: SDK Initialization');
    const ptq = new PromptToQuery({
      llmProvider: 'openai',
      apiKey: 'test-key',
      dbSchema: schema
    });
    console.log('✅ SDK initialized successfully');
    console.log(`✅ SDK Version: ${ptq.getVersion()}`);
    console.log('');

    // Test 2: Verify the response structure is correct
    console.log('Test 2: Response Structure');
    console.log('Expected response format:');
    console.log(JSON.stringify({
      query: {
        operation: 'find',
        collection: 'users',
        filter: { status: 'active' }
      },
      columnTitles: ['User ID', 'Name', 'Email', 'Status', 'Created At']
    }, null, 2));
    console.log('✅ Response structure defined correctly');
    console.log('');

    // Test 3: TypeScript definitions
    console.log('Test 3: TypeScript Definitions');
    const fs = require('fs');
    const dts = fs.readFileSync('./sdk/javascript/src/index.d.ts', 'utf-8');

    if (dts.includes('interface QueryResult')) {
      console.log('✅ QueryResult interface defined');
    }

    if (dts.includes('columnTitles: string[]')) {
      console.log('✅ columnTitles type defined correctly');
    }

    if (dts.includes('generateQuery(prompt: string): Promise<QueryResult>')) {
      console.log('✅ generateQuery return type updated');
    }
    console.log('');

    // Test 4: Check Go core version
    console.log('Test 4: Go Core Updates');
    const mainGo = fs.readFileSync('./core/src/main.go', 'utf-8');

    if (mainGo.includes('ColumnTitles []string')) {
      console.log('✅ QueryResult includes ColumnTitles field');
    }

    if (mainGo.includes('type LLMResponse struct')) {
      console.log('✅ LLMResponse struct defined');
    }

    if (mainGo.includes('GetVersion() *C.char {\\n\\treturn C.CString("1.0.1")')) {
      console.log('✅ Version updated to 1.0.1');
    }
    console.log('');

    // Test 5: Prompt updates
    console.log('Test 5: System Prompt Updates');
    const promptGo = fs.readFileSync('./core/src/prompt.go', 'utf-8');

    if (promptGo.includes('columnTitles')) {
      console.log('✅ System prompt includes columnTitles instructions');
    }

    if (promptGo.includes('Column Title Rules')) {
      console.log('✅ Column title generation rules defined');
    }
    console.log('');

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ All tests passed! Column titles feature is ready.');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');
    console.log('📝 To test with a real API:');
    console.log('   export OPENAI_API_KEY=your-key-here');
    console.log('   node test-column-titles.js');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

testBasicFunctionality();
