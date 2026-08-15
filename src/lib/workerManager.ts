let worker: Worker | null = null;

export function getPrepressWorker(): Worker {
  if (!worker && typeof window !== 'undefined') {
    worker = new Worker(new URL('./prepressWorker.ts', import.meta.url), { type: 'module' });
  }
  return worker!;
}

export function processManuscriptInWorker(ast: any): Promise<any> {
  return new Promise((resolve, reject) => {
    const w = getPrepressWorker();
    if (!w) {
      resolve(ast);
      return;
    }

    const messageId = Math.random().toString(36).substring(7);

    const handleMessage = (e: MessageEvent) => {
      if (e.data.id === messageId) {
        w.removeEventListener('message', handleMessage);
        if (e.data.error) reject(new Error(e.data.error));
        else resolve(e.data.result);
      }
    };

    w.addEventListener('message', handleMessage);
    w.postMessage({ id: messageId, type: 'parse', ast });
  });
}

export function processTypographyInWorker(text: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const w = getPrepressWorker();
    if (!w) {
      resolve(text);
      return;
    }

    const messageId = Math.random().toString(36).substring(7);

    const handleMessage = (e: MessageEvent) => {
      if (e.data.id === messageId) {
        w.removeEventListener('message', handleMessage);
        if (e.data.error) reject(new Error(e.data.error));
        else resolve(e.data.result);
      }
    };

    w.addEventListener('message', handleMessage);
    w.postMessage({ id: messageId, type: 'typography', text });
  });
}
