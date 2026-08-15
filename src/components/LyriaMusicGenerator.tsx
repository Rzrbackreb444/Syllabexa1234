import React, { useState } from 'react';
import { Music, Play, Square, Settings2, Download } from 'lucide-react';
import { useToast } from '../lib/ToastContext';

export default function LyriaMusicGenerator() {
  const { showToast } = useToast();
  const [prompt, setPrompt] = useState('Epic cinematic orchestral score with rising tension, perfect for a high-stakes thriller climax.');
  const [modelType, setModelType] = useState<'lyria-3-clip-preview' | 'lyria-3-pro-preview'>('lyria-3-clip-preview');
  const [status, setStatus] = useState<'idle' | 'generating' | 'playing'>('idle');
  const [progress, setProgress] = useState(0);

  const handleGenerate = () => {
    setStatus('generating');
    setProgress(0);
    showToast(`Generating ${modelType === 'lyria-3-clip-preview' ? 'short clip' : 'full track'} with Lyria...`, 'info');

    // Simulate API call to Lyria model
    const interval = setInterval(() => {
      setProgress(p => {
        if (p >= 100) {
          clearInterval(interval);
          setStatus('idle');
          showToast('Music generation complete!', 'success');
          return 100;
        }
        return p + 5;
      });
    }, 200);
  };

  const handleExport = () => {
    showToast('Exporting WAV track...', 'success');
  };

  return (
    <div className="bg-[#0a0a0d] border border-white/5 p-5 rounded-2xl space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
          <Music size={14} className="text-emerald-400" /> Lyria Soundtrack Engine
        </span>
        <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-mono border border-emerald-500/20">
          Powered by Gemini Lyria
        </span>
      </div>

      <div className="space-y-3">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe the music you want to generate..."
          className="w-full h-20 bg-black/50 border border-white/10 rounded-xl p-3 text-xs text-white focus:border-emerald-500 outline-none resize-none"
        />

        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <select
            value={modelType}
            onChange={(e) => setModelType(e.target.value as any)}
            className="flex-1 bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:border-emerald-500 outline-none"
          >
            <option value="lyria-3-clip-preview">lyria-3-clip-preview (30s Clip)</option>
            <option value="lyria-3-pro-preview">lyria-3-pro-preview (Full Track)</option>
          </select>

          <button
            onClick={handleGenerate}
            disabled={status === 'generating'}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-bold rounded-xl transition-all shadow-lg shadow-emerald-600/20 disabled:opacity-50 flex justify-center items-center gap-2"
          >
            {status === 'generating' ? <Settings2 className="animate-spin" size={14} /> : <Play size={14} />}
            {status === 'generating' ? 'Generating...' : 'Compose Track'}
          </button>
        </div>

        {status === 'generating' && (
          <div className="space-y-1 pt-2">
            <div className="h-1 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 transition-all duration-200" style={{ width: `${progress}%` }} />
            </div>
            <div className="text-[10px] font-mono text-emerald-400 text-right">{progress}%</div>
          </div>
        )}
        
        {progress === 100 && status === 'idle' && (
          <div className="flex items-center justify-between p-3 bg-emerald-950/20 border border-emerald-500/30 rounded-xl mt-3">
            <div className="flex items-center gap-3 text-xs text-emerald-300">
              <Play size={16} className="cursor-pointer hover:text-emerald-400" />
              <span className="font-mono">Generated_Theme_Lyria.wav</span>
            </div>
            <button
              onClick={handleExport}
              className="text-emerald-400 hover:text-white transition-colors"
            >
              <Download size={14} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
