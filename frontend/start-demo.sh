#!/bin/bash

echo "🏥 Starting Varaha SDC CT Scan Management System"
echo "================================================"

# Check if CSV file exists
if [ ! -f "../varaosrc_hospital_management.csv" ]; then
    echo "⚠️  Warning: CSV file not found at ../varaosrc_hospital_management.csv"
    echo "   System will use default admin accounts for demo"
fi

echo "📋 Available Login Credentials:"
echo "--------------------------------"
echo "Super Admin: super_admin / Super@Admin123"
echo "Admin:       admin / Admin@Varaha"
echo "Reception:   reception / Admin@321"
echo "Doctor:      doctor / Admin@321"
echo "Console:     console / Admin@321"
echo ""

echo "🚀 Starting development server..."
npm run dev

echo ""
echo "🌐 Open http://localhost:3000/login in your browser"
echo "📱 CT Scan Management System ready for client presentation!"