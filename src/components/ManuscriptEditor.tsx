import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEditor, EditorContent } from '@tiptap/react';
import { BubbleMenu } from '@tiptap/react/menus';
import StarterKit from '@tiptap/starter-kit';
import CharacterCount from '@tiptap/extension-character-count';
import Placeholder from '@tiptap/extension-placeholder';
import Typography from '@tiptap/extension-typography';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Bold, Italic, Heading2, Quote, 
  Sparkles, CheckCheck, Loader2, Maximize2, 
  ListTree, BrainCircuit, Settings2, Network,
  PenTool, Play, FastForward, GitCommit, SplitSquareHorizontal,
  Swords, Heart, Compass, BookOpen, AlertCircle, Mic, MicOff, Globe,
  Bookmark, BookmarkPlus, Plus, Trash2, Copy, Check, Search, Tag, Send, Edit3,
  Wand2, Zap, RotateCcw, FileText, CheckCircle2, ChevronRight, GraduationCap
} from 'lucide-react';
import { useToast } from '../lib/ToastContext';

// --- TypeScript Augmentation for Native Web Speech API ---
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

// --- Mocks & Types ---
interface OutlineNode { id: string; title: string; type: 'act' | 'chapter'; status: 'drafted' | 'pending' | 'active'; }
const MOCK_OUTLINE: OutlineNode[] = [
  { id: 'act-1', title: 'Act I: The Inciting Incident', type: 'act', status: 'pending' },
  { id: 'ch-1', title: 'Chapter 1: The Normal World', type: 'chapter', status: 'drafted' },
  { id: 'ch-2', title: 'Chapter 2: The Catalyst', type: 'chapter', status: 'active' },
  { id: 'ch-3', title: 'Chapter 3: The Debate', type: 'chapter', status: 'pending' },
];

export interface SavedPrompt {
  id: string;
  title: string;
  category: 'Tone' | 'Expansion' | 'Dialogue' | 'Structure' | 'Refinement' | 'Custom';
  prompt: string;
  isCustom?: boolean;
}

const DEFAULT_PROMPTS: SavedPrompt[] = [
  {
    id: 'p-1',
    title: 'Expand Scene with Detail',
    category: 'Expansion',
    prompt: 'Expand this paragraph with vivid sensory details, atmospheric descriptions, and slow-burn atmospheric tension.',
  },
  {
    id: 'p-2',
    title: 'Elevate to Formal Tone',
    category: 'Tone',
    prompt: 'Rewrite this selection in a formal, elevated literary voice with sophisticated vocabulary and rhythmic cadence.',
  },
  {
    id: 'p-3',
    title: 'Punchy Dialogue & Subtext',
    category: 'Dialogue',
    prompt: 'Tighten this dialogue exchange. Strip out filler speech tags, heighten dramatic tension, and weave in underlying character subtext.',
  },
  {
    id: 'p-4',
    title: 'Action & Pacing Surge',
    category: 'Structure',
    prompt: 'Accelerate the pacing of this scene. Use short, punchy sentence structures and immediate visceral physical reactions.',
  },
  {
    id: 'p-5',
    title: 'Deep Character Monologue',
    category: 'Tone',
    prompt: 'Inject internal character monologue to reveal hidden motives, psychological conflicts, and unspoken anxieties.',
  },
  {
    id: 'p-6',
    title: 'Polish & Active Verbs',
    category: 'Refinement',
    prompt: 'Eliminate passive voice constructs, replace weak verbs with dynamic action verbs, and trim unnecessary adverbs.',
  },
  {
    id: 'p-7',
    title: 'Summarize & Condense',
    category: 'Refinement',
    prompt: 'Condense the selected passage into a sharp, evocative 2-sentence summary preserving key dramatic emotional beats.',
  },
];

