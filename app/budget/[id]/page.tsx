'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  Target, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle,
  DollarSign,
  Zap,
  Calendar,
  BarChart3,
  Settings,
  Plus
} from 'lucide-react';
import Link from 'next/link';
import MobileMenu from '../../../components/MobileMenu';
import ClientOnly from '../../../components/ClientOnly';
import { BudgetPlan, BudgetTracking } from '@/lib/database';
import BudgetVsActualChart from '../../../components/charts/BudgetVsActualChart';

interface BudgetPlanWithTracking extends BudgetPlan {
  current_month_tracking?: BudgetTracking;
  monthly_tracking?: BudgetTracking[];
  alerts?: any[];
}

export default function BudgetDetailPage() {
  const router = useRouter();
  const params = useParams();
  const budgetId = params.id as string;
  
  const [loading, setLoading] = useState(true);
  const [budgetPlan, setBudgetPlan] = useState<BudgetPlanWithTracking | null>(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    monthly_budget: '',
    target_usage_kwh: '',
    start_date: '',
    end_date: '',
    description: ''
  });

  useEffect(() => {
    if (budgetId) {
      fetchBudgetPlan();
    }
  }, [budgetId]);

  const fetchBudgetPlan = async () => {
    try {
      setLoading(true);
      
      // Fetch budget plan with cache busting
      const planResponse = await fetch(`/api/budget-plans/${budgetId}?t=${Date.now()}`);
      const planResult = await planResponse.json();
      
      if (planResult.success) {
        const plan = planResult.data;
        setBudgetPlan(plan);
        setFormData({
          name: plan.name,
          monthly_budget: plan.monthly_budget.toString(),
          target_usage_kwh: plan.target_usage_kwh.toString(),
          start_date: plan.start_date,
          end_date: plan.end_date || '',
          description: plan.description || ''
        });

        // Fetch current month tracking
        const currentMonth = new Date().toISOString().slice(0, 7);
        const trackingResponse = await fetch(`/api/budget-tracking?budget_plan_id=${budgetId}&month_year=${currentMonth}`);
        const trackingResult = await trackingResponse.json();
        
        if (trackingResult.success && trackingResult.data.length > 0) {
          setBudgetPlan(prev => ({
            ...prev!,
            current_month_tracking: trackingResult.data[0]
          }));
        }

        // Fetch monthly tracking history
        const historyResponse = await fetch(`/api/budget-tracking?budget_plan_id=${budgetId}`);
        const historyResult = await historyResponse.json();
        
        if (historyResult.success) {
          setBudgetPlan(prev => ({
            ...prev!,
            monthly_tracking: historyResult.data
          }));
        }
      }
    } catch (error) {
      console.error('Error fetching budget plan:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.monthly_budget || !formData.target_usage_kwh || !formData.start_date) {
      alert('Mohon isi semua field yang wajib diisi');
      return;
    }

    try {
      setUpdating(true);
      const response = await fetch(`/api/budget-plans/${budgetId}`, {
        method: 'PUT',
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
        setShowEditForm(false);
        // Force refresh data
        await fetchBudgetPlan();
        // Also refresh the main budget page if user navigates back
        if (typeof window !== 'undefined') {
          // Trigger a custom event to refresh parent page
          window.dispatchEvent(new CustomEvent('budgetPlanUpdated', { 
            detail: { budgetId, updatedData: formData } 
          }));
        }
        // Show success message
        alert('Budget plan berhasil diupdate!');
      } else {
        alert(result.message || 'Gagal mengupdate budget plan');
      }
    } catch (error) {
      console.error('Error updating budget plan:', error);
      alert('Terjadi kesalahan saat mengupdate budget plan');
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/budget-plans/${budgetId}`, {
        method: 'DELETE',
      });

      const result = await response.json();
      
      if (result.success) {
        router.push('/budget');
      } else {
        alert(result.message || 'Gagal menghapus budget plan');
      }
    } catch (error) {
      console.error('Error deleting budget plan:', error);
      alert('Terjadi kesalahan saat menghapus budget plan');
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
        
        <div className="max-w-md mx-auto px-4 pt-20 pb-4">
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

  if (!budgetPlan) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 pb-20 transition-colors duration-200">
        <ClientOnly>
          <MobileMenu />
        </ClientOnly>
        
        <div className="max-w-md mx-auto px-4 py-8">
          <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl shadow-sm border border-white/20 dark:border-gray-700/20 p-8 text-center">
            <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Budget Plan Tidak Ditemukan</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">Budget plan yang Anda cari tidak ditemukan atau telah dihapus</p>
            <Link
              href="/budget"
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-xl transition-colors"
            >
              Kembali ke Budget Plans
            </Link>
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
              href="/budget"
              className="w-10 h-10 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-sm border border-white/20 dark:border-gray-700/20"
            >
              <ArrowLeft size={20} className="text-gray-700 dark:text-gray-300" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">{budgetPlan.name}</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">Detail Budget Plan</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowEditForm(true)}
              className="w-10 h-10 bg-blue-500 hover:bg-blue-600 text-white rounded-xl flex items-center justify-center transition-colors shadow-sm"
            >
              <Edit size={20} />
            </button>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="w-10 h-10 bg-red-500 hover:bg-red-600 text-white rounded-xl flex items-center justify-center transition-colors shadow-sm"
            >
              <Trash2 size={20} />
            </button>
          </div>
        </div>

        {/* Budget Plan Info */}
        <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl shadow-sm border border-white/20 dark:border-gray-700/20 p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{budgetPlan.name}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{budgetPlan.description}</p>
            </div>
            <div className={`flex items-center space-x-1 ${getStatusColor(budgetPlan.current_month_tracking?.status || 'on_track')}`}>
              {getStatusIcon(budgetPlan.current_month_tracking?.status || 'on_track')}
              <span className="text-xs font-medium">{getStatusText(budgetPlan.current_month_tracking?.status || 'on_track')}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3">
              <div className="flex items-center space-x-2 mb-1">
                <DollarSign className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Budget Bulanan</span>
              </div>
              <p className="text-lg font-bold text-gray-900 dark:text-gray-100">{formatCurrency(budgetPlan.monthly_budget)}</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3">
              <div className="flex items-center space-x-2 mb-1">
                <Zap className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Target kWh</span>
              </div>
              <p className="text-lg font-bold text-gray-900 dark:text-gray-100">{budgetPlan.target_usage_kwh} kWh</p>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4" />
              <span>Mulai: {new Date(budgetPlan.start_date).toLocaleDateString('id-ID')}</span>
            </div>
            {budgetPlan.end_date && (
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4" />
                <span>Berakhir: {new Date(budgetPlan.end_date).toLocaleDateString('id-ID')}</span>
              </div>
            )}
          </div>
        </div>

        {/* Current Month Tracking */}
        {budgetPlan.current_month_tracking && (
          <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl shadow-sm border border-white/20 dark:border-gray-700/20 p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Tracking Bulan Ini</h3>
            
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Penggunaan</span>
                  <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    {budgetPlan.current_month_tracking.actual_usage_kwh} kWh
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(budgetPlan.current_month_tracking.usage_percentage, 100)}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {budgetPlan.current_month_tracking.usage_percentage.toFixed(1)}% dari target
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Biaya</span>
                  <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    {formatCurrency(budgetPlan.current_month_tracking.actual_cost)}
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(budgetPlan.current_month_tracking.cost_percentage, 100)}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {budgetPlan.current_month_tracking.cost_percentage.toFixed(1)}% dari budget
                </p>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Sisa Budget</span>
                  <span className={`text-sm font-semibold ${budgetPlan.current_month_tracking.budget_remaining >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    {formatCurrency(budgetPlan.current_month_tracking.budget_remaining)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Budget vs Actual Chart */}
        {budgetPlan.monthly_tracking && budgetPlan.monthly_tracking.length > 0 && (
          <BudgetVsActualChart 
            data={budgetPlan.monthly_tracking.map(tracking => ({
              month: tracking.month_year,
              budget: budgetPlan.monthly_budget,
              actual: tracking.actual_cost,
              usage_budget: budgetPlan.target_usage_kwh,
              usage_actual: tracking.actual_usage_kwh,
              status: tracking.status
            }))}
            height={300}
          />
        )}

        {/* Monthly History */}
        {budgetPlan.monthly_tracking && budgetPlan.monthly_tracking.length > 0 && (
          <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl shadow-sm border border-white/20 dark:border-gray-700/20 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Riwayat Bulanan</h3>
            
            <div className="space-y-3">
              {budgetPlan.monthly_tracking.slice(0, 6).map((tracking) => (
                <div key={tracking.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {new Date(tracking.month_year + '-01').toLocaleDateString('id-ID', { year: 'numeric', month: 'long' })}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {tracking.actual_usage_kwh} kWh • {formatCurrency(tracking.actual_cost)}
                    </p>
                  </div>
                  <div className={`flex items-center space-x-1 ${getStatusColor(tracking.status)}`}>
                    {getStatusIcon(tracking.status)}
                    <span className="text-xs font-medium">{getStatusText(tracking.status)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Edit Form Modal */}
        {showEditForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowEditForm(false)}></div>
            <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6">Edit Budget Plan</h2>
              
              <form onSubmit={handleUpdate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nama Budget Plan *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowEditForm(false)}
                    className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={updating}
                    className="flex-1 px-4 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white rounded-xl transition-colors flex items-center justify-center space-x-2"
                  >
                    {updating ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Updating...</span>
                      </>
                    ) : (
                      <span>Update Budget Plan</span>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowDeleteConfirm(false)}></div>
            <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">Hapus Budget Plan</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Apakah Anda yakin ingin menghapus budget plan "{budgetPlan.name}"? 
                Tindakan ini tidak dapat dibatalkan dan akan menghapus semua data tracking terkait.
              </p>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Batal
                </button>
                <button
                  onClick={handleDelete}
                  className="flex-1 px-4 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl transition-colors"
                >
                  Hapus
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
