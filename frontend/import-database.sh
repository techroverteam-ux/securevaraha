#!/bin/bash

echo "📊 Importing Hospital Management Database..."

# Database credentials
DB_USER="varaosrc_prc"
DB_PASS="PRC!@#456&*("
DB_NAME="varaosrc_hospital_management"

# Check if SQL file exists
if [ -f "varaosrc_hospital_management.sql" ]; then
    echo "📁 Found SQL file, importing..."
    mysql -u $DB_USER -p$DB_PASS $DB_NAME < varaosrc_hospital_management.sql
    echo "✅ SQL data imported successfully!"
else
    echo "❌ SQL file not found!"
fi

# Import sample data
mysql -u $DB_USER -p$DB_PASS $DB_NAME << 'EOF'
-- Insert sample hospitals if not exists
INSERT IGNORE INTO hospital (h_id, h_name, h_address, h_contact) VALUES
(1, 'City General Hospital', '123 Main Street, Mumbai', '+91-9876543210'),
(2, 'Metro Medical Center', '456 Park Avenue, Delhi', '+91-9876543211'),
(3, 'Apollo Hospital', '789 Health Road, Bangalore', '+91-9876543212');

-- Insert sample doctors if not exists
INSERT IGNORE INTO doctor (d_id, dname, specialization) VALUES
(1, 'Dr. Rajesh Kumar', 'Cardiology'),
(2, 'Dr. Priya Sharma', 'Neurology'),
(3, 'Dr. Amit Patel', 'Orthopedics'),
(4, 'Dr. Sunita Singh', 'Pediatrics');

-- Insert sample scans if not exists
INSERT IGNORE INTO scan (s_id, s_name, s_price, s_duration) VALUES
(1, 'CT Scan - Head', 5000, 30),
(2, 'MRI - Spine', 8000, 45),
(3, 'X-Ray - Chest', 1500, 15),
(4, 'Ultrasound - Abdomen', 2000, 20);

-- Insert admin users if not exists
INSERT IGNORE INTO admin (admin_id, username, password, admin_type) VALUES
(1, 'admin', 'Admin@Varaha', 'admin'),
(2, 'doctor', 'Admin@321', 'doctor'),
(3, 'reception', 'Admin@321', 'nurse'),
(4, 'console', 'Admin@321', 'console');

-- Show imported data
SELECT 'Hospitals:' as Info;
SELECT h_id, h_name FROM hospital LIMIT 5;

SELECT 'Doctors:' as Info;
SELECT d_id, dname FROM doctor LIMIT 5;

SELECT 'Scans:' as Info;
SELECT s_id, s_name FROM scan LIMIT 5;

SELECT 'Admin Users:' as Info;
SELECT admin_id, username, admin_type FROM admin;

EOF

echo "✅ Database import completed!"
echo "🔗 Test connection: mysql -u $DB_USER -p $DB_NAME"