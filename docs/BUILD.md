# Build Instructions

## Prerequisites

### All Platforms
- Go 1.21 or higher
- Make (or equivalent build tool)

### Platform-Specific Requirements

#### Linux
- GCC compiler
- For cross-compilation to ARM64: `gcc-aarch64-linux-gnu`

#### macOS
- Xcode Command Line Tools
- Both AMD64 and ARM64 can be compiled natively on Apple Silicon

#### Windows
- For cross-compilation from Linux/macOS:
  - `mingw-w64` for Windows AMD64: `x86_64-w64-mingw32-gcc`
  - `mingw-w64` for Windows ARM64: `aarch64-w64-mingw32-gcc`
- For native Windows compilation:
  - MinGW-w64 or TDM-GCC

## Building

### Quick Start
```bash
# Build for your current platform
make build

# Build for all platforms
make all
```

### Platform-Specific Builds

#### Linux
```bash
# Build for Linux AMD64 and ARM64
make build-linux

# Or build for current architecture only
make build-linux-current
```

#### macOS
```bash
# Build for macOS AMD64 and ARM64
make build-macos

# Or build for current architecture only
make build-macos-current
```

#### Windows
```bash
# Build for Windows AMD64 and ARM64 (requires mingw-w64)
make build-windows

# Or build for current architecture only (from Windows)
make build-windows-current
```

## Installation

### Installing Dependencies

#### Go Dependencies
```bash
make install-deps
```

#### Python SDK
```bash
# Install in development mode
make install-python-dev

# Or install manually
cd sdk/python
pip install -e .
```

#### JavaScript/Node.js SDK
```bash
# Install dependencies
make install-js-dev

# Or install manually
cd sdk/javascript
npm install
```

## Cross-Compilation Setup

### On Ubuntu/Debian

```bash
# Install cross-compilation tools
sudo apt-get update
sudo apt-get install -y \
  gcc \
  gcc-aarch64-linux-gnu \
  gcc-mingw-w64-x86-64 \
  gcc-mingw-w64-aarch64

# Verify Go installation
go version  # Should be 1.21+
```

### On macOS

```bash
# Install Homebrew if not already installed
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install cross-compilation tools for Windows
brew install mingw-w64

# Verify Go installation
go version  # Should be 1.21+
```

### On Windows

```bash
# Install Chocolatey if not already installed
# Then install build tools
choco install golang mingw make

# Or use WSL2 with Ubuntu and follow Linux instructions
```

## Troubleshooting

### CGO Errors

If you encounter CGO-related errors:

1. Ensure `CGO_ENABLED=1` is set
2. Verify you have the appropriate C compiler for your target platform
3. Check that Go can find the C compiler:
   ```bash
   go env CC
   ```

### Library Not Found

If the SDK can't find the compiled library:

1. Verify the library was built:
   ```bash
   ls -la core/build/
   ```

2. Check the library name matches your platform
3. Rebuild with:
   ```bash
   make clean
   make build
   ```

### Cross-Compilation Issues

For cross-compilation problems:

1. Verify cross-compiler is installed:
   ```bash
   # For Linux ARM64
   aarch64-linux-gnu-gcc --version

   # For Windows
   x86_64-w64-mingw32-gcc --version
   ```

2. Set the CC environment variable explicitly:
   ```bash
   CC=aarch64-linux-gnu-gcc make build-linux
   ```

## Output Libraries

After building, you'll find the libraries in `core/build/`:

- Linux AMD64: `libprompttoquery_linux_amd64.so`
- Linux ARM64: `libprompttoquery_linux_arm64.so`
- macOS AMD64: `libprompttoquery_darwin_amd64.dylib`
- macOS ARM64: `libprompttoquery_darwin_arm64.dylib`
- Windows AMD64: `prompttoquery_windows_amd64.dll`
- Windows ARM64: `prompttoquery_windows_arm64.dll`

## Testing

```bash
# Run Go tests
make test

# Run Python example
export OPENAI_API_KEY="your-key"
make example-python

# Run JavaScript example
export OPENAI_API_KEY="your-key"
make example-js
```

## Clean Build

```bash
# Remove all build artifacts
make clean
```
