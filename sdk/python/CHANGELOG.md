# Changelog

All notable changes to the Python SDK will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.1] - TBD

### Added
- **Column Titles Support**: The `generate_query()` method now returns a dictionary with two keys:
  - `query`: The MongoDB query object (same as before)
  - `columnTitles`: Array of human-readable column titles for the query results
- Added comprehensive examples in `examples/` directory
- Added `examples/basic_usage.py` demonstrating column titles usage
- Added `examples/README.md` with common patterns and best practices

### Changed
- **BREAKING CHANGE**: `generate_query()` now returns `{"query": {...}, "columnTitles": [...]}` instead of just the query object
- Updated all documentation to reflect the new return format
- Enhanced docstrings with column titles examples

### Migration Guide

**Before (v1.0.0):**
```python
query = ptq.generate_query("Get all users")
print(query)  # Direct access to query object
```

**After (v1.0.1):**
```python
result = ptq.generate_query("Get all users")
print(result['query'])  # Access query via 'query' key
print(result['columnTitles'])  # Access column titles
```

## [1.0.0] - 2024-10-31

### Added
- Initial release of the Python SDK
- Support for 7 platforms (Linux x64/ARM64 glibc/musl, macOS Intel/ARM, Windows x64)
- OpenAI and Anthropic LLM provider support
- Zero external dependencies (uses ctypes)
- Intelligent platform detection and library loading
- Alpine Linux (musl) detection
- Multiple search paths for binaries
- Comprehensive documentation (README, PUBLISHING, STRUCTURE, QUICK_START)
- GitHub Actions workflow for automated publishing to PyPI
- Build script for cross-platform compilation

### Features
- Generate MongoDB queries from natural language
- Support for find, aggregate, and count operations
- JSON-based database schema
- Automatic platform and architecture detection
- Cross-platform binary support
