const testLogin = async (username, password) => {
  try {
    const response = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log(`✅ Login successful for ${username}:`);
      console.log(`   Data source: ${data.dataSource}`);
      console.log(`   User type: ${data.user.admin_type || data.user.type}`);
      console.log(`   User ID: ${data.user.admin_id || data.user.id}`);
    } else {
      console.log(`❌ Login failed for ${username}: ${data.error}`);
    }
  } catch (error) {
    console.log(`❌ Request failed for ${username}:`, error.message);
  }
};

const runTests = async () => {
  console.log('🧪 Testing Login API...\n');
  
  // Test valid credentials from CSV
  await testLogin('admin', 'Admin@Varaha');
  await testLogin('reception', 'Admin@321');
  await testLogin('doctor', 'Admin@321');
  await testLogin('console', 'Admin@321');
  
  // Test invalid credentials
  await testLogin('admin', 'wrongpassword');
  await testLogin('nonexistent', 'password');
  
  console.log('\n✅ All tests completed!');
};

runTests();