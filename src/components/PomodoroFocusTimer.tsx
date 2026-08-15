import React, { useState, useEffect } from 'react';
import { Timer, Play, Pause, RotateCcw, Flame, CheckCircle2 } from 'lucide-react';
import { useToast } from '../lib/ToastContext';

export default function PomodoroFocusTimer() {
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<'work' | 'break'>('work');
  const [sprintsCompleted, setSprintsCompleted] = useState(0);
  const { showToast } = useToast();

  useEffect(() => {
    let interval: any = null;

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      if (mode === 'work') {
        setSprintsCompleted(prev => prev + 1);
        showToast('Pomodoro sprint complete! Take a 5-minute breather.', 'success');
        setMode('break');
        setTimeLeft(5 * 60);
      } else {
        showToast('Break over! Ready for the next deep writing sprint.', 'info');
        setMode('work');
        setTimeLeft(25 * 60);
      }
    }

    return () => clearInterval(interval);
  }, [isActive, timeLeft, mode, showToast]);

  const toggleTimer = () => {
    setIsActive(!isActive);
    if (!isActive) {
      showToast(`Started ${mode === 'work' ? '25-min writing sprint' : '5-min break'}`, 'info');
    }
  };

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(mode === 'work' ? 25 * 60 : 5 * 60);
    showToast('Timer reset.', 'info');
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  
  const totalDuration = mode === 'work' ? 25 * 60 : 5 * 60;
  const progressPercent = Math.round(((totalDuration - timeLeft) / totalDuration) * 100);

  return (
    <div className="bg-[#12151c] border border-slate-800 rounded-2xl p-3 shadow-xl flex items-center justify-between gap-4 font-sans select-none">
      <div className="flex items-center gap-3 min-w-0">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center border ${
          mode === 'work' ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' : 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400'
        }`}>
          <Timer size={18} className={isActive ? 'animate-spin' : ''} />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
              {mode === 'work' ? 'Writing Sprint' : 'Rest Break'}
            </span>
            <span className="px-1.5 py-0.5 rounded bg-black/60 text-[10px] font-mono text-slate-400 border border-slate-800">
              #{sprintsCompleted + 1}
            </span>
          </div>
          <div className="text-lg font-mono font-black text-amber-400 tracking-tight">
            {formattedTime}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="w-16 bg-slate-800 h-1.5 rounded-full overflow-hidden hidden sm:block">
          <div 
            className={`h-full transition-all duration-500 ${mode === 'work' ? 'bg-amber-400' : 'bg-cyan-400'}`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <button 
          onClick={toggleTimer}
          className={`p-2 rounded-xl border flex items-center justify-center transition-all cursor-pointer ${
            isActive 
              ? 'bg-amber-500/20 border-amber-500 text-amber-400 hover:bg-amber-500/30' 
              : 'bg-amber-500 hover:bg-amber-400 border-amber-400 text-slate-950 font-bold shadow-md shadow-amber-500/20'
          }`}
          title={isActive ? 'Pause Sprint' : 'Start Sprint'}
        >
          {isActive ? <Pause size={14} /> : <Play size={14} className="fill-current" />}
        </button>

        <button 
          onClick={resetTimer}
          className="p-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-400 hover:text-white rounded-xl transition-all cursor-pointer"
          title="Reset Timer"
        >
          <RotateCcw size={14} />
        </button>
      </div>
    </div>
  );
}
