import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    const debugInfo = {
      environment: {
        NODE_ENV: process.env.NODE_ENV,
        DB_HOST: process.env.DB_HOST || 'localhost',
        DB_USER: process.env.DB_USER || 'root',
        DB_NAME: process.env.DB_NAME || 'electricity_tracker',
        DB_PORT: process.env.DB_PORT || '3306',
        // Don't expose password in logs
        DB_PASSWORD: process.env.DB_PASSWORD ? '***SET***' : 'NOT_SET',
      },
      timestamp: new Date().toISOString(),
      message: 'Debug information retrieved successfully'
    };

    console.log('Debug info:', debugInfo);

    return NextResponse.json({
      success: true,
      data: debugInfo
    });

  } catch (error) {
    console.error('Debug error:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      message: 'Failed to get debug information'
    }, { status: 500 });
  }
}
