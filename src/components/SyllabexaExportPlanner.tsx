import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Sparkles, Printer, FileText, ChevronRight, RefreshCw, 
  CheckCircle, Download, Sliders, Image as ImageIcon, 
  Check, Plus, ChevronLeft, BookTemplate, CheckSquare, Type as FontIcon, 
  Compass, Palette, X
} from 'lucide-react';
import { useAuth } from '../lib/AuthContext';

interface ExportPlannerProps {
  bookTitle: string;
  bookAuthor: string;
  bookChapters: { title: string; content: string }[];
  bookPremise: string;
}

interface StructuredBook {
  title_page: { title: string; subtitle: string; author: string; };
  front_matter: { section_title: string; content: string }[];
  chapters: { title: string; content: string }[];
  back_matter: { section_title: string; content: string }[];
}

interface PageBlock {
  type: 'title_page' | 'dedication' | 'toc' | 'list_of_figures' | 'section_title' | 'paragraph' | 'figure' | 'doctrine' | 'workbook' | 'back_matter' | 'blank_page';
  title?: string; subtitle?: string; author?: string; content?: string; caption?: string; imageUrl?: string;
  meta?: { isFirstParagraph?: boolean; [key: string]: any; };
}

interface VirtualPage {
  pageNumber: number;
  header: { left: string; right: string };
  blocks: PageBlock[];
  isLeft: boolean;
}

const getFontFamily = (bodyFont: string) => {
  switch (bodyFont) {
    case 'Garamond': return 'Garamond, Libre Baskerville, Georgia, serif';
    case 'Baskerville': return 'Libre Baskerville, Baskerville, Playfair Display, serif';
    case 'Inter': return 'Inter, ui-sans-serif, system-ui, sans-serif';
    case 'JetBrains Mono': return 'JetBrains Mono, Courier, monospace';
    default: return 'Garamond, serif';
  }
};

