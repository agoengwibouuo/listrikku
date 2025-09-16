// Script untuk test koneksi database
const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

async function testDatabaseConnection() {
  console.log('🔍 Testing database connection...');
  
  const config = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'electricity_tracker',
    port: parseInt(process.env.DB_PORT || '3306'),
  };

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
    
    await connection.end();
    console.log('🎉 Database test completed successfully!');
    
  } catch (error) {
    console.error('❌ Database connection failed:');
    console.error('Error:', error.message);
    console.error('Code:', error.code);
    console.log('');
    console.log('🔍 Connection details:');
    console.log(`Host: ${config.host}`);
    console.log(`User: ${config.user}`);
    console.log(`Database: ${config.database}`);
    console.log(`Port: ${config.port}`);
    console.log('');
    console.log('💡 Troubleshooting tips:');
    if (error.code === 'ECONNREFUSED') {
      console.log('1. ❌ Connection refused - Check if MySQL server is running on VPS');
      console.log('2. ❌ Check if port 3306 is open on VPS firewall');
      console.log('3. ❌ Verify VPS IP address is correct');
    } else if (error.code === 'ER_ACCESS_DENIED') {
      console.log('1. ❌ Access denied - Check username and password');
      console.log('2. ❌ Verify user has access to the database');
      console.log('3. ❌ Check if user can connect from your IP');
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
