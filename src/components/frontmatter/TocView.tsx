import React from 'react';
import { useManuscriptStore } from '../../store/manuscriptStore';
import { ListOrdered, PenTool, Sparkles, Database, FileUp } from 'lucide-react';

export default function TocView() {
  // OPTIMIZATION: Strict Atomic Selectors to eliminate re-render cascades
  const chapters = useManuscriptStore(state => state.chapters);
  const frontmatter = useManuscriptStore(state => state.frontmatter);
  const uploadedAssets = useManuscriptStore(state => (state as any).uploadedAssets || []);
  const generatedCorpus = useManuscriptStore(state => (state as any).generatedCorpus || []);
  
  const fontHeading = useManuscriptStore(state => state.prepressRules.fontHeading);
  const fontBody = useManuscriptStore(state => state.prepressRules.fontBody);

  // Unified index aggregation: Combine chapters, frontmatter, uploads, and AI generated content with memoization
  const unifiedIndex = React.useMemo(() => {
    let runningPage = 15;
    
    const chapterItems = chapters.map((ch, idx) => {
      const pageNum = runningPage;
      runningPage += Math.max(8, Math.floor((ch.content?.length || 500) / 350));
      return {
        id: ch.id,
        title: ch.title || `Chapter ${idx + 1}`,
        page: pageNum,
        type: 'chapter'
      };
    });

    const frontmatterItems = frontmatter.map((fm) => {
      return {
        id: fm.id,
        title: fm.title || 'Frontmatter Section',
        page: 3,
        type: 'frontmatter'
      };
    });

    const assetItems = uploadedAssets.map((asset, idx) => ({
      id: `asset-${idx}`,
      title: asset.name || `Uploaded Reference ${idx + 1}`,
      page: runningPage + (idx * 4),
      type: 'uploaded'
    }));

    const corpusItems = generatedCorpus.map((item, idx) => ({
      id: `corpus-${idx}`,
      title: item.title || `Generated Module ${idx + 1}`,
      page: runningPage + assetItems.length * 4 + (idx * 6),
      type: 'generated'
    }));

    return [...frontmatterItems, ...chapterItems, ...assetItems, ...corpusItems];
  }, [chapters, frontmatter, uploadedAssets, generatedCorpus]);

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col gap-6 px-4 h-full pb-32 mt-8 font-sans select-none">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/5 pb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.15)]">
            <ListOrdered size={20} />
          </div>
          <div>
            <h2 className="text-xs font-mono font-bold text-slate-100 uppercase tracking-widest flex items-center gap-2">
              <span>Universal Table of Contents</span>
              <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 text-[9px] border border-amber-500/30">SYNCED</span>
            </h2>
            <p className="text-[10px] text-slate-500 font-mono mt-0.5">Dynamically indexing typed chapters, uploaded assets, and AI-generated corpus.</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 h-[75vh]">
        
        {/* Editor Controls Sidebar */}
        <div className="w-full lg:w-80 shrink-0 flex flex-col gap-6">
          <div className="p-6 rounded-2xl bg-[#0c0e12] border border-white/5 shadow-xl space-y-5">
            <h3 className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
              <Database size={14} className="text-amber-400" />
              Content Integration
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed font-serif">
              The Table of Contents automatically detects and indexes all active manuscript content, external uploads, and AI-generated outputs for professional print compilation.
            </p>
            <div className="pt-4 border-t border-white/5 space-y-2 font-mono text-[10px] text-slate-400">
              <div className="flex justify-between"><span>Typed Chapters:</span><span className="text-amber-400 font-bold">{chapters.length}</span></div>
              <div className="flex justify-between"><span>Uploaded Assets:</span><span className="text-amber-400 font-bold">{uploadedAssets.length}</span></div>
              <div className="flex justify-between"><span>Generated Corpus:</span><span className="text-amber-400 font-bold">{generatedCorpus.length}</span></div>
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
          <div className="w-full h-full flex flex-col z-10 pl-6 space-y-8 overflow-y-auto custom-scrollbar pr-4">
            <h1 
              className="text-3xl font-bold tracking-tight text-slate-900 text-center uppercase mb-6"
              style={{ fontFamily: fontHeading }}
            >
              Table of Contents
            </h1>
            
            <div className="space-y-4 max-w-md mx-auto w-full">
              {unifiedIndex.map((item) => (
                <div key={item.id} className="flex items-baseline justify-between text-base" style={{ fontFamily: fontBody }}>
                  <span className="font-medium text-slate-800 flex items-center gap-2">
                    {item.title}
                    {item.type === 'uploaded' && <FileUp size={12} className="text-amber-600 opacity-70" />}
                    {item.type === 'generated' && <Sparkles size={12} className="text-purple-600 opacity-70" />}
                  </span>
                  <span className="flex-grow border-b border-dotted border-slate-400 mx-3 relative -top-1"></span>
                  <span className="font-mono text-slate-600 text-sm">{item.page}</span>
                </div>
              ))}
              {unifiedIndex.length === 0 && (
                <div className="text-center text-slate-500 italic font-serif">No content indexed yet.</div>
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