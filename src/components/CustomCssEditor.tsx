import React, { useState } from 'react';
import { Code, Sparkles, Check, RotateCcw, Copy, X, Terminal, ShieldCheck } from 'lucide-react';
import { useManuscriptStore } from '../store/manuscriptStore';
import { useToast } from '../lib/ToastContext';

interface CustomCssEditorProps {
  onClose?: () => void;
}

export default function CustomCssEditor({ onClose }: CustomCssEditorProps) {
  const prepressRules = useManuscriptStore(state => state.prepressRules);
  const updatePrepressRules = useManuscriptStore(state => state.updatePrepressRules);
  const [cssCode, setCssCode] = useState<string>(
    prepressRules.customCss || 
    `/* Syllabexa Custom Typography & Layout Overrides */\nbody {\n  letter-spacing: 0.01em;\n}\n\n.chapter-heading {\n  text-transform: uppercase;\n  letter-spacing: 0.15em;\n  color: #f59e0b;\n}\n\nblockquote {\n  border-left: 4px solid #f59e0b;\n  padding-left: 1rem;\n  font-style: italic;\n}`
  );
  const [copied, setCopied] = useState(false);
  const { showToast } = useToast();

  const handleSave = () => {
    updatePrepressRules({ customCss: cssCode });
    // Also inject into document head as a dynamic style tag for live preview!
    let styleEl = document.getElementById('syllabexa-custom-user-css') as HTMLStyleElement;
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = 'syllabexa-custom-user-css';
      document.head.appendChild(styleEl);
    }
    styleEl.textContent = cssCode;

    showToast('Custom CSS overrides compiled and applied successfully.', 'success');
  };

  const handleReset = () => {
    const defaultCss = `/* Syllabexa Custom Typography & Layout Overrides */\nbody {\n  letter-spacing: 0.01em;\n}`;
    setCssCode(defaultCss);
    updatePrepressRules({ customCss: defaultCss });
    showToast('Custom CSS reset to default.', 'info');
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(cssCode);
    setCopied(true);
    showToast('CSS copied to clipboard.', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-[#0c0e12] border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6 font-sans select-none relative z-0">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.15)]">
            <Code size={20} />
          </div>
          <div>
            <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-slate-100 flex items-center gap-2">
              <span>Custom CSS & Layout Overrides</span>
              <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-400 text-[9px] border border-cyan-500/30">ADVANCED STUDIO</span>
            </h3>
            <p className="text-[10px] text-slate-400 font-mono mt-0.5">
              Inject custom CSS rule sets for precision typography, headings, blockquotes, and PDF/EPUB typesetting.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded-xl text-xs font-mono flex items-center gap-1.5 transition-all cursor-pointer"
            title="Reset to default CSS"
          >
            <RotateCcw size={14} />
            <span>Reset</span>
          </button>
          <button
            onClick={handleCopy}
            className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded-xl text-xs font-mono flex items-center gap-1.5 transition-all cursor-pointer"
          >
            {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-black rounded-xl text-xs font-mono uppercase tracking-wider shadow-[0_0_15px_rgba(6,182,212,0.2)] transition-all cursor-pointer flex items-center gap-2"
          >
            <Check size={14} /> Save & Compile
          </button>
          {onClose && (
            <button onClick={onClose} className="p-2 text-slate-500 hover:text-white rounded-xl cursor-pointer">
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span className="flex items-center gap-1.5"><Terminal size={14} className="text-cyan-400" /> stylesheet.css</span>
            <span className="text-[10px] text-emerald-400 flex items-center gap-1"><ShieldCheck size={12} /> Live Sandbox Injection Active</span>
          </div>
          <div className="bg-[#050508] border border-slate-800 rounded-2xl overflow-hidden shadow-inner">
            <textarea
              value={cssCode}
              onChange={(e) => setCssCode(e.target.value)}
              rows={16}
              className="w-full bg-transparent p-4 font-mono text-xs text-cyan-200 leading-relaxed focus:outline-none resize-none custom-scrollbar"
              placeholder="Enter custom CSS rules..."
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 space-y-3">
            <div className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Sparkles size={14} className="text-cyan-400" />
              <span>CSS Snippets & Macros</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Click any snippet below to instantly append standard publishing CSS overrides to your stylesheet editor.
            </p>
            <div className="space-y-2 pt-1">
              <button
                onClick={() => setCssCode(prev => prev + '\n\n/* Drop Cap Stylist */\np:first-of-type::first-letter {\n  font-size: 3.5rem;\n  float: left;\n  line-height: 0.8;\n  margin-right: 0.5rem;\n  color: #06b6d4;\n}')}
                className="w-full text-left bg-black/40 hover:bg-black/80 border border-slate-800 p-2.5 rounded-xl text-xs font-mono text-slate-300 transition-all cursor-pointer flex items-center justify-between"
              >
                <span>Drop Cap First Letter</span>
                <span className="text-[10px] text-cyan-400">+ Insert</span>
              </button>
              <button
                onClick={() => setCssCode(prev => prev + '\n\n/* Custom Section Divider */\nhr {\n  border: none;\n  height: 1px;\n  background: linear-gradient(to right, transparent, #06b6d4, transparent);\n  margin: 2rem 0;\n}')}
                className="w-full text-left bg-black/40 hover:bg-black/80 border border-slate-800 p-2.5 rounded-xl text-xs font-mono text-slate-300 transition-all cursor-pointer flex items-center justify-between"
              >
                <span>Gradient Section Divider</span>
                <span className="text-[10px] text-cyan-400">+ Insert</span>
              </button>
              <button
                onClick={() => setCssCode(prev => prev + '\n\n/* Pull Quote Styling */\n.pull-quote {\n  font-size: 1.25rem;\n  font-style: italic;\n  border-left: 3px solid #06b6d4;\n  padding-left: 1rem;\n  margin: 1.5rem 0;\n  color: #e2e8f0;\n}')}
                className="w-full text-left bg-black/40 hover:bg-black/80 border border-slate-800 p-2.5 rounded-xl text-xs font-mono text-slate-300 transition-all cursor-pointer flex items-center justify-between"
              >
                <span>Pull Quote Typography</span>
                <span className="text-[10px] text-cyan-400">+ Insert</span>
              </button>
            </div>
          </div>

          <div className="bg-cyan-500/10 border border-cyan-500/20 p-4 rounded-2xl text-xs text-cyan-300 leading-relaxed">
            <div className="font-bold mb-1 flex items-center gap-1.5 font-mono">
              <ShieldCheck size={14} /> Production Prepress Note
            </div>
            Custom CSS rules are compiled directly into the EPUB stylesheets and PDF print stream engine during final distribution exports.
          </div>
        </div>
      </div>
    </div>
  );
}
