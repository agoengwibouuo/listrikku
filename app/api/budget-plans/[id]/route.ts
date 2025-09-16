import { NextRequest, NextResponse } from 'next/server';
import { executeQuery, BudgetPlan } from '@/lib/database';

// Add offline support headers
const addOfflineHeaders = (response: NextResponse) => {
  response.headers.set('Cache-Control', 'public, max-age=300, stale-while-revalidate=600');
  response.headers.set('X-Offline-Supported', 'true');
  return response;
};

// GET - Ambil budget plan berdasarkan ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!id || isNaN(Number(id))) {
      return NextResponse.json({ success: false, message: 'Invalid budget plan ID' }, { status: 400 });
    }

    const budgetPlans = await executeQuery<BudgetPlan>(
      'SELECT * FROM budget_plans WHERE id = ?',
      [id]
    );

    if (budgetPlans.length === 0) {
      return NextResponse.json({ success: false, message: 'Budget plan not found' }, { status: 404 });
    }

    const response = NextResponse.json({ success: true, data: budgetPlans[0] });
    return addOfflineHeaders(response);
  } catch (error) {
    console.error('Error fetching budget plan:', error);
    
    // Return error if database is not available
    if (error.message?.includes('ECONNREFUSED') || error.message?.includes('ER_ACCESS_DENIED')) {
      return NextResponse.json({ success: false, message: 'Database connection failed' }, { status: 503 });
    }

    return NextResponse.json({ success: false, message: 'Failed to fetch budget plan' }, { status: 500 });
  }
}

// PUT - Update budget plan
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const { name, monthly_budget, target_usage_kwh, start_date, end_date, description } = await request.json();

    if (!id || isNaN(Number(id))) {
      return NextResponse.json({ success: false, message: 'Invalid budget plan ID' }, { status: 400 });
    }

    if (!name || !monthly_budget || !target_usage_kwh || !start_date) {
      return NextResponse.json({ success: false, message: 'Missing required fields' }, { status: 400 });
    }

    // Validate budget amount
    if (monthly_budget <= 0) {
      return NextResponse.json({ success: false, message: 'Monthly budget must be greater than 0' }, { status: 400 });
    }

    // Validate target usage
    if (target_usage_kwh <= 0) {
      return NextResponse.json({ success: false, message: 'Target usage must be greater than 0' }, { status: 400 });
    }

    // Check if budget plan exists
    const existingPlans = await executeQuery<BudgetPlan>(
      'SELECT * FROM budget_plans WHERE id = ?',
      [id]
    );

    if (existingPlans.length === 0) {
      return NextResponse.json({ success: false, message: 'Budget plan not found' }, { status: 404 });
    }

    await executeQuery(`
      UPDATE budget_plans 
      SET name = ?, monthly_budget = ?, target_usage_kwh = ?, start_date = ?, end_date = ?, description = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [name, monthly_budget, target_usage_kwh, start_date, end_date || null, description || null, id]);

    return NextResponse.json({ 
      success: true, 
      message: 'Budget plan updated successfully'
    });
  } catch (error) {
    console.error('Error updating budget plan:', error);
    return NextResponse.json({ success: false, message: 'Failed to update budget plan' }, { status: 500 });
  }
}

// DELETE - Hapus budget plan
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!id || isNaN(Number(id))) {
      return NextResponse.json({ success: false, message: 'Invalid budget plan ID' }, { status: 400 });
    }

    // Check if budget plan exists
    const existingPlans = await executeQuery<BudgetPlan>(
      'SELECT * FROM budget_plans WHERE id = ?',
      [id]
    );

    if (existingPlans.length === 0) {
      return NextResponse.json({ success: false, message: 'Budget plan not found' }, { status: 404 });
    }

    // Delete budget plan (cascade will handle related records)
    await executeQuery('DELETE FROM budget_plans WHERE id = ?', [id]);

    return NextResponse.json({ 
      success: true, 
      message: 'Budget plan deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting budget plan:', error);
    return NextResponse.json({ success: false, message: 'Failed to delete budget plan' }, { status: 500 });
  }
}
