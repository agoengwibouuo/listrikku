// Offline data storage using IndexedDB
const DB_NAME = 'ElectricityTrackerOffline';
const DB_VERSION = 1;
const STORE_NAME = 'offlineData';

interface OfflineData {
  id: string;
  url: string;
  method: string;
  headers: Record<string, string>;
  body: string | null;
  timestamp: number;
  retryCount: number;
}

class OfflineStorage {
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        console.error('Failed to open IndexedDB');
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        console.log('IndexedDB opened successfully');
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
          store.createIndex('timestamp', 'timestamp', { unique: false });
          store.createIndex('url', 'url', { unique: false });
        }
      };
    });
  }

  async storeOfflineData(data: Omit<OfflineData, 'id' | 'timestamp' | 'retryCount'>): Promise<string> {
    if (!this.db) {
      await this.init();
    }

    const offlineData: OfflineData = {
      ...data,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      retryCount: 0
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.add(offlineData);

      request.onsuccess = () => {
        console.log('Offline data stored:', offlineData.id);
        resolve(offlineData.id);
      };

      request.onerror = () => {
        console.error('Failed to store offline data');
        reject(request.error);
      };
    });
  }

  async getOfflineData(): Promise<OfflineData[]> {
    if (!this.db) {
      await this.init();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        console.error('Failed to get offline data');
        reject(request.error);
      };
    });
  }

  async removeOfflineData(id: string): Promise<void> {
    if (!this.db) {
      await this.init();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(id);

      request.onsuccess = () => {
        console.log('Offline data removed:', id);
        resolve();
      };

      request.onerror = () => {
        console.error('Failed to remove offline data');
        reject(request.error);
      };
    });
  }

  async clearOfflineData(): Promise<void> {
    if (!this.db) {
      await this.init();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.clear();

      request.onsuccess = () => {
        console.log('All offline data cleared');
        resolve();
      };

      request.onerror = () => {
        console.error('Failed to clear offline data');
        reject(request.error);
      };
    });
  }

  async getOfflineDataCount(): Promise<number> {
    if (!this.db) {
      await this.init();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.count();

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        console.error('Failed to get offline data count');
        reject(request.error);
      };
    });
  }
}

export const offlineStorage = new OfflineStorage();

// Offline API wrapper
export class OfflineAPI {
  private static async makeRequest(
    url: string,
    options: RequestInit = {}
  ): Promise<Response> {
    try {
      // Try network first
      const response = await fetch(url, options);
      return response;
    } catch (error) {
      console.log('Network request failed, storing for offline sync:', url);
      
      // Store for offline sync
      await offlineStorage.storeOfflineData({
        url,
        method: options.method || 'GET',
        headers: options.headers as Record<string, string> || {},
        body: options.body ? JSON.stringify(options.body) : null
      });

      // Return offline response
      return new Response(
        JSON.stringify({
          error: 'Offline',
          message: 'No internet connection. Data will be synced when online.',
          offline: true,
          data: null
        }),
        {
          status: 503,
          statusText: 'Service Unavailable',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }
  }

  static async get(url: string): Promise<Response> {
    return this.makeRequest(url, { method: 'GET' });
  }

  static async post(url: string, data: any): Promise<Response> {
    return this.makeRequest(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    });
  }

  static async put(url: string, data: any): Promise<Response> {
    return this.makeRequest(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    });
  }

  static async delete(url: string): Promise<Response> {
    return this.makeRequest(url, { method: 'DELETE' });
  }
}

// Network status detection
export class NetworkStatus {
  private static isOnline = navigator.onLine;
  private static listeners: Array<(isOnline: boolean) => void> = [];

  static init(): void {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.notifyListeners(true);
      console.log('Network: Online');
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.notifyListeners(false);
      console.log('Network: Offline');
    });
  }

  static getStatus(): boolean {
    return this.isOnline;
  }

  static addListener(callback: (isOnline: boolean) => void): () => void {
    this.listeners.push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(callback);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  private static notifyListeners(isOnline: boolean): void {
    this.listeners.forEach(callback => callback(isOnline));
  }
}
