/**
 * IndexedDB-based offline cache for products and cart data.
 * Falls back gracefully if IndexedDB is unavailable.
 */

const DB_NAME = 'noir925_offline';
const DB_VERSION = 1;

interface OfflineDB {
  db: IDBDatabase | null;
  ready: Promise<IDBDatabase>;
}

let instance: OfflineDB | null = null;

function getDB(): Promise<IDBDatabase> {
  if (instance) return instance.ready;

  const ready = new Promise<IDBDatabase>((resolve, reject) => {
    if (!('indexedDB' in window)) {
      reject(new Error('IndexedDB not available'));
      return;
    }

    const req = indexedDB.open(DB_NAME, DB_VERSION);

    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains('products')) {
        db.createObjectStore('products', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('categories')) {
        db.createObjectStore('categories', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('cache_meta')) {
        db.createObjectStore('cache_meta', { keyPath: 'key' });
      }
    };

    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });

  instance = { db: null, ready };
  ready.then((db) => { if (instance) instance.db = db; });
  return ready;
}

export async function cacheProducts(products: any[]): Promise<void> {
  try {
    const db = await getDB();
    const tx = db.transaction(['products', 'cache_meta'], 'readwrite');
    const store = tx.objectStore('products');
    const meta = tx.objectStore('cache_meta');

    // Clear and re-populate
    store.clear();
    for (const p of products) {
      store.put(p);
    }
    meta.put({ key: 'products_cached_at', value: Date.now() });
  } catch {
    // Silent fail - offline cache is best-effort
  }
}

export async function getCachedProducts(): Promise<any[] | null> {
  try {
    const db = await getDB();
    return new Promise((resolve) => {
      const tx = db.transaction('products', 'readonly');
      const req = tx.objectStore('products').getAll();
      req.onsuccess = () => resolve(req.result?.length ? req.result : null);
      req.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

export async function cacheCategories(categories: any[]): Promise<void> {
  try {
    const db = await getDB();
    const tx = db.transaction(['categories', 'cache_meta'], 'readwrite');
    const store = tx.objectStore('categories');
    const meta = tx.objectStore('cache_meta');
    store.clear();
    for (const c of categories) {
      store.put(c);
    }
    meta.put({ key: 'categories_cached_at', value: Date.now() });
  } catch {
    // Silent
  }
}

export async function getCachedCategories(): Promise<any[] | null> {
  try {
    const db = await getDB();
    return new Promise((resolve) => {
      const tx = db.transaction('categories', 'readonly');
      const req = tx.objectStore('categories').getAll();
      req.onsuccess = () => resolve(req.result?.length ? req.result : null);
      req.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

export function isOnline(): boolean {
  return navigator.onLine;
}

export function onOnlineStatusChange(callback: (online: boolean) => void): () => void {
  const handleOnline = () => callback(true);
  const handleOffline = () => callback(false);
  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);
  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  };
}
