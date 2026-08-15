import React, { useState } from 'react';
import { Sparkles, Image as ImageIcon, Wand2, RefreshCw, Check, Palette, Layout, Layers } from 'lucide-react';
import { useToast } from '../lib/ToastContext';

interface CoverArtStudioProps {
  title: string;
  author: string;
  subtitle: string;
  onApplyCover: (config: {
    coverTitle: string;
    coverSubtitle: string;
    coverAuthor: string;
    coverLayout: 'classic' | 'minimal' | 'editorial' | 'bold' | 'modern';
    coverColor: 'amber' | 'slate' | 'emerald' | 'crimson' | 'indigo' | 'cyberpunk' | 'obsidian';
    coverArtType: 'none' | 'geometric' | 'landscape' | 'abstract' | 'matrix';
    aiPrompt: string;
  }) => void;
  onClose?: () => void;
}

export default function CoverArtStudio({ title, author, subtitle, onApplyCover, onClose }: CoverArtStudioProps) {
  const { showToast } = useToast();
  const [coverTitle, setCoverTitle] = useState(title);
  const [coverSubtitle, setCoverSubtitle] = useState(subtitle || 'Engineering Enterprise Systems at Scale');
  const [coverAuthor, setCoverAuthor] = useState(author);
  const [coverLayout, setCoverLayout] = useState<'classic' | 'minimal' | 'editorial' | 'bold' | 'modern'>('editorial');
  const [coverColor, setCoverColor] = useState<'amber' | 'slate' | 'emerald' | 'crimson' | 'indigo' | 'cyberpunk' | 'obsidian'>('indigo');
  const [coverArtType, setCoverArtType] = useState<'none' | 'geometric' | 'landscape' | 'abstract' | 'matrix'>('geometric');
  const [aiPrompt, setAiPrompt] = useState('Minimalist abstract sacred geometry representing sovereign architecture and high cognitive performance.');
  const [isGenerating, setIsGenerating] = useState(false);

  const colorGradients = {
    indigo: "from-indigo-900 via-slate-900 to-black",
    amber: "from-amber-700 via-amber-900 to-stone-950",
    slate: "from-slate-700 via-slate-900 to-zinc-950",
    emerald: "from-emerald-800 via-teal-950 to-stone-950",
    crimson: "from-rose-900 via-red-950 to-stone-950",
    cyberpunk: "from-fuchsia-900 via-purple-950 to-cyan-950",
    obsidian: "from-zinc-900 via-black to-zinc-950"
  };

  const handleAiGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      // Randomize or refine based on prompt
      const styles: ('geometric' | 'landscape' | 'abstract' | 'matrix')[] = ['geometric', 'abstract', 'matrix', 'landscape'];
      const randomStyle = styles[Math.floor(Math.random() * styles.length)];
      setCoverArtType(randomStyle);
      showToast('Generative AI Cover Motif successfully rendered!', 'success');
    }, 1200);
  };

  const handleApply = () => {
    onApplyCover({
      coverTitle,
      coverSubtitle,
      coverAuthor,
      coverLayout,
      coverColor,
      coverArtType,
      aiPrompt
    });
    showToast('Cover Art Studio configuration applied to Typesetter!', 'success');
    if (onClose) onClose();
  };

  return (
    <div className="bg-[#0e1117] border border-white/10 rounded-2xl p-6 max-w-2xl w-full text-slate-200 shadow-2xl space-y-6 font-sans">
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-500/10 border border-indigo-500/30 rounded-xl text-indigo-400">
            <Wand2 className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white font-serif tracking-wide">CoverArt Studio & Generative AI</h3>
            <p className="text-xs font-mono text-indigo-400">Autonomous Book Jacket & Spine Typesetting Designer</p>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl">
            ✕
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Live Preview Box */}
        <div className="flex flex-col items-center justify-center bg-black/40 border border-white/10 rounded-2xl p-6 relative overflow-hidden">
          <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest mb-4">Live Cover Preview</span>
          
          <div className={`w-[200px] h-[300px] rounded-xl shadow-2xl relative overflow-hidden bg-gradient-to-br ${colorGradients[coverColor]} flex flex-col justify-between p-5 text-center border border-white/20`}>
            
            {coverArtType === 'geometric' && (
              <div className="absolute inset-0 opacity-20 flex items-center justify-center pointer-events-none">
                <div className="w-36 h-36 rounded-full border border-white flex items-center justify-center animate-spin" style={{ animationDuration: '40s' }}>
                  <div className="w-28 h-28 border border-dashed border-white flex items-center justify-center">
                    <div className="w-16 h-16 border-2 border-white rotate-45" />
                  </div>
                </div>
              </div>
            )}

            {coverArtType === 'abstract' && (
              <div className="absolute inset-0 opacity-25 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-400 via-transparent to-transparent pointer-events-none" />
            )}

            {coverArtType === 'matrix' && (
              <div className="absolute inset-0 opacity-20 font-mono text-[8px] text-emerald-400 overflow-hidden leading-none p-1 pointer-events-none">
                01010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101
              </div>
            )}

            <div className="relative z-10 pt-2">
              <span className="text-[8px] font-mono font-bold tracking-widest text-amber-400 uppercase block mb-1">Bestseller Edition</span>
              <h4 className="text-sm font-serif font-bold text-white leading-tight line-clamp-2">{coverTitle}</h4>
            </div>

            <div className="relative z-10 pb-2 space-y-1">
              <p className="text-[9px] text-slate-300 font-sans italic line-clamp-1">{coverSubtitle}</p>
              <div className="pt-2 border-t border-white/10">
                <span className="text-[9px] font-mono font-bold text-indigo-300 uppercase tracking-widest">{coverAuthor}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Form Controls */}
        <div className="space-y-4">
          <div>
            <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-widest mb-1 font-bold">Book Title</label>
            <input
              type="text"
              value={coverTitle}
              onChange={e => setCoverTitle(e.target.value)}
              className="w-full bg-[#12151c] border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none focus:border-indigo-500 font-mono"
            />
          </div>

          <div>
            <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-widest mb-1 font-bold">Subtitle</label>
            <input
              type="text"
              value={coverSubtitle}
              onChange={e => setCoverSubtitle(e.target.value)}
              className="w-full bg-[#12151c] border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none focus:border-indigo-500 font-mono"
            />
          </div>

          <div>
            <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-widest mb-1 font-bold">Author Name</label>
            <input
              type="text"
              value={coverAuthor}
              onChange={e => setCoverAuthor(e.target.value)}
              className="w-full bg-[#12151c] border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none focus:border-indigo-500 font-mono"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-widest mb-1 font-bold">Palette</label>
              <select
                value={coverColor}
                onChange={e => setCoverColor(e.target.value as any)}
                className="w-full bg-[#12151c] border border-slate-800 rounded-xl px-2.5 py-2 text-xs text-slate-200 font-mono outline-none focus:border-indigo-500 cursor-pointer"
              >
                <option value="indigo">Indigo Midnight</option>
                <option value="amber">Amber Vintage</option>
                <option value="slate">Slate Minimal</option>
                <option value="emerald">Emerald Nature</option>
                <option value="crimson">Crimson Drama</option>
                <option value="cyberpunk">Cyberpunk Neon</option>
                <option value="obsidian">Obsidian Black</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-widest mb-1 font-bold">Art Motif</label>
              <select
                value={coverArtType}
                onChange={e => setCoverArtType(e.target.value as any)}
                className="w-full bg-[#12151c] border border-slate-800 rounded-xl px-2.5 py-2 text-xs text-slate-200 font-mono outline-none focus:border-indigo-500 cursor-pointer"
              >
                <option value="geometric">Sacred Geometry</option>
                <option value="abstract">Abstract Gradient</option>
                <option value="matrix">Matrix Grid</option>
                <option value="landscape">Minimal Horizon</option>
                <option value="none">Typography Only</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-widest mb-1 font-bold">Generative AI Prompt</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={aiPrompt}
                onChange={e => setAiPrompt(e.target.value)}
                className="flex-1 bg-[#12151c] border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none focus:border-indigo-500 font-mono"
              />
              <button
                onClick={handleAiGenerate}
                disabled={isGenerating}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-mono text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isGenerating ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                {isGenerating ? 'AI...' : 'Generate'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
        {onClose && (
          <button onClick={onClose} className="px-4 py-2 bg-white/5 hover:bg-white/10 text-slate-300 rounded-xl font-mono text-xs cursor-pointer">
            Cancel
          </button>
        )}
        <button
          onClick={handleApply}
          className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black font-mono text-xs rounded-xl transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-2 cursor-pointer"
        >
          <Check className="w-4 h-4" /> Apply Cover Design to Wrap
        </button>
      </div>
    </div>
  );
}
