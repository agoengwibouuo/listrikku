import { NextRequest, NextResponse } from 'next/server';
import { executeQuery, executeTransaction, MeterReading, ElectricitySettings, calculateElectricityCost } from '@/lib/database';

// Add offline support headers
const addOfflineHeaders = (response: NextResponse) => {
  response.headers.set('Cache-Control', 'public, max-age=300, stale-while-revalidate=600');
  response.headers.set('X-Offline-Supported', 'true');
  return response;
};

// GET - Ambil semua pencatatan meteran
export async function GET() {
  try {
    // Test database connection first
    await executeQuery('SELECT 1');
    
    const readings = await executeQuery<MeterReading>(`
      SELECT * FROM meter_readings 
      ORDER BY reading_date DESC 
      LIMIT 50
    `);
    
    const response = NextResponse.json({ success: true, data: readings });
    return addOfflineHeaders(response);
  } catch (error) {
    console.error('Error fetching meter readings:', error);
    
    // Return empty array if database is not available
    if (error.message?.includes('ECONNREFUSED') || error.message?.includes('ER_ACCESS_DENIED')) {
      return NextResponse.json({ 
        success: true, 
        data: [],
        message: 'Database not connected. Please check your database configuration.'
      });
    }
    
    return NextResponse.json(
      { success: false, error: 'Gagal mengambil data pencatatan meteran' },
      { status: 500 }
    );
  }
}

// POST - Tambah pencatatan meteran baru
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { reading_date, meter_value, notes } = body;

    if (!reading_date || !meter_value) {
      return NextResponse.json(
        { success: false, error: 'Tanggal dan nilai meteran harus diisi' },
        { status: 400 }
      );
    }

    // Ambil pencatatan terakhir untuk menghitung penggunaan
    const lastReading = await executeQuery<MeterReading>(`
      SELECT * FROM meter_readings 
      ORDER BY reading_date DESC 
      LIMIT 1
    `);

    const previousReading = lastReading.length > 0 ? lastReading[0].meter_value : 0;
    const usageKwh = Math.max(0, meter_value - previousReading);

    // Ambil pengaturan tarif aktif
    const activeSettings = await executeQuery<ElectricitySettings>(`
      SELECT * FROM electricity_settings 
      WHERE is_active = true 
      LIMIT 1
    `);

    if (activeSettings.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Tidak ada pengaturan tarif yang aktif' },
        { status: 400 }
      );
    }

    // Hitung biaya listrik
    const { totalCost, details } = calculateElectricityCost(usageKwh, activeSettings[0]);

    // Simpan pencatatan meteran
    const result = await executeTransaction(async (connection) => {
      const [insertResult] = await connection.execute(`
        INSERT INTO meter_readings 
        (reading_date, meter_value, previous_reading, usage_kwh, total_cost, notes)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [reading_date, meter_value, previousReading, usageKwh, totalCost, notes || null]);

      const meterReadingId = (insertResult as any).insertId;

      // Simpan detail perhitungan
      for (const detail of details) {
        await connection.execute(`
          INSERT INTO billing_details 
          (meter_reading_id, block_number, kwh_used, rate_per_kwh, subtotal)
          VALUES (?, ?, ?, ?, ?)
        `, [meterReadingId, detail.block, detail.kwh, detail.rate, detail.subtotal]);
      }

      return meterReadingId;
    });

    return NextResponse.json({
      success: true,
      data: {
        id: result,
        reading_date,
        meter_value,
        previous_reading: previousReading,
        usage_kwh: usageKwh,
        total_cost: totalCost,
        notes
      }
    });

  } catch (error) {
    console.error('Error creating meter reading:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal menyimpan pencatatan meteran' },
      { status: 500 }
    );
  }
}
