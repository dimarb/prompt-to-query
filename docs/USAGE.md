# Usage Guide

## Table of Contents

1. [Installation](#installation)
2. [Configuration](#configuration)
3. [Database Schema](#database-schema)
4. [Python SDK](#python-sdk)
5. [JavaScript SDK](#javascript-sdk)
6. [Query Execution](#query-execution)
7. [Advanced Usage](#advanced-usage)

## Installation

### Python

```bash
pip install prompt-to-query
```

### JavaScript/Node.js

```bash
npm install prompt-to-query
```

## Configuration

### API Keys

You'll need an API key from either:
- OpenAI (for GPT models): https://platform.openai.com/api-keys
- Anthropic (for Claude models): https://console.anthropic.com/

### Environment Variables

```bash
# For OpenAI
export OPENAI_API_KEY="sk-..."

# For Anthropic
export ANTHROPIC_API_KEY="sk-ant-..."
```

## Database Schema

Create a JSON file describing your MongoDB database schema:

```json
{
  "collections": [
    {
      "name": "users",
      "description": "User accounts",
      "fields": [
        {
          "name": "_id",
          "type": "ObjectId",
          "description": "Unique identifier"
        },
        {
          "name": "email",
          "type": "string",
          "indexed": true,
          "unique": true
        },
        {
          "name": "status",
          "type": "string",
          "enum": ["active", "inactive"]
        },
        {
          "name": "createdAt",
          "type": "date"
        }
      ],
      "indexes": ["email", "status"]
    }
  ]
}
```

### Field Types

Supported types:
- `string`
- `number`
- `boolean`
- `date`
- `ObjectId`
- `array`
- `object`

### Field Attributes

- `type`: Field data type (required)
- `description`: Human-readable description
- `indexed`: Whether field has an index
- `unique`: Whether field must be unique
- `enum`: Array of allowed values
- `ref`: Reference to another collection
- `schema`: Nested object schema (for object types)
- `items`: Type or schema for array items

## Python SDK

### Basic Usage

```python
from prompt_to_query import PromptToQuery

# Initialize
ptq = PromptToQuery(
    llm_provider="openai",  # or "anthropic"
    api_key="your-api-key",
    db_schema_path="schema.json"
)

# Generate query
query = ptq.generate_query("Get all active users")
print(query)
```

### With Schema Object

```python
schema = {
    "collections": [
        {
            "name": "users",
            "fields": [...]
        }
    ]
}

ptq = PromptToQuery(
    llm_provider="openai",
    api_key="your-api-key",
    db_schema=schema
)
```

### Custom Model

```python
ptq = PromptToQuery(
    llm_provider="openai",
    api_key="your-api-key",
    db_schema_path="schema.json",
    model="gpt-4"  # Specify exact model
)
```

### Error Handling

```python
from prompt_to_query import PromptToQuery, PromptToQueryError

try:
    ptq = PromptToQuery(...)
    query = ptq.generate_query("your prompt")
except PromptToQueryError as e:
    print(f"Error: {e}")
```

## JavaScript SDK

### Basic Usage

```javascript
const { PromptToQuery } = require('prompt-to-query');

// Initialize
const ptq = new PromptToQuery({
  llmProvider: 'openai',  // or 'anthropic'
  apiKey: 'your-api-key',
  dbSchemaPath: 'schema.json'
});

// Generate query
const query = await ptq.generateQuery('Get all active users');
console.log(query);
```

### With Schema Object

```javascript
const schema = {
  collections: [
    {
      name: 'users',
      fields: [...]
    }
  ]
};

const ptq = new PromptToQuery({
  llmProvider: 'openai',
  apiKey: 'your-api-key',
  dbSchema: schema
});
```

### Custom Model

```javascript
const ptq = new PromptToQuery({
  llmProvider: 'openai',
  apiKey: 'your-api-key',
  dbSchemaPath: 'schema.json',
  model: 'gpt-4'  // Specify exact model
});
```

### Error Handling

```javascript
const { PromptToQuery, PromptToQueryError } = require('prompt-to-query');

try {
  const ptq = new PromptToQuery({...});
  const query = await ptq.generateQuery('your prompt');
} catch (error) {
  if (error instanceof PromptToQueryError) {
    console.error('SDK Error:', error.message);
  } else {
    console.error('Unexpected error:', error);
  }
}
```

## Query Execution

The SDK returns a MongoDB query object that you can execute with your MongoDB client:

### Python (PyMongo)

```python
from pymongo import MongoClient
from prompt_to_query import PromptToQuery

# Setup
client = MongoClient("mongodb://localhost:27017/")
db = client["mydb"]
ptq = PromptToQuery(...)

# Generate query
prompt = "Get all active users"
query = ptq.generate_query(prompt)

# Execute based on operation type
if query["operation"] == "find":
    collection = db[query["collection"]]
    cursor = collection.find(
        query.get("filter", {}),
        query.get("projection", None)
    )
    if "sort" in query:
        cursor = cursor.sort(list(query["sort"].items()))
    if "limit" in query:
        cursor = cursor.limit(query["limit"])
    if "skip" in query:
        cursor = cursor.skip(query["skip"])

    results = list(cursor)

elif query["operation"] == "aggregate":
    collection = db[query["collection"]]
    results = list(collection.aggregate(query["pipeline"]))

elif query["operation"] == "count":
    collection = db[query["collection"]]
    count = collection.count_documents(query.get("filter", {}))
    results = count
```

### JavaScript (MongoDB Node Driver)

```javascript
const { MongoClient } = require('mongodb');
const { PromptToQuery } = require('prompt-to-query');

// Setup
const client = new MongoClient('mongodb://localhost:27017/');
await client.connect();
const db = client.db('mydb');

const ptq = new PromptToQuery({...});

// Generate query
const prompt = 'Get all active users';
const query = await ptq.generateQuery(prompt);

// Execute based on operation type
let results;

if (query.operation === 'find') {
  const collection = db.collection(query.collection);
  let cursor = collection.find(
    query.filter || {},
    { projection: query.projection }
  );

  if (query.sort) cursor = cursor.sort(query.sort);
  if (query.limit) cursor = cursor.limit(query.limit);
  if (query.skip) cursor = cursor.skip(query.skip);

  results = await cursor.toArray();

} else if (query.operation === 'aggregate') {
  const collection = db.collection(query.collection);
  results = await collection.aggregate(query.pipeline).toArray();

} else if (query.operation === 'count') {
  const collection = db.collection(query.collection);
  results = await collection.countDocuments(query.filter || {});
}
```

## Advanced Usage

### Helper Function (Python)

```python
def execute_prompt_query(db, ptq, prompt):
    """Helper to execute a natural language query"""
    query = ptq.generate_query(prompt)

    collection = db[query["collection"]]

    if query["operation"] == "find":
        cursor = collection.find(
            query.get("filter", {}),
            query.get("projection")
        )
        if "sort" in query:
            cursor = cursor.sort(list(query["sort"].items()))
        if "limit" in query:
            cursor = cursor.limit(query["limit"])
        if "skip" in query:
            cursor = cursor.skip(query["skip"])
        return list(cursor)

    elif query["operation"] == "aggregate":
        return list(collection.aggregate(query["pipeline"]))

    elif query["operation"] == "count":
        return collection.count_documents(query.get("filter", {}))

# Usage
results = execute_prompt_query(db, ptq, "Get top 10 users by registration date")
```

### Helper Function (JavaScript)

```javascript
async function executePromptQuery(db, ptq, prompt) {
  const query = await ptq.generateQuery(prompt);
  const collection = db.collection(query.collection);

  if (query.operation === 'find') {
    let cursor = collection.find(query.filter || {}, { projection: query.projection });
    if (query.sort) cursor = cursor.sort(query.sort);
    if (query.limit) cursor = cursor.limit(query.limit);
    if (query.skip) cursor = cursor.skip(query.skip);
    return await cursor.toArray();
  } else if (query.operation === 'aggregate') {
    return await collection.aggregate(query.pipeline).toArray();
  } else if (query.operation === 'count') {
    return await collection.countDocuments(query.filter || {});
  }
}

// Usage
const results = await executePromptQuery(db, ptq, 'Get top 10 users by registration date');
```

### Caching Queries

```python
from functools import lru_cache

class CachedPromptToQuery(PromptToQuery):
    @lru_cache(maxsize=100)
    def generate_query(self, prompt: str):
        return super().generate_query(prompt)
```

### Multiple LLM Providers

```python
# Try OpenAI first, fallback to Anthropic
try:
    ptq = PromptToQuery(
        llm_provider="openai",
        api_key=os.getenv("OPENAI_API_KEY"),
        db_schema_path="schema.json"
    )
except Exception:
    ptq = PromptToQuery(
        llm_provider="anthropic",
        api_key=os.getenv("ANTHROPIC_API_KEY"),
        db_schema_path="schema.json"
    )
```
