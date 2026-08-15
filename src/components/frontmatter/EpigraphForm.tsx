import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useManuscriptStore } from '../../store/manuscriptStore';
import { Quote, PenTool, Sparkles, LayoutTemplate } from 'lucide-react';

// Safely extract the HTML structure back into separate React state fields
const parseEpigraphHtml = (html?: string) => {
  if (!html || typeof window === 'undefined') return { quote: '', source: '' };
  
  const doc = new DOMParser().parseFromString(html, 'text/html');
  const quoteEl = doc.querySelector('.epigraph-quote');
  
  // Convert HTML line breaks back to textarea newlines
  const quote = quoteEl ? quoteEl.innerHTML.replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]*>?/gm, '').replace(/^"|"$/g, '').trim() : '';
  const source = doc.querySelector('.epigraph-source')?.textContent?.replace(/^—\s*/, '').trim() || '';

  return { quote, source };
};

// Serialize the discrete inputs into KDP-compliant semantic HTML
const serializeEpigraphHtml = (quote: string, source: string): string => {
  if (!quote.trim() && !source.trim()) return '';
  
  // Preserve textarea line breaks as proper HTML breaks for the print compiler
  const formattedQuote = quote
    .split('\n')
    .map(line => line.trim())
    .join('<br/>');

  return `
    <div class="epigraph-page" style="padding-top: 20%; padding-left: 15%; padding-right: 15%;">
      <blockquote class="epigraph-quote" style="font-style: italic; text-align: center; margin-bottom: 1.5rem; line-height: 1.8;">
        ${formattedQuote ? `"${formattedQuote}"` : ''}
      </blockquote>
      ${source.trim() ? `<p class="epigraph-source" style="text-align: right; font-weight: 600; text-transform: uppercase; font-size: 0.9em;">— ${source.trim()}</p>` : ''}
    </div>
  `.trim();
};

