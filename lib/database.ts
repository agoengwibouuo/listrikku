import mysql from 'mysql2/promise';

// Konfigurasi database
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'electricity_tracker',
  port: parseInt(process.env.DB_PORT || '3306'),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

// Pool koneksi database
let pool: mysql.Pool | null = null;

export function getPool(): mysql.Pool {
  if (!pool) {
    pool = mysql.createPool(dbConfig);
  }
  return pool;
}

// Interface untuk tipe data
export interface ElectricitySettings {
  id: number;
  tariff_name: string;
  base_tariff: number;
  first_block_kwh: number;
  first_block_rate: number;
  second_block_kwh: number;
  second_block_rate: number;
  third_block_kwh: number;
  third_block_rate: number;
  admin_fee: number;
  vat_percentage: number;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface User {
  id: number;
  email: string;
  password_hash: string;
  full_name: string;
  phone?: string;
  avatar_url?: string;
  role: 'user' | 'admin';
  is_active: boolean;
  email_verified: boolean;
  email_verification_token?: string;
  password_reset_token?: string;
  password_reset_expires?: Date;
  last_login?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface UserSession {
  id: number;
  user_id: number;
  session_token: string;
  expires_at: Date;
  ip_address?: string;
  user_agent?: string;
  is_active: boolean;
  created_at: Date;
}

export interface UserPreferences {
  id: number;
  user_id: number;
  theme: 'light' | 'dark' | 'system';
  language: string;
  currency: string;
  timezone: string;
  notifications_enabled: boolean;
  email_notifications: boolean;
  push_notifications: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface MeterReading {
  id: number;
  user_id: number;
  reading_date: string;
  meter_value: number;
  previous_reading: number;
  usage_kwh: number;
  total_cost: number;
  notes?: string;
  created_at: Date;
  updated_at: Date;
}

export interface BillingDetail {
  id: number;
  meter_reading_id: number;
  block_number: number;
  kwh_used: number;
  rate_per_kwh: number;
  subtotal: number;
  created_at: Date;
}

export interface AppSetting {
  id: number;
  setting_key: string;
  setting_value: string;
  setting_type: 'string' | 'number' | 'boolean' | 'json';
  description?: string;
  created_at: Date;
  updated_at: Date;
}

export interface BudgetPlan {
  id: number;
  user_id: number;
  name: string;
  monthly_budget: number;
  target_usage_kwh: number;
  start_date: string;
  end_date?: string;
  is_active: boolean;
  description?: string;
  created_at: Date;
  updated_at: Date;
}

export interface BudgetTracking {
  id: number;
  budget_plan_id: number;
  month_year: string;
  actual_usage_kwh: number;
  actual_cost: number;
  budget_remaining: number;
  usage_percentage: number;
  cost_percentage: number;
  status: 'on_track' | 'over_budget' | 'under_budget';
  notes?: string;
  created_at: Date;
  updated_at: Date;
}

export interface BudgetAlert {
  id: number;
  budget_plan_id: number;
  alert_type: 'usage_warning' | 'cost_warning' | 'budget_exceeded';
  threshold_percentage: number;
  is_enabled: boolean;
  message?: string;
  created_at: Date;
  updated_at: Date;
}

// Fungsi helper untuk koneksi database
export async function executeQuery<T = any>(
  query: string,
  params: any[] = []
): Promise<T[]> {
  const pool = getPool();
  try {
    const [rows] = await pool.execute(query, params);
    return rows as T[];
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

export async function executeTransaction<T>(
  callback: (connection: mysql.PoolConnection) => Promise<T>
): Promise<T> {
  const pool = getPool();
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    const result = await callback(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

// Fungsi untuk menghitung biaya listrik
export function calculateElectricityCost(
  usageKwh: number,
  settings: ElectricitySettings
): { totalCost: number; details: Array<{ block: number; kwh: number; rate: number; subtotal: number }> } {
  const details: Array<{ block: number; kwh: number; rate: number; subtotal: number }> = [];
  let totalCost = 0;
  let remainingKwh = usageKwh;

  // Block pertama
  if (remainingKwh > 0 && settings.first_block_kwh > 0) {
    const kwhInFirstBlock = Math.min(remainingKwh, settings.first_block_kwh);
    const subtotal = kwhInFirstBlock * settings.first_block_rate;
    details.push({
      block: 1,
      kwh: kwhInFirstBlock,
      rate: settings.first_block_rate,
      subtotal
    });
    totalCost += subtotal;
    remainingKwh -= kwhInFirstBlock;
  }

  // Block kedua
  if (remainingKwh > 0 && settings.second_block_kwh > 0) {
    const kwhInSecondBlock = Math.min(remainingKwh, settings.second_block_kwh);
    const subtotal = kwhInSecondBlock * settings.second_block_rate;
    details.push({
      block: 2,
      kwh: kwhInSecondBlock,
      rate: settings.second_block_rate,
      subtotal
    });
    totalCost += subtotal;
    remainingKwh -= kwhInSecondBlock;
  }

  // Block ketiga
  if (remainingKwh > 0 && settings.third_block_kwh > 0) {
    const kwhInThirdBlock = Math.min(remainingKwh, settings.third_block_kwh);
    const subtotal = kwhInThirdBlock * settings.third_block_rate;
    details.push({
      block: 3,
      kwh: kwhInThirdBlock,
      rate: settings.third_block_rate,
      subtotal
    });
    totalCost += subtotal;
    remainingKwh -= kwhInThirdBlock;
  }

  // Tambahkan biaya admin dan PPN
  totalCost += settings.admin_fee;
  const vatAmount = (totalCost * settings.vat_percentage) / 100;
  totalCost += vatAmount;

  return { totalCost, details };
}
