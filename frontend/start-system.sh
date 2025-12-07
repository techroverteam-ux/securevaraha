#!/bin/bash

echo "🚀 Starting Hospital Management System..."

# Fix MySQL permissions
echo "1. Fixing MySQL permissions..."
./fix-mysql.sh

# Import database
echo "2. Importing database..."
./import-database.sh

# Start the application
echo "3. Starting Next.js application..."
cd hospital-management
npm run dev

echo "✅ System started successfully!"
echo "🌐 Open http://localhost:3000 in your browser"