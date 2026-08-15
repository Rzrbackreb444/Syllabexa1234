import React, { useState } from 'react';
import { ListTree, ChevronRight, Hash, Compass, X } from 'lucide-react';

interface ChapterNavigatorProps {
  content: string;
  onJumpToHeading: (headingText: string) => void;
}

export default function ChapterNavigator({ content, onJumpToHeading }: ChapterNavigatorProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Extract H1 and H2 headers
  const lines = content.split('\n');
  const headings: { level: number; text: string; lineIndex: number }[] = [];

  lines.forEach((line, idx) => {
    const trimmed = line.trim();
    if (trimmed.startsWith('# ')) {
      headings.push({ level: 1, text: trimmed.replace(/^#\s+/, ''), lineIndex: idx });
    } else if (trimmed.startsWith('## ')) {
      headings.push({ level: 2, text: trimmed.replace(/^##\s+/, ''), lineIndex: idx });
    }
  });

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="px-3 py-1.5 bg-slate-900 border border-slate-800 hover:border-amber-500 text-slate-300 hover:text-amber-400 rounded-lg text-xs font-mono flex items-center gap-1.5 transition-all cursor-pointer"
        title="Chapter & Heading Navigator"
      >
        <ListTree size={14} className="text-amber-400" />
        <span>Outline ({headings.length})</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-[#0c0e12] border border-slate-800 rounded-2xl shadow-2xl z-[100] p-4 font-sans animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
            <div className="flex items-center gap-2">
              <Compass size={14} className="text-amber-400" />
              <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">Manuscript Navigator</span>
            </div>
            <button onClick={() => setIsOpen(false)} className="p-1 text-slate-500 hover:text-white rounded-md cursor-pointer">
              <X size={14} />
            </button>
          </div>

          <div className="max-h-64 overflow-y-auto space-y-1 custom-scrollbar pr-1">
            {headings.length === 0 ? (
              <div className="text-xs text-slate-500 italic py-4 text-center">No H1 (#) or H2 (##) headings found in current text.</div>
            ) : (
              headings.map((h, i) => (
                <button
                  key={i}
                  onClick={() => {
                    onJumpToHeading(h.text);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-2.5 py-2 rounded-xl text-xs transition-all flex items-center gap-2 cursor-pointer group ${
                    h.level === 1 
                      ? 'font-bold text-white bg-slate-900 hover:bg-slate-800 border border-slate-800' 
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 pl-5'
                  }`}
                >
                  <Hash size={12} className={h.level === 1 ? 'text-amber-400 shrink-0' : 'text-slate-600 shrink-0 group-hover:text-slate-400'} />
                  <span className="truncate">{h.text}</span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
