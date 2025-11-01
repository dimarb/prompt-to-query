# Python SDK Examples

This directory contains examples demonstrating how to use the Prompt to Query Python SDK.

## Prerequisites

1. Install the SDK:
```bash
pip install prompt-to-query
```

2. Set up your API key:
```bash
export OPENAI_API_KEY="your-api-key"
# or
export ANTHROPIC_API_KEY="your-api-key"
```

3. Make sure you have the schema file (see `examples/schema.json` in the project root)

## Examples

### basic_usage.py

Demonstrates basic SDK usage including:
- Initializing the SDK
- Generating queries from natural language
- Accessing query results and column titles
- Using the results with MongoDB

Run it:
```bash
python examples/basic_usage.py
```

## Understanding Query Results

The `generate_query` method returns a dictionary with two keys:

```python
result = ptq.generate_query("Get top 10 products by price")

# result = {
#     "query": {
#         "operation": "find",
#         "collection": "products",
#         "sort": {"price": -1},
#         "limit": 10,
#         "projection": {"name": 1, "price": 1, "stock": 1}
#     },
#     "columnTitles": [
#         "Product Name",
#         "Price",
#         "Stock"
#     ]
# }
```

### Query Object

The `query` object contains the MongoDB query with standard fields:

- **operation**: Type of operation ("find", "aggregate", "count")
- **collection**: Name of the collection to query
- **filter**: Query filter (for find/count operations)
- **pipeline**: Aggregation pipeline (for aggregate operations)
- **projection**: Fields to include/exclude in results
- **sort**: Sort specification
- **limit**: Maximum number of documents to return
- **skip**: Number of documents to skip

### Column Titles

The `columnTitles` array provides human-readable names for the columns that will be returned by the query. This is useful for:

- Displaying table headers in UIs
- Generating reports
- Creating CSV exports
- Documenting what data the query returns

Example:
```python
result = ptq.generate_query("Find users with their email and status")

# You can use columnTitles for display
headers = result['columnTitles']  # ['User Name', 'Email', 'Status']
query = result['query']

# Execute query with MongoDB
cursor = db[query['collection']].find(
    query.get('filter', {}),
    query.get('projection', None)
)

# Display with headers
print(' | '.join(headers))
print('-' * 50)
for doc in cursor:
    # Display document values...
    pass
```

## Common Patterns

### Pattern 1: Simple Query Execution

```python
from prompt_to_query import PromptToQuery
from pymongo import MongoClient

# Initialize
ptq = PromptToQuery(
    llm_provider="openai",
    api_key="your-key",
    db_schema_path="schema.json"
)

# Generate query
result = ptq.generate_query("Get all active users")

# Execute
client = MongoClient("mongodb://localhost:27017/")
db = client.mydb
cursor = db[result['query']['collection']].find(result['query']['filter'])

# Display with column titles
print(' | '.join(result['columnTitles']))
for doc in cursor:
    print(doc)
```

### Pattern 2: Building a Data Table

```python
import pandas as pd

result = ptq.generate_query("Get top 10 products by price")
query = result['query']

# Execute query
docs = list(db[query['collection']].find(
    query.get('filter', {}),
    query.get('projection', None)
).sort(list(query['sort'].items())).limit(query['limit']))

# Create DataFrame with column titles
df = pd.DataFrame(docs)
df.columns = result['columnTitles']  # Use human-readable names

print(df)
```

### Pattern 3: CSV Export

```python
import csv

result = ptq.generate_query("Export all orders from last month")
query = result['query']

# Execute query
cursor = db[query['collection']].find(query.get('filter', {}))

# Write to CSV with column titles
with open('orders.csv', 'w', newline='') as csvfile:
    writer = csv.DictWriter(csvfile, fieldnames=result['columnTitles'])
    writer.writeheader()

    for doc in cursor:
        writer.writerow(doc)
```

## Error Handling

```python
from prompt_to_query import PromptToQuery, PromptToQueryError

try:
    ptq = PromptToQuery(
        llm_provider="openai",
        api_key="your-key",
        db_schema_path="schema.json"
    )

    result = ptq.generate_query("Get all users")

except PromptToQueryError as e:
    print(f"Error: {e}")
except FileNotFoundError:
    print("Schema file not found")
except Exception as e:
    print(f"Unexpected error: {e}")
```

## API Providers

### OpenAI (GPT-4)

```python
ptq = PromptToQuery(
    llm_provider="openai",
    api_key="sk-...",
    db_schema_path="schema.json",
    model="gpt-4"  # optional, defaults to gpt-4
)
```

### Anthropic (Claude)

```python
ptq = PromptToQuery(
    llm_provider="anthropic",
    api_key="sk-ant-...",
    db_schema_path="schema.json",
    model="claude-3-opus-20240229"  # optional
)
```

## Notes

- The SDK requires a valid schema file that describes your database structure
- Column titles are generated based on the schema and query context
- All queries are validated against the schema before execution
- The SDK supports complex queries including aggregations, joins, and nested fields
