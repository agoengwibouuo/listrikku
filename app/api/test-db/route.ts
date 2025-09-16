import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/database';

export async function GET() {
  try {
    // Test basic connection
    await executeQuery('SELECT 1');
    
    // Test if tables exist
    const tables = await executeQuery(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = DATABASE()
    `);
    
    const tableNames = tables.map((table: any) => Object.values(table)[0]);
    const requiredTables = ['electricity_settings', 'meter_readings', 'billing_details', 'app_settings'];
    const missingTables = requiredTables.filter(table => !tableNames.includes(table));
    
    if (missingTables.length > 0) {
      return NextResponse.json({
        success: false,
        error: `Missing tables: ${missingTables.join(', ')}. Please import database/schema.sql`
      });
    }
    
    // Test if default data exists
    const settingsCount = await executeQuery('SELECT COUNT(*) as count FROM electricity_settings');
    const hasDefaultData = settingsCount[0]?.count > 0;
    
    return NextResponse.json({
      success: true,
      message: 'Database connection successful',
      data: {
        tables: tableNames,
        hasDefaultData,
        settingsCount: settingsCount[0]?.count || 0
      }
    });
    
  } catch (error) {
    console.error('Database test error:', error);
    
    let errorMessage = 'Database connection failed';
    
    if (error.message?.includes('ECONNREFUSED')) {
      errorMessage = 'Cannot connect to MySQL server. Please check if MySQL is running.';
    } else if (error.message?.includes('ER_ACCESS_DENIED')) {
      errorMessage = 'Access denied. Please check your database credentials in .env.local';
    } else if (error.message?.includes('ER_BAD_DB_ERROR')) {
      errorMessage = 'Database "electricity_tracker" does not exist. Please create it first.';
    } else if (error.message?.includes('ER_NO_SUCH_TABLE')) {
      errorMessage = 'Required tables not found. Please import database/schema.sql';
    }
    
    return NextResponse.json({
      success: false,
      error: errorMessage,
      details: error.message
    });
  }
}
