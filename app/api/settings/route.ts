import { NextRequest, NextResponse } from 'next/server';
import { executeQuery, executeTransaction, ElectricitySettings } from '@/lib/database';

// GET - Ambil semua pengaturan tarif listrik
export async function GET() {
  try {
    // Test database connection first
    await executeQuery('SELECT 1');
    
    const settings = await executeQuery<ElectricitySettings>(`
      SELECT * FROM electricity_settings 
      ORDER BY is_active DESC, created_at DESC
    `);
    
    return NextResponse.json({ success: true, data: settings });
  } catch (error) {
    console.error('Error fetching electricity settings:', error);
    
    // Return default settings if database is not available
    if (error.message?.includes('ECONNREFUSED') || error.message?.includes('ER_ACCESS_DENIED')) {
      const defaultSettings = [
        {
          id: 1,
          tariff_name: 'Tarif PLN R1/TR 900 VA',
          base_tariff: 0,
          first_block_kwh: 900,
          first_block_rate: 1352,
          second_block_kwh: 0,
          second_block_rate: 0,
          third_block_kwh: 0,
          third_block_rate: 0,
          admin_fee: 0,
          vat_percentage: 10,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];
      
      return NextResponse.json({ 
        success: true, 
        data: defaultSettings,
        message: 'Database not connected. Using default settings.'
      });
    }
    
    return NextResponse.json(
      { success: false, error: 'Gagal mengambil data pengaturan tarif' },
      { status: 500 }
    );
  }
}

// POST - Tambah pengaturan tarif listrik baru
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      tariff_name,
      base_tariff,
      first_block_kwh,
      first_block_rate,
      second_block_kwh,
      second_block_rate,
      third_block_kwh,
      third_block_rate,
      admin_fee,
      vat_percentage,
      is_active
    } = body;

    if (!tariff_name || first_block_rate === undefined) {
      return NextResponse.json(
        { success: false, error: 'Nama tarif dan tarif block pertama harus diisi' },
        { status: 400 }
      );
    }

    // Jika setting ini akan diaktifkan, nonaktifkan yang lain
    if (is_active) {
      await executeQuery(`
        UPDATE electricity_settings SET is_active = false
      `);
    }

    const result = await executeQuery(`
      INSERT INTO electricity_settings 
      (tariff_name, base_tariff, first_block_kwh, first_block_rate, 
       second_block_kwh, second_block_rate, third_block_kwh, third_block_rate,
       admin_fee, vat_percentage, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      tariff_name,
      base_tariff || 0,
      first_block_kwh || 0,
      first_block_rate,
      second_block_kwh || 0,
      second_block_rate || 0,
      third_block_kwh || 0,
      third_block_rate || 0,
      admin_fee || 0,
      vat_percentage || 10,
      is_active || false
    ]);

    return NextResponse.json({
      success: true,
      data: {
        id: (result as any).insertId,
        tariff_name,
        base_tariff,
        first_block_kwh,
        first_block_rate,
        second_block_kwh,
        second_block_rate,
        third_block_kwh,
        third_block_rate,
        admin_fee,
        vat_percentage,
        is_active
      }
    });

  } catch (error) {
    console.error('Error creating electricity setting:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal menyimpan pengaturan tarif' },
      { status: 500 }
    );
  }
}
