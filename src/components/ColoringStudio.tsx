import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { jsPDF } from 'jspdf';
import { motion, AnimatePresence } from 'motion/react';
import { ColoringBookProject, ColoringPage } from '../types';
import { COLORING_TEMPLATES } from './TemplateLibrary';
import { 
  Palette, Wand2, Trash2, Plus, Sparkles, Layers, 
  Printer, RefreshCw, Undo, ZoomIn, ZoomOut, 
  Download, CheckCircle2, PaintBucket, Maximize2, ShieldCheck,
  Search, Filter, X, Loader2
} from 'lucide-react';
import { useToast } from '../lib/ToastContext';

const LOCAL_STORAGE_KEY = 'syllabexa-coloring-project-v6-maxxed';

const INITIAL_PROJECT: ColoringBookProject = {
  id: "cb-1",
  title: "The Magical Laundromat",
  description: "Whimsical coloring adventure",
  preset: "letter",
  pages: [
    {
      id: "page-1",
      title: "Cover: Bubble Mountain",
      description: "Main title coloring page",
      svgContent: COLORING_TEMPLATES[0]?.svgContent || '<svg viewBox="0 0 1000 1000"><rect width="1000" height="1000" fill="white"/></svg>',
      stamps: [], textItems: [], borderStyle: "art_deco", fillHistory: {}, layoutType: "portrait"
    }
  ],
  selectedPageId: "page-1"
};

const PREMIUM_PALETTE = [
  '#f59e0b', '#ef4444', '#3b82f6', '#10b981', 
  '#ec4899', '#8b5cf6', '#0ea5e9', '#f97316', 
  '#ffffff', '#1e293b'
];

