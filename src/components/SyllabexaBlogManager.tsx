import React, { useState } from 'react';
import { Send, FileText, Loader2, Feather, CheckCircle2 } from 'lucide-react';
import { useVoiceStore } from '../store/voiceStore';

export default function SyllabexaBlogManager() {
  const { profiles, activeProfileId } = useVoiceStore();
  const activeProfile = profiles.find(p => p.id === activeProfileId);
  const [topic, setTopic] = useState('');
  const [email, setEmail] = useState('');
  const [blogContent, setBlogContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error' | null; message: string }>({ type: null, message: '' });

  const handleGenerate = async () => {
    if (!topic) return;
    setIsGenerating(true);
    setStatus({ type: null, message: '' });
    
    try {
      const response = await fetch('/api/syllabexa/generate-blog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, voiceProfile: activeProfile }),
      });
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to generate blog');
      
      setBlogContent(data.content);
    } catch (err: any) {
      setStatus({ type: 'error', message: err.message });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSendNewsletter = async () => {
    if (!blogContent || !email) return;
    setIsSending(true);
    setStatus({ type: null, message: '' });
    
    try {
      const response = await fetch('/api/resend/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, subject: `New Post: ${topic}`, content: blogContent }),
      });
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to send newsletter');
      
      setStatus({ type: 'success', message: 'Newsletter dispatched to readers!' });
    } catch (err: any) {
      setStatus({ type: 'error', message: err.message });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto space-y-8 font-serif">
      <header className="space-y-2">
        <div className="flex items-center gap-3">
          <Feather className="w-6 h-6 text-amber-500" />
          <h2 className="text-3xl font-bold text-slate-100">Automated Blog Studio</h2>
        </div>
        <p className="text-slate-400 font-sans">Generate literary posts matching your Author Voice Profile and dispatch them via Resend.</p>
      </header>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="space-y-4 bg-[#12151c] p-6 rounded-xl border border-slate-800">
            <h3 className="text-lg font-bold text-slate-200">1. Draft Content</h3>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest font-sans">Topic / Premise</label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g., The philosophy of time travel in modern sci-fi"
                className="w-full bg-[#0c0e12] border border-slate-700 rounded-lg px-4 py-3 text-slate-200 focus:outline-none focus:border-amber-500 font-sans"
              />
            </div>
            <button
              onClick={handleGenerate}
              disabled={isGenerating || !topic}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-lg transition-colors disabled:opacity-50 font-sans"
            >
              {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <FileText className="w-5 h-5" />}
              {isGenerating ? 'Drafting Neural Prose...' : 'Generate Post'}
            </button>
          </div>

          <div className="space-y-4 bg-[#12151c] p-6 rounded-xl border border-slate-800">
            <h3 className="text-lg font-bold text-slate-200">2. Dispatch Newsletter</h3>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest font-sans">Subscriber Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="subscriber@example.com"
                className="w-full bg-[#0c0e12] border border-slate-700 rounded-lg px-4 py-3 text-slate-200 focus:outline-none focus:border-amber-500 font-sans"
              />
            </div>
            <button
              onClick={handleSendNewsletter}
              disabled={isSending || !blogContent || !email}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-lg transition-colors disabled:opacity-50 font-sans shadow-lg shadow-amber-900/20"
            >
              {isSending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
              {isSending ? 'Transmitting...' : 'Send to Subscribers'}
            </button>

            {status.message && (
              <div className={`p-4 rounded-lg flex items-start gap-3 font-sans text-sm ${status.type === 'success' ? 'bg-emerald-900/20 text-emerald-400 border border-emerald-800' : 'bg-red-900/20 text-red-400 border border-red-800'}`}>
                {status.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <Feather className="w-5 h-5 shrink-0" />}
                <p>{status.message}</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-[#12151c] p-6 rounded-xl border border-slate-800 flex flex-col h-[600px]">
          <h3 className="text-lg font-bold text-slate-200 mb-4">Preview</h3>
          <textarea
            value={blogContent}
            onChange={(e) => setBlogContent(e.target.value)}
            placeholder="Generated content will appear here..."
            className="flex-1 w-full bg-[#0c0e12] border border-slate-700 rounded-lg p-6 text-slate-300 focus:outline-none focus:border-amber-500 leading-relaxed resize-none custom-scrollbar font-serif"
          />
        </div>
      </div>
    </div>
  );
}
