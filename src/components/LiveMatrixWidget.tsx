import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Terminal, Sparkles, Play, Loader2, Bot } from 'lucide-react';
import { useEngineMatrix, AiProvider } from '../hooks/useEngineMatrix';

export default function LiveMatrixWidget() {
  const [genre, setGenre] = useState('thriller');
  const [prompt, setPrompt] = useState('Infiltrate the mainframe before lockdown.');
  const [provider, setProvider] = useState<AiProvider>('openai');
  const { status, logs, output, runEngine } = useEngineMatrix();

  return (
    <div className="bg-[#0a0c10] border border-white/10 rounded-2xl p-6 shadow-2xl space-y-6">
      <div className="flex items-center justify-between border-b border-white/5 pb-4">
        <div className="flex items-center gap-2">
          <Terminal className="text-amber-400" size={18} />
          <h3 className="text-sm font-mono font-bold uppercase tracking-widest text-slate-200">Live Agentic Matrix</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center gap-1.5 font-bold">
            {status === 'drafting' ? <Loader2 size={10} className="animate-spin" /> : <Sparkles size={10} />}
            {status.toUpperCase()}
          </span>
        </div>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <select 
            value={genre} 
            onChange={(e) => setGenre(e.target.value)}
            className="bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-slate-300 outline-none"
          >
            <option value="thriller">Cyberpunk Thriller</option>
            <option value="romance">Dramatic Romance</option>
            <option value="scifi">Hard Sci-Fi</option>
            <option value="nonfiction">Business Doctrine</option>
          </select>
          <select 
            value={provider} 
            onChange={(e) => setProvider(e.target.value as AiProvider)}
            className="bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-amber-400 border-amber-500/20 outline-none"
          >
            <option value="openai">OpenAI GPT-4o Engine</option>
            <option value="gemini">Gemini 2.5 Flash Engine</option>
            <option value="auto">Auto Matrix Selection</option>
          </select>
          <input 
            type="text" 
            value={prompt} 
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Scene directive..."
            className="bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none"
          />
        </div>

        <button
          onClick={() => runEngine(genre, prompt, provider)}
          disabled={status === 'drafting' || status === 'analyzing' || status === 'retrieving'}
          className="w-full py-3 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-mono text-xs font-black uppercase tracking-widest rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer"
        >
          <Play size={14} /> Execute Neural Generation ({provider.toUpperCase()})
        </button>
      </div>

      {/* Output Console */}
      <div className="bg-[#050608] border border-white/5 rounded-xl p-4 font-mono text-xs space-y-3 h-48 overflow-y-auto custom-scrollbar">
        <div className="text-slate-300 whitespace-pre-wrap font-serif leading-relaxed">
          {output || <span className="text-slate-600 font-mono italic">Awaiting prompt execution...</span>}
        </div>
        <div className="border-t border-white/5 pt-3 space-y-1 text-[10px] text-slate-500">
          {logs.map((l, i) => (
            <motion.div initial={{ opacity: 0, x: -5 }} animate={{ opacity: 1, x: 0 }} key={i} className={l.includes('[SUCCESS]') ? 'text-emerald-400 font-bold' : l.includes('[MODEL]') ? 'text-indigo-400 font-bold' : 'text-amber-400'}>
              {l}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
