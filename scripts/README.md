# Scripts

Collection of utility scripts for the Prompt to Query project.

## Available Scripts

### setup.sh

Main setup script that:
- Checks for required dependencies (Go, Make)
- Installs Go dependencies
- Builds the core library for current platform
- Optionally installs Python SDK
- Optionally installs JavaScript SDK dependencies

**Usage**:
```bash
./scripts/setup.sh
```

### test-build.sh (Future)

Script to test build on multiple platforms.

### release.sh (Future)

Script to prepare releases and package SDKs.

## Contributing

When adding new scripts:
1. Make them executable: `chmod +x scripts/your-script.sh`
2. Add proper error handling
3. Document in this README
4. Follow the existing code style