export default function SyllabexaExportPlanner({ bookTitle, bookAuthor, bookChapters, bookPremise }: ExportPlannerProps) {
  const { profile } = useAuth();
  const [showPaywall, setShowPaywall] = useState(false);
  const [pageSize, setPageSize] = useState<'6x9' | '8.5x11' | '5x8' | '7x10'>('6x9');
  const [gutterSize, setGutterSize] = useState<number>(0.625);
  const [outerMargin, setOuterMargin] = useState<number>(0.75);
  const [fontSize, setFontSize] = useState<number>(11);
  const [lineHeight, setLineHeight] = useState<number>(1.5);
  const [bodyFont, setBodyFont] = useState<string>('Garamond');
  const [dropCapsEnabled, setDropCapsEnabled] = useState<boolean>(true);
  const [dropCapStyle, setDropCapStyle] = useState<string>('traditional');
  
  const [showHeaders, setShowHeaders] = useState<boolean>(true);
  const [showFooters, setShowFooters] = useState<boolean>(true);
  const [previewMode, setPreviewMode] = useState<'spread' | 'stack'>('spread');
  const [showCropMarks, setShowCropMarks] = useState<boolean>(false);
  const [showBleed, setShowBleed] = useState<boolean>(false);
  const [showSafeZone, setShowSafeZone] = useState<boolean>(true);
  const [showBaselineGrid, setShowBaselineGrid] = useState<boolean>(false);
  const [currentSpreadIndex, setCurrentSpreadIndex] = useState<number>(0);
  const [zoomScale, setZoomScale] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<'preview' | 'chapters' | 'styles' | 'metadata'>('preview');
  const [activeChapterIndex, setActiveChapterIndex] = useState<number>(0);

  const [aiSuggestions, setAiSuggestions] = useState<string[]>([
    "Consider adding a half-title page before chapter one.",
    "Adjust recto margin spacing for optimal spine clearance.",
    "Check hyphenation density in chapter 2."
  ]);
  const [isAiOptimizing, setIsAiOptimizing] = useState<boolean>(false);

  const [structuredBook, setStructuredBook] = useState<StructuredBook>({
    title_page: {
      title: bookTitle,
      subtitle: "A Masterwork of Professional Craft & Insight",
      author: bookAuthor
    },
    front_matter: [
      { section_title: "Author's Note", content: "This volume was typeset and designed using Syllabexa Professional Engine." },
      { section_title: "Table of Contents", content: "TOC placeholder" }
    ],
    chapters: bookChapters.map(c => ({ title: c.title, content: c.content })),
    back_matter: [
      { section_title: "About the Author", content: `${bookAuthor} is a dedicated creator and researcher.` }
    ]
  });

  useEffect(() => {
    setStructuredBook({
      title_page: {
        title: bookTitle,
        subtitle: "A Masterwork of Professional Craft & Insight",
        author: bookAuthor
      },
      front_matter: [
        { section_title: "Author's Note", content: "This volume was typeset and designed using Syllabexa Professional Engine." },
        { section_title: "Table of Contents", content: "TOC placeholder" }
      ],
      chapters: bookChapters.map(c => ({ title: c.title, content: c.content })),
      back_matter: [
        { section_title: "About the Author", content: `${bookAuthor} is a dedicated creator and researcher.` }
      ]
    });
  }, [bookTitle, bookAuthor, bookChapters]);

  const virtualPages: VirtualPage[] = useMemo(() => {
    const pages: VirtualPage[] = [];
    let pageNum = 1;

    // 1. Title Page
    pages.push({
      pageNumber: pageNum++,
      header: { left: "", right: "" },
      blocks: [
        { type: 'title_page', title: structuredBook.title_page.title, subtitle: structuredBook.title_page.subtitle, author: structuredBook.title_page.author }
      ],
      isLeft: false
    });

    // Blank verso after title page
    pages.push({
      pageNumber: pageNum++,
      header: { left: "", right: "" },
      blocks: [{ type: 'blank_page' }],
      isLeft: true
    });

    // 2. Front Matter (Author's Note, TOC)
    structuredBook.front_matter.forEach((fm) => {
      pages.push({
        pageNumber: pageNum++,
        header: { left: bookTitle, right: fm.section_title },
        blocks: [
          { type: 'section_title', title: fm.section_title },
          { type: 'paragraph', content: fm.content, meta: { isFirstParagraph: true } }
        ],
        isLeft: pageNum % 2 === 0
      });
    });

    // 3. Chapters
    structuredBook.chapters.forEach((ch, chIdx) => {
      if (pageNum % 2 === 0) {
        pages.push({
          pageNumber: pageNum++,
          header: { left: bookTitle, right: "Notes" },
          blocks: [{ type: 'blank_page' }],
          isLeft: true
        });
      }

      const paragraphs = ch.content.split(/\n\n+/).filter(Boolean);
      let currentBlocks: PageBlock[] = [
        { type: 'section_title', title: `Chapter ${chIdx + 1}: ${ch.title}` }
      ];

      paragraphs.forEach((para, pIdx) => {
        const trimmed = para.trim();
        let blockType: PageBlock['type'] = 'paragraph';
        let blockTitle: string | undefined = undefined;
        let blockContent = trimmed;

        if (trimmed.startsWith('> ')) {
          blockType = 'doctrine';
          blockTitle = 'Directive';
          blockContent = trimmed.replace(/^>\s+/, '');
        } else if (trimmed.startsWith('## ') || trimmed.startsWith('### ')) {
          blockType = 'doctrine';
          blockTitle = trimmed.replace(/^#+\s+/, '');
          blockContent = "Operational Standard.";
        } else if (trimmed.includes('[ ]') || trimmed.includes('- [ ]')) {
          blockType = 'workbook';
          blockTitle = 'Action Checklist';
          blockContent = trimmed;
        }

        const newBlock: PageBlock = {
          type: blockType,
          title: blockTitle,
          content: blockContent,
          meta: { isFirstParagraph: pIdx === 0 }
        };

        currentBlocks.push(newBlock);
        if (currentBlocks.length >= 4) {
          pages.push({
            pageNumber: pageNum++,
            header: { left: bookTitle, right: ch.title },
            blocks: [...currentBlocks],
            isLeft: pageNum % 2 === 0
          });
          currentBlocks = [];
        }
      });

      if (currentBlocks.length > 0) {
        pages.push({
          pageNumber: pageNum++,
          header: { left: bookTitle, right: ch.title },
          blocks: [...currentBlocks],
          isLeft: pageNum % 2 === 0
        });
      }
    });

    // 4. Back Matter
    structuredBook.back_matter.forEach((bm) => {
      pages.push({
        pageNumber: pageNum++,
        header: { left: bookTitle, right: bm.section_title },
        blocks: [
          { type: 'section_title', title: bm.section_title },
          { type: 'paragraph', content: bm.content, meta: { isFirstParagraph: true } }
        ],
        isLeft: pageNum % 2 === 0
      });
    });

    return pages;
  }, [structuredBook, bookTitle]);

  const maxSpreads = useMemo(() => Math.ceil(virtualPages.length / 2), [virtualPages.length]);

  const handleRunAiOptimize = () => {
    setIsAiOptimizing(true);
    setTimeout(() => {
      setFontSize(prev => prev === 11 ? 10.5 : 11);
      setLineHeight(prev => prev === 1.5 ? 1.55 : 1.5);
      setAiSuggestions(prev => [...prev, "Typography rhythm optimized by Gemini Art Director."]);
      setIsAiOptimizing(false);
    }, 1200);
  };

  const getPageDimensions = () => {
    switch (pageSize) {
      case '5x8': return { width: 360, height: 576 };
      case '7x10': return { width: 504, height: 720 };
      case '8.5x11': return { width: 612, height: 792 };
      case '6x9': default: return { width: 432, height: 648 };
    }
  };

  const dims = getPageDimensions();

  return (
    <div className="flex flex-col h-full bg-[#0a0c10] text-slate-100 font-sans select-none overflow-hidden">
      <header className="h-14 border-b border-slate-800 bg-[#0f1117] px-6 flex items-center justify-between shrink-0 z-20">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-600/20 border border-indigo-500/30 rounded-xl text-indigo-400">
            <Printer size={18} />
          </div>
          <div>
            <h1 className="text-xs font-mono font-bold uppercase tracking-wider text-white">Syllabexa Print & Typesetter Engine</h1>
            <p className="text-[10px] text-slate-400">Professional PDF Book Layout & Prepress Verification</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button 
            type="button"
            onClick={handleRunAiOptimize}
            disabled={isAiOptimizing}
            className="px-3 py-1.5 bg-indigo-600/15 border border-indigo-500/30 rounded-xl text-indigo-300 text-xs font-mono font-bold flex items-center gap-1.5 hover:bg-indigo-600/25 transition-all cursor-pointer"
          >
            <Sparkles size={13} className={isAiOptimizing ? "animate-spin" : ""} />
            <span>{isAiOptimizing ? "Optimizing..." : "AI Typesetter Tune"}</span>
          </button>
          
          <button 
            type="button"
            onClick={() => {
              if (profile?.activePlan === 'free') {
                setShowPaywall(true);
              } else {
                window.print();
              }
            }}
            className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-all shadow-[0_0_15px_rgba(79,70,229,0.3)] cursor-pointer"
          >
            <Download size={13} />
            <span>Export Press PDF</span>
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <div className="w-80 border-r border-slate-800 bg-[#0f1117] flex flex-col shrink-0">
          <div className="flex border-b border-slate-800 p-2 gap-1 bg-[#0c0e12]">
            {(['preview', 'chapters', 'styles', 'metadata'] as const).map(tab => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-2 rounded-lg text-[9px] font-mono font-bold uppercase tracking-wider transition-all cursor-pointer ${activeTab === tab ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-5">
            {activeTab === 'preview' && (
              <>
                <div className="space-y-2">
                  <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">Trim Size / Preset</label>
                  <select
                    value={pageSize}
                    onChange={e => setPageSize(e.target.value as any)}
                    className="w-full bg-[#12151c] border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-200 outline-none focus:border-indigo-500 cursor-pointer"
                  >
                    <option value="6x9">Trade Paperback (6" x 9")</option>
                    <option value="5x8">Digest Paperback (5" x 8")</option>
                    <option value="7x10">Executive / Textbook (7" x 10")</option>
                    <option value="8.5x11">Standard Quarto (8.5" x 11")</option>
                  </select>
                </div>

                <div className="space-y-3 pt-2 border-t border-slate-800">
                  <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">Prepress Guides</span>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setShowCropMarks(!showCropMarks)}
                      className={`p-2.5 rounded-xl border text-xs font-mono flex items-center justify-between cursor-pointer ${showCropMarks ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300' : 'bg-[#12151c] border-slate-800 text-slate-400'}`}
                    >
                      <span>Crop Marks</span>
                      <Check size={12} className={showCropMarks ? "opacity-100" : "opacity-0"} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowBleed(!showBleed)}
                      className={`p-2.5 rounded-xl border text-xs font-mono flex items-center justify-between cursor-pointer ${showBleed ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300' : 'bg-[#12151c] border-slate-800 text-slate-400'}`}
                    >
                      <span>Bleed (0.125")</span>
                      <Check size={12} className={showBleed ? "opacity-100" : "opacity-0"} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowSafeZone(!showSafeZone)}
                      className={`p-2.5 rounded-xl border text-xs font-mono flex items-center justify-between cursor-pointer ${showSafeZone ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300' : 'bg-[#12151c] border-slate-800 text-slate-400'}`}
                    >
                      <span>Safe Zone</span>
                      <Check size={12} className={showSafeZone ? "opacity-100" : "opacity-0"} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowBaselineGrid(!showBaselineGrid)}
                      className={`p-2.5 rounded-xl border text-xs font-mono flex items-center justify-between cursor-pointer ${showBaselineGrid ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300' : 'bg-[#12151c] border-slate-800 text-slate-400'}`}
                    >
                      <span>Baseline Grid</span>
                      <Check size={12} className={showBaselineGrid ? "opacity-100" : "opacity-0"} />
                    </button>
                  </div>
                </div>

                <div className="space-y-3 pt-2 border-t border-slate-800">
                  <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">AI Art Director Audit</span>
                  <div className="space-y-2">
                    {aiSuggestions.map((s, idx) => (
                      <div key={idx} className="p-2.5 bg-[#12151c] border border-slate-800 rounded-xl text-[11px] text-slate-300 flex items-start gap-2">
                        <Sparkles size={12} className="text-amber-400 shrink-0 mt-0.5" />
                        <span>{s}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {activeTab === 'chapters' && (
              <div className="space-y-2">
                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">Manuscript Chapters</span>
                {structuredBook.chapters.map((ch, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveChapterIndex(idx)}
                    className={`w-full text-left p-3 rounded-xl border text-xs font-serif transition-all cursor-pointer flex items-center justify-between ${activeChapterIndex === idx ? 'bg-indigo-600/20 border-indigo-500 text-white font-bold' : 'bg-[#12151c] border-slate-800 text-slate-300 hover:bg-slate-800'}`}
                  >
                    <span>Chapter {idx + 1}: {ch.title}</span>
                    <ChevronRight size={14} className="text-slate-500" />
                  </button>
                ))}
              </div>
            )}

            {activeTab === 'styles' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">Body Font</label>
                  <select
                    value={bodyFont}
                    onChange={e => setBodyFont(e.target.value)}
                    className="w-full bg-[#12151c] border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-200 outline-none focus:border-indigo-500 cursor-pointer"
                  >
                    <option value="Garamond">Garamond Professional</option>
                    <option value="Baskerville">Libre Baskerville</option>
                    <option value="Inter">Modern Inter Sans</option>
                    <option value="JetBrains Mono">JetBrains Mono</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">Font Size ({fontSize}pt)</label>
                  <input
                    type="range"
                    min={9}
                    max={14}
                    step={0.5}
                    value={fontSize}
                    onChange={e => setFontSize(parseFloat(e.target.value))}
                    className="w-full accent-indigo-500 bg-slate-800 cursor-pointer h-1.5 rounded-lg"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">Line Height ({lineHeight})</label>
                  <input
                    type="range"
                    min={1.2}
                    max={2.0}
                    step={0.05}
                    value={lineHeight}
                    onChange={e => setLineHeight(parseFloat(e.target.value))}
                    className="w-full accent-indigo-500 bg-slate-800 cursor-pointer h-1.5 rounded-lg"
                  />
                </div>
              </div>
            )}

            {activeTab === 'metadata' && (
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">Book Title</label>
                  <input
                    type="text"
                    value={structuredBook.title_page.title}
                    onChange={e => setStructuredBook({ ...structuredBook, title_page: { ...structuredBook.title_page, title: e.target.value } })}
                    className="w-full bg-[#12151c] border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none focus:border-indigo-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">Author Name</label>
                  <input
                    type="text"
                    value={structuredBook.title_page.author}
                    onChange={e => setStructuredBook({ ...structuredBook, title_page: { ...structuredBook.title_page, author: e.target.value } })}
                    className="w-full bg-[#12151c] border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 bg-[#050505] p-6 lg:p-10 overflow-y-auto flex flex-col items-center relative select-none">
          <div className="w-full max-w-4xl bg-slate-950/90 border border-slate-800 p-2.5 rounded-2xl mb-6 flex items-center justify-between backdrop-blur-md shadow-2xl z-10">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-slate-400 uppercase font-bold">Spread: {currentSpreadIndex + 1} of {maxSpreads}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setCurrentSpreadIndex(prev => Math.max(0, prev - 1))}
                disabled={currentSpreadIndex === 0}
                className="px-3 py-1 bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono disabled:opacity-40 cursor-pointer hover:bg-slate-800"
              >
                Previous Spread
              </button>
              <button
                type="button"
                onClick={() => setCurrentSpreadIndex(prev => Math.min(maxSpreads - 1, prev + 1))}
                disabled={currentSpreadIndex >= maxSpreads - 1}
                className="px-3 py-1 bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono disabled:opacity-40 cursor-pointer hover:bg-slate-800"
              >
                Next Spread
              </button>
            </div>
          </div>

          <div className="flex items-center justify-center gap-0 my-auto py-4">
            {/* Verso */}
            {(() => {
              const leftIdx = currentSpreadIndex * 2;
              const page = virtualPages[leftIdx];
              if (!page) return <div style={{ width: dims.width, height: dims.height }} className="bg-[#fcfbf9] rounded-l-lg border border-slate-800 flex items-center justify-center text-slate-400 text-xs font-mono">Blank Verso</div>;

              return (
                <div 
                  className="bg-[#fcfbf9] text-slate-900 relative shadow-[-10px_0_30px_rgba(0,0,0,0.5)] transition-all duration-300 flex flex-col justify-between overflow-hidden"
                  style={{ width: dims.width, height: dims.height, padding: '40px 48px' }}
                >
                  <div className="absolute top-0 right-0 bottom-0 w-6 bg-gradient-to-l from-black/15 to-transparent pointer-events-none" />

                  {showCropMarks && (
                    <>
                      <div className="absolute top-1 left-1 w-3 h-3 border-t border-l border-slate-400 pointer-events-none" />
                      <div className="absolute top-1 right-1 w-3 h-3 border-t border-r border-slate-400 pointer-events-none" />
                      <div className="absolute bottom-1 left-1 w-3 h-3 border-b border-l border-slate-400 pointer-events-none" />
                      <div className="absolute bottom-1 right-1 w-3 h-3 border-b border-r border-slate-400 pointer-events-none" />
                    </>
                  )}

                  {showBleed && <div className="absolute -inset-2 border border-dashed border-red-500/50 pointer-events-none z-10" />}
                  {showSafeZone && <div className="absolute inset-4 border border-dashed border-cyan-500/30 pointer-events-none z-10" />}

                  <div className="text-[8px] font-mono text-slate-400 uppercase tracking-widest text-left pb-3 border-b border-slate-200">
                    {page.header.left}
                  </div>

                  <div className="flex-1 overflow-hidden py-3 space-y-3">
                    {page.blocks.map((block, idx) => {
                      if (block.type === 'blank_page') return <div key={idx} className="h-full flex items-center justify-center text-slate-300 text-xs font-serif italic">Intentionally Blank</div>;
                      if (block.type === 'title_page') {
                        return (
                          <div key={idx} className="text-center space-y-4 my-auto py-12">
                            <h2 className="text-lg font-serif font-bold uppercase tracking-widest">{block.title}</h2>
                            <p className="text-[9px] font-sans italic text-slate-500">{block.subtitle}</p>
                            <div className="w-8 h-px bg-slate-300 mx-auto"></div>
                            <p className="text-[9px] font-sans font-bold uppercase">{block.author}</p>
                          </div>
                        );
                      }
                      if (block.type === 'section_title') {
                        return <h3 key={idx} className="text-xs font-serif font-bold uppercase tracking-wider mb-2 text-slate-900 border-b border-slate-200 pb-1">{block.title}</h3>;
                      }
                      if (block.type === 'doctrine') {
                        return (
                          <div key={idx} className="my-2 p-3 bg-amber-50/80 border-l-2 border-amber-500 text-[9px] font-serif italic">
                            <strong>{block.title}:</strong> {block.content}
                          </div>
                        );
                      }
                      if (block.type === 'workbook') {
                        return (
                          <div key={idx} className="my-2 p-3 bg-slate-100 border border-slate-200 rounded text-[9px] font-mono">
                            <div className="font-bold mb-1 text-slate-800">{block.title}</div>
                            <p className="font-sans">{block.content}</p>
                          </div>
                        );
                      }
                      return (
                        <p key={idx} className="text-slate-800 text-[10px] leading-relaxed text-justify font-serif" style={{ fontSize: `${fontSize}pt`, lineHeight, fontFamily: getFontFamily(bodyFont) }}>
                          {block.content}
                        </p>
                      );
                    })}
                  </div>

                  <div className="text-[8px] font-mono text-slate-400 text-center pt-3 border-t border-slate-200">
                    {page.pageNumber}
                  </div>
                </div>
              );
            })()}

            {/* Recto */}
            {(() => {
              const rightIdx = currentSpreadIndex * 2 + 1;
              const page = virtualPages[rightIdx];
              if (!page) return <div style={{ width: dims.width, height: dims.height }} className="bg-[#fcfbf9] rounded-r-lg border border-slate-800 flex items-center justify-center text-slate-400 text-xs font-mono">End of Book</div>;

              return (
                <div 
                  className="bg-[#fcfbf9] text-slate-900 relative shadow-[10px_0_30px_rgba(0,0,0,0.5)] transition-all duration-300 flex flex-col justify-between overflow-hidden"
                  style={{ width: dims.width, height: dims.height, padding: '40px 48px' }}
                >
                  <div className="absolute top-0 left-0 bottom-0 w-6 bg-gradient-to-r from-black/15 to-transparent pointer-events-none" />

                  {showCropMarks && (
                    <>
                      <div className="absolute top-1 left-1 w-3 h-3 border-t border-l border-slate-400 pointer-events-none" />
                      <div className="absolute top-1 right-1 w-3 h-3 border-t border-r border-slate-400 pointer-events-none" />
                      <div className="absolute bottom-1 left-1 w-3 h-3 border-b border-l border-slate-400 pointer-events-none" />
                      <div className="absolute bottom-1 right-1 w-3 h-3 border-b border-r border-slate-400 pointer-events-none" />
                    </>
                  )}

                  {showBleed && <div className="absolute -inset-2 border border-dashed border-red-500/50 pointer-events-none z-10" />}
                  {showSafeZone && <div className="absolute inset-4 border border-dashed border-cyan-500/30 pointer-events-none z-10" />}

                  <div className="text-[8px] font-mono text-slate-400 uppercase tracking-widest text-right pb-3 border-b border-slate-200">
                    {page.header.right}
                  </div>

                  <div className="flex-1 overflow-hidden py-3 space-y-3">
                    {page.blocks.map((block, idx) => {
                      if (block.type === 'blank_page') return <div key={idx} className="h-full flex items-center justify-center text-slate-300 text-xs font-serif italic">Intentionally Blank</div>;
                      if (block.type === 'title_page') {
                        return (
                          <div key={idx} className="text-center space-y-4 my-auto py-12">
                            <h2 className="text-lg font-serif font-bold uppercase tracking-widest">{block.title}</h2>
                            <p className="text-[9px] font-sans italic text-slate-500">{block.subtitle}</p>
                            <div className="w-8 h-px bg-slate-300 mx-auto"></div>
                            <p className="text-[9px] font-sans font-bold uppercase">{block.author}</p>
                          </div>
                        );
                      }
                      if (block.type === 'section_title') {
                        return <h3 key={idx} className="text-xs font-serif font-bold uppercase tracking-wider mb-2 text-slate-900 border-b border-slate-200 pb-1">{block.title}</h3>;
                      }
                      if (block.type === 'doctrine') {
                        return (
                          <div key={idx} className="my-2 p-3 bg-amber-50/80 border-l-2 border-amber-500 text-[9px] font-serif italic">
                            <strong>{block.title}:</strong> {block.content}
                          </div>
                        );
                      }
                      if (block.type === 'workbook') {
                        return (
                          <div key={idx} className="my-2 p-3 bg-slate-100 border border-slate-200 rounded text-[9px] font-mono">
                            <div className="font-bold mb-1 text-slate-800">{block.title}</div>
                            <p className="font-sans">{block.content}</p>
                          </div>
                        );
                      }
                      return (
                        <p key={idx} className="text-slate-800 text-[10px] leading-relaxed text-justify font-serif" style={{ fontSize: `${fontSize}pt`, lineHeight, fontFamily: getFontFamily(bodyFont) }}>
                          {block.content}
                        </p>
                      );
                    })}
                  </div>

                  <div className="text-[8px] font-mono text-slate-400 text-center pt-3 border-t border-slate-200">
                    {page.pageNumber}
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      </div>

      {/* Paywall Modal */}
      {showPaywall && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-slate-950 border border-slate-800 rounded-2xl max-w-lg w-full p-8 shadow-2xl relative overflow-hidden animate-fade-in">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-cyan-500"></div>
            <button 
              onClick={() => setShowPaywall(false)}
              className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
            
            <div className="flex flex-col items-center text-center space-y-4 pt-4">
              <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 mb-2 shadow-[0_0_30px_rgba(99,102,241,0.2)]">
                <Printer className="w-8 h-8 text-indigo-400" />
              </div>
              <h2 className="text-2xl font-black text-white font-serif tracking-tight">Unlock Professional Export</h2>
              <p className="text-sm text-slate-400 leading-relaxed max-w-sm mx-auto">
                Free tier accounts can preview prepress formatting, but generating the final CMYK Print PDF and DOCX manuscript requires an active subscription.
              </p>
              
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 w-full text-left my-4">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-widest mb-3">Upgrade unlocks:</h4>
                <ul className="space-y-2 text-sm text-slate-400">
                  <li className="flex items-start gap-2"><CheckCircle size={16} className="text-indigo-400 shrink-0 mt-0.5" /> DRM-Free CMYK Print PDF Export</li>
                  <li className="flex items-start gap-2"><CheckCircle size={16} className="text-indigo-400 shrink-0 mt-0.5" /> Vellum-Ready DOCX Source Files</li>
                  <li className="flex items-start gap-2"><CheckCircle size={16} className="text-indigo-400 shrink-0 mt-0.5" /> Automated preflight bleed checks</li>
                </ul>
              </div>

              <a 
                href="#billing" 
                onClick={(e) => {
                  e.preventDefault();
                  setShowPaywall(false);
                  const evt = new CustomEvent('navigate', { detail: 'billing' });
                  window.dispatchEvent(evt);
                }}
                className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-sm tracking-wide transition-all shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2"
              >
                View Plans & Pricing <ChevronRight size={16} />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
