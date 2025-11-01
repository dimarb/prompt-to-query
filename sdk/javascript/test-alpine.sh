#!/bin/bash
set -e

echo "🧪 Testing prompt-to-query on Alpine Linux ARM64..."
echo ""

# Test on Alpine ARM64
docker run --rm --platform linux/arm64 -v "$(pwd):/test" -w /test \
    node:18-alpine sh -c '
    set -e
    echo "📦 Installing dependencies..."
    apk add --no-cache python3 make g++ > /dev/null 2>&1

    echo "🔧 Installing prompt-to-query from local package..."
    npm install --no-save ./prompt-to-query-*.tgz

    echo ""
    echo "✅ Testing library loading..."
    node -e "
    const { PromptToQuery } = require(\"prompt-to-query\");
    console.log(\"✅ Library loaded successfully on Alpine ARM64!\");
    "

    echo ""
    echo "🎉 All tests passed on Alpine ARM64!"
'

echo ""
echo "🧪 Testing prompt-to-query on Alpine Linux AMD64..."
echo ""

# Test on Alpine AMD64
docker run --rm --platform linux/amd64 -v "$(pwd):/test" -w /test \
    node:18-alpine sh -c '
    set -e
    echo "📦 Installing dependencies..."
    apk add --no-cache python3 make g++ > /dev/null 2>&1

    echo "🔧 Installing prompt-to-query from local package..."
    npm install --no-save ./prompt-to-query-*.tgz

    echo ""
    echo "✅ Testing library loading..."
    node -e "
    const { PromptToQuery } = require(\"prompt-to-query\");
    console.log(\"✅ Library loaded successfully on Alpine AMD64!\");
    "

    echo ""
    echo "🎉 All tests passed on Alpine AMD64!"
'

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ All Alpine tests passed!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
