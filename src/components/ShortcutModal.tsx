import React from 'react';
import { X, Command, Keyboard } from 'lucide-react';
import { useToast } from '../lib/ToastContext';

export function ShortcutModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { showToast } = useToast();
  if (!isOpen) return null;

  const shortcuts = [
    { key: 'Ctrl + /', desc: 'Toggle Global Shortcuts Menu' },
    { key: 'Ctrl + B', desc: 'Bold Selected Text' },
    { key: 'Ctrl + I', desc: 'Italicize Selected Text' },
    { key: 'Ctrl + Q', desc: 'Insert Blockquote Callout' },
    { key: 'Ctrl + Alt + I', desc: 'Open Import Manuscript Modal' },
    { key: 'Tab', desc: 'Navigate Structural Focus' },
  ];

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4 font-sans select-none animate-in fade-in">
      <div className="absolute inset-0" onClick={onClose} />
      
      <div className="w-full max-w-lg bg-[#0c0e12] border border-slate-800 rounded-3xl p-8 relative z-10 shadow-2xl ambient-glow">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-800 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Keyboard size={18} />
            </div>
            <div>
              <h3 className="text-xs font-mono font-bold text-slate-100 uppercase tracking-widest flex items-center gap-2">
                <span>Keyboard Shortcuts</span>
                <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 text-[10px]">Command Pro</span>
              </h3>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 text-slate-500 hover:text-slate-200 hover:bg-slate-800 rounded-xl cursor-pointer transition-all"
          >
            <X size={16} />
          </button>
        </div>

        {/* Shortcuts List */}
        <div className="space-y-2.5 font-mono text-xs max-h-[60vh] overflow-y-auto pr-1 custom-scrollbar">
          {shortcuts.map((s, idx) => (
            <div 
              key={idx} 
              className="flex items-center justify-between p-3.5 bg-[#12151c] rounded-2xl border border-slate-800/80 hover:border-slate-700 transition-all shadow-sm"
            >
              <span className="text-slate-300 font-sans text-xs">{s.desc}</span>
              <span className="px-2.5 py-1.5 bg-slate-900 border border-slate-800 text-amber-400 rounded-xl font-bold text-[10px] shadow-inner">
                {s.key}
              </span>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-slate-800 flex justify-between items-center text-[10px] font-mono text-slate-500">
          <span>Press <strong className="text-slate-300">Esc</strong> or click outside to close</span>
          <span>Syllabexa Studio</span>
        </div>

      </div>
    </div>
  );
}