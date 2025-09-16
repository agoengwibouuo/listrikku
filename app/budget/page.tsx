'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Plus, 
  Target, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle,
  DollarSign,
  Zap,
  Calendar,
  Settings,
  BarChart3
} from 'lucide-react';
import Link from 'next/link';
import MobileMenu from '../../components/MobileMenu';
import ClientOnly from '../../components/ClientOnly';
import { BudgetPlan, BudgetTracking } from '@/lib/database';

interface BudgetPlanWithTracking extends BudgetPlan {
  current_month_tracking?: BudgetTracking;
  monthly_average_cost?: number;
  monthly_average_usage?: number;
}

export default function BudgetPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [budgetPlans, setBudgetPlans] = useState<BudgetPlanWithTracking[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    monthly_budget: '',
    target_usage_kwh: '',
    start_date: new Date().toISOString().split('T')[0],
    end_date: '',
    description: ''
  });

  useEffect(() => {
    fetchBudgetPlans();
    
    // Listen for budget plan updates from detail page
    const handleBudgetPlanUpdate = () => {
      fetchBudgetPlans();
    };
    
    window.addEventListener('budgetPlanUpdated', handleBudgetPlanUpdate);
    
    return () => {
      window.removeEventListener('budgetPlanUpdated', handleBudgetPlanUpdate);
    };
  }, []);

  const fetchBudgetPlans = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/budget-plans?t=${Date.now()}`);
      const result = await response.json();
      
      if (result.success) {
        const plans = result.data;
        
        // Fetch current month tracking for each plan
        const plansWithTracking = await Promise.all(
          plans.map(async (plan: BudgetPlan) => {
            const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
            const trackingResponse = await fetch(`/api/budget-tracking?budget_plan_id=${plan.id}&month_year=${currentMonth}`);
            const trackingResult = await trackingResponse.json();
            
            return {
              ...plan,
              current_month_tracking: trackingResult.success && trackingResult.data.length > 0 ? trackingResult.data[0] : null
            };
          })
        );
        
        setBudgetPlans(plansWithTracking);
      }
    } catch (error) {
      console.error('Error fetching budget plans:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.monthly_budget || !formData.target_usage_kwh || !formData.start_date) {
      alert('Mohon isi semua field yang wajib diisi');
      return;
    }

    try {
      const response = await fetch('/api/budget-plans', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          monthly_budget: parseFloat(formData.monthly_budget),
          target_usage_kwh: parseInt(formData.target_usage_kwh),
          end_date: formData.end_date || null
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        setShowCreateForm(false);
        setFormData({
          name: '',
          monthly_budget: '',
          target_usage_kwh: '',
          start_date: new Date().toISOString().split('T')[0],
          end_date: '',
          description: ''
        });
        fetchBudgetPlans();
      } else {
        alert(result.message || 'Gagal membuat budget plan');
      }
    } catch (error) {
      console.error('Error creating budget plan:', error);
      alert('Terjadi kesalahan saat membuat budget plan');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'on_track': return 'text-green-600 dark:text-green-400';
      case 'over_budget': return 'text-red-600 dark:text-red-400';
      case 'under_budget': return 'text-blue-600 dark:text-blue-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'on_track': return <CheckCircle className="w-4 h-4" />;
      case 'over_budget': return <AlertTriangle className="w-4 h-4" />;
      case 'under_budget': return <TrendingUp className="w-4 h-4" />;
      default: return <Target className="w-4 h-4" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'on_track': return 'On Track';
      case 'over_budget': return 'Over Budget';
      case 'under_budget': return 'Under Budget';
      default: return 'Unknown';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 pb-20 transition-colors duration-200">
        <ClientOnly>
          <MobileMenu />
        </ClientOnly>
        
        <div className="max-w-md mx-auto px-4 py-8">
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl shadow-sm border border-white/20 dark:border-gray-700/20 p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 pb-20 transition-colors duration-200">
      <ClientOnly>
        <MobileMenu />
      </ClientOnly>

      <div className="max-w-md mx-auto px-4 pt-20 pb-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Link
              href="/"
              className="w-10 h-10 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-sm border border-white/20 dark:border-gray-700/20"
            >
              <ArrowLeft size={20} className="text-gray-700 dark:text-gray-300" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Budget Planning</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">Kelola anggaran listrik</p>
            </div>
          </div>
          <button
            onClick={() => setShowCreateForm(true)}
            className="w-10 h-10 bg-blue-500 hover:bg-blue-600 text-white rounded-xl flex items-center justify-center transition-colors shadow-sm"
          >
            <Plus size={20} />
          </button>
        </div>

        {/* Budget Plans */}
        <div className="space-y-4">
          {budgetPlans.length === 0 ? (
            <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl shadow-sm border border-white/20 dark:border-gray-700/20 p-8 text-center">
              <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Belum Ada Budget Plan</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">Buat budget plan pertama Anda untuk mengelola anggaran listrik</p>
              <button
                onClick={() => setShowCreateForm(true)}
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-xl transition-colors"
              >
                Buat Budget Plan
              </button>
            </div>
          ) : (
            budgetPlans.map((plan) => (
              <div key={plan.id} className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl shadow-sm border border-white/20 dark:border-gray-700/20 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{plan.name}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{plan.description}</p>
                  </div>
                  <div className={`flex items-center space-x-1 ${getStatusColor(plan.current_month_tracking?.status || 'on_track')}`}>
                    {getStatusIcon(plan.current_month_tracking?.status || 'on_track')}
                    <span className="text-xs font-medium">{getStatusText(plan.current_month_tracking?.status || 'on_track')}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3">
                    <div className="flex items-center space-x-2 mb-1">
                      <DollarSign className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                      <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Budget Bulanan</span>
                    </div>
                    <p className="text-lg font-bold text-gray-900 dark:text-gray-100">{formatCurrency(plan.monthly_budget)}</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3">
                    <div className="flex items-center space-x-2 mb-1">
                      <Zap className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                      <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Target kWh</span>
                    </div>
                    <p className="text-lg font-bold text-gray-900 dark:text-gray-100">{plan.target_usage_kwh} kWh</p>
                  </div>
                </div>

                {plan.current_month_tracking && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Penggunaan Bulan Ini</span>
                      <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                        {plan.current_month_tracking.actual_usage_kwh} kWh
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(plan.current_month_tracking.usage_percentage, 100)}%` }}
                      ></div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Biaya Bulan Ini</span>
                      <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                        {formatCurrency(plan.current_month_tracking.actual_cost)}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(plan.current_month_tracking.cost_percentage, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(plan.start_date).toLocaleDateString('id-ID')}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Link
                      href={`/budget/${plan.id}`}
                      className="text-blue-500 hover:text-blue-600 text-sm font-medium"
                    >
                      Detail
                    </Link>
                    <Link
                      href={`/budget/${plan.id}`}
                      className="text-gray-500 hover:text-gray-600"
                    >
                      <Settings className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Create Form Modal */}
        {showCreateForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowCreateForm(false)}></div>
            <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6">Buat Budget Plan</h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nama Budget Plan *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Contoh: Budget Listrik Rumah"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Budget Bulanan (Rp) *
                  </label>
                  <input
                    type="number"
                    value={formData.monthly_budget}
                    onChange={(e) => setFormData({ ...formData, monthly_budget: e.target.value })}
                    placeholder="500000"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    required
                    min="1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Target Penggunaan (kWh) *
                  </label>
                  <input
                    type="number"
                    value={formData.target_usage_kwh}
                    onChange={(e) => setFormData({ ...formData, target_usage_kwh: e.target.value })}
                    placeholder="200"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    required
                    min="1"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Tanggal Mulai *
                    </label>
                    <input
                      type="date"
                      value={formData.start_date}
                      onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Tanggal Berakhir
                    </label>
                    <input
                      type="date"
                      value={formData.end_date}
                      onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Deskripsi
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Deskripsi budget plan..."
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition-colors"
                  >
                    Buat Budget Plan
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
