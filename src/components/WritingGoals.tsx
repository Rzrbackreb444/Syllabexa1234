import React, { useState } from 'react';
import { Target, Flame, Edit3, CheckCircle2, Trophy, Sparkles, X, Plus } from 'lucide-react';
import { useManuscriptStore } from '../store/manuscriptStore';
import { useToast } from '../lib/ToastContext';

export default function WritingGoals() {
  const writingGoals = useManuscriptStore((state) => state.writingGoals);
  const updateWritingGoals = useManuscriptStore((state) => state.updateWritingGoals);
  const chapters = useManuscriptStore((state) => state.chapters);
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<'daily' | 'weekly' | 'project'>('daily');
  const [isEditing, setIsEditing] = useState(false);
  const [tempDaily, setTempDaily] = useState(writingGoals.dailyGoal.toString());
  const [tempWeekly, setTempWeekly] = useState(writingGoals.weeklyGoal.toString());
  const [tempProject, setTempProject] = useState(writingGoals.projectGoal.toString());

  // Calculate total project word count dynamically from chapters
  const totalProjectWords = chapters.reduce((acc, c) => {
    if (!c.content) return acc;
    const plain = c.content.replace(/<[^>]*>/g, '');
    return acc + (plain.trim() ? plain.trim().split(/\s+/).length : 0);
  }, 0);

  // Determine current stats based on active tab
  let currentVal = 0;
  let targetVal = 0;
  let label = '';
  let colorClass = '';
  let strokeColor = '';

  if (activeTab === 'daily') {
    currentVal = writingGoals.todayCount;
    targetVal = writingGoals.dailyGoal;
    label = 'Daily Goal';
    colorClass = 'text-amber-400';
    strokeColor = '#fbbf24';
  } else if (activeTab === 'weekly') {
    currentVal = writingGoals.weeklyCount;
    targetVal = writingGoals.weeklyGoal;
    label = 'Weekly Goal';
    colorClass = 'text-cyan-400';
    strokeColor = '#22d3ee';
  } else {
    currentVal = totalProjectWords;
    targetVal = writingGoals.projectGoal;
    label = 'Project Goal';
    colorClass = 'text-emerald-400';
    strokeColor = '#34d399';
  }

  const percentage = Math.min(100, Math.round((currentVal / Math.max(1, targetVal)) * 100));

  // SVG Circular progress math
  const radius = 32;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const handleSaveGoals = (e: React.FormEvent) => {
    e.preventDefault();
    updateWritingGoals({
      dailyGoal: parseInt(tempDaily) || 1000,
      weeklyGoal: parseInt(tempWeekly) || 5000,
      projectGoal: parseInt(tempProject) || 50000,
    });
    setIsEditing(false);
    showToast('Writing goals successfully updated!', 'success');
  };

  return (
    <div className="bg-[#12151c] border border-slate-800 rounded-2xl p-4 shadow-xl space-y-4 font-sans select-none">
      
      {/* Header & Streak */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Target size={14} />
          </div>
          <div>
            <h3 className="text-[11px] font-mono font-bold text-slate-200 uppercase tracking-wider">Writing Targets</h3>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-orange-500/10 border border-orange-500/20 text-orange-400 text-[10px] font-mono font-bold" title="Writing Streak">
            <Flame size={12} className="fill-orange-400 animate-pulse" />
            <span>{writingGoals.streakDays}d Streak</span>
          </div>
          <button 
            onClick={() => setIsEditing(true)} 
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all cursor-pointer"
            title="Edit Goals"
          >
            <Edit3 size={12} />
          </button>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="grid grid-cols-3 gap-1 bg-black/40 p-1 rounded-xl border border-slate-800/80">
        {(['daily', 'weekly', 'project'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`py-1 text-[10px] font-mono uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
              activeTab === tab 
                ? 'bg-slate-800 text-white font-bold shadow-sm' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Circular Progress & Stats */}
      <div className="flex items-center gap-4 py-2">
        <div className="relative w-20 h-20 flex items-center justify-center flex-shrink-0">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 80 80">
            <circle
              cx="40"
              cy="40"
              r={radius}
              stroke="currentColor"
              strokeWidth="6"
              className="text-slate-800"
              fill="transparent"
            />
            <circle
              cx="40"
              cy="40"
              r={radius}
              stroke={strokeColor}
              strokeWidth="6"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-700 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-xs font-bold text-white">{percentage}%</span>
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="text-[10px] font-mono text-slate-400 uppercase tracking-widest mb-0.5">{label}</div>
          <div className="text-base font-bold text-white tracking-tight">
            {currentVal.toLocaleString()} <span className="text-xs font-normal text-slate-500">/ {targetVal.toLocaleString()}</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1.5">
            {percentage >= 100 ? (
              <span className="text-emerald-400 font-medium flex items-center gap-1"><CheckCircle2 size={12} /> Target Reached!</span>
            ) : (
              <span>{(targetVal - currentVal).toLocaleString()} words remaining</span>
            )}
          </div>
        </div>
      </div>

      {/* Edit Modal Popup */}
      {isEditing && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[110] flex items-center justify-center p-4 font-sans select-none animate-in fade-in">
          <div className="absolute inset-0" onClick={() => setIsEditing(false)} />
          
          <div className="w-full max-w-md bg-[#0c0e12] border border-slate-800 rounded-3xl p-6 relative z-10 shadow-2xl space-y-5">
            <div className="flex justify-between items-center pb-3 border-b border-slate-800">
              <h4 className="text-xs font-mono font-bold text-white uppercase tracking-widest flex items-center gap-2">
                <Target size={16} className="text-amber-400" /> Configure Writing Targets
              </h4>
              <button onClick={() => setIsEditing(false)} className="p-1.5 text-slate-500 hover:text-white rounded-lg cursor-pointer">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveGoals} className="space-y-4">
              <div>
                <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">Daily Word Count Target</label>
                <input 
                  type="number"
                  value={tempDaily}
                  onChange={(e) => setTempDaily(e.target.value)}
                  className="w-full bg-[#141820] border border-slate-700 rounded-xl px-4 py-2.5 text-sm font-mono text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">Weekly Word Count Target</label>
                <input 
                  type="number"
                  value={tempWeekly}
                  onChange={(e) => setTempWeekly(e.target.value)}
                  className="w-full bg-[#141820] border border-slate-700 rounded-xl px-4 py-2.5 text-sm font-mono text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">Full Project Goal</label>
                <input 
                  type="number"
                  value={tempProject}
                  onChange={(e) => setTempProject(e.target.value)}
                  className="w-full bg-[#141820] border border-slate-700 rounded-xl px-4 py-2.5 text-sm font-mono text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button 
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 rounded-xl border border-slate-800 text-slate-400 font-mono text-xs hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-mono text-xs font-black uppercase tracking-wider cursor-pointer shadow-lg shadow-amber-500/20"
                >
                  Save Targets
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
