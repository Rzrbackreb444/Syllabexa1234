import React, { useState, useMemo, useCallback } from 'react';
import { useCommentStore } from '../store/commentStore';
import { useManuscriptStore } from '../store/manuscriptStore';
import { MessageSquare, X, FileText, Database, Edit3, Tag, History, ShieldAlert } from 'lucide-react';
import { useToast } from '../lib/ToastContext';
import { OutlineTab, DataTab, ScratchpadTab, ConceptsTab } from './ReferenceTabs';
import VersionHistoryPanel from './VersionHistoryPanel';

type TabType = 'outlines' | 'data' | 'scratchpad' | 'concepts' | 'history';

export default function CommentMarginPanel({ activeChapterId, onClose }: { activeChapterId: string | null; onClose: () => void }) {
  // OPTIMIZATION: Strict Atomic Selectors for Manuscript Store
  const snapshots = useManuscriptStore(state => state.snapshots);
  const chapters = useManuscriptStore(state => state.chapters);
  const addSnapshot = useManuscriptStore(state => state.addSnapshot);
  const deleteSnapshot = useManuscriptStore(state => state.deleteSnapshot);
  const restoreSnapshot = useManuscriptStore(state => state.restoreSnapshot);

  // OPTIMIZATION: Atomic Selectors for Comment Store (Prevents global re-render cascading)
  const comments = useCommentStore(state => state.comments);
  const resolveComment = useCommentStore(state => state.resolveComment);
  const deleteComment = useCommentStore(state => state.deleteComment);
  const addComment = useCommentStore(state => state.addComment);

  const [newText, setNewText] = useState('');
  const [activeTab, setActiveTab] = useState<TabType>('outlines');
  const [scratchpadText, setScratchpadText] = useState('## Notes for Chapter 2\n- Check the 1994 statistics on route density\n- Remind the reader about the coin-op transition\n\nQuotes:\n"Vending is just real estate without the land."');
  
  const { showToast } = useToast();

  // OPTIMIZATION: Memoize the heavy array filter. 
  // Prevents re-calculating thousands of comments on every single keystroke in 'newText'.
  const chapterComments = useMemo(() => {
    if (!activeChapterId) return [];
    return comments.filter(c => c.chapterId === activeChapterId);
  }, [comments, activeChapterId]);

  // OPTIMIZATION: Stabilize the post handler memory reference
  const handlePostNote = useCallback(() => {
    if (!newText.trim() || !activeChapterId) return;
    addComment({ author: 'Author Reviewer', text: newText.trim(), chapterId: activeChapterId });
    setNewText('');
    showToast('Reference note posted successfully', 'success');
  }, [newText, activeChapterId, addComment, showToast]);

  // Premium UI: Unified Tab Configuration Array
  const TABS: { id: TabType; label: string; icon: React.ElementType }[] = useMemo(() => [
    { id: 'outlines', label: 'Outline', icon: FileText },
    { id: 'data', label: 'Data', icon: Database },
    { id: 'scratchpad', label: 'Pad', icon: Edit3 },
    { id: 'concepts', label: 'Concepts', icon: Tag },
    { id: 'history', label: 'History', icon: History },
  ], []);

  return (
    <aside aria-label="Reference Panel" className="w-full bg-[#0c0e12] flex flex-col h-full select-none z-20 font-sans border-l border-white/5 shadow-2xl relative">
      
      {/* Header */}
      <div className="p-4 border-b border-white/5 bg-[#08090c] flex items-center justify-between z-10 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.15)]">
            <MessageSquare size={16} />
          </div>
          <div>
            <h3 className="text-[11px] font-mono font-bold text-slate-200 uppercase tracking-widest leading-none mb-1">
              Reference Panel
            </h3>
            <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">
              {chapterComments.length} Active Notes
            </span>
          </div>
        </div>
        <button 
          onClick={onClose} 
          className="p-2 text-slate-500 hover:text-rose-400 hover:bg-white/5 rounded-xl cursor-pointer transition-all"
          title="Close Reference Panel"
        >
          <X size={16} />
        </button>
      </div>

      {/* Unified Tab Navigation */}
      <nav aria-label="Reference Tabs" className="flex items-center border-b border-white/5 bg-[#0a0c10] p-1.5 shrink-0 overflow-x-auto custom-scrollbar">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 text-[10px] font-mono font-bold uppercase tracking-widest rounded-lg transition-all min-w-[80px] cursor-pointer ${
                isActive 
                  ? 'bg-[#161a22] text-amber-400 shadow-inner border border-white/5' 
                  : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
              }`}
            >
              <Icon size={13} /> <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden relative bg-[#07080a]">
        {activeTab === 'outlines' && (
          <OutlineTab
            chapterComments={chapterComments}
            resolveComment={resolveComment}
            deleteComment={deleteComment}
            showToast={showToast}
            newText={newText}
            setNewText={setNewText}
            handlePostNote={handlePostNote}
            activeChapterId={activeChapterId}
          />
        )}

        {activeTab === 'data' && (
          <DataTab />
        )}

        {activeTab === 'scratchpad' && (
          <ScratchpadTab
            scratchpadText={scratchpadText}
            setScratchpadText={setScratchpadText}
          />
        )}
        
        {activeTab === 'concepts' && (
          <ConceptsTab />
        )}
        
        {activeTab === 'history' && (
          <div className="w-full h-full overflow-y-auto bg-[#07080a] custom-scrollbar">
            <VersionHistoryPanel 
              snapshots={snapshots}
              currentChapters={chapters}
              onSaveSnapshot={(title) => {
                addSnapshot(title);
                showToast('Manual snapshot checkpoint captured successfully.', 'success');
              }}
              onRestoreSnapshot={(snap) => {
                restoreSnapshot(snap.id);
                showToast('Manuscript restored successfully.', 'success');
              }}
              onDeleteSnapshot={(id) => {
                deleteSnapshot(id);
                showToast('Snapshot checkpoint removed.', 'info');
              }}
            />
          </div>
        )}
      </div>
    </aside>
  );
}