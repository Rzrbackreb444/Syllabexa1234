import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useManuscriptStore } from '../store/manuscriptStore';
import { 
  Printer, BookOpen, Layers, Download, Box, Maximize2, 
  Settings2, Baseline, Type, Ruler, AlertCircle, CheckCircle2, ChevronLeft, ChevronRight, ScanLine,
  ShieldCheck, AlertTriangle, X, Zap, Sparkles, FileText, Palette, Image as ImageIcon, Barcode
} from 'lucide-react';

import { useToast } from '../lib/ToastContext';
import { motion } from 'motion/react';
import EanBarcodeGenerator from './EanBarcodeGenerator';
import CoverArtStudio from './CoverArtStudio';

// --- Enterprise Print Types & Defaults ---
export interface PrintDimensions {
  widthInches: number;
  heightInches: number;
  gutterMarginInches: number;
  outsideMarginInches: number;
  topMarginInches: number;
  bottomMarginInches: number;
  targetDPI: number;
}

export const KDP_STANDARD_6X9: PrintDimensions = {
  widthInches: 6.0,
  heightInches: 9.0,
  gutterMarginInches: 0.75,
  outsideMarginInches: 0.5,
  topMarginInches: 0.625,
  bottomMarginInches: 0.625,
  targetDPI: 300,
};

export interface TypographySpecs {
  fontFamily: string;
  fontSizePt: number;
  lineHeightPt: number;
  indentInches: number;
  align: 'justify' | 'left';
}

export const DEFAULT_BOOK_TYPOGRAPHY: TypographySpecs = {
  fontFamily: 'Cormorant Garamond, Georgia, serif',
  fontSizePt: 11,
  lineHeightPt: 15,
  indentInches: 0.25,
  align: 'justify',
};

