import React, { useCallback } from 'react';
import { useManuscriptStore } from '../../store/manuscriptStore';
import { BookOpen, PenTool } from 'lucide-react';

export default function TitlePageForm() {
  // OPTIMIZATION: Strict Atomic Selectors to eliminate re-render cascades
  const meta = useManuscriptStore(state => state.projectMeta);
  const updateMeta = useManuscriptStore(state => state.updateProjectMeta);
  const fontHeading = useManuscriptStore(state => state.prepressRules.fontHeading);
  const fontBody = useManuscriptStore(state => state.prepressRules.fontBody);

  // OPTIMIZATION: Stabilized callback prevents stale closures and recreation overhead
  const handleAuthorChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const sanitized = e.target.value.replace(/[^a-zA-Z\s\-\.]/g, '');
    updateMeta({ author: sanitized });
  }, [updateMeta]);

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-6 px-4 h-full pb-32 mt-8 font-sans select-none">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/5 pb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.15)]">
            <BookOpen size={20} />
          </div>
          <div>
            <h2 className="text-xs font-mono font-bold text-slate-100 uppercase tracking-widest flex items-center gap-2">
              <span>Title Page Configuration</span>
            </h2>
            <p className="text-[10px] text-slate-500 font-mono mt-0.5">Configure primary book identity and cover page typography.</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 h-[75vh]">
        
        {/* Editor Controls Sidebar */}
        <div className="w-full lg:w-80 shrink-0 flex flex-col gap-6">
          <div className="p-6 rounded-2xl bg-[#0c0e12] border border-white/5 shadow-xl space-y-5">
            
            <div className="group">
              <label className="block text-[10px] font-mono uppercase tracking-widest text-slate-500 mb-2 font-bold group-focus-within:text-amber-500 transition-colors">
                Book Title
              </label>
              <input 
                type="text" 
                value={meta.title} 
                onChange={e => updateMeta({ title: e.target.value })}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-200 focus:border-amber-500/50 focus:outline-none transition-colors shadow-inner"
                placeholder="Main Title"
              />
            </div>
            
            <div className="group">
              <label className="block text-[10px] font-mono uppercase tracking-widest text-slate-500 mb-2 font-bold group-focus-within:text-amber-500 transition-colors">
                Subtitle (Optional)
              </label>
              <input 
                type="text" 
                value={meta.subtitle || ''} 
                onChange={e => updateMeta({ subtitle: e.target.value })}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-300 focus:border-amber-500/50 focus:outline-none transition-colors shadow-inner"
                placeholder="Subtitle"
              />
            </div>

            <div className="group">
              <label className="block text-[10px] font-mono uppercase tracking-widest text-slate-500 mb-2 font-bold group-focus-within:text-amber-500 transition-colors">
                Author Name (Sanitized)
              </label>
              <input 
                type="text" 
                value={meta.author} 
                onChange={handleAuthorChange}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-amber-400 focus:border-amber-500/50 focus:outline-none transition-colors shadow-inner"
                placeholder="e.g. Nicholas Kremers"
              />
              <p className="text-[10px] font-mono text-slate-600 mt-2">Titles and special characters are automatically filtered for print compliance.</p>
            </div>
          </div>
        </div>

        {/* 
          PREMIUM UI: The Recto Page Canvas 
          Includes a gradient inner-shadow on the LEFT edge to simulate the physical book's spine gutter.
        */}
        <div 
          className="flex-1 p-16 bg-[#f4f1ea] text-slate-900 rounded-r-sm shadow-[0_20px_50px_-12px_rgba(0,0,0,0.5)] relative flex flex-col justify-between transition-all duration-300 overflow-hidden group" 
        >
          {/* Book Spine / Gutter Simulation (Shifted to Left for Recto) */}
          <div className="absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-[rgba(0,0,0,0.08)] to-transparent pointer-events-none" />
          <div className="absolute inset-y-0 right-0 w-[1px] bg-gradient-to-b from-transparent via-black/5 to-transparent pointer-events-none" />

          {/* Typography Preview Canvas */}
          <div className="w-full h-full flex flex-col items-center justify-center text-center z-10 pl-6 space-y-6">
            <h1 
              className="text-4xl font-extrabold tracking-tight text-slate-900 max-w-lg leading-tight"
              style={{ fontFamily: fontHeading }}
            >
              {meta.title || 'Untitled Manuscript'}
            </h1>
            
            {meta.subtitle && (
              <p 
                className="text-lg text-slate-600 max-w-md font-serif italic"
                style={{ fontFamily: fontBody }}
              >
                {meta.subtitle}
              </p>
            )}

            <div className="pt-20">
              <p 
                className="text-xl font-medium text-slate-800 tracking-wider uppercase"
                style={{ fontFamily: fontHeading }}
              >
                {meta.author || 'Author Name'}
              </p>
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