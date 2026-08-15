import React, { useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Share2, Award, Calendar } from 'lucide-react';
import { blogs } from '../data/blogs';
import { Helmet } from 'react-helmet-async';

export default function SyllabexaBlogPost() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const blog = blogs.find(b => b.slug === slug);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  if (!blog) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white">
        <h1 className="text-4xl font-serif font-bold mb-4">Article Not Found</h1>
        <button onClick={() => navigate('/blog')} className="text-indigo-400 hover:text-indigo-300 font-bold uppercase tracking-widest text-sm flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" /> Return to Hub
        </button>
      </div>
    );
  }

  // Generate structured schema for the blog
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://syllabexa.com/blog/\${blog.slug}`
    },
    "headline": blog.seoTitle || blog.title,
    "description": blog.seoDescription,
    "image": `https://syllabexa.com\${blog.featuredImage}`,  
    "author": {
      "@type": "Organization",
      "name": blog.author
    },  
    "publisher": {
      "@type": "Organization",
      "name": "Syllabexa",
      "logo": {
        "@type": "ImageObject",
        "url": "https://syllabexa.com/logo.png"
      }
    },
    "datePublished": "2026-08-02",
    "dateModified": "2026-08-02"
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500/30">
      <Helmet>
        <title>{blog.seoTitle || blog.title}</title>
        <meta name="description" content={blog.seoDescription} />
        <link rel="canonical" href={`https://syllabexa.com/blog/${blog.slug}`} />
        <script type="application/ld+json">
          {JSON.stringify(jsonLd)}
        </script>
      </Helmet>

      {/* Header */}
      <nav className="flex items-center justify-between px-8 py-6 border-b border-white/10 bg-black/50 backdrop-blur-md sticky top-0 z-50">
        <div className="text-xl font-black tracking-tighter text-indigo-400 cursor-pointer" onClick={() => navigate('/')}>SYLLABEXA.</div>
        <div className="flex gap-4">
          <button onClick={() => navigate('/blog')} className="hidden sm:flex px-5 py-2.5 text-slate-400 hover:text-white text-xs font-bold uppercase tracking-widest transition-colors items-center gap-2">
            <BookOpen className="w-4 h-4" /> Blog Hub
          </button>
          <button onClick={() => navigate('/app')} className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-indigo-500/20">
            Launch App Studio
          </button>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-6 py-12 sm:py-20">
        <button onClick={() => navigate('/blog')} className="text-indigo-400 hover:text-indigo-300 font-bold uppercase tracking-widest text-[10px] mb-12 flex items-center gap-2 transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Intelligence Hub
        </button>

        <header className="space-y-8 mb-12">
          <div className="flex items-center gap-4 text-xs font-mono text-slate-400 uppercase tracking-widest">
            <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> {blog.date}</span>
            <span>•</span>
            <span className="text-indigo-400 font-bold">{blog.readTime}</span>
          </div>
          
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif font-black text-white leading-tight">
            {blog.title}
          </h1>

          <div className="flex items-center gap-3 pt-6 border-t border-white/10">
             <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400">
               <Award className="w-5 h-5" />
             </div>
             <div>
               <div className="text-sm font-bold text-white">{blog.author}</div>
               <div className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">Enterprise Publishing Research</div>
             </div>
          </div>
        </header>

        {/* Feature Image Placeholder */}
        <div className="w-full h-[300px] sm:h-[400px] bg-slate-900 border border-white/10 rounded-3xl mb-12 flex items-center justify-center overflow-hidden">
           {/* Unsplash Source URL as placeholder since generate_image rate limit exceeded */}
           <img src={`https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=1600&h=900&fit=crop&q=80`} alt={blog.title} className="w-full h-full object-cover opacity-80 mix-blend-luminosity" />
        </div>

        <article 
          className="prose prose-invert prose-lg max-w-none prose-headings:font-serif prose-headings:font-bold prose-headings:text-white prose-p:text-slate-300 prose-p:leading-relaxed prose-p:font-light prose-a:text-indigo-400 prose-strong:text-white prose-strong:font-medium"
          dangerouslySetInnerHTML={{ __html: blog.content }}
        />

        <div className="mt-16 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-6">
           <div className="text-sm text-slate-400 font-mono text-center sm:text-left">
             Implement these strategies instantly with Syllabexa.
           </div>
           <button onClick={() => navigate('/app')} className="px-8 py-4 bg-white hover:bg-slate-200 text-black text-sm font-black uppercase tracking-widest rounded-xl transition-all w-full sm:w-auto">
             Start Free Trial
           </button>
        </div>
      </main>

      {/* Invisible SEO Div for dumb crawlers that don't execute JS properly but might rip HTML */}
      <div id="seo-crawler-content" style={{ display: 'none' }} aria-hidden="true">
         <h1>{blog.seoTitle || blog.title}</h1>
         <p>{blog.seoDescription}</p>
         <div dangerouslySetInnerHTML={{ __html: blog.content }} />
      </div>
    </div>
  );
}

function BookOpen(props: any) {
  return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>;
}
