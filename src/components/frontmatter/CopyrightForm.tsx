import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useManuscriptStore } from '../../store/manuscriptStore';
import { Book, Shield, FileText, Fingerprint } from 'lucide-react';

export default function CopyrightForm() {
  // OPTIMIZATION: Strict Atomic Selectors to prevent global re-render cascades
  const meta = useManuscriptStore(state => state.projectMeta);
  const updateMeta = useManuscriptStore(state => state.updateProjectMeta);
  const activeId = useManuscriptStore(state => state.selectedChapterId);
  
  // Only extract the exact content string of the active document, not the whole array
  const activeContent = useManuscriptStore(state => {
    const doc = state.frontmatter.find(f => f.id === state.selectedChapterId);
    return doc?.content || '';
  });
  
  const updateFrontmatterContent = useManuscriptStore(state => state.updateFrontmatter);

  const [rightsText, setRightsText] = useState(
    activeContent || 
    `All rights reserved.\nNo part of this publication may be reproduced, distributed, or transmitted in any form or by any means, without the prior written permission of the publisher.`
  );

  const debounceTimerRef = useRef<number | null>(null);

  // Sync local state when the active document switches
  useEffect(() => {
    if (activeContent) {
      setRightsText(activeContent);
    }
  }, [activeId, activeContent]); // Fixed dependency array for robust synchronization

  // Memory leak protection on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) window.clearTimeout(debounceTimerRef.current);
    };
  }, []);

  // OPTIMIZATION: Stabilized callback prevents stale closures and memory bloat
  const handleRightsChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setRightsText(value);

    if (!activeId) return;

    if (debounceTimerRef.current) window.clearTimeout(debounceTimerRef.current);

    debounceTimerRef.current = window.setTimeout(() => {
      updateFrontmatterContent(activeId, value);
    }, 400);
  }, [activeId, updateFrontmatterContent]);

  return (
    <div className="w-full max-w-3xl mx-auto space-y-8 mt-8 pb-12 font-sans select-none">
      
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-white/5 pb-5">
        <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.15)]">
          <Shield size={20} />
        </div>
        <div>
          <h2 className="text-xs font-mono font-bold text-slate-100 uppercase tracking-widest flex items-center gap-2">
            <span>Copyright & Global Metadata</span>
            <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 text-[9px] border border-amber-500/30">KDP SYNC</span>
          </h2>
          <p className="text-[10px] text-slate-500 font-mono mt-0.5">Configure global manuscript variables and Verso page rights.</p>
        </div>
      </div>

      <div className="bg-[#0c0e12] border border-white/5 rounded-3xl p-8 shadow-2xl space-y-8 relative z-0">
        
        {/* Section: Global Book Metadata */}
        <div className="space-y-5">
          <h3 className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2 mb-4">
            <Book size={14} className="text-slate-600" />
            Global Book Data
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="col-span-1 md:col-span-2 group">
              <label className="block text-[10px] font-mono uppercase tracking-widest text-slate-500 mb-2 font-bold group-focus-within:text-amber-500 transition-colors">Book Title</label>
              <input 
                type="text" 
                value={meta.title} 
                onChange={e => updateMeta({ title: e.target.value })}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-200 focus:border-amber-500/50 focus:outline-none transition-colors shadow-inner"
              />
            </div>

            <div className="group">
              <label className="block text-[10px] font-mono uppercase tracking-widest text-slate-500 mb-2 font-bold group-focus-within:text-amber-500 transition-colors">Subtitle</label>
              <input 
                type="text" 
                value={meta.subtitle || ''} 
                onChange={e => updateMeta({ subtitle: e.target.value })}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-300 focus:border-amber-500/50 focus:outline-none transition-colors shadow-inner"
              />
            </div>

            <div className="group">
              <label className="block text-[10px] font-mono uppercase tracking-widest text-slate-500 mb-2 font-bold group-focus-within:text-amber-500 transition-colors">Author / Pen Name</label>
              <input 
                type="text" 
                value={meta.author} 
                onChange={e => updateMeta({ author: e.target.value })}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-amber-500 font-bold focus:border-amber-500/50 focus:outline-none transition-colors shadow-inner"
              />
            </div>

            <div className="col-span-1 md:col-span-2 group">
              <label className="block text-[10px] font-mono uppercase tracking-widest text-slate-500 mb-2 font-bold group-focus-within:text-amber-500 transition-colors">Publisher Name</label>
              <input 
                type="text" 
                value={meta.publisher || ''} 
                onChange={e => updateMeta({ publisher: e.target.value })}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-200 focus:border-amber-500/50 focus:outline-none transition-colors shadow-inner"
                placeholder="e.g. WashBizHub Press"
              />
            </div>

            <div className="group">
              <label className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest text-slate-500 mb-2 font-bold group-focus-within:text-amber-500 transition-colors">
                <Fingerprint size={12} />
                ISBN-13
              </label>
              <input 
                type="text" 
                value={meta.isbn || ''} 
                onChange={e => updateMeta({ isbn: e.target.value.replace(/[^0-9\-X]/gi, '') })}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm font-mono tracking-widest text-slate-300 focus:border-amber-500/50 focus:outline-none transition-colors shadow-inner"
                placeholder="978-0-000000-00-0"
              />
            </div>

            <div className="group">
              <label className="block text-[10px] font-mono uppercase tracking-widest text-slate-500 mb-2 font-bold group-focus-within:text-amber-500 transition-colors">Copyright Year</label>
              <input 
                type="text" 
                value={meta.publicationDate || new Date().getFullYear().toString()} 
                onChange={e => updateMeta({ publicationDate: e.target.value.replace(/[^0-9]/g, '') })}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-300 focus:border-amber-500/50 focus:outline-none transition-colors shadow-inner"
                placeholder="YYYY"
              />
            </div>
          </div>
        </div>

        <div className="w-full h-px bg-white/5 my-6" />

        {/* Section: Verso Page Formatting */}
        <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <h3 className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2 mb-4">
            <FileText size={14} className="text-slate-600" />
            Verso Page Rights Block
          </h3>

          <div className="group">
            <label className="block text-[10px] font-mono uppercase tracking-widest text-slate-500 mb-2 font-bold group-focus-within:text-amber-500 transition-colors">
              Legal Disclaimer & Restrictions
            </label>
            <textarea 
              value={rightsText}
              onChange={handleRightsChange}
              rows={6}
              className="w-full bg-black/40 border border-white/10 rounded-xl px-5 py-4 text-[13px] leading-relaxed text-slate-300 font-serif focus:border-amber-500/50 focus:outline-none transition-colors resize-none shadow-inner custom-scrollbar"
            />
          </div>
        </div>

      </div>
    </div>
  );
}