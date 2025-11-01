# Architecture

## Overview

Prompt to Query is a multilingual SDK that allows developers to convert natural language prompts into MongoDB queries using Large Language Models (LLMs). The architecture is designed to be:

1. **Performant**: Core logic in Go compiled to shared libraries
2. **Multilingual**: Bindings for Python and JavaScript
3. **Flexible**: Support for multiple LLM providers
4. **Cross-platform**: Builds for Linux, macOS, and Windows

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    User Application                         │
│  (Python, JavaScript, or any language with FFI support)    │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ FFI/ctypes/ffi-napi
                         │
┌────────────────────────▼────────────────────────────────────┐
│                      SDK Layer                              │
│  ┌──────────────────┐        ┌──────────────────┐         │
│  │  Python Wrapper  │        │   JS Wrapper     │         │
│  │  - ctypes        │        │   - ffi-napi     │         │
│  │  - Error handling│        │   - Promises     │         │
│  │  - Type mapping  │        │   - Type mapping │         │
│  └──────────────────┘        └──────────────────┘         │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ C FFI calls
                         │
┌────────────────────────▼────────────────────────────────────┐
│                   Go Core (Shared Library)                  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Exported C Functions                                │  │
│  │  - InitSDK(config) → status                         │  │
│  │  - GenerateQuery(prompt) → query                    │  │
│  │  - GetVersion() → version                           │  │
│  │  - FreeString(ptr)                                  │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  LLM Integration Layer                               │  │
│  │  ┌──────────────┐        ┌──────────────┐          │  │
│  │  │   OpenAI     │        │  Anthropic   │          │  │
│  │  │   Client     │        │   Client     │          │  │
│  │  └──────────────┘        └──────────────┘          │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Prompt Engineering                                  │  │
│  │  - System prompt builder                            │  │
│  │  - Schema context injection                         │  │
│  │  - Examples and rules                               │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Query Parser & Validator                           │  │
│  │  - JSON parsing                                      │  │
│  │  - Schema validation                                 │  │
│  │  - Error handling                                    │  │
│  └──────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
                         │
                         │ HTTP/HTTPS
                         │
┌────────────────────────▼────────────────────────────────────┐
│                    LLM Providers                            │
│  ┌──────────────────┐        ┌──────────────────┐         │
│  │  OpenAI API      │        │  Anthropic API   │         │
│  │  - GPT-4         │        │  - Claude 3      │         │
│  │  - GPT-3.5       │        │  - Claude 2      │         │
│  └──────────────────┘        └──────────────────┘         │
└──────────────────────────────────────────────────────────────┘
```

## Component Details

### 1. Go Core (Shared Library)

**File**: `core/src/main.go`

The core is written in Go and compiled as a shared library (.so, .dylib, or .dll). It exports C-compatible functions that can be called from any language with FFI support.

**Key Functions**:

```go
//export InitSDK
func InitSDK(configJSON *C.char) *C.char

//export GenerateQuery
func GenerateQuery(prompt *C.char) *C.char

//export GetVersion
func GetVersion() *C.char

//export FreeString
func FreeString(str *C.char)
```

**Responsibilities**:
- Maintain global configuration
- Route requests to appropriate LLM provider
- Handle errors and return structured responses
- Memory management for C strings

### 2. LLM Integration Layer

**Files**: `core/src/openai.go`, `core/src/anthropic.go`

Handles communication with LLM APIs.

**OpenAI Integration**:
- Uses `go-openai` SDK
- Supports JSON mode for structured responses
- Configurable temperature and model

**Anthropic Integration**:
- Uses official Anthropic SDK
- System prompts for context
- Configurable parameters

### 3. Prompt Engineering

**File**: `core/src/prompt.go`

Builds optimized system prompts that include:
- Database schema context
- Query format specifications
- Examples of valid queries
- Rules and constraints

**Features**:
- Schema-aware prompt generation
- Format enforcement (JSON only)
- Type-safe field references
- Operation-specific templates

### 4. SDK Wrappers

#### Python SDK

**Files**: `sdk/python/prompt_to_query/`

- Uses `ctypes` to load shared library
- Pythonic API with type hints
- Exception handling
- Automatic platform detection

#### JavaScript SDK

**Files**: `sdk/javascript/src/`

- Uses `ffi-napi` for Node.js FFI
- Promise-based async API
- TypeScript definitions included
- Automatic platform detection

## Data Flow

### 1. Initialization

```
Application
    │
    ├─► SDK Wrapper
    │       │
    │       ├─► Load shared library (platform detection)
    │       ├─► Call InitSDK(config)
    │       │       │
    │       │       ├─► Parse config JSON
    │       │       ├─► Validate parameters
    │       │       ├─► Store global config
    │       │       └─► Return success/error
    │       │
    │       └─► Handle response
    │
    └─► SDK Instance ready
