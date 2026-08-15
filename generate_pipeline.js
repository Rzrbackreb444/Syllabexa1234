const fs = require('fs');

const content = `import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Globe, Search, Cpu, Sparkles, Feather, ShieldCheck, CheckCircle2, 
  Layers, ChevronRight, Play, RefreshCw, Terminal, Sliders, FileText, 
  BookOpen, ExternalLink, Zap, ArrowRight, Share2, Copy, Check, Upload,
  FileCode, Layers3, Wand2, Scissors, Paperclip, FileUp, Maximize2, Minimize2, X,
  BookmarkCheck, Sparkle, Download, Printer, PlayCircle, PauseCircle, FastForward, Eye, Code, FileDown,
  LayoutTemplate
} from 'lucide-react';
import { useToast } from '../lib/ToastContext';
import { useManuscriptStore } from '../store/manuscriptStore';

export interface QuickPreset {
  id: string;
  name: string;
  genre: string;
  topic: string;
  targetAudience: string;
}

export const QUICK_PRESETS: QuickPreset[] = [
  {
    id: 'thought-leadership',
    name: 'Executive Thought Leadership',
    genre: 'Executive Thought Leadership',
    topic: 'Autonomous AI Operations in Enterprise Cloud Infrastructure',
    targetAudience: 'Fortune 500 CTOs, VPs of Engineering & Tech Investors'
  },
  {
    id: 'cyberpunk-scifi',
    name: 'Hard Sci-Fi / Cyberpunk',
    genre: 'Hard Sci-Fi / Cyberpunk',
    topic: 'Neural Mesh Consciousness & Orbital Sovereign Hardware',
    targetAudience: 'Sci-Fi Enthusiasts, Futurists & Speculative Fiction Readers'
  },
  {
    id: 'business-guide',
    name: 'Non-Fiction Business Guide',
    genre: 'Executive Thought Leadership',
    topic: 'The Zero-Friction Enterprise: Scaling Sovereign AI Agent Frameworks',
    targetAudience: 'Startup Founders, Product Leaders & Management Consultants'
  },
  {
    id: 'thriller',
    name: 'Dark Psychological Thriller',
    genre: 'Dark Psychological Thriller',
    topic: 'The Algorithmic Mirror: Memory Manipulation in High-Density Cities',
    targetAudience: 'Psychological Thriller & Mystery Readers'
  },
  {
    id: 'tech-manual',
    name: 'Technical & Engineering Manual',
    genre: 'Technical & Engineering Manual',
    topic: 'Distributed Quantum Consensus & Zero-Knowledge Verification Protocols',
    targetAudience: 'Senior Systems Engineers & Cryptographic Developers'
  },
  {
    id: 'fantasy',
    name: 'Epic Fantasy Worldbuilding',
    genre: 'Epic Fantasy Worldbuilding',
    topic: 'The Runes of Ash and Aether: The Sovereign Dynasty Chronicles',
    targetAudience: 'Epic Fantasy Readers & Worldbuilding Enthusiasts'
  }
];

type PipelineStatus = 'idle' | 'researching' | 'architecting' | 'drafting' | 'polishing' | 'paused' | 'completed';

interface ChapterDraft {
  number: number;
  title: string;
  beat: string;
  summary: string;
  status: 'pending' | 'drafting' | 'polishing' | 'completed';
  content?: string;
  logs?: string[];
}

interface WaterfallState {
  status: PipelineStatus;
  researchData?: any;
  outlineChapters: ChapterDraft[];
  currentChapterIndex: number;
  totalTokens: number;
  estimatedCost: number;
  globalLogs: string[];
}

const DEFAULT_STATE: WaterfallState = {
  status: 'idle',
  outlineChapters: [],
  currentChapterIndex: 0,
  totalTokens: 0,
  estimatedCost: 0,
  globalLogs: []
};

export default function SyllabexaMultiModelPipeline() {
  const { addToast, showToast } = useToast();
  const addChapter = useManuscriptStore(state => state.addChapter);

  // Configuration Inputs
  const [topic, setTopic] = useState('Autonomous AI Operations in Quantum Cloud Computing');
  const [genre, setGenre] = useState('Hard Sci-Fi / Cyberpunk');
  const [targetAudience, setTargetAudience] = useState('Enterprise Technologists & Thought Leaders');
  const [selectedPresetId, setSelectedPresetId] = useState<string>('cyberpunk-scifi');
  
  // UI Mode
  const [isDeveloperMode, setIsDeveloperMode] = useState(false);
  
  // Pipeline State
  const [state, setState] = useState<WaterfallState>(() => {
    try {
      const saved = localStorage.getItem('syllabexa_waterfall_state');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return DEFAULT_STATE;
  });

  // Seed Draft
  const [starterDraft, setStarterDraft] = useState('');
  const [starterFileName, setStarterFileName] = useState('');

  // Persist State
  useEffect(() => {
    localStorage.setItem('syllabexa_waterfall_state', JSON.stringify(state));
  }, [state]);

  const addLog = (msg: string, chapterIndex?: number) => {
    setState(prev => {
      const ts = new Date().toISOString().substring(11, 19);
      const logEntry = \`[\${ts}] \${msg}\`;
      
      const newState = { ...prev, globalLogs: [...prev.globalLogs, logEntry].slice(-200) };
      
      if (chapterIndex !== undefined && newState.outlineChapters[chapterIndex]) {
        const chap = newState.outlineChapters[chapterIndex];
        const newChap = { ...chap, logs: [...(chap.logs || []), logEntry].slice(-50) };
        newState.outlineChapters = [...newState.outlineChapters];
        newState.outlineChapters[chapterIndex] = newChap;
      }
      return newState;
    });
  };

  const handleApplyPreset = (presetId: string) => {
    const preset = QUICK_PRESETS.find(p => p.id === presetId);
    if (!preset) return;
    setSelectedPresetId(preset.id);
    setGenre(preset.genre);
    setTopic(preset.topic);
    setTargetAudience(preset.targetAudience);
    showToast(\`✨ Preset "\${preset.name}" loaded!\`, 'success');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      if (ev.target?.result) {
        setStarterDraft(ev.target.result as string);
        setStarterFileName(file.name);
        showToast(\`Ingested \${file.name}\`, 'success');
      }
    };
    reader.readAsText(file);
  };

  const generateChapter = async (index: number, outline: any, research: any) => {
    if (state.status === 'paused') return false;
    
    // Drafting
    setState(s => {
      const chaps = [...s.outlineChapters];
      chaps[index] = { ...chaps[index], status: 'drafting' };
      return { ...s, status: 'drafting', outlineChapters: chaps };
    });
    addLog(\`[Gemini 2.5 Flash] Initializing draft for Chapter \${index + 1}...\`, index);
    
    try {
      const draftRes = await fetch('/api/syllabexa/multi-model-draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic, genre, 
          outline: outline.chapters[index],
          research,
          starterDraft
        })
      });
      const draftData = await draftRes.json();
      const rawText = draftData.content;
      
      addLog(\`[Gemini 2.5 Flash] Draft generated (\${rawText?.length} chars)\`, index);
      
      // Polishing
      if (state.status === 'paused') return false;
      setState(s => {
        const chaps = [...s.outlineChapters];
        chaps[index] = { ...chaps[index], status: 'polishing', content: rawText };
        return { ...s, status: 'polishing', outlineChapters: chaps };
      });
      addLog(\`[Claude 3.5 Sonnet] Refining prose and emotional resonance for Chapter \${index + 1}...\`, index);
      
      const polishRes = await fetch('/api/syllabexa/multi-model-polish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rawText, genre })
      });
      const polishData = await polishRes.json();
      const polishedText = polishData.polishedContent;
      
      addLog(\`[Claude 3.5 Sonnet] Chapter \${index + 1} polished and finalized.\`, index);
      
      setState(s => {
        const chaps = [...s.outlineChapters];
        chaps[index] = { ...chaps[index], status: 'completed', content: polishedText };
        return { ...s, outlineChapters: chaps, totalTokens: s.totalTokens + 35000, estimatedCost: s.estimatedCost + 0.12 };
      });

      // Commit to manuscript store automatically
      addChapter({
        id: crypto.randomUUID(),
        title: chaps[index].title,
        content: polishedText,
        orderIndex: index
      });
      addLog(\`✅ Chapter \${index + 1} committed to Global Manuscript Store.\`, index);

      return true;
    } catch (err: any) {
      addLog(\`❌ Error generating chapter \${index + 1}: \${err.message}\`, index);
      setState(s => ({ ...s, status: 'paused' }));
      return false;
    }
  };

  const startPipeline = async () => {
    setState(s => ({ ...s, status: 'researching', currentChapterIndex: 0, outlineChapters: [], globalLogs: [] }));
    addLog('[Perplexity] Initiating deep web grounding & research phase...');
    
    try {
      const res = await fetch('/api/syllabexa/multi-model-research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, genre, targetAudience, starterDraft })
      });
      const researchData = await res.json();
      addLog('[Perplexity] Grounding phase complete. Moving to architecture...');
      
      setState(s => ({ ...s, status: 'architecting', researchData, totalTokens: s.totalTokens + 15000, estimatedCost: s.estimatedCost + 0.05 }));
      addLog('[GPT-4o] Constructing Chapter Waterfall architecture...');
      
      const archRes = await fetch('/api/syllabexa/multi-model-outline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, genre, researchData, starterDraft })
      });
      const archData = await archRes.json();
      
      const outlineChapters = archData.chapters.map((c: any) => ({
        number: c.number,
        title: c.title,
        beat: c.beat,
        summary: c.summary,
        status: 'pending' as const
      }));
      
      setState(s => ({ ...s, outlineChapters, totalTokens: s.totalTokens + 22000, estimatedCost: s.estimatedCost + 0.08 }));
      addLog(\`[GPT-4o] Architecture locked. \${outlineChapters.length} chapters mapped. Starting Waterfall generation...\`);
      
      // Start Chapter Loop
      resumePipeline(outlineChapters, researchData, 0);

    } catch (err: any) {
      addLog(\`❌ Pipeline Error: \${err.message}\`);
      setState(s => ({ ...s, status: 'paused' }));
    }
  };

  const resumePipeline = async (chapters = state.outlineChapters, research = state.researchData, startIndex = state.currentChapterIndex) => {
    setState(s => ({ ...s, status: 'drafting', currentChapterIndex: startIndex }));
    addLog(\`▶️ Resuming Chapter Waterfall from Chapter \${startIndex + 1}...\`);
    
    let currentIndex = startIndex;
    while (currentIndex < chapters.length) {
      // Before starting the chapter, check if paused (the generator will also check)
      if (state.status === 'paused') {
        addLog('⏸️ Pipeline paused by user.');
        break;
      }
      
      const success = await generateChapter(currentIndex, { chapters }, research);
      if (!success) {
        addLog('⏸️ Pipeline paused or encountered an error.');
        break;
      }
      currentIndex++;
      setState(s => ({ ...s, currentChapterIndex: currentIndex }));
    }
    
    if (currentIndex >= chapters.length) {
      setState(s => ({ ...s, status: 'completed' }));
      addLog('🎉 Waterfall Pipeline execution fully completed!');
      showToast('Manuscript generation completed successfully!', 'success');
    }
  };

  const pausePipeline = () => {
    setState(s => ({ ...s, status: 'paused' }));
    addLog('⏸️ Pause requested. Will halt after current agent operation completes.');
    showToast('Pipeline pausing...', 'info');
  };

  const resetPipeline = () => {
    if (confirm("Are you sure you want to reset the pipeline? This will clear current generation progress.")) {
      setState(DEFAULT_STATE);
      localStorage.removeItem('syllabexa_waterfall_state');
    }
  };

  const handleExport = async (format: 'pdf' | 'docx' | 'epub' | 'audiobook') => {
    const toastId = showToast(\`Generating \${format.toUpperCase()}...\`, 'info');
    try {
      const res = await fetch(\`/api/syllabexa/export-\${format}\`, { method: 'POST', body: JSON.stringify({ state }) });
      const data = await res.json();
      if (data.success) {
        addToast(\`✅ \${format.toUpperCase()} Exported successfully!\`, 'success');
        // trigger download natively by creating a link
        const link = document.createElement('a');
        link.href = data.url;
        link.download = \`manuscript.\${format === 'audiobook' ? 'wav' : format}\`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (err: any) {
      addToast(\`Failed to export \${format.toUpperCase()}: \${err.message}\`, 'error');
    }
  };

  const activeChapter = state.outlineChapters[state.currentChapterIndex] || state.outlineChapters[state.outlineChapters.length - 1];

  return (
    <div className="w-full mx-auto space-y-6 animate-in fade-in zoom-in duration-500 font-sans">
      
      {/* HEADER & CONTROLS */}
      <div className="bg-[#0c0e12] border border-white/10 rounded-3xl p-6 shadow-2xl space-y-6">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="space-y-1">
            <h1 className="text-xl font-bold font-serif text-slate-100 flex items-center gap-3">
              <Layers3 className="text-indigo-400" size={24} />
              Syllabexa Chapter Waterfall Engine
            </h1>
            <p className="text-sm text-slate-400 max-w-2xl">
              Sequentially orchestrate Perplexity, GPT-4o, Gemini 2.5 Flash, and Claude 3.5 Sonnet to architect and draft complete manuscripts chapter-by-chapter with infinite lore consistency.
            </p>
          </div>
          
          <div className="flex items-center gap-3 bg-black/40 border border-white/5 p-1.5 rounded-xl">
            <button 
              onClick={() => setIsDeveloperMode(false)}
              className={\`px-4 py-2 rounded-lg text-xs font-bold uppercase flex items-center gap-2 transition-all \${!isDeveloperMode ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'}\`}
            >
              <Eye size={14} /> Author Mode
            </button>
            <button 
              onClick={() => setIsDeveloperMode(true)}
              className={\`px-4 py-2 rounded-lg text-xs font-bold uppercase flex items-center gap-2 transition-all \${isDeveloperMode ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-slate-200'}\`}
            >
              <Code size={14} /> Telemetry
            </button>
          </div>
        </div>

        {/* Configuration inputs - Only show if not started or reset */}
        {state.status === 'idle' && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 pt-4 border-t border-white/5">
            <div className="lg:col-span-1 space-y-4">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <BookmarkCheck size={14} className="text-indigo-400" /> Quick-Start Presets
              </label>
              <div className="space-y-2">
                {QUICK_PRESETS.map(preset => (
                  <button
                    key={preset.id}
                    onClick={() => handleApplyPreset(preset.id)}
                    className={\`w-full text-left px-3 py-2.5 rounded-xl text-xs transition-all border \${
                      selectedPresetId === preset.id 
                        ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-300 font-bold' 
                        : 'bg-white/5 border-white/5 text-slate-400 hover:bg-white/10 hover:text-slate-200'
                    }\`}
                  >
                    {preset.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2 md:col-span-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Core Premise & Topic</label>
                <input 
                  type="text" 
                  value={topic} 
                  onChange={e => setTopic(e.target.value)} 
                  className="w-full bg-[#040506] border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-serif"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Genre Archetype</label>
                <input 
                  type="text" 
                  value={genre} 
                  onChange={e => setGenre(e.target.value)} 
                  className="w-full bg-[#040506] border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Target Audience</label>
                <input 
                  type="text" 
                  value={targetAudience} 
                  onChange={e => setTargetAudience(e.target.value)} 
                  className="w-full bg-[#040506] border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 transition-all"
                />
              </div>
              
              <div className="md:col-span-2 p-4 rounded-xl border border-white/5 bg-black/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                    <FileUp size={20} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-200">Seed Draft Ingestion</h3>
                    <p className="text-[10px] text-slate-500">Upload existing .txt material to expand (Optional)</p>
                  </div>
                </div>
                <div>
                  <label className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-bold text-slate-300 flex items-center gap-2 cursor-pointer transition-all">
                    <Paperclip size={14} />
                    {starterFileName ? \`Loaded: \${starterFileName}\` : 'Attach File'}
                    <input type="file" className="hidden" accept=".txt,.md" onChange={handleFileUpload} />
                  </label>
                </div>
              </div>

              <div className="md:col-span-2 pt-4">
                <button
                  onClick={startPipeline}
                  className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-bold uppercase tracking-wider text-sm flex items-center justify-center gap-3 transition-all shadow-lg shadow-indigo-600/20"
                >
                  <Sparkle size={18} />
                  Launch Chapter Waterfall Engine
                  <ArrowRight size={18} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Status Bar - Active Pipeline */}
        {state.status !== 'idle' && (
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 bg-black/40 border border-white/10 rounded-2xl gap-4">
            <div className="flex items-center gap-4">
              <div className={\`w-10 h-10 rounded-xl flex items-center justify-center \${
                state.status === 'completed' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                state.status === 'paused' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 animate-pulse'
              }\`}>
                {state.status === 'completed' ? <CheckCircle2 size={20} /> :
                 state.status === 'paused' ? <PauseCircle size={20} /> :
                 <RefreshCw size={20} className="animate-spin" />}
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
                  Pipeline Status: <span className={
                    state.status === 'completed' ? 'text-emerald-400' :
                    state.status === 'paused' ? 'text-amber-400' : 'text-indigo-400'
                  }>{state.status}</span>
                </h3>
                <p className="text-xs text-slate-400 font-mono">
                  Chapter {state.currentChapterIndex + 1} of {Math.max(1, state.outlineChapters.length)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {state.status === 'paused' && (
                <button 
                  onClick={() => resumePipeline()}
                  className="px-4 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/40 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all"
                >
                  <Play size={14} /> Resume Generation
                </button>
              )}
              {['researching', 'architecting', 'drafting', 'polishing'].includes(state.status) && (
                <button 
                  onClick={pausePipeline}
                  className="px-4 py-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 border border-amber-500/40 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all"
                >
                  <PauseCircle size={14} /> Pause Pipeline
                </button>
              )}
              <button 
                onClick={resetPipeline}
                className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all"
              >
                <X size={14} /> Reset
              </button>
            </div>
          </div>
        )}
      </div>

      {/* PIPELINE VIEWS */}
      {state.status !== 'idle' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* SIDEBAR: Outline & Architecture */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-[#0c0e12] border border-white/5 rounded-3xl p-5 shadow-2xl h-full max-h-[800px] overflow-y-auto custom-scrollbar">
              <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2 mb-6">
                <Layers size={14} className="text-indigo-400" /> Manuscript Architecture
              </h2>
              
              {state.outlineChapters.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-slate-500 text-xs font-mono text-center gap-2">
                  <Search size={24} className="animate-pulse" />
                  Generating Architecture...
                </div>
              ) : (
                <div className="space-y-3">
                  {state.outlineChapters.map((chap, idx) => {
                    const isActive = idx === state.currentChapterIndex && state.status !== 'completed';
                    return (
                      <div key={idx} className={\`p-4 rounded-2xl border transition-all \${
                        chap.status === 'completed' ? 'bg-emerald-950/20 border-emerald-500/30' :
                        isActive ? 'bg-indigo-950/20 border-indigo-500/50 shadow-lg shadow-indigo-500/10' :
                        'bg-black/30 border-white/5 opacity-50'
                      }\`}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Chapter {chap.number}</span>
                          {chap.status === 'completed' && <CheckCircle2 size={12} className="text-emerald-400" />}
                          {isActive && <RefreshCw size={12} className="text-indigo-400 animate-spin" />}
                        </div>
                        <h3 className="text-sm font-serif font-bold text-slate-200 line-clamp-2">{chap.title}</h3>
                        <p className="text-[10px] text-slate-500 mt-2 line-clamp-3 leading-relaxed">{chap.summary}</p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* MAIN VIEW */}
          <div className="lg:col-span-3 space-y-6">
            
            {/* AUTHOR MODE VIEW */}
            {!isDeveloperMode && (
              <div className="bg-[#050608] border border-white/5 rounded-3xl p-8 sm:p-12 shadow-2xl min-h-[600px] flex flex-col">
                <div className="flex items-center justify-between border-b border-white/10 pb-6 mb-8">
                  <div className="text-xs font-mono text-slate-500 flex items-center gap-2">
                    <BookOpen size={14} /> DISTRACTION-FREE WORKSPACE
                  </div>
                  <div className="text-xs font-mono text-slate-500">GARAMOND TYPOGRAPHY</div>
                </div>
                
                <div className="flex-1 font-serif text-lg text-slate-200 leading-loose mx-auto w-full max-w-3xl overflow-y-auto max-h-[650px] custom-scrollbar px-4">
                  {activeChapter ? (
                    <div className="space-y-8">
                      <div className="text-center space-y-4 mb-12">
                        <h2 className="text-xl text-slate-400 tracking-widest uppercase">Chapter {activeChapter.number}</h2>
                        <h1 className="text-3xl font-bold text-slate-100">{activeChapter.title}</h1>
                      </div>
                      
                      {activeChapter.status === 'completed' || activeChapter.status === 'polishing' ? (
                        <div className="prose prose-invert max-w-none whitespace-pre-line indent-8 text-justify">
                          {activeChapter.content || <span className="text-slate-600 italic">Waiting for prose...</span>}
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center py-20 text-slate-500 font-mono text-sm gap-4">
                          <Feather size={32} className="animate-bounce text-indigo-400/50" />
                          <p>The drafting agents are currently constructing this chapter.</p>
                          <p className="text-xs text-slate-600">Review the architectural outline on the left while you wait.</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full text-slate-500 font-mono text-sm">
                      Awaiting architecture generation...
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* DEVELOPER TELEMETRY MODE VIEW */}
            {isDeveloperMode && (
              <div className="bg-[#0c0e12] border border-white/5 rounded-3xl p-6 shadow-2xl min-h-[600px] flex flex-col">
                <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
                  <h3 className="text-sm font-bold font-mono text-slate-100 flex items-center gap-2">
                    <Terminal size={16} className="text-amber-400" />
                    Global Telemetry & Execution Stream
                  </h3>
                  <div className="flex gap-4 font-mono text-[10px]">
                    <span className="bg-black/50 border border-white/5 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                      <Zap size={12} className="text-amber-400" /> TOKENS: <strong className="text-slate-200">{state.totalTokens.toLocaleString()}</strong>
                    </span>
                    <span className="bg-black/50 border border-white/5 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                      <ShieldCheck size={12} className="text-emerald-400" /> COST: <strong className="text-slate-200">${state.estimatedCost.toFixed(2)}</strong>
                    </span>
                  </div>
                </div>

                <div className="flex-1 bg-[#040506] border border-white/5 rounded-2xl p-6 font-mono text-xs text-slate-300 overflow-y-auto max-h-[650px] custom-scrollbar space-y-2">
                  {state.globalLogs.length === 0 ? (
                    <div className="text-slate-600 italic">No telemetry data recorded yet...</div>
                  ) : (
                    state.globalLogs.map((log, i) => (
                      <div key={i} className={\`leading-relaxed \${
                        log.includes('❌') ? 'text-red-400' :
                        log.includes('✅') || log.includes('🎉') ? 'text-emerald-400' :
                        log.includes('▶️') || log.includes('⏸️') ? 'text-amber-400' :
                        log.includes('[') ? 'text-indigo-300' : 'text-slate-400'
                      }\`}>
                        {log}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* PIPELINE FOOTER: ONE-CLICK EXPORTS */}
            <div className="bg-[#0c0e12] border border-white/5 rounded-3xl p-6 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <Printer size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-100">Server-Side Prepress Engine</h3>
                  <p className="text-[10px] text-slate-500 font-mono">Headless Chromium CMYK Conversion</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button 
                  onClick={() => handleExport('docx')}
                  disabled={state.outlineChapters.length === 0}
                  className="px-4 py-2 bg-blue-500/10 hover:bg-blue-500/20 disabled:opacity-40 text-blue-400 border border-blue-500/20 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer"
                >
                  <FileText size={14} /> Clean .DOCX
                </button>
                <button 
                  onClick={() => handleExport('pdf')}
                  disabled={state.outlineChapters.length === 0}
                  className="px-4 py-2 bg-indigo-500/10 hover:bg-indigo-500/20 disabled:opacity-40 text-indigo-400 border border-indigo-500/20 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer"
                >
                  <Download size={14} /> KDP Print (CMYK)
                </button>
                <button 
                  onClick={() => handleExport('epub')}
                  disabled={state.outlineChapters.length === 0}
                  className="px-4 py-2 bg-purple-500/10 hover:bg-purple-500/20 disabled:opacity-40 text-purple-400 border border-purple-500/20 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer"
                >
                  <ExternalLink size={14} /> Apple Books EPUB3
                </button>
                <button 
                  onClick={() => handleExport('audiobook')}
                  disabled={state.outlineChapters.length === 0}
                  className="px-4 py-2 bg-amber-500/10 hover:bg-amber-500/20 disabled:opacity-40 text-amber-400 border border-amber-500/20 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer"
                >
                  <Sparkles size={14} /> ACX Audio (WAV)
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
`

fs.writeFileSync('src/components/SyllabexaMultiModelPipeline.tsx', content);
console.log('File created successfully.');
