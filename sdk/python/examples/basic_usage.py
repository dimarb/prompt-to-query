#!/usr/bin/env python3
"""
Basic usage example for the Prompt to Query Python SDK

This example demonstrates:
1. Initializing the SDK
2. Generating queries from natural language
3. Accessing query results and column titles
"""

from prompt_to_query import PromptToQuery
import json

# Initialize the SDK
ptq = PromptToQuery(
    llm_provider="openai",  # or "anthropic"
    api_key="your-api-key-here",
    db_schema_path="../../examples/schema.json"
)

# Example 1: Simple query
print("=" * 60)
print("Example 1: Simple query")
print("=" * 60)

result = ptq.generate_query("Get all active users")

print("\nQuery:")
print(json.dumps(result['query'], indent=2))

print("\nColumn Titles:")
print(result['columnTitles'])

# Example 2: Query with sorting and limit
print("\n" + "=" * 60)
print("Example 2: Query with sorting and limit")
print("=" * 60)

result = ptq.generate_query("Get top 10 products by price")

print("\nQuery:")
print(json.dumps(result['query'], indent=2))

print("\nColumn Titles:")
print(result['columnTitles'])

# Example 3: Aggregation query
print("\n" + "=" * 60)
print("Example 3: Aggregation query")
print("=" * 60)

result = ptq.generate_query("Count orders by status")

print("\nQuery:")
print(json.dumps(result['query'], indent=2))

print("\nColumn Titles:")
print(result['columnTitles'])

# Example 4: Complex query with filters
print("\n" + "=" * 60)
print("Example 4: Complex query with filters")
print("=" * 60)

result = ptq.generate_query("Find users from USA who registered in the last 30 days")

print("\nQuery:")
print(json.dumps(result['query'], indent=2))

print("\nColumn Titles:")
print(result['columnTitles'])

# Example 5: Using query results
print("\n" + "=" * 60)
print("Example 5: Using query results with MongoDB")
print("=" * 60)

result = ptq.generate_query("Get all products in stock")

query = result['query']
column_titles = result['columnTitles']

print("\nYou can now use this query with MongoDB:")
print(f"Collection: {query['collection']}")
print(f"Operation: {query['operation']}")
print(f"Filter: {query.get('filter', {})}")
print(f"\nExpected columns: {', '.join(column_titles)}")

# Example with pymongo (commented out - requires pymongo installed)
"""
from pymongo import MongoClient

client = MongoClient("mongodb://localhost:27017/")
db = client[query.get('database', 'mydb')]
collection = db[query['collection']]

if query['operation'] == 'find':
    cursor = collection.find(
        query.get('filter', {}),
        query.get('projection', None)
    )

    if 'sort' in query:
        cursor = cursor.sort(list(query['sort'].items()))

    if 'limit' in query:
        cursor = cursor.limit(query['limit'])

    # Print results with column titles
    print(f"\n{', '.join(column_titles)}")
    print("-" * 60)

    for doc in cursor:
        # Extract values based on projection or all fields
        print(doc)
"""

# Get SDK version
print("\n" + "=" * 60)
print(f"SDK Version: {ptq.get_version()}")
print("=" * 60)
