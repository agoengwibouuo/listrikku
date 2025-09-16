// Service Worker registration and management
export class ServiceWorkerManager {
  private static registration: ServiceWorkerRegistration | null = null;
  private static isSupported = 'serviceWorker' in navigator;

  static async register(): Promise<ServiceWorkerRegistration | null> {
    if (!this.isSupported) {
      console.log('Service Worker not supported');
      return null;
    }

    try {
      console.log('Registering Service Worker...');
      
      this.registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });

      console.log('Service Worker registered successfully:', this.registration);

      // Handle updates
      this.registration.addEventListener('updatefound', () => {
        const newWorker = this.registration!.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              console.log('New Service Worker installed, update available');
              this.showUpdateNotification();
            }
          });
        }
      });

      return this.registration;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
      return null;
    }
  }

  static async unregister(): Promise<boolean> {
    if (!this.registration) {
      return false;
    }

    try {
      const result = await this.registration.unregister();
      console.log('Service Worker unregistered:', result);
      this.registration = null;
      return result;
    } catch (error) {
      console.error('Service Worker unregistration failed:', error);
      return false;
    }
  }

  static getRegistration(): ServiceWorkerRegistration | null {
    return this.registration;
  }

  static async update(): Promise<void> {
    if (!this.registration) {
      return;
    }

    try {
      await this.registration.update();
      console.log('Service Worker update triggered');
    } catch (error) {
      console.error('Service Worker update failed:', error);
    }
  }

  static async skipWaiting(): Promise<void> {
    if (!this.registration || !this.registration.waiting) {
      return;
    }

    try {
      this.registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      console.log('Service Worker skip waiting message sent');
    } catch (error) {
      console.error('Service Worker skip waiting failed:', error);
    }
  }

  static async getVersion(): Promise<string | null> {
    if (!this.registration || !this.registration.active) {
      return null;
    }

    return new Promise((resolve) => {
      const messageChannel = new MessageChannel();
      
      messageChannel.port1.onmessage = (event) => {
        resolve(event.data.version || null);
      };

      this.registration!.active!.postMessage(
        { type: 'GET_VERSION' },
        [messageChannel.port2]
      );

      // Timeout after 1 second
      setTimeout(() => resolve(null), 1000);
    });
  }

  static isUpdateAvailable(): boolean {
    return !!(this.registration && this.registration.waiting);
  }

  private static showUpdateNotification(): void {
    // You can customize this notification
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Update Available', {
        body: 'A new version of the app is available. Click to update.',
        icon: '/icon-192x192.png',
        tag: 'app-update'
      });
    }

    // Or show a custom notification in the app
    const event = new CustomEvent('sw-update-available');
    window.dispatchEvent(event);
  }

  static async requestNotificationPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      return 'denied';
    }

    if (Notification.permission === 'default') {
      return await Notification.requestPermission();
    }

    return Notification.permission;
  }
}

// PWA installation
export class PWAInstaller {
  private static deferredPrompt: any = null;
  private static isInstalled = false;

  static init(): void {
    // Listen for beforeinstallprompt event
    window.addEventListener('beforeinstallprompt', (e) => {
      console.log('PWA install prompt available');
      e.preventDefault();
      this.deferredPrompt = e;
      this.showInstallButton();
    });

    // Listen for appinstalled event
    window.addEventListener('appinstalled', () => {
      console.log('PWA installed successfully');
      this.isInstalled = true;
      this.hideInstallButton();
    });

    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      this.isInstalled = true;
    }
  }

  static async install(): Promise<boolean> {
    if (!this.deferredPrompt) {
      return false;
    }

    try {
      this.deferredPrompt.prompt();
      const { outcome } = await this.deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        console.log('PWA install accepted');
        this.isInstalled = true;
        this.hideInstallButton();
        return true;
      } else {
        console.log('PWA install dismissed');
        return false;
      }
    } catch (error) {
      console.error('PWA install failed:', error);
      return false;
    }
  }

  static canInstall(): boolean {
    return !!(this.deferredPrompt && !this.isInstalled);
  }

  static isPWAInstalled(): boolean {
    return this.isInstalled;
  }

  private static showInstallButton(): void {
    const event = new CustomEvent('pwa-install-available');
    window.dispatchEvent(event);
  }

  private static hideInstallButton(): void {
    const event = new CustomEvent('pwa-install-completed');
    window.dispatchEvent(event);
  }
}

// Cache management
export class CacheManager {
  static async clearAllCaches(): Promise<void> {
    if (!('caches' in window)) {
      return;
    }

    try {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
      );
      console.log('All caches cleared');
    } catch (error) {
      console.error('Failed to clear caches:', error);
    }
  }

  static async getCacheSize(): Promise<number> {
    if (!('caches' in window)) {
      return 0;
    }

    try {
      const cacheNames = await caches.keys();
      let totalSize = 0;

      for (const cacheName of cacheNames) {
        const cache = await caches.open(cacheName);
        const keys = await cache.keys();
        
        for (const request of keys) {
          const response = await cache.match(request);
          if (response) {
            const blob = await response.blob();
            totalSize += blob.size;
          }
        }
      }

      return totalSize;
    } catch (error) {
      console.error('Failed to calculate cache size:', error);
      return 0;
    }
  }

  static async getCacheInfo(): Promise<{ name: string; size: number; keys: number }[]> {
    if (!('caches' in window)) {
      return [];
    }

    try {
      const cacheNames = await caches.keys();
      const cacheInfo = [];

      for (const cacheName of cacheNames) {
        const cache = await caches.open(cacheName);
        const keys = await cache.keys();
        let size = 0;

        for (const request of keys) {
          const response = await cache.match(request);
          if (response) {
            const blob = await response.blob();
            size += blob.size;
          }
        }

        cacheInfo.push({
          name: cacheName,
          size,
          keys: keys.length
        });
      }

      return cacheInfo;
    } catch (error) {
      console.error('Failed to get cache info:', error);
      return [];
    }
  }
}
