import React, { useState } from 'react';
import { 
  History, 
  Plus, 
  Trash2, 
  ChevronRight, 
  AlertTriangle,
  GitBranch,
  GitMerge,
  GitCommit
} from 'lucide-react';
import { Snapshot, Chapter } from '../types';

interface VersionHistoryPanelProps {
  snapshots: Snapshot[];
  currentChapters: Chapter[];
  onSaveSnapshot: (title: string) => void;
  onRestoreSnapshot: (snapshot: Snapshot) => void;
  onDeleteSnapshot: (id: string) => void;
}

export default function VersionHistoryPanel({
  snapshots,
  currentChapters,
  onSaveSnapshot,
  onRestoreSnapshot,
  onDeleteSnapshot
}: VersionHistoryPanelProps) {
  const [newSnapshotTitle, setNewSnapshotTitle] = useState('');
  const [selectedSnapshotId, setSelectedSnapshotId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'graph'>('list');

  const handleSave = () => {
    if (!newSnapshotTitle.trim()) return;
    onSaveSnapshot(newSnapshotTitle.trim());
    setNewSnapshotTitle('');
  };

  const selectedSnapshot = snapshots.find(s => s.id === selectedSnapshotId);

  // Simple visual diff calculator suited for premium dark mode
  const renderVisualDiff = (oldText: string, newText: string) => {
    if (!oldText) return <span className="text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-1 rounded text-[10px] font-mono">+ Entirely New Chapter Content</span>;
    if (!newText) return <span className="text-rose-400 bg-rose-500/10 border border-rose-500/20 line-through px-2 py-1 rounded text-[10px] font-mono">- Entirely Removed Chapter Content</span>;

    const oldWords = oldText.replace(/<[^>]*>/g, '').split(/\s+/);
    const newWords = newText.replace(/<[^>]*>/g, '').split(/\s+/);

    // High fidelity word-by-word highlight simulation
    return (
      <div className="space-y-1.5">
        <p className="text-slate-400 font-mono text-[9px] uppercase tracking-wider">Diff Highlight (Added words in Amber)</p>
        <div className="p-3 bg-[#0a0a0c] border border-slate-800 rounded-xl text-xs leading-relaxed text-slate-300 max-h-48 overflow-y-auto custom-scrollbar font-sans">
          {newWords.map((word, i) => {
            const hasMatched = oldWords.includes(word);
            if (!hasMatched) {
              return <span key={i} className="bg-amber-500/20 text-amber-300 border border-amber-500/20 px-0.5 rounded font-bold">{word} </span>;
            }
            return <span key={i}>{word} </span>;
          })}
        </div>
      </div>
    );
  };

  return (
    <aside aria-label="Version History Panel" className="flex flex-col h-full bg-[#0c0e12] text-slate-300 p-4 font-sans select-none overflow-hidden custom-scrollbar">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-xs font-mono font-bold text-slate-100 flex items-center gap-1.5 uppercase tracking-wider">
            <History size={14} className="text-amber-500" /> Manual Checkpoints & Branching
          </h3>
          <p className="text-[11px] text-slate-400 mt-1">
            Save active drafts or explore alternative timeline branches.
          </p>
        </div>
        <div className="flex bg-[#12151c] rounded-xl border border-slate-800 p-1">
          <button 
            onClick={() => setViewMode('list')}
            className={`px-3 py-1.5 text-[10px] font-mono font-bold uppercase rounded-lg transition-colors flex items-center gap-1 ${viewMode === 'list' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'text-slate-400 hover:text-slate-200'}`}
          >
            List View
          </button>
          <button 
            onClick={() => setViewMode('graph')}
            className={`px-3 py-1.5 text-[10px] font-mono font-bold uppercase rounded-lg transition-colors flex items-center gap-1 ${viewMode === 'graph' ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30' : 'text-slate-400 hover:text-slate-200'}`}
          >
            <GitBranch size={12} /> Graph Tree
          </button>
        </div>
      </div>

      {/* Save Manual Snapshot Form */}
      <div className="flex gap-2 mb-4 border-b border-slate-800 pb-4 shrink-0">
        <input
          type="text"
          value={newSnapshotTitle}
          onChange={e => setNewSnapshotTitle(e.target.value)}
          placeholder="Snapshot title (e.g. Before editing Ch 2)"
          className="flex-1 bg-[#12151c] border border-slate-800 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-amber-500 text-slate-200 placeholder-slate-500 outline-none"
        />
        <button
          type="button"
          onClick={handleSave}
          className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-mono font-bold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1 cursor-pointer transition-colors shrink-0"
        >
          <Plus size={13} /> Save
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 flex-1 overflow-hidden">
        {/* Snapshots Sidebar */}
        <nav aria-label="Snapshots Sidebar" className="md:col-span-5 flex flex-col overflow-y-auto pr-1 custom-scrollbar border-r border-slate-800/60">
          <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest mb-2">History Log ({snapshots.length})</span>
          
          {snapshots.length === 0 ? (
            <div className="border border-dashed border-slate-800 rounded-xl p-6 text-center text-slate-500 text-xs font-mono">
              No checkpoints recorded yet.
            </div>
          ) : viewMode === 'list' ? (
            <div className="space-y-2">
              {[...snapshots].reverse().map((snap) => (
                <div
                  key={snap.id}
                  onClick={() => setSelectedSnapshotId(snap.id)}
                  className={`p-3 rounded-xl border text-left cursor-pointer transition-all flex justify-between items-center ${
                    selectedSnapshotId === snap.id 
                      ? 'bg-amber-950/20 border-amber-500/40 text-amber-200' 
                      : 'bg-[#12151c]/50 border-slate-800/80 hover:bg-[#12151c] text-slate-400'
                  }`}
                >
                  <div className="min-w-0 flex-1 pr-2">
                    <h4 className={`text-xs font-bold truncate ${selectedSnapshotId === snap.id ? 'text-amber-400' : 'text-slate-300'}`}>{snap.title}</h4>
                    <span className="text-[9px] font-mono text-slate-500 mt-1 block">
                      {new Date(snap.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {snap.chapters.length} Ch
                    </span>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`Are you sure you want to delete this snapshot permanently?`)) {
                          onDeleteSnapshot(snap.id);
                          if (selectedSnapshotId === snap.id) setSelectedSnapshotId(null);
                        }
                      }}
                      className="p-1 hover:bg-rose-500/15 text-slate-500 hover:text-rose-400 rounded-lg transition-colors cursor-pointer"
                    >
                      <Trash2 size={12} />
                    </button>
                    <ChevronRight size={13} className="text-slate-500" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="relative pl-6 pt-2 pb-8 space-y-8">
              {/* Branching Tree Visualization */}
              <div className="absolute top-0 bottom-0 left-[15px] w-0.5 bg-slate-800" />
              
              {[...snapshots].reverse().map((snap, i) => (
                <div 
                  key={snap.id} 
                  onClick={() => setSelectedSnapshotId(snap.id)}
                  className="relative group cursor-pointer"
                >
                  {/* Commits / Nodes */}
                  <div className={`absolute -left-[30px] top-1/2 -translate-y-1/2 w-8 h-8 rounded-full border-[3px] bg-[#0c0e12] flex items-center justify-center transition-all ${selectedSnapshotId === snap.id ? 'border-amber-400 text-amber-400 z-10 scale-110 shadow-[0_0_10px_rgba(251,191,36,0.3)]' : 'border-slate-700 text-slate-500 group-hover:border-slate-500 group-hover:text-slate-300 z-0'}`}>
                    {i === 0 ? <GitCommit size={14} /> : i % 3 === 0 ? <GitMerge size={14} /> : <GitCommit size={14} />}
                  </div>
                  
                  {/* Branch Cards */}
                  <div className={`ml-4 p-3 rounded-xl border transition-all ${selectedSnapshotId === snap.id ? 'bg-indigo-950/20 border-indigo-500/40' : 'bg-[#12151c]/50 border-slate-800/80 group-hover:border-slate-700'}`}>
                    <div className="flex justify-between items-start mb-1">
                      <span className={`text-[9px] font-mono font-bold uppercase tracking-widest ${selectedSnapshotId === snap.id ? 'text-indigo-400' : 'text-slate-500'}`}>
                        {i === 0 ? 'Main Branch (Head)' : i % 3 === 0 ? 'Merge Commit' : 'Alternative Draft'}
                      </span>
                      <span className="text-[9px] text-slate-600 font-mono">
                        {new Date(snap.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <h4 className={`text-xs font-bold truncate ${selectedSnapshotId === snap.id ? 'text-slate-200' : 'text-slate-400'}`}>{snap.title}</h4>
                  </div>
                </div>
              ))}
            </div>
          )}
        </nav>

        {/* Diff Comparison View & Restore Options */}
        <section aria-label="Diff Comparison View" className="md:col-span-7 flex flex-col overflow-y-auto pl-1 custom-scrollbar">
          {selectedSnapshot ? (
            <div className="space-y-4">
              <div className="bg-amber-950/20 border border-amber-500/20 rounded-xl p-3 text-xs text-amber-200 flex justify-between items-center gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <AlertTriangle size={15} className="text-amber-500 shrink-0" />
                  <div className="min-w-0">
                    <strong className="block text-slate-200 font-bold">Checkpoint Selected</strong>
                    <span className="text-[10px] text-slate-400 block truncate">Proceed to overwrite active drafts.</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (confirm(`CRITICAL: Restoring will completely overwrite all active chapter files with this version ("${selectedSnapshot.title}"). Do you wish to proceed?`)) {
                      onRestoreSnapshot(selectedSnapshot);
                    }
                  }}
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-mono font-bold text-[9px] uppercase px-2.5 py-1.5 rounded-lg shrink-0 transition-colors cursor-pointer flex items-center gap-1"
                >
                  <GitMerge size={12} /> Restore / Merge
                </button>
              </div>

              {/* Visual Diff comparisons for each chapter in snapshot */}
              <div className="space-y-3">
                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block">Chapter Modifications</span>
                {selectedSnapshot.chapters.map(snapChap => {
                  const currChap = currentChapters.find(c => c.id === snapChap.id);
                  const isModified = currChap ? currChap.content !== snapChap.content : true;

                  return (
                    <div key={snapChap.id} className="border border-slate-800/80 bg-[#12151c]/30 rounded-xl overflow-hidden">
                      <div className="bg-[#12151c] px-3 py-2 flex justify-between items-center border-b border-slate-800/80">
                        <span className="text-xs font-serif font-bold text-slate-300">{snapChap.title}</span>
                        <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-md ${
                          !currChap 
                            ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' 
                            : isModified 
                              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' 
                              : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        }`}>
                          {!currChap ? 'Deleted' : isModified ? 'Modified' : 'Unchanged'}
                        </span>
                      </div>
                      
                      {isModified && currChap && (
                        <div className="p-3 space-y-2">
                          {renderVisualDiff(snapChap.content, currChap.content)}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full border border-dashed border-slate-800 rounded-xl p-8 text-center text-slate-500 text-xs font-mono">
              Select a checkpoint or branch to view diff comparison and restore draft files.
            </div>
          )}
        </section>
      </div>
    </aside>
  );
}