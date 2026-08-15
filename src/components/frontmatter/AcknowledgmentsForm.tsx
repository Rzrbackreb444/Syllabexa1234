import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useManuscriptStore } from '../../store/manuscriptStore';
import { HeartHandshake, PenTool, Sparkles, LayoutTemplate } from 'lucide-react';

// Practical serializer to ensure line breaks from the textarea are preserved in the final HTML/PDF
const serializeToHtml = (text: string): string => {
  if (!text.trim()) return '';
  return text
    .split('\n')
    .map(line => line.trim() ? `<p>${line.trim()}</p>` : '<br/>')
    .join('');
};

// Simple HTML stripper to safely populate the textarea on load
const stripHtml = (html?: string): string => {
  if (!html) return '';
  if (typeof window !== 'undefined') {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || '';
  }
  return html.replace(/<[^>]*>?/gm, '');
};

export default function AcknowledgmentsForm() {
  // OPTIMIZATION: Strict Atomic Selectors to eliminate re-render cascades
  const activeId = useManuscriptStore(state => state.selectedChapterId);
  const fontBody = useManuscriptStore(state => state.prepressRules.fontBody);
  const updateFrontmatterContent = useManuscriptStore(state => state.updateFrontmatter);
  
  const activeContent = useManuscriptStore(state => {
    const doc = state.frontmatter.find(f => f.id === state.selectedChapterId);
    return doc?.content || '';
  });

  const [textContent, setTextContent] = useState('');
  const debounceTimerRef = useRef<number | null>(null);

  // Hydrate the textarea when the active document changes
  useEffect(() => {
    if (activeContent !== undefined) {
      setTextContent(stripHtml(activeContent));
    }
  }, [activeId, activeContent]); 

  // Cleanup timeout on unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) window.clearTimeout(debounceTimerRef.current);
    };
  }, []);

  // OPTIMIZATION: Stabilized callback prevents stale closures and recreation overhead
  const handleTextChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setTextContent(value);

    if (!activeId) return;

    if (debounceTimerRef.current) window.clearTimeout(debounceTimerRef.current);

    debounceTimerRef.current = window.setTimeout(() => {
      updateFrontmatterContent(activeId, serializeToHtml(value));
    }, 400);
  }, [activeId, updateFrontmatterContent]);

  const handleInsertTemplate = useCallback(() => {
    const template = `I would like to express my deepest appreciation to my family and friends for their unwavering support during the writing of this book.\n\nSpecial thanks to my editor, whose sharp eye and critical feedback shaped this manuscript, and to my publishing team for bringing this vision to life.\n\nFinally, to the readers—thank you for picking up this book and sharing in this journey.`;
    setTextContent(template);
    if (activeId) {
      updateFrontmatterContent(activeId, serializeToHtml(template));
    }
  }, [activeId, updateFrontmatterContent]);

  if (!activeId) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 font-mono text-xs tracking-widest gap-3">
        <HeartHandshake size={24} className="opacity-50" />
        NO FRONTMATTER DOCUMENT SELECTED
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-6 px-4 h-full pb-32 mt-8 font-sans select-none">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/5 pb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.15)]">
            <HeartHandshake size={20} />
          </div>
          <div>
            <h2 className="text-xs font-mono font-bold text-slate-100 uppercase tracking-widest flex items-center gap-2">
              <span>Acknowledgments</span>
            </h2>
            <p className="text-[10px] text-slate-500 font-mono mt-0.5">Express gratitude to the people who made this book possible.</p>
          </div>
        </div>
        
        {!textContent.trim() && (
          <button 
            onClick={handleInsertTemplate}
            className="flex items-center gap-2 px-4 py-2 bg-[#161a22] hover:bg-[#1e232e] border border-white/5 text-amber-400 font-mono text-[10px] uppercase tracking-widest rounded-xl cursor-pointer transition-all font-bold shadow-sm"
          >
            <LayoutTemplate size={14} />
            Insert Template
          </button>
        )}
      </div>

      <div className="flex gap-8 h-[75vh]">
        
        {/* Helper Sidebar */}
        <div className="w-64 shrink-0 flex flex-col gap-4">
          <div className="p-5 rounded-2xl bg-[#0c0e12] border border-white/5 shadow-xl">
            <h3 className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2 mb-3">
              <Sparkles size={14} className="text-amber-400" />
              Writing Guide
            </h3>
            <ul className="text-xs text-slate-500 space-y-3 leading-relaxed">
              <li>• Acknowledge your editor, publisher, or beta readers who shaped the manuscript.</li>
              <li>• Keep personal thanks concise but heartfelt.</li>
              <li>• Mention any grants, institutions, or subject-matter experts who provided research assistance.</li>
            </ul>
          </div>
        </div>

        {/* The Recto Page Canvas (Spine shadow on the left) */}
        <div className="flex-1 p-16 bg-[#f4f1ea] text-slate-900 rounded-r-sm shadow-[0_20px_50px_-12px_rgba(0,0,0,0.5)] relative flex flex-col transition-all duration-300 focus-within:ring-1 focus-within:ring-amber-500/50 overflow-hidden group">
          <div className="absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-[rgba(0,0,0,0.08)] to-transparent pointer-events-none" />
          <div className="absolute inset-y-0 right-0 w-[1px] bg-gradient-to-b from-transparent via-black/5 to-transparent pointer-events-none" />

          <div className="w-full h-full flex flex-col z-10 pl-6">
            <h1 
              className="text-2xl font-bold mb-10 text-center tracking-wide"
              style={{ fontFamily: fontBody }}
            >
              Acknowledgments
            </h1>
            
            <textarea
              value={textContent}
              onChange={handleTextChange}
              placeholder="I would like to thank..."
              className="w-full flex-1 bg-transparent border-none text-[15px] leading-loose text-slate-800 focus:outline-none resize-none custom-scrollbar placeholder:text-slate-400"
              style={{ fontFamily: fontBody }}
            />
          </div>
          
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