import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { ToastProvider } from './lib/ToastContext.tsx';
import { HelmetProvider } from 'react-helmet-async';
import { ErrorBoundary } from './components/ErrorBoundary';

const originalFetch = window.fetch;
const customFetch = async function (input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  let url = '';
  if (typeof input === 'string') {
    url = input;
  } else if (input instanceof URL) {
    url = input.href;
  } else if (input && typeof input === 'object' && 'url' in input) {
    url = (input as Request).url;
  }

  if (url.startsWith('/api/')) {
    const stripeKey = localStorage.getItem('syllabexa_stripe_key');
    const geminiKey = localStorage.getItem('syllabexa_gemini_key');

    init = init || {};
    const headers = new Headers(init.headers || {});
    if (stripeKey && !headers.has('X-Stripe-Key') && !headers.has('x-stripe-key')) {
      headers.set('X-Stripe-Key', stripeKey);
    }
    if (geminiKey && !headers.has('X-Gemini-Key') && !headers.has('x-gemini-key')) {
      headers.set('X-Gemini-Key', geminiKey);
    }
    init.headers = headers;
  }
  return originalFetch(input, init);
};

try {
  Object.defineProperty(window, 'fetch', {
    value: customFetch,
    writable: true,
    configurable: true
  });
} catch (e) {
  console.warn('Failed to override window.fetch directly, trying prototype fallback:', e);
  try {
    Object.defineProperty(Object.getPrototypeOf(window), 'fetch', {
      value: customFetch,
      writable: true,
      configurable: true
    });
  } catch (err2) {
    console.error('Could not override fetch on Window prototype:', err2);
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <ToastProvider>
        <HelmetProvider><App /></HelmetProvider>
      </ToastProvider>
    </ErrorBoundary>
  </StrictMode>
);

// Register Offline Service Worker for Enterprise PWA capability
if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then((registration) => {
      console.log('Syllabexa ServiceWorker registered successfully with scope: ', registration.scope);
    }).catch((err) => {
      console.log('Syllabexa ServiceWorker registration failed: ', err);
    });
  });
}
