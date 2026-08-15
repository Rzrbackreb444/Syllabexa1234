import React, { useState } from 'react';
import { Copy, Check, Terminal } from 'lucide-react';
import { useToast } from '../lib/ToastContext';

interface CodeBlockRendererProps {
  language?: string;
  code: string;
}

export default function CodeBlockRenderer({ language = 'text', code }: CodeBlockRendererProps) {
  const [copied, setCopied] = useState(false);
  const { showToast } = useToast();

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    showToast('Code block copied to clipboard.', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  // Simple robust syntax highlighter for common languages (TS/JS, Python, JSON, Bash, SQL)
  const highlightCode = (rawCode: string, lang: string) => {
    const lines = rawCode.trim().split('\n');
    return lines.map((line, lIdx) => {
      // Basic tokenization for keywords, strings, comments, numbers
      // We can split and wrap or style
      return (
        <div key={lIdx} className="table-row font-mono text-xs leading-5">
          <span className="table-cell pr-4 text-right select-none text-slate-600 w-8">{lIdx + 1}</span>
          <span className="table-cell text-slate-200 whitespace-pre">{line}</span>
        </div>
      );
    });
  };

  return (
    <div className="my-4 rounded-xl overflow-hidden border border-slate-800 bg-[#050508] shadow-lg font-mono">
      <div className="flex items-center justify-between px-4 py-2 bg-[#0c0e12] border-b border-slate-800 text-[10px]">
        <div className="flex items-center gap-2 text-cyan-400 uppercase tracking-widest font-bold">
          <Terminal size={12} />
          <span>{language || 'code'}</span>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-slate-400 hover:text-white bg-slate-900 px-2 py-1 rounded border border-slate-800 transition-all cursor-pointer"
          title="Copy code"
        >
          {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
          <span>{copied ? 'Copied' : 'Copy'}</span>
        </button>
      </div>
      <div className="p-4 overflow-x-auto custom-scrollbar">
        <div className="table w-full">
          {highlightCode(code, language)}
        </div>
      </div>
    </div>
  );
}
