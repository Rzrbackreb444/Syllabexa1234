import React, { memo } from 'react';
import { FileText, Database, CheckCircle, Trash2, Sparkles, Plus, Tag as TagIcon, X as XIcon, MapPin } from 'lucide-react';
import { useManuscriptStore } from '../store/manuscriptStore';

export const OutlineTab = memo(({ 
  chapterComments, 
  resolveComment, 
  deleteComment, 
  showToast,
  newText,
  setNewText,
  handlePostNote,
  activeChapterId
}: any) => (
  <div className="flex-1 flex flex-col overflow-hidden">
    <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
      {chapterComments.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center h-48 text-slate-500 text-xs font-mono px-4">
          <FileText size={28} className="mb-2 opacity-30 text-slate-400" />
          <span>No outline notes for this chapter.<br />Add a note below.</span>
        </div>
      ) : (
        chapterComments.map((comm: any) => (
          <div 
            key={comm.id} 
            className={`p-4 rounded-2xl border space-y-2.5 transition-all shadow-md ${
              comm.resolved 
                ? 'bg-[#0f1117]/50 border-slate-800 opacity-60' 
                : 'bg-[#12151c] border-slate-700/80 hover:border-slate-600'
            }`}
          >
            <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 uppercase">
              <span className="font-bold text-slate-200">{comm.author}</span>
              <div className="flex items-center gap-1.5">
                <button 
                  onClick={() => {
                    resolveComment(comm.id);
                    showToast(comm.resolved ? 'Note re-opened' : 'Note marked resolved', 'info');
                  }} 
                  className={`p-1 rounded-lg transition-all cursor-pointer ${comm.resolved ? 'text-amber-400 bg-amber-950/40' : 'text-slate-400 hover:text-amber-400 hover:bg-slate-800'}`}
                  title={comm.resolved ? "Re-open note" : "Resolve note"}
                >
                  <CheckCircle size={14} />
                </button>
                <button 
                  onClick={() => {
                    deleteComment(comm.id);
                    showToast('Note deleted', 'info');
                  }} 
                  className="p-1 text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 rounded-lg cursor-pointer transition-all" 
                  title="Delete note"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
            
            {comm.selectionText && (
              <div className="px-3 py-2 border-l-2 border-amber-500/50 bg-[#1a1e28] text-slate-400 text-xs italic font-serif">
                "{comm.selectionText}"
              </div>
            )}

            <p className="text-xs text-slate-300 font-sans leading-relaxed">{comm.text}</p>

            {comm.aiSuggestedEdit && (
              <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-500/30 text-[11px] text-amber-200 space-y-1.5 shadow-inner">
                <div className="flex items-center gap-1.5 font-mono font-bold text-[9px] uppercase tracking-wider text-amber-400">
                  <Sparkles size={12} />
                  <span>Suggested Revision</span>
                </div>
                <p className="leading-normal">{comm.aiSuggestedEdit}</p>
              </div>
            )}
          </div>
        ))
      )}
    </div>

    <div className="p-3.5 border-t border-slate-800 bg-[#08090c] flex gap-2 shadow-lg">
      <input
        type="text"
        placeholder="Add outline note..."
        value={newText}
        onChange={(e) => setNewText(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handlePostNote()}
        className="flex-1 bg-[#12151c] border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:border-amber-500 focus:outline-none shadow-inner"
      />
      <button
        onClick={handlePostNote}
        disabled={!newText.trim() || !activeChapterId}
        className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 rounded-xl text-xs font-mono font-black uppercase tracking-wider cursor-pointer shadow-lg shadow-amber-500/20 transition-all flex items-center gap-1"
      >
        <Plus size={14} />
        <span>Post</span>
      </button>
    </div>
  </div>
));

