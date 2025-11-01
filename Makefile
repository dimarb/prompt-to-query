.PHONY: all build clean build-linux build-macos build-windows install-deps test

# Variables
CORE_DIR := core
BUILD_DIR := $(CORE_DIR)/build
SRC_DIR := $(CORE_DIR)/src
GO_FILES := $(wildcard $(SRC_DIR)/*.go)

# Output libraries
LIB_LINUX := $(BUILD_DIR)/libprompttoquery_linux_amd64.so
LIB_LINUX_ARM := $(BUILD_DIR)/libprompttoquery_linux_arm64.so
LIB_MACOS_AMD := $(BUILD_DIR)/libprompttoquery_darwin_amd64.dylib
LIB_MACOS_ARM := $(BUILD_DIR)/libprompttoquery_darwin_arm64.dylib
LIB_WINDOWS_AMD := $(BUILD_DIR)/prompttoquery_windows_amd64.dll
LIB_WINDOWS_ARM := $(BUILD_DIR)/prompttoquery_windows_arm64.dll

# Detect current OS and architecture
UNAME_S := $(shell uname -s)
UNAME_M := $(shell uname -m)

# Default target
all: build-linux build-macos build-windows

# Build for current platform
build:
ifeq ($(UNAME_S),Linux)
	@echo "Building for Linux..."
	@$(MAKE) build-linux-current
else ifeq ($(UNAME_S),Darwin)
	@echo "Building for macOS..."
	@$(MAKE) build-macos-current
else
	@echo "Building for Windows..."
	@$(MAKE) build-windows-current
endif

# Create build directory
$(BUILD_DIR):
	@mkdir -p $(BUILD_DIR)

# Install Go dependencies
install-deps:
	@echo "Installing Go dependencies..."
	@cd $(CORE_DIR) && go mod download
	@cd $(CORE_DIR) && go mod tidy

# Build for Linux
build-linux: $(BUILD_DIR) install-deps
	@echo "Building for Linux AMD64..."
	@cd $(SRC_DIR) && \
		CGO_ENABLED=1 GOOS=linux GOARCH=amd64 \
		go build -buildmode=c-shared \
		-o ../build/libprompttoquery_linux_amd64.so \
		.
	@echo "Building for Linux ARM64..."
	@cd $(SRC_DIR) && \
		CGO_ENABLED=1 GOOS=linux GOARCH=arm64 \
		go build -buildmode=c-shared \
		-o ../build/libprompttoquery_linux_arm64.so \
		.

# Build for current Linux architecture
build-linux-current: $(BUILD_DIR) install-deps
	@echo "Building for Linux (current arch: $(UNAME_M))..."
	@cd $(SRC_DIR) && \
		CGO_ENABLED=1 \
		go build -buildmode=c-shared \
		-o ../build/libprompttoquery.so \
		.

# Build for macOS
build-macos: $(BUILD_DIR) install-deps
	@echo "Building for macOS AMD64..."
	@cd $(SRC_DIR) && \
		CGO_ENABLED=1 GOOS=darwin GOARCH=amd64 \
		go build -buildmode=c-shared \
		-o ../build/libprompttoquery_darwin_amd64.dylib \
		.
	@echo "Building for macOS ARM64 (Apple Silicon)..."
	@cd $(SRC_DIR) && \
		CGO_ENABLED=1 GOOS=darwin GOARCH=arm64 \
		go build -buildmode=c-shared \
		-o ../build/libprompttoquery_darwin_arm64.dylib \
		.

# Build for current macOS architecture
build-macos-current: $(BUILD_DIR) install-deps
	@echo "Building for macOS (current arch: $(UNAME_M))..."
	@cd $(SRC_DIR) && \
		CGO_ENABLED=1 \
		go build -buildmode=c-shared \
		-o ../build/libprompttoquery.dylib \
		.

# Build for Windows (requires mingw-w64)
build-windows: $(BUILD_DIR) install-deps
	@echo "Building for Windows AMD64..."
	@cd $(SRC_DIR) && \
		CGO_ENABLED=1 GOOS=windows GOARCH=amd64 \
		CC=x86_64-w64-mingw32-gcc \
		go build -buildmode=c-shared \
		-o ../build/prompttoquery_windows_amd64.dll \
		.
	@echo "Building for Windows ARM64..."
	@cd $(SRC_DIR) && \
		CGO_ENABLED=1 GOOS=windows GOARCH=arm64 \
		CC=aarch64-w64-mingw32-gcc \
		go build -buildmode=c-shared \
		-o ../build/prompttoquery_windows_arm64.dll \
		.

# Build for current Windows architecture
build-windows-current: $(BUILD_DIR) install-deps
	@echo "Building for Windows (current arch: $(UNAME_M))..."
	@cd $(SRC_DIR) && \
		CGO_ENABLED=1 \
		go build -buildmode=c-shared \
		-o ../build/prompttoquery.dll \
		.

# Clean build artifacts
clean:
	@echo "Cleaning build artifacts..."
	@rm -rf $(BUILD_DIR)
	@rm -rf $(CORE_DIR)/go.sum

# Test the Go core
test:
	@echo "Running Go tests..."
	@cd $(CORE_DIR) && go test -v ./...

# Install Python SDK in development mode
install-python-dev:
	@echo "Installing Python SDK in development mode..."
	@cd sdk/python && pip install -e .

# Install JavaScript SDK dependencies
install-js-dev:
	@echo "Installing JavaScript SDK dependencies..."
	@cd sdk/javascript && npm install

# Run Python example
example-python: build
	@echo "Running Python example..."
	@cd examples/python && python example.py

# Run JavaScript example
example-js: build
	@echo "Running JavaScript example..."
	@cd examples/javascript && node example.js

# Help target
help:
	@echo "Available targets:"
	@echo "  all                 - Build for all platforms"
	@echo "  build              - Build for current platform"
	@echo "  build-linux        - Build for Linux (AMD64 & ARM64)"
	@echo "  build-macos        - Build for macOS (AMD64 & ARM64)"
	@echo "  build-windows      - Build for Windows (AMD64 & ARM64)"
	@echo "  clean              - Clean build artifacts"
	@echo "  install-deps       - Install Go dependencies"
	@echo "  test               - Run tests"
	@echo "  install-python-dev - Install Python SDK in dev mode"
	@echo "  install-js-dev     - Install JavaScript SDK dependencies"
	@echo "  example-python     - Run Python example"
	@echo "  example-js         - Run JavaScript example"
