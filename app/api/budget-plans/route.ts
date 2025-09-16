import { NextRequest, NextResponse } from 'next/server';
import { executeQuery, executeTransaction, BudgetPlan } from '@/lib/database';

// Add offline support headers
const addOfflineHeaders = (response: NextResponse) => {
  response.headers.set('Cache-Control', 'public, max-age=300, stale-while-revalidate=600');
  response.headers.set('X-Offline-Supported', 'true');
  return response;
};

// GET - Ambil semua budget plans
export async function GET() {
  try {
    // Test database connection first
    await executeQuery('SELECT 1');
    
    const budgetPlans = await executeQuery<BudgetPlan>(`
      SELECT * FROM budget_plans 
      ORDER BY is_active DESC, created_at DESC
    `);
    
    const response = NextResponse.json({ success: true, data: budgetPlans });
    return addOfflineHeaders(response);
  } catch (error) {
    console.error('Error fetching budget plans:', error);
    
    // Return empty array if database is not available
    if (error.message?.includes('ECONNREFUSED') || error.message?.includes('ER_ACCESS_DENIED')) {
      const response = NextResponse.json({ success: true, data: [], message: 'Database connection failed, showing cached data if available.' });
      return addOfflineHeaders(response);
    }

    return NextResponse.json({ success: false, message: 'Failed to fetch budget plans' }, { status: 500 });
  }
}

// POST - Tambah budget plan baru
export async function POST(request: NextRequest) {
  try {
    const { name, monthly_budget, target_usage_kwh, start_date, end_date, description } = await request.json();

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

    const result = await executeQuery(`
      INSERT INTO budget_plans (name, monthly_budget, target_usage_kwh, start_date, end_date, description) 
      VALUES (?, ?, ?, ?, ?, ?)
    `, [name, monthly_budget, target_usage_kwh, start_date, end_date || null, description || null]);

    const budgetPlanId = (result as any).insertId;

    // Create default alerts for the new budget plan
    await executeQuery(`
      INSERT INTO budget_alerts (budget_plan_id, alert_type, threshold_percentage, message) VALUES
      (?, 'usage_warning', 80.00, 'Penggunaan listrik sudah mencapai 80% dari target bulanan'),
      (?, 'cost_warning', 80.00, 'Biaya listrik sudah mencapai 80% dari budget bulanan'),
      (?, 'budget_exceeded', 100.00, 'Budget listrik bulanan sudah terlampaui!')
    `, [budgetPlanId, budgetPlanId, budgetPlanId]);

    return NextResponse.json({ 
      success: true, 
      message: 'Budget plan created successfully',
      data: { id: budgetPlanId }
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating budget plan:', error);
    return NextResponse.json({ success: false, message: 'Failed to create budget plan' }, { status: 500 });
  }
}
