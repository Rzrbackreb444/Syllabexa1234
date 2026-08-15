import React, { useState, useEffect } from 'react';
import { 
  Layers, 
  Plus, 
  CheckCircle, 
  Clock, 
  Play, 
  Sparkles, 
  Users, 
  BrainCircuit, 
  Printer, 
  Sliders, 
  DollarSign, 
  Database, 
  RefreshCw, 
  TrendingUp, 
  ShieldCheck, 
  AlertCircle, 
  ChevronRight, 
  ArrowRight,
  Clipboard,
  FileText,
  BadgeAlert,
  HelpCircle,
  Copy
} from 'lucide-react';
import { Chapter } from '../types';
import SyllabexaBilling from './SyllabexaBilling';
import SyllabexaDiagnosticsPanel from './SyllabexaDiagnosticsPanel';

interface Project {
  id: string;
  name: string;
  clientName: string;
  voiceProfileId: string;
  status: 'Drafting Outline' | 'Writing Chapters' | 'In Editorial Review' | 'Locked & Approved';
  chaptersCount: number;
  progress: number; // 0-100%
  averageScore: number; // 0-100
  exportStatus: 'Draft' | 'DOCX Ready' | 'PDF Ready' | 'KDP Bundle Prepared';
  lastUpdated: string;
}

interface ClientRecord {
  id: string;
  name: string;
  company: string;
  voiceProfileCount: number;
  projectCount: number;
  status: 'Active' | 'Paused' | 'Pending Approval';
}

interface VoiceLibraryItem {
  id: string;
  name: string;
  clientName: string;
  tone: string;
  persona: string;
  isUpdatable: boolean;
}

import { useAuth } from '../lib/AuthContext';

