# Prompt to Query - Python SDK

High-performance Python SDK to convert natural language prompts to MongoDB queries using AI (OpenAI GPT or Anthropic Claude).

## Installation

```bash
pip install prompt-to-query
```

## Quick Start

```python
from prompt_to_query import PromptToQuery

# Initialize the client
ptq = PromptToQuery(
    llm_provider="openai",
    api_key="your-api-key",
    db_schema_path="schema.json"
)

# Generate a MongoDB query from natural language
result = ptq.generate_query("Get all active users from last month")

print(result['query'])
# Output: {'operation': 'find', 'collection': 'users', 'filter': {...}}

print(result['columnTitles'])
# Output: ['User Name', 'Email', 'Status', 'Created At']
```

## Features

- 🚀 **High Performance**: Native Go library with Python bindings
- 🔄 **Cross-Platform**: Supports Linux (glibc/musl), macOS (Intel/ARM), and Windows
- 🎯 **Zero External Dependencies**: Uses only Python's standard library (ctypes)
- 🤖 **Multiple LLM Providers**: OpenAI (GPT-4) and Anthropic (Claude)
- 📊 **Flexible Schema**: JSON-based database schema definition
- 📋 **Column Titles**: Returns human-readable column titles for query results

## Supported Platforms

The package includes pre-built native libraries for:

- **Linux**: x86_64 (glibc), x86_64 (musl/Alpine), ARM64 (glibc), ARM64 (musl/Alpine)
- **macOS**: x86_64 (Intel), ARM64 (Apple Silicon)
- **Windows**: x86_64

## Documentation

For complete documentation, examples, and API reference, visit:
https://github.com/dimarborda/prompt-to-query

## Development

### Building from Source

```bash
# Install dependencies
pip install -e .

# Build native libraries for current platform
python scripts/build-native.py

# Build for all platforms (requires Docker)
python scripts/build-native.py --all
```

### Running Tests

```bash
pytest tests/
```

## License

MIT License - see LICENSE file for details

## Links

- **GitHub**: https://github.com/dimarborda/prompt-to-query
- **PyPI**: https://pypi.org/project/prompt-to-query/
- **Issues**: https://github.com/dimarborda/prompt-to-query/issues
