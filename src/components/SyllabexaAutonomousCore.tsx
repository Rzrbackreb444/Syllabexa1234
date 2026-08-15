import React, { useState } from 'react';
import { useVFSStore } from '../store/vfsStore';
import { useSelfOptimizer } from '../store/useSelfOptimizer';
import { Cpu, Terminal, ShieldCheck, Sparkles, FolderTree, FileCode, CheckCircle2 } from 'lucide-react';
import { useToast } from '../lib/ToastContext';

export default function SyllabexaAutonomousCore() {
  const { files, activeFileId, setActiveFile, upsertFile } = useVFSStore();
  const { telemetryQueue, optimizationHistory, logTelemetry, runAutonomousOptimization, isOptimizing } = useSelfOptimizer();
  const [modulePrompt, setModulePrompt] = useState('');
  const { showToast } = useToast();

  const handleRunBuild = async () => {
    if (!modulePrompt.trim()) return;
    const name = modulePrompt.replace(/[^a-zA-Z0-9]/g, '');
    const cleanName = name.charAt(0).toUpperCase() + name.slice(1) + 'Module.tsx';
    
    showToast(`Initializing autonomous compiler for ${cleanName}...`, 'info');
    upsertFile(`/src/components/${cleanName}`, `// Autonomous generated module for ${modulePrompt}\nexport default function ${cleanName.replace('.tsx', '')}() { return <div>${modulePrompt}</div>; }`);
    setModulePrompt('');
    showToast(`Module ${cleanName} compiled and integrated into VFS.`, 'success');
  };

  const handleSimulateTelemetry = () => {
    logTelemetry('typesetting', 'Detected layout baseline grid misalignment on verso spread.');
    showToast('Typesetting telemetry log injected.', 'info');
  };

  return (
    <div className="flex-1 bg-[#07080a] flex flex-col h-full font-sans text-slate-200 p-8 overflow-y-auto max-w-7xl mx-auto w-full custom-scrollbar select-none relative z-0">
      
      {/* Header */}
      <div className="h-16 bg-[#0c0e12] border border-white/5 rounded-3xl px-8 flex items-center justify-between shrink-0 shadow-2xl mb-8">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.15)]">
            <Cpu size={20} />
          </div>
          <div>
            <h2 className="text-xs font-mono font-bold text-slate-100 uppercase tracking-widest flex items-center gap-2">
              <span>Autonomous Studio & VFS Engine</span>
              <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 text-[9px] border border-amber-500/30">ZERO SLOP</span>
            </h2>
            <p className="text-[10px] text-slate-500 font-mono mt-0.5">Self-building virtual file tree and closed-loop optimization telemetry</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleSimulateTelemetry}
            className="px-4 py-2 bg-black/40 hover:bg-black/60 text-slate-300 border border-white/10 rounded-xl text-[10px] font-mono uppercase tracking-wider transition-all cursor-pointer"
          >
            Inject Audit Log
          </button>
          <button
            onClick={runAutonomousOptimization}
            disabled={isOptimizing || telemetryQueue.filter(t => t.status === 'detected').length === 0}
            className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black rounded-xl text-xs font-mono font-black uppercase tracking-wider shadow-[0_0_15px_rgba(245,158,11,0.2)] transition-all cursor-pointer flex items-center gap-2"
          >
            {isOptimizing ? <span className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" /> : <Sparkles size={14} />}
            <span>Run Self-Heal</span>
          </button>
        </div>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 flex-1">
        
        {/* Left: Virtual File Tree Explorer */}
        <aside aria-label="Virtual File Explorer" className="lg:col-span-5 bg-[#0c0e12] border border-white/5 rounded-3xl p-6 shadow-2xl flex flex-col h-[500px]">
          <h4 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-widest flex items-center gap-2 border-b border-white/5 pb-3 mb-4">
            <FolderTree size={16} className="text-amber-400" />
            <span>IndexedDB Virtual File System</span>
          </h4>

          <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 font-mono text-xs">
            <div className="text-amber-400 flex items-center gap-2 py-1">
              <span>📁 /src/</span>
            </div>
            <div className="pl-4 space-y-1">
              {Object.values(files).map(file => (
                <button
                  key={file.id}
                  onClick={() => setActiveFile(file.id)}
                  className={`w-full text-left px-3 py-2 rounded-xl flex items-center gap-2 transition-all cursor-pointer ${
                    activeFileId === file.id ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                  }`}
                >
                  <FileCode size={14} />
                  <span className="truncate">{file.path}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Prompt to Auto-Build New Module */}
          <div className="pt-4 border-t border-white/5 mt-4 space-y-3">
            <label className="block text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest">
              Autonomous Code Generator Prompt
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. PrepressGridAuditor..."
                value={modulePrompt}
                onChange={e => setModulePrompt(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleRunBuild()}
                className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-slate-200 outline-none focus:border-amber-500/50 font-mono"
              />
              <button
                onClick={handleRunBuild}
                disabled={!modulePrompt.trim()}
                className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black font-mono font-bold text-xs rounded-xl cursor-pointer uppercase tracking-wider"
              >
                Build
              </button>
            </div>
          </div>
        </aside>

        {/* Right: Telemetry & Optimization Log */}
        <section aria-labelledby="telemetry-audit-title" className="lg:col-span-7 bg-[#0c0e12] border border-white/5 rounded-3xl p-6 shadow-2xl flex flex-col h-[500px]">
          <h4 id="telemetry-audit-title" className="text-xs font-mono font-bold text-slate-200 uppercase tracking-widest flex items-center gap-2 border-b border-white/5 pb-3 mb-4">
            <Terminal size={16} className="text-amber-400" />
            <span>Closed-Loop Telemetry & Audit Logs</span>
          </h4>

          <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pr-2">
            {telemetryQueue.length === 0 && optimizationHistory.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-white/5 rounded-2xl">
                <ShieldCheck size={36} className="text-slate-700 mb-3" />
                <p className="text-slate-500 font-mono text-xs uppercase tracking-widest">
                  All systems operating at peak telemetry.<br />No bottlenecks detected.
                </p>
              </div>
            ) : (
              <>
                {telemetryQueue.map(item => (
                  <div key={item.id} className="bg-black/40 border border-white/5 rounded-xl p-4 flex items-center justify-between">
                    <div>
                      <span className="text-[9px] font-mono uppercase text-amber-500 tracking-widest font-bold">
                        [{item.category}]
                      </span>
                      <p className="text-xs text-slate-300 font-mono mt-1">{item.issue}</p>
                    </div>
                    <span className={`px-2.5 py-1 rounded-md text-[9px] font-mono uppercase font-bold ${
                      item.status === 'resolved' ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-500/30' : 'bg-amber-950/40 text-amber-400 border border-amber-500/30'
                    }`}>
                      {item.status}
                    </span>
                  </div>
                ))}
                {optimizationHistory.map(log => (
                  <div key={log.id} className="bg-emerald-950/10 border border-emerald-500/30 rounded-xl p-4 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-mono uppercase text-emerald-400 tracking-widest font-bold flex items-center gap-1">
                        <CheckCircle2 size={12} /> Optimization Patch Applied
                      </span>
                      <span className="text-[10px] font-mono text-slate-500">Impact Score: {log.impactScore}%</span>
                    </div>
                    <p className="text-xs text-slate-300 font-serif">{log.recommendation}</p>
                  </div>
                ))}
              </>
            )}
          </div>
        </section>

      </div>
    </div>
  );
}