export default function SyllabexaOrchestrator({
  onSelectProject,
  userId = 'usr_syllabexa_test',
  userEmail = 'thelaundromatfb@gmail.com'
}: {
  onSelectProject?: (projectId: 'stroke' | 'washbiz' | 'new') => void;
  userId?: string;
  userEmail?: string;
}) {
  const { profile } = useAuth();
  // Global Platform Modes Setup
  const [platformMode, setPlatformMode] = useState<'professional' | 'ghostwriting' | 'mass-production'>('ghostwriting');
  
  // Platform Sub-Pages Navigation
  const [activePage, setActivePage] = useState<'dashboard' | 'clients' | 'voices' | 'batch' | 'billing' | 'settings'>('dashboard');

  // Checkout Interactive States
  const [checkoutLoadingId, setCheckoutLoadingId] = useState<string | null>(null);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  const handleCheckout = async (priceId: string, planName: string) => {
    setCheckoutLoadingId(priceId);
    setCheckoutError(null);
    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priceId,
          userId,
          userEmail,
        })
      });
      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      } else if (data.error) {
        setCheckoutError(`Checkout Error: ${data.error}`);
      } else {
        setCheckoutError('Could not launch Stripe Checkout. Please verify your Stripe Secret Key inside the Secrets Box.');
      }
    } catch (err: any) {
      console.error(err);
      setCheckoutError(err.message || 'Error communicating with Stripe API server.');
    } finally {
      setCheckoutLoadingId(null);
    }
  };

  // Multi-Book Projects state
  const [projects, setProjects] = useState<Project[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('syllabexa_orchestrator_projects');
      if (saved) {
        try { return JSON.parse(saved); } catch (e) {}
      }
    }
    return [];
  });

  // Client library state
  const [clients, setClients] = useState<ClientRecord[]>([
    { id: 'cl-1', name: 'Nicholas Kremers', company: 'Stroke Sasquatch Ltd', voiceProfileCount: 2, projectCount: 1, status: 'Active' },
    { id: 'cl-2', name: 'Dr. Evelyn Carter', company: 'Cognitive Science Lab', voiceProfileCount: 1, projectCount: 1, status: 'Active' },
    { id: 'cl-3', name: 'Acme Growth Corp', company: 'Enterprise Publisher', voiceProfileCount: 3, projectCount: 1, status: 'Active' },
    { id: 'cl-4', name: 'Marcus Sterling', company: 'Sterling Ghostwriting', voiceProfileCount: 1, projectCount: 0, status: 'Pending Approval' }
  ]);

  // Voice Engine Library
  const [voices, setVoices] = useState<VoiceLibraryItem[]>([
    { id: 'vp-stroke', name: 'Stroke Recovery Sasquatch', clientName: 'Nicholas Kremers', tone: 'Visceral & unyielding', persona: 'Survivor', isUpdatable: true },
    { id: 'vp-academic', name: 'The Analytical Scholar', clientName: 'Dr. Evelyn Carter', tone: 'Clinical & structured', persona: 'Neuroscientist', isUpdatable: true },
    { id: 'vp-enterprise', name: 'High-Impact Brand Voice', clientName: 'Acme Growth Corp', tone: 'Authoritative & metric-driven', persona: 'Venture partner', isUpdatable: true },
    { id: 'vp-rebel', name: 'Sarcastic Rebel Mentor', clientName: 'Syllabexa Studio', tone: 'Punchy & witty', persona: 'Renegade coach', isUpdatable: true }
  ]);

  // Live real-time generation trackers
  const [isLiveGenerating, setIsLiveGenerating] = useState(false);
  const [generationPhase, setGenerationPhase] = useState<'idle' | 'outline' | 'chapters' | 'critique' | 'complete'>('idle');
  const [liveLog, setLiveLog] = useState<string[]>([]);
  const [liveOutlinePercent, setLiveOutlinePercent] = useState(0);
  const [liveChapterPercent, setLiveChapterPercent] = useState(0);
  const [liveCritiquePercent, setLiveCritiquePercent] = useState(0);
  const [liveAssemblyPercent, setLiveAssemblyPercent] = useState(0);

  // New item creators
  const [newClientName, setNewClientName] = useState('');
  const [newClientCompany, setNewClientCompany] = useState('');
  const [newProjTitle, setNewProjTitle] = useState('');
  const [newProjClient, setNewProjClient] = useState('Nicholas Kremers');

  // Synchronize book projects with localStorage
  useEffect(() => {
    localStorage.setItem('syllabexa_orchestrator_projects', JSON.stringify(projects));
  }, [projects]);

  // Trigger a complete simulated live generation workflow demonstrating how outlines, chapters, scores & assemblies compile in real-time
  const triggerLiveGenerationDemo = () => {
    if (isLiveGenerating) return;
    setIsLiveGenerating(true);
    setGenerationPhase('outline');
    setLiveLog(["Initializing live-updating Syllabexa Publishing Autopilot..."]);
    setLiveOutlinePercent(0);
    setLiveChapterPercent(0);
    setLiveCritiquePercent(0);
    setLiveAssemblyPercent(0);

    // Timeline steps for the live demonstration
    let timer = 0;

    // Step 1: Outlines generate live
    const outlineInterval = setInterval(() => {
      setLiveOutlinePercent(prev => {
        if (prev >= 100) {
          clearInterval(outlineInterval);
          return 100;
        }
        return prev + 25;
      });
    }, 400);

    setTimeout(() => {
      setLiveLog(prev => [...prev, "Outlines generating live: Compiling structural progression sequence...", "Blueprint locked: Chapter 1 (The Threshold), Chapter 2 (The Abyss), Chapter 3 (The Rebound)."]);
      setGenerationPhase('chapters');
    }, 1800);

    // Step 2: Chapters generate live
    setTimeout(() => {
      const chapterInterval = setInterval(() => {
        setLiveChapterPercent(prev => {
          if (prev >= 100) {
            clearInterval(chapterInterval);
            return 100;
          }
          return prev + 10;
        });
      }, 300);

      const logTick = setInterval(() => {
        const words = Math.floor(Math.random() * 300) + 200;
        setLiveLog(prev => [...prev, `Chapters generating live: Writing Vol. 1... +${words} words compiled with Locked-In Author Voice Profile.`]);
      }, 600);

      setTimeout(() => {
        clearInterval(logTick);
        setGenerationPhase('critique');
      }, 3500);
    }, 2000);

    // Step 3: Editorial scores appear live
    setTimeout(() => {
      const scoreInterval = setInterval(() => {
        setLiveCritiquePercent(prev => {
          if (prev >= 94) {
            clearInterval(scoreInterval);
            return 94;
          }
          return prev + 12;
        });
      }, 250);

      setTimeout(() => {
        setLiveLog(prev => [...prev, "Editorial alignment check live: Tone drift 2%, Dialogue cadence 98%, Pacing consistency 94%.", "Linguistic score verified: 94/100 (Linguistic Lock reached)."]);
        setGenerationPhase('complete');
      }, 2200);
    }, 5500);

    // Step 4: Manuscript assembly updates live
    setTimeout(() => {
      const assemblyInterval = setInterval(() => {
        setLiveAssemblyPercent(prev => {
          if (prev >= 100) {
            clearInterval(assemblyInterval);
            return 100;
          }
          return prev + 20;
        });
      }, 200);

      setTimeout(() => {
        setLiveLog(prev => [...prev, "Manuscript assembly complete: Title page, dedicated introduction, compiled chapters, index and footnotes unified.", "Syllabexa system has successfully structured the book project inside your active inventory!"]);
        
        // Add compiled project to active projects list
        const demoProj: Project = {
          id: `proj-live-${Date.now()}`,
          name: 'Syllabexa Real-Time Autopilot Masterpiece',
          clientName: 'Nicholas Kremers',
          voiceProfileId: 'vp-stroke',
          status: 'Locked & Approved',
          chaptersCount: 3,
          progress: 100,
          averageScore: 94,
          exportStatus: 'KDP Bundle Prepared',
          lastUpdated: 'Just compiled'
        };
        setProjects(prev => [demoProj, ...prev]);
        setIsLiveGenerating(false);
      }, 1500);
    }, 7800);
  };

  const addClient = () => {
    if (!newClientName.trim()) return;
    const newCl: ClientRecord = {
      id: `cl-${Date.now()}`,
      name: newClientName,
      company: newClientCompany || 'Independent Creator',
      voiceProfileCount: 1,
      projectCount: 0,
      status: 'Active'
    };
    setClients([...clients, newCl]);
    setNewClientName('');
    setNewClientCompany('');
    alert("New client profile has been registered and initialized in the platform directories.");
  };

  const addProject = () => {
    if (!newProjTitle.trim()) return;
    const newProj: Project = {
      id: `proj-${Date.now()}`,
      name: newProjTitle,
      clientName: newProjClient,
      voiceProfileId: 'vp-stroke',
      status: 'Drafting Outline',
      chaptersCount: 0,
      progress: 5,
      averageScore: 0,
      exportStatus: 'Draft',
      lastUpdated: 'Just now'
    };
    setProjects([newProj, ...projects]);
    setNewProjTitle('');
    alert("Project workspace initialized with active Syllabexa co-author channels.");
  };

  const deleteProject = (id: string) => {
    if (confirm("Are you sure you want to delete this project folder?")) {
      setProjects(projects.filter(p => p.id !== id));
    }
  };

  const duplicateVoice = (id: string) => {
    const original = voices.find(v => v.id === id);
    if (!original) return;
    const duplicated: VoiceLibraryItem = {
      ...original,
      id: `vp-dup-${Date.now()}`,
      name: `${original.name} (Copy)`,
      clientName: `${original.clientName} (Duplicated)`,
      isUpdatable: true
    };
    setVoices([...voices, duplicated]);
    alert(`Voice Profile "${original.name}" duplicated successfully for client reuse.`);
  };

  return (
    <aside aria-label="Syllabexa Enterprise Orchestrator" className="flex-1 flex flex-col overflow-hidden bg-slate-50 dark:bg-[#07080a] text-slate-900 dark:text-slate-100 animate-fade-in font-sans">
      
      {/* Top Bar with Platform Mode explicit display & Selector */}
      <div className="bg-white/80 dark:bg-[#0c0e12]/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800/60 px-6 py-4 flex flex-wrap justify-between items-center shrink-0 shadow-sm z-20 gap-3 transition-colors">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center border border-indigo-100 dark:border-indigo-500/20">
            <Layers className="text-indigo-600 dark:text-indigo-400 shrink-0" size={16} />
          </div>
          <h2 className="text-xs font-bold tracking-[0.2em] text-slate-800 dark:text-slate-200 uppercase font-mono">Syllabexa Enterprise Infrastructure</h2>
        </div>

        {/* 1. THREE PLATFORM MODES STATE (Explicit Display and Selector) */}
        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-[#07080a] p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-inner">
          <button
            onClick={() => {
              setPlatformMode('professional');
              alert("Activated Professional Book Mode: Single-author workspace optimized for premium manuscripts, deep style continuity, and focus writing.");
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${platformMode === 'professional' ? 'bg-indigo-600 text-white shadow-md border border-indigo-500' : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-white dark:hover:bg-slate-900 border border-transparent'}`}
          >
            <Sliders size={14} />
            Professional Book Mode
          </button>
          
          <button
            onClick={() => {
              setPlatformMode('ghostwriting');
              alert("Activated Ghostwriting Mode: Enabled multi-client profiles, voice clone storage matrices, custom editorial benchmarks, and client revision tracking.");
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${platformMode === 'ghostwriting' ? 'bg-indigo-600 text-white shadow-md border border-indigo-500' : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-white dark:hover:bg-slate-900 border border-transparent'}`}
          >
            <Users size={14} />
            Ghostwriting Mode
          </button>

          <button
            onClick={() => {
              setPlatformMode('mass-production');
              alert("Activated Mass-Production Mode: Unleashed background parallel autopilot channels, massive sequential chapter generators, and concurrent KDP publisher exports.");
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${platformMode === 'mass-production' ? 'bg-indigo-600 text-white shadow-md border border-indigo-500' : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-white dark:hover:bg-slate-900 border border-transparent'}`}
          >
            <Database size={14} />
            Mass-Production Mode
          </button>
        </div>
      </div>

      {/* Main SaaS Platform Working Grid */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Navigation Rail representing User Pages and Agency Pages */}
        <nav aria-label="Orchestrator Navigation" className="w-64 bg-[#0f1115] border-r border-slate-800 flex flex-col justify-between shrink-0 text-slate-300 shadow-[inset_-1px_0_0_rgba(255,255,255,0.05)]">
          <div className="p-5 space-y-6 overflow-y-auto custom-scrollbar">
            
            {/* User Pages Segment */}
            <div className="space-y-2">
              <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-indigo-400 block px-3 pb-2 opacity-80">Production Matrix</span>
              <button 
                onClick={() => setActivePage('dashboard')} 
                className={`w-full text-left px-3 py-2 text-sm font-semibold rounded-xl flex items-center gap-3 transition-all cursor-pointer ${activePage === 'dashboard' ? 'bg-indigo-500/10 text-indigo-300 font-bold border-l-2 border-indigo-500 shadow-sm' : 'hover:bg-slate-800/50 hover:text-slate-100 text-slate-400 border-l-2 border-transparent'}`}
              >
                <Layers size={16} />
                Dashboard Home
              </button>
              <button 
                onClick={() => setActivePage('voices')} 
                className={`w-full text-left px-3 py-2 text-sm font-semibold rounded-xl flex items-center gap-3 transition-all cursor-pointer ${activePage === 'voices' ? 'bg-indigo-500/10 text-indigo-300 font-bold border-l-2 border-indigo-500 shadow-sm' : 'hover:bg-slate-800/50 hover:text-slate-100 text-slate-400 border-l-2 border-transparent'}`}
              >
                <BrainCircuit size={16} />
                Voice Profiles Library
              </button>
              <button 
                onClick={() => { alert("This routes to the Manuscript builder editor inside the primary editor desk tab."); }} 
                className="w-full text-left px-3 py-2 text-sm font-semibold rounded-xl flex items-center gap-3 text-slate-400 hover:bg-slate-800/50 hover:text-slate-100 transition-all cursor-pointer border-l-2 border-transparent"
              >
                <FileText size={16} />
                Chapter Editor
              </button>
            </div>

            {/* Agency Pages Segment */}
            <div className="space-y-2 pt-6 border-t border-slate-800/60">
              <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-emerald-400 block px-3 pb-2 opacity-80">Agency Suite</span>
              <button 
                onClick={() => setActivePage('clients')} 
                className={`w-full text-left px-3 py-2 text-sm font-semibold rounded-xl flex items-center gap-3 transition-all cursor-pointer ${activePage === 'clients' ? 'bg-emerald-500/10 text-emerald-300 font-bold border-l-2 border-emerald-500 shadow-sm' : 'hover:bg-slate-800/50 hover:text-slate-100 text-slate-400 border-l-2 border-transparent'}`}
              >
                <Users size={16} />
                Client Accounts
              </button>
              <button 
                onClick={() => setActivePage('batch')} 
                className={`w-full text-left px-3 py-2 text-sm font-semibold rounded-xl flex items-center gap-3 transition-all cursor-pointer ${activePage === 'batch' ? 'bg-emerald-500/10 text-emerald-300 font-bold border-l-2 border-emerald-500 shadow-sm' : 'hover:bg-slate-800/50 hover:text-slate-100 text-slate-400 border-l-2 border-transparent'}`}
              >
                <Database size={16} />
                Batch Generation
              </button>
            </div>

            {/* Account & SaaS Pages */}
            <div className="space-y-2 pt-6 border-t border-slate-800/60">
              <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-slate-500 block px-3 pb-2 opacity-80">Infrastructure</span>
              <button 
                onClick={() => setActivePage('billing')} 
                className={`w-full text-left px-3 py-2 text-sm font-semibold rounded-xl flex items-center gap-3 transition-all cursor-pointer ${activePage === 'billing' ? 'bg-slate-800/50 text-white font-bold border-l-2 border-slate-400 shadow-sm' : 'hover:bg-slate-800/50 hover:text-slate-100 text-slate-400 border-l-2 border-transparent'}`}
              >
                <DollarSign size={16} />
                Capacity & Billing
              </button>
              <button 
                onClick={() => setActivePage('settings')} 
                className={`w-full text-left px-3 py-2 text-sm font-semibold rounded-xl flex items-center gap-3 transition-all cursor-pointer ${activePage === 'settings' ? 'bg-slate-800/50 text-white font-bold border-l-2 border-slate-400 shadow-sm' : 'hover:bg-slate-800/50 hover:text-slate-100 text-slate-400 border-l-2 border-transparent'}`}
              >
                <Sliders size={16} />
                Platform Settings
              </button>
            </div>
          </div>

          <div className="p-5 bg-black/40 border-t border-slate-800/80 text-xs space-y-3 text-slate-400 font-mono">
            <div className="flex justify-between font-semibold items-center">
              <span>Tier:</span>
              <span className="text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">{profile?.activePlan === 'free' ? 'Free (Seed)' : profile?.activePlan === 'pro' ? 'Creator Pro' : 'Agency Pro'}</span>
            </div>
            <div className="flex justify-between font-semibold items-center">
              <span>Credits:</span>
              <span className="text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 text-[10px] uppercase tracking-wider">{profile?.computeCredits || 0}</span>
            </div>
          </div>
        </nav>

        {/* Dynamic Platform Page Viewport */}
        <main className="flex-1 overflow-y-auto p-8 md:p-12 space-y-10 custom-scrollbar bg-slate-50 dark:bg-[#07080a] transition-colors">
          
          {/* Active page is Dashboard */}
          {activePage === 'dashboard' && (
            <div className="space-y-8 animate-fade-in">
              
              {/* BRAND NEW: Command Center Stats Banner & Massive "[ INITIALIZE SECURE PIPELINE ]" Button */}
              <div className="bg-[#0f1115] border border-slate-800 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>
                
                <div className="space-y-4 text-center md:text-left">
                  <div>
                    <span className="text-[10px] font-mono tracking-[0.25em] text-indigo-400 uppercase font-black bg-indigo-950/50 px-2.5 py-1 rounded border border-indigo-900/40">
                      Syllabexa Command Center
                    </span>
                    <h3 className="text-xl md:text-2xl font-serif font-black text-slate-100 tracking-tight mt-3">
                      Asset Pipeline Manager
                    </h3>
                    <p className="text-xs text-slate-400 mt-1.5 max-w-lg leading-relaxed">
                      Initialize new intellectual assets, coordinate active voice profiles, and scale multi-book publishing campaigns instantly.
                    </p>
                  </div>
                </div>

                <div className="shrink-0 w-full md:w-auto">
                  <button
                    onClick={() => {
                      const title = prompt("Enter Book/Asset Title to Initialize:");
                      if (title) {
                        const cl = prompt("Assign to Client/Author Name:", "Nicholas Kremers");
                        const newProj: Project = {
                          id: `proj-${Date.now()}`,
                          name: title,
                          clientName: cl || 'Syllabexa Studio',
                          voiceProfileId: 'vp-stroke',
                          status: 'Drafting Outline',
                          chaptersCount: 1,
                          progress: 10,
                          averageScore: 90,
                          exportStatus: 'Draft',
                          lastUpdated: 'Just now'
                        };
                        setProjects([newProj, ...projects]);
                        
                        // Automatically map and open in the active Production Studio!
                        // This matches the "massive button to 'Initialize New Asset'" which triggers the command center action
                        onSelectProject?.('new');
                      }
                    }}
                    className="w-full md:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-mono font-bold text-xs uppercase tracking-widest px-8 py-4 rounded-2xl shadow-xl hover:shadow-indigo-600/20 hover:-translate-y-0.5 transition-all cursor-pointer flex items-center justify-center gap-2.5 border border-indigo-500/30"
                  >
                    <Plus size={16} />
                    <span>[ INITIALIZE SECURE PIPELINE ]</span>
                  </button>
                </div>
              </div>

              {/* Live Real-time Generation Widget */}
              <div className="bg-gradient-to-r from-indigo-900 to-indigo-950 text-white rounded-3xl p-6 shadow-md border border-indigo-800/50 space-y-4">
                <div className="flex justify-between items-start gap-4 flex-wrap">
                  <div>
                    <span className="text-[10px] bg-indigo-500/30 text-indigo-200 border border-indigo-500/50 px-2 py-1 rounded font-bold uppercase tracking-widest">
                      Live-Updating Engine
                    </span>
                    <h3 className="text-xl font-bold tracking-tight mt-1.5">Syllabexa Real-Time Autopilot Workspace</h3>
                    <p className="text-xs text-indigo-200 font-medium max-w-xl">
                      Experience real-time interactive book crafting. Trigger the simulator below to watch outlines form, chapters write, editorial scores appear, and manuscript assemblies compile live!
                    </p>
                  </div>
                  <button
                    onClick={triggerLiveGenerationDemo}
                    disabled={isLiveGenerating}
                    className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white font-extrabold text-xs rounded-xl shadow cursor-pointer transition-all flex items-center gap-2 disabled:opacity-50"
                  >
                    <RefreshCw size={14} className={isLiveGenerating ? 'animate-spin' : ''} />
                    {isLiveGenerating ? 'Generating Live...' : 'Trigger Live Generation'}
                  </button>
                </div>

                {/* 2. REAL-TIME GENERATION FEEDBACK BARS */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-3 border-t border-indigo-800/40">
                  <div className="bg-indigo-950/40 border border-indigo-800/30 p-3 rounded-2xl space-y-1.5">
                    <div className="flex justify-between text-[11px] font-bold text-indigo-200">
                      <span>Outlines Live</span>
                      <span className="font-mono">{liveOutlinePercent}%</span>
                    </div>
                    <div className="w-full bg-indigo-950 h-2 rounded-full overflow-hidden">
                      <div className="bg-gradient-to-r from-blue-400 to-indigo-400 h-full transition-all duration-300" style={{ width: `${liveOutlinePercent}%` }}></div>
                    </div>
                  </div>

                  <div className="bg-indigo-950/40 border border-indigo-800/30 p-3 rounded-2xl space-y-1.5">
                    <div className="flex justify-between text-[11px] font-bold text-indigo-200">
                      <span>Chapters Live</span>
                      <span className="font-mono">{liveChapterPercent}%</span>
                    </div>
                    <div className="w-full bg-indigo-950 h-2 rounded-full overflow-hidden">
                      <div className="bg-gradient-to-r from-purple-400 to-indigo-400 h-full transition-all duration-300" style={{ width: `${liveChapterPercent}%` }}></div>
                    </div>
                  </div>

                  <div className="bg-indigo-950/40 border border-indigo-800/30 p-3 rounded-2xl space-y-1.5">
                    <div className="flex justify-between text-[11px] font-bold text-indigo-200">
                      <span>Editorial Scores Live</span>
                      <span className="font-mono">{liveCritiquePercent}%</span>
                    </div>
                    <div className="w-full bg-indigo-950 h-2 rounded-full overflow-hidden">
                      <div className="bg-gradient-to-r from-pink-400 to-indigo-400 h-full transition-all duration-300" style={{ width: `${liveCritiquePercent}%` }}></div>
                    </div>
                  </div>

                  <div className="bg-indigo-950/40 border border-indigo-800/30 p-3 rounded-2xl space-y-1.5">
                    <div className="flex justify-between text-[11px] font-bold text-indigo-200">
                      <span>Assembly Live</span>
                      <span className="font-mono">{liveAssemblyPercent}%</span>
                    </div>
                    <div className="w-full bg-indigo-950 h-2 rounded-full overflow-hidden">
                      <div className="bg-gradient-to-r from-emerald-400 to-indigo-400 h-full transition-all duration-300" style={{ width: `${liveAssemblyPercent}%` }}></div>
                    </div>
                  </div>
                </div>

                {liveLog.length > 0 && (
                  <div className="p-3 bg-indigo-950/80 rounded-xl font-mono text-[10px] space-y-1 text-indigo-200 max-h-24 overflow-y-auto border border-indigo-900 custom-scrollbar">
                    {liveLog.map((log, index) => (
                      <div key={index} className="flex gap-1">
                        <span className="text-emerald-400">►</span>
                        <span>{log}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 3. THE MASTER PROJECT DASHBOARD SECTION */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Active Books list with scoring, progress and KDP export status */}
                <div className="lg:col-span-2 space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                      <FileText size={16} className="text-indigo-600" />
                      Active Manuscript Folders ({projects.length})
                    </h3>
                    
                    <button
                      onClick={() => {
                        const title = prompt("Enter book title:");
                        if (title) {
                          const cl = prompt("Assign to Client Name:", "Nicholas Kremers");
                          const newProj: Project = {
                            id: `proj-${Date.now()}`,
                            name: title,
                            clientName: cl || 'Syllabexa Studio',
                            voiceProfileId: 'vp-stroke',
                            status: 'Drafting Outline',
                            chaptersCount: 0,
                            progress: 5,
                            averageScore: 0,
                            exportStatus: 'Draft',
                            lastUpdated: 'Just now'
                          };
                          setProjects([newProj, ...projects]);
                        }
                      }}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
                    >
                      <Plus size={12} />
                      Initialize Book
                    </button>
                  </div>

                  <div className="space-y-4">
                    {projects.length === 0 ? (
                      <div className="bg-[#0f1115] border border-slate-800 rounded-3xl p-10 text-center flex flex-col items-center justify-center space-y-4 shadow-2xl relative overflow-hidden">
                        <div className="absolute inset-0 bg-red-500/[0.01] pointer-events-none"></div>
                        <div className="text-red-500 font-mono text-xs uppercase tracking-[0.2em] font-black">
                          SYSTEM STATUS: No active pipelines found. Initialize a new asset to begin.
                        </div>
                        <p className="text-[11px] text-slate-400 font-mono max-w-sm leading-relaxed">
                          All counters, active invoices, and historical billing profiles have been entirely purged from this console. Initialize a new asset or upload voice training profiles to launch secure compiler pipelines.
                        </p>
                      </div>
                    ) : (
                      projects.map(proj => (
                        <div key={proj.id} className="bg-white p-5 border border-slate-200 rounded-2xl shadow-sm hover:border-slate-300 transition-all space-y-3 relative overflow-hidden group">
                          
                          <div className="flex justify-between items-start gap-3">
                            <div>
                              <span className="text-[10px] uppercase font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 px-1.5 py-0.5 rounded">
                                {proj.clientName}
                              </span>
                              <h4 className="font-extrabold text-sm text-slate-900 mt-1">{proj.name}</h4>
                              <p className="text-[11px] text-slate-400 mt-0.5">Last updated: {proj.lastUpdated} • {proj.chaptersCount} volumes compiled</p>
                            </div>
                            
                            <button
                              onClick={() => deleteProject(proj.id)}
                              className="text-slate-300 hover:text-red-500 p-1 rounded hover:bg-slate-50 transition-colors cursor-pointer"
                              title="Archive folder"
                            >
                              Archive
                            </button>
                          </div>

                          {/* Alignment Score & Export package trackers */}
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50/70 border border-slate-100 p-3 rounded-xl text-xs font-semibold text-slate-700">
                            <div>
                              <span className="text-[9px] uppercase text-slate-400 font-bold block">Status</span>
                              <span className="text-slate-800 text-[11px]">{proj.status}</span>
                            </div>
                            <div>
                              <span className="text-[9px] uppercase text-slate-400 font-bold block">Style Match</span>
                              <span className={`text-[11px] font-bold ${proj.averageScore >= 90 ? 'text-emerald-700' : 'text-amber-700'}`}>
                                {proj.averageScore}% Alignment
                              </span>
                            </div>
                            <div>
                              <span className="text-[9px] uppercase text-slate-400 font-bold block">System Export</span>
                              <span className="text-slate-800 font-mono text-[11px] text-indigo-700">{proj.exportStatus}</span>
                            </div>
                            <div>
                              <span className="text-[9px] uppercase text-slate-400 font-bold block">Autopilot</span>
                              <span className="text-slate-800 text-[11px]">{proj.progress}% Done</span>
                            </div>
                          </div>

                          {/* Simple Progress visual line */}
                          <div className="space-y-1">
                            <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden">
                              <div className="bg-indigo-600 h-full transition-all" style={{ width: `${proj.progress}%` }}></div>
                            </div>
                          </div>

                          {/* Action Bar */}
                          <div className="flex justify-between items-center pt-2.5 border-t border-slate-100">
                            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                              ID: {proj.id}
                            </span>
                            <button
                              onClick={() => {
                                let mappedId: 'stroke' | 'washbiz' | 'new' = 'washbiz';
                                if (proj.id === 'proj-01') mappedId = 'stroke';
                                else if (proj.id === 'proj-03') mappedId = 'washbiz';
                                else mappedId = 'new';
                                onSelectProject?.(mappedId);
                              }}
                              className="bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-mono font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
                            >
                              <span>Open Production Studio</span>
                              <ArrowRight size={12} />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Visual Word Distribution and Pacing diagnostics */}
                  <SyllabexaDiagnosticsPanel />
                </div>

                {/* Dashboard Sidebar showing clients, summaries & live pricing tier mapping */}
                <div className="space-y-6">
                  
                  {/* Platform overview widgets */}
                  <div className="bg-slate-900 text-white rounded-2xl p-5 border border-slate-800 space-y-4">
                    <h4 className="text-xs uppercase font-extrabold tracking-widest text-indigo-400 flex items-center gap-1.5">
                      <TrendingUp size={14} className="text-indigo-400" />
                      Platform Multi-Tenancy
                    </h4>
                    <p className="text-xs text-slate-300 leading-relaxed font-medium">
                      Ghostwriters and agencies can simultaneously host separate book files, clients, and custom-trained AI Voice Models. Switch between them instantly using the top modes.
                    </p>

                    <div className="space-y-2 text-[11px] pt-2 border-t border-slate-800/70">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Total Book Folders:</span>
                        <span className="font-bold text-slate-200">{projects.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Total Locked Voice Profiles:</span>
                        <span className="font-bold text-slate-200">{voices.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Active Agency Clients:</span>
                        <span className="font-bold text-slate-200">{clients.length}</span>
                      </div>
                    </div>
                  </div>

                  {/* Pricing tier advisor mapping */}
                  <div className="bg-white p-5 border border-slate-200 rounded-2xl shadow-sm space-y-3">
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide flex items-center gap-1">
                      <ShieldCheck size={14} className="text-emerald-600" />
                      Usage & Plan Advisor
                    </h4>
                    <p className="text-[11px] text-slate-500 leading-normal font-medium">
                      Your current usage correlates to the <strong className="text-slate-800">Agency Pro Tier</strong>, ideal for high-volume series drafting and client-dedicated portals.
                    </p>
                    <button 
                      onClick={() => setActivePage('billing')}
                      className="w-full py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-lg cursor-pointer flex justify-center items-center gap-1"
                    >
                      View Pricing details <ChevronRight size={12} />
                    </button>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* Active page is Clients */}
          {activePage === 'clients' && (
            <div className="space-y-6 animate-fade-in text-slate-800">
              <div className="flex justify-between items-center border-b border-slate-200 pb-3">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <Users size={18} className="text-indigo-600" />
                    Agency Client Directory
                  </h3>
                  <p className="text-xs text-slate-500">Track client brands, manage authorization states, and assign dedicated book workflows.</p>
                </div>
              </div>

              {/* Add Client form */}
              <div className="bg-white p-4 border border-slate-200 rounded-xl space-y-3 max-w-xl">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Add New Client Account</h4>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="font-bold text-slate-600 block mb-1">Contact Name</label>
                    <input 
                      type="text" 
                      value={newClientName} 
                      onChange={e => setNewClientName(e.target.value)}
                      placeholder="e.g. Nicholas Kremers"
                      className="w-full p-2 border border-slate-200 rounded outline-none text-xs" 
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-600 block mb-1">Company / Brand Name</label>
                    <input 
                      type="text" 
                      value={newClientCompany} 
                      onChange={e => setNewClientCompany(e.target.value)}
                      placeholder="e.g. Sasquatch Publishing"
                      className="w-full p-2 border border-slate-200 rounded outline-none text-xs" 
                    />
                  </div>
                </div>
                <button 
                  onClick={addClient}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg cursor-pointer"
                >
                  Create Client Portal
                </button>
              </div>

              {/* Clients inventory */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {clients.map(cl => (
                  <div key={cl.id} className="bg-white p-4 border border-slate-200 rounded-xl flex justify-between items-start gap-4">
                    <div className="space-y-1">
                      <h4 className="font-bold text-slate-900 text-xs">{cl.name}</h4>
                      <p className="text-[11px] text-slate-400">{cl.company}</p>
                      <div className="flex gap-2 text-[10px] font-bold text-slate-500 pt-1">
                        <span className="bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">{cl.voiceProfileCount} Voice Profiles</span>
                        <span className="bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">{cl.projectCount} Manuscripts</span>
                      </div>
                    </div>
                    <span className="bg-green-50 text-green-700 text-[9px] font-bold px-2 py-0.5 rounded-full border border-green-200">
                      {cl.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 4. Active page is Voice Engine Library */}
          {activePage === 'voices' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex justify-between items-center border-b border-slate-200 pb-3">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <BrainCircuit size={18} className="text-indigo-600" />
                    Syllabexa Voice Engine Library
                  </h3>
                  <p className="text-xs text-slate-500">Manage multiple locked author voice profiles, clone styles, and update parameters instantly.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {voices.map(voice => (
                  <div key={voice.id} className="bg-white p-5 border border-slate-200 rounded-2xl hover:border-slate-300 transition-all space-y-3 relative group">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[9px] uppercase font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 px-1.5 py-0.5 rounded">
                          Client: {voice.clientName}
                        </span>
                        <h4 className="font-extrabold text-sm text-slate-900 mt-1">{voice.name}</h4>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button 
                          onClick={() => duplicateVoice(voice.id)}
                          className="p-1 hover:bg-slate-100 text-slate-400 hover:text-slate-800 rounded transition-colors cursor-pointer"
                          title="Duplicate voice profile"
                        >
                          <Copy size={12} />
                        </button>
                      </div>
                    </div>

                    <div className="text-xs text-slate-600 space-y-1 border-t border-slate-100 pt-2 font-medium">
                      <p><strong>Voice Tone:</strong> {voice.tone}</p>
                      <p><strong>Persona Blueprint:</strong> {voice.persona}</p>
                      <p className="text-[10px] text-emerald-600 flex items-center gap-1 mt-1 font-bold">
                        <CheckCircle size={10} /> Lock-in Active & Updatable
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Active page is Batch */}
          {activePage === 'batch' && (
            <div className="space-y-6 animate-fade-in">
              <div className="border-b border-slate-200 pb-3">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Database size={18} className="text-indigo-600" />
                  Mass Batch Parallel Generation
                </h3>
                <p className="text-xs text-slate-500">Enables agencies and high-volume publishers to run parallel generation loops across multiple client files.</p>
              </div>

              <div className="bg-white border border-slate-200 p-6 rounded-2xl space-y-4 max-w-xl">
                <span className="text-[10px] bg-indigo-50 text-indigo-700 font-bold px-2.5 py-1 rounded-full border border-indigo-100">
                  Mass-Production Module
                </span>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  Trigger concurrent autopilot templates for series sequencing or bulk article creation. Select the voice profiles, enter topics list separated by commas, and start the batch loop.
                </p>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="font-bold text-slate-600 block mb-1">Select Active Voices for Batch</label>
                    <select className="w-full p-2 border border-slate-200 rounded outline-none font-semibold">
                      <option>All Loaded Voice Library Profiles</option>
                      <option>Nicholas Kremers + Dr. Carter</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-slate-600 block mb-1">Topics / Premise List (Separated by commas)</label>
                    <textarea 
                      placeholder="e.g. Stroke Neuroplasticity Hacks, Cognitive Flow Secrets, Executive Muscle Memory Techniques"
                      className="w-full h-20 p-2 border border-slate-200 rounded outline-none text-xs"
                    />
                  </div>
                </div>

                <button 
                  onClick={() => {
                    alert("Batch generation launched in parallel threads! Track active progress logs in the Live Tickers bar.");
                  }}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow cursor-pointer"
                >
                  Launch Concurrent Batch
                </button>
              </div>
            </div>
          )}

          {/* SaaS Billing & plans */}
          {activePage === 'billing' && (
            <div className="space-y-6 animate-fade-in">
              <SyllabexaBilling userId={userId} userEmail={userEmail} />
            </div>
          )}

          {/* Platform Settings */}
          {activePage === 'settings' && (
            <div className="space-y-6 animate-fade-in">
              <div className="border-b border-slate-200 pb-3">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Sliders size={18} className="text-indigo-600" />
                  Enterprise Infrastructure Settings & Directory Configuration
                </h3>
                <p className="text-xs text-slate-500">Configure file paths, active database sync keys, and default typography configurations.</p>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4 max-w-xl text-xs font-semibold">
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-slate-100">
                    <div>
                      <p className="text-slate-800 font-bold">Auto-Save snap points</p>
                      <p className="text-[10px] text-slate-400 font-medium">Saves outline and chapter snapshots to browser store every 5 mins.</p>
                    </div>
                    <input type="checkbox" defaultChecked className="w-4 h-4 text-indigo-600 rounded" />
                  </div>

                  <div className="flex justify-between items-center py-2 border-b border-slate-100">
                    <div>
                      <p className="text-slate-800 font-bold">Linguistic Cadence Drift trigger</p>
                      <p className="text-[10px] text-slate-400 font-medium">Alerts you immediately when a paragraph falls below 85% voice score match.</p>
                    </div>
                    <input type="checkbox" defaultChecked className="w-4 h-4 text-indigo-600 rounded" />
                  </div>

                  <div className="flex justify-between items-center py-2">
                    <div>
                      <p className="text-slate-800 font-bold">Client review channels</p>
                      <p className="text-[10px] text-slate-400 font-medium">Enables authors to submit dedicated comments to agency directors directly.</p>
                    </div>
                    <input type="checkbox" defaultChecked className="w-4 h-4 text-indigo-600 rounded" />
                  </div>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>

    </aside>
  );
}