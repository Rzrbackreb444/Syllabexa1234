import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Sparkles, Wand2, History, MessageSquare, CheckCircle, Edit3, 
  Sliders, AlertCircle, RefreshCw, ArrowLeftRight, Send, FileText, 
  MessageCircle, UserCheck, Check, BookOpen, Search, Printer, Eye, 
  Upload, FileUp, Grid, FileCheck, Type, X, Zap, Bot, ShieldCheck
} from 'lucide-react';
import { useToast } from '../lib/ToastContext';
import { VoiceProfile } from './SyllabexaVoiceTrainer';
import { 
  parseInlineMarkdown, 
  extractCleanDropCap, 
  renderCalloutBlock, 
  parseUploadedDocument, 
  CalloutStyleConfig 
} from '../lib/prepressParser';
import { CalloutStylingStudio } from './CalloutStylingStudio';
import {
  AutoTypesetConfig,
  PreflightReport,
  runAutoTypesettingPass
} from '../lib/autoTypesetter';
import { ManuscriptAST, FrontmatterItem } from '../types';
import { parseTextToAstBlocks, renderAstBlockComponent } from '../lib/manuscriptAst';

// --- STATIC CONSTANTS (Moved outside component for memory optimization) ---
const PRESET_PROMPTS = [
  { label: "Visceral Action Tone", prompt: "Rewrite this segment focusing heavily on raw, high-tempo, visceral sensory detail to raise pacing." },
  { label: "Expand with Anecdote", prompt: "Add an engaging, short narrative anecdote that perfectly illustrates the main idea of this section." },
  { label: "Shorten & Punch", prompt: "Condense this text by 35% using short, sharp sentences to drive high rhythm and immediate impact." },
  { label: "Format as Classic Memoir", prompt: "Format this chapter like a classic, elegant memoir using 'The Legacy' template, adding drop caps and wide, luxurious margins." },
  { label: "Format as Business Manifesto", prompt: "Set the template to 'The Blueprint' to format this like a high-end, gritty business manifesto with rigid grids and blue doctrine callouts." },
  { label: "Format as Academic Guide", prompt: "Apply 'The Academic' reference textbook layout with footnotes, strict margins, and structured guidelines." },
  { label: "Trigger KDP Print PDF", prompt: "Excellent! Let's trigger the physical print-to-PDF export pipeline and verify margins pass preflight." }
];

interface Chapter {
  id: string; title: string; content: string; orderIndex?: number;
}

interface EditingStudioProps {
  activeChapter: Chapter;
  chapters: Chapter[];
  voiceProfile: VoiceProfile | null;
  onUpdateChapter: (id: string, newContent: string) => void;
  onSelectChapter?: (id: string) => void;
}

interface Revision {
  id: string; timestamp: string; text: string; prompt: string;
  explanation: string; mode: string; depth: string;
}

interface ClientComment {
  id: string; author: string; text: string; timestamp: string; resolved: boolean;
}