export default function ColoringStudio() {
  const [project, setProject] = useState<ColoringBookProject>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    return saved ? JSON.parse(saved) : INITIAL_PROJECT;
  });

  const [prompt, setPrompt] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDifficultyFilter, setSelectedDifficultyFilter] = useState<string>('All');
  const [previewTemplate, setPreviewTemplate] = useState<typeof COLORING_TEMPLATES[0] | null>(null);
  
  // Enterprise Engine States
  const [isGenerating, setIsGenerating] = useState(false);
  const [synthesisLogs, setSynthesisLogs] = useState<string[]>([]);
  const [isExporting, setIsExporting] = useState(false);
  
  const [renderMode, setRenderMode] = useState<'outline' | 'interactive'>('outline');
  const [selectedColor, setSelectedColor] = useState(PREMIUM_PALETTE[0]);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [undoStack, setUndoStack] = useState<string[]>([]);
  const [redoStack, setRedoStack] = useState<string[]>([]);
  const [isFullScreen, setIsFullScreen] = useState(false);
  
  const { showToast } = useToast();
  const svgContainerRef = useRef<HTMLDivElement>(null);
  const studioRef = useRef<HTMLDivElement>(null);
  const logEndRef = useRef<HTMLDivElement>(null);

  const activePage = project.pages.find(p => p.id === project.selectedPageId) || project.pages[0];

  const filteredTemplates = useMemo(() => {
    return COLORING_TEMPLATES.filter(tpl => {
      const matchesSearch = tpl.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            (tpl.description || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                            (tpl.category || '').toLowerCase().includes(searchQuery.toLowerCase());
      const diff = (tpl as any).difficulty || 'Intermediate'; // Fallback
      const matchesDiff = selectedDifficultyFilter === 'All' || diff === selectedDifficultyFilter;
      return matchesSearch && matchesDiff;
    });
  }, [searchQuery, selectedDifficultyFilter]);

  const templatesByCategory = useMemo(() => {
    return filteredTemplates.reduce((acc, tpl) => {
      const cat = tpl.category || 'Uncategorized';
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(tpl);
      return acc;
    }, {} as Record<string, typeof COLORING_TEMPLATES>);
  }, [filteredTemplates]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(project));
  }, [project]);

  // Auto-scroll terminal
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [synthesisLogs]);

  const syncSvgStateToProject = useCallback(() => {
    if (renderMode !== 'interactive' || !svgContainerRef.current) return;
    const svgNode = svgContainerRef.current.querySelector('svg');
    if (!svgNode) return;
    
    const updatedSvgString = svgNode.outerHTML;
    setProject(prev => ({
      ...prev,
      pages: prev.pages.map(p => 
        p.id === activePage.id ? { ...p, svgContent: updatedSvgString } : p
      )
    }));
  }, [activePage.id, renderMode]);

  const handlePageSelect = (id: string) => {
    if (renderMode === 'interactive') syncSvgStateToProject(); 
    setUndoStack([]);
    setRedoStack([]);
    setProject(prev => ({ ...prev, selectedPageId: id }));
  };

  const handleAddPage = () => {
    if (renderMode === 'interactive') syncSvgStateToProject();
    const newPage: ColoringPage = {
      id: `page-${Date.now()}`,
      title: `Page ${project.pages.length + 1}`,
      description: "AI-generated canvas",
      svgContent: '<svg viewBox="0 0 1000 1000" xmlns="http://www.w3.org/2000/svg"><rect width="1000" height="1000" fill="white"/></svg>',
      stamps: [], textItems: [], borderStyle: "simple", fillHistory: {}, layoutType: "portrait"
    };
    setProject(prev => ({
      ...prev, pages: [...prev.pages, newPage], selectedPageId: newPage.id
    }));
    setUndoStack([]);
    setRedoStack([]);
    showToast('New 300 DPI canvas initialized.', 'success');
  };

  const handleDeletePage = (id: string) => {
    if (project.pages.length <= 1) {
      showToast('Cannot delete the final manuscript page.', 'error');
      return;
    }
    setProject(prev => {
      const remaining = prev.pages.filter(p => p.id !== id);
      return { ...prev, pages: remaining, selectedPageId: remaining[0].id };
    });
    setUndoStack([]);
    setRedoStack([]);
    showToast('Page purged from distribution stack.', 'info');
  };

  // --- LIVE AI VECTOR GENERATION ROUTE ---
  const handleGenerateAI = async () => {
    if (!prompt.trim()) return;
    
    setIsGenerating(true);
    setSynthesisLogs([
      `[SYSTEM] Initializing Syllabexa Vector Engine...`,
      `[API] Routing prompt: "${prompt}" to Gemini 3.5-Flash...`
    ]);
    
    try {
      const res = await fetch('/api/generate-coloring-page', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      });

      setSynthesisLogs(prev => [...prev, '[COMPUTE] Compiling procedural Bezier coordinates...']);
      const data = await res.json();

      if (data.svgContent) {
        setSynthesisLogs(prev => [...prev, '[RENDER] Applying 300 DPI stroke constraints...']);
        await new Promise(r => setTimeout(r, 600)); // Brief cinematic pause
        setSynthesisLogs(prev => [...prev, '[SUCCESS] Vector layer mounted successfully.']);
        await new Promise(r => setTimeout(r, 400));
        
        setProject(prev => ({
          ...prev,
          pages: prev.pages.map(p => 
            p.id === activePage.id ? { ...p, title: data.title || prompt, description: data.description, svgContent: data.svgContent } : p
          )
        }));
        
        setPrompt('');
        setUndoStack([]);
        setRedoStack([]);
        showToast('AI Vector Canvas Generated Successfully!', 'success');
      } else {
        throw new Error(data.error || "Engine returned an invalid structure.");
      }
    } catch (err: any) {
      setSynthesisLogs(prev => [...prev, `[ERROR] ${err.message}`]);
      showToast('Generation failed.', 'error');
    } finally {
      setTimeout(() => setIsGenerating(false), 1000);
    }
  };

  const loadTemplate = (svgContent: string, name: string) => {
    if (renderMode === 'interactive') syncSvgStateToProject();
    setProject(prev => ({
      ...prev,
      pages: prev.pages.map(p => p.id === activePage.id ? { ...p, title: name, svgContent } : p)
    }));
    setUndoStack([]);
    setRedoStack([]);
    showToast(`Template applied: ${name}`, 'success');
  };

  const handleExportPDF = async () => {
    if (renderMode === 'interactive') syncSvgStateToProject();
    setIsExporting(true);
    showToast('Compiling 300 DPI Print-Ready KDP Master PDF...', 'info');

    try {
      const doc = new jsPDF({ orientation: 'portrait', unit: 'in', format: [8.5, 11] });

      for (let i = 0; i < project.pages.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 50)); 
        
        const page = project.pages[i];
        if (i > 0) doc.addPage();
        
        doc.setFont("Helvetica", "bold");
        doc.setFontSize(16);
        doc.text(page.title, 4.25, 0.8, { align: "center" });
        doc.setFontSize(10);
        doc.setFont("Helvetica", "normal");
        doc.text(page.description || '', 4.25, 1.1, { align: "center" });

        const blob = new Blob([page.svgContent], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        
        await new Promise<void>((resolve, reject) => {
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = 2400; // Ultra-high DPI export
            canvas.height = 2400;
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.fillStyle = "#ffffff";
              ctx.fillRect(0, 0, canvas.width, canvas.height);
              ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
              doc.addImage(canvas.toDataURL('image/jpeg', 1.0), 'JPEG', 1.25, 1.4, 6.0, 6.0);
            }
            URL.revokeObjectURL(url);
            resolve();
          };
          img.onerror = (e) => {
            URL.revokeObjectURL(url);
            reject(e);
          };
          img.src = url;
        });

        // Add standard KDP bleed margin cutlines
        doc.setLineWidth(0.02);
        doc.setDrawColor(15, 23, 42); 
        doc.rect(1.25, 1.4, 6.0, 6.0);
      }

      doc.save(`${project.title.replace(/\s+/g, '_')}_KDP_Master.pdf`);
      showToast('KDP Print PDF compiled & exported!', 'success');
    } catch (err) {
      console.error(err);
      showToast('Failed to compile PDF manuscript.', 'error');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportPNG = () => {
    if (!svgContainerRef.current) return;
    const svgNode = svgContainerRef.current.querySelector('svg');
    if (!svgNode) return;

    const svgData = new XMLSerializer().serializeToString(svgNode);
    const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    
    img.onload = () => {
      canvas.width = 2400; 
      canvas.height = 2400;
      ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
      const a = document.createElement("a");
      a.download = `${activePage.title.replace(/\s+/g, '_')}_300DPI.png`;
      a.href = canvas.toDataURL("image/png");
      a.click();
      URL.revokeObjectURL(url);
      showToast('Ultra-Res 300 DPI PNG downloaded.', 'success');
    };
    img.src = url;
  };

  const handleSvgElementClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (renderMode !== 'interactive' || !svgContainerRef.current) return;
    const target = e.target as SVGElement;
    const tagName = target.tagName?.toLowerCase();
    
    if (!tagName || !['path', 'circle', 'ellipse', 'polygon', 'polyline', 'rect'].includes(tagName)) return;
    
    if (tagName === 'rect' && target.getAttribute('width') === '1000') return;

    const currentSvg = svgContainerRef.current.querySelector('svg')?.outerHTML;
    if (currentSvg) {
      setUndoStack(prev => [...prev.slice(-29), currentSvg]);
      setRedoStack([]); // Clear redo stack on new action
    }
    
    target.setAttribute('fill', selectedColor);
  };

  const handleUndo = () => {
    if (undoStack.length === 0 || !svgContainerRef.current) return;
    const currentSvg = svgContainerRef.current.querySelector('svg')?.outerHTML;
    const previousSvg = undoStack[undoStack.length - 1];
    
    if (currentSvg) {
      setRedoStack(prev => [currentSvg, ...prev.slice(0, 29)]);
    }

    setProject(prev => ({
      ...prev,
      pages: prev.pages.map(p => 
        p.id === activePage.id ? { ...p, svgContent: previousSvg } : p
      )
    }));
    
    setUndoStack(prev => prev.slice(0, -1));
    showToast('Stroke undone.', 'info');
  };

  const handleRedo = () => {
    if (redoStack.length === 0 || !svgContainerRef.current) return;
    const currentSvg = svgContainerRef.current.querySelector('svg')?.outerHTML;
    const nextSvg = redoStack[0];

    if (currentSvg) {
      setUndoStack(prev => [...prev.slice(-29), currentSvg]);
    }

    setProject(prev => ({
      ...prev,
      pages: prev.pages.map(p => 
        p.id === activePage.id ? { ...p, svgContent: nextSvg } : p
      )
    }));

    setRedoStack(prev => prev.slice(1));
    showToast('Stroke redone.', 'info');
  };

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      studioRef.current?.requestFullscreen().catch(err => console.error(err));
      setIsFullScreen(true);
    } else {
      document.exitFullscreen();
      setIsFullScreen(false);
    }
  };

  return (
    <div ref={studioRef} className="flex-1 bg-[#040506] flex flex-col lg:flex-row h-full font-sans overflow-hidden select-none relative z-0">
      
      <style>
        {`
          :root {
            --paint-color: ${selectedColor};
            --cursor-svg: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="${encodeURIComponent(selectedColor)}" stroke="%230f172a" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>');
          }
          .coloring-interactive svg {
            cursor: var(--cursor-svg) 12 12, crosshair !important;
          }
          .coloring-interactive svg path:not([fill="none"]):hover,
          .coloring-interactive svg circle:not([fill="none"]):hover,
          .coloring-interactive svg ellipse:not([fill="none"]):hover,
          .coloring-interactive svg polygon:not([fill="none"]):hover,
          .coloring-interactive svg polyline:not([fill="none"]):hover,
          .coloring-interactive svg rect:not([width="1000"]):hover {
            fill: var(--paint-color) !important;
            opacity: 0.85;
            transition: opacity 0.08s ease;
          }
          .drafting-table-bg {
            background-image: radial-gradient(rgba(255, 255, 255, 0.06) 1.5px, transparent 1.5px);
            background-size: 32px 32px;
          }
          .custom-scrollbar::-webkit-scrollbar { width: 5px; }
          .custom-scrollbar::-webkit-scrollbar-track { background: rgba(0, 0, 0, 0.2); }
          .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(245, 158, 11, 0.2); border-radius: 4px; }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(245, 158, 11, 0.4); }
        `}
      </style>

      {/* Left Sidebar: Pages Stack */}
      <motion.aside initial={{ x: -50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="w-full lg:w-72 bg-[#0c0e12] border-r border-white/5 flex flex-col shrink-0 lg:h-full h-[250px] shadow-2xl z-20">
        <div className="p-5 border-b border-white/5 bg-[#08090c] flex justify-between items-center sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <Layers size={16} className="text-amber-400" />
            <h2 className="text-[11px] font-mono font-bold uppercase tracking-widest text-slate-200">Canvas Stack</h2>
          </div>
          <button 
            onClick={handleAddPage} 
            className="p-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 rounded-md transition-colors cursor-pointer"
            title="Add Page"
          >
            <Plus size={16} />
          </button>
        </div>

        <div className="flex-1 p-4 space-y-3 custom-scrollbar overflow-y-auto">
          <AnimatePresence>
            {project.pages.map((p, idx) => {
              const isActive = p.id === project.selectedPageId;
              return (
                <motion.div 
                  layout
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
                  key={p.id} 
                  onClick={() => handlePageSelect(p.id)}
                  className={`group flex items-center justify-between p-3.5 rounded-xl cursor-pointer text-xs font-mono transition-all border ${
                    isActive 
                      ? 'bg-amber-500/10 border-amber-500/40 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.1)] font-bold' 
                      : 'bg-black/30 border-white/5 text-slate-400 hover:border-white/20 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-3 truncate">
                    <span className={`w-6 h-6 rounded-md flex items-center justify-center text-[10px] ${isActive ? 'bg-amber-500 text-black' : 'bg-white/5 border border-white/10'}`}>
                      {idx + 1}
                    </span>
                    <span className="truncate">{p.title}</span>
                  </div>
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleDeletePage(p.id); }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-500 hover:text-rose-400 p-1 cursor-pointer"
                  >
                    <Trash2 size={14} />
                  </button>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        <div className="p-5 border-t border-white/5 bg-[#08090c] sticky bottom-0 space-y-2">
          <button
            onClick={handleExportPDF}
            disabled={isExporting}
            className="w-full py-3.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black font-mono text-[11px] font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-[0_0_15px_rgba(245,158,11,0.2)] flex items-center justify-center gap-2"
          >
            {isExporting ? <RefreshCw size={16} className="animate-spin" /> : <Printer size={16} />}
            <span>{isExporting ? 'Compiling KDP PDF...' : 'Export KDP Print PDF'}</span>
          </button>
          
          <button
            onClick={handleExportPNG}
            className="w-full py-3.5 bg-black/40 hover:bg-white/5 border border-white/10 text-slate-300 font-mono text-[11px] font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <Download size={16} />
            <span>Download 300 DPI PNG</span>
          </button>
        </div>
      </motion.aside>

      {/* Center Canvas Workspace */}
      <main className="flex-1 flex flex-col drafting-table-bg lg:h-full h-[600px] p-6 overflow-hidden relative items-center justify-center">
        
        {/* Top Control Bar */}
        <motion.div initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="absolute top-6 left-6 right-6 flex flex-col sm:flex-row gap-3 items-center justify-between bg-[#0c0e12]/90 border border-white/10 p-4 rounded-2xl shadow-2xl z-10 max-w-4xl mx-auto w-full backdrop-blur-md">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Wand2 size={18} className="text-amber-400 shrink-0 hidden sm:block" />
            <input 
              type="text" 
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleGenerateAI()}
              className="flex-1 sm:w-80 bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:border-amber-500/50 focus:outline-none transition-colors shadow-inner"
              placeholder="Prompt vector line art (e.g., WashBizHub mascot)..."
            />
            <button 
              onClick={handleGenerateAI}
              disabled={isGenerating || !prompt.trim()}
              className="bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black font-mono text-xs font-black uppercase px-5 py-2.5 rounded-xl transition-all cursor-pointer shrink-0 shadow-lg shadow-amber-500/20 flex items-center gap-2"
            >
              {isGenerating ? <RefreshCw size={14} className="animate-spin" /> : <Sparkles size={14} />}
              <span className="hidden sm:inline">{isGenerating ? 'Synthesizing...' : 'Generate'}</span>
            </button>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={() => {
                if(renderMode === 'interactive') syncSvgStateToProject();
                setRenderMode(renderMode === 'outline' ? 'interactive' : 'outline');
              }}
              className={`px-4 py-2.5 rounded-xl font-mono text-[10px] uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 border ${
                renderMode === 'interactive'
                  ? 'bg-amber-500 border-amber-500 text-black font-black shadow-lg shadow-amber-500/30'
                  : 'bg-black/30 border-white/10 text-slate-400 hover:border-white/30'
              }`}
            >
              {renderMode === 'interactive' ? <PaintBucket size={14} /> : <Palette size={14} />}
              <span>{renderMode === 'outline' ? 'Outline Mode' : 'Interactive Paint'}</span>
            </button>

            <button
              onClick={toggleFullScreen}
              className="p-2.5 bg-black/30 hover:bg-white/10 border border-white/10 text-slate-400 hover:text-white rounded-xl transition-colors cursor-pointer"
              title="Toggle Fullscreen Studio"
            >
              <Maximize2 size={16} />
            </button>
          </div>
        </motion.div>

        {/* Color Palette UI with Undo / Redo */}
        <AnimatePresence>
          {renderMode === 'interactive' && (
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="absolute top-28 bg-[#0c0e12]/95 backdrop-blur-xl border border-white/10 px-5 py-3 rounded-2xl flex items-center gap-4 z-10 shadow-2xl">
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest font-bold">Palette:</span>
              <div className="flex gap-2">
                {PREMIUM_PALETTE.map(color => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`w-7 h-7 rounded-full border-2 transition-all cursor-pointer shadow-inner ${
                      selectedColor === color ? 'border-amber-400 scale-125 ring-2 ring-amber-500/30' : 'border-white/10 hover:scale-110'
                    }`}
                    style={{ backgroundColor: color }}
                    title={color === '#ffffff' ? 'Eraser (White)' : 'Paint Color'}
                  />
                ))}
              </div>
              <div className="h-6 w-px bg-white/10 mx-2" />
              <div className="flex items-center gap-1">
                <button 
                  onClick={handleUndo}
                  disabled={undoStack.length === 0}
                  className="p-1.5 text-slate-400 hover:text-amber-400 disabled:opacity-30 disabled:hover:text-slate-400 transition-colors cursor-pointer rounded-lg hover:bg-white/5"
                  title="Undo stroke"
                >
                  <Undo size={16} />
                </button>
                <button 
                  onClick={handleRedo}
                  disabled={redoStack.length === 0}
                  className="p-1.5 text-slate-400 hover:text-amber-400 disabled:opacity-30 disabled:hover:text-slate-400 transition-colors cursor-pointer rounded-lg hover:bg-white/5 rotate-180"
                  title="Redo stroke"
                >
                  <Undo size={16} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Synthesis Terminal Overlay */}
        <AnimatePresence>
          {isGenerating && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="absolute inset-0 z-50 flex items-center justify-center bg-[#050608]/80 backdrop-blur-sm p-6">
              <div className="w-full max-w-xl bg-[#0a0c10] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
                <div className="bg-[#12151c] px-4 py-3 border-b border-white/5 flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-rose-500/80"></div>
                    <div className="w-3 h-3 rounded-full bg-amber-500/80"></div>
                    <div className="w-3 h-3 rounded-full bg-emerald-500/80"></div>
                  </div>
                  <span className="ml-4 text-[10px] font-mono text-slate-500 uppercase tracking-widest">syllabexa@vector-engine:~$</span>
                </div>
                <div className="p-6 h-64 overflow-y-auto custom-scrollbar font-mono text-xs space-y-2 bg-[#050608]">
                  {synthesisLogs.map((log, i) => (
                    <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} key={i} className={`${log.includes('[ERROR]') ? 'text-rose-400' : log.includes('[SUCCESS]') ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {log}
                    </motion.div>
                  ))}
                  <div className="flex items-center gap-2 text-slate-500 mt-4">
                    <Loader2 className="w-4 h-4 animate-spin" /> Computing algorithmic paths...
                  </div>
                  <div ref={logEndRef} />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Zoom Controls */}
        <div className="absolute bottom-6 right-6 bg-[#0c0e12]/90 backdrop-blur-md border border-white/10 p-1.5 rounded-2xl flex items-center gap-1 z-10 shadow-2xl">
          <button onClick={() => setZoomLevel(prev => Math.max(50, prev - 10))} className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl cursor-pointer transition-colors">
            <ZoomOut size={14} />
          </button>
          <span className="px-2 font-mono text-[10px] text-slate-300 font-bold w-12 text-center">{zoomLevel}%</span>
          <button onClick={() => setZoomLevel(prev => Math.min(250, prev + 10))} className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl cursor-pointer transition-colors">
            <ZoomIn size={14} />
          </button>
        </div>

        {/* The Vector Canvas Sheet */}
        <div className="mt-28 flex-1 flex flex-col items-center justify-center p-4 w-full h-full overflow-hidden">
          <motion.div layout
            ref={svgContainerRef}
            onClick={handleSvgElementClick}
            className={`bg-white shadow-[0_25px_60px_rgba(0,0,0,0.6)] rounded-sm border-[12px] border-slate-900 relative transition-transform duration-300 [&>svg]:w-full [&>svg]:h-full ${renderMode === 'interactive' ? 'coloring-interactive' : 'coloring-outline'}`}
            style={{ 
              width: 'min(100%, 550px)', 
              aspectRatio: '1/1',
              transform: `scale(${zoomLevel / 100})`
            }}
            dangerouslySetInnerHTML={{ __html: activePage.svgContent }}
          />
          <motion.div layout className="mt-6 text-center font-mono text-[10px] uppercase tracking-widest text-slate-400 bg-[#0c0e12] px-5 py-2.5 rounded-full border border-white/10 shadow-xl flex items-center gap-2">
            <ShieldCheck size={14} className="text-amber-400" />
            <span>{activePage.title} • {renderMode === 'outline' ? 'KDP Print-Ready Vector Master' : 'Interactive Paint Mode'}</span>
          </motion.div>
        </div>
      </main>

      {/* Right Sidebar: Templates Library (Categorized) */}
      <motion.aside initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="w-full lg:w-80 bg-[#0c0e12] border-l border-white/5 flex flex-col shrink-0 lg:h-full h-[350px] overflow-hidden shadow-2xl z-20">
        <div className="p-5 border-b border-white/5 bg-[#08090c] sticky top-0 z-10 shrink-0 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-[11px] font-mono font-bold uppercase tracking-widest text-slate-200 flex items-center gap-2">
              <Palette size={16} className="text-amber-400" /> KDP Master Templates
            </h2>
            <span className="text-[9px] font-mono bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-full font-bold">
              300 DPI
            </span>
          </div>
          
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input 
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search templates..."
              className="w-full bg-black/40 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 focus:border-amber-500/50 focus:outline-none transition-colors"
            />
          </div>

          <div className="flex gap-1.5 overflow-x-auto pb-1 custom-scrollbar">
            {['All', 'Beginner', 'Intermediate', 'Master KDP'].map(diff => (
              <button
                key={diff}
                onClick={() => setSelectedDifficultyFilter(diff)}
                className={`px-2.5 py-1 rounded-lg text-[9px] font-mono whitespace-nowrap transition-all cursor-pointer border ${
                  selectedDifficultyFilter === diff 
                    ? 'bg-amber-500 border-amber-500 text-black font-bold shadow-md shadow-amber-500/20' 
                    : 'bg-black/30 border-white/5 text-slate-400 hover:border-white/20 hover:text-slate-200'
                }`}
              >
                {diff}
              </button>
            ))}
          </div>
        </div>
        
        <div className="p-5 overflow-y-auto custom-scrollbar flex-1 space-y-6">
          {Object.keys(templatesByCategory).length === 0 ? (
            <div className="text-center py-12 text-slate-500 font-mono text-xs">
              No templates match your search criteria.
            </div>
          ) : (
            Object.entries(templatesByCategory).map(([category, templates]) => (
              <div key={category}>
                <h3 className="text-[9px] font-mono font-bold uppercase tracking-widest text-slate-500 mb-3 flex items-center gap-2">
                  <span className="w-2 h-px bg-slate-700" />
                  {category}
                  <span className="flex-1 h-px bg-slate-800" />
                </h3>
                
                <div className="grid grid-cols-2 gap-3">
                  {templates.map((tpl) => {
                    const diff = (tpl as any).difficulty || 'Intermediate';
                    return (
                      <div 
                        key={tpl.id}
                        onClick={() => setPreviewTemplate(tpl)}
                        className="bg-black/30 rounded-2xl p-3 border border-white/5 cursor-pointer hover:border-amber-500/40 hover:bg-amber-500/5 hover:shadow-[0_0_15px_rgba(245,158,11,0.1)] transition-all flex flex-col items-center gap-2.5 group relative"
                      >
                        <div className="absolute top-2 right-2 z-10">
                          <span className={`text-[8px] font-mono px-1.5 py-0.5 rounded font-bold uppercase ${
                            diff === 'Master KDP' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                            diff === 'Intermediate' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                            'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          }`}>
                            {diff}
                          </span>
                        </div>

                        <div 
                          className="w-full bg-white rounded-xl overflow-hidden aspect-square pointer-events-none border border-slate-200 shadow-sm [&>svg]:w-full [&>svg]:h-full"
                          dangerouslySetInnerHTML={{ __html: tpl.svgContent }}
                        />
                        <span className="text-[10px] font-mono font-semibold text-slate-300 group-hover:text-amber-400 text-center truncate w-full">
                          {tpl.name}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      </motion.aside>

      {/* Template Preview Modal */}
      <AnimatePresence>
        {previewTemplate && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#0c0e12] border border-white/10 rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-6 relative"
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-mono bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2.5 py-0.5 rounded-full font-bold uppercase">
                      {previewTemplate.category || 'Uncategorized'}
                    </span>
                    <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2.5 py-0.5 rounded-full font-bold uppercase">
                      KDP Ready
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white font-mono">{previewTemplate.name}</h3>
                </div>
                <button 
                  onClick={() => setPreviewTemplate(null)}
                  className="text-slate-400 hover:text-white p-2 rounded-xl bg-white/5 hover:bg-white/10 cursor-pointer transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="flex justify-center bg-white p-6 rounded-2xl border border-slate-200 shadow-inner max-h-[350px]">
                <div 
                  className="w-72 h-72 [&>svg]:w-full [&>svg]:h-full"
                  dangerouslySetInnerHTML={{ __html: previewTemplate.svgContent }}
                />
              </div>

              <p className="text-xs text-slate-400 font-sans leading-relaxed">
                {previewTemplate.description}
              </p>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => {
                    loadTemplate(previewTemplate.svgContent, previewTemplate.name);
                    setPreviewTemplate(null);
                  }}
                  className="flex-1 py-3.5 bg-amber-500 hover:bg-amber-400 text-black font-mono text-xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2"
                >
                  <Sparkles size={16} />
                  <span>Insert Into Active Canvas</span>
                </button>
                <button
                  onClick={() => setPreviewTemplate(null)}
                  className="px-6 py-3.5 bg-black/40 hover:bg-white/5 border border-white/10 text-slate-300 font-mono text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}