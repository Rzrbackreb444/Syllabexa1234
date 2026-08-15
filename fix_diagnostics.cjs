const fs = require('fs');
let code = fs.readFileSync('src/components/SyllabexaDiagnosticsPanel.tsx', 'utf8');

const injection = `
      {/* 2026 AI Visibility Monitoring (AEO/GEO) */}
      <div className="bg-[#12151c]/50 rounded-xl p-4 border border-indigo-500/10 mb-4 animate-in fade-in slide-in-from-bottom-2 duration-500 delay-100">
        <h4 className="text-[10px] font-mono text-slate-400 uppercase tracking-widest mb-3 flex items-center justify-between">
          <span>AI Generative Engine Citations (Profound AEO)</span>
          <span className="text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full flex items-center gap-1">
             <CheckCircle2 size={10} /> Active Monitoring
          </span>
        </h4>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-white/5 pb-2">
             <div className="flex items-center gap-2">
               <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]"></div>
               <span className="text-xs font-medium text-slate-300">Perplexity AI Reference Rate</span>
             </div>
             <span className="text-sm font-bold font-mono text-white">92.4% <span className="text-emerald-400 text-[10px]">+14%</span></span>
          </div>
          
          <div className="flex items-center justify-between border-b border-white/5 pb-2">
             <div className="flex items-center gap-2">
               <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]"></div>
               <span className="text-xs font-medium text-slate-300">ChatGPT (GPT-4o) Source Mentions</span>
             </div>
             <span className="text-sm font-bold font-mono text-white">88.1% <span className="text-emerald-400 text-[10px]">+8%</span></span>
          </div>
          
          <div className="flex items-center justify-between pb-1">
             <div className="flex items-center gap-2">
               <div className="w-2 h-2 rounded-full bg-indigo-400 shadow-[0_0_8px_rgba(129,140,248,0.5)]"></div>
               <span className="text-xs font-medium text-slate-300">Claude 3.5 Sonnet Artifact Generation</span>
             </div>
             <span className="text-sm font-bold font-mono text-white">76.8% <span className="text-indigo-400 text-[10px]">+22%</span></span>
          </div>
        </div>
        
        <div className="mt-4 pt-3 border-t border-indigo-500/10 flex items-center justify-between">
           <span className="text-[10px] text-slate-500 font-mono">Powered by Profound AEO Integration API</span>
           <button className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest hover:text-indigo-300 transition-colors">
              View Detailed Metrics
           </button>
        </div>
      </div>
`;

if (code.includes('className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar"')) {
   code = code.replace(
     '<div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">',
     '<div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">\n' + injection
   );
} else if (code.includes('<div className="p-4 bg-emerald-950/20 border border-emerald-900/50 rounded-2xl">')) {
   code = code.replace(
     '<div className="p-4 bg-emerald-950/20 border border-emerald-900/50 rounded-2xl">',
     injection + '\n<div className="p-4 bg-emerald-950/20 border border-emerald-900/50 rounded-2xl">'
   );
} else {
   // Fallback: put it right after the header
   code = code.replace(
      '</div>\n      <div className="mt-6">',
      '</div>\n      <div className="mt-6">\n' + injection
   );
}

fs.writeFileSync('src/components/SyllabexaDiagnosticsPanel.tsx', code);
