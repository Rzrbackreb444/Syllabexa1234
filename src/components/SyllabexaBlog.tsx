import React from 'react';
import { Helmet } from 'react-helmet-async';
import { ChevronRight, ArrowRight, BookOpen, Clock, Calendar, User, Brain, Cpu, Target, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function SyllabexaBlog() {
  return (
    <div className="min-h-screen bg-[#07080a] text-slate-200 selection:bg-indigo-500/30 font-sans">
      <Helmet>
        <title>Syllabexa Publishing Insights | AI Ghostwriting & Editorial Strategy</title>
        <meta name="description" content="Discover how Syllabexa is revolutionizing independent publishing with Neural Voice Training, CRDT Collaboration, and AI Ghostwriting. Learn the tactics for scaling your book production." />
        <meta name="keywords" content="AI Ghostwriting, Neural Voice Training, Independent Publishing, Book Autopilot, Syllabexa" />
        <link rel="canonical" href="https://syllabexa.com/blog" />
      </Helmet>

      {/* Navigation */}
      <nav className="border-b border-slate-800/60 bg-[#07080a]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <span className="font-serif font-black text-white text-lg leading-none">S</span>
            </div>
            <span className="font-bold text-white tracking-tight">Syllabexa</span>
          </Link>
          <div className="flex gap-4 items-center">
            <Link to="/app" className="text-sm font-semibold text-slate-300 hover:text-white transition-colors">Launch App</Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-24 pb-16 px-6">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
           <div className="w-[800px] h-[400px] bg-indigo-600 rounded-full blur-[150px]" />
        </div>
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            <h1 className="text-5xl md:text-6xl font-serif font-black text-white tracking-tight leading-tight">
              The Architecture of <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">Autopilot Publishing</span>
            </h1>
            <p className="text-lg text-slate-400 leading-relaxed font-sans">
              EEAT-optimized insights for modern media houses, digital authors, and agency ghostwriters scaling production through applied linguistics and neural generation models.
            </p>
          </div>
        </div>
      </section>

      {/* Premium Featured Post */}
      <section className="max-w-6xl mx-auto px-6 pb-24">
        <article className="bg-[#0c0e12] border border-slate-800/80 rounded-3xl overflow-hidden hover:border-slate-700 transition-all group flex flex-col md:flex-row">
          <div className="md:w-1/2 relative bg-slate-900 min-h-[300px]">
             {/* Using a rich CSS gradient as fallback for image */}
             <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-indigo-950 to-[#07080a] opacity-80" />
             <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wNykiLz48L3N2Zz4=')] opacity-50" />
             <div className="absolute inset-0 flex items-center justify-center">
                <Brain className="w-32 h-32 text-indigo-500/20 group-hover:scale-110 transition-transform duration-700" />
             </div>
             <div className="absolute top-4 left-4 bg-indigo-500 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-lg">
               Deep Dive
             </div>
          </div>
          <div className="p-8 md:p-12 md:w-1/2 flex flex-col justify-center">
            <div className="flex items-center gap-4 text-xs font-mono text-slate-500 mb-4">
              <span className="flex items-center gap-1"><Calendar size={12}/> Oct 24, 2026</span>
              <span className="flex items-center gap-1"><Clock size={12}/> 12 min read</span>
            </div>
            <h2 className="text-3xl font-bold text-white mb-4 leading-tight group-hover:text-indigo-300 transition-colors">
              How to Train Neural Voice Profiles for Agency Ghostwriting
            </h2>
            <p className="text-slate-400 mb-8 leading-relaxed">
              The paradigm of ghostwriting has fundamentally shifted. Instead of imitating an author's tone manually over months of iteration, modern agencies leverage linguistic modeling to establish immutable structural Voice Profiles. This guide breaks down the deterministic synthesis of pacing, vocabulary matrices, and semantic syntax.
            </p>
            <Link to="/blog" className="inline-flex items-center gap-2 text-indigo-400 font-bold uppercase tracking-wider text-xs hover:text-indigo-300 transition-colors">
              Read Technical Brief <ArrowRight size={14} />
            </Link>
          </div>
        </article>
      </section>

      {/* Grid Posts */}
      <section className="max-w-6xl mx-auto px-6 pb-32">
        <h3 className="text-2xl font-serif font-bold text-white mb-8 flex items-center gap-3">
          <Target className="text-amber-500" /> Operational Frameworks
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          
          {[
            {
              title: "The Mechanics of CRDT in Multi-User Book Editing",
              excerpt: "Why standard OT (Operational Transformation) fails in 100,000+ word documents, and how Syllabexa utilizes Yjs vectors for real-time editorial convergence.",
              date: "Oct 18, 2026", time: "8 min", tag: "Engineering", icon: <Cpu className="w-5 h-5 text-cyan-400" />
            },
            {
              title: "Structuring the Author's Bible: A Graph Database Approach",
              excerpt: "Stop using loose notes. Discover how mapping character arcs and setting locational lore into a semantic vector graph eliminates plot holes autonomously.",
              date: "Oct 12, 2026", time: "15 min", tag: "Methodology", icon: <BookOpen className="w-5 h-5 text-amber-400" />
            },
            {
              title: "Automated Pre-Press: From Web View to CMYK PDF",
              excerpt: "The math behind hyphenation algorithms, widow/orphan control, and generating print-ready margins without firing up InDesign.",
              date: "Oct 05, 2026", time: "10 min", tag: "Typography", icon: <FileText className="w-5 h-5 text-rose-400" />
            }
          ].map((post, i) => (
            <article key={i} className="bg-[#0f1115] border border-slate-800 rounded-2xl p-6 flex flex-col hover:border-slate-700 transition-colors">
              <div className="mb-4">
                <span className="bg-slate-900 border border-slate-800 text-slate-400 text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded inline-block">
                  {post.tag}
                </span>
              </div>
              <div className="mb-4 w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center">
                {post.icon}
              </div>
              <h4 className="text-lg font-bold text-white mb-3 leading-tight hover:text-indigo-300 transition-colors cursor-pointer">
                {post.title}
              </h4>
              <p className="text-sm text-slate-500 mb-6 flex-1">
                {post.excerpt}
              </p>
              <div className="flex items-center justify-between text-xs font-mono text-slate-600 border-t border-slate-800/80 pt-4">
                <span>{post.date}</span>
                <span>{post.time} read</span>
              </div>
            </article>
          ))}
          
        </div>
      </section>

      {/* SEO Footer */}
      <footer className="border-t border-slate-800 bg-[#040506] py-12 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
             <div className="w-6 h-6 rounded bg-slate-800 flex items-center justify-center">
               <span className="font-serif font-black text-white text-xs">S</span>
             </div>
             <span className="text-slate-400 text-sm font-bold tracking-tight">Syllabexa Inc.</span>
          </div>
          <p className="text-xs text-slate-600 font-mono">
            Enterprise Ghostwriting & Independent Publishing Operating System. All Rights Reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
