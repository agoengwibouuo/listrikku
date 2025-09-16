'use client';

import { useState } from 'react';
import { ArrowLeft, Database, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import MobileMenu from '../../components/MobileMenu';
import ClientOnly from '../../components/ClientOnly';
import Link from 'next/link';

interface DatabaseStatus {
  connected: boolean;
  message: string;
  error?: string;
}

export default function SetupPage() {
  const [dbStatus, setDbStatus] = useState<DatabaseStatus | null>(null);
  const [testing, setTesting] = useState(false);

  const testDatabaseConnection = async () => {
    setTesting(true);
    setDbStatus(null);

    try {
      const response = await fetch('/api/test-db');
      const data = await response.json();
      
      if (data.success) {
        setDbStatus({
          connected: true,
          message: 'Database connection successful!'
        });
      } else {
        setDbStatus({
          connected: false,
          message: 'Database connection failed',
          error: data.error
        });
      }
    } catch (error) {
      setDbStatus({
        connected: false,
        message: 'Failed to test database connection',
        error: error instanceof Error ? error.message : String(error)
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 pb-20 transition-colors duration-200">
      {/* Mobile Menu */}
      <ClientOnly>
        <MobileMenu />
      </ClientOnly>

      <div className="max-w-md mx-auto px-4 py-6 space-y-6">
        {/* Database Status */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Database className="w-6 h-6 text-primary-600" />
            <h2 className="text-lg font-semibold text-gray-900">Database Status</h2>
          </div>

          {dbStatus && (
            <div className={`p-4 rounded-lg mb-4 ${
              dbStatus.connected 
                ? 'bg-success-50 border border-success-200' 
                : 'bg-danger-50 border border-danger-200'
            }`}>
              <div className="flex items-center space-x-2">
                {dbStatus.connected ? (
                  <CheckCircle className="w-5 h-5 text-success-600" />
                ) : (
                  <XCircle className="w-5 h-5 text-danger-600" />
                )}
                <span className={`font-medium ${
                  dbStatus.connected ? 'text-success-800' : 'text-danger-800'
                }`}>
                  {dbStatus.message}
                </span>
              </div>
              {dbStatus.error && (
                <p className="text-sm text-danger-600 mt-2">{dbStatus.error}</p>
              )}
            </div>
          )}

          <button
            onClick={testDatabaseConnection}
            disabled={testing}
            className="w-full bg-primary-600 text-white py-3 rounded-lg font-medium disabled:bg-gray-300 flex items-center justify-center space-x-2"
          >
            {testing ? (
              <>
                <div className="loading-spinner w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                <span>Testing...</span>
              </>
            ) : (
              <>
                <Database size={20} />
                <span>Test Database Connection</span>
              </>
            )}
          </button>
        </div>

        {/* Setup Instructions */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Setup Instructions</h2>
          
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-sm font-semibold">
                1
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Install MySQL</h3>
                <p className="text-sm text-gray-600">
                  Pastikan MySQL server sudah terinstall dan berjalan
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-sm font-semibold">
                2
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Create Database</h3>
                <p className="text-sm text-gray-600">
                  Buat database dengan nama <code className="bg-gray-100 px-1 rounded">electricity_tracker</code>
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-sm font-semibold">
                3
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Import Schema</h3>
                <p className="text-sm text-gray-600">
                  Import file <code className="bg-gray-100 px-1 rounded">database/schema.sql</code> ke database
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-sm font-semibold">
                4
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Configure Environment</h3>
                <p className="text-sm text-gray-600">
                  Edit file <code className="bg-gray-100 px-1 rounded">.env.local</code> dengan kredensial database Anda
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Environment Configuration */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Environment Configuration</h2>
          
          <div className="bg-gray-50 rounded-lg p-4">
            <pre className="text-sm text-gray-700">
{`# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=electricity_tracker
DB_PORT=3306`}
            </pre>
          </div>
          
          <div className="mt-4 p-3 bg-warning-50 border border-warning-200 rounded-lg">
            <div className="flex items-start space-x-2">
              <AlertCircle className="w-5 h-5 text-warning-600 mt-0.5" />
              <div>
                <p className="text-sm text-warning-800">
                  <strong>Important:</strong> Ganti <code>your_mysql_password</code> dengan password MySQL Anda yang sebenarnya.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4">
          <Link href="/" className="block">
            <div className="bg-white rounded-xl p-4 shadow-sm card-hover">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                  <ArrowLeft className="w-5 h-5 text-primary-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Kembali</p>
                  <p className="text-sm text-gray-600">Ke dashboard</p>
                </div>
              </div>
            </div>
          </Link>

          <button
            onClick={testDatabaseConnection}
            className="bg-white rounded-xl p-4 shadow-sm card-hover"
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-success-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-success-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Test Lagi</p>
                <p className="text-sm text-gray-600">Cek koneksi</p>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
