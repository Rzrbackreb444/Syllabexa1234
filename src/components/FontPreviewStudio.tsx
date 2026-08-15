import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useManuscriptStore } from '../store/manuscriptStore';
import { X, Type, Search } from 'lucide-react';
import { useToast } from '../lib/ToastContext';

const PRINT_SAFE_FONTS = [
  { family: 'Crimson Pro', category: 'Modern Book' },
  { family: 'EB Garamond', category: 'Classic Literary' },
  { family: 'Merriweather', category: 'Non-Fiction/Business' },
  { family: 'Lora', category: 'Contemporary Soft' },
  { family: 'Libre Baskerville', category: 'Academic/Historical' },
  { family: 'Playfair Display', category: 'Elegant/Romance' },
  { family: 'Source Serif 4', category: 'Technical/Clean' },
  { family: 'PT Serif', category: 'Transitional' },
  { family: 'Cinzel', category: 'Classic Display' },
  { family: 'Space Grotesk', category: 'Modern Clean' },
];

interface Props {
  onClose?: () => void;
  targetType: 'fontBody' | 'fontHeading';
}

export default function FontPreviewStudio({ onClose, targetType }: Props) {
  // OPTIMIZATION: Strict Atomic Selectors for Prepress Rules Store
  const prepressRules = useManuscriptStore(state => state.prepressRules);
  const updatePrepressRules = useManuscriptStore(state => state.updatePrepressRules);
  
  const [previewText, setPreviewText] = useState("The quick brown fox jumps over the lazy dog.");
  const [searchQuery, setSearchQuery] = useState('');
  const [fontsLoaded, setFontsLoaded] = useState(false);
  
  const { showToast } = useToast();

  useEffect(() => {
    const fontFamilies = PRINT_SAFE_FONTS.map(f => f.family.replace(/ /g, '+')).join('&family=');
    const url = `https://fonts.googleapis.com/css2?family=${fontFamilies}&display=swap`;
    
    const link = document.createElement('link');
    link.href = url;
    link.rel = 'stylesheet';
    
    link.onload = () => setFontsLoaded(true);
    document.head.appendChild(link);

    return () => {
      document.head.removeChild(link);
    };
  }, []);

  // OPTIMIZATION: Memoized search filter for fast font discovery
  const filteredFonts = useMemo(() => {
    if (!searchQuery.trim()) return PRINT_SAFE_FONTS;
    const q = searchQuery.toLowerCase();
    return PRINT_SAFE_FONTS.filter(f => 
      f.family.toLowerCase().includes(q) || f.category.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  // OPTIMIZATION: Stabilized selection handler
  const handleSelectFont = useCallback((fontFamily: string) => {
    updatePrepressRules({ [targetType]: fontFamily });
    showToast(`Applied ${fontFamily} to ${targetType === 'fontBody' ? 'Body' : 'Heading'}`, 'success');
  }, [updatePrepressRules, targetType, showToast]);

  return (
    <aside aria-label="Typography Studio" className="flex flex-col h-full bg-[#0c0e12] overflow-hidden select-none border-l border-white/5 relative z-20">
      
      {/* Header & Controls */}
      <div className="sticky top-0 z-10 bg-[#08090c] border-b border-white/5 p-4 shrink-0 flex flex-col gap-3 shadow-md">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Type size={14} />
            </div>
            <h3 className="text-[10px] font-mono font-bold text-slate-200 uppercase tracking-widest">
              Typography Studio — {targetType === 'fontBody' ? 'Body' : 'Heading'}
            </h3>
          </div>
          {onClose && (
            <button onClick={onClose} className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-white/5 rounded-lg transition-colors cursor-pointer" title="Close Studio">
              <X size={16} />
            </button>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <input
            type="text"
            value={previewText}
            onChange={(e) => setPreviewText(e.target.value)}
            placeholder="Type custom preview text..."
            className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2.5 text-slate-200 text-xs focus:outline-none focus:border-amber-500/50 transition-colors font-sans shadow-inner"
          />

          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search foundries or styles..."
              className="w-full bg-black/30 border border-white/5 rounded-xl pl-8 pr-3 py-2 text-slate-300 text-[11px] font-mono focus:outline-none focus:border-amber-500/40 transition-colors shadow-inner"
            />
          </div>
        </div>
      </div>

      {/* Font List Container */}
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-[#07080a]">
        {!fontsLoaded ? (
          <div className="h-full flex items-center justify-center text-slate-500 text-[10px] font-mono uppercase tracking-widest animate-pulse gap-2">
            <span className="w-3 h-3 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
            Loading Print Foundries...
          </div>
        ) : filteredFonts.length === 0 ? (
          <div className="h-full flex items-center justify-center text-slate-500 text-[10px] font-mono uppercase tracking-widest">
            No matching foundries found.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 pb-8">
            {filteredFonts.map((font) => {
              const isActive = prepressRules[targetType] === font.family;
              
              return (
                <button
                  key={font.family}
                  onClick={() => handleSelectFont(font.family)}
                  className={`relative flex flex-col text-left p-4 rounded-xl border transition-all duration-200 group overflow-hidden cursor-pointer ${
                    isActive 
                      ? 'border-amber-500/80 bg-amber-500/10 shadow-[0_0_20px_rgba(245,158,11,0.12)]' 
                      : 'border-white/5 hover:border-white/20 bg-[#08090c]'
                  }`}
                >
                  <div className="flex justify-between items-center mb-3 opacity-70 group-hover:opacity-100 transition-opacity">
                    <span className="font-sans text-[11px] font-bold text-slate-200 tracking-wide">
                      {font.family}
                    </span>
                    <span className="font-mono text-[9px] text-slate-500 uppercase px-2 py-0.5 rounded bg-white/5 border border-white/5">
                      {font.category}
                    </span>
                  </div>
                  
                  <div 
                    className={`transition-colors truncate w-full ${isActive ? 'text-amber-300 font-medium' : 'text-slate-300'}`}
                    style={{ 
                      fontFamily: `'${font.family}', serif`, 
                      fontSize: targetType === 'fontHeading' ? '20px' : '15px',
                      lineHeight: '1.4',
                      fontWeight: targetType === 'fontHeading' ? 'bold' : 'normal'
                    }}
                  >
                    {previewText || "Preview text"}
                  </div>
                  
                  {isActive && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-500 rounded-l-xl" />
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </aside>
  );
}