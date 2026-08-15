import React from 'react';
import { BookOpen, Feather, LayoutGrid, Globe, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';

interface PublishingFunnelProps {
  currentView: string;
  onNavigate: (view: string) => void;
}

export default function PublishingFunnel({ currentView, onNavigate }: PublishingFunnelProps) {
  const steps = [
    { id: 'syllabexa-bible', label: '1. Blueprint', icon: BookOpen, desc: 'Story Bible' },
    { id: 'editor', label: '2. Draft', icon: Feather, desc: 'Manuscript' },
    { id: 'syllabexa-typesetter', label: '3. Typeset', icon: LayoutGrid, desc: 'Formatting' },
    { id: 'syllabexa-distribution', label: '4. Distribute', icon: Globe, desc: 'Export' }
  ];

  const currentIndex = steps.findIndex(s => s.id === currentView);

  return (
    <nav aria-label="Publishing Funnel" className="flex items-center gap-1 md:gap-2 px-2 md:px-4 py-1.5 bg-[#0c0e12]/90 rounded-2xl border border-slate-800 shadow-inner overflow-x-auto custom-scrollbar">
      {steps.map((step, index) => {
        const isActive = step.id === currentView;
        const isPast = currentIndex > index;
        const Icon = step.icon;

        return (
          <React.Fragment key={step.id}>
            <button
              onClick={() => onNavigate(step.id)}
              className={`relative flex flex-col md:flex-row items-center gap-1 md:gap-2 px-2.5 md:px-3.5 py-1 md:py-1.5 rounded-xl transition-all cursor-pointer ${
                isActive
                  ? 'bg-amber-500/10 text-amber-400 font-bold border border-amber-500/30 shadow-sm'
                  : isPast
                  ? 'text-slate-400 hover:text-slate-200 hover:bg-[#12151c]'
                  : 'text-slate-600 hover:text-slate-400 hover:bg-[#12151c]'
              }`}
              title={step.desc}
            >
              <div className="relative">
                <Icon size={14} className={isActive ? 'text-amber-400' : isPast ? 'text-slate-400' : 'text-slate-600'} />
                {isActive && (
                  <motion.div
                    layoutId="funnel-active-glow"
                    className="absolute inset-0 bg-amber-500/20 blur-md rounded-full"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </div>
              <span className="text-[9px] md:text-xs font-mono uppercase tracking-wider hidden sm:block whitespace-nowrap">
                {step.label}
              </span>
              
              {isActive && (
                <motion.div
                  layoutId="funnel-active-bg"
                  className="absolute inset-0 border-b-2 border-amber-400 rounded-xl"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
            </button>

            {index < steps.length - 1 && (
              <div className="text-slate-700 hidden sm:block">
                <ChevronRight size={12} />
              </div>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}