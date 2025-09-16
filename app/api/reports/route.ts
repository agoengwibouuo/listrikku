import { NextRequest, NextResponse } from 'next/server';
import { executeQuery, MeterReading } from '@/lib/database';

// GET - Ambil laporan penggunaan listrik
export async function GET(request: NextRequest) {
  try {
    // Test database connection first
    await executeQuery('SELECT 1');
    
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'month'; // month, year, all
    const year = searchParams.get('year') || new Date().getFullYear().toString();
    const month = searchParams.get('month') || (new Date().getMonth() + 1).toString();

    let dateFilter = '';
    let groupBy = '';

    switch (period) {
      case 'month':
        dateFilter = `WHERE YEAR(reading_date) = ? AND MONTH(reading_date) = ?`;
        groupBy = 'DAY(reading_date)';
        break;
      case 'year':
        dateFilter = `WHERE YEAR(reading_date) = ?`;
        groupBy = 'MONTH(reading_date)';
        break;
      case 'all':
        dateFilter = '';
        groupBy = 'YEAR(reading_date), MONTH(reading_date)';
        break;
      default:
        dateFilter = `WHERE YEAR(reading_date) = ? AND MONTH(reading_date) = ?`;
        groupBy = 'DAY(reading_date)';
    }

    // Ambil data penggunaan per periode
    let usageData = [];
    try {
      usageData = await executeQuery(`
        SELECT 
          ${groupBy} as period,
          SUM(usage_kwh) as total_usage,
          SUM(total_cost) as total_cost,
          COUNT(*) as reading_count,
          AVG(usage_kwh) as avg_usage,
          MIN(usage_kwh) as min_usage,
          MAX(usage_kwh) as max_usage
        FROM meter_readings 
        ${dateFilter}
        GROUP BY ${groupBy}
        ORDER BY period
      `, period === 'year' ? [year] : period === 'month' ? [year, month] : []);
    } catch (queryError) {
      console.error('Usage data query error:', queryError);
      usageData = [];
    }

    // Ambil data pencatatan terbaru
    let recentReadings = [];
    try {
      recentReadings = await executeQuery<MeterReading>(`
        SELECT * FROM meter_readings 
        ORDER BY reading_date DESC 
        LIMIT 10
      `);
    } catch (queryError) {
      console.error('Recent readings query error:', queryError);
      recentReadings = [];
    }

    // Hitung statistik keseluruhan
    let stats = [{
      total_readings: 0,
      total_usage_all_time: 0,
      total_cost_all_time: 0,
      avg_usage_all_time: 0,
      min_usage_all_time: 0,
      max_usage_all_time: 0,
      first_reading_date: null,
      last_reading_date: null
    }];
    
    try {
      stats = await executeQuery(`
        SELECT 
          COUNT(*) as total_readings,
          SUM(usage_kwh) as total_usage_all_time,
          SUM(total_cost) as total_cost_all_time,
          AVG(usage_kwh) as avg_usage_all_time,
          MIN(usage_kwh) as min_usage_all_time,
          MAX(usage_kwh) as max_usage_all_time,
          MIN(reading_date) as first_reading_date,
          MAX(reading_date) as last_reading_date
        FROM meter_readings
      `);
    } catch (queryError) {
      console.error('Statistics query error:', queryError);
    }

    // Hitung trend penggunaan (bulan ini vs bulan lalu)
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();
    const lastMonth = currentMonth === 1 ? 12 : currentMonth - 1;
    const lastMonthYear = currentMonth === 1 ? currentYear - 1 : currentYear;

    let currentMonthUsage = [{ usage: 0, cost: 0 }];
    let lastMonthUsage = [{ usage: 0, cost: 0 }];

    try {
      currentMonthUsage = await executeQuery(`
        SELECT SUM(usage_kwh) as usage, SUM(total_cost) as cost
        FROM meter_readings 
        WHERE YEAR(reading_date) = ? AND MONTH(reading_date) = ?
      `, [currentYear, currentMonth]);
    } catch (queryError) {
      console.error('Current month usage query error:', queryError);
    }

    try {
      lastMonthUsage = await executeQuery(`
        SELECT SUM(usage_kwh) as usage, SUM(total_cost) as cost
        FROM meter_readings 
        WHERE YEAR(reading_date) = ? AND MONTH(reading_date) = ?
      `, [lastMonthYear, lastMonth]);
    } catch (queryError) {
      console.error('Last month usage query error:', queryError);
    }

    const currentUsage = currentMonthUsage[0]?.usage || 0;
    const lastUsage = lastMonthUsage[0]?.usage || 0;
    const usageTrend = lastUsage > 0 ? ((currentUsage - lastUsage) / lastUsage) * 100 : 0;

    const currentCost = currentMonthUsage[0]?.cost || 0;
    const lastCost = lastMonthUsage[0]?.cost || 0;
    const costTrend = lastCost > 0 ? ((currentCost - lastCost) / lastCost) * 100 : 0;

    return NextResponse.json({
      success: true,
      data: {
        period,
        year,
        month,
        usageData,
        recentReadings,
        statistics: stats[0],
        trends: {
          usage: {
            current: currentUsage,
            previous: lastUsage,
            change: usageTrend,
            changeType: usageTrend > 0 ? 'increase' : usageTrend < 0 ? 'decrease' : 'stable'
          },
          cost: {
            current: currentCost,
            previous: lastCost,
            change: costTrend,
            changeType: costTrend > 0 ? 'increase' : costTrend < 0 ? 'decrease' : 'stable'
          }
        }
      }
    });

  } catch (error) {
    console.error('Error generating reports:', error);
    
    // Return empty data if database is not available
    if (error.message?.includes('ECONNREFUSED') || error.message?.includes('ER_ACCESS_DENIED')) {
      return NextResponse.json({
        success: true,
        data: {
          period: 'month',
          year: new Date().getFullYear().toString(),
          month: (new Date().getMonth() + 1).toString(),
          usageData: [],
          recentReadings: [],
          statistics: {
            total_readings: 0,
            total_usage_all_time: 0,
            total_cost_all_time: 0,
            avg_usage_all_time: 0,
            min_usage_all_time: 0,
            max_usage_all_time: 0,
            first_reading_date: null,
            last_reading_date: null
          },
          trends: {
            usage: { current: 0, previous: 0, change: 0, changeType: 'stable' },
            cost: { current: 0, previous: 0, change: 0, changeType: 'stable' }
          }
        },
        message: 'Database not connected. Please check your database configuration.'
      });
    }
    
    return NextResponse.json(
      { success: false, error: 'Gagal membuat laporan' },
      { status: 500 }
    );
  }
}
