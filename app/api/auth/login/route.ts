import { NextRequest, NextResponse } from 'next/server';
import { executeQuery, User } from '@/lib/database';
import { 
  verifyPassword, 
  isValidEmail, 
  sanitizeUser,
  createSession,
  checkLoginAttempts,
  recordLoginAttempt 
} from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // Validation
    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'Email dan password harus diisi' },
        { status: 400 }
      );
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { success: false, message: 'Format email tidak valid' },
        { status: 400 }
      );
    }

    // Check login attempts
    const attemptCheck = checkLoginAttempts(email.toLowerCase());
    if (!attemptCheck.allowed) {
      return NextResponse.json(
        { 
          success: false, 
          message: `Terlalu banyak percobaan login. Coba lagi dalam 15 menit.`,
          remainingAttempts: attemptCheck.remainingAttempts
        },
        { status: 429 }
      );
    }

    // Get user
    const users = await executeQuery<User>(
      'SELECT * FROM users WHERE email = ? AND is_active = TRUE',
      [email.toLowerCase()]
    );

    if (users.length === 0) {
      recordLoginAttempt(email.toLowerCase(), false);
      return NextResponse.json(
        { success: false, message: 'Email atau password salah' },
        { status: 401 }
      );
    }

    const user = users[0];

    // Verify password
    const isPasswordValid = await verifyPassword(password, user.password_hash);
    if (!isPasswordValid) {
      recordLoginAttempt(email.toLowerCase(), false);
      return NextResponse.json(
        { success: false, message: 'Email atau password salah' },
        { status: 401 }
      );
    }

    // Record successful login
    recordLoginAttempt(email.toLowerCase(), true);

    // Update last login
    await executeQuery(
      'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?',
      [user.id]
    );

    // Create session
    const session = createSession(user);

    // Set cookie
    const response = NextResponse.json({
      success: true,
      message: 'Login berhasil',
      user: session.user,
      token: session.token
    });

    response.cookies.set('auth-token', session.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 // 7 days
    });

    return response;

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, message: 'Terjadi kesalahan saat login' },
      { status: 500 }
    );
  }
}
