import React, { useState } from 'react';
import { Activity, MessageSquare, BookOpen, LineChart, CheckCircle2 } from 'lucide-react';
import { useToast } from '../lib/ToastContext';

export default function ReaderAnalyticsLoop() {
  const { showToast } = useToast();
  const [embedAnalytics, setEmbedAnalytics] = useState(true);
  const [embedFeedback, setEmbedFeedback] = useState(true);

  return (
    <div className="bg-[#0a0a0d] border border-white/5 rounded-2xl p-6 space-y-6 font-sans">
      <div className="flex items-center justify-between border-b border-white/5 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <LineChart size={20} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white tracking-wide uppercase font-mono">Reader Feedback & In-Book Analytics</h2>
            <p className="text-[11px] text-slate-400 font-mono">Embed privacy-compliant tracking and feedback loops directly into exported EPUBs and Web Readers.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-[10px] font-mono text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Activity size={14} className="text-cyan-400" /> Reading Progress Analytics
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" checked={embedAnalytics} onChange={(e) => setEmbedAnalytics(e.target.checked)} className="sr-only peer" />
                <div className="w-9 h-5 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-cyan-500"></div>
              </label>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Injects lightweight, anonymized tracking pixels into chapter endpoints for EPUBs. When opened in connected readers, this pings your dashboard to show chapter completion rates and drop-off points.
            </p>
          </div>
          
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-[10px] font-mono text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <MessageSquare size={14} className="text-cyan-400" /> End-of-Book Feedback Loop
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" checked={embedFeedback} onChange={(e) => setEmbedFeedback(e.target.checked)} className="sr-only peer" />
                <div className="w-9 h-5 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-cyan-500"></div>
              </label>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Appends a dynamic "Reader Feedback" chapter at the end of the book, linking directly to a review submission form on your storefront, helping convert readers into reviewers and mailing list subscribers.
            </p>
          </div>
        </div>

        <div className="bg-black/40 border border-white/5 p-5 rounded-xl flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold text-white font-mono uppercase mb-4 flex items-center gap-2">
              <BookOpen size={14} className="text-slate-400" /> EPUB Export Preview
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-white/5 border border-white/10 rounded-lg opacity-50">
                <div className="w-6 h-6 rounded bg-slate-800 flex items-center justify-center text-[10px] font-mono">11</div>
                <div className="text-xs text-slate-300">Chapter 11: The Climax</div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-white/5 border border-white/10 rounded-lg opacity-50">
                <div className="w-6 h-6 rounded bg-slate-800 flex items-center justify-center text-[10px] font-mono">12</div>
                <div className="text-xs text-slate-300">Chapter 12: Resolution</div>
              </div>
              
              <div className="flex flex-col gap-2 p-3 bg-cyan-900/20 border border-cyan-500/30 rounded-lg relative overflow-hidden">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded bg-cyan-900 flex items-center justify-center text-cyan-400">
                    <CheckCircle2 size={12} />
                  </div>
                  <div className="text-xs font-bold text-cyan-100">Interactive Appendix: Reader Survey</div>
                </div>
                {embedFeedback ? (
                  <p className="text-[10px] text-cyan-200/70 ml-9">Appended automatically on export.</p>
                ) : (
                  <p className="text-[10px] text-rose-300/70 ml-9 line-through">Disabled</p>
                )}
              </div>
            </div>
          </div>
          
          <button 
            onClick={() => showToast('Analytics configuration applied to next export bundle.', 'success')}
            className="mt-6 w-full py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-mono font-bold transition-all"
          >
            Apply to Next Export
          </button>
        </div>
      </div>
    </div>
  );
}
