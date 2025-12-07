#!/bin/bash

echo "🧪 Running Hospital Management System Tests"
echo "=========================================="

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

echo ""
echo "🔧 Running Unit Tests..."
npm test -- --testPathPattern="__tests__/(api|components)" --verbose

echo ""
echo "🔗 Running Integration Tests..."
npm test -- --testPathPattern="__tests__/integration" --verbose

echo ""
echo "📊 Running All Tests with Coverage..."
npm run test:coverage

echo ""
echo "✅ Test Summary:"
echo "- API Tests: Authentication, Patient Registration, Data Fetching"
echo "- Component Tests: Login, Dashboard, Patient Forms"
echo "- Integration Tests: Complete User Flows"
echo "- Coverage Report: Generated in coverage/ directory"

echo ""
echo "🚀 To run tests in watch mode: npm run test:watch"
echo "🔍 To run specific test: npm test -- --testNamePattern='test name'"