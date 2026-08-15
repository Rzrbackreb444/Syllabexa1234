import React, { useState } from 'react';
import { Sparkles, AlertCircle, RefreshCw, PenTool, Flame, Heart, Info, ArrowRight } from 'lucide-react';
import { VoiceProfile } from './SyllabexaVoiceTrainer';

interface EditorialAgentProps {
  chapterTitle: string;
  chapterText: string;
  voiceProfile: VoiceProfile | null;
  onReviewComplete: (score: number) => void;
}

export default function SyllabexaEditorialAgent({ chapterTitle, chapterText, voiceProfile, onReviewComplete }: EditorialAgentProps) {
  const [isReviewing, setIsReviewing] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [issues, setIssues] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleReview = async () => {
    if (!chapterText.trim()) {
      setError("Active chapter text is empty. Write or generate some content first.");
      return;
    }

    setIsReviewing(true);
    setError(null);
    try {
      const response = await fetch('/api/syllabexa/review-chapter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chapterText,
          voiceProfile
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to analyze chapter.");
      }

      const result = await response.json();
      setScore(result.score);
      setIssues(result.issues || []);
      setSuggestions(result.suggestions || []);
      onReviewComplete(result.score);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An error occurred while reviewing the chapter.");
    } finally {
      setIsReviewing(false);
    }
  };

  const getScoreColor = (num: number) => {
    if (num >= 85) return "text-emerald-300 bg-emerald-950/40 border-emerald-800/60";
    if (num >= 65) return "text-amber-300 bg-amber-950/40 border-amber-800/60";
    return "text-rose-300 bg-rose-950/40 border-rose-800/60";
  };

  return (
    <aside aria-label="Syllabexa Editorial Agent" className="p-6 max-w-4xl mx-auto space-y-8 animate-fade-in text-slate-200 bg-[#07080a] min-h-screen custom-scrollbar">
      <div className="flex items-center gap-3 border-b border-slate-800 pb-4 bg-[#0c0e12] px-6 py-4 rounded-3xl shadow-lg">
        <div className="p-3 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-2xl">
          <PenTool size={24} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-100">Syllabexa Editorial Agent</h2>
          <p className="text-sm text-slate-400">Score and critique chapters against your locked voice profile to guarantee absolute consistency.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-[#0c0e12] p-6 border border-slate-800 rounded-3xl shadow-sm space-y-4">
            <div>
              <h4 className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">Current Chapter Target</h4>
              <p className="font-bold text-sm text-slate-100 mt-1 truncate">"{chapterTitle || "Untitled Chapter"}"</p>
              <p className="text-[11px] text-slate-500 mt-0.5 font-mono">{chapterText.split(/\s+/).filter(Boolean).length} Words</p>
            </div>

            {voiceProfile ? (
              <div className="p-3.5 bg-[#12151c] border border-slate-800 rounded-2xl space-y-1.5 text-[11px]">
                <h5 className="font-mono font-bold text-slate-200 flex items-center gap-1.5 uppercase tracking-wider text-[10px] text-amber-400">
                  <Flame size={12} />
                  Locked Voice Target
                </h5>
                <p className="text-slate-400 font-medium">Tone: <span className="text-slate-200 font-semibold">{voiceProfile.tone}</span></p>
                <p className="text-slate-400 font-medium">POV: <span className="text-slate-200 font-semibold">{voiceProfile.pov}</span></p>
              </div>
            ) : (
              <div className="p-3.5 bg-amber-950/30 border border-amber-500/30 rounded-2xl text-[10px] font-mono text-amber-300 leading-relaxed">
                <Info size={11} className="inline mr-1" />
                Reviewing against Standard Author Voice guidelines. Setup a profile in Voice Trainer for surgical voice audits.
              </div>
            )}

            {error && (
              <div className="p-3.5 bg-rose-950/40 text-rose-300 text-xs rounded-2xl border border-rose-900/60 font-sans">
                {error}
              </div>
            )}

            <button
              onClick={handleReview}
              disabled={isReviewing}
              className="w-full py-3.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-mono text-xs font-black uppercase tracking-widest rounded-2xl transition-all shadow-xl shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer border border-amber-300"
            >
              {isReviewing ? (
                <>
                  <RefreshCw size={13} className="animate-spin" />
                  Auditing Linguistic Fit...
                </>
              ) : (
                <>
                  <Sparkles size={13} />
                  Critique Style & Voice
                </>
              )}
            </button>
          </div>
        </div>

        <div className="lg:col-span-8">
          {score !== null ? (
            <div className="space-y-6">
              <div className={`p-6 border rounded-3xl flex flex-col md:flex-row items-center gap-6 justify-between shadow-lg ${getScoreColor(score)}`}>
                <div className="text-center md:text-left space-y-1">
                  <h4 className="font-mono font-bold text-xs uppercase tracking-wider text-slate-400">Voice Alignment Index</h4>
                  <p className="text-2xl font-black text-slate-100 font-serif">
                    {score >= 85 ? "Linguistic Perfection" : score >= 65 ? "Aesthetic Drift Found" : "Critical Rewrite Required"}
                  </p>
                  <p className="text-xs text-slate-400 max-w-sm leading-relaxed font-sans">
                    Syllabexa Editorial Agent evaluated the syntax pacing, word choice, and attitude parameters.
                  </p>
                </div>

                <div className="flex flex-col items-center">
                  <div className="w-24 h-24 rounded-full border-8 border-amber-500/20 flex items-center justify-center bg-[#0c0e12] shadow-sm shrink-0 border-slate-800">
                    <span className="text-3xl font-black text-amber-400 font-mono">{score}%</span>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-amber-400/80 mt-2 uppercase tracking-widest">Voice Match</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-[#0c0e12] p-6 border border-slate-800 rounded-3xl space-y-3 shadow-sm">
                  <div className="flex items-center gap-2 text-xs font-mono font-bold text-rose-400 uppercase tracking-wider">
                    <AlertCircle size={14} />
                    Style Drift Issues ({issues.length})
                  </div>
                  <ul className="space-y-2">
                    {issues.length === 0 ? (
                      <li className="text-slate-500 text-xs leading-relaxed italic font-sans">No structural voice drift detected. Spectacular match!</li>
                    ) : (
                      issues.map((issue, idx) => (
                        <li key={idx} className="p-3 bg-rose-950/20 text-rose-200 text-xs rounded-2xl border border-rose-900/40 flex gap-2 leading-relaxed items-start font-sans">
                          <span className="text-rose-400 mt-0.5 shrink-0 font-bold">•</span>
                          <span>{issue}</span>
                        </li>
                      ))
                    )}
                  </ul>
                </div>

                <div className="bg-[#0c0e12] p-6 border border-slate-800 rounded-3xl space-y-3 shadow-sm">
                  <div className="flex items-center gap-2 text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider">
                    <Sparkles size={14} />
                    Rewrite Action Items ({suggestions.length})
                  </div>
                  <ul className="space-y-2">
                    {suggestions.length === 0 ? (
                      <li className="text-slate-500 text-xs leading-relaxed italic font-sans">Prose flows smoothly. No actions recommended.</li>
                    ) : (
                      suggestions.map((sug, idx) => (
                        <li key={idx} className="p-3 bg-emerald-950/20 text-emerald-200 text-xs rounded-2xl border border-emerald-900/40 flex gap-2 leading-relaxed items-start font-sans">
                          <ArrowRight size={13} className="text-emerald-400 mt-0.5 shrink-0 font-bold" />
                          <span>{sug}</span>
                        </li>
                      ))
                    )}
                  </ul>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-[#0c0e12] border border-slate-800 rounded-3xl p-12 text-center text-slate-500 space-y-4 flex flex-col items-center justify-center h-full min-h-[300px]">
              <div className="p-4 bg-[#12151c] border border-slate-800 rounded-2xl animate-bounce">
                <PenTool size={32} className="text-amber-400 opacity-80" />
              </div>
              <div>
                <p className="font-bold text-sm text-slate-300 font-sans">Pending style evaluation</p>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 font-sans">
                  Draft or load a chapter and click "Critique Style & Voice" on the left to measure alignment.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}