import { NextRequest, NextResponse } from 'next/server';
import { extractTokenFromRequest, verifyToken } from '@/lib/auth';
import { executeQuery } from '@/lib/database';

export async function POST(request: NextRequest) {
  try {
    const token = extractTokenFromRequest(request);
    
    if (token) {
      const user = verifyToken(token);
      
      if (user) {
        // Deactivate session in database
        await executeQuery(
          'UPDATE user_sessions SET is_active = FALSE WHERE user_id = ? AND session_token = ?',
          [user.id, token]
        );
      }
    }

    // Clear cookie
    const response = NextResponse.json({
      success: true,
      message: 'Logout berhasil'
    });

    response.cookies.set('auth-token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0 // Expire immediately
    });

    return response;

  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { success: false, message: 'Terjadi kesalahan saat logout' },
      { status: 500 }
    );
  }
}
