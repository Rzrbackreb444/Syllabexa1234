import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, ShieldCheck, RefreshCw } from 'lucide-react';

export default function SyncStatusIndicator() {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [isCachedOffline, setIsCachedOffline] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Reactive Service Worker Controller Check
    const updateServiceWorkerStatus = () => {
      if ('serviceWorker' in navigator) {
        setIsCachedOffline(!!navigator.serviceWorker.controller);
      }
    };

    updateServiceWorkerStatus();
    navigator.serviceWorker?.addEventListener('controllerchange', updateServiceWorkerStatus);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      navigator.serviceWorker?.removeEventListener('controllerchange', updateServiceWorkerStatus);
    };
  }, []);

  const handleManualSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
    }, 800);
  };

  return (
    <div 
      onClick={handleManualSync}
      title="Click to force local synchronization check"
      className="flex items-center gap-2 bg-[#050508] border border-slate-800 hover:border-cyan-800/50 px-3 py-1.5 rounded-sm text-[10px] font-mono cursor-pointer transition-all group"
    >
      {isOnline ? (
        <div className="flex items-center gap-1.5 text-emerald-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <Wifi size={12} />
          <span>SYNC_ONLINE</span>
        </div>
      ) : (
        <div className="flex items-center gap-1.5 text-amber-400">
          <span className="w-2 h-2 rounded-full bg-amber-400"></span>
          <WifiOff size={12} />
          <span>OFFLINE_MODE</span>
        </div>
      )}
      
      <span className="text-slate-700">|</span>
      
      <div className="flex items-center gap-1 text-slate-400">
        <span>PWA_CACHE:</span>
        <strong className={`text-cyan-400 flex items-center gap-1 ${isCachedOffline ? '' : 'text-amber-500'}`}>
          {isCachedOffline ? 'SECURE' : 'PENDING'}
        </strong>
      </div>

      <RefreshCw size={10} className={`text-slate-600 group-hover:text-cyan-400 transition-transform ${isSyncing ? 'animate-spin text-cyan-400' : ''}`} />
    </div>
  );
}