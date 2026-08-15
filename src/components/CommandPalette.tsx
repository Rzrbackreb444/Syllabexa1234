import React, { useEffect, useState } from 'react';
import { Search, Cpu, BookOpen, Library, Rocket, DollarSign } from 'lucide-react';

export default function CommandPalette({ isOpen, onClose, onNavigate }: { isOpen: boolean; onClose: () => void; onNavigate: (path: string) => void }) {
  const [query, setQuery] = useState('');

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const commands = [
    { name: "VoiceAI: Syntactic Matrix Profiler", path: "/app/voice", icon: <Cpu size={14} className="text-cyan-400" /> },
    { name: "BookAI: Autonomous Manuscript Engine", path: "/app/book", icon: <BookOpen size={14} className="text-cyan-400" /> },
    { name: "CodexAI: 35-Appendix Builder", path: "/app/codex", icon: <Library size={14} className="text-cyan-400" /> },
    { name: "LaunchAI: Distribution & Funnels", path: "/app/launch", icon: <Rocket size={14} className="text-cyan-400" /> },
    { name: "Billing & Plans", path: "/app/billing", icon: <DollarSign size={14} className="text-cyan-400" /> },
    { name: "Syllabexa Core Typesetting Engine", path: "/app/editor", icon: <BookOpen size={14} className="text-cyan-400" /> },
  ];

  const filtered = commands.filter(c => c.name.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-start justify-center pt-24 px-4">
      {/* Click outside to close */}
      <div className="absolute inset-0" onClick={onClose} />
      
      <div className="w-full max-w-xl bg-[#08080a] border border-slate-700 shadow-2xl overflow-hidden rounded-sm relative z-10">
        <div className="p-4 border-b border-slate-800 flex items-center gap-3">
          <Search size={16} className="text-slate-500" />
          <input 
            type="text" 
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command or search modules (Cmd + K)..." 
            className="w-full bg-transparent text-sm font-mono text-white focus:outline-none placeholder-slate-600"
          />
        </div>
        <div className="p-2 space-y-1">
          {filtered.map((cmd, idx) => (
            <div 
              key={idx}
              onClick={() => { onNavigate(cmd.path); onClose(); }}
              className="flex items-center gap-3 p-3 hover:bg-cyan-950/30 cursor-pointer text-xs font-mono text-slate-300 hover:text-cyan-400 transition-colors border border-transparent hover:border-cyan-900/40 rounded-sm"
            >
              {cmd.icon}
              <span>{cmd.name}</span>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="p-4 text-center text-xs font-mono text-slate-500">
              No commands found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