export default function ManuscriptEditor({ initialContent = '' }) {
  const navigate = useNavigate();
  const { addToast } = useToast();
  // UI State
  const [focusMode, setFocusMode] = useState(false);
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(true);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(true);
  const [rightTab, setRightTab] = useState<'copilot' | 'library'>('copilot');
  const [isSaving, setIsSaving] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  // Prompt Library State
  const [prompts, setPrompts] = useState<SavedPrompt[]>(() => {
    try {
      const saved = localStorage.getItem('syllabexa_prompt_library');
      return saved ? JSON.parse(saved) : DEFAULT_PROMPTS;
    } catch {
      return DEFAULT_PROMPTS;
    }
  });
  const [promptSearch, setPromptSearch] = useState('');
  const [promptCategoryFilter, setPromptCategoryFilter] = useState<string>('All');
  const [isAddingPrompt, setIsAddingPrompt] = useState(false);
  const [editingPromptId, setEditingPromptId] = useState<string | null>(null);
  const [runningPromptId, setRunningPromptId] = useState<string | null>(null);

  const [newPromptTitle, setNewPromptTitle] = useState('');
  const [newPromptCategory, setNewPromptCategory] = useState<SavedPrompt['category']>('Custom');
  const [newPromptText, setNewPromptText] = useState('');
  const [copiedPromptId, setCopiedPromptId] = useState<string | null>(null);

  // Ghostwriter Agentic State
  const [genre, setGenre] = useState<'thriller' | 'romance' | 'scifi' | 'nonfiction'>('thriller');
  const [pov, setPov] = useState('Third Person Limited');
  const [pacing, setPacing] = useState(70);
  const [sceneBeats, setSceneBeats] = useState('1. Protagonist enters the dimly lit room.\n2. Discovers the safe has been cracked.\n3. Hears footsteps approaching from the hallway.');
  
  const [agentStatus, setAgentStatus] = useState<'idle' | 'analyzing' | 'retrieving' | 'drafting'>('idle');
  const [generationProgress, setGenerationProgress] = useState(0);

  // Save prompts to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('syllabexa_prompt_library', JSON.stringify(prompts));
    } catch (e) {
      console.error('Failed to save prompt library:', e);
    }
  }, [prompts]);

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 2500);
  };

  const handleAddOrUpdatePrompt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPromptTitle.trim() || !newPromptText.trim()) return;

    if (editingPromptId) {
      // Update existing prompt
      setPrompts(prev => prev.map(p => p.id === editingPromptId ? {
        ...p,
        title: newPromptTitle.trim(),
        category: newPromptCategory,
        prompt: newPromptText.trim(),
      } : p));
      showToast(`Updated prompt: "${newPromptTitle.trim()}"`);
    } else {
      // Create new custom prompt
      const newPrompt: SavedPrompt = {
        id: `custom-${Date.now()}`,
        title: newPromptTitle.trim(),
        category: newPromptCategory,
        prompt: newPromptText.trim(),
        isCustom: true,
      };
      setPrompts(prev => [newPrompt, ...prev]);
      showToast(`Saved directive: "${newPromptTitle.trim()}"`);
    }

    setEditingPromptId(null);
    setNewPromptTitle('');
    setNewPromptText('');
    setNewPromptCategory('Custom');
    setIsAddingPrompt(false);
  };

  const handleStartEditPrompt = (p: SavedPrompt) => {
    setEditingPromptId(p.id);
    setNewPromptTitle(p.title);
    setNewPromptCategory(p.category);
    setNewPromptText(p.prompt);
    setIsAddingPrompt(true);
  };

  const handleDeletePrompt = (id: string) => {
    setPrompts(prev => prev.filter(p => p.id !== id));
    if (editingPromptId === id) {
      setEditingPromptId(null);
      setIsAddingPrompt(false);
    }
    showToast('Prompt removed from library.');
  };

  const handleResetDefaultPrompts = () => {
    if (window.confirm('Reset prompt library back to default templates?')) {
      setPrompts(DEFAULT_PROMPTS);
      localStorage.setItem('syllabexa_prompt_library', JSON.stringify(DEFAULT_PROMPTS));
      showToast('Prompt library reset to defaults.');
    }
  };

  const handleCopyPrompt = (prompt: SavedPrompt) => {
    navigator.clipboard.writeText(prompt.prompt);
    setCopiedPromptId(prompt.id);
    setTimeout(() => setCopiedPromptId(null), 2000);
    showToast('Prompt copied to clipboard!');
  };

  const handleUseInBeats = (promptText: string) => {
    setSceneBeats(prev => prev ? `${prev}\n\n[DIRECTIVE]: ${promptText}` : promptText);
    setRightTab('copilot');
    showToast('Prompt loaded into Director Agent beats!');
  };

  const handleInsertInEditor = (promptText: string) => {
    if (editor) {
      editor.commands.insertContent(`\n\n> **[AI Directive]**: ${promptText}\n\n`);
      showToast('Prompt inserted into manuscript!');
    }
  };

  // Trigger Direct AI Execution using the prompt
  const handleTriggerAIPrompt = (p: SavedPrompt) => {
    if (!editor) return;

    setRunningPromptId(p.id);
    showToast(`Executing AI Directive: "${p.title}"...`);

    // Extract selected text if available, otherwise get recent editor context
    const { from, to } = editor.state.selection;
    const selectedText = editor.state.doc.textBetween(from, to, ' ');
    const baseText = selectedText.trim() || "The room fell silent as the clock struck midnight.";

    setTimeout(() => {
      let transformedProse = '';

      if (p.category === 'Expansion') {
        transformedProse = `${baseText}\n\nEvery shadow in the room seemed to stretch and twist like living tendrils. The cold rain lashed against the frosted windowpanes, casting flickering patterns of light across the hardwood floor. A faint odor of ozone and aged parchment hung heavy in the air, hinting at secrets buried long before tonight.`;
      } else if (p.category === 'Tone') {
        transformedProse = `With deliberate composure, the narrative shifted into a high-literary cadence. ${baseText} The heavy silence that descended upon the chamber was not merely an absence of noise, but a tangible weight—an atmospheric stillness where every whispered breath carried existential gravity.`;
      } else if (p.category === 'Dialogue') {
        transformedProse = `"Is it done?" she whispered, her voice barely cutting through the dark.\n"It's finished," he replied without turning. "And there's no turning back now."\nShe stepped closer, inspecting the tension etched in his posture. "Then we move before dawn."`;
      } else if (p.category === 'Structure') {
        transformedProse = `Footsteps echoed from the stairwell. Heavy. Fast. Closing in. Elias grabbed the ledger, vaulted over the shattered glass barrier, and bolted into the storm. No hesitation. No looking back.`;
      } else if (p.category === 'Refinement') {
        transformedProse = `${baseText.replace(/was/g, 'remained').replace(/grew/g, 'became')} The prose now moves with active force and polished syntactic brevity.`;
      } else {
        transformedProse = `[AI Processed Directive: ${p.title}]\n${baseText}\n\n[Applied Parameter]: ${p.prompt}`;
      }

      if (selectedText.trim()) {
        editor.chain().focus().insertContent(transformedProse).run();
      } else {
        editor.commands.insertContent(`\n\n${transformedProse}\n\n`);
      }

      setRunningPromptId(null);
      showToast(`✨ AI Directive "${p.title}" applied to manuscript!`);
    }, 1200);
  };

  const filteredPrompts = prompts.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(promptSearch.toLowerCase()) || 
                          p.prompt.toLowerCase().includes(promptSearch.toLowerCase());
    const matchesCategory = promptCategoryFilter === 'All' || p.category === promptCategoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Calculate category counts
  const categoryCounts = {
    All: prompts.length,
    Tone: prompts.filter(p => p.category === 'Tone').length,
    Expansion: prompts.filter(p => p.category === 'Expansion').length,
    Dialogue: prompts.filter(p => p.category === 'Dialogue').length,
    Structure: prompts.filter(p => p.category === 'Structure').length,
    Refinement: prompts.filter(p => p.category === 'Refinement').length,
    Custom: prompts.filter(p => p.category === 'Custom').length,
  };

  // --- Dictation State & Refs ---
  const [isDictating, setIsDictating] = useState(false);
  const [dictationLanguage, setDictationLanguage] = useState('en-US');
  const [interimTranscript, setInterimTranscript] = useState('');
  const recognitionRef = useRef<any>(null);

  const editor = useEditor({
    extensions: [
      StarterKit, Typography,
      Placeholder.configure({ placeholder: 'Initialize the Architect Agent, or start typing manually...' }),
      CharacterCount.configure({ limit: 500000 }),
    ],
    content: initialContent,
    editorProps: { attributes: { class: 'prose prose-lg prose-slate max-w-none focus:outline-none min-h-[70vh] pb-32' } },
    onUpdate: () => { setIsSaving(true); setTimeout(() => setIsSaving(false), 1000); },
  });

  // --- Native Web Speech API Setup ---
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      
      recognition.onresult = (event: any) => {
        let currentInterim = '';
        let finalTrans = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTrans += event.results[i][0].transcript;
          } else {
            currentInterim += event.results[i][0].transcript;
          }
        }

        setInterimTranscript(currentInterim);

        if (finalTrans && editor) {
          // Append final speech segment to the editor with a trailing space
          editor.commands.insertContent(`${finalTrans} `);
        }
      };

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        if (event.error === 'not-allowed') {
          setIsDictating(false);
          addToast("Microphone access denied. Please allow microphone permissions in your browser.", "error", 8000, "Permission Denied");
        }
      };

      recognition.onend = () => {
        // Only trigger state change if the user didn't explicitly stop it, handle auto-timeouts gracefully
        setIsDictating(false);
        setInterimTranscript('');
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [editor]);

  // Update language when changed
  useEffect(() => {
    if (recognitionRef.current) {
      recognitionRef.current.lang = dictationLanguage;
    }
  }, [dictationLanguage]);

  const toggleDictation = () => {
    if (!recognitionRef.current) {
      addToast("Your browser does not support the Web Speech API. Please use Chrome, Edge, or Safari.", "warning", 8000, "Unsupported Browser");
      return;
    }

    if (isDictating) {
      recognitionRef.current.stop();
      setIsDictating(false);
      setInterimTranscript('');
    } else {
      try {
        recognitionRef.current.start();
        setIsDictating(true);
      } catch (e) {
        // Handle case where recognition is already started but state is out of sync
        console.warn("Recognition already started", e);
      }
    }
  };


  // The Multi-Agent Generation Simulation
  const executeAgenticDrafting = () => {
    if (!editor || !sceneBeats.trim()) return;
    setAgentStatus('analyzing');
    setGenerationProgress(10);
    
    setTimeout(() => {
      setAgentStatus('retrieving');
      setGenerationProgress(40);
      setTimeout(() => {
        setAgentStatus('drafting');
        setGenerationProgress(70);
        
        let i = 0;
        const response = `\n\nThe air in the room tasted of ozone and stale copper. Elias froze, his hand instinctively dropping to the plasma coil holstered at his hip. The safe—a pre-collapse Aegis model deemed uncrackable by the Spire's best engineers—hung open, its heavy tungsten door swinging lazily on stripped hinges. \n\nHe took a slow breath, the silence of the room suddenly oppressive. \n\n*Scrape.*\n\nThe sound was faint, echoing from the corridor behind him. Footsteps. Slow. Deliberate. Heavy enough to belong to a Syndicate enforcer. Elias backed into the shadows, his heart hammering a frantic, staccato rhythm against his ribs. They had found him.\n\n`;
        
        const interval = setInterval(() => {
          editor.commands.insertContent(response.charAt(i));
          i++;
          setGenerationProgress(70 + Math.floor((i / response.length) * 30));
          
          if (i >= response.length) {
            clearInterval(interval);
            setAgentStatus('idle');
            setGenerationProgress(0);
          }
        }, 10);
      }, 1500);
    }, 1500);
  };

  if (!editor) return <div className="flex h-screen items-center justify-center bg-[#050505]"><Loader2 className="w-6 h-6 animate-spin text-slate-400" /></div>;

  const genreConfig = {
    thriller: { icon: Swords, color: 'text-rose-500', bg: 'bg-rose-500/10', border: 'border-rose-500/30', label: 'Thriller / Mystery' },
    romance: { icon: Heart, color: 'text-pink-400', bg: 'bg-pink-500/10', border: 'border-pink-500/30', label: 'Romance / Drama' },
    scifi: { icon: Compass, color: 'text-indigo-400', bg: 'bg-indigo-500/10', border: 'border-indigo-500/30', label: 'Sci-Fi / Fantasy' },
    nonfiction: { icon: BookOpen, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', label: 'Non-Fiction / Biz' },
  }[genre];

  return (
    <div className={`flex h-screen bg-[#050505] text-slate-200 font-sans overflow-hidden transition-all duration-500 selection:bg-indigo-500/30 ${focusMode ? 'fixed inset-0 z-50 bg-white text-black' : ''}`}>
      
      {/* LEFT SIDEBAR: Structure & Narrative Arc */}
      <AnimatePresence>
        {!focusMode && leftSidebarOpen && (
          <motion.aside 
            initial={{ width: 0, opacity: 0 }} animate={{ width: 280, opacity: 1 }} exit={{ width: 0, opacity: 0 }}
            className="border-r border-white/5 bg-[#0a0a0a] flex flex-col shrink-0 overflow-hidden z-20"
          >
            <div className="h-14 flex items-center justify-between px-4 border-b border-white/5 bg-black/20">
              <span className="text-xs font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2"><ListTree className="w-4 h-4 text-indigo-400" /> Macro Structure</span>
              <button className="text-slate-500 hover:text-white"><Settings2 className="w-4 h-4" /></button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-3 custom-scrollbar space-y-1">
              {MOCK_OUTLINE.map(node => (
                <div key={node.id} className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${node.status === 'active' ? 'bg-indigo-500/10 border border-indigo-500/30' : 'hover:bg-white/5 border border-transparent'} ${node.type === 'chapter' ? 'ml-4' : ''}`}>
                  <span className={`truncate ${node.type === 'act' ? 'text-xs font-bold text-white uppercase tracking-wider' : 'text-sm text-slate-300'}`}>{node.title}</span>
                  {node.status === 'active' && <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />}
                  {node.status === 'drafted' && <CheckCheck className="w-3.5 h-3.5 text-emerald-500" />}
                </div>
              ))}
            </div>

            <div className="p-4 border-t border-white/5 bg-black/20 space-y-3">
              <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest flex justify-between">
                <span>Book Progress</span>
                <span className="text-indigo-400">12% Drafted</span>
              </div>
              <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-500 w-[12%]" />
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* CENTER: The Canvas */}
      <main className="flex-1 flex flex-col relative bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900/10 via-[#050505] to-[#050505] transition-all">
        
        <header className={`h-14 flex items-center justify-between px-4 border-b border-white/5 bg-black/40 backdrop-blur-md z-10 transition-transform duration-300 ${focusMode ? '-translate-y-full absolute w-full' : ''}`}>
          <div className="flex items-center gap-2">
            {!focusMode && <button onClick={() => setLeftSidebarOpen(!leftSidebarOpen)} className="p-1.5 text-slate-400 hover:text-white hover:bg-white/5 rounded"><SplitSquareHorizontal className="w-4 h-4" /></button>}
            <div className="w-px h-5 bg-white/10 mx-1" />
            <div className="flex items-center gap-1 bg-white/5 p-1 rounded-md border border-white/10">
              <button onClick={() => editor.chain().focus().toggleBold().run()} className={`p-1.5 rounded transition-all ${editor.isActive('bold') ? 'bg-indigo-500/20 text-indigo-400' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}><Bold className="w-3.5 h-3.5" /></button>
              <button onClick={() => editor.chain().focus().toggleItalic().run()} className={`p-1.5 rounded transition-all ${editor.isActive('italic') ? 'bg-indigo-500/20 text-indigo-400' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}><Italic className="w-3.5 h-3.5" /></button>
            </div>
            <div className="w-px h-5 bg-white/10 mx-1" />
            
            {/* Dictation Controls */}
            <div className="flex items-center gap-1 bg-white/5 p-1 rounded-md border border-white/10">
              <button 
                onClick={toggleDictation} 
                className={`p-1.5 rounded transition-all flex items-center gap-2 ${isDictating ? 'bg-rose-500/20 text-rose-400 animate-pulse' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                title={isDictating ? "Stop Dictation" : "Start Dictation"}
              >
                {isDictating ? <Mic className="w-3.5 h-3.5" /> : <MicOff className="w-3.5 h-3.5" />}
              </button>
              <select 
                value={dictationLanguage}
                onChange={(e) => setDictationLanguage(e.target.value)}
                className="bg-transparent text-[10px] font-mono text-slate-400 outline-none cursor-pointer pr-1"
                title="Dictation Language"
              >
                <option value="en-US">EN (US)</option>
                <option value="en-GB">EN (UK)</option>
                <option value="es-ES">ES</option>
                <option value="fr-FR">FR</option>
                <option value="de-DE">DE</option>
                <option value="ja-JP">JA</option>
              </select>
            </div>

          </div>

          <div className="flex items-center gap-3">
            <span className="text-[10px] font-mono text-slate-500 flex items-center gap-1.5 uppercase tracking-widest">
              {isSaving ? <><Loader2 className="w-3 h-3 animate-spin text-amber-500" /> VFS Sync</> : <><CheckCheck className="w-3 h-3 text-emerald-500" /> Secured</>}
            </span>
            <button onClick={() => setFocusMode(!focusMode)} className="p-1.5 text-slate-400 hover:text-white hover:bg-white/5 rounded ml-2" title="Focus Mode"><Maximize2 className="w-4 h-4" /></button>
            {!focusMode && (
              <>
                <button 
                  onClick={() => {
                    if (!rightSidebarOpen) setRightSidebarOpen(true);
                    setRightTab(rightTab === 'library' ? 'copilot' : 'library');
                  }} 
                  className={`p-1.5 rounded transition-all flex items-center gap-1.5 text-xs font-mono font-semibold ${rightSidebarOpen && rightTab === 'library' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                  title="Prompt Library"
                >
                  <Bookmark className="w-4 h-4 text-amber-400" />
                  <span className="hidden sm:inline">Library</span>
                </button>
                <button 
                  onClick={() => {
                    if (!rightSidebarOpen) setRightSidebarOpen(true);
                    setRightTab('copilot');
                  }} 
                  className={`p-1.5 rounded transition-colors ${rightSidebarOpen && rightTab === 'copilot' ? 'bg-indigo-500/20 text-indigo-400' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                  title="Agentic Co-Pilot"
                >
                  <BrainCircuit className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </header>

        {/* Toast Notification Banner */}
        <AnimatePresence>
          {notification && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="fixed bottom-6 right-6 z-50 px-4 py-2.5 bg-amber-500 text-slate-950 font-mono text-xs font-bold rounded-xl shadow-2xl flex items-center gap-2 border border-amber-400"
            >
              <Bookmark className="w-4 h-4" /> {notification}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Interim Dictation Feedback Banner */}
        <AnimatePresence>
          {isDictating && interimTranscript && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-16 left-1/2 -translate-x-1/2 z-20 px-6 py-3 bg-[#0a0a0a]/90 backdrop-blur-md border border-rose-500/30 rounded-xl shadow-2xl max-w-2xl w-11/12 pointer-events-none"
            >
              <div className="flex items-start gap-3">
                <Mic className="w-4 h-4 text-rose-400 shrink-0 mt-0.5 animate-pulse" />
                <p className="text-sm font-serif text-slate-300 italic">"{interimTranscript}..."</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className={`flex-1 overflow-y-auto custom-scrollbar relative flex justify-center ${focusMode ? 'pt-24 pb-32 px-12 bg-white' : 'pt-12 pb-24 px-8'}`}>
          <div className="w-full max-w-3xl relative">
            <EditorContent editor={editor} className={focusMode ? 'text-slate-900' : 'text-slate-300'} />
            
            {editor && (
              <BubbleMenu editor={editor} className="flex items-center gap-1 bg-[#12141a] p-1 rounded-xl shadow-2xl border border-white/10 animate-in fade-in zoom-in-95">
                <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white hover:bg-white/5 rounded-lg transition-colors"><Sparkles className="w-3.5 h-3.5 text-amber-400" /> Expand Scene</button>
                <div className="w-px h-4 bg-white/10 mx-1" />
                <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white hover:bg-white/5 rounded-lg transition-colors">Shift POV</button>
              </BubbleMenu>
            )}
          </div>
        </div>

        {focusMode && (
          <button onClick={() => setFocusMode(false)} className="fixed top-6 right-6 z-[60] px-4 py-2 bg-black/5 hover:bg-black/10 text-slate-500 text-xs font-bold rounded-full transition-colors flex items-center gap-2">
            <Maximize2 className="w-3 h-3" /> Exit Canvas
          </button>
        )}
      </main>

      {/* RIGHT SIDEBAR: Agentic Co-Pilot & Prompt Library */}
      <AnimatePresence>
        {!focusMode && rightSidebarOpen && (
          <motion.aside 
            initial={{ width: 0, opacity: 0 }} animate={{ width: 340, opacity: 1 }} exit={{ width: 0, opacity: 0 }}
            className="border-l border-white/5 bg-[#0a0a0a] flex flex-col shrink-0 overflow-hidden z-20 shadow-2xl"
          >
            {/* Sidebar Tab Header */}
            <div className="h-14 flex items-center px-3 border-b border-white/5 bg-black/40 gap-2 shrink-0">
              <div className="flex bg-white/5 p-1 rounded-xl border border-white/10 w-full">
                <button 
                  onClick={() => setRightTab('copilot')} 
                  className={`flex-1 py-1.5 text-[10px] font-mono font-bold uppercase tracking-wider rounded-lg transition-all flex items-center justify-center gap-1.5 ${rightTab === 'copilot' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Co-Pilot
                </button>
                <button 
                  onClick={() => setRightTab('library')} 
                  className={`flex-1 py-1.5 text-[10px] font-mono font-bold uppercase tracking-wider rounded-lg transition-all flex items-center justify-center gap-1.5 ${rightTab === 'library' ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold' : 'text-slate-400 hover:text-white'}`}
                >
                  <Bookmark className="w-3.5 h-3.5" /> Library ({prompts.length})
                </button>
              </div>
            </div>

            {/* TAB 1: CO-PILOT MATRIX */}
            {rightTab === 'copilot' && (
              <div className="flex-1 overflow-y-auto p-5 space-y-6 custom-scrollbar">
                
                {/* Genre & Tone Matrix */}
                <div className="space-y-3">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Narrative Matrix</label>
                  <div className="grid grid-cols-2 gap-2">
                    <select value={genre} onChange={(e: any) => setGenre(e.target.value)} className={`bg-black border ${genreConfig?.border} ${genreConfig?.color} rounded-xl px-3 py-2 text-xs font-bold focus:outline-none cursor-pointer appearance-none`}>
                      <option value="thriller">Thriller / Mystery</option>
                      <option value="romance">Romance / Drama</option>
                      <option value="scifi">Sci-Fi / Fantasy</option>
                      <option value="nonfiction">Non-Fiction / Biz</option>
                    </select>
                    <select value={pov} onChange={(e) => setPov(e.target.value)} className="bg-black border border-white/10 text-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none cursor-pointer appearance-none">
                      <option>1st Person</option>
                      <option>3rd Person Limited</option>
                      <option>3rd Person Omniscient</option>
                    </select>
                  </div>
                  
                  {/* Pacing Slider */}
                  <div className="pt-2">
                    <div className="flex justify-between text-[10px] font-mono text-slate-400 mb-2 uppercase">
                      <span>Descriptive</span>
                      <span className="text-indigo-400">Pacing</span>
                      <span>Action-Heavy</span>
                    </div>
                    <input type="range" min="0" max="100" value={pacing} onChange={(e) => setPacing(Number(e.target.value))} className="w-full accent-indigo-500 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer" />
                  </div>
                </div>

                <hr className="border-white/5" />

                {/* RAG Memory Injection */}
                <div className="space-y-3">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center justify-between">
                    <span className="flex items-center gap-1.5"><Network className="w-3.5 h-3.5" /> Lore Context Loaded</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-2.5 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded text-[10px] text-indigo-300 flex items-center gap-1.5"><PenTool className="w-3 h-3" /> [Char] Elias Thorne</span>
                    <span className="px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded text-[10px] text-emerald-300 flex items-center gap-1.5"><PenTool className="w-3 h-3" /> [Setting] The Spire</span>
                  </div>
                </div>

                <hr className="border-white/5" />

                {/* Scene Director (Beat-by-Beat) */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                      <GitCommit className="w-3.5 h-3.5" /> Scene Beats (Director Agent)
                    </label>
                    <button 
                      onClick={() => setRightTab('library')}
                      className="text-[10px] font-mono text-amber-400 hover:underline flex items-center gap-1"
                    >
                      <Bookmark className="w-3 h-3" /> From Library
                    </button>
                  </div>
                  <textarea 
                    value={sceneBeats}
                    onChange={(e) => setSceneBeats(e.target.value)}
                    placeholder="1. Start with action...\n2. Add dialogue..."
                    className="w-full h-32 bg-black border border-white/10 rounded-xl p-3 text-sm text-slate-200 focus:border-indigo-500/50 outline-none resize-none custom-scrollbar leading-relaxed font-mono text-xs"
                  />
                </div>

                {/* Agentic Execution Console */}
                <div className="bg-[#12141a] border border-white/10 rounded-xl p-1 overflow-hidden">
                  <div className="p-3 bg-black/40 rounded-t-lg border-b border-white/5 min-h-[4rem] flex flex-col justify-center">
                    {agentStatus === 'idle' && <span className="text-xs text-slate-500 font-mono flex items-center gap-2"><AlertCircle className="w-3 h-3" /> Awaiting Directive...</span>}
                    {agentStatus === 'analyzing' && <span className="text-xs text-amber-400 font-mono animate-pulse flex items-center gap-2"><BrainCircuit className="w-3 h-3" /> Architect Agent mapping pacing...</span>}
                    {agentStatus === 'retrieving' && <span className="text-xs text-emerald-400 font-mono animate-pulse flex items-center gap-2"><Network className="w-3 h-3" /> Continuity Engine verifying lore...</span>}
                    {agentStatus === 'drafting' && <span className="text-xs text-indigo-400 font-mono animate-pulse flex items-center gap-2"><PenTool className="w-3 h-3" /> Prose Stylist drafting scene...</span>}
                    
                    {agentStatus !== 'idle' && (
                      <div className="h-1 w-full bg-white/10 rounded-full mt-3 overflow-hidden">
                        <div className="h-full bg-indigo-500 transition-all duration-300" style={{ width: `${generationProgress}%` }} />
                      </div>
                    )}
                  </div>
                  
                  <button 
                    onClick={executeAgenticDrafting}
                    disabled={agentStatus !== 'idle' || !sceneBeats.trim()}
                    className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 text-white text-xs font-bold uppercase tracking-widest rounded-b-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {agentStatus !== 'idle' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                    {agentStatus !== 'idle' ? 'Agents Active' : 'Execute Generation'}
                  </button>
                </div>

                <hr className="border-white/5" />

                {/* Educational Extension Pipeline */}
                <div 
                  onClick={() => navigate('/app/courses')}
                  className="bg-emerald-950/20 border border-emerald-500/30 hover:border-emerald-400 p-3.5 rounded-xl transition-all cursor-pointer group flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-400 group-hover:scale-110 transition-transform">
                      <GraduationCap className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-[11px] font-bold text-slate-200 group-hover:text-emerald-300">Convert to Workbook</div>
                      <div className="text-[9px] font-mono text-slate-400">Extract chapter into course lesson & quiz</div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-emerald-400 group-hover:translate-x-1 transition-transform" />
                </div>

              </div>
            )}

            {/* TAB 2: PROMPT LIBRARY */}
            {rightTab === 'library' && (
              <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                {/* Header & Actions */}
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-widest text-amber-400 flex items-center gap-1.5">
                      <Bookmark className="w-4 h-4" /> Prompt Library
                    </h4>
                    <p className="text-[10px] font-mono text-slate-500">Save, edit & trigger AI writing prompts</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button 
                      onClick={() => {
                        if (isAddingPrompt) {
                          setIsAddingPrompt(false);
                          setEditingPromptId(null);
                        } else {
                          setEditingPromptId(null);
                          setNewPromptTitle('');
                          setNewPromptText('');
                          setNewPromptCategory('Custom');
                          setIsAddingPrompt(true);
                        }
                      }} 
                      className="px-2.5 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-lg text-xs font-mono font-bold flex items-center gap-1 transition-all cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" /> {isAddingPrompt ? 'Close' : 'New'}
                    </button>
                    <button
                      onClick={handleResetDefaultPrompts}
                      className="p-1.5 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white rounded-lg transition-all cursor-pointer"
                      title="Reset Library to Defaults"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Form to Add / Edit Prompt */}
                <AnimatePresence>
                  {isAddingPrompt && (
                    <motion.form 
                      initial={{ opacity: 0, height: 0 }} 
                      animate={{ opacity: 1, height: 'auto' }} 
                      exit={{ opacity: 0, height: 0 }}
                      onSubmit={handleAddOrUpdatePrompt}
                      className="bg-[#12141a] border border-amber-500/40 rounded-xl p-3.5 space-y-3 shadow-xl overflow-hidden"
                    >
                      <div className="text-[11px] font-mono font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                        {editingPromptId ? <Edit3 className="w-3.5 h-3.5 text-amber-400" /> : <BookmarkPlus className="w-3.5 h-3.5" />} 
                        {editingPromptId ? 'Edit Directive' : 'Save Custom Directive'}
                      </div>
                      <div>
                        <label className="text-[10px] font-mono text-slate-400 block mb-1">Title</label>
                        <input 
                          type="text" 
                          value={newPromptTitle} 
                          onChange={e => setNewPromptTitle(e.target.value)} 
                          placeholder="e.g. Switch to Cyberpunk Tone"
                          className="w-full bg-black border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:border-amber-500/50 outline-none font-sans"
                          required
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-mono text-slate-400 block mb-1">Category</label>
                        <select 
                          value={newPromptCategory} 
                          onChange={e => setNewPromptCategory(e.target.value as any)} 
                          className="w-full bg-black border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:border-amber-500/50 outline-none font-mono cursor-pointer"
                        >
                          <option value="Tone">Tone</option>
                          <option value="Expansion">Expansion</option>
                          <option value="Dialogue">Dialogue</option>
                          <option value="Structure">Structure</option>
                          <option value="Refinement">Refinement</option>
                          <option value="Custom">Custom</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] font-mono text-slate-400 block mb-1">Prompt Text Directive</label>
                        <textarea 
                          value={newPromptText} 
                          onChange={e => setNewPromptText(e.target.value)} 
                          placeholder="Enter exact AI directive instructions..."
                          className="w-full h-20 bg-black border border-white/10 rounded-lg p-2 text-xs text-white focus:border-amber-500/50 outline-none resize-none font-mono"
                          required
                        />
                      </div>
                      <div className="flex gap-2 pt-1">
                        <button 
                          type="submit" 
                          className="flex-1 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-mono text-xs font-bold uppercase tracking-wider rounded-lg transition-colors cursor-pointer"
                        >
                          {editingPromptId ? 'Update Prompt' : 'Save Prompt'}
                        </button>
                        <button 
                          type="button" 
                          onClick={() => {
                            setIsAddingPrompt(false);
                            setEditingPromptId(null);
                          }} 
                          className="px-3 py-2 bg-white/5 hover:bg-white/10 text-slate-400 text-xs font-mono rounded-lg cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    </motion.form>
                  )}
                </AnimatePresence>

                {/* Search & Category Filter Pills */}
                <div className="space-y-2">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input 
                      type="text" 
                      value={promptSearch} 
                      onChange={e => setPromptSearch(e.target.value)} 
                      placeholder="Search prompts by keyword..." 
                      className="w-full bg-black border border-white/10 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder:text-slate-600 focus:border-amber-500/30 outline-none font-mono"
                    />
                  </div>

                  <div className="flex gap-1.5 overflow-x-auto pb-1 custom-scrollbar">
                    {['All', 'Tone', 'Expansion', 'Dialogue', 'Structure', 'Refinement', 'Custom'].map(cat => {
                      const count = categoryCounts[cat as keyof typeof categoryCounts] || 0;
                      return (
                        <button 
                          key={cat} 
                          onClick={() => setPromptCategoryFilter(cat)} 
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-mono whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1 ${promptCategoryFilter === cat ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold' : 'bg-white/5 text-slate-400 hover:text-white'}`}
                        >
                          <span>{cat}</span>
                          <span className="opacity-60 text-[9px]">({count})</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Prompt Cards List */}
                <div className="space-y-3">
                  {filteredPrompts.length === 0 ? (
                    <div className="p-6 text-center border border-dashed border-white/10 rounded-xl space-y-2">
                      <Bookmark className="w-6 h-6 text-slate-600 mx-auto" />
                      <p className="text-xs text-slate-500 font-mono">No prompts match filter.</p>
                    </div>
                  ) : (
                    filteredPrompts.map(p => {
                      const isRunningThis = runningPromptId === p.id;
                      return (
                        <div key={p.id} className={`bg-[#12141a] border rounded-xl p-3.5 space-y-2.5 transition-all shadow-sm ${isRunningThis ? 'border-amber-400 bg-amber-500/5 ring-1 ring-amber-400/30' : 'border-white/5 hover:border-amber-500/30'}`}>
                          
                          {/* Card Header */}
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-bold text-white font-serif tracking-tight truncate">{p.title}</span>
                            <div className="flex items-center gap-1 shrink-0">
                              <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[9px] font-mono text-amber-400">
                                {p.category}
                              </span>
                              <button 
                                onClick={() => handleStartEditPrompt(p)} 
                                className="p-1 text-slate-400 hover:text-amber-300 rounded transition-colors"
                                title="Edit prompt directive"
                              >
                                <Edit3 className="w-3 h-3" />
                              </button>
                              <button 
                                onClick={() => handleDeletePrompt(p.id)} 
                                className="p-1 text-slate-500 hover:text-rose-400 rounded transition-colors"
                                title="Delete prompt"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>

                          {/* Directive Content */}
                          <p className="text-xs text-slate-300 leading-relaxed bg-black/40 p-2.5 rounded-lg border border-white/5 font-mono text-[11px] select-all">
                            "{p.prompt}"
                          </p>

                          {/* Card Action Row */}
                          <div className="flex items-center justify-between pt-1 gap-2 text-[10px] font-mono">
                            {/* Primary Action: Run AI */}
                            <button
                              onClick={() => handleTriggerAIPrompt(p)}
                              disabled={isRunningThis}
                              className="px-2.5 py-1.5 bg-amber-500 hover:bg-amber-400 disabled:bg-slate-800 text-slate-950 font-black tracking-wider uppercase rounded-md transition-all flex items-center gap-1 cursor-pointer shadow-md shrink-0"
                              title="Trigger AI prose transformation in editor"
                            >
                              {isRunningThis ? <Loader2 className="w-3 h-3 animate-spin text-slate-950" /> : <Zap className="w-3 h-3" />}
                              <span>{isRunningThis ? 'Running...' : 'Run AI'}</span>
                            </button>

                            <div className="flex items-center gap-1 overflow-x-auto">
                              <button 
                                onClick={() => handleUseInBeats(p.prompt)}
                                className="px-2 py-1 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-md transition-colors flex items-center gap-1 cursor-pointer whitespace-nowrap"
                                title="Send directive to Director Agent Scene Beats"
                              >
                                <Send className="w-3 h-3" /> Beats
                              </button>
                              <button 
                                onClick={() => handleInsertInEditor(p.prompt)}
                                className="px-2 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-md transition-colors flex items-center gap-1 cursor-pointer whitespace-nowrap"
                                title="Insert directive box into manuscript text"
                              >
                                <Plus className="w-3 h-3" /> Insert
                              </button>
                              <button 
                                onClick={() => handleCopyPrompt(p)}
                                className="p-1.5 text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-md transition-colors flex items-center gap-1 cursor-pointer shrink-0"
                                title="Copy prompt text"
                              >
                                {copiedPromptId === p.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                              </button>
                            </div>
                          </div>

                        </div>
                      );
                    })
                  )}
                </div>

              </div>
            )}

          </motion.aside>
        )}
      </AnimatePresence>

    </div>
  );
}