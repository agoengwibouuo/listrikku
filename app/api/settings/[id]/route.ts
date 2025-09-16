import { NextRequest, NextResponse } from 'next/server';
import { executeQuery, executeTransaction, ElectricitySettings } from '@/lib/database';

// GET - Ambil pengaturan tarif berdasarkan ID
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

    const settings = await executeQuery<ElectricitySettings>(`
      SELECT * FROM electricity_settings WHERE id = ?
    `, [id]);

    if (settings.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Pengaturan tarif tidak ditemukan' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: settings[0]
    });

  } catch (error) {
    console.error('Error fetching electricity setting:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal mengambil data pengaturan tarif' },
      { status: 500 }
    );
  }
}

// PUT - Update pengaturan tarif
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
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

    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: 'ID tidak valid' },
        { status: 400 }
      );
    }

    if (!tariff_name || first_block_rate === undefined) {
      return NextResponse.json(
        { success: false, error: 'Nama tarif dan tarif block pertama harus diisi' },
        { status: 400 }
      );
    }

    // Jika setting ini akan diaktifkan, nonaktifkan yang lain
    if (is_active) {
      await executeQuery(`
        UPDATE electricity_settings SET is_active = false WHERE id != ?
      `, [id]);
    }

    await executeQuery(`
      UPDATE electricity_settings 
      SET tariff_name = ?, base_tariff = ?, first_block_kwh = ?, first_block_rate = ?,
          second_block_kwh = ?, second_block_rate = ?, third_block_kwh = ?, third_block_rate = ?,
          admin_fee = ?, vat_percentage = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
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
      is_active || false,
      id
    ]);

    return NextResponse.json({
      success: true,
      data: {
        id,
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
    console.error('Error updating electricity setting:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal mengupdate pengaturan tarif' },
      { status: 500 }
    );
  }
}

// DELETE - Hapus pengaturan tarif
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

    // Cek apakah setting ini ada
    const existingSettings = await executeQuery(`
      SELECT id, is_active FROM electricity_settings WHERE id = ?
    `, [id]);

    if (existingSettings.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Pengaturan tarif tidak ditemukan' },
        { status: 404 }
      );
    }

    // Cek apakah setting ini sedang aktif
    if (existingSettings[0].is_active) {
      return NextResponse.json(
        { success: false, error: 'Tidak dapat menghapus pengaturan tarif yang sedang aktif. Nonaktifkan terlebih dahulu.' },
        { status: 400 }
      );
    }

    // Hapus pengaturan
    const result = await executeQuery(`
      DELETE FROM electricity_settings WHERE id = ?
    `, [id]);

    console.log('Delete result:', result);

    return NextResponse.json({
      success: true,
      message: 'Pengaturan tarif berhasil dihapus'
    });

  } catch (error) {
    console.error('Error deleting electricity setting:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal menghapus pengaturan tarif. Error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}
