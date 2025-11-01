# Quick Start Guide - Publishing Python SDK to PyPI

## Prerequisites Setup (5 minutes)

### 1. Create PyPI Account
```bash
# Go to https://pypi.org/account/register/
# Create an account and verify your email
```

### 2. Generate API Token
```bash
# Go to https://pypi.org/manage/account/token/
# Click "Add API token"
# Name: "prompt-to-query-github-actions"
# Scope: "Entire account" (or specific to prompt-to-query project)
# Copy the token (starts with pypi-...)
```

### 3. Add GitHub Secret
```bash
# Go to: https://github.com/dimarborda/prompt-to-query/settings/secrets/actions
# Click "New repository secret"
# Name: PYPI_TOKEN
# Value: paste your PyPI token
# Click "Add secret"
```

## First-Time Local Setup (5 minutes)

```bash
# Navigate to Python SDK
cd sdk/python

# Create virtual environment (optional but recommended)
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install build tools
pip install --upgrade pip
pip install build twine setuptools wheel

# Install in development mode
pip install -e .
```

## Test Local Build (5 minutes)

```bash
cd sdk/python

# Build native libraries for current platform only
python scripts/build-native.py

# Verify libraries were built
ls -lh prompt_to_query/lib/

# Test the package locally
python -c "from prompt_to_query import PromptToQuery; print('Import successful!')"
```

## Publish to PyPI (2 methods)

### Method 1: Automated via GitHub Actions (RECOMMENDED)

```bash
# 1. Update version number
# Edit: setup.py, pyproject.toml, prompt_to_query/__init__.py
# Change version to "1.0.0" (or your desired version)

# 2. Commit changes
git add .
git commit -m "Release v1.0.0"
git push

# 3. Create and push tag (this triggers the workflow)
git tag py-v1.0.0
git push origin py-v1.0.0

# 4. Monitor progress
# Go to: https://github.com/dimarborda/prompt-to-query/actions
# Watch "Build and Publish to PyPI" workflow
# Takes ~10-15 minutes to build all platforms and publish

# 5. Verify on PyPI
# https://pypi.org/project/prompt-to-query/
```

### Method 2: Manual Publishing (for testing)

```bash
cd sdk/python

# Build all platform binaries (requires Docker)
python scripts/build-native.py --all

# Build Python package
python -m build

# Check the package
twine check dist/*

# (Optional) Test on Test PyPI first
# You need a Test PyPI account and token from https://test.pypi.org
twine upload --repository testpypi dist/* -u __token__ -p pypi-YOUR_TEST_TOKEN

# Publish to PyPI
# You need a PyPI account and token from https://pypi.org
twine upload dist/* -u __token__ -p pypi-YOUR_PYPI_TOKEN
```

## Verify Installation

```bash
# Install from PyPI
pip install prompt-to-query

# Test import
python -c "from prompt_to_query import PromptToQuery; print('Success!')"

# Check version
python -c "from prompt_to_query import __version__; print(__version__)"
```

## Common Issues & Solutions

### Issue: "Docker not found" during build
```bash
# Install Docker Desktop
# macOS: https://docs.docker.com/desktop/install/mac-install/
# Windows: https://docs.docker.com/desktop/install/windows-install/
# Linux: https://docs.docker.com/engine/install/
```

### Issue: "Library not found" when importing
```bash
# Make sure you built the libraries first
cd sdk/python
python scripts/build-native.py

# Check libraries exist
ls prompt_to_query/lib/
```

### Issue: GitHub Actions workflow fails
```bash
# Check the logs in GitHub Actions
# Common issues:
# 1. PYPI_TOKEN secret not set or incorrect
# 2. Version already exists on PyPI (bump version)
# 3. Package name conflict (rename in setup.py)
```

### Issue: "Version already exists" on PyPI
```bash
# You cannot upload the same version twice
# Increment version in:
# - setup.py
# - pyproject.toml
# - prompt_to_query/__init__.py

# Then create new tag
git tag py-v1.0.1
git push origin py-v1.0.1
```

## Complete Checklist

Before first publish:
- [ ] Created PyPI account
- [ ] Generated PyPI API token
- [ ] Added PYPI_TOKEN to GitHub secrets
- [ ] Updated version numbers
- [ ] Tested local build
- [ ] Committed all changes
- [ ] Created and pushed tag

After publishing:
- [ ] Verified package on PyPI
- [ ] Tested installation: `pip install prompt-to-query`
- [ ] Tested import and basic usage
- [ ] Created GitHub release (optional)
- [ ] Updated documentation (optional)

## Useful Commands Reference

```bash
# Development
make install          # Install in dev mode
make build           # Build for current platform
make build-all       # Build for all platforms
make clean           # Clean build artifacts

# Testing
make test            # Run tests
python -c "from prompt_to_query import PromptToQuery"  # Quick import test

# Publishing
make package         # Build distribution packages
make check          # Check package with twine
make publish-test   # Publish to Test PyPI
make publish        # Publish to PyPI

# Manual commands
python -m build                           # Build package
twine check dist/*                        # Check package
twine upload dist/*                       # Upload to PyPI
twine upload --repository testpypi dist/* # Upload to Test PyPI
```

## Next Steps After Publishing

1. **Verify installation on different platforms**:
   - Test on Linux (Ubuntu, Alpine)
   - Test on macOS (Intel and Apple Silicon)
   - Test on Windows

2. **Update documentation**:
   - Add installation instructions
   - Add usage examples
   - Update README with PyPI badge

3. **Monitor**:
   - Check PyPI download stats
   - Monitor GitHub issues for installation problems
   - Watch for platform-specific issues

## Support

If you encounter issues:
1. Check [PUBLISHING.md](PUBLISHING.md) for detailed troubleshooting
2. Check [STRUCTURE.md](STRUCTURE.md) for architecture details
3. Review GitHub Actions logs for workflow issues
4. Open an issue on GitHub

## Time Estimate

- **First-time setup**: ~15 minutes
- **Subsequent releases**: ~2 minutes (just tag and push)
- **Build time (GitHub Actions)**: ~10-15 minutes
- **Total first publish**: ~30 minutes
