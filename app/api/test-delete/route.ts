import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/database';

export async function GET() {
  try {
    // Test database connection
    const testResult = await executeQuery('SELECT 1 as test');
    console.log('Database test result:', testResult);

    // Test electricity_settings table
    const settingsResult = await executeQuery('SELECT COUNT(*) as count FROM electricity_settings');
    console.log('Settings count:', settingsResult);

    // Get all settings
    const allSettings = await executeQuery('SELECT * FROM electricity_settings');
    console.log('All settings:', allSettings);

    return NextResponse.json({
      success: true,
      message: 'Database connection test successful',
      data: {
        testResult,
        settingsCount: settingsResult[0]?.count || 0,
        allSettings
      }
    });

  } catch (error) {
    console.error('Database test error:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      message: 'Database connection test failed'
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'ID parameter is required'
      }, { status: 400 });
    }

    console.log('Test delete for ID:', id);

    // Check if setting exists
    const existingSettings = await executeQuery(
      'SELECT id, is_active FROM electricity_settings WHERE id = ?',
      [parseInt(id)]
    );

    console.log('Existing settings:', existingSettings);

    if (existingSettings.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Setting not found'
      }, { status: 404 });
    }

    if (existingSettings[0].is_active) {
      return NextResponse.json({
        success: false,
        error: 'Cannot delete active setting'
      }, { status: 400 });
    }

    // Delete the setting
    const deleteResult = await executeQuery(
      'DELETE FROM electricity_settings WHERE id = ?',
      [parseInt(id)]
    );

    console.log('Delete result:', deleteResult);

    return NextResponse.json({
      success: true,
      message: 'Test delete successful',
      data: {
        deletedId: id,
        deleteResult
      }
    });

  } catch (error) {
    console.error('Test delete error:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      message: 'Test delete failed'
    }, { status: 500 });
  }
}
