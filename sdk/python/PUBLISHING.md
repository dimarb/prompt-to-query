# Publishing Guide for Python SDK

This guide explains how to publish the `prompt-to-query` Python package to PyPI.

## Prerequisites

1. **PyPI Account**: Create accounts on both [PyPI](https://pypi.org) and [Test PyPI](https://test.pypi.org)
2. **API Tokens**: Generate API tokens for both PyPI and Test PyPI
3. **Build Tools**: Install required Python packages:
   ```bash
   pip install build twine setuptools wheel
   ```

## Publishing Methods

### Method 1: Automated Publishing via GitHub Actions (Recommended)

The easiest way to publish is through GitHub Actions:

1. **Set up GitHub Secrets**:
   - Go to your repository settings → Secrets and variables → Actions
   - Add `PYPI_TOKEN` with your PyPI API token
   - Add `TEST_PYPI_TOKEN` with your Test PyPI API token (optional)

2. **Create a tag and push**:
   ```bash
   # Update version in setup.py and pyproject.toml first
   git tag py-v1.0.0
   git push origin py-v1.0.0
   ```

3. **Monitor the workflow**:
   - Go to Actions tab in GitHub
   - Watch the "Build and Publish to PyPI" workflow
   - It will build all platform binaries and publish automatically

### Method 2: Manual Publishing

For manual publishing or testing:

#### Step 1: Build Native Libraries

```bash
# Build for all platforms (requires Docker)
cd sdk/python
python scripts/build-native.py --all

# Or build for current platform only
python scripts/build-native.py
```

#### Step 2: Verify Library Files

Ensure all platform libraries are present:
```bash
ls -lh prompt_to_query/lib/
```

You should see:
- `libprompttoquery_linux_amd64.so`
- `libprompttoquery_linux_amd64_musl.so`
- `libprompttoquery_linux_arm64.so`
- `libprompttoquery_linux_arm64_musl.so`
- `libprompttoquery_darwin_amd64.dylib`
- `libprompttoquery_darwin_arm64.dylib`
- `prompttoquery_windows_amd64.dll`

#### Step 3: Install Build Tools (if not already installed)

```bash
pip install build twine setuptools wheel
```

#### Step 4: Build the Package

```bash
cd sdk/python
python -m build
```

This creates:
- `dist/prompt-to-query-X.Y.Z.tar.gz` (source distribution)
- `dist/prompt_to_query-X.Y.Z-py3-none-any.whl` (wheel distribution)

#### Step 5: Check the Package

```bash
twine check dist/*
```

#### Step 6: Test on Test PyPI (Optional)

First, you need a Test PyPI account and token:
1. Create account at https://test.pypi.org/account/register/
2. Generate token at https://test.pypi.org/manage/account/token/

Upload using token:
```bash
# Option 1: Use token directly
twine upload --repository testpypi dist/* -u __token__ -p pypi-YOUR_TEST_TOKEN

# Option 2: Configure ~/.pypirc (see .pypirc.example) then:
twine upload --repository testpypi dist/*
```

Test installation:
```bash
pip install --index-url https://test.pypi.org/simple/ prompt-to-query
```

#### Step 7: Publish to PyPI

First, you need a PyPI account and token:
1. Create account at https://pypi.org/account/register/
2. Generate token at https://pypi.org/manage/account/token/

Upload using token:
```bash
# Option 1: Use token directly in command
twine upload dist/* -u __token__ -p pypi-YOUR_PYPI_TOKEN

# Option 2: Configure ~/.pypirc (see .pypirc.example) then:
twine upload dist/*

# Option 3: Let twine prompt for credentials
twine upload dist/*
# Username: __token__
# Password: pypi-YOUR_PYPI_TOKEN
```

## Version Management

1. **Update version** in both files:
   - `setup.py`: `version="X.Y.Z"`
   - `pyproject.toml`: `version = "X.Y.Z"`
   - `prompt_to_query/__init__.py`: `__version__ = "X.Y.Z"`

2. **Version naming convention**:
   - Major version: Breaking changes (1.0.0 → 2.0.0)
   - Minor version: New features (1.0.0 → 1.1.0)
   - Patch version: Bug fixes (1.0.0 → 1.0.1)

## Troubleshooting

### Missing Native Libraries

If users report missing libraries:
```bash
# Rebuild all platforms
python scripts/build-native.py --all

# Verify MANIFEST.in includes lib directory
cat MANIFEST.in
```

### Package Too Large

If the package is too large:
- All 7 binaries together are ~55MB
- This is normal for packages with native libraries
- PyPI allows packages up to 100MB

### Platform-Specific Issues

If a specific platform fails:
- Check the GitHub Actions logs for that platform
- Test locally with Docker:
  ```bash
  docker run --rm -v $(pwd):/workspace golang:1.21-bullseye bash
  ```

## Post-Publishing Checklist

After publishing:

1. ✅ Test installation: `pip install prompt-to-query`
2. ✅ Test on different platforms (Linux, macOS, Windows)
3. ✅ Verify the package page on PyPI
4. ✅ Update documentation if needed
5. ✅ Create a GitHub release
6. ✅ Announce the release (if applicable)

## Useful Commands

```bash
# Clean build artifacts
rm -rf build dist *.egg-info

# Build package
python -m build

# Check package
twine check dist/*

# Upload to Test PyPI
twine upload --repository testpypi dist/*

# Upload to PyPI
twine upload dist/*

# Install locally for testing
pip install -e .

# Uninstall
pip uninstall prompt-to-query
```

## References

- [PyPI Publishing Guide](https://packaging.python.org/tutorials/packaging-projects/)
- [Twine Documentation](https://twine.readthedocs.io/)
- [setuptools Documentation](https://setuptools.pypa.io/)
- [PEP 517 - Build System](https://peps.python.org/pep-0517/)