export default function EpigraphForm() {
  // OPTIMIZATION: Strict Atomic Selectors to eliminate re-render cascades
  const activeId = useManuscriptStore(state => state.selectedChapterId);
  const fontBody = useManuscriptStore(state => state.prepressRules.fontBody);
  const updateFrontmatterContent = useManuscriptStore(state => state.updateFrontmatter);
  
  const activeContent = useManuscriptStore(state => {
    const doc = state.frontmatter.find(f => f.id === state.selectedChapterId);
    return doc?.content || '';
  });

  const [data, setData] = useState({ quote: '', source: '' });
  const debounceTimerRef = useRef<number | null>(null);

  // Hydrate local state when the active document switches
  useEffect(() => {
    if (activeContent) {
      setData(parseEpigraphHtml(activeContent));
    } else {
      setData({ quote: '', source: '' });
    }
  }, [activeId, activeContent]);

  // Memory leak protection on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) window.clearTimeout(debounceTimerRef.current);
    };
  }, []);

  // OPTIMIZATION: Stabilized callback prevents stale closures and recreation overhead
  const handleFieldChange = useCallback((field: 'quote' | 'source', value: string) => {
    setData(prev => {
      const newData = { ...prev, [field]: value };
      
      if (activeId) {
        if (debounceTimerRef.current) window.clearTimeout(debounceTimerRef.current);
        
        debounceTimerRef.current = window.setTimeout(() => {
          updateFrontmatterContent(activeId, serializeEpigraphHtml(newData.quote, newData.source));
        }, 400);
      }
      return newData;
    });
  }, [activeId, updateFrontmatterContent]);

  const handleInsertTemplate = useCallback(() => {
    const template = { quote: "Fairy tales are more than true: not because they tell us that dragons exist, but because they tell us that dragons can be beaten.", source: "Neil Gaiman" };
    setData(template);
    if (activeId) {
      updateFrontmatterContent(activeId, serializeEpigraphHtml(template.quote, template.source));
    }
  }, [activeId, updateFrontmatterContent]);

  if (!activeId) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 font-mono text-xs tracking-widest gap-3">
        <Quote size={24} className="opacity-50" />
        NO FRONTMATTER DOCUMENT SELECTED
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col gap-6 px-4 h-full pb-32 mt-8 font-sans select-none">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/5 pb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.15)]">
            <Quote size={20} />
          </div>
          <div>
            <h2 className="text-xs font-mono font-bold text-slate-100 uppercase tracking-widest flex items-center gap-2">
              <span>Epigraph Configuration</span>
            </h2>
            <p className="text-[10px] text-slate-500 font-mono mt-0.5">A thematic quote to set the tone of your manuscript.</p>
          </div>
        </div>
        
        {!data.quote.trim() && (
          <button 
            onClick={handleInsertTemplate}
            className="flex items-center gap-2 px-4 py-2 bg-[#161a22] hover:bg-[#1e232e] border border-white/5 text-amber-400 font-mono text-[10px] uppercase tracking-widest rounded-xl cursor-pointer transition-all font-bold shadow-sm"
          >
            <LayoutTemplate size={14} />
            Insert Template
          </button>
        )}
      </div>

      <div className="flex flex-col lg:flex-row gap-8 h-[75vh]">
        
        {/* Editor Sidebar */}
        <div className="w-full lg:w-80 shrink-0 flex flex-col gap-6">
          <div className="p-6 rounded-2xl bg-[#0c0e12] border border-white/5 shadow-xl space-y-5">
            
            <div className="group">
              <label className="block text-[10px] font-mono uppercase tracking-widest text-slate-500 mb-2 font-bold group-focus-within:text-amber-500 transition-colors">
                Quote Text
              </label>
              <textarea 
                value={data.quote} 
                onChange={e => handleFieldChange('quote', e.target.value)}
                rows={5}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-[13px] leading-relaxed text-slate-200 focus:border-amber-500/50 focus:outline-none transition-colors resize-none shadow-inner custom-scrollbar"
                placeholder="In the beginning..."
              />
            </div>

            <div className="group">
              <label className="block text-[10px] font-mono uppercase tracking-widest text-slate-500 mb-2 font-bold group-focus-within:text-amber-500 transition-colors">
                Attribution / Source
              </label>
              <input 
                type="text" 
                value={data.source} 
                onChange={e => handleFieldChange('source', e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-[13px] text-slate-300 focus:border-amber-500/50 focus:outline-none transition-colors shadow-inner"
                placeholder="e.g. Book of Genesis 1:1"
              />
            </div>
          </div>
          
          {/* Helper Guide */}
          <div className="p-5 rounded-2xl bg-black/20 border border-white/5">
            <h3 className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2 mb-3">
              <Sparkles size={14} className="text-amber-400" />
              Formatting Guide
            </h3>
            <ul className="text-xs text-slate-500 space-y-3 leading-relaxed">
              <li>• Do not include quotation marks in the input; the engine auto-formats them.</li>
              <li>• Keep the quote brief and impactful.</li>
            </ul>
          </div>
        </div>

        {/* 
          PREMIUM UI: The Recto Page Canvas 
          Includes a gradient inner-shadow on the LEFT edge to simulate the physical book's spine gutter.
        */}
        <div 
          className="flex-1 p-16 bg-[#f4f1ea] text-slate-900 rounded-r-sm shadow-[0_20px_50px_-12px_rgba(0,0,0,0.5)] relative flex flex-col transition-all duration-300 focus-within:ring-1 focus-within:ring-amber-500/50 overflow-hidden group" 
          style={{ fontFamily: fontBody }}
        >
          {/* Book Spine / Gutter Simulation (Shifted to Left for Recto) */}
          <div className="absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-[rgba(0,0,0,0.08)] to-transparent pointer-events-none" />
          <div className="absolute inset-y-0 right-0 w-[1px] bg-gradient-to-b from-transparent via-black/5 to-transparent pointer-events-none" />

          {/* Typography Canvas - Epigraphs are pushed down and inset */}
          <div className="w-full h-full flex flex-col items-center justify-start pt-24 z-10 px-12">
            <div className="max-w-md w-full">
              <p className="text-[17px] italic text-center leading-relaxed font-serif text-slate-800 whitespace-pre-wrap">
                {data.quote ? `"${data.quote}"` : '"In the beginning..."'}
              </p>
              {(data.source || !data.quote) && (
                <p className="text-right mt-6 text-[13px] font-bold tracking-widest text-slate-500 uppercase font-sans">
                  — {data.source || 'Book of Genesis 1:1'}
                </p>
              )}
            </div>
          </div>
          
          {/* Prepress Indicator */}
          <div className="absolute bottom-6 left-8 flex items-center gap-2 opacity-50 group-hover:opacity-100 transition-opacity pl-6">
            <PenTool size={14} className="text-slate-400" />
            <span className="text-[10px] font-mono text-slate-400 tracking-widest font-bold select-none pointer-events-none">
              RECTO PAGE
            </span>
          </div>
          
        </div>

      </div>
    </div>
  );
}