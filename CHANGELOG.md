# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-01-XX

### Added
- Initial release of Prompt to Query SDK
- Go core implementation with shared library support (.so/.dll/.dylib)
- Python SDK with ctypes bindings
- JavaScript/Node.js SDK with ffi-napi bindings
- OpenAI GPT integration
- Anthropic Claude integration
- Multi-platform build system (Linux, macOS, Windows)
- Cross-compilation support for AMD64 and ARM64 architectures
- Comprehensive documentation (README, USAGE, BUILD, ARCHITECTURE)
- Example applications for Python and JavaScript
- Database schema definition format
- Support for MongoDB query operations: find, aggregate, count
- Automatic platform detection in SDK wrappers
- Error handling and validation
- Setup script for easy installation

### Features
- Natural language to MongoDB query conversion
- Context-aware query generation using database schema
- Multiple LLM provider support
- Type-safe query generation
- Configurable models per provider
- Memory-safe C string handling
- Comprehensive error messages

### Supported Platforms
- Linux AMD64
- Linux ARM64
- macOS AMD64 (Intel)
- macOS ARM64 (Apple Silicon)
- Windows AMD64
- Windows ARM64

### Dependencies
- Go 1.21+
- Python 3.8+ (for Python SDK)
- Node.js 14+ (for JavaScript SDK)
- OpenAI API or Anthropic API access

## [Unreleased]

### Planned Features
- Query caching support
- Streaming response support
- PostgreSQL support
- MySQL support
- Query optimization suggestions
- Query explanation feature
- Performance monitoring
- Batch query generation
- Custom function support
- More language bindings (Rust, Java, C#)
- CLI tool for testing queries

### Known Issues
- None reported yet

---

## Version History

- **1.0.0**: Initial release with core functionality

---

For upgrade instructions and breaking changes, please see the [migration guide](docs/MIGRATION.md).
