// Script untuk test koneksi database VPS
const mysql = require('mysql2/promise');
const fs = require('fs');

async function testDatabaseConnection() {
  console.log('🔍 Testing VPS database connection...');
  
  // Read .env.local file manually
  let envConfig = {};
  try {
    const envContent = fs.readFileSync('.env.local', 'utf8');
    envContent.split('\n').forEach(line => {
      if (line.includes('=') && !line.startsWith('#')) {
        const [key, value] = line.split('=');
        envConfig[key.trim()] = value.trim();
      }
    });
  } catch (error) {
    console.error('❌ Cannot read .env.local file');
    return;
  }
  
  const config = {
    host: envConfig.DB_HOST || 'localhost',
    user: envConfig.DB_USER || 'root',
    password: envConfig.DB_PASSWORD || '',
    database: envConfig.DB_NAME || 'electricity_tracker',
    port: parseInt(envConfig.DB_PORT || '3306'),
  };

  console.log('🔍 Connection details:');
  console.log(`Host: ${config.host}`);
  console.log(`User: ${config.user}`);
  console.log(`Database: ${config.database}`);
  console.log(`Port: ${config.port}`);
  console.log('');

  try {
    console.log('📡 Connecting to database...');
    const connection = await mysql.createConnection(config);
    
    console.log('✅ Database connection successful!');
    
    // Test query
    const [rows] = await connection.execute('SHOW TABLES');
    console.log('📋 Tables found:', rows.length);
    
    if (rows.length > 0) {
      console.log('📊 Tables:');
      rows.forEach(row => {
        console.log(`  - ${Object.values(row)[0]}`);
      });
    }
    
    // Check if required tables exist
    const requiredTables = ['electricity_settings', 'meter_readings', 'billing_details', 'app_settings'];
    const existingTables = rows.map(row => Object.values(row)[0]);
    const missingTables = requiredTables.filter(table => !existingTables.includes(table));
    
    if (missingTables.length > 0) {
      console.log('');
      console.log('⚠️  Missing required tables:');
      missingTables.forEach(table => console.log(`  - ${table}`));
      console.log('');
      console.log('💡 Please import database/schema.sql to create these tables');
    } else {
      console.log('');
      console.log('✅ All required tables exist!');
    }
    
    await connection.end();
    console.log('🎉 Database test completed successfully!');
    
  } catch (error) {
    console.error('❌ Database connection failed:');
    console.error('Error:', error.message);
    console.error('Code:', error.code);
    console.log('');
    console.log('💡 Troubleshooting tips:');
    if (error.code === 'ECONNREFUSED') {
      console.log('1. ❌ Connection refused - Check if MySQL server is running on VPS');
      console.log('2. ❌ Check if port 3306 is open on VPS firewall');
      console.log('3. ❌ Verify VPS IP address is correct');
      console.log('4. ❌ Check if MySQL is configured to accept remote connections');
    } else if (error.code === 'ER_ACCESS_DENIED') {
      console.log('1. ❌ Access denied - Check username and password');
      console.log('2. ❌ Verify user has access to the database');
      console.log('3. ❌ Check if user can connect from your IP');
      console.log('4. ❌ Grant remote access: GRANT ALL ON listrik-db.* TO "listrik-db"@"%" IDENTIFIED BY "password";');
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      console.log('1. ❌ Database does not exist - Create database on VPS');
      console.log('2. ❌ Check database name spelling');
    } else {
      console.log('1. Make sure MySQL server is running on VPS');
      console.log('2. Check database credentials in .env.local');
      console.log('3. Ensure database exists on VPS');
      console.log('4. Import database/schema.sql to create tables');
    }
    process.exit(1);
  }
}

testDatabaseConnection();
