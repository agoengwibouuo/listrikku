import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';
import { User } from './database';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = '7d';

export interface AuthUser {
  id: number;
  email: string;
  full_name: string;
  role: 'user' | 'admin';
  is_active: boolean;
  email_verified: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  full_name: string;
  phone?: string;
}

// Hash password
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
}

// Verify password
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return await bcrypt.compare(password, hashedPassword);
}

// Generate JWT token
export function generateToken(user: AuthUser): string {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      role: user.role,
      is_active: user.is_active,
      email_verified: user.email_verified,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

// Verify JWT token
export function verifyToken(token: string): AuthUser | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    return {
      id: decoded.id,
      email: decoded.email,
      full_name: decoded.full_name,
      role: decoded.role,
      is_active: decoded.is_active,
      email_verified: decoded.email_verified,
    };
  } catch (error) {
    return null;
  }
}

// Extract token from request
export function extractTokenFromRequest(request: NextRequest): string | null {
  // Try Authorization header first
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  // Try cookie
  const token = request.cookies.get('auth-token')?.value;
  if (token) {
    return token;
  }

  return null;
}

// Get user from request
export function getUserFromRequest(request: NextRequest): AuthUser | null {
  const token = extractTokenFromRequest(request);
  if (!token) return null;
  
  return verifyToken(token);
}

// Generate random token for email verification and password reset
export function generateRandomToken(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

// Validate email format
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Validate password strength
export function validatePassword(password: string): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Password harus minimal 8 karakter');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password harus mengandung minimal 1 huruf besar');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password harus mengandung minimal 1 huruf kecil');
  }
  
  if (!/[0-9]/.test(password)) {
    errors.push('Password harus mengandung minimal 1 angka');
  }
  
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password harus mengandung minimal 1 karakter khusus');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

// Sanitize user data for client
export function sanitizeUser(user: User): AuthUser {
  return {
    id: user.id,
    email: user.email,
    full_name: user.full_name,
    role: user.role,
    is_active: user.is_active,
    email_verified: user.email_verified,
  };
}

// Check if user has permission
export function hasPermission(user: AuthUser, permission: string): boolean {
  if (user.role === 'admin') return true;
  
  switch (permission) {
    case 'read_own_data':
    case 'write_own_data':
      return user.is_active && user.email_verified;
    case 'manage_users':
      return user.role === 'admin';
    default:
      return false;
  }
}

// Session management
export interface SessionData {
  user: AuthUser;
  token: string;
  expiresAt: Date;
}

export function createSession(user: User): SessionData {
  const authUser = sanitizeUser(user);
  const token = generateToken(authUser);
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
  
  return {
    user: authUser,
    token,
    expiresAt
  };
}

// Rate limiting for authentication
const loginAttempts = new Map<string, { count: number; lastAttempt: number }>();
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes

export function checkLoginAttempts(email: string): { allowed: boolean; remainingAttempts: number } {
  const attempts = loginAttempts.get(email);
  
  if (!attempts) {
    return { allowed: true, remainingAttempts: MAX_LOGIN_ATTEMPTS };
  }
  
  const now = Date.now();
  const timeSinceLastAttempt = now - attempts.lastAttempt;
  
  // Reset attempts if lockout period has passed
  if (timeSinceLastAttempt > LOCKOUT_DURATION) {
    loginAttempts.delete(email);
    return { allowed: true, remainingAttempts: MAX_LOGIN_ATTEMPTS };
  }
  
  const remainingAttempts = Math.max(0, MAX_LOGIN_ATTEMPTS - attempts.count);
  return { allowed: attempts.count < MAX_LOGIN_ATTEMPTS, remainingAttempts };
}

export function recordLoginAttempt(email: string, success: boolean): void {
  if (success) {
    loginAttempts.delete(email);
    return;
  }
  
  const attempts = loginAttempts.get(email) || { count: 0, lastAttempt: 0 };
  attempts.count += 1;
  attempts.lastAttempt = Date.now();
  loginAttempts.set(email, attempts);
}
