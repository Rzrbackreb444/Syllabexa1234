import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Users, 
  MessageSquare, 
  Share2, 
  Sparkles, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Clock,
  Copy,
  Check,
  Bot
} from 'lucide-react';
import { CommentItem, Chapter } from '../types';
import { useToast } from '../lib/ToastContext';

interface CollaborationPanelProps {
  comments: CommentItem[];
  chapters: Chapter[];
  onUpdateComments: (updatedComments: CommentItem[]) => void;
  activeChapterId: string | null;
}

export default function CollaborationPanel({
  comments,
  chapters, // Kept for potential future expansions (e.g., chapter titles in feed)
  onUpdateComments,
  activeChapterId
}: CollaborationPanelProps) {
  const [newCommentText, setNewCommentText] = useState('');
  const [commentAuthor, setCommentAuthor] = useState('');
  
  // AI Synthesis State
  const [isSummarising, setIsSummarising] = useState(false);
  const [summarisedChecklist, setSummarisedChecklist] = useState<string>('');

  // Share Link State
  const [shareExpiresIn, setShareExpiresIn] = useState<'3days' | '7days' | 'never'>('7days');
  const [shareRole, setShareRole] = useState<'reader' | 'proofreader' | 'editor' | 'ghostwriter'>('reader');
  const [generatedShareLink, setGeneratedShareLink] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  
  const { showToast } = useToast();
  const debounceTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) window.clearTimeout(debounceTimerRef.current);
    };
  }, []);

  // --- OPTIMIZED HANDLERS ---
  const handlePostComment = useCallback(() => {
    if (!newCommentText.trim() || !activeChapterId) return;

    const newItem: CommentItem = {
      id: `comm-${Date.now()}`,
      author: commentAuthor.trim() || 'Beta Reader',
      text: newCommentText.trim(),
      timestamp: new Date().toISOString(),
      resolved: false,
      chapterId: activeChapterId
    };

    onUpdateComments([...comments, newItem]);
    setNewCommentText('');
    showToast('Editorial comment posted to chapter.', 'success');
  }, [newCommentText, commentAuthor, activeChapterId, comments, onUpdateComments, showToast]);

  const handleToggleResolve = useCallback((id: string) => {
    onUpdateComments(comments.map(c => 
      c.id === id ? { ...c, resolved: !c.resolved } : c
    ));
    showToast('Comment resolution toggled.', 'info');
  }, [comments, onUpdateComments, showToast]);

  const handleDeleteComment = useCallback((id: string) => {
    onUpdateComments(comments.filter(c => c.id !== id));
    showToast('Comment purged.', 'info');
  }, [comments, onUpdateComments, showToast]);

  const handleGenerateShareLink = () => {
    const hash = Math.random().toString(36).substring(2, 10);
    const link = `${window.location.origin}/share/project-${hash}?expires=${shareExpiresIn}`;
    setGeneratedShareLink(link);
    setIsCopied(false);
    showToast('Secure sharing endpoint generated.', 'success');
  };

  const handleCopyLink = () => {
    if (!generatedShareLink) return;
    navigator.clipboard.writeText(generatedShareLink);
    setIsCopied(true);
    showToast('Link copied to clipboard.', 'success');
    setTimeout(() => setIsCopied(false), 2500);
  };

  const handleSummariseComments = async () => {
    const activeComments = comments.filter(c => c.chapterId === activeChapterId);
    if (activeComments.length === 0) {
      showToast('No active comments to consolidate in this chapter.', 'error');
      return;
    }
    
    setIsSummarising(true);
    setSummarisedChecklist('');
    showToast('Synthesizing beta feedback into action items...', 'info');

    try {
      if (debounceTimerRef.current) window.clearTimeout(debounceTimerRef.current);

      debounceTimerRef.current = window.setTimeout(() => {
        // Simulated AI Orchestrator Response
        const mockChecklist = "## AI Actionable Task Checklist\n\n- [ ] **Pacing & Flow**: Adjust opening hook to accelerate technical pacing.\n- [ ] **Continuity Check**: Verify consistency of technical terms (e.g., extractor G-force ratings).\n- [ ] **Character Arc**: Expand backstory notes for co-author perspective.";
        setSummarisedChecklist(mockChecklist);
        setIsSummarising(false);
        showToast('Feedback successfully consolidated.', 'success');
      }, 1500);
    } catch (err) {
      console.error(err);
      setSummarisedChecklist("An error occurred during consolidation.");
      setIsSummarising(false);
    }
  };

  const activeComments = comments.filter(c => c.chapterId === activeChapterId);

  return (
    <div className="flex flex-col h-full bg-[#07080a] text-slate-200 font-sans select-none relative z-0">
      
      {/* Premium Header Bar */}
      <div className="h-16 bg-[#0c0e12] border-b border-white/5 px-8 flex items-center justify-between shrink-0 shadow-lg z-10">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.15)]">
            <Users size={20} />
          </div>
          <div>
            <h2 className="text-xs font-mono font-bold text-slate-100 uppercase tracking-widest flex items-center gap-2">
              <span>Collaboration & Beta Hub</span>
              <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 text-[9px] border border-amber-500/30">LIVE SYNC</span>
            </h2>
            <p className="text-[10px] text-slate-500 font-mono mt-0.5">Manage co-author critiques, beta notes, and AI task consolidation</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 flex-1 p-8 overflow-y-auto max-w-7xl mx-auto w-full custom-scrollbar">
        
        {/* Left Side: Controls & Inputs */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Share Link Generator */}
          <div className="bg-[#0c0e12] border border-white/5 rounded-3xl p-6 shadow-2xl space-y-5">
            <h4 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-widest flex items-center gap-2 border-b border-white/5 pb-3">
              <Share2 size={16} className="text-amber-400" />
              <span>Secure Reader Gateway</span>
            </h4>
            
            <div className="flex gap-3">
              <select
                value={shareRole}
                onChange={e => setShareRole(e.target.value as any)}
                className="bg-black/40 border border-white/10 rounded-xl px-3 py-3 text-xs font-mono text-slate-300 outline-none cursor-pointer focus:border-amber-500/50 transition-colors shadow-inner"
              >
                <option value="reader">Beta Reader (View Only)</option>
                <option value="proofreader">Proofreader (Comment Only)</option>
                <option value="editor">Editor (Track Changes)</option>
                <option value="ghostwriter">Ghostwriter (Full Write Access)</option>
              </select>
              <select
                value={shareExpiresIn}
                onChange={e => setShareExpiresIn(e.target.value as any)}
                className="bg-black/40 border border-white/10 rounded-xl px-3 py-3 text-xs font-mono text-slate-300 outline-none cursor-pointer focus:border-amber-500/50 transition-colors shadow-inner"
              >
                <option value="3days">72 Hours</option>
                <option value="7days">7 Days</option>
                <option value="never">Permanent</option>
              </select>
              <button
                onClick={handleGenerateShareLink}
                className="flex-1 bg-amber-500 hover:bg-amber-400 text-black font-mono font-black text-xs py-3 px-2 rounded-xl cursor-pointer transition-all shadow-[0_0_15px_rgba(245,158,11,0.2)] uppercase tracking-wider text-center"
              >
                Generate
              </button>
            </div>

            {/* OPTIMIZATION: Real Copy-to-Clipboard UX */}
            {generatedShareLink && (
              <div className="pt-2 animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center gap-2 bg-black/60 border border-amber-500/30 rounded-xl p-1.5 pl-4 shadow-inner group">
                  <input
                    type="text"
                    readOnly
                    value={generatedShareLink}
                    className="flex-1 bg-transparent text-[11px] font-mono outline-none text-amber-400/90 truncate selection:bg-amber-500/30"
                  />
                  <button 
                    onClick={handleCopyLink}
                    className="p-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 rounded-lg transition-colors border border-transparent hover:border-amber-500/30 shrink-0"
                    title="Copy to clipboard"
                  >
                    {isCopied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Add Feedback Form */}
          <div className="bg-[#0c0e12] border border-white/5 rounded-3xl p-6 shadow-2xl space-y-5">
            <h4 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-widest flex items-center gap-2 border-b border-white/5 pb-3">
              <Plus size={16} className="text-amber-400" />
              <span>Inject Editorial Note</span>
            </h4>
            
            <div className="space-y-4">
              <div className="group">
                <label className="block text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-2 group-focus-within:text-amber-500 transition-colors">
                  Alias / Role
                </label>
                <input
                  type="text"
                  value={commentAuthor}
                  onChange={e => setCommentAuthor(e.target.value)}
                  className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-sm text-slate-200 outline-none focus:border-amber-500/50 transition-colors shadow-inner"
                  placeholder="e.g. Lead Editor Sarah"
                />
              </div>
              <div className="group">
                <label className="block text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-2 group-focus-within:text-amber-500 transition-colors">
                  Manuscript Feedback
                </label>
                <textarea
                  value={newCommentText}
                  onChange={e => setNewCommentText(e.target.value)}
                  className="w-full h-28 bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-sm text-slate-200 outline-none focus:border-amber-500/50 transition-colors resize-none shadow-inner custom-scrollbar"
                  placeholder="Draft pacing, continuity errors, or structural notes here..."
                />
              </div>
            </div>

            <button
              onClick={handlePostComment}
              disabled={!newCommentText.trim() || !activeChapterId}
              className="w-full bg-amber-500 hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed text-black font-mono font-black text-xs py-3.5 rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all shadow-[0_0_15px_rgba(245,158,11,0.2)] uppercase tracking-wider"
            >
              <MessageSquare size={16} />
              <span>Commit to Chapter</span>
            </button>
          </div>
        </div>

        {/* Right Side: The Feedback Feed & AI Orchestrator */}
        <div className="lg:col-span-7 flex flex-col bg-[#0c0e12] border border-white/5 rounded-3xl p-6 shadow-2xl h-[calc(100vh-12rem)] overflow-hidden">
          
          <div className="flex justify-between items-center mb-5 pb-4 border-b border-white/5 shrink-0">
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">
              Active Chapter Log ({activeComments.length})
            </span>
            
            {activeComments.length > 0 && (
              <button
                onClick={handleSummariseComments}
                disabled={isSummarising}
                className="flex items-center gap-2 text-[10px] font-mono font-bold bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 px-4 py-2 rounded-lg transition-all cursor-pointer shadow-sm disabled:opacity-50"
              >
                {isSummarising ? (
                  <span className="w-3.5 h-3.5 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Sparkles size={14} />
                )}
                <span>{isSummarising ? "SYNTHESIZING..." : "AI CONSOLIDATE"}</span>
              </button>
            )}
          </div>

          {/* AI Orchestrator Output Area */}
          {summarisedChecklist && (
            <div className="bg-black/40 border border-amber-500/30 rounded-2xl p-5 mb-5 text-sm shadow-[0_0_20px_rgba(245,158,11,0.05)] animate-in fade-in slide-in-from-top-4 shrink-0 relative overflow-hidden">
              {/* Premium Glow Effect */}
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-500/50 to-transparent opacity-50" />
              
              <h4 className="text-[11px] font-mono font-bold text-amber-400 flex items-center gap-2 mb-3 uppercase tracking-wider">
                <Bot size={14} />
                <span>Orchestrator Task Protocol</span>
              </h4>
              <div className="font-mono text-xs whitespace-pre-wrap leading-relaxed text-slate-300 max-h-[200px] overflow-y-auto custom-scrollbar bg-black/30 border border-white/5 p-4 rounded-xl shadow-inner">
                {summarisedChecklist}
              </div>
            </div>
          )}

          {/* Comment Feed */}
          {activeComments.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-2xl p-8 text-center bg-black/20">
              <MessageSquare size={40} className="mb-4 text-slate-700" />
              <p className="text-slate-500 text-xs font-mono uppercase tracking-widest leading-relaxed">
                No telemetry found for this chapter.<br />Distribute secure link to begin beta phase.
              </p>
            </div>
          ) : (
            <div className="space-y-3 flex-1 overflow-y-auto pr-2 custom-scrollbar">
              {activeComments.map((comm) => (
                <div 
                  key={comm.id} 
                  className={`p-5 rounded-2xl border flex justify-between gap-4 transition-all duration-300 group ${
                    comm.resolved 
                      ? 'bg-black/30 border-white/5 opacity-50 grayscale hover:grayscale-0' 
                      : 'bg-[#12151c] border-white/10 hover:border-amber-500/30 shadow-lg'
                  }`}
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <span className={`text-sm font-serif font-bold ${comm.resolved ? 'text-slate-400 line-through' : 'text-amber-400'}`}>
                        {comm.author}
                      </span>
                      <span className="text-[10px] font-mono text-slate-500 flex items-center gap-1 bg-black/40 px-2 py-0.5 rounded-md border border-white/5">
                        <Clock size={10} />
                        {new Date(comm.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                    <p className={`text-sm leading-relaxed ${comm.resolved ? 'text-slate-500' : 'text-slate-300'}`}>
                      {comm.text}
                    </p>
                  </div>

                  {/* OPTIMIZATION: Actions hidden until hover for cleaner UI */}
                  <div className="flex flex-col sm:flex-row items-center gap-2 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleToggleResolve(comm.id)}
                      className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                        comm.resolved 
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20' 
                          : 'bg-black/40 border-white/10 text-slate-400 hover:text-emerald-400 hover:border-emerald-500/30'
                      }`}
                      title={comm.resolved ? "Re-open comment" : "Resolve comment"}
                    >
                      <CheckCircle2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteComment(comm.id)}
                      className="p-2.5 bg-black/40 border border-white/10 text-slate-400 hover:text-rose-400 hover:border-rose-500/30 hover:bg-rose-500/10 rounded-xl cursor-pointer transition-all"
                      title="Purge Comment"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}