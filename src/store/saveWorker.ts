import localforage from 'localforage';

localforage.config({
  name: 'SyllabexaStudio',
  storeName: 'syllabexa_state'
});

self.onmessage = async (event) => {
  const { type, name, value } = event.data;
  
  if (type === 'setItem') {
    try {
      // The heavy stringification happens here, off the main thread!
      const stringified = JSON.stringify(value);
      await localforage.setItem(name, stringified);
      self.postMessage({ type: 'setItemSuccess', name });
    } catch (e: any) {
      self.postMessage({ type: 'setItemError', name, error: e.message });
    }
  } else if (type === 'removeItem') {
    await localforage.removeItem(name);
  }
};