```

### 2. Query Generation

```
Application
    │
    ├─► Call generateQuery(prompt)
    │       │
    │       ├─► SDK Wrapper validates input
    │       ├─► Call GenerateQuery(prompt)
    │       │       │
    │       │       ├─► Build system prompt
    │       │       │   ├─► Include DB schema
    │       │       │   ├─► Add query rules
    │       │       │   └─► Add examples
    │       │       │
    │       │       ├─► Call LLM API
    │       │       │   ├─► OpenAI or Anthropic
    │       │       │   └─► Wait for response
    │       │       │
    │       │       ├─► Parse response JSON
    │       │       ├─► Validate query format
    │       │       └─► Return query/error
    │       │
    │       └─► Parse and return to application
    │
    └─► MongoDB Query Object
            │
            └─► Application executes on MongoDB
```

## Build System

### Makefile Structure

The Makefile supports:
- Single-platform builds (`make build`)
- Multi-platform builds (`make all`)
- Cross-compilation
- Dependency management
- Testing
- Examples

### Cross-Compilation

The build system supports cross-compilation for:

**From Linux**:
- Linux AMD64/ARM64 (native)
- Windows AMD64/ARM64 (mingw-w64)
- macOS AMD64/ARM64 (requires macOS SDK)

**From macOS**:
- macOS AMD64/ARM64 (native)
- Linux AMD64/ARM64 (cross-tools)
- Windows AMD64/ARM64 (mingw-w64)

**From Windows**:
- Windows AMD64/ARM64 (native)
- Linux/macOS (via WSL2)

## Security Considerations

1. **API Keys**: Never hardcoded, always from environment or config
2. **Input Validation**: All inputs validated before processing
3. **Memory Safety**: Proper C string memory management
4. **Error Handling**: No sensitive data in error messages
5. **HTTPS Only**: All LLM API calls over HTTPS

## Performance Considerations

1. **Shared Library**: Core logic in compiled Go for performance
2. **Lazy Loading**: Library loaded only when needed
3. **Connection Pooling**: HTTP clients reuse connections
4. **Caching**: Applications can cache frequently used queries
5. **Streaming**: Future support for streaming responses

## Extensibility

### Adding New LLM Providers

1. Create new file: `core/src/newprovider.go`
2. Implement function: `generateQueryNewProvider(ctx, prompt)`
3. Add case in `GenerateQuery` switch statement
4. Update configuration validation
5. Update documentation

### Adding New Language Bindings

1. Create directory: `sdk/newlang/`
2. Implement FFI loading for platform
3. Wrap exported functions
4. Add error handling
5. Write examples
6. Update documentation

## Testing Strategy

1. **Unit Tests**: Go core functions
2. **Integration Tests**: LLM API interactions
3. **SDK Tests**: Python and JavaScript wrappers
4. **Example Tests**: Run example applications
5. **Cross-platform Tests**: CI/CD for all platforms

## Future Enhancements

1. **Query Optimization**: Analyze and optimize generated queries
2. **Query Caching**: Cache common queries
3. **Multiple Databases**: Support PostgreSQL, MySQL, etc.
4. **Streaming**: Stream large result sets
5. **Query Explanation**: Explain generated queries
6. **Custom Functions**: Support for custom MongoDB functions
7. **Validation**: Pre-execution query validation
8. **Monitoring**: Query performance metrics
