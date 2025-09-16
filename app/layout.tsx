import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import StatusBar from '../components/StatusBar'
import ClientOnly from '../components/ClientOnly'
import ErrorBoundary from '../components/ErrorBoundary'
import { ThemeProvider } from '../contexts/ThemeContext'
import { AuthProvider } from '../contexts/AuthContext'
import OfflineStatus from '../components/OfflineStatus'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'ListrikKu',
  description: 'Aplikasi pencatatan penggunaan listrik untuk rumah',
  manifest: '/site.webmanifest',
  themeColor: '#3b82f6',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'ListrikKu',
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: 'website',
    siteName: 'ListrikKu',
    title: 'ListrikKu',
    description: 'Aplikasi pencatatan penggunaan listrik untuk rumah',
  },
  icons: {
    icon: [
      { url: '/favicon-96x96.png', sizes: '96x96', type: 'image/png' },
      { url: '/favicon.svg', type: 'image/svg+xml' }
    ],
    shortcut: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
}

export const viewport: Viewport = {
  themeColor: '#3b82f6',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id">
      <head>
            <meta name="application-name" content="ListrikKu" />
            <meta name="apple-mobile-web-app-capable" content="yes" />
            <meta name="apple-mobile-web-app-status-bar-style" content="default" />
            <meta name="apple-mobile-web-app-title" content="ListrikKu" />
            <meta name="format-detection" content="telephone=no" />
            <meta name="mobile-web-app-capable" content="yes" />
            <meta name="msapplication-config" content="/browserconfig.xml" />
            <meta name="msapplication-TileColor" content="#3b82f6" />
            <meta name="msapplication-tap-highlight" content="no" />
            <link rel="icon" type="image/png" href="/favicon-96x96.png" sizes="96x96" />
            <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
            <link rel="shortcut icon" href="/favicon.ico" />
            <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
            <link rel="manifest" href="/site.webmanifest" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const savedTheme = localStorage.getItem('theme');
                const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                const shouldBeDark = savedTheme === 'dark' || (!savedTheme && systemPrefersDark);
                
                if (shouldBeDark) {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.add('light');
                }
              } catch (e) {
                console.warn('Failed to apply theme:', e);
              }
            `,
          }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Service Worker Registration
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', async () => {
                  try {
                    const registration = await navigator.serviceWorker.register('/sw.js');
                    console.log('Service Worker registered:', registration);
                  } catch (error) {
                    console.error('Service Worker registration failed:', error);
                  }
                });
              }
            `,
          }}
        />
      </head>
          <body className={`${inter.className} bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors duration-200`}>
            <ThemeProvider>
              <AuthProvider>
                <ErrorBoundary>
                  <ClientOnly>
                    <StatusBar />
                    <OfflineStatus />
                  </ClientOnly>
                  <div className="pwa-safe-area">
                    {children}
                  </div>
                </ErrorBoundary>
              </AuthProvider>
            </ThemeProvider>
          </body>
    </html>
  )
}
