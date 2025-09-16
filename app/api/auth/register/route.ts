import { NextRequest, NextResponse } from 'next/server';
import { executeQuery, User } from '@/lib/database';
import { 
  hashPassword, 
  isValidEmail, 
  validatePassword, 
  generateRandomToken,
  sanitizeUser,
  createSession 
} from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { email, password, full_name, phone } = await request.json();

    // Validation
    if (!email || !password || !full_name) {
      return NextResponse.json(
        { success: false, message: 'Email, password, dan nama lengkap harus diisi' },
        { status: 400 }
      );
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { success: false, message: 'Format email tidak valid' },
        { status: 400 }
      );
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      return NextResponse.json(
        { success: false, message: 'Password tidak memenuhi kriteria', errors: passwordValidation.errors },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUsers = await executeQuery<User>(
      'SELECT id FROM users WHERE email = ?',
      [email.toLowerCase()]
    );

    if (existingUsers.length > 0) {
      return NextResponse.json(
        { success: false, message: 'Email sudah terdaftar' },
        { status: 409 }
      );
    }

    // Hash password
    const passwordHash = await hashPassword(password);
    
    // Generate email verification token
    const emailVerificationToken = generateRandomToken();

    // Create user
    const result = await executeQuery(
      `INSERT INTO users (email, password_hash, full_name, phone, email_verification_token, role, is_active, email_verified)
       VALUES (?, ?, ?, ?, ?, 'user', TRUE, FALSE)`,
      [email.toLowerCase(), passwordHash, full_name, phone || null, emailVerificationToken]
    );

    const userId = (result as any).insertId;

    // Create user preferences
    await executeQuery(
      `INSERT INTO user_preferences (user_id, theme, language, currency, timezone)
       VALUES (?, 'system', 'id', 'IDR', 'Asia/Jakarta')`,
      [userId]
    );

    // Get created user
    const newUsers = await executeQuery<User>(
      'SELECT * FROM users WHERE id = ?',
      [userId]
    );

    if (newUsers.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Gagal membuat akun' },
        { status: 500 }
      );
    }

    const user = newUsers[0];
    const session = createSession(user);

    // TODO: Send email verification
    // await sendEmailVerification(email, emailVerificationToken);

    // Set cookie
    const response = NextResponse.json({
      success: true,
      message: 'Akun berhasil dibuat',
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
    console.error('Registration error:', error);
    return NextResponse.json(
      { success: false, message: 'Terjadi kesalahan saat membuat akun' },
      { status: 500 }
    );
  }
}
