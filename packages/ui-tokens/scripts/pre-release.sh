#!/bin/bash
set -e

echo "🔍 Running pre-release checks..."

# 1. Clean install
rm -rf node_modules package-lock.json
npm install

# 2. Full validation
npm run validate

# 3. Run tests
npm test

echo "✅ Pre-release checks passed"
