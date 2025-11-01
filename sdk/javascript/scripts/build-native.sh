#!/bin/bash
set -e

# Script to build native libraries for all supported platforms
# This script should be run before publishing to npm
#
# Usage:
#   ./build-native.sh           # Build for current platform
#   ./build-native.sh --all     # Build for all platforms (uses Docker)
#   ./build-native.sh --docker  # Same as --all
#   ./build-native.sh --zig     # Use Zig for cross-compilation (experimental)

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SDK_DIR="$(dirname "$SCRIPT_DIR")"
PROJECT_ROOT="$(dirname "$(dirname "$SDK_DIR")")"
LIB_DIR="$SDK_DIR/lib"
CORE_BUILD_DIR="$PROJECT_ROOT/core/build"
CORE_SRC_DIR="$PROJECT_ROOT/core/src"

BUILD_ALL=false
USE_DOCKER=false
USE_ZIG=false

# Parse arguments
for arg in "$@"; do
    case $arg in
        --all|--docker)
            BUILD_ALL=true
            USE_DOCKER=true
            shift
            ;;
        --zig)
            BUILD_ALL=true
            USE_ZIG=true
            shift
            ;;
        *)
            ;;
    esac
done

echo "🔨 Building native libraries..."
echo ""
echo "Project root: $PROJECT_ROOT"
echo "SDK directory: $SDK_DIR"
echo "Library output: $LIB_DIR"
echo ""

# Create lib directory if it doesn't exist
mkdir -p "$LIB_DIR"
mkdir -p "$CORE_BUILD_DIR"

# Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -f "$LIB_DIR"/*
rm -f "$CORE_BUILD_DIR"/*

# Function to build for current platform
build_current_platform() {
    echo ""
    echo "📦 Building for current platform..."
    cd "$PROJECT_ROOT"
    make build

    # Copy the current platform library
    if [ -f "$CORE_BUILD_DIR/libprompttoquery.so" ]; then
        cp "$CORE_BUILD_DIR/libprompttoquery.so" "$LIB_DIR/"
        echo "✅ Built and copied Linux library"
    elif [ -f "$CORE_BUILD_DIR/libprompttoquery.dylib" ]; then
        cp "$CORE_BUILD_DIR/libprompttoquery.dylib" "$LIB_DIR/"
        echo "✅ Built and copied macOS library"
    elif [ -f "$CORE_BUILD_DIR/prompttoquery.dll" ]; then
        cp "$CORE_BUILD_DIR/prompttoquery.dll" "$LIB_DIR/"
        echo "✅ Built and copied Windows library"
    fi
}

# Function to build using Docker
build_with_docker() {
    echo ""
    echo "🐳 Building with Docker for all platforms..."

    if ! command -v docker &> /dev/null; then
        echo "❌ Docker not found. Install Docker to build for all platforms."
        return 1
    fi

    # Build for Linux AMD64
    echo ""
    echo "Building for Linux AMD64..."
    docker run --rm --platform linux/amd64 -v "$PROJECT_ROOT:/workspace" -w /workspace/core/src \
        golang:1.21-bullseye \
        bash -c "CGO_ENABLED=1 GOOS=linux GOARCH=amd64 \
                 go build -buildmode=c-shared -o ../build/libprompttoquery_linux_amd64.so ."
    [ -f "$CORE_BUILD_DIR/libprompttoquery_linux_amd64.so" ] && \
        cp "$CORE_BUILD_DIR/libprompttoquery_linux_amd64.so" "$LIB_DIR/" && \
        echo "✅ Built Linux AMD64"

    # Build for Linux ARM64
    echo ""
    echo "Building for Linux ARM64..."
    docker run --rm --platform linux/arm64 -v "$PROJECT_ROOT:/workspace" -w /workspace/core/src \
        golang:1.21-bullseye \
        bash -c "CGO_ENABLED=1 GOOS=linux GOARCH=arm64 \
                 go build -buildmode=c-shared -o ../build/libprompttoquery_linux_arm64.so ."
    [ -f "$CORE_BUILD_DIR/libprompttoquery_linux_arm64.so" ] && \
        cp "$CORE_BUILD_DIR/libprompttoquery_linux_arm64.so" "$LIB_DIR/" && \
        echo "✅ Built Linux ARM64"

    # Build for Linux AMD64 (Alpine/musl)
    echo ""
    echo "Building for Linux AMD64 (Alpine/musl)..."
    docker run --rm --platform linux/amd64 -v "$PROJECT_ROOT:/workspace" -w /workspace/core/src \
        golang:1.21-alpine \
        sh -c "apk add --no-cache gcc musl-dev > /dev/null 2>&1 && \
               CGO_ENABLED=1 GOOS=linux GOARCH=amd64 \
               go build -buildmode=c-shared -o ../build/libprompttoquery_linux_amd64_musl.so ."
    [ -f "$CORE_BUILD_DIR/libprompttoquery_linux_amd64_musl.so" ] && \
        cp "$CORE_BUILD_DIR/libprompttoquery_linux_amd64_musl.so" "$LIB_DIR/" && \
        echo "✅ Built Linux AMD64 (Alpine/musl)"

    # Build for Linux ARM64 (Alpine/musl)
    echo ""
    echo "Building for Linux ARM64 (Alpine/musl)..."
    docker run --rm --platform linux/arm64 -v "$PROJECT_ROOT:/workspace" -w /workspace/core/src \
        golang:1.21-alpine \
        sh -c "apk add --no-cache gcc musl-dev > /dev/null 2>&1 && \
               CGO_ENABLED=1 GOOS=linux GOARCH=arm64 \
               go build -buildmode=c-shared -o ../build/libprompttoquery_linux_arm64_musl.so ."
    [ -f "$CORE_BUILD_DIR/libprompttoquery_linux_arm64_musl.so" ] && \
        cp "$CORE_BUILD_DIR/libprompttoquery_linux_arm64_musl.so" "$LIB_DIR/" && \
        echo "✅ Built Linux ARM64 (Alpine/musl)"

    # Build for Windows AMD64 (using mingw)
    echo ""
    echo "Building for Windows AMD64..."
    docker run --rm -v "$PROJECT_ROOT:/workspace" -w /workspace/core/src \
        golang:1.21-bullseye \
        bash -c "apt-get update -qq && apt-get install -qq -y mingw-w64 > /dev/null 2>&1 && \
                 CGO_ENABLED=1 GOOS=windows GOARCH=amd64 CC=x86_64-w64-mingw32-gcc \
                 go build -buildmode=c-shared -o ../build/prompttoquery_windows_amd64.dll ." || \
        echo "⚠️  Windows AMD64 build failed"
    [ -f "$CORE_BUILD_DIR/prompttoquery_windows_amd64.dll" ] && \
        cp "$CORE_BUILD_DIR/prompttoquery_windows_amd64.dll" "$LIB_DIR/" && \
        echo "✅ Built Windows AMD64"
}

# Function to build for macOS (both architectures)
build_macos() {
    if [ "$(uname)" != "Darwin" ]; then
        echo "⚠️  Skipping macOS build (not running on macOS)"
        return
    fi

    echo ""
    echo "🍎 Building for macOS (all architectures)..."

    # Build for AMD64
    echo "Building for macOS AMD64..."
    cd "$CORE_SRC_DIR"
    CGO_ENABLED=1 GOOS=darwin GOARCH=amd64 \
        go build -buildmode=c-shared -o ../build/libprompttoquery_darwin_amd64.dylib .
    [ -f "$CORE_BUILD_DIR/libprompttoquery_darwin_amd64.dylib" ] && \
        cp "$CORE_BUILD_DIR/libprompttoquery_darwin_amd64.dylib" "$LIB_DIR/" && \
        echo "✅ Built macOS AMD64"

    # Build for ARM64
    echo "Building for macOS ARM64..."
    cd "$CORE_SRC_DIR"
    CGO_ENABLED=1 GOOS=darwin GOARCH=arm64 \
        go build -buildmode=c-shared -o ../build/libprompttoquery_darwin_arm64.dylib .
    [ -f "$CORE_BUILD_DIR/libprompttoquery_darwin_arm64.dylib" ] && \
        cp "$CORE_BUILD_DIR/libprompttoquery_darwin_arm64.dylib" "$LIB_DIR/" && \
        echo "✅ Built macOS ARM64"
}

# Main build logic
if [ "$BUILD_ALL" = true ]; then
    if [ "$USE_DOCKER" = true ]; then
        # Build macOS natively (if on macOS)
        build_macos

        # Build Linux and Windows with Docker
        build_with_docker
    elif [ "$USE_ZIG" = true ]; then
        echo "⚠️  Zig cross-compilation not yet implemented"
        echo "Using Docker instead..."
        build_macos
        build_with_docker
    fi
else
    # Build for current platform only
    build_current_platform

    # If on macOS, also build both macOS architectures
    if [ "$(uname)" = "Darwin" ]; then
        build_macos
    fi
fi

echo ""
echo "📊 Build summary:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if [ -d "$LIB_DIR" ] && [ "$(ls -A "$LIB_DIR" 2>/dev/null)" ]; then
    ls -lh "$LIB_DIR"
else
    echo "No libraries built"
fi
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Count built libraries
LIB_COUNT=$(ls -1 "$LIB_DIR" 2>/dev/null | wc -l | tr -d ' ')
if [ "$LIB_COUNT" -eq 0 ]; then
    echo ""
    echo "❌ No libraries were built!"
    echo "Please ensure Go and build tools are installed."
    exit 1
fi

echo ""
echo "✅ Build complete! $LIB_COUNT native librar(y/ies) ready."
echo ""

if [ "$BUILD_ALL" = false ]; then
    echo "💡 To build for all platforms, run:"
    echo "   ./build-native.sh --all"
    echo ""
fi
