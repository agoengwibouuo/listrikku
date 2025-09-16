// Script untuk test API endpoints menggunakan built-in fetch
async function testAPI() {
  console.log('🔍 Testing API endpoints...');
  
  const baseUrl = 'http://localhost:3000/api';
  
  try {
    // Test meter-readings API
    console.log('\n📊 Testing /api/meter-readings...');
    const readingsResponse = await fetch(`${baseUrl}/meter-readings`);
    const readingsData = await readingsResponse.json();
    console.log('Status:', readingsResponse.status);
    console.log('Success:', readingsData.success);
    if (!readingsData.success) {
      console.log('Error:', readingsData.error);
    } else {
      console.log('Data count:', readingsData.data?.length || 0);
    }
    
    // Test settings API
    console.log('\n⚙️ Testing /api/settings...');
    const settingsResponse = await fetch(`${baseUrl}/settings`);
    const settingsData = await settingsResponse.json();
    console.log('Status:', settingsResponse.status);
    console.log('Success:', settingsData.success);
    if (!settingsData.success) {
      console.log('Error:', settingsData.error);
    } else {
      console.log('Settings count:', settingsData.data?.length || 0);
    }
    
    // Test reports API
    console.log('\n📈 Testing /api/reports...');
    const reportsResponse = await fetch(`${baseUrl}/reports?period=month`);
    const reportsData = await reportsResponse.json();
    console.log('Status:', reportsResponse.status);
    console.log('Success:', reportsData.success);
    if (!reportsData.success) {
      console.log('Error:', reportsData.error);
    } else {
      console.log('Has statistics:', !!reportsData.data?.statistics);
      console.log('Has trends:', !!reportsData.data?.trends);
    }
    
    // Test test-db API
    console.log('\n🗄️ Testing /api/test-db...');
    const testDbResponse = await fetch(`${baseUrl}/test-db`);
    const testDbData = await testDbResponse.json();
    console.log('Status:', testDbResponse.status);
    console.log('Success:', testDbData.success);
    if (!testDbData.success) {
      console.log('Error:', testDbData.error);
    } else {
      console.log('Tables:', testDbData.data?.tables?.length || 0);
    }
    
  } catch (error) {
    console.error('❌ API test failed:', error.message);
  }
}

testAPI();
