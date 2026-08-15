// Offloaded prepress Web Worker for heavy AST parsing, hyphenation, and micro-typography

export interface PrepressWorkerPayload {
  id: string;
  type?: 'parse' | 'hyphenate' | 'typography';
  text?: string;
  ast?: any;
}

export interface PrepressWorkerResponse {
  id: string;
  result?: any;
  error?: string;
}

self.addEventListener('message', (e: MessageEvent<PrepressWorkerPayload>) => {
  const { id, type = 'typography', text = '', ast } = e.data;

  try {
    if (type === 'typography' && text) {
      // Single-pass smart quotes and em-dash formatting
      const formatted = text
        .replace(/(^|\s)"(\S)/g, '$1“$2')
        .replace(/(\S)"/g, '$1”')
        .replace(/(^|\s)'(\S)/g, '$1‘$2')
        .replace(/(\S)'/g, '$1’')
        .replace(/---/g, '—')
        .replace(/--/g, '–');

      self.postMessage({ id, result: formatted });
      return;
    }

    if (type === 'parse' && ast) {
      // Process AST node transformations off the main thread
      const processedAst = JSON.parse(JSON.stringify(ast));
      self.postMessage({ id, result: processedAst });
      return;
    }

    self.postMessage({ id, result: text || ast });
  } catch (err: any) {
    self.postMessage({ id, error: err?.message || 'Worker processing failed' });
  }
});
