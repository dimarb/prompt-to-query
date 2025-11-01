.PHONY: help install build build-all clean test publish publish-test lint format

help:
	@echo "Available commands:"
	@echo "  make install      - Install package in development mode"
	@echo "  make build        - Build native libraries for current platform"
	@echo "  make build-all    - Build native libraries for all platforms"
	@echo "  make clean        - Clean build artifacts"
	@echo "  make test         - Run tests"
	@echo "  make publish      - Publish to PyPI"
	@echo "  make publish-test - Publish to Test PyPI"
	@echo "  make lint         - Run linters"
	@echo "  make format       - Format code"

install:
	pip install -e .

build:
	python scripts/build-native.py

build-all:
	python scripts/build-native.py --all

clean:
	rm -rf build/ dist/ *.egg-info/
	rm -rf prompt_to_query/lib/*.so prompt_to_query/lib/*.dylib prompt_to_query/lib/*.dll
	find . -type d -name __pycache__ -exec rm -rf {} + 2>/dev/null || true
	find . -type f -name "*.pyc" -delete

test:
	pytest tests/ -v

package:
	python -m build

check:
	twine check dist/*

publish-test: clean build-all package check
	twine upload --repository testpypi dist/*

publish: clean build-all package check
	twine upload dist/*

lint:
	flake8 prompt_to_query/ tests/
	mypy prompt_to_query/

format:
	black prompt_to_query/ tests/
	isort prompt_to_query/ tests/
