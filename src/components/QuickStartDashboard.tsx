import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BookOpen, Puzzle, Mic, Sparkles, Upload, ArrowRight, FileText, 
  GraduationCap, Send, Wand2, Cpu, Feather, Layers, Globe, Zap, CheckCircle2, Circle, Play, TrendingUp, Clock, Target, Calendar, Palette, ShieldCheck, Activity, RefreshCw, Share2
} from 'lucide-react';
import { motion } from 'motion/react';
import { useToast } from '../lib/ToastContext';
import { useSelfOptimizer } from '../store/useSelfOptimizer';
import { useManuscriptStore } from '../store/manuscriptStore';
import laundromatData from '../data/laundromat_doctrine.json';

export const AutonomousHealthBadge: React.FC = () => {
  const { telemetryQueue, optimizationHistory, isOptimizing, runAutonomousOptimization } = useSelfOptimizer();

  const pendingCount = telemetryQueue.filter((t) => t.status === 'detected').length;
  const latestLog = optimizationHistory[0];

  return (
    <div className="flex items-center space-x-3 bg-slate-900/80 border border-slate-800 px-3.5 py-2 rounded-lg">
      <div className="flex items-center space-x-2">
        <Activity className={`w-4 h-4 ${pendingCount > 0 ? 'text-amber-400 animate-pulse' : 'text-emerald-400'}`} />
        <span className="text-xs font-medium text-slate-300">
          {pendingCount > 0 ? `${pendingCount} Runtime Alert(s)` : 'Engine Optimal (100%)'}
        </span>
      </div>

      {pendingCount > 0 && (
        <button
          onClick={() => runAutonomousOptimization()}
          disabled={isOptimizing}
          className="flex items-center space-x-1 px-2.5 py-1 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[11px] hover:bg-amber-500/30 transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-3 h-3 ${isOptimizing ? 'animate-spin' : ''}`} />
          <span>{isOptimizing ? 'Optimizing...' : 'Auto-Fix'}</span>
        </button>
      )}

      {latestLog && pendingCount === 0 && (
        <span className="text-[10px] text-slate-500 font-mono hidden md:inline">
          Last impact score: +{latestLog.impactScore} pts
        </span>
      )}
    </div>
  );
};

interface QuickStartDashboardProps {
  onOpenStudio?: (view: string) => void;
  onImportDraft?: () => void;
  onStartNewProject?: () => void;
}

