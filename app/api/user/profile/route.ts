import { NextRequest, NextResponse } from 'next/server';
import { executeQuery, User } from '@/lib/database';
import { getUserFromRequest, hashPassword, verifyPassword } from '@/lib/auth';

// GET - Get user profile
export async function GET(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Not authenticated' },
        { status: 401 }
      );
    }

    const users = await executeQuery<User>(
      'SELECT id, email, full_name, phone, avatar_url, role, is_active, email_verified, last_login, created_at FROM users WHERE id = ?',
      [user.id]
    );

    if (users.length === 0) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    const userData = users[0];
    
    return NextResponse.json({
      success: true,
      user: {
        id: userData.id,
        email: userData.email,
        full_name: userData.full_name,
        phone: userData.phone,
        avatar_url: userData.avatar_url,
        role: userData.role,
        is_active: userData.is_active,
        email_verified: userData.email_verified,
        last_login: userData.last_login,
        created_at: userData.created_at
      }
    });

  } catch (error) {
    console.error('Get profile error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to get profile' },
      { status: 500 }
    );
  }
}

// PUT - Update user profile
export async function PUT(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Not authenticated' },
        { status: 401 }
      );
    }

    const { full_name, phone, avatar_url } = await request.json();

    if (!full_name) {
      return NextResponse.json(
        { success: false, message: 'Full name is required' },
        { status: 400 }
      );
    }

    await executeQuery(
      'UPDATE users SET full_name = ?, phone = ?, avatar_url = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [full_name, phone || null, avatar_url || null, user.id]
    );

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully'
    });

  } catch (error) {
    console.error('Update profile error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update profile' },
      { status: 500 }
    );
  }
}
