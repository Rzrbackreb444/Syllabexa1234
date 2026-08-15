import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, Bot, User, Cpu, ArrowRight } from 'lucide-react';
import { useManuscriptStore } from '../store/manuscriptStore';
import { useBibleStore } from '../store/bibleStore';
import { useToast } from '../lib/ToastContext';

interface Message {
  role: 'assistant' | 'user';
  content: string;
}

export default function VisionStudio({ onCompilationComplete }: { onCompilationComplete: () => void }) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Hello! I am your Syllabexa Developmental Partner. Let's talk your book into existence. What is the core premise, topic, or story you want to publish today?"
    }
  ]);
  const [input, setInput] = useState('');
  const [isCompiling, setIsCompiling] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const updateProjectMeta = useManuscriptStore((state) => state.updateProjectMeta);
  const addChapter = useManuscriptStore((state) => state.addChapter);
  const addCharacter = useBibleStore((state) => state.addCharacter);
  const { showToast } = useToast();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isCompiling) return;

    const userText = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: userText }]);

    // Simulated responsive intelligence loop (In production, wire to your Gemini API client)
    setIsCompiling(true);
    setTimeout(() => {
      let reply = "";
      
      if (messages.length < 3) {
        reply = "That is a powerful premise. Let's drill down deeper: Who is your primary target reader, and what key framework or breakthrough concept should form the anchor of Chapter 1?";
      } else if (messages.length < 5) {
        reply = "Got it. I'm noting down your tone preferences, structural milestones, and technical vocabulary. Are you ready for me to compile this conversation into a fully structured Manuscript AST and typeset it?";
      } else {
        reply = "Compilation sequence initiated. Assembling your chapters, formatting tables, and generating prepress layout rules...";
        triggerCompilation();
        return;
      }

      setMessages((prev) => [...prev, { role: 'assistant', content: reply }]);
      setIsCompiling(false);
    }, 1000);
  };

  const triggerCompilation = () => {
    setIsCompiling(true);
    setTimeout(() => {
      // Hydrate Zustand store with the compiled book vision
      updateProjectMeta({
        title: "The Automated Operator's Playbook",
        author: "Syllabexa Author",
        trimSize: "6x9",
      });

      addChapter({
        id: `chap-${Date.now()}-1`,
        title: "Chapter 1: The Core Premise & Architecture",
        content: "<p>Every scalable enterprise begins with rigorous standard operating procedures. When you map out your framework cleanly, execution follows naturally.</p><p>This chapter establishes the baseline diagnostics required to eliminate friction, scale operations, and automate your workflow from end to end.</p>"
      });

      addChapter({
        id: `chap-${Date.now()}-2`,
        title: "Chapter 2: Scaling Systems and Execution",
        content: "<p>With foundational protocols locked in, growth transitions from a guessing game into a predictable mechanical process.</p><p>Leverage automated tools, data-driven frameworks, and clean documentation to ensure your ecosystem runs smoothly without constant manual oversight.</p>"
      });

      addCharacter({
        name: "Lead Operator",
        role: "protagonist",
        traits: ["Methodical", "System-focused", "Decisive"],
        backstory: "Years of hard-won field experience distilled into actionable operational frameworks.",
        appearance: "Practical, focused, execution-driven.",
        arc: "Builds a self-sustaining operational powerhouse.",
        notes: "Central narrative anchor."
      });

      showToast("Book successfully compiled from vision to AST! Launching typesetter...", "success");
      setIsCompiling(false);
      onCompilationComplete();
    }, 2000);
  };

  return (
    <aside aria-label="Vision Studio" className="flex-1 bg-[#0a0a0c] flex flex-col h-full font-sans overflow-hidden select-none relative z-0">
      
      {/* Top Header */}
      <div className="h-14 bg-[#0c0e12] border-b border-slate-800/80 px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <Sparkles size={16} className="text-amber-400 animate-pulse" />
          <h2 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-widest">
            Vision Room: Conversational Book Factory
          </h2>
        </div>

        <button
          type="button"
          onClick={triggerCompilation}
          disabled={isCompiling}
          className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-mono text-xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-lg shadow-amber-500/20 disabled:opacity-50"
        >
          <Cpu size={14} />
          <span>Compile & Typeset Now</span>
          <ArrowRight size={14} />
        </button>
      </div>

      {/* Chat Stream Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 max-w-3xl mx-auto w-full custom-scrollbar">
        {messages.map((m, idx) => (
          <div key={idx} className={`flex items-start gap-3.5 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border ${m.role === 'user' ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' : 'bg-amber-950/40 border-amber-500/30 text-amber-400'}`}>
              {m.role === 'user' ? <User size={16} /> : <Bot size={16} />}
            </div>
            <div className={`max-w-xl p-4 rounded-2xl text-xs sm:text-sm leading-relaxed font-sans border ${m.role === 'user' ? 'bg-[#12151c] border-slate-800 text-slate-200' : 'bg-[#0f1118] border-amber-500/20 text-slate-300'}`}>
              {m.content}
            </div>
          </div>
        ))}
        {isCompiling && (
          <div className="flex items-center gap-3 text-xs font-mono text-amber-400 animate-pulse p-4">
            <Cpu size={16} />
            <span>Compiling conversation transcript into manuscript AST and 300 DPI layout nodes...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Bottom Input Form */}
      <div className="p-4 bg-[#0c0e12] border-t border-slate-800 shrink-0">
        <form onSubmit={handleSend} className="max-w-3xl mx-auto flex gap-3">
          <input
            type="text"
            placeholder="Talk about your book, chapter ideas, or requested tables/callouts..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isCompiling}
            className="flex-1 bg-[#12151c] border border-slate-800 focus:border-amber-500 rounded-2xl px-5 py-3.5 text-xs sm:text-sm text-slate-200 focus:outline-none transition-all"
          />
          <button
            type="submit"
            disabled={isCompiling || !input.trim()}
            className="px-6 py-3.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-mono text-xs font-black uppercase tracking-wider rounded-2xl transition-all cursor-pointer flex items-center gap-2"
          >
            <span>Send</span>
            <Send size={14} />
          </button>
        </form>
      </div>

    </aside>
  );
}