'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  Shield, 
  Edit3, 
  Save, 
  X, 
  Eye, 
  EyeOff,
  Settings,
  Bell,
  Globe,
  Palette,
  AlertCircle,
  CheckCircle,
  Camera,
  Upload
} from 'lucide-react';
import Link from 'next/link';
import MobileMenu from '../../components/MobileMenu';
import ClientOnly from '../../components/ClientOnly';
import { useAuth } from '../../contexts/AuthContext';

interface UserProfile {
  id: number;
  email: string;
  full_name: string;
  phone?: string;
  avatar_url?: string;
  role: string;
  is_active: boolean;
  email_verified: boolean;
  last_login?: string;
  created_at: string;
}

interface UserPreferences {
  id: number;
  user_id: number;
  theme: 'light' | 'dark' | 'system';
  language: string;
  currency: string;
  timezone: string;
  notifications_enabled: boolean;
  email_notifications: boolean;
  push_notifications: boolean;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Edit states
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [isEditingPreferences, setIsEditingPreferences] = useState(false);
  
  // Form states
  const [profileForm, setProfileForm] = useState({
    full_name: '',
    phone: '',
    avatar_url: ''
  });
  
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [preferencesForm, setPreferencesForm] = useState({
    theme: 'system' as 'light' | 'dark' | 'system',
    language: 'id',
    currency: 'IDR',
    timezone: 'Asia/Jakarta',
    notifications_enabled: true,
    email_notifications: true,
    push_notifications: true
  });
  
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  const { user, updateUser } = useAuth();
  const router = useRouter();

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  // Fetch profile data
  useEffect(() => {
    if (user) {
      fetchProfileData();
    }
  }, [user]);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      
      // Fetch profile
      const profileResponse = await fetch('/api/user/profile', {
        credentials: 'include'
      });
      const profileData = await profileResponse.json();
      
      if (profileData.success) {
        setProfile(profileData.user);
        setProfileForm({
          full_name: profileData.user.full_name,
          phone: profileData.user.phone || '',
          avatar_url: profileData.user.avatar_url || ''
        });
      }
      
      // Fetch preferences
      const preferencesResponse = await fetch('/api/user/preferences', {
        credentials: 'include'
      });
      const preferencesData = await preferencesResponse.json();
      
