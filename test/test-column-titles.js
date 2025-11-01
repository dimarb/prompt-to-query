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
  },
  orders: {
    fields: {
      _id: "ObjectId",
      userId: "ObjectId",
      total: "number",
      status: "string",
      createdAt: "date"
    }
  }
};

async function test() {
  console.log('🧪 Testing Column Titles Feature\n');

  const ptq = new PromptToQuery({
    llmProvider: 'openai',
    apiKey: process.env.OPENAI_API_KEY || 'test-key',
    dbSchema: schema
  });

  console.log('SDK Version:', ptq.getVersion());
  console.log('');

  const testCases = [
    'Get all active users',
    'Show top 10 products by price',
    'Count orders from last month',
    'Get user names and emails for premium users'
  ];

  for (const prompt of testCases) {
    console.log(`📝 Prompt: "${prompt}"`);

    try {
      const result = await ptq.generateQuery(prompt);

      console.log('✅ Query:');
      console.log(JSON.stringify(result.query, null, 2));

      console.log('\n📊 Column Titles:');
      console.log(result.columnTitles.map(title => `  - ${title}`).join('\n'));

      console.log('\n' + '='.repeat(60) + '\n');
    } catch (error) {
      console.error('❌ Error:', error.message);
      console.log('\n' + '='.repeat(60) + '\n');
    }
  }
}

test().catch(console.error);
