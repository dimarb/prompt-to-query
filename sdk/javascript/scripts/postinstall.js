#!/usr/bin/env node

const os = require('os');

console.log('\n📦 Prompt to Query - Post-install check\n');

// Check if koffi installed successfully
try {
  require.resolve('koffi');
  console.log('✅ Native FFI support (koffi) installed successfully');
  console.log('   The SDK will use native mode for best performance\n');
} catch (e) {
  console.log('⚠️  Native FFI support (koffi) not available');
  console.log('   The SDK will work in HTTP mode\n');

  console.log('ℹ️  To enable native mode (better performance):');

  const platform = os.platform();

  if (platform === 'linux') {
    console.log('\n   For Alpine Linux / Docker:');
    console.log('   RUN apk add --no-cache python3 make g++ cmake linux-headers\n');

    console.log('   For Ubuntu/Debian:');
    console.log('   RUN apt-get update && apt-get install -y python3 make g++ cmake\n');
  } else if (platform === 'darwin') {
    console.log('\n   For macOS:');
    console.log('   brew install cmake\n');
  } else if (platform === 'win32') {
    console.log('\n   For Windows:');
    console.log('   Install Visual Studio Build Tools and CMake\n');
  }

  console.log('   Then run: npm rebuild koffi\n');
  console.log('📚 See documentation for HTTP mode setup\n');
}

console.log('───────────────────────────────────────────────────\n');
