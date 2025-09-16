import { NextRequest, NextResponse } from 'next/server';
import { executeQuery, executeTransaction, MeterReading, ElectricitySettings, calculateElectricityCost } from '@/lib/database';

// GET - Ambil pencatatan meteran berdasarkan ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: 'ID tidak valid' },
        { status: 400 }
      );
    }

    const readings = await executeQuery<MeterReading>(`
      SELECT * FROM meter_readings WHERE id = ?
    `, [id]);

    if (readings.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Pencatatan meteran tidak ditemukan' },
        { status: 404 }
      );
    }

    // Ambil detail perhitungan
    const details = await executeQuery(`
      SELECT * FROM billing_details WHERE meter_reading_id = ?
      ORDER BY block_number
    `, [id]);

    return NextResponse.json({
      success: true,
      data: {
        ...readings[0],
        billing_details: details
      }
    });

  } catch (error) {
    console.error('Error fetching meter reading:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal mengambil data pencatatan meteran' },
      { status: 500 }
    );
  }
}

// PUT - Update pencatatan meteran
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const body = await request.json();
    const { reading_date, meter_value, notes } = body;

    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: 'ID tidak valid' },
        { status: 400 }
      );
    }

    if (!reading_date || !meter_value) {
      return NextResponse.json(
        { success: false, error: 'Tanggal dan nilai meteran harus diisi' },
        { status: 400 }
      );
    }

    // Ambil pencatatan sebelumnya (bukan yang sedang diedit)
    const previousReading = await executeQuery<MeterReading>(`
      SELECT * FROM meter_readings 
      WHERE id != ? AND reading_date < ?
      ORDER BY reading_date DESC 
      LIMIT 1
    `, [id, reading_date]);

    const previousValue = previousReading.length > 0 ? previousReading[0].meter_value : 0;
    const usageKwh = Math.max(0, meter_value - previousValue);

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

    // Update pencatatan meteran
    await executeTransaction(async (connection) => {
      await connection.execute(`
        UPDATE meter_readings 
        SET reading_date = ?, meter_value = ?, previous_reading = ?, 
            usage_kwh = ?, total_cost = ?, notes = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `, [reading_date, meter_value, previousValue, usageKwh, totalCost, notes || null, id]);

      // Hapus detail perhitungan lama
      await connection.execute(`
        DELETE FROM billing_details WHERE meter_reading_id = ?
      `, [id]);

      // Simpan detail perhitungan baru
      for (const detail of details) {
        await connection.execute(`
          INSERT INTO billing_details 
          (meter_reading_id, block_number, kwh_used, rate_per_kwh, subtotal)
          VALUES (?, ?, ?, ?, ?)
        `, [id, detail.block, detail.kwh, detail.rate, detail.subtotal]);
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        id,
        reading_date,
        meter_value,
        previous_reading: previousValue,
        usage_kwh: usageKwh,
        total_cost: totalCost,
        notes
      }
    });

  } catch (error) {
    console.error('Error updating meter reading:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal mengupdate pencatatan meteran' },
      { status: 500 }
    );
  }
}

// DELETE - Hapus pencatatan meteran
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);

    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: 'ID tidak valid' },
        { status: 400 }
      );
    }

    await executeTransaction(async (connection) => {
      // Hapus detail perhitungan terlebih dahulu (foreign key constraint)
      await connection.execute(`
        DELETE FROM billing_details WHERE meter_reading_id = ?
      `, [id]);

      // Hapus pencatatan meteran
      await connection.execute(`
        DELETE FROM meter_readings WHERE id = ?
      `, [id]);
    });

    return NextResponse.json({
      success: true,
      message: 'Pencatatan meteran berhasil dihapus'
    });

  } catch (error) {
    console.error('Error deleting meter reading:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal menghapus pencatatan meteran' },
      { status: 500 }
    );
  }
}
