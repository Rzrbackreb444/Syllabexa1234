import localforage from 'localforage';

localforage.config({
  name: 'SyllabexaStudio',
  storeName: 'syllabexa_state'
});

self.onmessage = async (event) => {
  const { type, name, value } = event.data;
  
  if (type === 'setItem' || event.data.manuscript) {
    try {
      const payload = value || event.data.manuscript;
      // Perform JSON.stringify off the main thread
      const stringified = JSON.stringify(payload);
      
      // Simulate/perform asynchronous IndexedDB write operation using a Promise / localforage
      await new Promise((resolve) => setTimeout(resolve, 50));
      await localforage.setItem(name || 'manuscript_save', stringified);
      
      // Notify the main thread with a 'saved' postMessage
      self.postMessage({ type: 'saved', name: name || 'manuscript_save' });
    } catch (e: any) {
      self.postMessage({ type: 'setItemError', name, error: e.message });
    }
  } else if (type === 'removeItem') {
    await localforage.removeItem(name);
  }
};
