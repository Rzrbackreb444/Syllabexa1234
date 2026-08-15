/// <reference lib="webworker" />
import { generateGeminiResponse, streamGeminiResponse } from '../lib/gemini';

self.onmessage = async (e: MessageEvent) => {
  const { prompt, options, stream, id } = e.data;

  try {
    if (stream) {
      await streamGeminiResponse(prompt, (chunk) => {
        self.postMessage({ id, type: 'chunk', chunk });
      }, options);
      self.postMessage({ id, type: 'done' });
    } else {
      const text = await generateGeminiResponse(prompt, options);
      self.postMessage({ id, success: true, text });
    }
  } catch (err: any) {
    self.postMessage({ id, success: false, error: err.message });
  }
};