      if (preferencesData.success) {
        setPreferences(preferencesData.preferences);
        setPreferencesForm({
          theme: preferencesData.preferences.theme,
          language: preferencesData.preferences.language,
          currency: preferencesData.preferences.currency,
          timezone: preferencesData.preferences.timezone,
          notifications_enabled: preferencesData.preferences.notifications_enabled,
          email_notifications: preferencesData.preferences.email_notifications,
          push_notifications: preferencesData.preferences.push_notifications
        });
      }
      
    } catch (error) {
      console.error('Error fetching profile data:', error);
      setError('Gagal mengambil data profile');
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async () => {
    try {
      setSaving(true);
      setError('');
      setSuccess('');

      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(profileForm),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess('Profile berhasil diperbarui');
        setIsEditingProfile(false);
        await fetchProfileData();
        // Update auth context
        if (user) {
          updateUser({ full_name: profileForm.full_name });
        }
      } else {
        setError(data.message || 'Gagal memperbarui profile');
      }
    } catch (error) {
      setError('Terjadi kesalahan saat memperbarui profile');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError('Password baru dan konfirmasi password tidak sama');
      return;
    }

    try {
      setSaving(true);
      setError('');
      setSuccess('');

      const response = await fetch('/api/user/change-password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess('Password berhasil diubah');
        setIsEditingPassword(false);
        setPasswordForm({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      } else {
        setError(data.message || 'Gagal mengubah password');
      }
    } catch (error) {
      setError('Terjadi kesalahan saat mengubah password');
    } finally {
      setSaving(false);
    }
  };

  const handlePreferencesUpdate = async () => {
    try {
      setSaving(true);
      setError('');
      setSuccess('');

      const response = await fetch('/api/user/preferences', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(preferencesForm),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess('Preferensi berhasil diperbarui');
        setIsEditingPreferences(false);
        await fetchProfileData();
      } else {
        setError(data.message || 'Gagal memperbarui preferensi');
      }
    } catch (error) {
      setError('Terjadi kesalahan saat memperbarui preferensi');
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
                  <div className="h-3 bg-gray-100 dark:bg-gray-600 rounded w-1/2 mb-4"></div>
                  <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2"></div>
                  <div className="h-2 bg-gray-100 dark:bg-gray-600 rounded w-5/6"></div>
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
              className="touch-button bg-gray-100/80 dark:bg-gray-800/80 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-xl"
            >
              <ArrowLeft size={20} />
            </Link>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Profile</h1>
          </div>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="flex items-center space-x-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl mb-4">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
          </div>
        )}

        {success && (
          <div className="flex items-center space-x-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl mb-4">
            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
            <p className="text-sm text-green-700 dark:text-green-400">{success}</p>
          </div>
        )}

        {/* Profile Information */}
        {profile && (
          <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl shadow-sm border border-white/20 dark:border-gray-700/20 p-6 mb-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Informasi Profile</h2>
              <button
                onClick={() => setIsEditingProfile(!isEditingProfile)}
                className="touch-button bg-blue-500 hover:bg-blue-600 text-white rounded-xl"
              >
                {isEditingProfile ? <X size={16} /> : <Edit3 size={16} />}
              </button>
            </div>

            {isEditingProfile ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nama Lengkap
                  </label>
                  <input
                    type="text"
                    value={profileForm.full_name}
                    onChange={(e) => setProfileForm({ ...profileForm, full_name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nomor Telepon
                  </label>
                  <input
                    type="tel"
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={handleProfileUpdate}
                    disabled={saving}
                    className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-xl font-medium disabled:opacity-50"
                  >
                    {saving ? 'Menyimpan...' : 'Simpan'}
                  </button>
                  <button
                    onClick={() => setIsEditingProfile(false)}
                    className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded-xl font-medium"
                  >
                    Batal
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">{profile.full_name}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{profile.email}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                    <Mail className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Email</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{profile.email}</p>
                    </div>
                  </div>

                  {profile.phone && (
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                      <Phone className="w-5 h-5 text-gray-500" />
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Telepon</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{profile.phone}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                    <Calendar className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Bergabung</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{formatDate(profile.created_at)}</p>
                    </div>
                  </div>

                  {profile.last_login && (
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                      <Shield className="w-5 h-5 text-gray-500" />
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Login Terakhir</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{formatDate(profile.last_login)}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Change Password */}
        <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl shadow-sm border border-white/20 dark:border-gray-700/20 p-6 mb-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Ubah Password</h2>
            <button
              onClick={() => setIsEditingPassword(!isEditingPassword)}
              className="touch-button bg-blue-500 hover:bg-blue-600 text-white rounded-xl"
            >
              {isEditingPassword ? <X size={16} /> : <Edit3 size={16} />}
            </button>
          </div>

          {isEditingPassword ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Password Saat Ini
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.current ? 'text' : 'password'}
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                    className="w-full px-4 py-3 pr-12 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPasswords.current ? <EyeOff className="w-5 h-5 text-gray-400" /> : <Eye className="w-5 h-5 text-gray-400" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Password Baru
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.new ? 'text' : 'password'}
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    className="w-full px-4 py-3 pr-12 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPasswords.new ? <EyeOff className="w-5 h-5 text-gray-400" /> : <Eye className="w-5 h-5 text-gray-400" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Konfirmasi Password Baru
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.confirm ? 'text' : 'password'}
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                    className="w-full px-4 py-3 pr-12 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPasswords.confirm ? <EyeOff className="w-5 h-5 text-gray-400" /> : <Eye className="w-5 h-5 text-gray-400" />}
                  </button>
                </div>
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={handlePasswordChange}
                  disabled={saving}
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-xl font-medium disabled:opacity-50"
                >
                  {saving ? 'Menyimpan...' : 'Simpan'}
                </button>
                <button
                  onClick={() => setIsEditingPassword(false)}
                  className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded-xl font-medium"
                >
                  Batal
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-4">
              <Shield className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Klik tombol edit untuk mengubah password
              </p>
            </div>
          )}
        </div>

        {/* User Preferences */}
        {preferences && (
          <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl shadow-sm border border-white/20 dark:border-gray-700/20 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Preferensi</h2>
              <button
                onClick={() => setIsEditingPreferences(!isEditingPreferences)}
                className="touch-button bg-blue-500 hover:bg-blue-600 text-white rounded-xl"
              >
                {isEditingPreferences ? <X size={16} /> : <Settings size={16} />}
              </button>
            </div>

            {isEditingPreferences ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tema
                  </label>
                  <select
                    value={preferencesForm.theme}
                    onChange={(e) => setPreferencesForm({ ...preferencesForm, theme: e.target.value as 'light' | 'dark' | 'system' })}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  >
                    <option value="system">Sistem</option>
                    <option value="light">Terang</option>
                    <option value="dark">Gelap</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Bahasa
                  </label>
                  <select
                    value={preferencesForm.language}
                    onChange={(e) => setPreferencesForm({ ...preferencesForm, language: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  >
                    <option value="id">Indonesia</option>
                    <option value="en">English</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Mata Uang
                  </label>
                  <select
                    value={preferencesForm.currency}
                    onChange={(e) => setPreferencesForm({ ...preferencesForm, currency: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  >
                    <option value="IDR">Rupiah (IDR)</option>
                    <option value="USD">US Dollar (USD)</option>
                  </select>
                </div>

                <div className="space-y-3">
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Notifikasi</h3>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Notifikasi Aktif</span>
                    <input
                      type="checkbox"
                      checked={preferencesForm.notifications_enabled}
                      onChange={(e) => setPreferencesForm({ ...preferencesForm, notifications_enabled: e.target.checked })}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Email Notifikasi</span>
                    <input
                      type="checkbox"
                      checked={preferencesForm.email_notifications}
                      onChange={(e) => setPreferencesForm({ ...preferencesForm, email_notifications: e.target.checked })}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Push Notifikasi</span>
                    <input
                      type="checkbox"
                      checked={preferencesForm.push_notifications}
                      onChange={(e) => setPreferencesForm({ ...preferencesForm, push_notifications: e.target.checked })}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                    />
                  </div>
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={handlePreferencesUpdate}
                    disabled={saving}
                    className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-xl font-medium disabled:opacity-50"
                  >
                    {saving ? 'Menyimpan...' : 'Simpan'}
                  </button>
                  <button
                    onClick={() => setIsEditingPreferences(false)}
                    className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded-xl font-medium"
                  >
                    Batal
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                  <div className="flex items-center space-x-3">
                    <Palette className="w-5 h-5 text-gray-500" />
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Tema</span>
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-400 capitalize">{preferences.theme}</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                  <div className="flex items-center space-x-3">
                    <Globe className="w-5 h-5 text-gray-500" />
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Bahasa</span>
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">{preferences.language === 'id' ? 'Indonesia' : 'English'}</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                  <div className="flex items-center space-x-3">
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Mata Uang</span>
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">{preferences.currency}</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                  <div className="flex items-center space-x-3">
                    <Bell className="w-5 h-5 text-gray-500" />
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Notifikasi</span>
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {preferences.notifications_enabled ? 'Aktif' : 'Nonaktif'}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
