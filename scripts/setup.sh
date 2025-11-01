#!/bin/bash
set -e

echo "===================================="
echo "Prompt to Query - Setup Script"
echo "===================================="
echo ""

# Check for Go
if ! command -v go &> /dev/null; then
    echo "Error: Go is not installed. Please install Go 1.21 or higher."
    exit 1
fi

GO_VERSION=$(go version | awk '{print $3}' | sed 's/go//')
echo "✓ Go version: $GO_VERSION"

# Check for Make
if ! command -v make &> /dev/null; then
    echo "Error: Make is not installed. Please install Make."
    exit 1
fi
echo "✓ Make is installed"

# Detect OS
OS=$(uname -s)
echo "✓ Operating System: $OS"

# Install Go dependencies
echo ""
echo "Installing Go dependencies..."
cd core
go mod download
go mod tidy
cd ..
echo "✓ Go dependencies installed"

# Build for current platform
echo ""
echo "Building for current platform..."
make build
echo "✓ Build completed"

# Check for Python
echo ""
if command -v python3 &> /dev/null; then
    PYTHON_VERSION=$(python3 --version)
    echo "✓ $PYTHON_VERSION found"

    echo "Do you want to install the Python SDK? (y/n)"
    read -r install_python
    if [[ "$install_python" == "y" ]]; then
        cd sdk/python
        pip3 install -e .
        cd ../..
        echo "✓ Python SDK installed"
    fi
else
    echo "⚠ Python 3 not found. Skipping Python SDK installation."
fi

# Check for Node.js
echo ""
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo "✓ Node.js $NODE_VERSION found"

    echo "Do you want to install the JavaScript SDK dependencies? (y/n)"
    read -r install_js
    if [[ "$install_js" == "y" ]]; then
        cd sdk/javascript
        npm install
        cd ../..
        echo "✓ JavaScript SDK dependencies installed"
    fi
else
    echo "⚠ Node.js not found. Skipping JavaScript SDK installation."
fi

echo ""
echo "===================================="
echo "Setup completed successfully!"
echo "===================================="
echo ""
echo "Next steps:"
echo "1. Set your API key:"
echo "   export OPENAI_API_KEY='your-key'"
echo "   # or"
echo "   export ANTHROPIC_API_KEY='your-key'"
echo ""
echo "2. Run examples:"
echo "   make example-python"
echo "   make example-js"
echo ""
echo "3. Read documentation:"
echo "   - docs/USAGE.md - Usage guide"
echo "   - docs/BUILD.md - Build instructions"
echo ""
