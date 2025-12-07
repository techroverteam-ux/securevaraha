const mysql = require('mysql2/promise');

const config = {
  host: 'localhost',
  user: 'root',
  password: 'RootPass2024!',
  database: 'varaosrc_hospital_management',
  port: 3307
};

async function testAll() {
  console.log('🔍 Testing MySQL Docker Database...\n');
  
  try {
    // Test connection
    const connection = await mysql.createConnection(config);
    console.log('✅ Database Connected');
    
    // Test admin table
    const [admins] = await connection.execute('SELECT username, password, admin_type FROM admin');
    console.log('👥 Admin Users:', admins.length);
    admins.forEach(admin => {
      console.log(`   - ${admin.username} (${admin.admin_type})`);
    });
    
    // Test patient table
    const [patients] = await connection.execute('SELECT COUNT(*) as count FROM patient_new');
    console.log('🏥 Total Patients:', patients[0].count);
    
    // Test today's data
    const today = new Date().toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit', 
      year: 'numeric'
    });
    
    const [todayPatients] = await connection.execute(
      'SELECT COUNT(*) as count FROM patient_new WHERE date = ?', [today]
    );
    console.log(`📅 Today's Patients (${today}):`, todayPatients[0].count);
    
    // Test API endpoint
    console.log('\n🌐 Testing API Endpoints...');
    
    // Test login
    const loginResponse = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'superadmin', password: 'Super@321' })
    });
    const loginData = await loginResponse.json();
    console.log('🔐 Login Test:', loginData.success ? '✅ Success' : '❌ Failed');
    
    // Test stats
    const statsResponse = await fetch('http://localhost:3000/api/superadmin/stats');
    const statsData = await statsResponse.json();
    console.log('📊 Stats API:', statsData.todayScans !== undefined ? '✅ Working' : '❌ Failed');
    
    await connection.end();
    console.log('\n🎉 All tests completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testAll();