export default function SyllabexaEditingStudio({ 
  activeChapter, 
  chapters, 
  voiceProfile, 
  onUpdateChapter,
  onSelectChapter
}: EditingStudioProps) {
  const { addToast } = useToast();
  
  // Table of Contents search/filter state
  const [tocSearch, setTocSearch] = useState("");

  // Working text space
  const [editorText, setEditorText] = useState(activeChapter.content);
  const [originalText, setOriginalText] = useState(activeChapter.content);
  
  // Interactive Prompt input
  const [promptInput, setPromptInput] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [latestExplanation, setLatestExplanation] = useState<string | null>(null);

  // Settings
  const [editingMode, setEditingMode] = useState<'transformative' | 'additive'>('transformative');
  const [editDepth, setEditDepth] = useState<'surface' | 'medium' | 'deep'>('medium');
  const [overrideStyle, setOverrideStyle] = useState("");

  // Tabs for view: 'split' | 'editor' | 'original' | 'print'
  const [viewTab, setViewTab] = useState<'split' | 'editor' | 'original' | 'print'>('split');

  // Agentic Publishing Matrix active states
  const [activeTemplate, setActiveTemplate] = useState<'theme-blueprint' | 'theme-legacy' | 'theme-academic' | 'none'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(`syllabexa_studio_active_template_${activeChapter.id}`);
      if (saved === 'theme-blueprint' || saved === 'theme-legacy' || saved === 'theme-academic' || saved === 'none') {
        return saved;
      }
    }
    return 'none';
  });

  const [dropCapEnabled, setDropCapEnabled] = useState<boolean>(() => {
    if (typeof window !== 'undefined') return localStorage.getItem(`syllabexa_studio_drop_cap_${activeChapter.id}`) === 'true';
    return false;
  });

  // Prepress Spreads & Preflight Guide States
  const [spreadMode, setSpreadMode] = useState<'single' | 'spread' | 'frontmatter'>('single');
  const [showPreflightOverlays, setShowPreflightOverlays] = useState<boolean>(false);
  const [trimSize, setTrimSize] = useState<'6x9' | '5.5x8.5' | '5x8' | '8.5x11'>('6x9');
  const [hyphenationEnabled, setHyphenationEnabled] = useState<boolean>(true);
  const [firstLineIndent, setFirstLineIndent] = useState<string>('0.25in');

  // InDesign Granular Typographic Inspector States
  const [baseLeading, setBaseLeading] = useState<string>('15pt');
  const [baseFontSize, setBaseFontSize] = useState<string>('11pt');
  const [letterTracking, setLetterTracking] = useState<string>('0em');
  const [paragraphSpacing, setParagraphSpacing] = useState<string>('4pt');
  const [calloutStyleConfig, setCalloutStyleConfig] = useState<CalloutStyleConfig>({
    borderColor: 'amber', borderWidth: '4px', fillOpacity: 'tint', padding: 'standard'
  });
  const [showBaselineGrid, setShowBaselineGrid] = useState<boolean>(false);
  const [showInspectorPanel, setShowInspectorPanel] = useState<boolean>(false);

  // Multi-Format Document Importer States (.docx / .md / .txt)
  const [showImportModal, setShowImportModal] = useState<boolean>(false);
  const [isImporting, setIsImporting] = useState<boolean>(false);
  const [importFeedback, setImportFeedback] = useState<string | null>(null);

  // Book Metadata States
  const [bookTitle] = useState<string>("THE LAUNDROMAT DOCTRINE");
  const [authorName] = useState<string>("Nicholas S.");
  const [gutterMargin] = useState<string>("0.875in");
  const [chapterStartRight] = useState<boolean>(true);
  const [fontStyle] = useState<string>("classic-garamond");
  const [frontmatterItems, setFrontmatterItems] = useState<FrontmatterItem[]>([
    { id: 'fm-1', type: 'half-title', title: 'Half Title', content: 'THE LAUNDROMAT DOCTRINE', includeInExport: true },
    { id: 'fm-2', type: 'title-page', title: 'Title Page', content: 'THE LAUNDROMAT DOCTRINE\nBy Nicholas S.', includeInExport: true },
    { id: 'fm-3', type: 'copyright', title: 'Copyright', content: '© 2026 Syllabexa Publishing. All rights reserved.', includeInExport: true },
    { id: 'fm-4', type: 'toc', title: 'Table of Contents', content: 'TABLE OF CONTENTS\n\nChapter 1 . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 1', includeInExport: true }
  ]);

  // Auto-Typesetting Engine States
  const [showAutoTypesetModal, setShowAutoTypesetModal] = useState<boolean>(false);
  const [isAnalyzingArtDirector, setIsAnalyzingArtDirector] = useState<boolean>(false);
  const [autoTypesetConfig, setAutoTypesetConfig] = useState<AutoTypesetConfig>({
    trimSize: '6x9', targetGenre: 'TradePaperback', strictBaseline: true, fixWidowsAndOrphans: true, forceRectoChapters: true, suppressHeadersOnStartPages: true, autoGenerateTOC: true
  });
  const [preflightReport, setPreflightReport] = useState<PreflightReport | null>(null);
  const [artDirectorRationale, setArtDirectorRationale] = useState<string | null>(null);

  // --- MEMOIZED DERIVED DATA FOR PERFORMANCE ---
  
  const manuscriptAnalytics = useMemo(() => {
    const totalWords = chapters.reduce((acc, ch) => acc + (ch.content ? ch.content.trim().split(/\s+/).filter(Boolean).length : 0), 0);
    return { chapterCount: chapters.length, totalWords };
  }, [chapters]);

  const filteredChapters = useMemo(() => {
    const sorted = [...chapters].sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0));
    if (!tocSearch) return sorted;
    const searchLow = tocSearch.toLowerCase();
    return sorted.filter(ch => ch.title.toLowerCase().includes(searchLow) || ch.content.toLowerCase().includes(searchLow));
  }, [chapters, tocSearch]);

  const parsedAstBlocks = useMemo(() => {
    if (!editorText) return [];
    return parseTextToAstBlocks(editorText);
  }, [editorText]);

  // --- EXECUTION PIPELINE HANDLERS ---

  const handleExecuteAutoTypeset = () => {
    const currentAst: ManuscriptAST = {
      projectMeta: { title: bookTitle, author: authorName, trimSize: trimSize },
      prepressRules: {
        baseFontSize, baseLeading,
        margins: { top: '0.75in', bottom: '0.75in', inside: gutterMargin, outside: '0.625in' },
        chapterStartOnRight: chapterStartRight, hyphenation: hyphenationEnabled,
        fontBody: fontStyle === 'classic-garamond' ? 'Garamond' : 'Cinzel',
        fontHeading: fontStyle === 'classic-garamond' ? 'Cinzel' : 'Inter',
        indentFirstLine: firstLineIndent, calloutRules: calloutStyleConfig
      },
      frontmatter: frontmatterItems, chapters, backmatter: []
    };

    const result = runAutoTypesettingPass(currentAst, autoTypesetConfig);

    if (result.ast.chapters && result.ast.chapters.length > 0) {
      const activeUpdated = result.ast.chapters.find(c => c.id === activeChapter.id);
      if (activeUpdated && activeUpdated.content) {
        setEditorText(activeUpdated.content);
        onUpdateChapter(activeUpdated.id, activeUpdated.content);
      }
    }
    if (result.ast.frontmatter) setFrontmatterItems(result.ast.frontmatter);
    if (result.ast.prepressRules) {
      setBaseFontSize(result.ast.prepressRules.baseFontSize);
      setBaseLeading(result.ast.prepressRules.baseLeading);
      setFirstLineIndent(result.ast.prepressRules.indentFirstLine);
      if (result.ast.prepressRules.calloutRules) setCalloutStyleConfig(result.ast.prepressRules.calloutRules);
    }
    setPreflightReport(result.report);
  };

  const handleRunGeminiArtDirector = async () => {
    setIsAnalyzingArtDirector(true);
    try {
      const response = await fetch('/api/syllabexa/art-director', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: bookTitle, author: authorName, genreHint: autoTypesetConfig.targetGenre, sampleText: activeChapter.content.slice(0, 500) })
      });
      if (response.ok) {
        const data = await response.json();
        if (data.recommendedConfig) {
          setAutoTypesetConfig(data.recommendedConfig);
          if (data.recommendedConfig.trimSize) setTrimSize(data.recommendedConfig.trimSize);
        }
        if (data.rationale) setArtDirectorRationale(data.rationale);
        if (data.recommendedCalloutTheme) setCalloutStyleConfig(prev => ({ ...prev, borderColor: data.recommendedCalloutTheme }));
      }
    } catch (err) { console.error('Art Director failed:', err); } 
    finally { setIsAnalyzingArtDirector(false); }
  };

  // Revisions List
  const [revisions, setRevisions] = useState<Revision[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(`syllabexa_studio_revs_${activeChapter.id}`);
      if (saved) { try { return JSON.parse(saved); } catch (e) {} }
    }
    return [];
  });

  // Client comments / feedback thread
  const [clientComments, setClientComments] = useState<ClientComment[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(`syllabexa_studio_comments_${activeChapter.id}`);
      if (saved) { try { return JSON.parse(saved); } catch (e) {} }
    }
    return [{ id: "c-1", author: "Agency Client (Nicholas)", text: "This rewrite is perfect. Can we expand a bit more on the emotional shock when waking up in the morning?", timestamp: new Date(Date.now() - 7200000).toISOString(), resolved: false }];
  });
  const [newCommentInput, setNewCommentInput] = useState("");

  const [approvalStatus, setApprovalStatus] = useState<'draft' | 'review' | 'changes' | 'approved'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(`syllabexa_studio_approval_${activeChapter.id}`);
      if (saved === 'draft' || saved === 'review' || saved === 'changes' || saved === 'approved') return saved;
    }
    return 'draft';
  });

  // Keep editor state synced if activeChapter changes
  useEffect(() => {
    setEditorText(activeChapter.content);
    setOriginalText(activeChapter.content);
    setLatestExplanation(null);
    setError(null);
    
    if (typeof window !== 'undefined') {
      const savedRevs = localStorage.getItem(`syllabexa_studio_revs_${activeChapter.id}`);
      if (savedRevs) { try { setRevisions(JSON.parse(savedRevs)); } catch (e) { setRevisions([]); } } else { setRevisions([]); }

      const savedComments = localStorage.getItem(`syllabexa_studio_comments_${activeChapter.id}`);
      if (savedComments) { try { setClientComments(JSON.parse(savedComments)); } catch (e) { setClientComments([]); } }

      const savedApproval = localStorage.getItem(`syllabexa_studio_approval_${activeChapter.id}`);
      if (savedApproval === 'draft' || savedApproval === 'review' || savedApproval === 'changes' || savedApproval === 'approved') setApprovalStatus(savedApproval);
      else setApprovalStatus('draft');

      const savedTemplate = localStorage.getItem(`syllabexa_studio_active_template_${activeChapter.id}`);
      if (savedTemplate === 'theme-blueprint' || savedTemplate === 'theme-legacy' || savedTemplate === 'theme-academic' || savedTemplate === 'none') setActiveTemplate(savedTemplate);
      else setActiveTemplate('none');

      setDropCapEnabled(localStorage.getItem(`syllabexa_studio_drop_cap_${activeChapter.id}`) === 'true');
    }
  }, [activeChapter.id]);

  useEffect(() => { localStorage.setItem(`syllabexa_studio_revs_${activeChapter.id}`, JSON.stringify(revisions)); }, [revisions, activeChapter.id]);
  useEffect(() => { localStorage.setItem(`syllabexa_studio_comments_${activeChapter.id}`, JSON.stringify(clientComments)); }, [clientComments, activeChapter.id]);
  useEffect(() => { localStorage.setItem(`syllabexa_studio_approval_${activeChapter.id}`, approvalStatus); }, [approvalStatus, activeChapter.id]);
  useEffect(() => { localStorage.setItem(`syllabexa_studio_active_template_${activeChapter.id}`, activeTemplate); }, [activeTemplate, activeChapter.id]);
  useEffect(() => { localStorage.setItem(`syllabexa_studio_drop_cap_${activeChapter.id}`, String(dropCapEnabled)); }, [dropCapEnabled, activeChapter.id]);

  // Formatted Prepress Typesetting Renderer (Memoized)
  const renderFormattedContent = useCallback((text: string, isLegacyDropCap: boolean) => {
    if (!text) return null;
    const paragraphs = text.split(/\n\n+/);

    return paragraphs.map((para, idx) => {
      let trimmed = para.trim();
      if (!trimmed) return null;

      const pStyle: React.CSSProperties = {
        lineHeight: baseLeading, fontSize: baseFontSize, letterSpacing: letterTracking, marginBottom: paragraphSpacing
      };

      if (/^#+\s+/.test(trimmed)) {
        const level = (trimmed.match(/^#+/)?.[0] || '#').length;
        const parsedHeader = parseInlineMarkdown(trimmed.replace(/^#+\s*/, ''));
        if (level === 1) return <h1 key={idx} id={`h1-${idx}`}>{parsedHeader}</h1>;
        if (level === 2) return <h2 key={idx} id={`h2-${idx}`}>{parsedHeader}</h2>;
        if (level === 3) return <h3 key={idx} id={`h3-${idx}`}>{parsedHeader}</h3>;
        return <h4 key={idx} id={`h4-${idx}`} className="font-bold text-slate-200 text-sm my-2">{parsedHeader}</h4>;
      }

      if (trimmed.startsWith('>')) return renderCalloutBlock(trimmed, idx, calloutStyleConfig);

      if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        return (
          <ul key={idx} id={`ul-${idx}`} className="list-disc pl-5 my-3 space-y-1">
            {trimmed.split(/\n/).map((item, i) => <li key={i}>{parseInlineMarkdown(item.replace(/^[-*]\s+/, ''))}</li>)}
          </ul>
        );
      }

      if (/^\d+\.\s+/.test(trimmed)) {
        return (
          <ol key={idx} id={`ol-${idx}`} className="list-decimal pl-5 my-3 space-y-1">
            {trimmed.split(/\n/).map((item, i) => <li key={i}>{parseInlineMarkdown(item.replace(/^\d+\.\s+/, ''))}</li>)}
          </ol>
        );
      }

      const isFirstParagraph = idx === 0 || (paragraphs[0].startsWith('#') && idx === 1);
      if (isFirstParagraph && isLegacyDropCap) {
        const { dropChar, restOfText } = extractCleanDropCap(trimmed);
        if (dropChar) {
          return (
            <p key={idx} id={`p-${idx}`} style={pStyle} className="dropcap-active">
              <span className="drop-cap-letter">{dropChar}</span>{parseInlineMarkdown(restOfText)}
            </p>
          );
        }
      }

      return <p key={idx} id={`p-${idx}`} style={pStyle}>{parseInlineMarkdown(trimmed)}</p>;
    });
  }, [baseLeading, baseFontSize, letterTracking, paragraphSpacing, calloutStyleConfig]);

  const formattedContentMemo = useMemo(() => renderFormattedContent(editorText, dropCapEnabled), [renderFormattedContent, editorText, dropCapEnabled]);

  // Insert Snippets (Safe replacement for broken updateActiveChapter call)
  const handleInsertSnippet = useCallback((snippet: string) => {
    setEditorText(prev => prev + snippet);
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    setImportFeedback("Parsing document structure and converting to clean typeset nodes...");
    try {
      const { chapters: importedChapters } = await parseUploadedDocument(file);
      if (importedChapters.length > 0) {
        setEditorText(importedChapters[0].content);
        setOriginalText(importedChapters[0].content);
        setImportFeedback(`Imported "${file.name}" into current canvas with clean typeset AST!`);
        setViewTab('print');
      }
    } catch (err: any) {
      console.error("Document import failed:", err);
      setImportFeedback(`Import failed: ${err.message || 'Invalid format'}`);
    } finally { setIsImporting(false); }
  };

  const handleApplyAPIEdit = async (customPrompt?: string) => {
    const promptToUse = customPrompt || promptInput;
    if (!promptToUse.trim()) { setError("Please specify a prompt or instruction first."); return; }
    setIsEditing(true); setError(null);

    try {
      const response = await fetch('/api/syllabexa/studio-edit', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: editorText, prompt: promptToUse, voiceProfile, mode: editingMode, toneStyle: overrideStyle || undefined, depth: editDepth })
      });

      if (!response.ok) {
        const data = await response.json(); throw new Error(data.error || "Failed to process edit instructions.");
      }
      const data = await response.json();
      
      const newRev: Revision = {
        id: `rev-${Date.now()}`, timestamp: new Date().toISOString(), text: editorText, prompt: promptToUse,
        explanation: data.explanation || "Conversational edit applied.", mode: editingMode, depth: editDepth
      };

      setRevisions([newRev, ...revisions]);
      setEditorText(data.editedText);
      setLatestExplanation(data.explanation);
      if (!customPrompt) setPromptInput("");

      if (data.executeAction) {
        const { command, payload } = data.executeAction;
        if (command === 'CHANGE_TEMPLATE') {
          if (['theme-blueprint', 'theme-legacy', 'theme-academic', 'none'].includes(payload)) {
            setActiveTemplate(payload as any); setViewTab('print');
          }
        } else if (command === 'APPLY_DROPCAP') {
          setDropCapEnabled(payload === 'true'); setViewTab('print');
        } else if (command === 'EXPORT_KDP_PDF') {
          setViewTab('print'); setTimeout(() => window.print(), 600);
        }
      } else { setViewTab('split'); }
    } catch (err: any) {
      console.error(err); setError(err.message || "An error occurred while modifying the manuscript.");
    } finally { setIsEditing(false); }
  };

  const handleRestoreRevision = (rev: Revision) => {
    const newRev: Revision = {
      id: `rev-saved-${Date.now()}`, timestamp: new Date().toISOString(), text: editorText,
      prompt: `Restored to state from ${new Date(rev.timestamp).toLocaleTimeString()}`,
      explanation: "Restored previous manual draft iteration.", mode: editingMode, depth: editDepth
    };
    setRevisions([newRev, ...revisions]);
    setEditorText(rev.text);
    setLatestExplanation(`Restored draft revision: "${rev.prompt}"`);
  };

  const handleCommitToManuscript = () => {
    onUpdateChapter(activeChapter.id, editorText);
    addToast("Studio manuscript segment synced and pushed to active chapter!", "success", 4000, "Studio Sync Complete");
  };

  const handleResetToOriginal = () => {
    if (confirm("Reset current studio editor draft to the main chapter manuscript original? This will clear session edits.")) {
      setEditorText(originalText); setLatestExplanation(null);
    }
  };

  const handleAddComment = () => {
    if (!newCommentInput.trim()) return;
    setClientComments([...clientComments, { id: `comment-${Date.now()}`, author: "Editor (Agency)", text: newCommentInput, timestamp: new Date().toISOString(), resolved: false }]);
    setNewCommentInput("");
  };

  const handleToggleResolveComment = (id: string) => {
    setClientComments(clientComments.map(c => c.id === id ? { ...c, resolved: !c.resolved } : c));
  };

  const getChapterApprovalStatus = (id: string) => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(`syllabexa_studio_approval_${id}`);
      if (['draft', 'review', 'changes', 'approved'].includes(saved || '')) return saved;
    }
    return 'draft';
  };

  return (
    <div className="p-6 max-w-[1600px] mx-auto space-y-8 animate-fade-in text-slate-200 bg-[#07080a] min-h-screen">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5 bg-[#0c0e12] px-6 py-4 rounded-2xl shadow-lg">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-xl"><Wand2 size={24} /></div>
          <div>
            <h2 className="text-xl font-bold text-slate-100">Conversational AI Editing Studio</h2>
            <p className="text-sm text-slate-400">Refine drafts, expand narrative, change tone, and run collaborative client approval workflows.</p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-[#12151c] border border-slate-800 rounded-xl p-1.5 self-start md:self-auto">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2">Active Segment:</span>
          <span className="bg-slate-900 px-3 py-1 border border-slate-800 rounded-lg text-xs font-bold text-amber-400 shadow-sm truncate max-w-[200px]">{activeChapter.title}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Table of Contents Sidebar Column (3 spans) */}
        <div className="lg:col-span-3 bg-[#0c0e12] border border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col h-full min-h-[500px]">
          <div className="space-y-4 flex-1 flex flex-col h-full">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <BookOpen size={16} className="text-amber-400" />
                <div>
                  <h3 className="text-sm font-bold text-slate-100 font-sans tracking-tight">Table of Contents</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Manuscript Nodes</p>
                </div>
              </div>
              <button onClick={() => setShowImportModal(true)} className="px-2 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-lg text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-all">
                <Upload size={11} /> Import
              </button>
            </div>

            <div className="relative">
              <input type="text" value={tocSearch} onChange={(e) => setTocSearch(e.target.value)} placeholder="Search chapters..." className="w-full bg-[#12151c] border border-slate-800 rounded-xl pl-8 pr-3 py-2 text-xs outline-none focus:ring-1 focus:ring-amber-500 font-medium text-slate-200 placeholder-slate-500" />
              <Search size={12} className="absolute left-2.5 top-3 text-slate-500" />
            </div>

            <div className="flex-1 overflow-y-auto max-h-[350px] lg:max-h-[500px] space-y-2 pr-1">
              {filteredChapters.length === 0 ? (
                <div className="text-center py-8 text-slate-500 text-xs font-medium">No matching chapters.</div>
              ) : (
                filteredChapters.map((ch, idx) => {
                  const isActive = ch.id === activeChapter.id;
                  const wordCount = ch.content ? ch.content.trim().split(/\s+/).filter(Boolean).length : 0;
                  const status = isActive ? approvalStatus : getChapterApprovalStatus(ch.id);

                  let badgeClass = "bg-slate-900 text-slate-400 border-slate-800";
                  let statusLabel = "Draft";
                  if (status === 'review') { badgeClass = "bg-amber-950/40 text-amber-300 border-amber-800/60"; statusLabel = "Awaiting"; } 
                  else if (status === 'changes') { badgeClass = "bg-red-950/40 text-red-400 border-red-900/60"; statusLabel = "Revision"; } 
                  else if (status === 'approved') { badgeClass = "bg-emerald-950/40 text-emerald-300 border-emerald-800/60"; statusLabel = "Approved"; }

                  return (
                    <button key={ch.id} onClick={() => onSelectChapter?.(ch.id)} className={`w-full text-left p-3 rounded-xl border transition-all duration-200 flex flex-col gap-1.5 cursor-pointer ${isActive ? 'border-amber-500/50 bg-amber-500/10 text-slate-100 shadow-sm' : 'border-slate-800 bg-[#12151c]/60 hover:bg-[#12151c] text-slate-300'}`}>
                      <div className="flex items-start justify-between gap-1 w-full">
                        <span className={`text-[10px] font-mono font-bold ${isActive ? 'text-amber-400' : 'text-slate-500'}`}>CH {(idx + 1).toString().padStart(2, '0')}</span>
                        <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded border ${badgeClass}`}>{statusLabel}</span>
                      </div>
                      <h4 className={`text-xs font-bold truncate w-full ${isActive ? 'text-slate-100 font-extrabold' : 'text-slate-300'}`}>{ch.title}</h4>
                      <div className="flex items-center justify-between text-[9px] text-slate-500 font-mono">
                        <span>{wordCount.toLocaleString()} words</span>
                        {isActive && <span className="text-amber-400 font-bold">Editing</span>}
                      </div>
                    </button>
                  );
                })
              )}
            </div>

            <div className="bg-[#12151c] border border-slate-800 p-3 rounded-xl space-y-2 mt-auto shrink-0">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block font-sans">Manuscript Analytics</span>
              <div className="grid grid-cols-2 gap-2 text-xs font-mono font-semibold text-slate-300">
                <div className="bg-[#0c0e12] p-2 rounded border border-slate-800">
                  <span className="text-[8px] text-slate-500 block font-sans uppercase">Chapters</span>
                  <span className="text-slate-200 text-sm font-bold">{manuscriptAnalytics.chapterCount}</span>
                </div>
                <div className="bg-[#0c0e12] p-2 rounded border border-slate-800">
                  <span className="text-[8px] text-slate-500 block font-sans uppercase">Total Words</span>
                  <span className="text-slate-200 text-sm font-bold">{manuscriptAnalytics.totalWords.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Left column: AI Dialogue Instructions & Configurations (4 spans) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-[#0c0e12] border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5"><Sparkles size={14} className="text-amber-400" /> Refine with Dialogue</span>
              {voiceProfile ? <span className="text-[10px] bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded border border-amber-500/30 font-bold">Voice Profile Enabled</span> : <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded border border-slate-700 font-bold">Standard Voice</span>}
            </div>

            <div className="bg-[#12151c] p-3 rounded-xl border border-slate-800 grid grid-cols-2 gap-3 text-xs font-medium text-slate-300">
              <div>
                <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Refinement Type</label>
                <select value={editingMode} onChange={(e) => setEditingMode(e.target.value as any)} className="w-full bg-[#0c0e12] border border-slate-800 rounded-lg p-1.5 outline-none font-bold text-slate-200 shadow-sm cursor-pointer">
                  <option value="transformative">Transformative (Rewrite)</option>
                  <option value="additive">Additive (Generate New)</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Level of Depth</label>
                <select value={editDepth} onChange={(e) => setEditDepth(e.target.value as any)} className="w-full bg-[#0c0e12] border border-slate-800 rounded-lg p-1.5 outline-none font-bold text-slate-200 shadow-sm cursor-pointer">
                  <option value="surface">Surface Trim</option>
                  <option value="medium">Medium Analysis</option>
                  <option value="deep">Deep Development</option>
                </select>
              </div>
              <div className="col-span-2">
                <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Override Specific Tone Preset</label>
                <input type="text" value={overrideStyle} onChange={(e) => setOverrideStyle(e.target.value)} placeholder="e.g. Gritty, professional, clinical (optional)" className="w-full bg-[#0c0e12] border border-slate-800 rounded-lg p-1.5 outline-none text-xs shadow-sm font-medium text-slate-200 placeholder-slate-600" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Linguistic Directives / Prompt</label>
              <div className="relative">
                <textarea value={promptInput} onChange={(e) => setPromptInput(e.target.value)} placeholder="Ask the AI to edit... (e.g. 'Shorten the dialogue in paragraph 2...')" className="w-full h-24 p-3 pr-10 border border-slate-800 bg-[#12151c] text-slate-200 placeholder-slate-600 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none text-xs font-medium resize-none shadow-sm leading-relaxed" />
                <button onClick={() => handleApplyAPIEdit()} disabled={isEditing || !promptInput.trim()} className="absolute right-2.5 bottom-2.5 p-1.5 bg-amber-500 text-slate-950 hover:bg-amber-400 disabled:opacity-50 transition-colors rounded-lg cursor-pointer shadow">
                  {isEditing ? <RefreshCw size={14} className="animate-spin" /> : <Send size={14} />}
                </button>
              </div>
            </div>

            {error && <div className="p-3 bg-red-950/40 text-red-300 text-xs rounded-xl border border-red-900/60 flex items-start gap-2 animate-fade-in"><AlertCircle size={14} className="shrink-0 mt-0.5" /><span>{error}</span></div>}

            <div className="space-y-2 pt-2 border-t border-slate-800">
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Additive / Transformative Presets</span>
              <div className="flex flex-wrap gap-1.5">
                {PRESET_PROMPTS.map((p, i) => (
                  <button key={i} onClick={() => handleApplyAPIEdit(p.prompt)} disabled={isEditing} className="px-2.5 py-1.5 bg-[#12151c] hover:bg-amber-500/10 text-slate-300 hover:text-amber-300 border border-slate-800 hover:border-amber-500/30 rounded-lg text-[10px] font-bold cursor-pointer transition-all flex items-center gap-1 shadow-sm">
                    <Wand2 size={10} className="text-amber-400" />{p.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {latestExplanation && (
            <div className="bg-[#0c0e12] border border-amber-500/30 text-amber-200 p-4 rounded-2xl space-y-2 shadow-lg animate-fade-in">
              <div className="flex items-center gap-1.5"><Sparkles size={13} className="text-amber-400" /><span className="text-[10px] font-bold uppercase tracking-wider text-amber-300">AI Editorial Alignment Log</span></div>
              <p className="text-xs font-medium leading-relaxed italic">{latestExplanation}</p>
            </div>
          )}

          <div className="bg-[#0c0e12] border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5"><History size={14} className="text-amber-400" /> Revisions Log ({revisions.length})</span>
            {revisions.length === 0 ? (
              <div className="text-center py-6 text-slate-500 text-xs">No edits run in this session. Revisions appear here live for instant comparison and restore.</div>
            ) : (
              <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
                {revisions.map((rev) => (
                  <div key={rev.id} className="p-3 bg-[#12151c] border border-slate-800 rounded-xl space-y-2 hover:border-slate-700 transition-colors">
                    <div className="flex justify-between items-start gap-2">
                      <div className="min-w-0">
                        <span className="text-[9px] text-slate-500 block font-mono">{new Date(rev.timestamp).toLocaleTimeString()}</span>
                        <p className="text-xs font-bold text-slate-200 truncate">"{rev.prompt}"</p>
                      </div>
                      <button onClick={() => handleRestoreRevision(rev)} className="px-2 py-1 bg-slate-800 hover:bg-amber-500 hover:text-slate-950 rounded text-[10px] font-bold cursor-pointer transition-colors">Restore</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Middle column: Interactive Side-by-Side Diff, Revisions & Workspace (5 spans) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-[#0c0e12] rounded-2xl border border-slate-800 shadow-sm overflow-hidden flex flex-col h-full min-h-[500px]">
            <div className="p-4 bg-[#08090c] border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
              <div className="flex p-0.5 bg-[#12151c] rounded-lg border border-slate-800">
                <button onClick={() => setViewTab('editor')} className={`px-3 py-1.5 rounded-md text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all ${viewTab === 'editor' ? 'bg-amber-500 text-slate-950 font-black shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}><Edit3 size={13} className="text-amber-400" />The Writer</button>
                <button onClick={() => setViewTab('print')} className={`px-3 py-1.5 rounded-md text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all ${viewTab === 'print' ? 'bg-amber-500 text-slate-950 font-black shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}><BookOpen size={13} className="text-amber-400 animate-pulse" />The Typesetter</button>
                <button onClick={() => setViewTab('split')} className={`px-3 py-1.5 rounded-md text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all ${viewTab === 'split' ? 'bg-amber-500 text-slate-950 font-black shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}><ArrowLeftRight size={12} />Side-by-Side Diff</button>
              </div>
              <div className="flex gap-2">
                <button onClick={handleResetToOriginal} className="px-2.5 py-1.5 border border-slate-800 rounded-lg text-xs font-bold text-slate-400 hover:text-slate-200 hover:bg-slate-800 cursor-pointer">Reset Studio</button>
                <button onClick={handleCommitToManuscript} className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg text-xs font-black uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow"><CheckCircle size={13} />Commit & Save</button>
              </div>
            </div>

            <div className="p-5 flex-1 flex flex-col min-h-[400px] relative bg-[#07080a]">
              {isEditing && (
                <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-[2px] z-10 flex items-center justify-center animate-fade-in">
                  <div className="bg-[#0c0e12] text-slate-200 px-5 py-3.5 rounded-xl flex items-center gap-3 font-semibold border border-slate-800 shadow-2xl">
                    <RefreshCw size={16} className="animate-spin text-amber-400" />
                    <span className="text-xs font-mono">Refining Manuscript Prose...</span>
                  </div>
                </div>
              )}

              {viewTab === 'split' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full flex-1">
                  <div className="flex flex-col space-y-2 h-full">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Original Content</span>
                    <div className="flex-1 border border-slate-800 rounded-xl p-4 bg-[#0c0e12] text-xs font-mono leading-relaxed overflow-y-auto max-h-[400px] whitespace-pre-wrap select-none text-slate-500">{originalText || "No original text found."}</div>
                  </div>
                  <div className="flex flex-col space-y-2 h-full">
                    <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest flex items-center gap-1.5">Studio Refined Draft<span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping"></span></span>
                    <textarea value={editorText} onChange={(e) => setEditorText(e.target.value)} className="flex-1 border border-slate-800 bg-[#0c0e12] text-slate-200 focus:ring-1 focus:ring-amber-500 outline-none rounded-xl p-4 text-xs font-mono leading-relaxed overflow-y-auto min-h-[300px] md:min-h-[400px]" />
                  </div>
                </div>
              )}

              {viewTab === 'editor' && (
                <div className="flex flex-col space-y-2 h-full flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 bg-[#10131d] border border-slate-800 rounded-2xl shadow-md font-mono text-[10px]">
                    <span className="text-slate-400 font-bold uppercase tracking-wider">Insert Formatting:</span>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <button onClick={() => handleInsertSnippet('\n\n<div align="center">❦</div>\n\n')} className="px-2.5 py-1 bg-slate-900 text-amber-300 border border-amber-500/30 rounded-xl font-bold hover:bg-slate-800 cursor-pointer">❦ Fleuron</button>
                      <button onClick={() => handleInsertSnippet('\n\n> [!NOTE]\n> **Doctrine Principle**: Key insight or operational rule.\n\n')} className="px-2.5 py-1 bg-slate-900 text-amber-300 border border-amber-500/30 rounded-xl font-bold hover:bg-slate-800 cursor-pointer">🛡️ Doctrine Box</button>
                      <button onClick={() => handleInsertSnippet('\n\n| Factor | Option A |\n|---|---|\n| Cost | $10k |\n\n')} className="px-2.5 py-1 bg-slate-900 text-amber-300 border border-amber-500/30 rounded-xl font-bold hover:bg-slate-800 cursor-pointer">📊 Matrix Table</button>
                    </div>
                  </div>
                  <textarea value={editorText} onChange={(e) => setEditorText(e.target.value)} className="w-full flex-1 min-h-[400px] border border-slate-800 rounded-xl p-5 text-sm font-serif leading-relaxed outline-none focus:ring-2 focus:ring-amber-500 bg-[#0c0e12] text-slate-200 mt-2" placeholder="Refine and structure your text segment here..." />
                  
                  {/* LIVE AST WYSIWYG PREVIEW PANEL */}
                  <div className="bg-[#0c0e12] border border-slate-800 rounded-2xl p-5 shadow-lg space-y-3 mt-10">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <span className="text-xs font-mono uppercase font-bold text-amber-400 flex items-center gap-2"><Sparkles size={14} /> Live AST WYSIWYG Preview</span>
                      <span className="text-[10px] font-mono text-slate-500">{parsedAstBlocks.length} AST Nodes</span>
                    </div>
                    <div className="space-y-3 pt-1 max-h-[320px] overflow-y-auto pr-1 scrollbar-thin">
                      {editorText ? (
                        parsedAstBlocks.map((block, bIdx) => (
                          <div key={block.id || bIdx} className="bg-slate-900/60 p-3 rounded-xl border border-slate-800/80">
                            {renderAstBlockComponent(block, bIdx, { isLightBg: false, isJustified: false })}
                          </div>
                        ))
                      ) : (
                        <p className="text-slate-500 text-xs italic font-serif">Live preview will render dynamically as you write...</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {viewTab === 'original' && (
                <div className="space-y-2 h-full flex-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Original Read-Only Chapter Draft</span>
                  <div className="w-full min-h-[400px] border border-slate-800 rounded-xl p-5 text-sm font-serif leading-relaxed bg-[#0c0e12] overflow-y-auto whitespace-pre-wrap text-slate-400">{originalText}</div>
                </div>
              )}

              {viewTab === 'print' && (
                <div className="flex-1 flex flex-col space-y-4 h-full animate-fade-in relative">
                  <div className="bg-[#0c0e12] border border-slate-800 p-4 rounded-xl space-y-3 shrink-0">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5"><Sparkles size={13} className="text-amber-400" /> Prepress Publishing Matrix</h4>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <button onClick={() => setShowAutoTypesetModal(true)} className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg text-[10px] font-extrabold flex items-center gap-1.5 shadow-md shadow-amber-500/20 cursor-pointer"><Zap size={13} className="text-slate-950 fill-slate-950 animate-pulse" /> Auto-Typeset</button>
                        <button onClick={() => setShowInspectorPanel(!showInspectorPanel)} className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold flex items-center gap-1 cursor-pointer ${showInspectorPanel ? 'bg-amber-500 text-slate-950 shadow-sm font-black' : 'bg-[#12151c] border border-slate-800 text-slate-300'}`}><Sliders size={12} /> Inspector</button>
                      </div>
                    </div>
                    <div className="flex bg-[#12151c] p-1 rounded-lg border border-slate-800 gap-1 text-[10px] font-bold w-fit mt-2">
                      <button onClick={() => setSpreadMode('single')} className={`px-2.5 py-1 rounded cursor-pointer ${spreadMode === 'single' ? 'bg-amber-500 text-slate-950 font-black' : 'text-slate-400 hover:text-slate-200'}`}>Single Page</button>
                      <button onClick={() => setSpreadMode('spread')} className={`px-2.5 py-1 rounded cursor-pointer ${spreadMode === 'spread' ? 'bg-amber-500 text-slate-950 font-black' : 'text-slate-400 hover:text-slate-200'}`}>2-Page Spread</button>
                      <button onClick={() => setSpreadMode('frontmatter')} className={`px-2.5 py-1 rounded cursor-pointer ${spreadMode === 'frontmatter' ? 'bg-amber-500 text-slate-950 font-black' : 'text-slate-400 hover:text-slate-200'}`}>Frontmatter</button>
                    </div>
                  </div>

                  <div className="flex-1 bg-[#050608] border border-slate-800 rounded-xl p-6 overflow-y-auto flex justify-center relative min-h-[480px]">
                    {spreadMode === 'single' && (
                      <div className={`w-full max-w-[5.5in] min-h-[7.5in] bg-[#0f1117] border border-slate-800 shadow-2xl rounded p-12 relative flex flex-col gap-4 text-slate-200 transition-all duration-300 ${activeTemplate}`}>
                        <div className="border-b border-slate-800 pb-2 flex justify-between items-center text-[9px] uppercase tracking-widest text-slate-500 font-sans font-bold select-none shrink-0">
                          <span>Syllabexa Prepress Engine</span><span className="italic">{activeChapter.title}</span>
                        </div>
                        <div className={`flex-1 overflow-visible select-text text-justify leading-relaxed text-sm ${hyphenationEnabled ? 'prepress-body-justified' : ''} prepress-indented-body text-slate-300`}>
                          {formattedContentMemo}
                        </div>
                        <div className="pt-4 mt-auto text-center text-xs font-mono text-slate-500 select-none shrink-0 border-t border-slate-800">Page 15 (Recto)</div>
                      </div>
                    )}
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>

      {/* MULTI-FORMAT DOCUMENT INGESTION MODAL (.docx / .md / .txt) */}
      {showImportModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-[#0c0e12] border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5 relative">
            <button onClick={() => { setShowImportModal(false); setImportFeedback(null); }} className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 p-1 rounded-lg cursor-pointer"><X size={18} /></button>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-xl"><FileUp size={24} /></div>
              <div>
                <h3 className="text-base font-bold text-slate-100">Import Manuscript Draft</h3>
                <p className="text-xs text-slate-400">Ingest .docx, .md, or .txt files directly into clean typeset AST nodes.</p>
              </div>
            </div>
            <div className="border-2 border-dashed border-slate-800 bg-[#12151c] rounded-xl p-6 text-center space-y-3 hover:border-amber-500/50 transition-all relative">
              <input type="file" accept=".docx,.md,.txt,.markdown" onChange={handleFileUpload} disabled={isImporting} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
              <div className="p-3 bg-[#0c0e12] text-amber-400 rounded-full w-12 h-12 mx-auto flex items-center justify-center shadow-sm border border-slate-800"><Upload size={20} /></div>
              <div><p className="text-xs font-bold text-slate-200">Drop manuscript file here or click to browse</p><p className="text-[10px] text-slate-500 mt-1 font-mono">Supports Word (.docx), Markdown (.md), or Plain Text (.txt)</p></div>
            </div>
            {importFeedback && (
              <div className="p-3 bg-amber-950/30 border border-amber-900/40 rounded-xl text-xs font-medium text-amber-200 flex items-center gap-2">
                {isImporting ? <RefreshCw size={14} className="animate-spin text-amber-400 shrink-0" /> : <FileCheck size={14} className="text-emerald-400 shrink-0" />}
                <span>{importFeedback}</span>
              </div>
            )}
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button onClick={() => { setShowImportModal(false); setImportFeedback(null); }} className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold rounded-xl text-xs cursor-pointer transition-all border border-slate-800">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Auto-Typesetting Engine Studio Modal */}
      {showAutoTypesetModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
          <div className="bg-[#0c0e12] rounded-2xl max-w-3xl w-full p-6 shadow-2xl border border-slate-800 space-y-5 my-8">
            <div className="flex items-start justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-xl shadow-md"><Zap size={22} className="text-amber-400 fill-amber-400 animate-pulse" /></div>
                <div><h3 className="text-lg font-extrabold text-slate-100 flex items-center gap-2">Auto-Typesetting Engine & Preflight Matrix</h3></div>
              </div>
              <button onClick={() => setShowAutoTypesetModal(false)} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-all cursor-pointer"><X size={18} /></button>
            </div>

            {preflightReport && (
              <div className="bg-emerald-950/30 border border-emerald-900/50 p-4 rounded-xl space-y-3 animate-fade-in text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2"><ShieldCheck size={18} className="text-emerald-400" /><span className="font-extrabold text-emerald-300 uppercase tracking-wider">Preflight Audit Report</span></div>
                  <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2.5 py-0.5 rounded-full font-extrabold text-[10px]">300 DPI KDP PASSED</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center font-mono text-[11px]">
                  <div className="bg-[#12151c] p-2 rounded border border-slate-800 shadow-sm">
                    <span className="block text-[9px] text-slate-500 font-sans font-bold">BLANK VERSOS</span>
                    <span className="font-extrabold text-slate-200">{preflightReport.blankPagesInserted} Inserted</span>
                  </div>
                  <div className="bg-[#12151c] p-2 rounded border border-slate-800 shadow-sm">
                    <span className="block text-[9px] text-slate-500 font-sans font-bold">ORPHANS FIXED</span>
                    <span className="font-extrabold text-amber-400">{preflightReport.orphansFixed} Paragraphs</span>
                  </div>
                  <div className="bg-[#12151c] p-2 rounded border border-slate-800 shadow-sm">
                    <span className="block text-[9px] text-slate-500 font-sans font-bold">GRID COVERAGE</span>
                    <span className="font-extrabold text-emerald-400">{preflightReport.baselineGridCoveragePercent}%</span>
                  </div>
                  <div className="bg-[#12151c] p-2 rounded border border-slate-800 shadow-sm">
                    <span className="block text-[9px] text-slate-500 font-sans font-bold">TOC INDEXED</span>
                    <span className="font-extrabold text-amber-400">{preflightReport.tocItemsIndexed} Chapters</span>
                  </div>
                </div>
              </div>
            )}
            
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button onClick={() => setShowAutoTypesetModal(false)} className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold rounded-xl text-xs cursor-pointer transition-all border border-slate-800">Done</button>
              <button onClick={handleExecuteAutoTypeset} className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-amber-500/25 cursor-pointer transition-all">
                <Zap size={14} className="text-slate-950 fill-slate-950" /> Run Auto-Typesetting Engine
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}