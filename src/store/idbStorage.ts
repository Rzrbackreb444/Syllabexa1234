import { PersistStorage, StorageValue } from 'zustand/middleware';
import localforage from 'localforage';
import SaveWorker from '../lib/saveWorker?worker';

localforage.config({
  name: 'SyllabexaStudio',
  storeName: 'syllabexa_state'
});

const worker = new SaveWorker();

worker.onmessage = (event) => {
  if (event.data.type === 'setItemError') {
    console.error("Local storage quota exceeded or write failed:", event.data.error);
    window.dispatchEvent(new CustomEvent('storage-quota-warning', { detail: { error: event.data.error } }));
  }
};

export const idbStorage: PersistStorage<any> = (() => {
  let timeoutId: any = null;
  const pendingSets: Record<string, StorageValue<any>> = {};

  return {
    getItem: async (name: string): Promise<StorageValue<any> | null> => {
      if (pendingSets[name] !== undefined) {
        return pendingSets[name];
      }
      const str = await localforage.getItem<string>(name);
      if (!str) return null;
      try {
        return JSON.parse(str);
      } catch {
        return null;
      }
    },
    setItem: async (name: string, value: StorageValue<any>): Promise<void> => {
      pendingSets[name] = value;
      
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      
      return new Promise<void>((resolve) => {
        timeoutId = setTimeout(() => {
          const keys = Object.keys(pendingSets);
          for (const key of keys) {
            const val = pendingSets[key];
            if (val !== undefined) {
              // Sanitize value to remove functions and non-cloneable objects for postMessage
              const sanitizedVal = JSON.parse(JSON.stringify(val));
              worker.postMessage({ type: 'setItem', name: key, value: sanitizedVal });
              delete pendingSets[key];
            }
          }
          resolve();
        }, 1000); // 1-second debounce
      });
    },
    removeItem: async (name: string): Promise<void> => {
      delete pendingSets[name];
      worker.postMessage({ type: 'removeItem', name });
    },
  };
})();