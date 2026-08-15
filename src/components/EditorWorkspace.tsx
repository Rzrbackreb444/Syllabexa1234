import React, { useState, useRef, useEffect } from 'react';
import { 
  Terminal, Cpu, CheckCircle2, Download, ChevronRight, 
  Bold, Italic, Heading1, Heading2, List, Quote, Sparkles, Upload, Mic, MicOff, Volume2, VolumeX
} from 'lucide-react';
import { EpubExportService } from '../services/EpubExportService';
import SyncStatusIndicator from './SyncStatusIndicator';
import ManuscriptImportWizard from './ManuscriptImportWizard';
import { useToast } from '../lib/ToastContext';
import ChapterNavigator from './ChapterNavigator';
import CharacterProfiler from './CharacterProfiler';
import PlagiarismChecker from './PlagiarismChecker';
import VersionSnapshots from './VersionSnapshots';
import ReadabilityScore from './ReadabilityScore';
import ExportBuildMonitor from './ExportBuildMonitor';
import CodeBlockRenderer from './CodeBlockRenderer';

import { useManuscriptStore } from '../store/manuscriptStore';

export default function EditorWorkspace() {
  const workspaceMode = useManuscriptStore(state => state.workspaceMode);
  const [isImportWizardOpen, setIsImportWizardOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isReadingAloud, setIsReadingAloud] = useState(false);
  const recognitionRef = useRef<any>(null);
  const { showToast } = useToast();

  const [manuscriptText, setManuscriptText] = useState(
    "## Chapter 1: The Operator Protocol\n\nThe baseline of enterprise publishing relies on absolute fidelity. When scaling high-volume ghostwriting operations, consistency across multiple agent pipelines is non-negotiable.\n\nAll structural parameters must be compiled directly into the prepress core to ensure zero formatting degradation upon export."
  );
  
  const [activeTab, setActiveTab] = useState<'editor' | 'preview' | 'telemetry'>('editor');
  const [isCompiling, setIsCompiling] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const toggleReadAloud = () => {
    if (!('speechSynthesis' in window)) {
      showToast('Text-to-Speech Read Aloud is not supported in this browser.', 'error');
      return;
    }

    if (isReadingAloud) {
      window.speechSynthesis.cancel();
      setIsReadingAloud(false);
      showToast('Read Aloud paused.', 'info');
    } else {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(manuscriptText);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;

      utterance.onstart = () => {
        setIsReadingAloud(true);
        showToast('Reading manuscript aloud...', 'success');
      };

      utterance.onend = () => {
        setIsReadingAloud(false);
      };

      utterance.onerror = () => {
        setIsReadingAloud(false);
        showToast('Error reading manuscript aloud.', 'error');
      };

      window.speechSynthesis.speak(utterance);
    }
  };

  const toggleSpeechDictation = () => {
    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      showToast('Voice dictation paused.', 'info');
    } else {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SpeechRecognition) {
        showToast('Speech Recognition is not supported in this browser. Try Chrome or Edge.', 'error');
        return;
      }

      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onstart = () => {
          setIsListening(true);
          showToast('Microphone active. Speak your prose...', 'success');
        };

        recognition.onresult = (event: any) => {
          let transcript = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            transcript += event.results[i][0].transcript;
          }
          if (transcript.trim()) {
            setManuscriptText(prev => prev + ' ' + transcript);
          }
        };

        recognition.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error);
          setIsListening(false);
          showToast(`Speech error: ${event.error}`, 'error');
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
        recognition.start();
      } catch (err: any) {
        console.error('Speech start error:', err);
        showToast(`Could not start microphone: ${err.message}`, 'error');
        setIsListening(false);
      }
    }
  };

  const handleJumpToHeading = (headingText: string) => {
    if (!textareaRef.current) return;
    const lines = manuscriptText.split('\n');
    let charIndex = 0;
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes(headingText)) {
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(charIndex, charIndex + lines[i].length);
        textareaRef.current.scrollTop = i * 20;
        showToast(`Jumped to: ${headingText}`, 'info');
        break;
      }
      charIndex += lines[i].length + 1;
    }
  };

  // Simple Markdown parser for live prepress rendering with code block support
  const renderMarkdownPreview = (text: string) => {
    const lines = text.split('\n');
    const elements: React.ReactNode[] = [];
    let inCodeBlock = false;
    let codeLanguage = '';
    let codeBuffer: string[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line.startsWith('```')) {
        if (inCodeBlock) {
          elements.push(
            <CodeBlockRenderer key={`code-${i}`} language={codeLanguage} code={codeBuffer.join('\n')} />
          );
          codeBuffer = [];
          inCodeBlock = false;
          codeLanguage = '';
        } else {
          inCodeBlock = true;
          codeLanguage = line.replace('```', '').trim();
        }
        continue;
      }

      if (inCodeBlock) {
        codeBuffer.push(line);
        continue;
      }

      if (line.startsWith('## ')) {
        elements.push(<h2 key={i} className="text-2xl font-normal uppercase tracking-wider mb-6 border-b border-slate-200 pb-3">{line.replace('## ', '')}</h2>);
      } else if (line.startsWith('# ')) {
        elements.push(<h1 key={i} className="text-3xl font-light mb-6">{line.replace('# ', '')}</h1>);
      } else if (line.trim() === '') {
        // skip empty
      } else {
        elements.push(
          <p key={i} className="text-justify indent-6 mb-4 text-sm font-light">
            {line}
          </p>
        );
      }
    }

    if (inCodeBlock && codeBuffer.length > 0) {
      elements.push(
        <CodeBlockRenderer key="code-unclosed" language={codeLanguage} code={codeBuffer.join('\n')} />
      );
    }

    return elements;
  };

  const handleExport = async () => {
    setIsCompiling(true);
    setLogs([
      "Initializing Epigraph Matrix...",
      "Compiling CSS typographic rules...",
      "Verifying EPUB3 semantic tags...",
      "Generating output package..."
    ]);

    setTimeout(async () => {
      await EpubExportService.downloadEpub(
        { title: "The WashBizHub Laundromat Bible", author: "Nicholas Kremers" },
        [{ title: "Chapter 1: The Operator Protocol", htmlContent: "<p>" + manuscriptText.replace(/\n\n/g, "</p><p>") + "</p>" }]
      );
      setIsCompiling(false);
    }, 1500);
  };

  const insertMarkdown = (wrapper: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = manuscriptText.substring(start, end);
    const updated = manuscriptText.substring(0, start) + wrapper + selectedText + wrapper + manuscriptText.substring(end);
    setManuscriptText(updated);
  };

  return (
    <div className="h-full bg-[#030305] text-slate-300 flex flex-col font-sans overflow-hidden">
      
      {/* Top IDE Command Ribbon */}
      <div className="h-16 border-b border-slate-800 bg-[#0a0a0c] px-6 flex items-center justify-between shrink-0 z-20">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 border border-cyan-900/50 bg-[#050508] flex items-center justify-center">
            {workspaceMode === 'operator' ? <Cpu size={16} className="text-cyan-400" /> : <Bold size={16} className="text-amber-400" />}
          </div>
          <div>
            <h1 className="text-xs font-mono uppercase tracking-[0.2em] text-white">
              {workspaceMode === 'operator' ? (
                <>Syllabexa <span className="text-slate-600 mx-2">/</span> Core Typesetting Engine</>
              ) : (
                <>Syllabexa <span className="text-slate-600 mx-2">/</span> Author Studio</>
              )}
            </h1>
            <p className={`text-[10px] font-mono ${workspaceMode === 'operator' ? 'text-cyan-500' : 'text-amber-500'}`}>
              {workspaceMode === 'operator' ? 'SYSTEM_NOMINAL // V3.8_PRO' : 'FOCUS_MODE // ACTIVE'}
            </p>
          </div>
          <div className="hidden xl:block ml-4">
            <SyncStatusIndicator />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex bg-[#050508] border border-slate-800 p-0.5">
            <button 
              onClick={() => setActiveTab('editor')}
              className={`px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider transition-colors ${activeTab === 'editor' ? 'bg-cyan-950/60 text-cyan-400 border border-cyan-800/40' : 'text-slate-400 hover:text-white'}`}
            >
              {workspaceMode === 'operator' ? 'Raw IDE' : 'Write'}
            </button>
            <button 
              onClick={() => setActiveTab('preview')}
              className={`px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider transition-colors ${activeTab === 'preview' ? 'bg-cyan-950/60 text-cyan-400 border border-cyan-800/40' : 'text-slate-400 hover:text-white'}`}
            >
              {workspaceMode === 'operator' ? 'Live Prepress' : 'Preview'}
            </button>
            {workspaceMode === 'operator' && (
              <button 
                onClick={() => setActiveTab('telemetry')}
                className={`px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider transition-colors ${activeTab === 'telemetry' ? 'bg-cyan-950/60 text-cyan-400 border border-cyan-800/40' : 'text-slate-400 hover:text-white'}`}
              >
                4-Agent Stream
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {workspaceMode === 'author' && (
              <button 
                onClick={() => setIsImportWizardOpen(true)}
                className="px-5 py-2 border border-slate-700 bg-[#050508] hover:bg-slate-900 text-slate-300 text-[10px] font-mono uppercase tracking-widest flex items-center gap-2 transition-all shadow-md cursor-pointer"
              >
                <Upload size={14} /> Magic Import
              </button>
            )}
            <button 
              onClick={handleExport}
              disabled={isCompiling}
              className={`px-5 py-2 border text-[10px] font-mono uppercase tracking-widest flex items-center gap-2 transition-all ${
                workspaceMode === 'operator' 
                  ? 'bg-cyan-950 hover:bg-cyan-900 text-cyan-400 border-cyan-800/60 shadow-[0_0_15px_rgba(6,182,212,0.15)]'
                  : 'bg-amber-950 hover:bg-amber-900 text-amber-400 border-amber-800/60 shadow-[0_0_15px_rgba(245,158,11,0.15)]'
              }`}
            >
              <Download size={14} /> {isCompiling ? 'Compiling...' : 'Export'}
            </button>
          </div>
        </div>
      </div>

      {/* Main Split-Pane Workspace */}
      <div className="flex-1 flex overflow-hidden relative">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>

        {activeTab === 'editor' && (
          <div className={`flex-1 ${workspaceMode === 'operator' ? 'grid grid-cols-1 lg:grid-cols-2' : 'flex justify-center gap-6'} h-full z-10 p-8`}>
            {/* Left: Input Pane (or center in author mode) */}
            <div className={`${workspaceMode === 'operator' ? 'border-r border-slate-800' : 'w-full max-w-3xl shadow-2xl rounded-lg'} bg-[#050508] p-8 flex flex-col`}>
              <div className="flex items-center justify-between mb-4">
                <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">{workspaceMode === 'operator' ? 'Markdown Input Source' : 'Draft Editor'}</div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={toggleSpeechDictation} 
                    className={`p-1.5 px-2.5 rounded flex items-center gap-1.5 text-[11px] font-mono transition-all border cursor-pointer ${
                      isListening 
                        ? 'bg-red-500/20 border-red-500 text-red-400 animate-pulse' 
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                    title="Dictate Prose with Microphone"
                  >
                    {isListening ? <MicOff size={12} className="animate-bounce" /> : <Mic size={12} />}
                    <span>{isListening ? 'Listening...' : 'Dictate'}</span>
                  </button>
                  <button 
                    onClick={toggleReadAloud} 
                    className={`p-1.5 px-2.5 rounded flex items-center gap-1.5 text-[11px] font-mono transition-all border cursor-pointer ${
                      isReadingAloud 
                        ? 'bg-indigo-500/20 border-indigo-500 text-indigo-400 animate-pulse' 
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                    title="Read Aloud Manuscript with Web Speech API"
                  >
                    {isReadingAloud ? <VolumeX size={12} className="animate-bounce" /> : <Volume2 size={12} />}
                    <span>{isReadingAloud ? 'Stop Audio' : 'Read Aloud'}</span>
                  </button>
                  <button onClick={() => insertMarkdown('**')} className={`p-1.5 bg-slate-900 border border-slate-800 hover:border-${workspaceMode === 'operator' ? 'cyan' : 'amber'}-500 text-slate-400 hover:text-${workspaceMode === 'operator' ? 'cyan' : 'amber'}-400`} title="Bold"><Bold size={12} /></button>
                  <button onClick={() => insertMarkdown('*')} className={`p-1.5 bg-slate-900 border border-slate-800 hover:border-${workspaceMode === 'operator' ? 'cyan' : 'amber'}-500 text-slate-400 hover:text-${workspaceMode === 'operator' ? 'cyan' : 'amber'}-400`} title="Italic"><Italic size={12} /></button>
                  <ChapterNavigator content={manuscriptText} onJumpToHeading={handleJumpToHeading} />
                  <CharacterProfiler manuscriptText={manuscriptText} />
                  <PlagiarismChecker manuscriptText={manuscriptText} />
                  <span className={`text-[10px] font-mono ml-2 ${workspaceMode === 'operator' ? 'text-cyan-400' : 'text-amber-400'}`}>Words: {manuscriptText.split(/\s+/).filter(Boolean).length}</span>
                </div>
              </div>
              <textarea 
                ref={textareaRef}
                value={manuscriptText}
                onChange={(e) => setManuscriptText(e.target.value)}
                className={`flex-1 bg-[#08080a] border border-slate-800 p-6 text-sm ${workspaceMode === 'operator' ? 'font-mono' : 'font-serif text-base'} text-slate-200 focus:outline-none focus:border-${workspaceMode === 'operator' ? 'cyan-800/55' : 'amber-800/55'} resize-none leading-relaxed`}
                placeholder="Enter manuscript markdown..."
              />
            </div>

            {/* Right: Live Typeset Preview (operator mode only) */}
            {workspaceMode === 'operator' && (
              <div className="bg-[#08080a] p-8 flex flex-col overflow-y-auto">
                <div className="flex items-center justify-between mb-4 text-[10px] font-mono text-slate-500 uppercase tracking-widest">
                  <span>Real-Time Prepress Simulation (CMYK Preview)</span>
                  <span className="flex items-center gap-1.5 text-emerald-400"><CheckCircle2 size={12} /> Bleed Bounds Active</span>
                </div>
                <div className="flex-1 bg-[#fdfdfd] text-[#111] p-12 shadow-2xl rounded-sm font-serif leading-relaxed overflow-y-auto border border-slate-300">
                  {renderMarkdownPreview(manuscriptText)}
                </div>
              </div>
            )}

            {/* Right: AI Publishing Partner (author mode only) */}
            {workspaceMode === 'author' && (
              <div className="w-80 bg-black/40 backdrop-blur-md rounded-lg border border-white/10 p-5 flex flex-col gap-6 overflow-y-auto">
                <div>
                  <h3 className="text-xs font-bold text-amber-400 uppercase tracking-widest flex items-center gap-2 mb-1">
                    <Sparkles className="w-4 h-4" /> AI Partner
                  </h3>
                  <p className="text-[10px] text-slate-400 font-mono">Contextual Publishing Tools</p>
                </div>
                
                <div className="space-y-3">
                  <button className="w-full text-left p-4 rounded-lg bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/20 hover:border-amber-500/50 transition-all group">
                    <div className="font-bold text-amber-200 text-xs mb-1 flex justify-between">
                      <span>Smart Line Edit</span>
                      <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                    </div>
                    <div className="text-[10px] text-slate-400 leading-relaxed">
                      Highlight a paragraph to fix dialogue, flow, or check passive voice inline.
                    </div>
                  </button>
                  
                  <button className="w-full text-left p-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all group">
                    <div className="font-bold text-slate-200 text-xs mb-1 flex justify-between">
                      <span>Generate Blurb</span>
                      <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                    </div>
                    <div className="text-[10px] text-slate-400 leading-relaxed">
                      Create Amazon KDP sales copy directly from your chapters.
                    </div>
                  </button>
                  
                  <button className="w-full text-left p-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all group">
                    <div className="font-bold text-slate-200 text-xs mb-1 flex justify-between">
                      <span>Chapter Summary</span>
                      <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                    </div>
                    <div className="text-[10px] text-slate-400 leading-relaxed">
                      Auto-generate running headers and TOC descriptions.
                    </div>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'preview' && (
          <div className="flex-1 p-12 flex items-center justify-center z-10">
            <div className="max-w-2xl w-full bg-[#fdfdfd] text-slate-900 p-16 shadow-2xl border border-slate-300 rounded-sm font-serif">
              <span className="text-[10px] font-mono text-cyan-600 uppercase tracking-widest block mb-2">EPUB3 Paginator View</span>
              <h1 className="text-3xl font-light mb-6">The WashBizHub Laundromat Bible</h1>
              <div className="text-sm leading-relaxed mb-4">{renderMarkdownPreview(manuscriptText)}</div>
            </div>
          </div>
        )}

        {activeTab === 'telemetry' && (
          <div className="flex-1 p-12 max-w-4xl mx-auto z-10 flex flex-col">
            <div className="text-[10px] font-mono text-cyan-500 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Terminal size={14} /> 4-Agent Waterfall Pipeline Diagnostics
            </div>
            <div className="flex-1 bg-[#050508] border border-slate-800 p-8 font-mono text-xs text-slate-400 space-y-3">
              {logs.length === 0 ? (
                <div className="text-slate-600">Pipeline idle. Trigger export or generation to initialize telemetry stream.</div>
              ) : (
                logs.map((log, idx) => (
                  <div key={idx} className="flex items-center gap-3 text-cyan-400">
                    <ChevronRight size={12} className="text-cyan-600" />
                    <span>{log}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

      </div>
      <ManuscriptImportWizard isOpen={isImportWizardOpen} onClose={() => setIsImportWizardOpen(false)} />
    </div>
  );
}