export const DataTab = memo(() => (
  <div className="flex-1 overflow-y-auto p-4 space-y-4 font-sans bg-[#0c0e12] custom-scrollbar">
    <div className="bg-[#12151c] border border-slate-700/80 rounded-xl p-3 shadow-md">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-xs font-bold text-amber-500 uppercase tracking-widest font-mono">1994 Vending Metrics</h3>
        <Database size={12} className="text-slate-500" />
      </div>
      <table className="w-full text-[10px] text-left text-slate-300">
        <thead className="bg-[#1a1e28] text-slate-400">
          <tr><th className="p-1.5 font-medium rounded-tl-lg">Metric</th><th className="p-1.5 font-medium rounded-tr-lg">Value</th></tr>
        </thead>
        <tbody className="divide-y divide-slate-800">
          <tr><td className="p-1.5">Average route density</td><td className="p-1.5 font-mono text-amber-400">42 stops/day</td></tr>
          <tr><td className="p-1.5">Spoilage rate</td><td className="p-1.5 font-mono text-amber-400">3.4%</td></tr>
          <tr><td className="p-1.5">Coin vs Bill ratio</td><td className="p-1.5 font-mono text-amber-400">88:12</td></tr>
        </tbody>
      </table>
    </div>

    <div className="bg-[#12151c] border border-slate-700/80 rounded-xl p-3 shadow-md">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-xs font-bold text-amber-500 uppercase tracking-widest font-mono">Competitor Analysis</h3>
      </div>
      <p className="text-[11px] text-slate-400 leading-relaxed">
        <strong>Macro-Vend Inc:</strong> Dominates urban centers. Weakness: Slow maintenance response (avg 48 hrs).<br/>
        <strong>CoinStar Routes:</strong> Primarily suburban. High margins on healthy snacks.
      </p>
    </div>
  </div>
));

export const ScratchpadTab = memo(({ scratchpadText, setScratchpadText }: any) => (
  <div className="flex-1 flex flex-col p-4 bg-[#0c0e12]">
    <textarea
      value={scratchpadText}
      onChange={(e) => setScratchpadText(e.target.value)}
      placeholder="Quick scratchpad for raw ideas, unformatted text, or copy-pasting..."
      className="flex-1 w-full bg-[#12151c] border border-slate-800 rounded-xl p-4 text-xs font-mono text-slate-300 outline-none resize-none focus:border-amber-500 transition-colors shadow-inner custom-scrollbar"
    />
  </div>
));

export const ConceptsTab = memo(() => {
  const coreConcepts = useManuscriptStore(state => state.coreConcepts) || [];
  const removeCoreConcept = useManuscriptStore(state => state.removeCoreConcept);
  const setSelectedChapterId = useManuscriptStore(state => state.setSelectedChapterId);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#0c0e12] custom-scrollbar">
      {coreConcepts.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center h-48 text-slate-500 text-xs font-mono px-4">
          <TagIcon size={28} className="mb-2 opacity-30 text-slate-400" />
          <span>No core concepts tagged yet.<br />Highlight text in the editor to tag.</span>
        </div>
      ) : (
        coreConcepts.map(concept => (
          <div key={concept.id} className="p-3 bg-[#12151c] border border-slate-700/80 rounded-xl space-y-2 relative group">
            <div className="flex justify-between items-start">
              <div className="font-bold text-amber-400 text-xs uppercase tracking-wide font-mono pr-6">
                {concept.term}
              </div>
              <button
                onClick={() => removeCoreConcept(concept.id)}
                className="absolute top-2 right-2 p-1 text-slate-500 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity rounded-md hover:bg-rose-950/30 cursor-pointer"
              >
                <XIcon size={12} />
              </button>
            </div>
            
            <button 
              onClick={() => setSelectedChapterId(concept.chapterId)}
              className="text-[10px] text-slate-400 bg-[#161a26] px-2 py-1 rounded flex items-center gap-1 hover:text-amber-400 hover:bg-amber-950/30 transition-colors cursor-pointer w-full text-left font-mono"
            >
              <MapPin size={10} />
              Jump to: {concept.context}
            </button>
          </div>
        ))
      )}
    </div>
  );
});