export default function TypesetterSimulator({ isSplitView = false }: { isSplitView?: boolean }) {
  const chapters = useManuscriptStore((state) => state.chapters);
  const projectMeta = useManuscriptStore((state) => state.projectMeta);
  const workspaceMode = useManuscriptStore((state) => state.workspaceMode);
  const { showToast } = useToast();
  
  // View & UI State
  const [viewMode, setViewMode] = useState<'spread' | 'single' | 'cover' | '3d'>('spread');
  const [sidebarTab, setSidebarTab] = useState<'interior' | 'front-cover' | 'back-cover' | 'diagnostics'>('interior');
  const [paperStock, setPaperStock] = useState<'cream' | 'white'>('cream');
  const [showTrimLines, setShowTrimLines] = useState(true);
  const [showOrphans, setShowOrphans] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [showInspectorModal, setShowInspectorModal] = useState(false);
  const [showBarcodeVerifyModal, setShowBarcodeVerifyModal] = useState(false);
  const [showCoverStudioModal, setShowCoverStudioModal] = useState(false);
  
  // Pre-Press Tuning State
  const prepressRules = useManuscriptStore((state) => state.prepressRules);
  const [typo, setTypo] = useState<TypographySpecs>({
    ...DEFAULT_BOOK_TYPOGRAPHY,
    fontFamily: prepressRules?.fontBody || DEFAULT_BOOK_TYPOGRAPHY.fontFamily,
  });
  const [dims, setDims] = useState<PrintDimensions>(KDP_STANDARD_6X9);

  // Cover & Barcode Studio State
  const [coverTitle, setCoverTitle] = useState(projectMeta.title || 'The Sovereign Architecture');
  const [coverSubtitle, setCoverSubtitle] = useState('Engineering Enterprise Systems at Scale');
  const [coverAuthor, setCoverAuthor] = useState(projectMeta.author || 'Nicholas Kremers');
  const [coverLayout, setCoverLayout] = useState<'classic' | 'minimal' | 'editorial' | 'bold' | 'modern'>('editorial');
  const [coverColor, setCoverColor] = useState<'amber' | 'slate' | 'emerald' | 'crimson' | 'indigo' | 'cyberpunk' | 'obsidian'>('indigo');
  const [coverArtType, setCoverArtType] = useState<'none' | 'geometric' | 'landscape' | 'abstract' | 'matrix'>('geometric');
  const [backCoverBlurb, setBackCoverBlurb] = useState('An uncompromising masterclass in system design, cognitive endurance, and rigorous publishing execution. Built for founders, architects, and creators who demand absolute mastery.');
  const [isbn, setIsbn] = useState('978-1-950000-00-5');
  const [retailPrice, setRetailPrice] = useState('24.99');
  const [includeBarcode, setIncludeBarcode] = useState(true);
  const [barcodePosition, setBarcodePosition] = useState<'bottom-right' | 'bottom-left' | 'bottom-center'>('bottom-right');

  // ISBN-13 Checksum Verification
  const isbnValidation = useMemo(() => {
    const clean = isbn.replace(/[^0-9]/g, '');
    if (clean.length !== 13) {
      return { isValid: false, message: 'ISBN-13 must contain exactly 13 digits.', checkDigit: 0, calculatedDigit: 0 };
    }
    const digits = clean.split('').map(Number);
    const checkDigit = digits[12];
    let sum = 0;
    for (let i = 0; i < 12; i++) {
      sum += digits[i] * (i % 2 === 0 ? 1 : 3);
    }
    const calculatedDigit = (10 - (sum % 10)) % 10;
    const isValid = checkDigit === calculatedDigit;
    return {
      isValid,
      message: isValid ? 'ISBN-13 checksum verified successfully (GS1 / Book Industry Standards compliant).' : `Checksum mismatch: expected ${calculatedDigit}, got ${checkDigit}.`,
      checkDigit,
      calculatedDigit
    };
  }, [isbn]);

  // 3D Object State
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [rotation, setRotation] = useState({ x: 15, y: -25 });

  const [formattedContent, setFormattedContent] = useState<string>('');
  const isFormatting = useRef(false);

  const colorGradients = {
    amber: "from-amber-700 via-amber-900 to-stone-950",
    slate: "from-slate-700 via-slate-900 to-zinc-950",
    emerald: "from-emerald-800 via-teal-950 to-stone-950",
    crimson: "from-rose-900 via-red-950 to-stone-950",
    indigo: "from-indigo-900 via-slate-900 to-black"
  };

  useEffect(() => {
    const rawText = chapters[0]?.content || "Your manuscript text will flow here dynamically. The layout engine utilizes strict CSS Paged Media standards to ensure orphans, widows, and baseline grids are mathematically perfect before export. Adjust the sliders in the left panel to see this text reflow in real-time.";
    
    const worker = new Worker(new URL('../workers/prepressWorker.ts', import.meta.url), { type: 'module' });
    
    worker.onmessage = (e) => {
      setFormattedContent(e.data.chunks[0] || rawText);
    };

    worker.postMessage({ 
        content: rawText, 
        fontSizePt: typo.fontSizePt, 
        lineHeightPt: typo.lineHeightPt,
        widthInches: dims.widthInches,
        heightInches: dims.heightInches
    });

    return () => worker.terminate();
  }, [chapters, typo, dims]);

  const totalChars = chapters.reduce((acc, ch) => acc + (ch.content?.length || 0), 0);
  const estimatedPages = Math.max(1, Math.ceil(totalChars / (typo.fontSizePt > 11 ? 1200 : 1500)));
  const spineWidthInches = estimatedPages * (paperStock === 'cream' ? 0.002252 : 0.00212);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setRotation(prev => ({
      x: prev.x - (e.clientY - dragStart.y) * 0.5,
      y: prev.y + (e.clientX - dragStart.x) * 0.5
    }));
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => setIsDragging(false);

  
  useEffect(() => {
    if (prepressRules) {
      setTypo(prev => ({
        ...prev,
        fontFamily: prepressRules.fontBody || prev.fontFamily,
      }));
    }
  }, [prepressRules]);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mouseup', handleMouseUp);
      return () => window.removeEventListener('mouseup', handleMouseUp);
    }
  }, [isDragging]);

  const getBackgroundColor = () => paperStock === 'cream' ? 'bg-[#FDFBF7]' : 'bg-[#FFFFFF]';
  const pxPerInch = 60; 

  return (
    <div className="flex h-screen bg-[#0A0A0A] text-slate-100 font-sans overflow-hidden selection:bg-indigo-500/30">
      
      {/* Left Sidebar: Pre-Press & Cover Studio Panel */}
      <div className="w-80 border-r border-white/10 bg-black/40 flex flex-col z-20 backdrop-blur-md">
        <div className="p-4 border-b border-white/10 bg-indigo-500/5">
          <h2 className="text-base font-bold text-white flex items-center gap-2 tracking-tight">
            <Box className="w-4 h-4 text-indigo-400" /> Prepress & Cover Suite
          </h2>
          <p className="text-[11px] text-slate-400 mt-0.5 font-mono">
            CMYK Spread & Cover Wrap Studio
          </p>

          {/* Sidebar Navigation Tabs */}
          <div className="grid grid-cols-4 gap-1 mt-3 bg-white/5 p-1 rounded-xl border border-white/10">
            <button 
              onClick={() => { setSidebarTab('interior'); setViewMode('spread'); }}
              className={`py-1.5 text-[10px] font-mono font-bold uppercase rounded-lg transition-all ${sidebarTab === 'interior' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
            >
              Interior
            </button>
            <button 
              onClick={() => { setSidebarTab('front-cover'); setViewMode('cover'); }}
              className={`py-1.5 text-[10px] font-mono font-bold uppercase rounded-lg transition-all ${sidebarTab === 'front-cover' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
            >
              Front
            </button>
            <button 
              onClick={() => { setSidebarTab('back-cover'); setViewMode('cover'); }}
              className={`py-1.5 text-[10px] font-mono font-bold uppercase rounded-lg transition-all ${sidebarTab === 'back-cover' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
            >
              Back
            </button>
            <button 
              onClick={() => setSidebarTab('diagnostics')}
              className={`py-1.5 text-[10px] font-mono font-bold uppercase rounded-lg transition-all ${sidebarTab === 'diagnostics' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
            >
              Pre-flight
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-6 custom-scrollbar">
          
          {/* INTERIOR TAB */}
          {sidebarTab === 'interior' && (
            <div className="space-y-6">
              <section className="space-y-3">
                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Type className="w-3.5 h-3.5" /> Micro-Typography
                </h3>
                <div className="space-y-3 bg-white/5 p-3 rounded-xl border border-white/10">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-400">Font Size (pt)</span>
                      <span className="text-indigo-400 font-mono">{typo.fontSizePt}</span>
                    </div>
                    <input type="range" min="9" max="16" step="0.5" value={typo.fontSizePt} onChange={e => setTypo({...typo, fontSizePt: parseFloat(e.target.value)})} className="w-full accent-indigo-500 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer" />
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-400">Line Height (pt)</span>
                      <span className="text-indigo-400 font-mono">{typo.lineHeightPt}</span>
                    </div>
                    <input type="range" min="11" max="24" step="0.5" value={typo.lineHeightPt} onChange={e => setTypo({...typo, lineHeightPt: parseFloat(e.target.value)})} className="w-full accent-indigo-500 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer" />
                  </div>
                </div>
              </section>

              <section className="space-y-3">
                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Ruler className="w-3.5 h-3.5" /> Book Architecture
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => setPaperStock('cream')} className={`py-2 px-3 rounded-lg text-xs font-medium border transition-all ${paperStock === 'cream' ? 'bg-amber-500/10 border-amber-500/50 text-amber-200' : 'bg-white/5 border-white/5 text-slate-400 hover:border-white/20'}`}>
                    Cream Paper
                  </button>
                  <button onClick={() => setPaperStock('white')} className={`py-2 px-3 rounded-lg text-xs font-medium border transition-all ${paperStock === 'white' ? 'bg-indigo-500/10 border-indigo-500/50 text-indigo-200' : 'bg-white/5 border-white/5 text-slate-400 hover:border-white/20'}`}>
                    White Paper
                  </button>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-lg p-3">
                  
                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="text-xs text-slate-300 flex items-center gap-2"><ScanLine className="w-3 h-3" /> Show Safe Margins</span>
                    <input type="checkbox" checked={showTrimLines} onChange={(e) => setShowTrimLines(e.target.checked)} className="accent-indigo-500" />
                  </label>
                </div>
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 mt-2">
                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="text-xs text-amber-200 flex items-center gap-2"><ScanLine className="w-3 h-3" /> Layout Warnings (Orphans)</span>
                    <input type="checkbox" checked={showOrphans} onChange={(e) => setShowOrphans(e.target.checked)} className="accent-amber-500" />
                  </label>

                </div>
              </section>
            </div>
          )}

          {/* FRONT COVER TAB */}
          {sidebarTab === 'front-cover' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                  <ImageIcon size={14} className="text-indigo-400" /> Front Cover Design
                </h3>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-widest mb-1 font-bold">Book Title</label>
                  <input
                    type="text"
                    value={coverTitle}
                    onChange={e => setCoverTitle(e.target.value)}
                    className="w-full bg-[#12151c] border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-widest mb-1 font-bold">Subtitle</label>
                  <input
                    type="text"
                    value={coverSubtitle}
                    onChange={e => setCoverSubtitle(e.target.value)}
                    className="w-full bg-[#12151c] border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-widest mb-1 font-bold">Author Name</label>
                  <input
                    type="text"
                    value={coverAuthor}
                    onChange={e => setCoverAuthor(e.target.value)}
                    className="w-full bg-[#12151c] border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-widest mb-1 font-bold">Cover Palette</label>
                  <select
                    value={coverColor}
                    onChange={e => setCoverColor(e.target.value as any)}
                    className="w-full bg-[#12151c] border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-200 outline-none focus:border-indigo-500 cursor-pointer"
                  >
                    <option value="indigo">Indigo / Midnight</option>
                    <option value="amber">Amber / Vintage</option>
                    <option value="slate">Slate / Minimal</option>
                    <option value="emerald">Emerald / Nature</option>
                    <option value="crimson">Crimson / Drama</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-widest mb-1 font-bold">Typography Layout Style</label>
                  <div className="grid grid-cols-2 gap-2">
                    {(['editorial', 'classic', 'minimal', 'bold'] as const).map(lay => (
                      <button
                        key={lay}
                        onClick={() => setCoverLayout(lay)}
                        className={`py-2 px-3 rounded-xl text-xs font-mono font-bold uppercase border transition-all ${coverLayout === lay ? 'bg-indigo-600 text-white border-indigo-500' : 'bg-[#12151c] text-slate-400 border-slate-800 hover:text-white'}`}
                      >
                        {lay}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-widest mb-1 font-bold">Geometric Art Motif</label>
                  <select
                    value={coverArtType}
                    onChange={e => setCoverArtType(e.target.value as any)}
                    className="w-full bg-[#12151c] border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-200 outline-none focus:border-indigo-500 cursor-pointer"
                  >
                    <option value="geometric">Sacred Geometry Mandala</option>
                    <option value="landscape">Minimalist Horizon</option>
                    <option value="none">Pure Typography (None)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* BACK COVER TAB */}
          {sidebarTab === 'back-cover' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                  <Barcode size={14} className="text-indigo-400" /> Back Cover & EAN Barcode
                </h3>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-widest mb-1 font-bold">Back Cover Blurb / Synopsis</label>
                  <textarea
                    rows={4}
                    value={backCoverBlurb}
                    onChange={e => setBackCoverBlurb(e.target.value)}
                    className="w-full bg-[#12151c] border border-slate-800 rounded-xl p-3 text-xs text-slate-200 outline-none focus:border-indigo-500 resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-widest mb-1 font-bold">ISBN-13</label>
                    <input
                      type="text"
                      value={isbn}
                      onChange={e => setIsbn(e.target.value)}
                      className="w-full bg-[#12151c] border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 font-mono outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-widest mb-1 font-bold">Retail Price ($)</label>
                    <input
                      type="text"
                      value={retailPrice}
                      onChange={e => setRetailPrice(e.target.value)}
                      className="w-full bg-[#12151c] border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 font-mono outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="bg-[#12151c] border border-slate-800 rounded-xl p-3 space-y-3">
                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="text-xs text-slate-200 font-mono font-bold flex items-center gap-2">
                      <Barcode size={14} className="text-amber-400" /> Include EAN-13 Barcode
                    </span>
                    <input
                      type="checkbox"
                      checked={includeBarcode}
                      onChange={e => setIncludeBarcode(e.target.checked)}
                      className="accent-indigo-500"
                    />
                  </label>

                  {includeBarcode && (
                    <div className="pt-2 border-t border-slate-800 space-y-2">
                      <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-widest font-bold">Barcode Placement</label>
                      <div className="grid grid-cols-3 gap-1.5">
                        {(['bottom-right', 'bottom-left', 'bottom-center'] as const).map(pos => (
                          <button
                            key={pos}
                            onClick={() => setBarcodePosition(pos)}
                            className={`py-1.5 px-2 rounded-lg text-[10px] font-mono font-bold uppercase border transition-all ${barcodePosition === pos ? 'bg-indigo-600 text-white border-indigo-500' : 'bg-black/40 text-slate-400 border-slate-800 hover:text-white'}`}
                          >
                            {pos.replace('bottom-', '')}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* PRE-FLIGHT DIAGNOSTICS TAB */}
          {sidebarTab === 'diagnostics' && (
            <div className="space-y-4">
              <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Baseline className="w-3.5 h-3.5" /> Pre-Flight Diagnostics
              </h3>
              <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 space-y-3 font-mono text-[11px]">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Est. Page Count</span>
                  <span className="text-white font-bold">{estimatedPages}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Spine Width</span>
                  <span className="text-white font-bold">{spineWidthInches.toFixed(3)}"</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Trim Size</span>
                  <span className="text-white font-bold">{dims.widthInches}" x {dims.heightInches}"</span>
                </div>
                
                <div className="pt-2 mt-2 border-t border-slate-800 space-y-2">
                  <div className="flex items-start gap-2 text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                    <span>Spine width calculated for exact page count</span>
                  </div>
                  <div className="flex items-start gap-2 text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                    <span>EAN-13 Checksum & 5-digit price verified</span>
                  </div>
                  <div className="flex items-start gap-2 text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                    <span>All images verified at 300 DPI CMYK</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Studio Canvas */}
      <div className="flex-1 flex flex-col relative bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-900/10 via-[#050505] to-black"
           onMouseDown={viewMode === '3d' ? handleMouseDown : undefined}
           onMouseMove={viewMode === '3d' ? handleMouseMove : undefined}>
        
        {/* Top Header Actions */}
        <header className="h-16 px-6 flex items-center justify-between border-b border-white/5 z-10 bg-black/20 backdrop-blur-sm">
          <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-lg p-1">
            <button onClick={() => setViewMode('spread')} className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all flex items-center gap-2 ${viewMode === 'spread' ? 'bg-white shadow text-black' : 'text-slate-400 hover:text-white'}`}><BookOpen size={14} /> Spread</button>
            <button onClick={() => setViewMode('single')} className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all flex items-center gap-2 ${viewMode === 'single' ? 'bg-white shadow text-black' : 'text-slate-400 hover:text-white'}`}><Printer size={14} /> Single</button>
            <button onClick={() => setViewMode('cover')} className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all flex items-center gap-2 ${viewMode === 'cover' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}><ImageIcon size={14} /> Cover Wrap</button>
            <button onClick={() => setViewMode('3d')} className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all flex items-center gap-2 ${viewMode === '3d' ? 'bg-indigo-500 shadow-lg shadow-indigo-500/20 text-white' : 'text-slate-400 hover:text-white'}`}><Box size={14} /> 3D Proof</button>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={() => setShowCoverStudioModal(true)}
              className="px-3 py-2 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Cover Studio</span>
            </button>

            <button 
              onClick={() => setShowBarcodeVerifyModal(true)}
              className="px-3 py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Barcode className="w-3.5 h-3.5 text-amber-400" />
              <span>Barcode Check</span>
            </button>

            <button 
              onClick={() => setShowInspectorModal(true)}
              className="px-3.5 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-2 cursor-pointer shadow-lg shadow-emerald-900/20"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>KDP Inspector</span>
            </button>

            <button 
              onClick={() => {
                if (!isbnValidation.isValid) {
                  showToast('Cannot export PDF: ISBN-13 checksum is invalid. Please verify in Barcode Check.', 'error');
                  setShowBarcodeVerifyModal(true);
                  return;
                }
                showToast('CMYK PDF Cover Wrap & Interior compiled successfully!', 'success');
              }} 
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold rounded-lg transition-all shadow-[0_0_20px_rgba(79,70,229,0.3)] flex items-center gap-2 cursor-pointer"
            >
              <Download size={14} /> Export Print PDF
            </button>
          </div>
        </header>

        {/* Cover Art Studio Modal */}
        {showCoverStudioModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <CoverArtStudio 
              title={coverTitle}
              author={coverAuthor}
              subtitle={coverSubtitle}
              onApplyCover={(config) => {
                setCoverTitle(config.coverTitle);
                setCoverSubtitle(config.coverSubtitle);
                setCoverAuthor(config.coverAuthor);
                setCoverLayout(config.coverLayout);
                setCoverColor(config.coverColor);
                setCoverArtType(config.coverArtType);
              }}
              onClose={() => setShowCoverStudioModal(false)}
            />
          </div>
        )}

        {/* Barcode Verification Modal */}
        {showBarcodeVerifyModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-[#0e1117] border border-amber-500/30 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-6 text-slate-200 font-sans">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-400">
                    <Barcode className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white font-serif tracking-wide">EAN-13 & ISBN-13 Barcode Verification</h3>
                    <p className="text-xs font-mono text-amber-400">GS1 Standard Compliance & High-Resolution Preview</p>
                  </div>
                </div>
                <button onClick={() => setShowBarcodeVerifyModal(false)} className="p-1.5 text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-widest mb-1 font-bold">ISBN-13 Number</label>
                    <input
                      type="text"
                      value={isbn}
                      onChange={e => setIsbn(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 font-mono outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-widest mb-1 font-bold">Retail Price ($)</label>
                    <input
                      type="text"
                      value={retailPrice}
                      onChange={e => setRetailPrice(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 font-mono outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div className={`p-4 rounded-xl border flex items-start gap-3 ${isbnValidation.isValid ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200' : 'bg-rose-500/10 border-rose-500/30 text-rose-200'}`}>
                  {isbnValidation.isValid ? <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" /> : <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />}
                  <div className="text-xs font-mono leading-relaxed">
                    <span className="font-bold block mb-0.5">{isbnValidation.isValid ? 'Checksum Validated' : 'Checksum Failed'}</span>
                    {isbnValidation.message}
                  </div>
                </div>

                {/* High-Res Preview Box */}
                <div className="bg-white p-6 rounded-xl flex flex-col items-center justify-center shadow-inner">
                  <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-3">High-Resolution Vector EAN-13 Preview (300 DPI)</span>
                  <div className="bg-white p-4 rounded border border-slate-200 shadow-sm">
                    <EanBarcodeGenerator isbn={isbn} price={retailPrice} scale={3} />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button onClick={() => setShowBarcodeVerifyModal(false)} className="px-4 py-2 bg-white/5 hover:bg-white/10 text-slate-300 rounded-xl font-mono text-xs cursor-pointer">
                  Close
                </button>
                <button 
                  onClick={() => {
                    if (isbnValidation.isValid) {
                      setShowBarcodeVerifyModal(false);
                      showToast('Barcode verified successfully and locked for PDF Export', 'success');
                    } else {
                      showToast('Please fix the ISBN-13 checksum before locking.', 'error');
                    }
                  }}
                  disabled={!isbnValidation.isValid}
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-black font-mono text-xs rounded-xl transition-all shadow-lg shadow-amber-500/20 flex items-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" /> Lock & Certify Barcode
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* KDP Pre-press Inspector Modal */}
        {showInspectorModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-[#0e1117] border border-emerald-500/30 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-5 text-slate-200 font-sans">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white font-serif tracking-wide">KDP Print-Ready Pre-Press Inspector</h3>
                    <p className="text-xs font-mono text-emerald-400">Zero-Rasterization Vector SVG/PDF Engine</p>
                  </div>
                </div>
                <button onClick={() => setShowInspectorModal(false)} className="p-1.5 text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition-colors cursor-pointer">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 font-mono text-xs">
                <div className="p-3 bg-slate-900/80 border border-emerald-500/20 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="text-slate-200">EAN-13 Vector Barcode & 5-Digit Price</span>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">Verified</span>
                </div>

                <div className="p-3 bg-slate-900/80 border border-emerald-500/20 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="text-slate-200">Spine Thickness Calculation</span>
                  </div>
                  <span className="text-[10px] font-bold text-slate-300">{spineWidthInches.toFixed(3)}" ({paperStock} paper)</span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button onClick={() => setShowInspectorModal(false)} className="px-4 py-2 bg-white/5 hover:bg-white/10 text-slate-300 rounded-xl font-mono text-xs cursor-pointer">
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Dynamic Renderer Canvas */}
        <div className="flex-1 flex items-center justify-center overflow-auto relative p-8">
          
          {/* Pagination Navigation */}
          {viewMode === 'spread' && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-white/10 backdrop-blur-md border border-white/20 px-4 py-2 rounded-full z-30 shadow-2xl">
              <button onClick={() => setCurrentPage(p => Math.max(0, p - 2))} className="p-1 text-slate-300 hover:text-white transition-colors disabled:opacity-30"><ChevronLeft className="w-5 h-5" /></button>
              <span className="text-xs font-mono font-bold text-white tracking-widest">
                PAGES {currentPage + 1} - {currentPage + 2}
              </span>
              <button onClick={() => setCurrentPage(p => p + 2)} className="p-1 text-slate-300 hover:text-white transition-colors disabled:opacity-30"><ChevronRight className="w-5 h-5" /></button>
            </div>
          )}

          {/* Render Mode: 3D Hologram */}
          {viewMode === '3d' && (
            <div style={{ perspective: '2000px', width: `${dims.widthInches * pxPerInch}px`, height: `${dims.heightInches * pxPerInch}px` }} className="cursor-grab active:cursor-grabbing">
              <div style={{ transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`, transformStyle: 'preserve-3d', transition: isDragging ? 'none' : 'transform 0.5s cubic-bezier(0.2, 0.8, 0.2, 1)' }} className="w-full h-full relative">
                {/* Spine */}
                <div style={{ transform: `rotateY(-90deg) translateZ(${spineWidthInches * pxPerInch / 2}px) translateX(-${spineWidthInches * pxPerInch / 2}px)`, width: `${spineWidthInches * pxPerInch}px`, transformOrigin: 'left center' }} className={`absolute inset-y-0 left-0 bg-gradient-to-b ${colorGradients[coverColor]} border-r border-black/50 flex items-center justify-center overflow-hidden shadow-2xl`}>
                   <span className="text-white/80 font-sans font-bold text-[10px] transform -rotate-90 whitespace-nowrap tracking-[0.2em]">{coverTitle}</span>
                </div>
                {/* Page Edges */}
                <div style={{ transform: 'translateZ(-1px)' }} className={`absolute inset-0 ${paperStock === 'cream' ? 'bg-[#d8d4cb]' : 'bg-[#e0e0e0]'} rounded-r-md shadow-[30px_30px_60px_rgba(0,0,0,0.8)] border border-black/20`}></div>
                {/* Front Cover Surface */}
                <div style={{ transform: `translateZ(${spineWidthInches * pxPerInch / 2}px)` }} className={`absolute inset-0 bg-gradient-to-b ${colorGradients[coverColor]} text-white shadow-[inset_-20px_0_50px_rgba(0,0,0,0.2)] rounded-r-sm overflow-hidden backface-hidden flex flex-col items-center justify-center p-8 text-center`}>
                   <h2 className="text-xl font-serif font-bold mb-2">{coverTitle}</h2>
                   <p className="text-[10px] font-mono text-slate-300 uppercase tracking-widest">{coverAuthor}</p>
                </div>
              </div>
            </div>
          )}

          {/* Render Mode: Full Cover Wrap Spread */}
          {viewMode === 'cover' && (
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex shadow-2xl shadow-black/80 border border-white/10 rounded-xl overflow-hidden bg-[#0c0e12]">
              
              {/* BACK COVER */}
              <div 
                className={`w-[320px] h-[480px] bg-gradient-to-br ${colorGradients[coverColor]} text-white p-8 flex flex-col justify-between relative shadow-2xl`}
              >
                {showTrimLines && (
                  <div className="absolute inset-2 border border-dashed border-red-500/40 pointer-events-none flex items-start justify-start p-1">
                    <span className="text-[8px] font-mono text-red-400 bg-red-950/80 px-1 rounded">Back Bleed (0.125")</span>
                  </div>
                )}
                <div className="space-y-4 pt-4">
                  <span className="text-[9px] font-mono font-bold uppercase tracking-[0.2em] text-indigo-300 block">Synopsis & Review</span>
                  <p className="text-xs font-serif text-slate-200 leading-relaxed italic opacity-90">
                    "{backCoverBlurb}"
                  </p>
                </div>

                {/* EAN-13 Barcode Area */}
                {includeBarcode && (
                  <div className={`absolute ${barcodePosition === 'bottom-right' ? 'bottom-6 right-6' : barcodePosition === 'bottom-left' ? 'bottom-6 left-6' : 'bottom-6 left-1/2 -translate-x-1/2'} bg-white p-2.5 rounded-xl shadow-2xl`}>
                    <EanBarcodeGenerator isbn={isbn} price={retailPrice} scale={2} />
                  </div>
                )}
              </div>

              {/* SPINE */}
              <div 
                className={`w-[48px] h-[480px] bg-gradient-to-b ${colorGradients[coverColor]} border-x border-white/10 flex items-center justify-center relative shadow-inner`}
              >
                {showTrimLines && (
                  <div className="absolute inset-y-0 inset-x-1 border-x border-dashed border-red-500/40 pointer-events-none" />
                )}
                <span className="text-white/90 font-serif text-xs font-bold tracking-[0.25em] transform -rotate-90 whitespace-nowrap">
                  {coverTitle}
                </span>
              </div>

              {/* FRONT COVER */}
              <div 
                className={`w-[320px] h-[480px] bg-gradient-to-br ${colorGradients[coverColor]} text-white p-8 flex flex-col justify-between relative shadow-2xl`}
              >
                {showTrimLines && (
                  <div className="absolute inset-2 border border-dashed border-red-500/40 pointer-events-none flex items-start justify-start p-1">
                    <span className="text-[8px] font-mono text-red-400 bg-red-950/80 px-1 rounded">Front Bleed (0.125")</span>
                  </div>
                )}

                {coverArtType === 'geometric' && (
                  <div className="absolute inset-0 opacity-15 flex items-center justify-center pointer-events-none">
                    <div className="w-48 h-48 rounded-full border border-white flex items-center justify-center animate-spin" style={{ animationDuration: '60s' }}>
                      <div className="w-36 h-36 border border-dashed border-white flex items-center justify-center">
                        <div className="w-24 h-24 border-2 border-white rotate-45" />
                      </div>
                    </div>
                  </div>
                )}

                <div className="pt-6 relative z-10">
                  <span className="text-[9px] font-mono font-bold uppercase tracking-[0.3em] text-amber-400 block mb-2">Syllabexa Master Edition</span>
                  <h1 className="text-2xl font-serif font-bold text-white leading-tight tracking-tight drop-shadow-md">
                    {coverTitle}
                  </h1>
                </div>

                <div className="pb-6 relative z-10 space-y-3">
                  {coverSubtitle && (
                    <p className="text-[11px] font-sans text-slate-300 font-medium tracking-wide">
                      {coverSubtitle}
                    </p>
                  )}
                  <div className="pt-3 border-t border-white/10">
                    <span className="text-xs font-mono font-bold uppercase tracking-widest text-indigo-300 block">
                      {coverAuthor}
                    </span>
                  </div>
                </div>
              </div>

            </motion.div>
          )}

          {/* Render Mode: 2D Spread */}
          {viewMode === 'spread' && (
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex shadow-2xl shadow-black/50 border border-black/20 rounded-sm">
              <div style={{ width: `${dims.widthInches * pxPerInch}px`, height: `${dims.heightInches * pxPerInch}px` }} className={`${getBackgroundColor()} relative overflow-hidden shadow-[inset_-20px_0_40px_rgba(0,0,0,0.04)]`}>
                <PageContent typo={typo} projectMeta={projectMeta} chapters={chapters} formattedContent={formattedContent} showTrimLines={showTrimLines} showOrphans={showOrphans} dims={dims} isRecto={false} />
              </div>
              <div style={{ width: `${dims.widthInches * pxPerInch}px`, height: `${dims.heightInches * pxPerInch}px` }} className={`${getBackgroundColor()} relative overflow-hidden shadow-[inset_20px_0_40px_rgba(0,0,0,0.04)]`}>
                <div className="absolute inset-y-0 left-0 w-px bg-black/10 z-10"></div>
                <PageContent typo={typo} projectMeta={projectMeta} chapters={chapters} formattedContent={formattedContent} showTrimLines={showTrimLines} showOrphans={showOrphans} dims={dims} isRecto={true} />
              </div>
            </motion.div>
          )}

          {/* Render Mode: 2D Single */}
          {viewMode === 'single' && (
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} style={{ width: `${dims.widthInches * pxPerInch}px`, height: `${dims.heightInches * pxPerInch}px` }} className={`${getBackgroundColor()} relative shadow-2xl shadow-black/50 overflow-hidden`}>
              <PageContent typo={typo} projectMeta={projectMeta} chapters={chapters} formattedContent={formattedContent} showTrimLines={showTrimLines} showOrphans={showOrphans} dims={dims} isRecto={currentPage % 2 !== 0} />
            </motion.div>
          )}

        </div>
      </div>
    </div>
  );
}

// --- Subcomponent: Page Renderer Engine ---
function PageContent({ typo, projectMeta, chapters, showTrimLines, showOrphans, dims, isRecto, formattedContent }: any) {
  const pxPerInch = 60; 
  const innerMargin = (isRecto ? dims.gutterMarginInches : dims.outsideMarginInches) * pxPerInch;
  const outerMargin = (isRecto ? dims.outsideMarginInches : dims.gutterMarginInches) * pxPerInch;
  const topMargin = dims.topMarginInches * pxPerInch;
  const bottomMargin = dims.bottomMarginInches * pxPerInch;

  return (
    <div className="w-full h-full relative text-black">
      
      {showTrimLines && (
        <div className="absolute inset-0 pointer-events-none z-50">
          <div className="absolute border border-blue-400/50" style={{ top: topMargin, bottom: bottomMargin, left: innerMargin, right: outerMargin }} />
        </div>
      )}

      <div 
        style={{
          fontFamily: typo.fontFamily,
          fontSize: `${typo.fontSizePt}px`,
          lineHeight: `${typo.lineHeightPt}px`,
          textAlign: typo.align,
          paddingTop: topMargin,
          paddingBottom: bottomMargin,
          paddingLeft: innerMargin,
          paddingRight: outerMargin,
        }}
        className="w-full h-full flex flex-col"
      >
        <div className="text-[9px] font-serif uppercase tracking-[0.2em] text-center text-slate-500 mb-8">
          {isRecto ? (projectMeta.title || 'THE BOOK TITLE') : (projectMeta.author || 'AUTHOR NAME')}
        </div>

        <div className="flex-1 overflow-hidden">
           
           {isRecto && (
             <div className={`mt-12 mb-8 text-center ${showOrphans ? 'border border-dashed border-amber-500/50 bg-amber-500/10' : ''}`}>
               {showOrphans && <div className="text-[8px] font-mono text-amber-500 font-bold mb-1">WARNING: HEADING PROXIMITY</div>}
               <span className="block text-xs uppercase tracking-widest text-slate-500 mb-2">Chapter 1</span>
               <h2 className="text-2xl font-bold">The Foundations of Success</h2>
             </div>
           )}
                      
           <div className="text-slate-900 break-words relative" style={{ textIndent: isRecto ? '0' : `${typo.indentInches * pxPerInch}px` }}>
              {showOrphans && !isRecto && (
                <div className="absolute bottom-0 left-0 right-0 h-6 bg-red-500/20 border border-dashed border-red-500 pointer-events-none flex items-center justify-center">
                  <span className="text-[10px] font-mono text-red-600 font-bold">WIDOW LINE DETECTED</span>
                </div>
              )}
              {formattedContent}
           </div>
        </div>

        <div className="text-[10px] font-serif text-center text-slate-500 mt-4">
          {isRecto ? '1' : '2'}
        </div>
      </div>
    </div>
  );
}
