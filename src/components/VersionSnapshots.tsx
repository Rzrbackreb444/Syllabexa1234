import React, { useState } from 'react';
import { History, Save, RotateCcw, Trash2, X, Clock, CheckCircle2, Bookmark } from 'lucide-react';
import { useManuscriptStore } from '../store/manuscriptStore';
import { useToast } from '../lib/ToastContext';

interface VersionSnapshotsProps {
  manuscriptText: string;
}

export default function VersionSnapshots({ manuscriptText }: VersionSnapshotsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [snapshotTitle, setSnapshotTitle] = useState('');
  const snapshots = useManuscriptStore(state => state.snapshots);
  const addSnapshot = useManuscriptStore(state => state.addSnapshot);
  const restoreSnapshot = useManuscriptStore(state => state.restoreSnapshot);
  const deleteSnapshot = useManuscriptStore(state => state.deleteSnapshot);
  const { showToast } = useToast();

  const handleCreateSnapshot = (e: React.FormEvent) => {
    e.preventDefault();
    const title = snapshotTitle.trim() || `Snapshot - ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    addSnapshot(title);
    setSnapshotTitle('');
    showToast(`Snapshot "${title}" saved successfully.`, 'success');
  };

  const handleRestore = (id: string, title: string) => {
    restoreSnapshot(id);
    showToast(`Restored version: "${title}"`, 'success');
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-3 py-1.5 bg-slate-900 border border-slate-800 hover:border-cyan-500 text-slate-300 hover:text-cyan-400 rounded-lg text-xs font-mono flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
        title="Version Snapshots & Timeline"
      >
        <History size={14} className="text-cyan-400" />
        <span>Snapshots ({snapshots.length})</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-[#0c0e12] border border-slate-800 rounded-2xl shadow-2xl z-[100] p-4 font-sans animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
            <div className="flex items-center gap-2">
              <History size={16} className="text-cyan-400" />
              <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">Version Snapshots Timeline</span>
            </div>
            <button onClick={() => setIsOpen(false)} className="p-1.5 text-slate-500 hover:text-white rounded-lg cursor-pointer">
              <X size={14} />
            </button>
          </div>

          <div className="space-y-4">
            <form onSubmit={handleCreateSnapshot} className="flex gap-2">
              <input
                type="text"
                value={snapshotTitle}
                onChange={(e) => setSnapshotTitle(e.target.value)}
                placeholder="Label new version (e.g., Pre-Climax Edit)..."
                className="flex-1 bg-black/50 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
              />
              <button
                type="submit"
                className="px-3 py-2 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold rounded-xl text-xs font-mono flex items-center gap-1 transition-all cursor-pointer shadow-md shadow-cyan-600/20"
              >
                <Save size={14} />
                <span>Save</span>
              </button>
            </form>

            <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar pr-1">
              {snapshots.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-500 italic bg-black/30 rounded-xl border border-slate-800/80">
                  No snapshots saved yet. Save a snapshot to anchor your progress in the timeline.
                </div>
              ) : (
                snapshots.map((snap) => (
                  <div key={snap.id} className="bg-slate-900/60 border border-slate-800 rounded-xl p-3 flex items-center justify-between group hover:border-slate-700 transition-all">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Bookmark size={12} className="text-cyan-400" />
                        <span className="text-xs font-bold text-white">{snap.title}</span>
                      </div>
                      <div className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                        <Clock size={10} /> {new Date(snap.timestamp).toLocaleString()} • {snap.chapters.length} chapters
                      </div>
                    </div>
                    <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleRestore(snap.id, snap.title)}
                        className="p-1.5 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 rounded-lg text-xs transition-all cursor-pointer"
                        title="Restore this version"
                      >
                        <RotateCcw size={14} />
                      </button>
                      <button
                        onClick={() => deleteSnapshot(snap.id)}
                        className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg text-xs transition-all cursor-pointer"
                        title="Delete snapshot"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}