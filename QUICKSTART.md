# Quick Start Guide

Get started with Prompt to Query in 5 minutes!

## Prerequisites

- Go 1.21+ installed
- Python 3.8+ (for Python SDK) or Node.js 14+ (for JavaScript SDK)
- API key from OpenAI or Anthropic

## Installation

### 1. Clone and Setup

```bash
# Clone the repository
git clone https://github.com/dimarborda/prompt-to-query.git
cd prompt-to-query

# Run setup script
./scripts/setup.sh
```

The setup script will:
- Check dependencies
- Build the core library
- Optionally install Python/JavaScript SDKs

### 2. Manual Setup (Alternative)

```bash
# Install Go dependencies and build
make install-deps
make build

# For Python users
cd sdk/python
pip install -e .
cd ../..

# For JavaScript users
cd sdk/javascript
npm install
cd ../..
```

## Configuration

### Set API Key

```bash
# For OpenAI
export OPENAI_API_KEY="sk-..."

# For Anthropic
export ANTHROPIC_API_KEY="sk-ant-..."
```

### Create Database Schema

Create a file named `my-schema.json`:

```json
{
  "collections": [
    {
      "name": "users",
      "description": "User accounts",
      "fields": [
        {"name": "_id", "type": "ObjectId"},
        {"name": "email", "type": "string", "indexed": true},
        {"name": "name", "type": "string"},
        {"name": "status", "type": "string", "enum": ["active", "inactive"]},
        {"name": "createdAt", "type": "date"}
      ]
    },
    {
      "name": "products",
      "description": "Product catalog",
      "fields": [
        {"name": "_id", "type": "ObjectId"},
        {"name": "name", "type": "string"},
        {"name": "price", "type": "number"},
        {"name": "stock", "type": "number"},
        {"name": "isActive", "type": "boolean"}
      ]
    }
  ]
}
```

## Usage Examples

### Python

Create `test.py`:

```python
from prompt_to_query import PromptToQuery
import os

# Initialize
ptq = PromptToQuery(
    llm_provider="openai",  # or "anthropic"
    api_key=os.getenv("OPENAI_API_KEY"),
    db_schema_path="my-schema.json"
)

# Generate query
query = ptq.generate_query("Get all active users")
print(query)
# Output: {'operation': 'find', 'collection': 'users', 'filter': {'status': 'active'}}

# More examples
query = ptq.generate_query("Find products with price greater than 100")
print(query)

query = ptq.generate_query("Count all users created this month")
print(query)
```

Run it:
```bash
python test.py
```

### JavaScript

Create `test.js`:

```javascript
const { PromptToQuery } = require('prompt-to-query');

(async () => {
  // Initialize
  const ptq = new PromptToQuery({
    llmProvider: 'openai',  // or 'anthropic'
    apiKey: process.env.OPENAI_API_KEY,
    dbSchemaPath: 'my-schema.json'
  });

  // Generate query
  const query = await ptq.generateQuery('Get all active users');
  console.log(query);
  // Output: { operation: 'find', collection: 'users', filter: { status: 'active' } }

  // More examples
  const query2 = await ptq.generateQuery('Find products with price greater than 100');
  console.log(query2);

  const query3 = await ptq.generateQuery('Count all users created this month');
  console.log(query3);
})();
```

Run it:
```bash
node test.js
```

## Executing Queries on MongoDB

### Python with PyMongo

```python
from pymongo import MongoClient
from prompt_to_query import PromptToQuery
import os

# Connect to MongoDB
client = MongoClient("mongodb://localhost:27017/")
db = client["mydatabase"]

# Initialize SDK
ptq = PromptToQuery(
    llm_provider="openai",
    api_key=os.getenv("OPENAI_API_KEY"),
    db_schema_path="my-schema.json"
)

# Generate and execute query
prompt = "Get all active users"
query = ptq.generate_query(prompt)

# Execute the query
collection = db[query["collection"]]
results = list(collection.find(query["filter"]))

print(f"Found {len(results)} results")
for result in results:
    print(result)
```

### JavaScript with MongoDB Driver

```javascript
const { MongoClient } = require('mongodb');
const { PromptToQuery } = require('prompt-to-query');

(async () => {
  // Connect to MongoDB
  const client = new MongoClient('mongodb://localhost:27017/');
  await client.connect();
  const db = client.db('mydatabase');

  // Initialize SDK
  const ptq = new PromptToQuery({
    llmProvider: 'openai',
    apiKey: process.env.OPENAI_API_KEY,
    dbSchemaPath: 'my-schema.json'
  });

  // Generate and execute query
  const prompt = 'Get all active users';
  const query = await ptq.generateQuery(prompt);

  // Execute the query
  const collection = db.collection(query.collection);
  const results = await collection.find(query.filter).toArray();

  console.log(`Found ${results.length} results`);
  results.forEach(result => console.log(result));

  await client.close();
})();
```

## Run Examples

The project includes ready-to-use examples:

```bash
# Python example
export OPENAI_API_KEY="your-key"
python examples/python/example.py

# JavaScript example
export OPENAI_API_KEY="your-key"
node examples/javascript/example.js
```

## Common Query Types

### Simple Find
**Prompt**: "Get all active users"
```json
{
  "operation": "find",
  "collection": "users",
  "filter": {"status": "active"}
}
```

### Find with Comparison
**Prompt**: "Find products with price greater than 100"
```json
{
  "operation": "find",
  "collection": "products",
  "filter": {"price": {"$gt": 100}}
}
```

### Count
**Prompt**: "Count all active users"
```json
{
  "operation": "count",
  "collection": "users",
  "filter": {"status": "active"}
}
```

### Sort and Limit
**Prompt**: "Get top 10 products by price"
```json
{
  "operation": "find",
  "collection": "products",
  "sort": {"price": -1},
  "limit": 10
}
```

### Aggregation
**Prompt**: "Get average price by category"
```json
{
  "operation": "aggregate",
  "collection": "products",
  "pipeline": [
    {"$group": {"_id": "$category", "avgPrice": {"$avg": "$price"}}}
  ]
}
```

## Troubleshooting

### Library not found

```bash
# Rebuild the library
make clean
make build
```

### API errors

- Check your API key is correct
- Verify you have credits/access
- Check internet connection

### Import errors (Python)

```bash
# Reinstall in development mode
cd sdk/python
pip install -e .
```

### Module not found (JavaScript)

```bash
# Install dependencies
cd sdk/javascript
npm install
```

## Next Steps

- Read the full [Usage Guide](docs/USAGE.md)
- Learn about the [Architecture](docs/ARCHITECTURE.md)
- Check [Build Instructions](docs/BUILD.md) for advanced builds
- Explore more examples in the `examples/` directory

## Support

- Issues: https://github.com/dimarborda/prompt-to-query/issues
- Documentation: `docs/` directory
- Examples: `examples/` directory
