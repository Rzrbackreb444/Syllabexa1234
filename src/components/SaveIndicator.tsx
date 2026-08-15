import React, { useState, useEffect } from 'react';
import { useManuscriptStore } from '../store/manuscriptStore';
import { Database, CheckCircle2 } from 'lucide-react';

export default function SaveIndicator() {
  const [saveState, setSaveState] = useState<'saved' | 'saving'>('saved');
  const [lastSaved, setLastSaved] = useState<Date>(new Date());
  const [timeAgo, setTimeAgo] = useState('just now');

  // We subscribe to the store state to trigger a 'saving' state when things change
  useEffect(() => {
    const unsub = useManuscriptStore.subscribe(() => {
      setSaveState('saving');
      
      // Debounce the 'saved' state
      const timer = setTimeout(() => {
        setSaveState('saved');
        setLastSaved(new Date());
        setTimeAgo('just now');
      }, 1500);
      
      return () => clearTimeout(timer);
    });
    return unsub;
  }, []);

  // Update time ago string periodically
  useEffect(() => {
    if (saveState === 'saving') return;
    
    const interval = setInterval(() => {
      const seconds = Math.floor((new Date().getTime() - lastSaved.getTime()) / 1000);
      if (seconds < 10) setTimeAgo('just now');
      else if (seconds < 60) setTimeAgo(`${seconds}s ago`);
      else setTimeAgo(`${Math.floor(seconds / 60)}m ago`);
    }, 10000);
    
    return () => clearInterval(interval);
  }, [lastSaved, saveState]);

  return (
    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#0c0e12] border border-slate-800/80 shadow-inner">
      {saveState === 'saving' ? (
        <>
          <Database size={12} className="text-amber-500 animate-pulse" />
          <span className="text-[9px] font-mono font-semibold text-amber-500/80 uppercase tracking-widest">Syncing...</span>
        </>
      ) : (
        <>
          <CheckCircle2 size={12} className="text-emerald-500/70" />
          <span className="text-[9px] font-mono font-semibold text-slate-500 uppercase tracking-widest">Saved: {timeAgo}</span>
        </>
      )}
    </div>
  );
}