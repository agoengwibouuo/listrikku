import { NextRequest, NextResponse } from 'next/server';
import { executeQuery, executeTransaction, BudgetTracking, BudgetPlan } from '@/lib/database';

// Add offline support headers
const addOfflineHeaders = (response: NextResponse) => {
  response.headers.set('Cache-Control', 'public, max-age=300, stale-while-revalidate=600');
  response.headers.set('X-Offline-Supported', 'true');
  return response;
};

// GET - Ambil budget tracking data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const budgetPlanId = searchParams.get('budget_plan_id');
    const monthYear = searchParams.get('month_year');

    let query = `
      SELECT bt.*, bp.name as budget_plan_name, bp.monthly_budget, bp.target_usage_kwh
      FROM budget_tracking bt
      JOIN budget_plans bp ON bt.budget_plan_id = bp.id
    `;
    const params: any[] = [];

    if (budgetPlanId) {
      query += ' WHERE bt.budget_plan_id = ?';
      params.push(budgetPlanId);
    }

    if (monthYear) {
      query += budgetPlanId ? ' AND bt.month_year = ?' : ' WHERE bt.month_year = ?';
      params.push(monthYear);
    }

    query += ' ORDER BY bt.month_year DESC, bt.created_at DESC';

    const trackingData = await executeQuery<BudgetTracking & { budget_plan_name: string; monthly_budget: number; target_usage_kwh: number }>(query, params);
    
    const response = NextResponse.json({ success: true, data: trackingData });
    return addOfflineHeaders(response);
  } catch (error) {
    console.error('Error fetching budget tracking:', error);
    
    // Return empty array if database is not available
    if (error.message?.includes('ECONNREFUSED') || error.message?.includes('ER_ACCESS_DENIED')) {
      const response = NextResponse.json({ success: true, data: [], message: 'Database connection failed, showing cached data if available.' });
      return addOfflineHeaders(response);
    }

    return NextResponse.json({ success: false, message: 'Failed to fetch budget tracking' }, { status: 500 });
  }
}

// POST - Update budget tracking
export async function POST(request: NextRequest) {
  try {
    const { budget_plan_id, month_year, actual_usage_kwh, actual_cost, notes } = await request.json();

    if (!budget_plan_id || !month_year) {
      return NextResponse.json({ success: false, message: 'Missing required fields' }, { status: 400 });
    }

    // Get budget plan details
    const budgetPlan = await executeQuery<BudgetPlan>(
      'SELECT * FROM budget_plans WHERE id = ? AND is_active = TRUE',
      [budget_plan_id]
    );

    if (budgetPlan.length === 0) {
      return NextResponse.json({ success: false, message: 'Active budget plan not found' }, { status: 404 });
    }

    const plan = budgetPlan[0];
    const monthlyBudget = plan.monthly_budget;
    const targetUsage = plan.target_usage_kwh;

    // Calculate percentages and status
    const usagePercentage = targetUsage > 0 ? (actual_usage_kwh / targetUsage) * 100 : 0;
    const costPercentage = monthlyBudget > 0 ? (actual_cost / monthlyBudget) * 100 : 0;
    const budgetRemaining = monthlyBudget - actual_cost;

    let status: 'on_track' | 'over_budget' | 'under_budget' = 'on_track';
    if (costPercentage > 100) {
      status = 'over_budget';
    } else if (costPercentage < 80) {
      status = 'under_budget';
    }

    // Insert or update budget tracking
    await executeQuery(`
      INSERT INTO budget_tracking 
      (budget_plan_id, month_year, actual_usage_kwh, actual_cost, budget_remaining, usage_percentage, cost_percentage, status, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
      actual_usage_kwh = VALUES(actual_usage_kwh),
      actual_cost = VALUES(actual_cost),
      budget_remaining = VALUES(budget_remaining),
      usage_percentage = VALUES(usage_percentage),
      cost_percentage = VALUES(cost_percentage),
      status = VALUES(status),
      notes = VALUES(notes),
      updated_at = CURRENT_TIMESTAMP
    `, [budget_plan_id, month_year, actual_usage_kwh || 0, actual_cost || 0, budgetRemaining, usagePercentage, costPercentage, status, notes || null]);

    return NextResponse.json({ 
      success: true, 
      message: 'Budget tracking updated successfully'
    });
  } catch (error) {
    console.error('Error updating budget tracking:', error);
    return NextResponse.json({ success: false, message: 'Failed to update budget tracking' }, { status: 500 });
  }
}
