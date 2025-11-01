# Python SDK Structure for PyPI Publishing

This document describes the complete structure implemented for publishing the Python SDK to PyPI, mirroring the npm package approach.

## Directory Structure

```
sdk/python/
├── prompt_to_query/           # Main package
│   ├── __init__.py           # Package initialization
│   ├── client.py             # Main SDK client (UPDATED with multi-platform support)
│   └── lib/                  # Native libraries directory
│       ├── .gitkeep          # Ensure directory is tracked
│       ├── libprompttoquery_linux_amd64.so
│       ├── libprompttoquery_linux_amd64_musl.so
│       ├── libprompttoquery_linux_arm64.so
│       ├── libprompttoquery_linux_arm64_musl.so
│       ├── libprompttoquery_darwin_amd64.dylib
│       ├── libprompttoquery_darwin_arm64.dylib
│       └── prompttoquery_windows_amd64.dll
│
├── scripts/                   # Build scripts
│   └── build-native.py       # Python script to build all native libs
│
├── setup.py                  # Package setup (UPDATED)
├── pyproject.toml            # Modern Python packaging config (NEW)
├── MANIFEST.in               # Controls what's included in dist (NEW)
├── .gitignore                # Python-specific ignores (NEW)
├── README.md                 # Package documentation (NEW)
├── PUBLISHING.md             # Publishing guide (NEW)
├── STRUCTURE.md              # This file (NEW)
├── .pypirc.example           # PyPI config example (NEW)
└── Makefile                  # Convenience commands (NEW)
```

## Supported Platforms

### 7 Platform Binaries (same as npm)

1. **Linux AMD64 (glibc)**: Standard Linux distributions (Ubuntu, Debian, CentOS, etc.)
2. **Linux AMD64 (musl)**: Alpine Linux
3. **Linux ARM64 (glibc)**: ARM-based Linux servers (AWS Graviton, etc.)
4. **Linux ARM64 (musl)**: Alpine Linux on ARM
5. **macOS Intel (x86_64)**: Intel-based Macs
6. **macOS Apple Silicon (arm64)**: M1/M2/M3 Macs
7. **Windows AMD64**: Windows 10/11 64-bit

## Key Files Explained

### 1. `setup.py` (UPDATED)
- Includes all 7 platform binaries in `package_data`
- Uses `lib/` directory inside the package
- Marks package as `zip_safe=False` (required for shared libraries)
- Enhanced metadata and keywords for PyPI discoverability

### 2. `pyproject.toml` (NEW)
- Modern Python packaging standard (PEP 517/518)
- Defines build system requirements
- Specifies project metadata
- Configures setuptools to include native libraries

### 3. `MANIFEST.in` (NEW)
- Controls which files are included in source distribution
- Includes native libraries from `prompt_to_query/lib/`
- Excludes unnecessary files (cache, temp files, etc.)

### 4. `scripts/build-native.py` (NEW)
- Python equivalent of `build-native.sh` from npm package
- Builds native libraries for all platforms using Docker
- Copies libraries to `prompt_to_query/lib/`
- Supports `--all` flag for cross-platform builds
- Can build for current platform only (default)

### 5. `prompt_to_query/client.py` (UPDATED)
Enhanced with:
- `_get_library_name()`: Determines correct library for platform
- `_get_search_paths()`: Multiple search locations (package lib/, build/, cwd)
- `_get_fallback_names()`: Try alternative libraries if primary not found
- `_is_musl_libc()`: Detect Alpine Linux vs standard Linux
- Better error messages showing search paths

### 6. `.github/workflows/publish-pypi.yml` (NEW)
GitHub Actions workflow that:
- Builds native libraries for all 7 platforms in parallel
- Uses matrix strategy like npm workflow
- Downloads all artifacts
- Copies to `sdk/python/prompt_to_query/lib/`
- Builds Python package with `python -m build`
- Publishes to PyPI using `twine`
- Triggered by tags matching `py-v*` (e.g., `py-v1.0.0`)

## Publishing Workflow

### Automated (Recommended)

```bash
# 1. Update version in setup.py, pyproject.toml, and __init__.py
# 2. Commit changes
git add .
git commit -m "Release v1.0.0"

# 3. Create and push tag
git tag py-v1.0.0
git push origin py-v1.0.0

# 4. GitHub Actions will automatically:
#    - Build all 7 platform binaries
#    - Package them with Python code
#    - Publish to PyPI
```

### Manual

```bash
# Build all native libraries
cd sdk/python
python scripts/build-native.py --all

# Build Python package
python -m build

# Check package
twine check dist/*

# Publish
twine upload dist/*
```

## Comparison with npm Package

| Feature | npm Package | Python Package |
|---------|-------------|----------------|
| **Build Script** | `build-native.sh` (Bash) | `build-native.py` (Python) |
| **Package Config** | `package.json` | `setup.py` + `pyproject.toml` |
| **Binary Location** | `sdk/javascript/lib/` | `sdk/python/prompt_to_query/lib/` |
| **CI/CD** | `.github/workflows/build-and-publish.yml` | `.github/workflows/publish-pypi.yml` |
| **Platform Detection** | JavaScript code in `index.js` | Python code in `client.py` |
| **FFI Library** | `koffi` (external dependency) | `ctypes` (stdlib, no dependencies) |
| **Package Manager** | npm | pip |
| **Registry** | npmjs.com | pypi.org |
| **Tag Pattern** | `v*` | `py-v*` |

## Development Commands

```bash
# Install in development mode
pip install -e .

# Build for current platform
make build

# Build for all platforms (requires Docker)
make build-all

# Run tests
make test

# Clean build artifacts
make clean

# Build package
make package

# Publish to Test PyPI
make publish-test

# Publish to PyPI
make publish
```

## Required GitHub Secrets

For automated publishing via GitHub Actions:

1. `PYPI_TOKEN`: API token from pypi.org
2. `TEST_PYPI_TOKEN`: API token from test.pypi.org (optional)

## Installation for End Users

After publishing to PyPI, users can install with:

```bash
pip install prompt-to-query
```

The package will automatically include all 7 platform binaries (~55MB total), and the client will automatically detect and load the correct one.

## Advantages of This Approach

1. **Single Package**: One `pip install` works on all platforms
2. **No Build Required**: Users don't need Go, Docker, or build tools
3. **Automatic Detection**: Client automatically detects platform and loads correct binary
4. **Fallback Support**: If exact match not found, tries compatible alternatives
5. **Zero Dependencies**: Uses only Python stdlib (ctypes)
6. **Same Workflow as npm**: Consistent approach across SDKs

## Next Steps

1. ✅ Set up PyPI account and generate API token
2. ✅ Add `PYPI_TOKEN` secret to GitHub repository
3. ✅ Test locally: `python scripts/build-native.py --all`
4. ✅ Create first tag: `git tag py-v1.0.0 && git push origin py-v1.0.0`
5. ✅ Monitor GitHub Actions workflow
6. ✅ Verify package on PyPI: https://pypi.org/project/prompt-to-query/
7. ✅ Test installation: `pip install prompt-to-query`

## Troubleshooting

See [PUBLISHING.md](PUBLISHING.md) for detailed troubleshooting guide.
