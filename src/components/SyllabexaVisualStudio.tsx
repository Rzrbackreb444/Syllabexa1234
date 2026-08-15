import React, { useState } from 'react';
import { useVFSStore } from '../store/vfsStore';
import { Terminal, GitBranch, History, RotateCcw, Trash2, ShieldCheck, CheckCircle2 } from 'lucide-react';

export const SyllabexaVisualStudio: React.FC = () => {
  const { files, snapshots, createSnapshot, rollbackToSnapshot, deleteSnapshot } = useVFSStore();
  const [commitMsg, setCommitMsg] = useState('');
  const [isCommitting, setIsCommitting] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const handleManualSnapshot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commitMsg.trim()) return;
    setIsCommitting(true);
    try {
      await createSnapshot(commitMsg.trim());
      setSuccessToast(`Successfully committed: "${commitMsg}"`);
      setCommitMsg('');
      setTimeout(() => setSuccessToast(null), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsCommitting(false);
    }
  };

  return (
    <aside aria-label="Syllabexa Virtual Studio" className="flex flex-col h-full bg-[#0a0c10] text-slate-100 font-sans p-6 rounded-2xl border border-slate-800 shadow-2xl overflow-hidden custom-scrollbar">
      {/* Header */}
      <header className="flex justify-between items-center pb-5 mb-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.1)]">
            <Terminal size={20} />
          </div>
          <div>
            <h2 className="text-base font-mono font-bold tracking-wider text-slate-100 uppercase flex items-center gap-2">
              Virtual File System Console 
              <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-normal">v3.5 Core</span>
            </h2>
            <p className="text-xs text-slate-400 font-mono">Autonomous File System & State Rollback Ledger</p>
          </div>
        </div>
        <div className="text-xs px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-400 flex items-center gap-2 font-mono">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          Telemetry Ledger Active
        </div>
      </header>

      {successToast && (
        <div className="mb-4 p-3 bg-emerald-950/40 border border-emerald-800 text-emerald-300 rounded-xl text-xs font-mono flex items-center gap-2 animate-fade-in">
          <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 overflow-hidden">
        
        {/* Workspace Snapshot Trigger */}
        <section aria-labelledby="snapshot-trigger-title" className="lg:col-span-5 bg-[#12151c] p-5 rounded-2xl border border-slate-800/80 flex flex-col justify-between shadow-lg">
          <div className="space-y-4">
            <h3 id="snapshot-trigger-title" className="flex items-center gap-2 text-xs font-mono font-bold text-amber-400 uppercase tracking-wider">
              <GitBranch size={14} /> Create State Snapshot
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed font-sans">
              Commit the current manuscript state, AST blocks, and file system tree directly to the persistent immutable cache.
            </p>
            <form onSubmit={handleManualSnapshot} className="space-y-3 pt-2">
              <div>
                <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-500 mb-1 font-bold">Commit Message</label>
                <input
                  type="text"
                  placeholder="e.g. Chapter 12 final edit checkpoint"
                  value={commitMsg}
                  onChange={(e) => setCommitMsg(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-black/50 border border-slate-800 rounded-xl text-xs text-slate-200 font-mono outline-none focus:border-amber-500 transition-colors"
                />
              </div>
              <button
                type="submit"
                disabled={!commitMsg.trim() || isCommitting}
                className="w-full py-3 bg-amber-500 hover:bg-amber-400 disabled:bg-slate-800 disabled:text-slate-600 text-black font-mono font-bold uppercase tracking-wider rounded-xl text-xs transition-all shadow-[0_0_15px_rgba(245,158,11,0.15)] cursor-pointer flex items-center justify-center gap-2"
              >
                {isCommitting ? 'Committing State...' : 'Commit Snapshot'}
              </button>
            </form>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between font-mono text-xs">
            <span className="text-slate-500">Total VFS Files Tracked:</span>
            <span className="text-amber-400 font-bold bg-amber-500/10 px-2.5 py-0.5 rounded border border-amber-500/20">
              {Object.keys(files).length} Files
            </span>
          </div>
        </section>

        {/* Snapshot History & Rollback Ledger */}
        <section aria-labelledby="snapshot-ledger-title" className="lg:col-span-7 bg-[#12151c] p-5 rounded-2xl border border-slate-800/80 flex flex-col overflow-hidden shadow-lg">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
            <h3 id="snapshot-ledger-title" className="flex items-center gap-2 text-xs font-mono font-bold text-slate-200 uppercase tracking-wider">
              <History size={14} className="text-amber-400" /> Snapshot Ledger History
            </h3>
            <span className="text-[10px] font-mono text-slate-500 bg-black/40 px-2 py-0.5 rounded border border-slate-800">
              {snapshots.length} Checkpoints Saved
            </span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 custom-scrollbar">
            {snapshots.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-10 space-y-2 text-slate-500 font-mono">
                <ShieldCheck size={28} className="text-slate-600 mb-1" />
                <p className="text-xs">No snapshots recorded yet.</p>
                <p className="text-[10px] text-slate-600 max-w-xs">Commit your first checkpoint above to establish a rollback safety net.</p>
              </div>
            ) : (
              snapshots.map((snap) => (
                <div
                  key={snap.id}
                  className="p-3 bg-black/40 border border-slate-800 hover:border-slate-700 rounded-xl flex items-center justify-between transition-all group"
                >
                  <div className="overflow-hidden pr-3">
                    <p className="text-xs font-medium text-slate-200 truncate group-hover:text-amber-400 transition-colors">
                      {snap.commitMessage}
                    </p>
                    <p className="text-[10px] text-slate-500 font-mono mt-0.5 flex items-center gap-2">
                      <span>{new Date(snap.timestamp).toLocaleTimeString()}</span>
                      <span>·</span>
                      <span className="text-indigo-400">{Object.keys(snap.tree).length} files archived</span>
                    </p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => rollbackToSnapshot(snap.id)}
                      className="px-3 py-1.5 bg-slate-900 hover:bg-amber-500 hover:text-black text-amber-400 border border-slate-800 rounded-lg text-[10px] font-mono font-bold transition-all cursor-pointer flex items-center gap-1 shadow-inner"
                      title="Restore VFS state to this checkpoint"
                    >
                      <RotateCcw size={10} /> Restore
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteSnapshot(snap.id)}
                      className="px-2.5 py-1.5 bg-slate-900 hover:bg-rose-950/80 hover:text-rose-400 text-slate-500 border border-slate-800 rounded-lg text-[10px] font-mono transition-all cursor-pointer"
                      title="Delete checkpoint"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

      </div>
    </aside>
  );
};

export default SyllabexaVisualStudio;