import React, { useState } from 'react';
import { Sparkles, FileText, Share2, Mail, Copy, CheckCircle2, ChevronRight } from 'lucide-react';
import { useManuscriptStore } from '../store/manuscriptStore';

export default function MarketingContentEngine() {
  const manuscript = useManuscriptStore();
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState<'press-kit' | 'social' | 'email' | 'blog'>('social');
  const [generatedAssets, setGeneratedAssets] = useState<{
    pressKit: string;
    socialCards: Array<{ platform: string; content: string }>;
    emailSequence: Array<{ subject: string; body: string }>;
    blogPost: string;
  } | null>(null);
  const [copiedStates, setCopiedStates] = useState<{ [key: string]: boolean }>({});

  const handleGenerate = () => {
    setIsGenerating(true);
    
    // Simulate Gemini/AI analysis of the manuscript to generate marketing assets
    setTimeout(() => {
      setGeneratedAssets({
        pressKit: `## ${manuscript.projectMeta?.title || 'Untitled Manuscript'} - Official Press Kit\n\n**Logline:** A compelling journey exploring deep themes of resilience and discovery.\n\n**Author Bio:** Written by a master storyteller pushing the boundaries of modern literature.\n\n**Target Demographics:** Adult Fiction, Literary Enthusiasts, Thriller Readers.\n\n**Key Themes:** Betrayal, Redemption, Identity.`,
        socialCards: [
          { platform: 'Twitter / X', content: `"A devastating, high-converting commercial hook." - Early Reader Review. Pre-order ${manuscript.projectMeta?.title || 'the book'} now! 📚✨` },
          { platform: 'Instagram', content: `Dive into the world of ${manuscript.projectMeta?.title || 'the book'}. Can you survive the twists? Link in bio to reserve your copy. #BookTok #NewRelease` },
          { platform: 'LinkedIn', content: `I'm thrilled to announce the upcoming release of my latest manuscript. A deep dive into human resilience. Check out the behind-the-scenes of my writing process.` }
        ],
        emailSequence: [
          { subject: "Cover Reveal: You won't believe this...", body: `Hey everyone,\n\nI'm so excited to finally share the cover for ${manuscript.projectMeta?.title || 'my new book'} with you!` },
          { subject: "Pre-orders are officially LIVE! 🚀", body: `The day is finally here. You can now pre-order your copy. Early supporters get a special bonus chapter.` }
        ],
        blogPost: `# The Making of ${manuscript.projectMeta?.title || 'the Book'}\n\nWriting this manuscript was a journey into the unknown. I wanted to explore the depths of human emotion and craft a narrative that resonates with readers long after the final page is turned...`
      });
      setIsGenerating(false);
    }, 2500);
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedStates(prev => ({ ...prev, [id]: true }));
    setTimeout(() => setCopiedStates(prev => ({ ...prev, [id]: false })), 2000);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden flex flex-col h-full">
      {/* Header */}
      <div className="px-6 py-5 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <Share2 size={20} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">Automated Marketing Engine</h2>
            <p className="text-xs text-slate-400 font-mono">Extract press kits, quote cards & email sequences from manuscript context.</p>
          </div>
        </div>
        <button
          onClick={handleGenerate}
          disabled={isGenerating || manuscript.chapters.length === 0}
          className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-purple-600/20 transition-all flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isGenerating ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Sparkles size={14} />}
          <span>{isGenerating ? 'Extracting Context...' : 'Generate Campaigns'}</span>
        </button>
      </div>

      {!generatedAssets && !isGenerating && (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
          <div className="w-16 h-16 bg-slate-800/50 rounded-2xl flex items-center justify-center text-slate-500 mb-4">
            <Sparkles size={32} />
          </div>
          <h3 className="text-slate-300 font-semibold">No Assets Generated</h3>
          <p className="text-slate-500 text-sm max-w-sm mt-2">Click generate to let the AI analyze your manuscript and create a full suite of marketing materials.</p>
        </div>
      )}

      {isGenerating && (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4">
          <div className="w-12 h-12 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin" />
          <div className="text-sm font-mono text-slate-400">Analyzing narrative arcs & stylistic themes...</div>
        </div>
      )}

      {generatedAssets && (
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Sidebar */}
          <div className="w-full md:w-48 bg-slate-950/40 border-r border-slate-800 p-3 flex flex-row md:flex-col gap-2 overflow-x-auto">
            {[
              { id: 'press-kit', label: 'Press Kit', icon: FileText },
              { id: 'social', label: 'Social Quote Cards', icon: Share2 },
              { id: 'email', label: 'Email Sequence', icon: Mail },
              { id: 'blog', label: 'AEO Blog Post', icon: FileText },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                  activeTab === tab.id 
                    ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30' 
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-transparent'
                }`}
              >
                <tab.icon size={14} />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Content Area */}
          <div className="flex-1 p-6 overflow-y-auto">
            {activeTab === 'press-kit' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white">Official Press Kit</h3>
                  <button onClick={() => handleCopy(generatedAssets.pressKit, 'pressKit')} className="text-slate-400 hover:text-white p-1.5 bg-slate-800 rounded-lg">
                    {copiedStates['pressKit'] ? <CheckCircle2 size={14} className="text-emerald-400" /> : <Copy size={14} />}
                  </button>
                </div>
                <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-sm text-slate-300 whitespace-pre-wrap font-serif leading-relaxed">
                  {generatedAssets.pressKit}
                </div>
              </div>
            )}

            {activeTab === 'social' && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-white">Social Media Quote Cards</h3>
                <div className="grid grid-cols-1 gap-4">
                  {generatedAssets.socialCards.map((card, idx) => (
                    <div key={idx} className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono text-purple-400 uppercase tracking-wider px-2 py-0.5 bg-purple-900/30 rounded-md">
                          {card.platform}
                        </span>
                        <button onClick={() => handleCopy(card.content, `social_${idx}`)} className="text-slate-500 hover:text-white">
                          {copiedStates[`social_${idx}`] ? <CheckCircle2 size={14} className="text-emerald-400" /> : <Copy size={14} />}
                        </button>
                      </div>
                      <p className="text-sm text-slate-200">{card.content}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'email' && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-white">Launch Email Sequence</h3>
                <div className="space-y-4">
                  {generatedAssets.emailSequence.map((email, idx) => (
                    <div key={idx} className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-300">Subject: {email.subject}</span>
                        <button onClick={() => handleCopy(email.body, `email_${idx}`)} className="text-slate-500 hover:text-white p-1 bg-slate-900 rounded">
                          {copiedStates[`email_${idx}`] ? <CheckCircle2 size={14} className="text-emerald-400" /> : <Copy size={14} />}
                        </button>
                      </div>
                      <div className="w-full h-px bg-slate-800" />
                      <p className="text-sm text-slate-400 whitespace-pre-wrap">{email.body}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'blog' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white">AEO / SEO Blog Post</h3>
                  <button onClick={() => handleCopy(generatedAssets.blogPost, 'blogPost')} className="text-slate-400 hover:text-white p-1.5 bg-slate-800 rounded-lg">
                    {copiedStates['blogPost'] ? <CheckCircle2 size={14} className="text-emerald-400" /> : <Copy size={14} />}
                  </button>
                </div>
                <div className="p-5 bg-slate-950 rounded-xl border border-slate-800 text-sm text-slate-300 whitespace-pre-wrap font-serif leading-relaxed">
                  {generatedAssets.blogPost}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
