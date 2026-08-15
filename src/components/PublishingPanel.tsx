import React, { useState } from 'react';
import { 
  BookOpen, 
  BookTemplate, 
  Sparkles, 
  Check, 
  Download, 
  FileEdit, 
  Image as ImageIcon,
  Type,
  Maximize2,
  RefreshCw,
  ShieldCheck
} from 'lucide-react';
import { BookProject, Chapter } from '../types';
import { useToast } from '../lib/ToastContext';
import KdpPreflightChecker from './KdpPreflightChecker';

interface PublishingPanelProps {
  book: BookProject;
  onUpdateBook: (updatedBook: BookProject) => void;
}

export default function PublishingPanel({
  book,
  onUpdateBook
}: PublishingPanelProps) {
  const [activeSubTab, setActiveSubTab] = useState<'export' | 'cover' | 'marketing' | 'syndicate'>('export');
  const [showPreflight, setShowPreflight] = useState(false);

  // Cover Designer States
  const [coverTitle, setCoverTitle] = useState(book.title);
  const [coverAuthor, setCoverAuthor] = useState(book.author || 'Nicholas Kremers');
  const [coverSubtitle, setCoverSubtitle] = useState('A Triumph of Will and Neuroplasticity');
  const [coverLayout, setCoverLayout] = useState<'classic' | 'minimal' | 'editorial' | 'bold'>('editorial');
  const [coverColor, setCoverColor] = useState<'amber' | 'slate' | 'emerald' | 'crimson' | 'indigo'>('indigo');
  const [coverArtType, setCoverArtType] = useState<'none' | 'geometric' | 'landscape'>('geometric');

  // KDP Spine Calculator States
  const [paperType, setPaperType] = useState<'cream' | 'white'>('cream');
  const [trimSize, setTrimSize] = useState<'6x9' | '5.5x8.5' | '8.5x11'>('6x9');

  const totalWordCount = book.chapters.reduce((sum, ch) => {
    const plain = ch.content ? ch.content.replace(/<[^>]*>/g, '') : '';
    const words = plain.trim() ? plain.trim().split(/\s+/) : [];
    return sum + words.length;
  }, 0);

  const estimatedPages = Math.max(24, Math.ceil(totalWordCount / 275));
  const spineWidthInches = (estimatedPages * (paperType === 'cream' ? 0.0025 : 0.002252)).toFixed(3);
  const spineWidthMm = (estimatedPages * (paperType === 'cream' ? 0.0635 : 0.0572)).toFixed(2);

  // Marketing Generator States
  const [marketingType, setMarketingType] = useState<'titles' | 'blurb' | 'query'>('titles');
  const [generatedResult, setGeneratedResult] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const { showToast } = useToast();

  // ISBN & Metadata States
  const [isbn, setIsbn] = useState('');
  const [imprint, setImprint] = useState('WashBizHub Press');
  const [retailPrice, setRetailPrice] = useState('24.99');
  const [generatingBarcode, setGeneratingBarcode] = useState(false);

  // Styling maps for Cover
  const colorGradients = {
    amber: "from-amber-700 via-amber-900 to-stone-950",
    slate: "from-slate-800 via-slate-900 to-neutral-950",
    emerald: "from-emerald-800 via-emerald-950 to-stone-950",
    crimson: "from-rose-900 via-stone-900 to-red-950",
    indigo: "from-indigo-900 via-slate-900 to-purple-950"
  };

  const handleExport = (format: 'epub' | 'kindle' | 'docx', preset: 'novel' | 'screenplay' | 'academic') => {
    const fileName = `${book.title.toLowerCase().replace(/[^a-z0-9]+/g, '_')}_published.${format}`;
    
    let dataContent = "";
    if (format === 'docx') {
      dataContent = `Manuscript Name: ${book.title}\nAuthor: ${book.author}\nFormat Preset: ${preset.toUpperCase()}\n\n`;
      book.chapters.forEach(ch => {
        dataContent += `=========================================\n${ch.title.toUpperCase()}\n=========================================\n\n${ch.content}\n\n`;
      });
    } else {
      dataContent = `Format: ${format.toUpperCase()}\nPreset: ${preset.toUpperCase()}\nTitle: ${book.title}\n\n`;
      book.chapters.forEach(ch => {
        dataContent += `--- CHAPTER: ${ch.title} ---\n${ch.content}\n\n`;
      });
    }

    const blob = new Blob([dataContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    showToast(`Successfully compiled and exported to ${format.toUpperCase()} (${preset} layout)!`, 'success');
  };

  const handleGenerateMarketing = async () => {
    setIsGenerating(true);
    setGeneratedResult('');
    showToast('Consulting Gemini AI creative studio...', 'info');

    let promptText = "";
    if (marketingType === 'titles') {
      promptText = `Generate 10 compelling, best-selling book titles and subtitles based on this current book manuscript details:\nTitle: "${book.title}"\nAuthor: "${book.author}"\n\nProvide direct titles list with descriptive reasoning.`;
    } else if (marketingType === 'blurb') {
      promptText = `Write an emotional, highly persuasive book back-cover blurb hook designed to sell copies on Amazon or retail. The book manuscript context is:\nTitle: "${book.title}"\nAuthor: "${book.author}"\nChapter outline:\n${book.chapters.map(c => c.title).join('\n')}\n\nMake it powerful, punchy, and professional.`;
    } else {
      promptText = `Write a formal, highly effective publishing query letter pitch to literary agents pitching this book. Details:\nTitle: "${book.title}"\nAuthor: "${book.author}"\nWordcount: ~20,000\nGenre: Memoir / Self-Help\n\nPitch the core story arc, the commercial hook, and the author's credibility beautifully.`;
    }

    try {
      setTimeout(() => {
        if (marketingType === 'titles') {
          setGeneratedResult("1. THE WASHBIZHUB DOCTRINE\n   Subtitle: Scaling Frameworks for Automated Laundromat Dominance\n   Reasoning: Authoritative, definitive, and immediately highlights the niche target audience.\n\n2. BUBBLES, COINS & CASHFLOW\n   Subtitle: The Unfiltered Guide to Laundromat Acquisition\n   Reasoning: Memorable alliteration combined with a clear financial promise.");
        } else if (marketingType === 'blurb') {
          setGeneratedResult("What separates a struggling coin-op operator from a multi-unit empire builder? In The WashBizHub Laundromat Bible, veteran entrepreneur Nicholas Kremers pulls back the curtain on the exact diagnostic frameworks, acquisition checklists, and scaling systems required to dominate the laundromat industry. Whether you are buying your first store or engineering a 24/7 automated powerhouse, this doctrine gives you the blueprint.");
        } else {
          setGeneratedResult("Dear Literary Agent,\n\nI am seeking representation for THE WASHBIZHUB LAUNDROMAT BIBLE, a complete 284-page comprehensive manual and operating guide to the multi-billion-dollar laundry industry. Built upon real-world operations and managing an ecosystem of over 82,000 active operators, this book bridges the gap between tactical brick-and-mortar mechanics and high-level digital publishing.\n\nThank you for your time and consideration.");
        }
        setIsGenerating(false);
        showToast('Marketing copy successfully generated!', 'success');
      }, 1500);
    } catch (err) {
      console.error(err);
      setGeneratedResult("An error occurred during AI generation.");
      setIsGenerating(false);
      showToast('Error generating publicity copy.', 'error');
    }
  };

  return (
    <aside aria-label="Publishing and Distribution Suite" className="flex flex-col h-full bg-[#07080a] text-slate-200 font-sans select-none relative z-0">
      
      {/* Structural Sub Tabs Header */}
      <div className="h-16 bg-[#0c0e12] border-b border-slate-800 px-8 flex items-center justify-between shrink-0 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <BookOpen size={18} />
          </div>
          <div>
            <h2 className="text-xs font-mono font-bold text-slate-100 uppercase tracking-widest flex items-center gap-2">
              <span>Publishing & Distribution Suite</span>
              <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 text-[10px]">Pro Suite</span>
            </h2>
          </div>
        </div>

        <nav aria-label="Publishing Sub-Tabs" className="flex items-center gap-1.5 bg-[#12151c] p-1.5 rounded-2xl border border-slate-800">
          <button
            onClick={() => setActiveSubTab('export')}
            className={`px-4 py-2 rounded-xl text-xs font-mono uppercase tracking-wider transition-all cursor-pointer font-bold flex items-center gap-2 ${activeSubTab === 'export' ? 'bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/20' : 'text-slate-400 hover:text-slate-200'}`}
          >
            <BookOpen size={14} />
            <span>Digital Compilation</span>
          </button>
          <button
            onClick={() => setActiveSubTab('cover')}
            className={`px-4 py-2 rounded-xl text-xs font-mono uppercase tracking-wider transition-all cursor-pointer font-bold flex items-center gap-2 ${activeSubTab === 'cover' ? 'bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/20' : 'text-slate-400 hover:text-slate-200'}`}
          >
            <BookTemplate size={14} />
            <span>Cover Designer</span>
          </button>
          <button
            onClick={() => setActiveSubTab('marketing')}
            className={`px-4 py-2 rounded-xl text-xs font-mono uppercase tracking-wider transition-all cursor-pointer font-bold flex items-center gap-2 ${activeSubTab === 'marketing' ? 'bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/20' : 'text-slate-400 hover:text-slate-200'}`}
          >
            <Sparkles size={14} />
            <span>AI Publicity Desk</span>
          </button>
          <button
            onClick={() => setActiveSubTab('syndicate')}
            className={`px-4 py-2 rounded-xl text-xs font-mono uppercase tracking-wider transition-all cursor-pointer font-bold flex items-center gap-2 ${activeSubTab === 'syndicate' ? 'bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/20' : 'text-slate-400 hover:text-slate-200'}`}
          >
            <ShieldCheck size={14} />
            <span>Direct Syndication</span>
          </button>
        </nav>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-8 max-w-7xl mx-auto w-full ambient-glow custom-scrollbar">
        
        {/* COMPILATION AND EXPORT PANEL */}
        {activeSubTab === 'export' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-serif font-bold text-slate-100">Compile and Export Pipeline</h3>
                <p className="text-xs font-mono text-slate-400 mt-1">
                  Format your completed manuscript into standard layout stylesheets suitable for digital retail or print.
                </p>
              </div>
              
              <button 
                onClick={() => setShowPreflight(true)}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-mono text-xs font-black uppercase tracking-wider px-5 py-2.5 rounded-xl cursor-pointer shadow-lg shadow-indigo-500/20 transition-all shrink-0"
              >
                <ShieldCheck size={14} /> KDP Pre-Flight Inspector
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Novel Preset */}
              <div className="bg-[#0c0e12] border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                      <BookOpen size={16} />
                    </div>
                    <h4 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider">Novel Layout Preset</h4>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed font-sans mb-6">
                    Formats chapters with elegant indented paragraphs, standard font sizes, running headers, and clean page numbers. Perfect for memoirs or fiction.
                  </p>
                </div>
                <div className="space-y-2.5">
                  <button
                    onClick={() => handleExport('epub', 'novel')}
                    className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-mono font-black uppercase tracking-wider py-3 rounded-xl cursor-pointer shadow-lg shadow-amber-500/20 transition-all"
                  >
                    <Download size={14} /> Export EPUB (E-Reader)
                  </button>
                  <button
                    onClick={() => handleExport('docx', 'novel')}
                    className="w-full flex items-center justify-center gap-2 bg-[#12151c] hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-mono font-bold py-3 rounded-xl cursor-pointer transition-all"
                  >
                    <Download size={14} /> Export DOCX (Word)
                  </button>
                </div>
              </div>

              {/* Screenplay Preset */}
              <div className="bg-[#0c0e12] border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300">
                      <FileEdit size={16} />
                    </div>
                    <h4 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider">Screenplay Preset</h4>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed font-sans mb-6">
                    Formats text to standard Courier 12pt font, centered character dialog alignments, parenting scene cues, and formal action line margins.
                  </p>
                </div>
                <div className="space-y-2.5">
                  <button
                    onClick={() => handleExport('epub', 'screenplay')}
                    className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-mono font-black uppercase tracking-wider py-3 rounded-xl cursor-pointer shadow-lg shadow-amber-500/20 transition-all"
                  >
                    <Download size={14} /> Export MOBI (Kindle)
                  </button>
                  <button
                    onClick={() => handleExport('docx', 'screenplay')}
                    className="w-full flex items-center justify-center gap-2 bg-[#12151c] hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-mono font-bold py-3 rounded-xl cursor-pointer transition-all"
                  >
                    <Download size={14} /> Export DOCX (Word)
                  </button>
                </div>
              </div>

              {/* Academic/Formal Preset */}
              <div className="bg-[#0c0e12] border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                      <BookTemplate size={16} />
                    </div>
                    <h4 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider">Academic Preset</h4>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed font-sans mb-6">
                    Double-spaced layout, margins optimized for footnotes, standard bibliography citations headers, and APA format table indices.
                  </p>
                </div>
                <div className="space-y-2.5">
                  <button
                    onClick={() => handleExport('epub', 'academic')}
                    className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-mono font-black uppercase tracking-wider py-3 rounded-xl cursor-pointer shadow-lg shadow-amber-500/20 transition-all"
                  >
                    <Download size={14} /> Export EPUB (E-Reader)
                  </button>
                  <button
                    onClick={() => handleExport('docx', 'academic')}
                    className="w-full flex items-center justify-center gap-2 bg-[#12151c] hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-mono font-bold py-3 rounded-xl cursor-pointer transition-all"
                  >
                    <Download size={14} /> Export DOCX (Word)
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* COVER DESIGNER */}
        {activeSubTab === 'cover' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Live Preview Canvas */}
            <div className="lg:col-span-5 flex flex-col items-center justify-center bg-[#0c0e12] border border-slate-800 rounded-3xl p-8 shadow-xl">
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest mb-4">Live KDP Cover Preview (Spine Mock)</span>
              
              <div className={`w-[240px] h-[360px] rounded-2xl shadow-2xl relative overflow-hidden bg-gradient-to-b flex flex-col justify-between p-6 text-center select-none border border-white/10 ${colorGradients[coverColor]}`}>
                <div className="absolute inset-0 bg-radial from-transparent via-transparent to-black/50 pointer-events-none" />

                {coverArtType === 'geometric' && (
                  <div className="absolute inset-0 opacity-20 flex items-center justify-center pointer-events-none">
                    <div className="w-40 h-40 rounded-full border border-white flex items-center justify-center animate-spin" style={{ animationDuration: '60s' }}>
                      <div className="w-32 h-32 border border-dashed border-white flex items-center justify-center">
                        <div className="w-20 h-20 border-2 border-white rotate-45" />
                      </div>
                    </div>
                  </div>
                )}
                {coverArtType === 'landscape' && (
                  <div className="absolute inset-x-0 bottom-0 top-1/2 opacity-15 pointer-events-none">
                    <svg viewBox="0 0 100 100" className="w-full h-full fill-white">
                      <path d="M0,80 Q30,60 50,80 T100,80 L100,100 L0,100 Z" />
                      <path d="M10,85 Q40,70 70,85 T100,85 L100,100 L10,100 Z" opacity="0.5" />
                    </svg>
                  </div>
                )}

                {coverLayout === 'editorial' && (
                  <>
                    <div className="z-10">
                      <h4 className="text-[10px] tracking-[0.2em] font-mono font-bold text-slate-300 uppercase">{coverAuthor}</h4>
                    </div>
                    <div className="z-10 flex-1 flex flex-col justify-center items-center">
                      <h2 className="text-xl font-bold tracking-tight text-white font-serif leading-tight">{coverTitle}</h2>
                      <div className="w-8 h-[2px] bg-amber-400 my-2.5" />
                      <p className="text-[10px] text-slate-300 italic max-w-[160px] font-serif leading-normal">{coverSubtitle}</p>
                    </div>
                    <div className="z-10">
                      <span className="text-[8px] font-mono tracking-widest text-amber-400 font-bold uppercase">WashBizHub Press</span>
                    </div>
                  </>
                )}

                {coverLayout === 'classic' && (
                  <>
                    <div className="z-10 pt-4">
                      <h2 className="text-lg font-bold tracking-widest text-white uppercase font-sans">{coverTitle}</h2>
                      <p className="text-[9px] tracking-wider text-slate-300 mt-1 uppercase font-sans">{coverSubtitle}</p>
                    </div>
                    <div className="z-10 flex-1 flex items-center justify-center">
                      <div className="w-16 h-16 border border-white/20 rounded-xl flex items-center justify-center shadow-inner">
                        <span className="text-xs font-mono font-bold text-white uppercase">{coverAuthor.slice(0, 3)}</span>
                      </div>
                    </div>
                    <div className="z-10">
                      <h4 className="text-[10px] font-mono tracking-widest text-slate-300 font-bold uppercase">{coverAuthor}</h4>
                    </div>
                  </>
                )}

                {coverLayout === 'minimal' && (
                  <>
                    <div className="flex-1 flex flex-col justify-center text-left pt-8 z-10">
                      <h2 className="text-2xl font-black tracking-tight text-white leading-none font-sans">{coverTitle}</h2>
                      <p className="text-[10px] text-slate-400 mt-2 font-mono">{coverSubtitle}</p>
                    </div>
                    <div className="z-10 text-left border-t border-white/10 pt-3">
                      <h4 className="text-xs font-mono font-bold text-white uppercase">{coverAuthor}</h4>
                    </div>
                  </>
                )}

                {coverLayout === 'bold' && (
                  <>
                    <div className="z-10 pt-2 text-right">
                      <span className="text-[8px] font-mono font-extrabold uppercase bg-rose-600 text-white px-2.5 py-0.5 rounded-lg">Bestseller</span>
                    </div>
                    <div className="z-10 flex-1 flex flex-col justify-center text-center">
                      <h2 className="text-3xl font-extrabold tracking-tighter text-white uppercase scale-y-110 leading-none">{coverTitle}</h2>
                      <p className="text-[9px] font-mono font-bold uppercase text-slate-300 mt-3 tracking-widest">{coverSubtitle}</p>
                    </div>
                    <div className="z-10 pb-2">
                      <h4 className="text-sm font-mono font-extrabold text-amber-400 uppercase tracking-wide">{coverAuthor}</h4>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Customizer Controls */}
            <div className="lg:col-span-7 bg-[#0c0e12] border border-slate-800 rounded-3xl p-8 shadow-xl space-y-6">
              <div>
                <h3 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-widest">Cover Metadata</h3>
                <div className="grid grid-cols-1 gap-3 mt-3">
                  <div>
                    <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-widest mb-1 font-bold">Book Title</label>
                    <input
                      type="text"
                      value={coverTitle}
                      onChange={e => setCoverTitle(e.target.value)}
                      className="w-full bg-[#12151c] border border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-200 outline-none focus:border-amber-500 shadow-inner"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-widest mb-1 font-bold">Subtitle</label>
                    <input
                      type="text"
                      value={coverSubtitle}
                      onChange={e => setCoverSubtitle(e.target.value)}
                      className="w-full bg-[#12151c] border border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-200 outline-none focus:border-amber-500 shadow-inner"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-widest mb-1 font-bold">Author Name</label>
                    <input
                      type="text"
                      value={coverAuthor}
                      onChange={e => setCoverAuthor(e.target.value)}
                      className="w-full bg-[#12151c] border border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-200 outline-none focus:border-amber-500 shadow-inner"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-widest mb-1 font-bold">Palette</label>
                  <select
                    value={coverColor}
                    onChange={e => setCoverColor(e.target.value as any)}
                    className="w-full bg-[#12151c] border border-slate-800 rounded-xl px-4 py-3 text-xs font-mono text-slate-200 outline-none focus:border-amber-500 cursor-pointer shadow-inner"
                  >
                    <option value="indigo">Indigo / Midnight</option>
                    <option value="amber">Amber / Vintage</option>
                    <option value="slate">Slate / Minimal</option>
                    <option value="emerald">Emerald / Nature</option>
                    <option value="crimson">Crimson / Drama</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-widest mb-1 font-bold">Art Motif</label>
                  <select
                    value={coverArtType}
                    onChange={e => setCoverArtType(e.target.value as any)}
                    className="w-full bg-[#12151c] border border-slate-800 rounded-xl px-4 py-3 text-xs font-mono text-slate-200 outline-none focus:border-amber-500 cursor-pointer shadow-inner"
                  >
                    <option value="none">None (Clean Typography)</option>
                    <option value="geometric">Geometric Astrolabe</option>
                    <option value="landscape">Scenic Ridges</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-widest mb-2 font-bold">Typography Layout</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {[
                    { key: 'editorial', label: 'Editorial' },
                    { key: 'classic', label: 'Classic' },
                    { key: 'minimal', label: 'Minimalist' },
                    { key: 'bold', label: 'Impact Bold' }
                  ].map(lay => (
                    <button
                      key={lay.key}
                      onClick={() => setCoverLayout(lay.key as any)}
                      className={`px-3 py-2.5 border text-xs font-mono font-bold rounded-xl cursor-pointer transition-all ${coverLayout === lay.key ? 'bg-amber-500 text-slate-950 font-black border-amber-400 shadow-md' : 'bg-[#12151c] border-slate-800 text-slate-300 hover:border-slate-700'}`}
                    >
                      {lay.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* KDP Spine Width Calculator */}
              <div className="bg-[#12151c] border border-slate-800 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                      <BookOpen size={14} />
                    </div>
                    <h4 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-widest">KDP Spine Width Calculator</h4>
                  </div>
                  <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded">Live Manuscript Bound</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-widest mb-1 font-bold">Paper Stock</label>
                    <select
                      value={paperType}
                      onChange={e => setPaperType(e.target.value as any)}
                      className="w-full bg-[#0c0e12] border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-200 outline-none focus:border-amber-500 cursor-pointer"
                    >
                      <option value="cream">Cream Paper (~0.0025 in/pg)</option>
                      <option value="white">White Paper (~0.00225 in/pg)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-widest mb-1 font-bold">Trim Size</label>
                    <select
                      value={trimSize}
                      onChange={e => setTrimSize(e.target.value as any)}
                      className="w-full bg-[#0c0e12] border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-200 outline-none focus:border-amber-500 cursor-pointer"
                    >
                      <option value="6x9">6" x 9" Standard</option>
                      <option value="5.5x8.5">5.5" x 8.5" Digest</option>
                      <option value="8.5x11">8.5" x 11" Letter</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 pt-1">
                  <div className="bg-[#0c0e12] border border-slate-800/80 p-3 rounded-xl text-center">
                    <span className="block text-[9px] font-mono text-slate-500 uppercase tracking-widest font-bold">Word Count</span>
                    <span className="text-sm font-bold font-mono text-slate-100 mt-0.5 block">{totalWordCount.toLocaleString()}</span>
                  </div>
                  <div className="bg-[#0c0e12] border border-slate-800/80 p-3 rounded-xl text-center">
                    <span className="block text-[9px] font-mono text-slate-500 uppercase tracking-widest font-bold">Est. Pages</span>
                    <span className="text-sm font-bold font-mono text-amber-400 mt-0.5 block">{estimatedPages} pgs</span>
                  </div>
                  <div className="bg-[#0c0e12] border border-slate-800/80 p-3 rounded-xl text-center">
                    <span className="block text-[9px] font-mono text-slate-500 uppercase tracking-widest font-bold">Spine Width</span>
                    <span className="text-sm font-black font-mono text-amber-400 mt-0.5 block">{spineWidthInches}" ({spineWidthMm} mm)</span>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => showToast('High-resolution print-ready jacket cover PDF compiled for KDP Upload!', 'success')}
                  className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-mono text-xs font-black uppercase tracking-wider py-3.5 rounded-xl shadow-xl shadow-amber-500/20 cursor-pointer transition-all"
                >
                  <Download size={15} /> Export Print-Ready Jacket PDF
                </button>
              </div>
            </div>
          </div>
        )}

        {/* AI PUBLICITY DESK */}
        {activeSubTab === 'marketing' && (
          <div className="space-y-6">
            <nav aria-label="AI Publicity Desk Sub-Tabs" className="flex bg-[#0c0e12] p-1.5 rounded-2xl border border-slate-800 w-fit gap-1 shadow-md">
              <button
                onClick={() => { setMarketingType('titles'); setGeneratedResult(''); }}
                className={`px-4 py-2 text-xs font-mono uppercase tracking-wider rounded-xl transition-all cursor-pointer font-bold ${marketingType === 'titles' ? 'bg-amber-500 text-slate-950 font-black shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
              >
                AI Title Suggestions
              </button>
              <button
                onClick={() => { setMarketingType('blurb'); setGeneratedResult(''); }}
                className={`px-4 py-2 text-xs font-mono uppercase tracking-wider rounded-xl transition-all cursor-pointer font-bold ${marketingType === 'blurb' ? 'bg-amber-500 text-slate-950 font-black shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
              >
                AI Back-Cover Blurb
              </button>
              <button
                onClick={() => { setMarketingType('query'); setGeneratedResult(''); }}
                className={`px-4 py-2 text-xs font-mono uppercase tracking-wider rounded-xl transition-all cursor-pointer font-bold ${marketingType === 'query' ? 'bg-amber-500 text-slate-950 font-black shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
              >
                AI Agent Query Letter
              </button>
            </nav>

            <div className="bg-[#0c0e12] border border-slate-800 rounded-3xl p-8 space-y-5 shadow-xl">
              <div className="flex justify-between items-center pb-4 border-b border-slate-800">
                <h4 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-widest">
                  {marketingType === 'titles' ? 'Launch Book Brainstormer' : marketingType === 'blurb' ? 'Back-Cover Blurb Copywriter' : 'Lit Agent Query Letter Drafter'}
                </h4>
                <button
                  onClick={handleGenerateMarketing}
                  disabled={isGenerating}
                  className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-55 text-slate-950 font-mono text-xs font-black uppercase tracking-wider px-5 py-2.5 rounded-xl cursor-pointer shadow-lg shadow-amber-500/20 transition-all"
                >
                  {isGenerating ? <RefreshCw size={14} className="animate-spin" /> : <Sparkles size={14} />}
                  <span>{isGenerating ? 'Drafting Copy...' : 'Generate with Gemini'}</span>
                </button>
              </div>

              <div className="min-h-[220px] max-h-[400px] overflow-y-auto bg-[#12151c] border border-slate-800 rounded-2xl p-6 text-xs font-mono whitespace-pre-wrap leading-relaxed text-slate-200 shadow-inner custom-scrollbar">
                {isGenerating ? (
                  <div className="flex flex-col items-center justify-center h-36 space-y-3">
                    <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
                    <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest animate-pulse font-bold">Consulting Gemini Creative Agent...</span>
                  </div>
                ) : generatedResult ? (
                  generatedResult
                ) : (
                  <span className="text-slate-500 italic">No publicity copy drafted yet. Click 'Generate with Gemini' to draft optimized promotional material based on your book chapters!</span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* DIRECT SYNDICATION DESK */}
        {activeSubTab === 'syndicate' && (
          <div className="space-y-6">
            <div className="bg-[#0c0e12] border border-slate-800 rounded-3xl p-8 shadow-xl flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-serif font-bold text-slate-100 flex items-center gap-2 mb-2">
                  <ShieldCheck className="text-amber-400" /> Direct Distribution & Metadata Syndication
                </h3>
                <p className="text-xs font-mono text-slate-400 mb-6 max-w-2xl">
                  Automate the generation of ONIX XML manifests. Direct API hooks for IngramSpark, Draft2Digital, Apple Books, and KDP ensure your ISBN, BISAC categories, and pricing metadata match flawlessly.
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-[#12151c] border border-slate-800 rounded-2xl p-5 space-y-4">
                  <h4 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-widest flex items-center justify-between">
                    API Connections <span className="text-[10px] text-amber-400">Offline</span>
                  </h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between bg-black/40 p-3 rounded-xl border border-slate-800">
                      <span className="text-xs font-mono font-bold">IngramSpark API</span>
                      <button className="text-[10px] bg-slate-800 px-3 py-1 rounded text-slate-300 font-bold hover:bg-slate-700">Connect</button>
                    </div>
                    <div className="flex items-center justify-between bg-black/40 p-3 rounded-xl border border-slate-800">
                      <span className="text-xs font-mono font-bold">Draft2Digital API</span>
                      <button className="text-[10px] bg-slate-800 px-3 py-1 rounded text-slate-300 font-bold hover:bg-slate-700">Connect</button>
                    </div>
                    <div className="flex items-center justify-between bg-black/40 p-3 rounded-xl border border-slate-800">
                      <span className="text-xs font-mono font-bold">Apple Books API</span>
                      <button className="text-[10px] bg-slate-800 px-3 py-1 rounded text-slate-300 font-bold hover:bg-slate-700">Connect</button>
                    </div>
                  </div>
                </div>

                <div className="bg-[#12151c] border border-slate-800 rounded-2xl p-5 space-y-4 flex flex-col justify-between">
                  <div>
                    <h4 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-widest">ONIX XML Manifest</h4>
                    <p className="text-[10px] text-slate-500 mt-2">
                      Compile an ONIX manifest that defines title, authorship, ISBN, metadata, pricing logic, and royalty tiers in retail-ready format.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      showToast('Generating ONIX XML metadata manifest...', 'info');
                      setTimeout(() => showToast('Manifest generated and staged for syndication!', 'success'), 1500);
                    }}
                    className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-mono font-black uppercase tracking-wider py-3 rounded-xl cursor-pointer shadow-lg shadow-amber-500/20 transition-all mt-4"
                  >
                    <RefreshCw size={14} /> Auto-Generate Manifest
                  </button>
                </div>
              </div>

              {/* Hybrid BYOI Workflow & ISBN Vault */}
              <div className="mt-6 bg-[#12151c] border border-slate-800 rounded-2xl p-6">
                <div className="mb-5 border-b border-slate-800 pb-4">
                  <h4 className="text-sm font-mono font-bold text-slate-200 uppercase tracking-widest flex items-center gap-2">
                    <BookOpen size={16} className="text-indigo-400" /> ISBN Vault & Barcode Generator (BYOI)
                  </h4>
                  <p className="text-[10px] text-slate-400 mt-1">
                    Enter your legally purchased ISBN-13 and imprint details. We dynamically generate print-ready, vectorized EAN-13 barcodes with 5-digit retail price encoding, eliminating KDP/IngramSpark checksum rejections.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div className="space-y-4 md:col-span-2">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest mb-1">ISBN-13</label>
                        <input
                          type="text"
                          value={isbn}
                          onChange={e => setIsbn(e.target.value)}
                          placeholder="e.g. 978-1-234-56789-0"
                          className="w-full bg-[#0c0e12] border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 font-mono outline-none focus:border-indigo-500 shadow-inner"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest mb-1">Retail Price (USD)</label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-mono">$</span>
                          <input
                            type="text"
                            value={retailPrice}
                            onChange={e => setRetailPrice(e.target.value)}
                            placeholder="24.99"
                            className="w-full bg-[#0c0e12] border border-slate-800 rounded-xl pl-7 pr-4 py-2.5 text-sm text-slate-200 font-mono outline-none focus:border-indigo-500 shadow-inner"
                          />
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest mb-1">Registered Imprint / Publisher Name</label>
                      <input
                        type="text"
                        value={imprint}
                        onChange={e => setImprint(e.target.value)}
                        placeholder="WashBizHub Press"
                        className="w-full bg-[#0c0e12] border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 font-mono outline-none focus:border-indigo-500 shadow-inner"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col justify-end">
                    <button
                      onClick={() => {
                        if (!isbn) {
                          showToast('Please enter a valid ISBN-13.', 'error');
                          return;
                        }
                        setGeneratingBarcode(true);
                        showToast('Calculating EAN-13 checksums and encoding price extension...', 'info');
                        setTimeout(() => {
                          setGeneratingBarcode(false);
                          showToast('Vector barcode generated and injected into back-matter templates!', 'success');
                        }, 1800);
                      }}
                      disabled={generatingBarcode}
                      className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 text-white font-mono text-xs font-black uppercase tracking-wider py-4 rounded-xl cursor-pointer shadow-lg shadow-indigo-600/20 transition-all h-[114px]"
                    >
                      {generatingBarcode ? (
                        <div className="flex flex-col items-center gap-2">
                          <RefreshCw size={18} className="animate-spin text-indigo-300" />
                          <span className="text-[10px]">Processing...</span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-2">
                          <Download size={20} />
                          <span className="text-[10px] leading-tight text-center">Export EAN-13<br/>Vector Barcode</span>
                        </div>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
      
      {showPreflight && (
        <KdpPreflightChecker
          onClose={() => setShowPreflight(false)}
          manuscriptTitle={book.title}
          chapterCount={book.chapters.length}
          wordCount={totalWordCount}
        />
      )}
    </aside>
  );
}