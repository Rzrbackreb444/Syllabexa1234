import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Award, ArrowRight, BookOpen } from 'lucide-react';
import { blogs } from '../data/blogs';

export default function SyllabexaBlogHub() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
      {/* Header */}
      <nav className="flex items-center justify-between px-8 py-6 border-b border-white/10 bg-black/50 backdrop-blur-md sticky top-0 z-50">
        <div className="text-xl font-black tracking-tighter text-indigo-400 cursor-pointer" onClick={() => navigate('/')}>SYLLABEXA.</div>
        <button onClick={() => navigate('/app')} className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-indigo-500/20">
          Launch App Studio
        </button>
      </nav>

      {/* Hero / Authority Section */}
      <header className="max-w-4xl mx-auto px-6 py-20 text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-indigo-400 text-[10px] font-mono uppercase tracking-widest font-bold">
          <Award className="w-3.5 h-3.5" /> EEAT Verified Publishing Research
        </div>
        <h1 className="text-4xl sm:text-6xl font-serif font-black tracking-tight leading-tight">
          The Enterprise Guide to <span className="text-indigo-400">Generative Publishing</span>
        </h1>
        <p className="text-slate-400 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
          Authoritative architectural breakdowns, algorithmic manuscript layout strategies, and multi-agent ghostwriting frameworks engineered for professional creators.
        </p>
      </header>

      {/* Featured SEO Optimized Article (First one) */}
      <main className="max-w-4xl mx-auto px-6 pb-24 space-y-16">
        {blogs.length > 0 && (
          <article className="bg-slate-900/60 border border-indigo-500/20 rounded-3xl p-8 sm:p-12 space-y-8 backdrop-blur-sm shadow-2xl relative overflow-hidden group cursor-pointer" onClick={() => navigate('/blog/' + blogs[0].slug)}>
            <div className="absolute top-0 right-0 p-4">
               <span className="bg-indigo-500 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">Featured</span>
            </div>
            <div className="flex items-center gap-4 text-xs font-mono text-slate-400">
              <span>Published: {blogs[0].date}</span>
              <span>•</span>
              <span className="text-indigo-400 font-bold">{blogs[0].readTime}</span>
              <span>•</span>
              <span>Authored by {blogs[0].author}</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-white leading-snug group-hover:text-indigo-400 transition-colors">
              {blogs[0].title}
            </h2>
            <div className="text-slate-300 leading-relaxed font-light text-base sm:text-lg line-clamp-3" dangerouslySetInnerHTML={{ __html: blogs[0].content }} />
            
            <div className="pt-8 border-t border-white/10 flex items-center justify-between gap-4">
              <span className="text-xs text-indigo-400 font-bold uppercase tracking-widest flex items-center gap-2 group-hover:gap-3 transition-all">Read Full Article <ArrowRight className="w-4 h-4" /></span>
            </div>
          </article>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {blogs.slice(1).map((blog, idx) => (
             <article key={idx} onClick={() => navigate('/blog/' + blog.slug)} className="bg-slate-900/40 hover:bg-slate-900/80 border border-white/5 hover:border-indigo-500/30 rounded-2xl p-6 sm:p-8 space-y-6 transition-all cursor-pointer group flex flex-col">
               <div className="flex items-center gap-3 text-[10px] font-mono text-slate-500 uppercase tracking-widest">
                  <span className="text-indigo-400 font-bold">{blog.readTime}</span>
                  <span>•</span>
                  <span>{blog.date}</span>
               </div>
               <h3 className="text-xl sm:text-2xl font-serif font-bold text-white leading-snug group-hover:text-indigo-400 transition-colors flex-grow">
                 {blog.title}
               </h3>
               <div className="pt-6 border-t border-white/5 flex items-center justify-between gap-4 mt-auto">
                 <span className="text-xs text-indigo-400/70 group-hover:text-indigo-400 font-bold uppercase tracking-widest flex items-center gap-2 transition-all">Read Article <ArrowRight className="w-4 h-4" /></span>
               </div>
             </article>
          ))}
        </div>
      </main>
    </div>
  );
}
