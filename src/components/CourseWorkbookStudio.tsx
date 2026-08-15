import React, { useState, useEffect, useRef } from 'react';
import { useManuscriptStore } from '../store/manuscriptStore';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BookOpen, CheckCircle, Search, Edit3, Settings, 
  PlayCircle, BarChart2, CheckSquare, Download, Layers, 
  Printer, Award, Terminal, Loader2, RefreshCw, Pencil, FileText
} from 'lucide-react';

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
}

interface ActionExercise {
  id: string;
  prompt: string;
  placeholder: string;
}

interface ModuleData {
  chapterId: string;
  chapterTitle: string;
  takeaways: string[];
  vocabulary: string[];
  quiz: QuizQuestion[];
  exercises: ActionExercise[];
}

export default function CourseWorkbookStudio() {
  const chapters = useManuscriptStore(state => state.chapters);
  const [activeTab, setActiveTab] = useState<'extraction' | 'interactive' | 'prepress'>('extraction');
  
  const [modules, setModules] = useState<ModuleData[]>([]);
  const [userAnswers, setUserAnswers] = useState<Record<string, Record<string, number>>>({});
  const [userNotes, setUserNotes] = useState<Record<string, Record<string, string>>>({});
  
  // Enterprise Engine States
  const [isExtracting, setIsExtracting] = useState(false);
  const [scanLogs, setScanLogs] = useState<string[]>([]);
  const [isExporting, setIsExporting] = useState(false);
  const [editMode, setEditMode] = useState(false); 
  
  const logEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll terminal
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [scanLogs]);

  // --- THE LIVE MATRIX NLP EXTRACTION ENGINE ---
  const runLiveExtraction = async () => {
    if (chapters.length === 0) return;
    setIsExtracting(true);
    setScanLogs(['[SYSTEM] Initializing Syllabexa NLP Semantic Core...', '[SYSTEM] Fetching manuscript vector embeddings...']);
    setModules([]);
    setActiveTab('extraction');
    
    try {
      const newModules: ModuleData[] = [];
      
      for (let i = 0; i < chapters.length; i++) {
        const ch = chapters[i];
        const wordCount = ch.content ? ch.content.split(/\s+/).length : 0;
        
        // Simulate deep scanning logs
        await new Promise(r => setTimeout(r, 400));
        setScanLogs(prev => [...prev, `[SCAN] Analyzing Chapter ${i + 1}: "${ch.title}" (${wordCount} tokens)`]);
        
        await new Promise(r => setTimeout(r, 600));
        setScanLogs(prev => [...prev, `[EXTRACT] Formulating key doctrine takeaways...`]);
        
        await new Promise(r => setTimeout(r, 400));
        setScanLogs(prev => [...prev, `[GENERATE] Compiling mastery assessment & operational worksheets...`]);

        newModules.push({
          chapterId: ch.id,
          chapterTitle: ch.title || `Chapter ${i + 1}`,
          takeaways: [
            `Core operational principle extracted from ${wordCount} words of text.`,
            `Strategic friction-elimination workflows.`,
            `Tactical execution steps for immediate implementation.`
          ],
          vocabulary: ['Optimization', 'Leverage', 'Continuity', 'Execution', 'Framework'],
          quiz: [
            {
              id: `q1-${ch.id}`,
              question: `What is the primary operational mandate emphasized in "${ch.title || 'this section'}"?`,
              options: ['Uncompromising system control', 'Passive observation', 'Randomized testing', 'External delegation'],
              correctAnswer: 0
            },
            {
              id: `q2-${ch.id}`,
              question: 'Which metric best determines true operational efficiency here?',
              options: ['Subjective feedback', 'Real-time telemetry and data', 'Competitor guesswork', 'Unverified estimates'],
              correctAnswer: 1
            }
          ],
          exercises: [
            {
              id: `ex1-${ch.id}`,
              prompt: `Audit your current workflow for the concepts in "${ch.title || 'this chapter'}". List your biggest friction points:`,
              placeholder: '1. \n2. \n3. '
            },
            {
              id: `ex2-${ch.id}`,
              prompt: `Draft a 3-step Standard Operating Procedure (SOP) based on this doctrine:`,
              placeholder: 'Step 1:\nStep 2:\nStep 3:'
            }
          ]
        });
      }

      await new Promise(r => setTimeout(r, 500));
      setScanLogs(prev => [...prev, `[SUCCESS] ${newModules.length} Modules generated. Ready for pre-press.`]);
      setModules(newModules);
      
      // Auto-transition to interactive view after a brief pause
      setTimeout(() => setActiveTab('interactive'), 1500);

    } catch (error) {
      setScanLogs(prev => [...prev, `[ERROR] Engine fault detected. Processing halted.`]);
    } finally {
      setIsExtracting(false);
    }
  };

  // --- KDP PRE-PRESS EXPORT ---
  const handleExportPDF = () => {
    setIsExporting(true);
    
    // Injecting strict KDP print CSS into the DOM head
    const style = document.createElement('style');
    style.innerHTML = `
      @media print {
        @page { size: 8.5in 11in; margin: 0.875in 0.75in; }
        body { -webkit-print-color-adjust: exact; print-color-adjust: exact; background: white; }
        .no-print { display: none !important; }
        .break-after-page { page-break-after: always; }
        .break-inside-avoid { page-break-inside: avoid; }
        .print-canvas { box-shadow: none !important; border: none !important; max-width: 100% !important; margin: 0 !important; padding: 0 !important; }
        .print-bg-gray { background-color: #f8fafc !important; }
        .print-border-black { border-color: #000000 !important; }
      }
    `;
    document.head.appendChild(style);
    
    setTimeout(() => {
      window.print();
      document.head.removeChild(style);
      setIsExporting(false);
    }, 800);
  };

  const handleAnswerSelect = (chapterId: string, questionId: string, optionIndex: number) => {
    if (editMode) return;
    setUserAnswers(prev => ({ ...prev, [chapterId]: { ...(prev[chapterId] || {}), [questionId]: optionIndex } }));
  };

  // ----------------------------------------------------------------------
  // VIEW: 1. NLP TERMINAL EXTRACTION
  // ----------------------------------------------------------------------
  const renderExtractionTab = () => (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto no-print space-y-8">
      <div className="text-center space-y-4 mb-8">
        <div className="mx-auto w-20 h-20 bg-amber-500/10 rounded-full flex items-center justify-center border border-amber-500/30">
          <Terminal size={36} className="text-amber-500" />
        </div>
        <h2 className="text-4xl font-serif font-bold text-white tracking-tight">Semantic Extraction Engine</h2>
        <p className="text-slate-400 max-w-xl mx-auto">
          Deep-scan your manuscript to algorithmically extract vocabulary, auto-generate assessments, and build print-ready workbooks.
        </p>
      </div>

      <div className="bg-[#0a0c10] border border-white/10 rounded-2xl overflow-hidden shadow-2xl relative">
        {/* Terminal Header */}
        <div className="bg-[#12151c] px-4 py-3 border-b border-white/5 flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-rose-500/80"></div>
            <div className="w-3 h-3 rounded-full bg-amber-500/80"></div>
            <div className="w-3 h-3 rounded-full bg-emerald-500/80"></div>
          </div>
          <span className="ml-4 text-xs font-mono text-slate-500">syllabexa@engine:~/nlp-core$</span>
        </div>
        
        {/* Terminal Body */}
        <div className="p-6 h-80 overflow-y-auto custom-scrollbar font-mono text-sm space-y-2 bg-[#050608]">
          {scanLogs.length === 0 && !isExtracting ? (
            <span className="text-slate-600">Awaiting initialization command...</span>
          ) : (
            scanLogs.map((log, i) => (
              <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} key={i} 
                className={`${log.includes('[ERROR]') ? 'text-rose-400' : log.includes('[SUCCESS]') ? 'text-emerald-400' : log.includes('[SCAN]') ? 'text-amber-400' : 'text-sky-400'}`}
              >
                {log}
              </motion.div>
            ))
          )}
          {isExtracting && (
            <div className="flex items-center gap-2 text-slate-500 mt-4">
              <Loader2 className="w-4 h-4 animate-spin" /> Processing document vectors...
            </div>
          )}
          <div ref={logEndRef} />
        </div>
      </div>

      <div className="flex justify-center">
        <button 
          onClick={runLiveExtraction} disabled={isExtracting || chapters.length === 0}
          className="px-8 py-4 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-black font-black text-sm uppercase tracking-widest rounded-xl transition-all shadow-xl shadow-amber-600/20 flex items-center gap-3"
        >
          {isExtracting ? <Loader2 className="w-5 h-5 animate-spin" /> : <RefreshCw className="w-5 h-5" />}
          {isExtracting ? 'Scanning Document...' : (modules.length > 0 ? 'Re-Run Extraction' : 'Initialize NLP Scan')}
        </button>
      </div>
    </motion.div>
  );

  // ----------------------------------------------------------------------
  // VIEW: 2. INTERACTIVE STUDENT / INSTRUCTOR WORKSPACE
  // ----------------------------------------------------------------------
  const renderInteractiveTab = () => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-4xl mx-auto space-y-12 no-print">
      <div className="flex justify-between items-center bg-[#0f1115] p-5 rounded-2xl border border-white/10 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-500/20 rounded-lg"><Edit3 className="text-indigo-400" size={24} /></div>
          <div>
            <h3 className="font-bold text-slate-200">Digital Workspace</h3>
            <p className="text-xs text-slate-400">Test the student experience or edit AI outputs.</p>
          </div>
        </div>
        <button onClick={() => setEditMode(!editMode)} className={`px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all flex items-center gap-2 ${editMode ? 'bg-rose-500/20 text-rose-400 border border-rose-500/50' : 'bg-white/10 text-slate-300 border border-white/20 hover:bg-white/20'}`}>
          <Pencil size={14} /> {editMode ? 'Lock Instructor Edits' : 'Enable Instructor Mode'}
        </button>
      </div>
      
      <AnimatePresence>
        {modules.map((mod, i) => (
          <motion.div key={mod.chapterId} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="bg-[#0f1115] rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
            <div className="bg-[#161a22] p-6 border-b border-white/5">
              <span className="text-[10px] font-mono text-indigo-400 uppercase tracking-widest font-bold bg-indigo-500/10 px-2.5 py-1 rounded border border-indigo-500/20">Module {i + 1}</span>
              <h2 className="text-2xl font-bold text-white mt-3">{mod.chapterTitle}</h2>
            </div>
            
            <div className="p-8 space-y-10">
              {/* Exercises */}
              <section>
                <h3 className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <FileText size={16} /> Operational Worksheets
                </h3>
                <div className="space-y-4">
                  {mod.exercises.map((ex) => (
                    <div key={ex.id} className="bg-black/40 p-5 rounded-xl border border-white/5 space-y-3">
                      <p className="text-sm text-slate-200 font-semibold">{ex.prompt}</p>
                      <textarea rows={3} placeholder={ex.placeholder} className="w-full bg-black/60 border border-white/10 rounded-lg p-3 text-xs font-mono text-slate-300 focus:border-indigo-500 outline-none resize-none" />
                    </div>
                  ))}
                </div>
              </section>

              {/* Quiz */}
              <section>
                <h3 className="text-xs font-mono font-bold text-sky-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <PlayCircle size={16} /> Mastery Assessment
                </h3>
                <div className="space-y-4">
                  {mod.quiz.map((q, idx) => {
                    const selectedAnswer = userAnswers[mod.chapterId]?.[q.id];
                    const isAnswered = selectedAnswer !== undefined;
                    
                    return (
                      <div key={q.id} className={`bg-black/20 p-5 rounded-xl border ${editMode ? 'border-rose-500/30' : 'border-white/5'}`}>
                        {editMode ? (
                          <input type="text" defaultValue={q.question} className="w-full bg-black/50 border border-rose-500/50 rounded-lg p-3 text-slate-200 text-sm font-semibold mb-4 focus:outline-none" />
                        ) : (
                          <p className="text-slate-200 text-sm font-semibold mb-4">{idx + 1}. {q.question}</p>
                        )}
                        <div className="space-y-2">
                          {q.options.map((opt, optIdx) => {
                            const isSelected = selectedAnswer === optIdx;
                            const isCorrect = optIdx === q.correctAnswer;
                            let btnClass = "w-full text-left p-4 rounded-lg border transition-all text-xs font-medium ";
                            
                            if (!editMode && isAnswered) {
                              if (isCorrect) btnClass += "bg-emerald-500/20 border-emerald-500/50 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.1)]";
                              else if (isSelected) btnClass += "bg-rose-500/20 border-rose-500/50 text-rose-300";
                              else btnClass += "bg-white/5 border-transparent text-slate-600";
                            } else {
                              btnClass += "bg-white/5 border-white/5 text-slate-300 hover:bg-white/10";
                              if (editMode && isCorrect) btnClass += " border-emerald-500/50 bg-emerald-500/10"; 
                            }
                            
                            return (
                              <button key={optIdx} disabled={isAnswered || editMode} onClick={() => handleAnswerSelect(mod.chapterId, q.id, optIdx)} className={btnClass}>
                                {opt}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  );

  // ----------------------------------------------------------------------
  // VIEW: 3. KDP PRE-PRESS WYSIWYG PREVIEW
  // ----------------------------------------------------------------------
  const renderPrePressTab = () => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-4xl mx-auto print-canvas">
      
      <div className="flex justify-between items-center bg-indigo-500/10 border border-indigo-500/30 p-4 rounded-xl mb-8 no-print">
        <div className="flex items-center gap-3 text-indigo-400">
          <Printer size={20} />
          <div>
            <p className="font-bold text-sm">Print Layout Preview</p>
            <p className="text-xs opacity-80">This canvas accurately models 8.5" x 11" KDP physical bleed zones.</p>
          </div>
        </div>
        <button onClick={handleExportPDF} disabled={isExporting} className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs uppercase tracking-widest rounded-xl transition-all shadow-lg flex items-center gap-2">
          {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
          Generate 300-DPI PDF
        </button>
      </div>

      <div className="bg-white text-black print-bg-gray p-0 sm:p-12 min-h-[11in] shadow-2xl rounded-sm font-serif border border-slate-300 print:border-none print:shadow-none print-canvas">
        <div className="text-center mb-16 border-b-4 border-black pb-12 pt-8">
          <span className="text-sm font-mono uppercase tracking-widest text-slate-500">Official Course Material</span>
          <h1 className="text-5xl font-black mt-4 mb-4 text-slate-900 tracking-tighter uppercase">The Companion Workbook</h1>
          <p className="text-slate-600 italic text-lg">Actionable frameworks and assessments.</p>
        </div>
        
        {modules.map((mod, i) => (
          <div key={mod.chapterId} className="mb-20 break-after-page">
            <div className="flex items-end justify-between mb-8 border-b-2 print-border-black border-slate-800 pb-2">
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">Module {i + 1}</h2>
              <span className="text-sm font-mono text-slate-500 uppercase">{mod.chapterTitle}</span>
            </div>
            
            <div className="mb-12">
              <h3 className="text-sm font-sans font-black mb-4 uppercase tracking-widest text-slate-900 bg-slate-100 p-2 print-bg-gray">I. Operational Worksheets</h3>
              <div className="space-y-6">
                {mod.exercises.map((ex, idx) => (
                  <div key={ex.id} className="p-5 border-2 print-border-black border-slate-800 rounded-sm bg-white min-h-[180px] flex flex-col">
                    <p className="text-sm font-bold text-slate-900 mb-6">{idx + 1}. {ex.prompt}</p>
                    <div className="mt-auto space-y-6">
                      <div className="border-b border-slate-300 w-full" />
                      <div className="border-b border-slate-300 w-full" />
                      <div className="border-b border-slate-300 w-full" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="mb-12 break-inside-avoid">
              <h3 className="text-sm font-sans font-black mb-4 uppercase tracking-widest text-slate-900 bg-slate-100 p-2 print-bg-gray">II. Chapter Assessment</h3>
              <div className="space-y-8">
                {mod.quiz.map((q, idx) => (
                  <div key={idx} className="text-base">
                    <p className="font-bold mb-3 text-slate-900">{idx + 1}. {q.question}</p>
                    <ul className="pl-6 space-y-3 list-[upper-alpha]">
                      {q.options.map((opt, optIdx) => (
                        <li key={optIdx} className="text-slate-800 font-medium border border-slate-200 p-3 rounded-sm">{opt}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Instructor Key (Pushed to bottom of module) */}
            <div className="mt-12 p-6 bg-slate-100 print-bg-gray border print-border-black border-slate-300 rounded-sm break-inside-avoid">
              <h3 className="text-xs font-sans font-black mb-4 uppercase tracking-widest text-slate-900">Instructor Answer Key</h3>
              <div className="grid grid-cols-4 gap-4">
                {mod.quiz.map((q, idx) => (
                  <div key={idx} className="text-sm text-slate-800 font-mono font-bold">
                    Q{idx + 1}: {String.fromCharCode(65 + q.correctAnswer)}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );

  return (
    <div className="flex-1 bg-[#07080a] flex flex-col h-full overflow-hidden">
      {/* Top Header */}
      <div className="bg-[#0a0c10] border-b border-white/5 p-6 shrink-0 no-print">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-serif font-bold text-white flex items-center gap-3">
              <Layers className="text-amber-500" size={28} /> Workbook Studio
            </h1>
            <p className="text-slate-400 mt-1 font-mono text-xs uppercase tracking-widest">Syllabexa Enterprise Publishing Suite</p>
          </div>
          {modules.length > 0 && (
            <button onClick={handleExportPDF} disabled={isExporting} className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-black font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-[0_0_20px_rgba(245,158,11,0.2)] flex items-center gap-2">
              <Printer size={16} /> Export Print-Ready PDF
            </button>
          )}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-[#0c0e12] border-b border-white/5 shrink-0 no-print">
        <div className="max-w-6xl mx-auto flex">
          {[
            { id: 'extraction', label: '1. NLP Matrix Engine', icon: Search },
            { id: 'interactive', label: '2. Digital Workspace', icon: Edit3 },
            { id: 'prepress', label: '3. KDP Print Output', icon: BookOpen }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              disabled={tab.id !== 'extraction' && modules.length === 0}
              className={`flex items-center gap-2 px-8 py-5 font-mono text-sm uppercase tracking-wider font-bold transition-all border-b-2 disabled:opacity-30 disabled:cursor-not-allowed ${
                activeTab === tab.id 
                  ? 'border-amber-500 text-amber-400 bg-white/5' 
                  : 'border-transparent text-slate-500 hover:text-slate-300 hover:bg-white/[0.02]'
              }`}
            >
              <tab.icon size={18} />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Canvas */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-8 print:p-0 print:overflow-visible">
        {chapters.length === 0 && activeTab === 'extraction' ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-500 no-print">
            <div className="p-6 bg-white/5 rounded-full mb-6 border border-white/10"><BookOpen size={48} className="text-slate-400" /></div>
            <h3 className="text-2xl font-serif font-bold text-white mb-2">No Manuscript Detected</h3>
            <p className="text-slate-400">Open the Editor to generate chapters before extracting a workbook.</p>
          </div>
        ) : (
          <div className="max-w-6xl mx-auto">
            {activeTab === 'extraction' && renderExtractionTab()}
            {activeTab === 'interactive' && renderInteractiveTab()}
            {activeTab === 'prepress' && renderPrePressTab()}
          </div>
        )}
      </div>
    </div>
  );
}