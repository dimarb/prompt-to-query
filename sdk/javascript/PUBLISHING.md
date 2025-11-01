# Publishing Guide for prompt-to-query NPM Package

This guide explains how to build and publish the `prompt-to-query` package to NPM with support for multiple platforms and architectures.

## The Challenge

The JavaScript SDK wraps a native Go library compiled as a shared library (`.so`, `.dylib`, or `.dll`). Each platform and architecture requires its own compiled binary:

- **Linux**: `libprompttoquery_linux_amd64.so`, `libprompttoquery_linux_arm64.so`
- **macOS**: `libprompttoquery_darwin_amd64.dylib`, `libprompttoquery_darwin_arm64.dylib`
- **Windows**: `prompttoquery_windows_amd64.dll`, `prompttoquery_windows_arm64.dll`

## Publishing Options

### Option 1: Use GitHub Actions (Recommended)

The easiest and most reliable way to publish is using GitHub Actions, which automatically builds for all platforms.

**Steps:**

1. Configure NPM token in GitHub:
   ```bash
   # Get your NPM token from https://www.npmjs.com/settings/YOUR_USERNAME/tokens
   # Add it as a secret in GitHub: Settings > Secrets > Actions > New repository secret
   # Name: NPM_TOKEN
   ```

2. Create a new version tag:
   ```bash
   cd sdk/javascript
   npm version patch  # or minor, or major
   git push origin main --tags
   ```

3. The GitHub Action will automatically:
   - Build native libraries for all platforms
   - Run tests
   - Publish to NPM

### Option 2: Local Build (Partial Support)

If you need to publish manually from your local machine, you can build what's available:

```bash
cd sdk/javascript

# Build native libraries (will build for current platform + any with available tools)
npm run build:native

# Publish to NPM
npm publish
```

**Note:** Local builds will only include libraries for platforms where you have the necessary cross-compilation tools installed.

### Option 3: Multi-Platform CI/CD

For production use, we recommend building on each platform:

1. **Linux (AMD64 & ARM64)**: Use Ubuntu runners or Docker
2. **macOS (AMD64 & ARM64)**: Use macOS runners (supports universal binaries)
3. **Windows (AMD64)**: Use Windows runners or mingw-w64 cross-compilation

## Setting Up Cross-Compilation Tools

### On macOS

```bash
# Install Xcode Command Line Tools (if not already installed)
xcode-select --install

# macOS can build for both amd64 and arm64 natively
```

### On Linux (Ubuntu/Debian)

```bash
# For cross-compiling to Windows
sudo apt-get update
sudo apt-get install -y mingw-w64

# For ARM64 (if on AMD64)
sudo apt-get install -y gcc-aarch64-linux-gnu
```

### On Windows

Windows cross-compilation is complex. We recommend using WSL2 or Docker with Linux.

## Manual Build Process

If you want to build manually without the script:

```bash
# Navigate to project root
cd /path/to/prompt-to-query

# Build for all platforms (if tools available)
make build-linux
make build-macos
make build-windows

# Copy libraries to SDK
mkdir -p sdk/javascript/lib
cp core/build/libprompttoquery_*.so sdk/javascript/lib/
cp core/build/libprompttoquery_*.dylib sdk/javascript/lib/
cp core/build/prompttoquery_*.dll sdk/javascript/lib/

# Publish
cd sdk/javascript
npm publish
```

## Verifying the Package

After publishing, verify the package includes all necessary files:

```bash
# Download and inspect
npm pack
tar -tzf prompt-to-query-*.tgz | grep lib/

# Should show:
# package/lib/libprompttoquery_linux_amd64.so
# package/lib/libprompttoquery_linux_arm64.so
# package/lib/libprompttoquery_darwin_amd64.dylib
# package/lib/libprompttoquery_darwin_arm64.dylib
# package/lib/prompttoquery_windows_amd64.dll
```

## Testing Before Publishing

Always test before publishing:

```bash
cd sdk/javascript

# Run tests
npm test

# Test in a different project
cd /tmp
mkdir test-project
cd test-project
npm init -y
npm install /path/to/prompt-to-query/sdk/javascript

# Create test file
cat > test.js << 'EOF'
const { PromptToQuery } = require('prompt-to-query');

const ptq = new PromptToQuery({
  llmProvider: 'openai',
  apiKey: process.env.OPENAI_API_KEY,
  dbSchemaPath: './schema.json'
});

console.log('SDK Version:', ptq.getVersion());
EOF

node test.js
```

## Troubleshooting

### "Native library not found" Error

This error occurs when the package doesn't include a library for the target platform/architecture.

**Solutions:**

1. Use GitHub Actions to build for all platforms
2. Manually compile on each platform and combine the libraries
3. Ask users to build from source on unsupported platforms

### Build Fails with "CGO_ENABLED=1 but no C compiler"

Install the appropriate C compiler:

- **macOS**: `xcode-select --install`
- **Linux**: `sudo apt-get install build-essential`
- **Windows**: Install MinGW-w64

### Cross-Compilation Fails

Cross-compilation with CGO (C bindings) is complex. If cross-compilation fails:

1. Use the GitHub Actions workflow (builds natively on each OS)
2. Build on each platform separately and collect the binaries
3. Use Docker containers for Linux builds

## Version Management

Follow semantic versioning:

```bash
npm version patch  # Bug fixes: 1.0.0 -> 1.0.1
npm version minor  # New features: 1.0.0 -> 1.1.0
npm version major  # Breaking changes: 1.0.0 -> 2.0.0
```

## Best Practices

1. **Always use GitHub Actions for releases** - Ensures all platforms are built correctly
2. **Test on multiple platforms** - Use CI/CD to test on Linux, macOS, and Windows
3. **Include all architectures** - Don't publish with only one platform's library
4. **Update version in Go code** - Keep `GetVersion()` in `core/src/main.go` in sync with `package.json`
5. **Create release notes** - Document changes in GitHub releases

## Additional Resources

- [Go Cross-Compilation](https://go.dev/doc/install/source#environment)
- [NPM Publishing Guide](https://docs.npmjs.com/cli/v10/commands/npm-publish)
- [GitHub Actions for Go](https://github.com/actions/setup-go)