export default function QuickStartDashboard({ onOpenStudio, onImportDraft, onStartNewProject }: QuickStartDashboardProps) {
  const navigate = useNavigate();
  const { showToast } = useToast();

  // Theme Previewer State
  const [selectedTheme, setSelectedTheme] = useState<'classic' | 'bold' | 'modern' | 'minimalist'>('classic');

  // Writing Velocity & Progress State
  const [velocityData, setVelocityData] = useState(() => {
    const saved = localStorage.getItem('syllabexa_velocity_data');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return {
      weeklyWordCount: 8420,
      weeklyGoal: 10000,
      totalProjectWords: 42500,
      targetProjectWords: 65000,
      deadlineDaysLeft: 14,
      dailyStreak: 6
    };
  });

  useEffect(() => {
    localStorage.setItem('syllabexa_velocity_data', JSON.stringify(velocityData));
  }, [velocityData]);

  // Onboarding Checklist State
  const [checklist, setChecklist] = useState(() => {
    const saved = localStorage.getItem('syllabexa_onboarding_steps');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return {
      step1: false, // Define project & premise
      step2: false, // Train voice matrix
      step3: false, // Generate chapter outline
      step4: false  // Initialize typesetter & barcode
    };
  });

  useEffect(() => {
    localStorage.setItem('syllabexa_onboarding_steps', JSON.stringify(checklist));
  }, [checklist]);

  const toggleStep = (stepKey: 'step1' | 'step2' | 'step3' | 'step4') => {
    setChecklist((prev: any) => {
      const next = { ...prev, [stepKey]: !prev[stepKey] };
      const completedCount = Object.values(next).filter(Boolean).length;
      if (completedCount === 4) {
        showToast('Congratulations! Onboarding completed successfully. Your publishing engine is fully primed.', 'success');
      }
      return next;
    });
  };

  const completedStepsCount = Object.values(checklist).filter(Boolean).length;
  const progressPercent = Math.round((completedStepsCount / 4) * 100);
  const projectProgressPercent = Math.round((velocityData.totalProjectWords / velocityData.targetProjectWords) * 100);
  const weeklyProgressPercent = Math.round((velocityData.weeklyWordCount / velocityData.weeklyGoal) * 100);

  
  const loadLaundromatManuscript = () => {
    const { loadSampleManuscript } = useManuscriptStore.getState();
    loadSampleManuscript(laundromatData.metadata as any, laundromatData.chapters as any);
    showToast('Loaded The Laundromat Doctrine successfully!', 'success');
    navigate('/app');
  };


  const handleOpenStudio = (view: string) => {
    if (onOpenStudio) {
      onOpenStudio(view);
    }
    if (view === 'quick-start') navigate('/app');
    else if (view === 'editor') navigate('/app/editor');
    else if (view === 'syllabexa-typesetter' || view === 'typesetter') navigate('/app/typesetter');
    else if (view === 'syllabexa-visual-studio' || view === 'visual-studio') navigate('/app/visual-studio');
    else if (view === 'course-workbook' || view === 'courses') navigate('/app/courses');
    else if (view === 'syllabexa-voice' || view === 'voice') navigate('/app/voice');
    else if (view === 'syllabexa-puzzle' || view === 'puzzles') navigate('/app/puzzles');
    else if (view === 'syllabexa-blog' || view === 'blogs') navigate('/app/blogs');
    else if (view === 'workspace') navigate('/app/workspace');
    else navigate('/app/' + view.replace('syllabexa-', ''));
  };

  const handleImportDraft = () => {
    if (onImportDraft) {
      onImportDraft();
    }
    window.dispatchEvent(new CustomEvent('syllabexa-import-draft'));
  };

  const handleStartNewProject = () => {
    if (onStartNewProject) {
      onStartNewProject();
    }
    navigate('/app/editor');
  };

  return (
    <div className="flex-1 bg-[#07080a] text-slate-200 overflow-y-auto p-6 md:p-12 select-none custom-scrollbar">
      <div className="max-w-6xl mx-auto space-y-12">
        
        {/* Dashboard Header - Telemetry */}
        <div className="flex items-center justify-end w-full">
          <AutonomousHealthBadge />
        </div>

        {/* Hero Welcome Banner */}
        <div className="relative overflow-hidden bg-gradient-to-br from-[#0c0e12] via-[#12151c] to-[#0c0e12] border border-slate-800/80 rounded-3xl p-8 md:p-12 shadow-2xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/5 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 space-y-4 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-600/10 border border-indigo-500/30 text-indigo-400 font-mono text-xs font-bold uppercase tracking-widest">
              <Sparkles size={12} className="animate-pulse" /> Syllabexa Enterprise Publishing
            </div>
            <h1 className="text-3xl md:text-5xl font-serif font-extrabold text-slate-100 tracking-tight">
              Publishing Command Center
            </h1>
            <p className="text-slate-400 font-sans text-sm md:text-base leading-relaxed">
              Architect neural prose, generate 300 DPI print-ready layouts, train custom voice narrators, or convert manuscripts into multi-channel digital publishing assets.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-4 font-mono">
              <button
                onClick={handleStartNewProject}
                className="px-6 py-3 bg-indigo-600 hover:bg-amber-400 text-slate-950 font-black uppercase text-xs tracking-wider rounded-2xl shadow-lg shadow-amber-500/20 transition-all cursor-pointer flex items-center gap-2"
              >
                <Feather size={14} /> Open Manuscript Writer
              </button>
              <button
                onClick={handleImportDraft}
                className="px-6 py-3 bg-[#161a26] hover:bg-[#20273a] text-slate-200 font-bold uppercase text-xs tracking-wider rounded-2xl border border-slate-800 hover:border-slate-700 transition-all cursor-pointer flex items-center gap-2"
              >
                <Upload size={14} className="text-indigo-400" /> Import Draft File (.docx/.md/.txt)
              </button>

              <button
                onClick={loadLaundromatManuscript}
                className="px-6 py-3 bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-400 font-bold uppercase text-xs tracking-wider rounded-2xl border border-emerald-500/30 transition-all cursor-pointer flex items-center gap-2"
              >
                <BookOpen size={14} /> Load Laundromat Doctrine
              </button>
            </div>
          </div>
        </div>

        {/* Writing Velocity & Progress Widget */}
        <div className="bg-[#0c0e12] border border-cyan-500/30 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6 mb-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-2xl text-cyan-400">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div>
                <div className="text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-widest">Real-time Telemetry</div>
                <h2 className="text-xl md:text-2xl font-serif font-bold text-white">Writing Velocity & Deadline Tracker</h2>
              </div>
            </div>
            
            <div className="flex items-center gap-3 bg-slate-900/80 border border-white/10 px-4 py-2.5 rounded-2xl">
              <Calendar className="w-4 h-4 text-amber-400" />
              <div className="text-xs font-mono">
                <span className="text-slate-400">Deadline Countdown:</span> <strong className="text-amber-300">{velocityData.deadlineDaysLeft} Days Remaining</strong>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Weekly Word Count Metric */}
            <div className="bg-slate-900/80 border border-white/10 rounded-2xl p-5 space-y-3 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">Weekly Word Output</span>
                <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">{weeklyProgressPercent}% of Goal</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-serif font-extrabold text-white">{velocityData.weeklyWordCount.toLocaleString()}</span>
                <span className="text-xs font-mono text-slate-400">/ {velocityData.weeklyGoal.toLocaleString()} words</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-gradient-to-r from-cyan-500 to-indigo-500 h-full rounded-full transition-all duration-500" style={{ width: `${Math.min(100, weeklyProgressPercent)}%` }} />
              </div>
            </div>

            {/* Total Project Progress Metric */}
            <div className="bg-slate-900/80 border border-white/10 rounded-2xl p-5 space-y-3 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">Manuscript Progress</span>
                <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">{projectProgressPercent}% Completed</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-serif font-extrabold text-white">{velocityData.totalProjectWords.toLocaleString()}</span>
                <span className="text-xs font-mono text-slate-400">/ {velocityData.targetProjectWords.toLocaleString()} words</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-gradient-to-r from-emerald-500 to-teal-500 h-full rounded-full transition-all duration-500" style={{ width: `${Math.min(100, projectProgressPercent)}%` }} />
              </div>
            </div>

            {/* Daily Streak & Velocity Rate */}
            <div className="bg-slate-900/80 border border-white/10 rounded-2xl p-5 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block mb-1">Consistency Streak</span>
                <div className="flex items-center gap-2">
                  <span className="text-3xl font-serif font-extrabold text-amber-400">{velocityData.dailyStreak} Days</span>
                  <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded font-bold">Active 🔥</span>
                </div>
              </div>
              <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs font-mono text-slate-400">
                <span>Avg. Speed:</span>
                <strong className="text-white">1,200 words / day</strong>
              </div>
            </div>

          </div>
        </div>

        {/* Theme Previewer Widget */}
        <div className="bg-[#0c0e12] border border-amber-500/30 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6 mb-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-amber-400">
                <Palette className="w-6 h-6" />
              </div>
              <div>
                <div className="text-[10px] font-mono text-amber-400 font-bold uppercase tracking-widest">Book Template Styles</div>
                <h2 className="text-xl md:text-2xl font-serif font-bold text-white">Live Manuscript Theme Previewer</h2>
              </div>
            </div>
            
            <div className="flex items-center gap-2 bg-slate-900/80 border border-white/10 p-1.5 rounded-2xl font-mono text-xs">
              {(['classic', 'bold', 'modern', 'minimalist'] as const).map(themeKey => (
                <button
                  key={themeKey}
                  onClick={() => setSelectedTheme(themeKey)}
                  className={`px-3 py-1.5 rounded-xl capitalize transition-all cursor-pointer ${selectedTheme === themeKey ? 'bg-amber-500 text-slate-950 font-bold shadow' : 'text-slate-400 hover:text-white'}`}
                >
                  {themeKey}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            
            {/* Theme Description & Specs */}
            <motion.div 
              key={selectedTheme + '-desc'}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="space-y-4"
            >
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/10 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono uppercase tracking-widest text-amber-400 font-bold">Active Template: <span className="capitalize">{selectedTheme}</span></span>
                  <span className="text-[10px] font-mono text-slate-400 bg-white/5 px-2 py-0.5 rounded">300 DPI Vector Ready</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed font-sans">
                  {selectedTheme === 'classic' && 'Timeless literary typesetting featuring Georgia serif fonts, warm cream pages, traditional first-line indents, and elegant running headers tailored for fiction and non-fiction publishing.'}
                  {selectedTheme === 'bold' && 'High-impact modern architectural layout featuring stark contrast, heavyweight sans headings, obsidian dark styling, and commanding visual authority for masterclasses and enterprise guides.'}
                  {selectedTheme === 'modern' && 'Sleek contemporary design utilizing Inter and clean neutral palettes, crisp geometric hierarchy, and refined margins for technical manuals and startup playbooks.'}
                  {selectedTheme === 'minimalist' && 'Ultra-clean whitespace-driven editorial layout with subtle typography pairing and zero clutter, designed for poetry, philosophy, and minimalist essays.'}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    showToast(`Template '${selectedTheme}' applied to Typesetter Simulator!`, 'success');
                    navigate('/app/typesetter');
                  }}
                  className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black font-mono text-xs rounded-xl transition-all shadow-lg shadow-amber-500/20 flex items-center gap-2 cursor-pointer"
                >
                  <Sparkles size={14} /> Apply Theme to Typesetter <ArrowRight size={14} />
                </button>
              </div>
            </motion.div>

            {/* Simulated Live Book Page Preview */}
            <div className="flex justify-center">
              <motion.div 
                key={selectedTheme + '-preview'}
                initial={{ opacity: 0, scale: 0.92, rotateY: 10 }}
                animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                exit={{ opacity: 0, scale: 0.92, rotateY: -10 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
                className={`w-[260px] h-[360px] rounded-xl shadow-2xl p-6 flex flex-col justify-between transition-colors duration-500 relative overflow-hidden border ${
                  selectedTheme === 'classic' ? 'bg-[#fbf9f5] text-[#2c2c2c] border-[#d8d4cb] font-serif' :
                  selectedTheme === 'bold' ? 'bg-zinc-950 text-white border-amber-500/40 font-sans' :
                  selectedTheme === 'modern' ? 'bg-slate-100 text-slate-900 border-slate-300 font-sans' :
                  'bg-white text-neutral-800 border-neutral-200 font-serif'
                }`}
              >
                {/* Running Header */}
                <div className={`text-[8px] uppercase tracking-[0.2em] text-center opacity-60 pb-2 border-b ${selectedTheme === 'bold' ? 'border-white/10' : 'border-black/10'}`}>
                  {selectedTheme === 'bold' ? 'ENTERPRISE ARCHITECTURE' : 'THE SOVEREIGN MASTERPIECE'}
                </div>

                {/* Page Body Content */}
                <div className="space-y-3 py-2 flex-1">
                  <div className="text-center space-y-1">
                    <span className="text-[9px] font-mono uppercase tracking-widest opacity-60 block">Chapter 1</span>
                    <h4 className={`text-sm font-bold ${selectedTheme === 'bold' ? 'text-amber-400' : ''}`}>The Foundations of Mastery</h4>
                  </div>
                  <p className="text-[10px] leading-relaxed opacity-90 line-clamp-5 indent-4">
                    True architectural excellence requires an uncompromising commitment to first principles. When building at enterprise scale, every subsystem must be rigorously validated against failure modes before deployment...
                  </p>
                </div>

                {/* Footer Folio */}
                <div className={`text-[9px] text-center opacity-60 pt-2 border-t ${selectedTheme === 'bold' ? 'border-white/10' : 'border-black/10'}`}>
                  1
                </div>
              </motion.div>
            </div>

          </div>
        </div>

        {/* Getting Started Interactive 4-Step Checklist */}
        <div className="bg-[#0c0e12] border border-indigo-500/30 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6 mb-6">
            <div>
              <div className="flex items-center gap-2 text-[10px] font-mono text-emerald-400 font-bold uppercase tracking-widest mb-1">
                <Wand2 size={12} /> Interactive Author Onboarding
              </div>
              <h2 className="text-xl md:text-2xl font-serif font-bold text-white">Getting Started: Initialize Your First Book</h2>
              <p className="text-xs text-slate-400 font-sans mt-1">Complete this 4-step checklist to configure your publishing pipeline and launch your first masterpiece.</p>
            </div>
            
            <div className="flex items-center gap-4 bg-slate-900/80 border border-white/10 px-4 py-3 rounded-2xl">
              <div className="text-right">
                <div className="text-xs font-mono text-slate-400">Progress</div>
                <div className="text-sm font-bold font-mono text-emerald-400">{completedStepsCount} / 4 Completed ({progressPercent}%)</div>
              </div>
              <div className="w-12 h-12 rounded-full border-4 border-slate-800 flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-emerald-500/20" style={{ clipPath: `polygon(0 100%, 100% 100%, 100% ${100 - progressPercent}%, 0 ${100 - progressPercent}%)` }} />
                <span className="text-xs font-bold font-mono text-emerald-300 relative z-10">{progressPercent}%</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Step 1 */}
            <div className={`p-5 rounded-2xl border transition-all flex items-start justify-between gap-4 ${checklist.step1 ? 'bg-emerald-500/5 border-emerald-500/30' : 'bg-slate-900/50 border-white/10 hover:border-slate-700'}`}>
              <div className="flex items-start gap-3.5">
                <button onClick={() => toggleStep('step1')} className="mt-0.5 text-slate-400 hover:text-emerald-400 transition-colors cursor-pointer shrink-0">
                  {checklist.step1 ? <CheckCircle2 className="w-6 h-6 text-emerald-400" /> : <Circle className="w-6 h-6 text-slate-600" />}
                </button>
                <div>
                  <div className="text-[10px] font-mono text-indigo-400 font-bold uppercase tracking-wider">Step 1 of 4</div>
                  <h4 className={`text-sm font-bold font-serif mt-0.5 ${checklist.step1 ? 'text-emerald-300 line-through opacity-80' : 'text-slate-200'}`}>Define Project & Premise</h4>
                  <p className="text-xs text-slate-400 font-sans mt-1 leading-relaxed">
                    Set your book title, genre, target audience, and high-converting commercial hook.
                  </p>
                </div>
              </div>
              <button 
                onClick={() => { toggleStep('step1'); handleStartNewProject(); }}
                className="px-3 py-1.5 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 rounded-xl font-mono text-xs font-bold transition-all cursor-pointer shrink-0 flex items-center gap-1"
              >
                <Play size={12} /> Launch
              </button>
            </div>

            {/* Step 2 */}
            <div className={`p-5 rounded-2xl border transition-all flex items-start justify-between gap-4 ${checklist.step2 ? 'bg-emerald-500/5 border-emerald-500/30' : 'bg-slate-900/50 border-white/10 hover:border-slate-700'}`}>
              <div className="flex items-start gap-3.5">
                <button onClick={() => toggleStep('step2')} className="mt-0.5 text-slate-400 hover:text-emerald-400 transition-colors cursor-pointer shrink-0">
                  {checklist.step2 ? <CheckCircle2 className="w-6 h-6 text-emerald-400" /> : <Circle className="w-6 h-6 text-slate-600" />}
                </button>
                <div>
                  <div className="text-[10px] font-mono text-indigo-400 font-bold uppercase tracking-wider">Step 2 of 4</div>
                  <h4 className={`text-sm font-bold font-serif mt-0.5 ${checklist.step2 ? 'text-emerald-300 line-through opacity-80' : 'text-slate-200'}`}>Train Voice & Tone Matrix</h4>
                  <p className="text-xs text-slate-400 font-sans mt-1 leading-relaxed">
                    Analyze stylistic fingerprints and vocabulary density in Voice Studio.
                  </p>
                </div>
              </div>
              <button 
                onClick={() => { toggleStep('step2'); handleOpenStudio('syllabexa-voice'); }}
                className="px-3 py-1.5 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 rounded-xl font-mono text-xs font-bold transition-all cursor-pointer shrink-0 flex items-center gap-1"
              >
                <Play size={12} /> Launch
              </button>
            </div>

            {/* Step 3 */}
            <div className={`p-5 rounded-2xl border transition-all flex items-start justify-between gap-4 ${checklist.step3 ? 'bg-emerald-500/5 border-emerald-500/30' : 'bg-slate-900/50 border-white/10 hover:border-slate-700'}`}>
              <div className="flex items-start gap-3.5">
                <button onClick={() => toggleStep('step3')} className="mt-0.5 text-slate-400 hover:text-emerald-400 transition-colors cursor-pointer shrink-0">
                  {checklist.step3 ? <CheckCircle2 className="w-6 h-6 text-emerald-400" /> : <Circle className="w-6 h-6 text-slate-600" />}
                </button>
                <div>
                  <div className="text-[10px] font-mono text-indigo-400 font-bold uppercase tracking-wider">Step 3 of 4</div>
                  <h4 className={`text-sm font-bold font-serif mt-0.5 ${checklist.step3 ? 'text-emerald-300 line-through opacity-80' : 'text-slate-200'}`}>Generate Outline & Chapter Beats</h4>
                  <p className="text-xs text-slate-400 font-sans mt-1 leading-relaxed">
                    Build multi-chapter 3-act beat sheets using the AI Orchestrator.
                  </p>
                </div>
              </div>
              <button 
                onClick={() => { toggleStep('step3'); handleOpenStudio('pipeline'); }}
                className="px-3 py-1.5 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 rounded-xl font-mono text-xs font-bold transition-all cursor-pointer shrink-0 flex items-center gap-1"
              >
                <Play size={12} /> Launch
              </button>
            </div>

            {/* Step 4 */}
            <div className={`p-5 rounded-2xl border transition-all flex items-start justify-between gap-4 ${checklist.step4 ? 'bg-emerald-500/5 border-emerald-500/30' : 'bg-slate-900/50 border-white/10 hover:border-slate-700'}`}>
              <div className="flex items-start gap-3.5">
                <button onClick={() => toggleStep('step4')} className="mt-0.5 text-slate-400 hover:text-emerald-400 transition-colors cursor-pointer shrink-0">
                  {checklist.step4 ? <CheckCircle2 className="w-6 h-6 text-emerald-400" /> : <Circle className="w-6 h-6 text-slate-600" />}
                </button>
                <div>
                  <div className="text-[10px] font-mono text-indigo-400 font-bold uppercase tracking-wider">Step 4 of 4</div>
                  <h4 className={`text-sm font-bold font-serif mt-0.5 ${checklist.step4 ? 'text-emerald-300 line-through opacity-80' : 'text-slate-200'}`}>Typeset & Verify ISBN Barcode</h4>
                  <p className="text-xs text-slate-400 font-sans mt-1 leading-relaxed">
                    Configure 300 DPI trim layout and verify EAN-13 checksums for KDP export.
                  </p>
                </div>
              </div>
              <button 
                onClick={() => { toggleStep('step4'); handleOpenStudio('syllabexa-typesetter'); }}
                className="px-3 py-1.5 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 rounded-xl font-mono text-xs font-bold transition-all cursor-pointer shrink-0 flex items-center gap-1"
              >
                <Play size={12} /> Launch
              </button>
            </div>

          </div>
        </div>

        {/* Feature Discoverability Cards Grid */}
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
            <div>
              <h2 className="text-lg font-bold font-serif text-slate-100">Primary Literary Publishing Pillars</h2>
              <p className="text-xs text-slate-500 font-mono uppercase tracking-wider">Enterprise Author & Manuscript Creation Engine</p>
            </div>
            <span className="text-xs font-mono text-indigo-400 bg-indigo-600/10 border border-indigo-500/20 px-3 py-1 rounded-xl">4 Core Pillars</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* 1. Manuscript Writer & Ghostwriter */}
            <motion.div
              whileHover={{ y: -4 }}
              transition={{ duration: 0.2 }}
              onClick={() => handleOpenStudio('editor')}
              className="bg-[#0c0e12] border border-amber-500/30 hover:border-amber-400 rounded-3xl p-6 md:p-8 flex flex-col justify-between shadow-2xl cursor-pointer group transition-all relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-600/10 rounded-bl-full pointer-events-none group-hover:bg-amber-600/20 transition-colors" />
              <div className="space-y-4 relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-inner group-hover:scale-110 transition-transform">
                  <Feather size={28} />
                </div>
                <div>
                  <div className="text-[10px] font-mono font-bold uppercase tracking-widest text-amber-400 mb-1">Interactive Canvas</div>
                  <h3 className="text-xl font-bold font-serif text-slate-100 group-hover:text-amber-300 transition-colors">Manuscript Writer</h3>
                  <p className="text-xs text-slate-400 font-sans leading-relaxed mt-2">
                    Rich Tiptap composition canvas with Agentic Co-Pilot, director beat-by-beat generation, prompt library, and live dictation speech engine.
                  </p>
                </div>
              </div>
              <div className="pt-8 flex items-center justify-between text-xs font-mono font-bold text-amber-400 relative z-10">
                <span>Open Writer</span>
                <ArrowRight size={16} className="group-hover:translate-x-1.5 transition-transform" />
              </div>
            </motion.div>

            {/* 2. Syllabexa Multi-Model AI Orchestrator */}
            <motion.div
              whileHover={{ y: -4 }}
              transition={{ duration: 0.2 }}
              onClick={() => handleOpenStudio('pipeline')}
              className="bg-[#0c0e12] border border-indigo-500/40 hover:border-indigo-400 rounded-3xl p-6 md:p-8 flex flex-col justify-between shadow-2xl cursor-pointer group transition-all relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/10 rounded-bl-full pointer-events-none group-hover:bg-indigo-600/20 transition-colors" />
              <div className="space-y-4 relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 shadow-inner group-hover:scale-110 transition-transform">
                  <Cpu size={28} />
                </div>
                <div>
                  <div className="text-[10px] font-mono font-bold uppercase tracking-widest text-indigo-400 mb-1">Automated 4-Agent Routing</div>
                  <h3 className="text-xl font-bold font-serif text-slate-100 group-hover:text-indigo-300 transition-colors">Multi-Model AI Orchestrator</h3>
                  <p className="text-xs text-slate-400 font-sans leading-relaxed mt-2">
                    Perplexity/Grok Web Grounding → GPT-4o Structural Outlining → Gemini 3.6 Long-Context Draft → Claude 3.5 Stylistic Polish.
                  </p>
                </div>
              </div>
              <div className="pt-8 flex items-center justify-between text-xs font-mono font-bold text-indigo-400 relative z-10">
                <span>Launch 4-Agent Pipeline</span>
                <ArrowRight size={16} className="group-hover:translate-x-1.5 transition-transform" />
              </div>
            </motion.div>

            {/* 3. Advanced Typesetting Card */}
            <motion.div
              whileHover={{ y: -4 }}
              transition={{ duration: 0.2 }}
              onClick={() => handleOpenStudio('syllabexa-typesetter')}
              className="bg-[#0c0e12] border border-slate-800 hover:border-indigo-500/50 rounded-3xl p-6 md:p-8 flex flex-col justify-between shadow-xl cursor-pointer group transition-all relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/5 rounded-bl-full pointer-events-none group-hover:bg-indigo-600/10 transition-colors" />
              <div className="space-y-4 relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-indigo-600/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shadow-inner group-hover:scale-110 transition-transform">
                  <BookOpen size={28} />
                </div>
                <div>
                  <div className="text-[10px] font-mono font-bold uppercase tracking-widest text-indigo-400/90 mb-1">Prepress Layout Engine</div>
                  <h3 className="text-xl font-bold font-serif text-slate-100 group-hover:text-amber-300 transition-colors">Typesetting Simulator</h3>
                  <p className="text-xs text-slate-400 font-sans leading-relaxed mt-2">
                    KDP 300 DPI print-ready facing-pages preview, baseline grid alignment, running headers, trim size selector, and EPUB exporter.
                  </p>
                </div>
              </div>
              <div className="pt-8 flex items-center justify-between text-xs font-mono font-bold text-indigo-400 relative z-10">
                <span>Launch Typesetter</span>
                <ArrowRight size={16} className="group-hover:translate-x-1.5 transition-transform" />
              </div>
            </motion.div>

            {/* 4. Voice Studio Card */}
            <motion.div
              whileHover={{ y: -4 }}
              transition={{ duration: 0.2 }}
              onClick={() => handleOpenStudio('syllabexa-voice')}
              className="bg-[#0c0e12] border border-amber-500/30 hover:border-amber-500 rounded-3xl p-6 md:p-8 flex flex-col justify-between shadow-2xl cursor-pointer group transition-all relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-600/10 rounded-bl-full pointer-events-none group-hover:bg-amber-600/20 transition-colors" />
              <div className="space-y-4 relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-inner group-hover:scale-110 transition-transform">
                  <Mic size={28} />
                </div>
                <div>
                  <div className="text-[10px] font-mono font-bold uppercase tracking-widest text-amber-400 mb-1">Audiobook Studio</div>
                  <h3 className="text-xl font-bold font-serif text-slate-100 group-hover:text-amber-300 transition-colors">Voice & Narration</h3>
                  <p className="text-xs text-slate-400 font-sans leading-relaxed mt-2">
                    Train custom author voice profiles, synthesize chapter narrations, extract style matrices, and generate audiobook audio assets.
                  </p>
                </div>
              </div>
              <div className="pt-8 flex items-center justify-between text-xs font-mono font-bold text-amber-400 relative z-10">
                <span>Launch Voice Studio</span>
                <ArrowRight size={16} className="group-hover:translate-x-1.5 transition-transform" />
              </div>
            </motion.div>

          </div>
        </div>

        {/* Companion Publishing & Character Extensions */}
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <div>
              <h3 className="text-sm font-bold font-serif text-slate-200">Companion Publishing & Character Engines</h3>
              <p className="text-[11px] text-slate-500 font-mono uppercase tracking-wider">Infinite Heroes Archetype Matrix, Educational Workbooks & Workspace Research Integration</p>
            </div>
            <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 rounded-lg">Author Matrix</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Infinite Heroes Engine */}
            <div 
              onClick={() => handleOpenStudio('syllabexa-bible')}
              className="bg-[#0c0e12] border border-amber-500/30 hover:border-amber-400 rounded-3xl p-6 flex flex-col justify-between gap-4 cursor-pointer group transition-all relative overflow-hidden shadow-xl"
            >
              <div className="flex items-start gap-4 relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 group-hover:scale-110 transition-transform">
                  <Sparkles size={22} />
                </div>
                <div>
                  <div className="text-[9px] font-mono font-bold uppercase tracking-widest text-amber-400">Character Matrix</div>
                  <h4 className="text-sm font-bold font-serif text-slate-200 group-hover:text-amber-300 transition-colors">Infinite Heroes Engine</h4>
                  <p className="text-xs text-slate-400 mt-1">Procedurally forge mythic heroes with fatal flaws, core desires, dialogue cadences, and Hero's Journey arc milestones.</p>
                </div>
              </div>
              <div className="flex items-center justify-between text-xs font-mono font-bold text-amber-400 pt-2 border-t border-white/5">
                <span>Forge Infinite Heroes</span>
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Course & Workbooks */}
            <div 
              onClick={() => handleOpenStudio('course-workbook')}
              className="bg-[#0c0e12] border border-emerald-500/30 hover:border-emerald-400 rounded-3xl p-6 flex flex-col justify-between gap-4 cursor-pointer group transition-all relative overflow-hidden shadow-xl"
            >
              <div className="flex items-start gap-4 relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 group-hover:scale-110 transition-transform">
                  <GraduationCap size={22} />
                </div>
                <div>
                  <div className="text-[9px] font-mono font-bold uppercase tracking-widest text-emerald-400">Educational Extension</div>
                  <h4 className="text-sm font-bold font-serif text-slate-200 group-hover:text-emerald-300 transition-colors">Course & Student Workbooks</h4>
                  <p className="text-xs text-slate-400 mt-1">Extract manuscript chapters into structured lesson plans, quizzes, and student workbooks.</p>
                </div>
              </div>
              <div className="flex items-center justify-between text-xs font-mono font-bold text-emerald-400 pt-2 border-t border-white/5">
                <span>Convert to Workbook</span>
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Google Workspace */}
            <div 
              onClick={() => handleOpenStudio('workspace')}
              className="bg-[#0c0e12] border border-slate-800 hover:border-indigo-500/40 rounded-3xl p-6 flex flex-col justify-between gap-4 cursor-pointer group transition-all shadow-xl"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0 group-hover:scale-110 transition-transform">
                  <Globe size={22} />
                </div>
                <div>
                  <div className="text-[9px] font-mono font-bold uppercase tracking-widest text-indigo-400">Research Ecosystem</div>
                  <h4 className="text-sm font-bold text-slate-200 group-hover:text-indigo-300 transition-colors">Google Workspace Hub</h4>
                  <p className="text-xs text-slate-400 mt-1">Sync manuscript research notes with Google Keep, Drive, Sheets, and Classroom.</p>
                </div>
              </div>
              <div className="flex items-center justify-between text-xs font-mono font-bold text-indigo-400 pt-2 border-t border-white/5">
                <span>Sync Research Notes</span>
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Automated Marketing Engine */}
            <div 
              onClick={() => handleOpenStudio('marketing-engine')}
              className="bg-[#0c0e12] border border-purple-500/30 hover:border-purple-400 rounded-3xl p-6 flex flex-col justify-between gap-4 cursor-pointer group transition-all relative overflow-hidden shadow-xl"
            >
              <div className="flex items-start gap-4 relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0 group-hover:scale-110 transition-transform">
                  <Share2 size={22} />
                </div>
                <div>
                  <div className="text-[9px] font-mono font-bold uppercase tracking-widest text-purple-400">Content Engine</div>
                  <h4 className="text-sm font-bold font-serif text-slate-200 group-hover:text-purple-300 transition-colors">Automated Marketing</h4>
                  <p className="text-xs text-slate-400 mt-1">Extract press kits, quote cards, emails & AEO/SEO-optimized blog posts straight from context.</p>
                </div>
              </div>
              <div className="flex items-center justify-between text-xs font-mono font-bold text-purple-400 pt-2 border-t border-white/5">
                <span>Generate Marketing Assets</span>
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Book Theme & Visual Asset Builder */}
            <div 
              onClick={() => handleOpenStudio('theme-builder')}
              className="bg-[#0c0e12] border border-amber-500/30 hover:border-amber-400 rounded-3xl p-6 flex flex-col justify-between gap-4 cursor-pointer group transition-all relative overflow-hidden shadow-xl"
            >
              <div className="flex items-start gap-4 relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 group-hover:scale-110 transition-transform">
                  <Palette size={22} />
                </div>
                <div>
                  <div className="text-[9px] font-mono font-bold uppercase tracking-widest text-amber-400">Design Studio</div>
                  <h4 className="text-sm font-bold font-serif text-slate-200 group-hover:text-amber-300 transition-colors">Theme & Visual Builder</h4>
                  <p className="text-xs text-slate-400 mt-1">Customize book fonts, chapter ornaments, Tenor icons, AI image generation, placement & background removal.</p>
                </div>
              </div>
              <div className="flex items-center justify-between text-xs font-mono font-bold text-amber-400 pt-2 border-t border-white/5">
                <span>Open Theme Studio</span>
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}