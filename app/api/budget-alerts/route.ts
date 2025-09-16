import { NextRequest, NextResponse } from 'next/server';
import { executeQuery, BudgetAlert } from '@/lib/database';

// Add offline support headers
const addOfflineHeaders = (response: NextResponse) => {
  response.headers.set('Cache-Control', 'public, max-age=300, stale-while-revalidate=600');
  response.headers.set('X-Offline-Supported', 'true');
  return response;
};

// GET - Ambil budget alerts
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const budgetPlanId = searchParams.get('budget_plan_id');

    let query = `
      SELECT ba.*, bp.name as budget_plan_name
      FROM budget_alerts ba
      JOIN budget_plans bp ON ba.budget_plan_id = bp.id
      WHERE ba.is_enabled = TRUE
    `;
    const params: any[] = [];

    if (budgetPlanId) {
      query += ' AND ba.budget_plan_id = ?';
      params.push(budgetPlanId);
    }

    query += ' ORDER BY ba.alert_type, ba.threshold_percentage';

    const alerts = await executeQuery<BudgetAlert & { budget_plan_name: string }>(query, params);
    
    const response = NextResponse.json({ success: true, data: alerts });
    return addOfflineHeaders(response);
  } catch (error) {
    console.error('Error fetching budget alerts:', error);
    
    // Return empty array if database is not available
    if (error.message?.includes('ECONNREFUSED') || error.message?.includes('ER_ACCESS_DENIED')) {
      const response = NextResponse.json({ success: true, data: [], message: 'Database connection failed, showing cached data if available.' });
      return addOfflineHeaders(response);
    }

    return NextResponse.json({ success: false, message: 'Failed to fetch budget alerts' }, { status: 500 });
  }
}

// POST - Update budget alert
export async function POST(request: NextRequest) {
  try {
    const { id, threshold_percentage, is_enabled, message } = await request.json();

    if (!id) {
      return NextResponse.json({ success: false, message: 'Alert ID is required' }, { status: 400 });
    }

    // Validate threshold percentage
    if (threshold_percentage !== undefined && (threshold_percentage < 0 || threshold_percentage > 200)) {
      return NextResponse.json({ success: false, message: 'Threshold percentage must be between 0 and 200' }, { status: 400 });
    }

    const updateFields: string[] = [];
    const params: any[] = [];

    if (threshold_percentage !== undefined) {
      updateFields.push('threshold_percentage = ?');
      params.push(threshold_percentage);
    }

    if (is_enabled !== undefined) {
      updateFields.push('is_enabled = ?');
      params.push(is_enabled);
    }

    if (message !== undefined) {
      updateFields.push('message = ?');
      params.push(message);
    }

    if (updateFields.length === 0) {
      return NextResponse.json({ success: false, message: 'No fields to update' }, { status: 400 });
    }

    params.push(id);

    await executeQuery(`
      UPDATE budget_alerts 
      SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, params);

    return NextResponse.json({ 
      success: true, 
      message: 'Budget alert updated successfully'
    });
  } catch (error) {
    console.error('Error updating budget alert:', error);
    return NextResponse.json({ success: false, message: 'Failed to update budget alert' }, { status: 500 });
  }
}
