#!/bin/bash

echo "🔧 Fixing MySQL Permissions..."

# Stop MySQL
brew services stop mysql

# Start MySQL normally (without skip-grant-tables)
brew services start mysql

# Wait for MySQL to start
sleep 3

# Connect and setup user
mysql -u root -p << 'EOF'
-- Create database if not exists
CREATE DATABASE IF NOT EXISTS varaosrc_hospital_management;

-- Create user if not exists
CREATE USER IF NOT EXISTS 'varaosrc_prc'@'localhost' IDENTIFIED BY 'PRC!@#456&*(';

-- Grant all privileges
GRANT ALL PRIVILEGES ON varaosrc_hospital_management.* TO 'varaosrc_prc'@'localhost';

-- Flush privileges
FLUSH PRIVILEGES;

-- Show user
SELECT User, Host FROM mysql.user WHERE User = 'varaosrc_prc';

-- Test connection
SELECT 'MySQL setup complete!' as Status;
EOF

echo "✅ MySQL permissions fixed!"
echo "🔗 Test connection: mysql -u varaosrc_prc -p varaosrc_hospital_management"