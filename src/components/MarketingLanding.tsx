import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BookOpen, ShieldCheck, FileText, ChevronRight, Lock, 
  PenTool, Library, Sparkles, Wand2, Menu, X, Mail
} from 'lucide-react';
import SyllabexaIcon from './SyllabexaIcon';
import { useToast } from '../lib/ToastContext';

const ElegantWorkspacePreview = () => {
  return (
    <div className="relative w-full max-w-4xl mx-auto mt-16 perspective-[1000px]">
      <motion.div 
        initial={{ opacity: 0, y: 40, rotateX: 10 }}
        animate={{ opacity: 1, y: 0, rotateX: 0 }}
        transition={{ duration: 1, delay: 0.2 }}
        className="relative rounded-2xl bg-[#fdfdfc] border border-slate-200 shadow-2xl overflow-hidden"
      >
        {/* Workspace Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white">
          <div className="flex items-center gap-4 text-xs font-serif text-slate-500 uppercase tracking-widest">
            <BookOpen size={16} /> 
            <span>Chapter 1: The Awakening</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">Saved to Cloud</span>
            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
              <span className="text-xs font-serif font-bold text-slate-600">ET</span>
            </div>
          </div>
        </div>
        
        {/* Workspace Body */}
        <div className="flex h-[400px]">
          {/* Sidebar */}
          <div className="w-64 border-r border-slate-100 bg-[#f9f9f8] p-6 hidden md:block">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Manuscript Architecture</h3>
            <ul className="space-y-3">
              <li className="text-sm font-serif text-slate-800 font-bold flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div> Chapter 1
              </li>
              <li className="text-sm font-serif text-slate-500 flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div> Chapter 2
              </li>
              <li className="text-sm font-serif text-slate-500 flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div> Chapter 3
              </li>
            </ul>
          </div>
          
          {/* Editor */}
          <div className="flex-1 p-10 overflow-hidden relative">
            <h1 className="text-3xl font-serif text-slate-900 mb-6">The Awakening</h1>
            <div className="space-y-4 text-lg font-serif text-slate-700 leading-relaxed text-justify">
              <p className="indent-8">
                The air in the room tasted of ozone and stale copper. Elias froze, his hand instinctively dropping to the plasma coil holstered at his hip. The safe—a pre-collapse Aegis model deemed uncrackable by the Spire's best engineers—hung open, its heavy tungsten door swinging lazily on stripped hinges.
              </p>
              <p className="indent-8">
                He took a slow breath, the silence of the room suddenly oppressive. A faint scrape echoed from the corridor behind him.
              </p>
            </div>
            
            {/* AI Assistant Overlay */}
            <div className="absolute bottom-6 right-6 bg-white border border-indigo-100 shadow-xl rounded-xl p-4 w-64">
              <div className="flex items-center gap-2 mb-2 text-indigo-600">
                <Wand2 size={16} />
                <span className="text-xs font-bold uppercase tracking-wider">AI Stylist</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Refining pacing and matching the Cyberpunk Noir voice profile for the next paragraph...
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default function MarketingLanding() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [subscribing, setSubscribing] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail || !newsletterEmail.includes('@')) {
      addToast('Please enter a valid email address.', 'error', 4000, 'Invalid Email');
      return;
    }

    try {
      setSubscribing(true);
      const res = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: newsletterEmail })
      });
      if (!res.ok) throw new Error('Subscription failed.');
      addToast('You have successfully subscribed to the Syllabexa Editorial.', 'success', 5000, 'Subscribed');
      setNewsletterEmail('');
    } catch (err) {
      addToast('Failed to subscribe. Please try again.', 'error', 4000, 'Error');
    } finally {
      setSubscribing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fdfcfb] text-slate-800 font-sans selection:bg-indigo-100 overflow-x-hidden">
      
      <Helmet>
        <title>Syllabexa | Enterprise Publishing Suite</title>
      </Helmet>

      {/* Premium Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-white/90 backdrop-blur-xl border-b border-slate-200/60 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-9 h-9 bg-slate-900 rounded-lg flex items-center justify-center text-white shadow-md">
              <BookOpen size={18} strokeWidth={2.5} />
            </div>
            <span className="text-2xl font-serif font-black tracking-[0.2em] uppercase text-slate-900 mt-1">Syllabexa</span>
          </div>
          
          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            <Link to="/blog" className="text-xs font-bold text-slate-500 hover:text-indigo-600 uppercase tracking-widest transition-colors">Editorial</Link>
            <Link to="/privacy" className="text-xs font-bold text-slate-500 hover:text-indigo-600 uppercase tracking-widest transition-colors">Privacy</Link>
            <Link to="/terms" className="text-xs font-bold text-slate-500 hover:text-indigo-600 uppercase tracking-widest transition-colors">Terms</Link>
            <button 
              onClick={() => navigate('/login')}
              className="px-6 py-2.5 bg-slate-900 hover:bg-indigo-600 text-white rounded-full text-xs font-bold uppercase tracking-widest transition-all shadow-md hover:shadow-lg flex items-center gap-2 group"
            >
              Author Login <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            className="md:hidden p-2 text-slate-900 focus:outline-none"
            onClick={() => setMobileMenuOpen(true)}
          >
            <Menu size={24} />
          </button>
        </div>
      </nav>

      {/* Mobile Off-Canvas Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: "spring", bounce: 0, duration: 0.4 }}
            className="fixed inset-0 z-[100] bg-white flex flex-col"
          >
            <div className="px-6 h-20 flex items-center justify-between border-b border-slate-100">
              <span className="text-xl font-serif font-black tracking-[0.2em] uppercase text-slate-900 mt-1">Syllabexa</span>
              <button 
                className="p-2 text-slate-900 bg-slate-100 rounded-full hover:bg-slate-200 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="flex flex-col p-8 gap-6 flex-1 bg-slate-50">
              <Link to="/blog" onClick={() => setMobileMenuOpen(false)} className="text-2xl font-serif font-bold text-slate-800 hover:text-indigo-600 transition-colors">Editorial Journal</Link>
              <Link to="/privacy" onClick={() => setMobileMenuOpen(false)} className="text-2xl font-serif font-bold text-slate-800 hover:text-indigo-600 transition-colors">Privacy Policy</Link>
              <Link to="/terms" onClick={() => setMobileMenuOpen(false)} className="text-2xl font-serif font-bold text-slate-800 hover:text-indigo-600 transition-colors">Terms of Service</Link>
              
              <div className="mt-auto pb-8">
                <button 
                  onClick={() => { setMobileMenuOpen(false); navigate('/login'); }}
                  className="w-full py-4 bg-slate-900 text-white rounded-full text-sm font-bold uppercase tracking-widest flex justify-center items-center gap-2 shadow-xl"
                >
                  Access Studio Workspace <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="relative z-10 pt-32 pb-24">
        <section className="max-w-6xl mx-auto px-6 text-center space-y-8 mt-12">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50/80 border border-indigo-100/50 text-indigo-700 text-[10px] font-bold uppercase tracking-widest shadow-sm">
            <Sparkles size={14} className="text-indigo-500" />
            Enterprise Publishing Suite
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl font-serif font-black tracking-tight text-slate-900 leading-tight max-w-4xl mx-auto"
          >
            Write effortlessly. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-700 via-indigo-600 to-emerald-600">Publish perfectly.</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.2 }}
            className="text-lg md:text-xl text-slate-600 font-serif leading-relaxed max-w-2xl mx-auto"
          >
            The premium workspace for professional authors and ghostwriting agencies. Generate full manuscripts with flawless pacing, maintain absolute voice consistency, and export CMYK-ready print files in one click.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.3 }}
            className="pt-8 flex flex-col sm:flex-row justify-center items-center gap-4"
          >
            <button 
              onClick={() => navigate('/app')}
              className="w-full sm:w-auto px-8 py-4 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-widest rounded-full transition-all shadow-xl hover:shadow-2xl flex items-center justify-center gap-3 group border border-slate-800"
            >
              <PenTool className="w-5 h-5" /> Open Studio Workspace <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
            <Link 
              to="/blog"
              className="w-full sm:w-auto px-8 py-4 bg-white hover:bg-slate-50 text-slate-900 font-bold text-xs uppercase tracking-widest rounded-full transition-all shadow-md flex items-center justify-center gap-3 border border-slate-200"
            >
              Read the Editorial
            </Link>
          </motion.div>
          
          <ElegantWorkspacePreview />
        </section>

        {/* AEO / GEO Section */}
        <section className="max-w-4xl mx-auto px-6 pt-40 text-center md:text-left">
          <h2 className="text-3xl md:text-5xl font-serif font-black text-slate-900 mb-8 leading-tight">The ultimate AI engine <br className="hidden md:block"/> for B2B Ghostwriters.</h2>
          <p className="text-lg md:text-xl text-slate-600 font-serif leading-relaxed">
            Syllabexa is a specialized, high-tier publishing pipeline. It utilizes a 4-agent waterfall—combining Perplexity, GPT-4o, Gemini, and Claude—to draft, structure, and polish full-length, KDP-ready manuscripts without context loss. Designed for professionals who demand total creative control and uncompromising quality.
          </p>
        </section>

        {/* Features Section */}
        <section className="max-w-7xl mx-auto px-6 pt-32">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl font-serif font-black text-slate-900 tracking-tight">Professional Grade Output</h2>
            <p className="text-slate-500 max-w-2xl mx-auto font-serif text-lg">Engineered from the ground up for print compliance and high-volume agency workflows.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <Library className="w-7 h-7 text-indigo-700" />,
                title: 'Chapter Waterfall',
                desc: 'Generate vast manuscripts without context loss. Our multi-agent pipeline works chapter-by-chapter, ensuring pristine pacing and zero hallucination.'
              },
              {
                icon: <ShieldCheck className="w-7 h-7 text-emerald-700" />,
                title: 'Flawless Prepress',
                desc: 'Server-side PDF generation natively supports KDP bleed margins, gutter widths, and true CMYK color spaces. Export to DOCX for traditional editing.'
              },
              {
                icon: <Lock className="w-7 h-7 text-amber-700" />,
                title: 'Cryptographic Voice Lock',
                desc: 'Upload your writing samples. Our matrix extracts your precise syntactic rhythm and lexical density, guaranteeing the AI sounds exactly like you.'
              }
            ].map((feature, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ delay: i * 0.1 }}
                className="bg-white p-10 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/20 hover:shadow-2xl hover:shadow-indigo-500/10 transition-all group"
              >
                <div className="w-14 h-14 bg-slate-50 group-hover:bg-indigo-50 transition-colors rounded-2xl flex items-center justify-center mb-8 border border-slate-100">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-black font-serif text-slate-900 mb-4">{feature.title}</h3>
                <p className="text-slate-500 leading-relaxed font-serif">
                  {feature.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Newsletter Section */}
        <section className="max-w-5xl mx-auto px-6 pt-40">
          <div className="bg-slate-900 rounded-[3rem] p-10 md:p-20 relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-indigo-500/20 blur-[100px] rounded-full pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 bg-emerald-500/20 blur-[100px] rounded-full pointer-events-none"></div>
            
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
              <div className="flex-1 text-center md:text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-indigo-200 text-[10px] font-bold uppercase tracking-widest mb-6">
                  <Mail size={12} /> The Syllabexa Editorial
                </div>
                <h2 className="text-4xl md:text-5xl font-serif font-black text-white mb-4 leading-tight">Master the craft.</h2>
                <p className="text-indigo-100/80 font-serif text-lg leading-relaxed max-w-md mx-auto md:mx-0">
                  Join professional authors and agencies receiving our weekly deep-dive on advanced literary pacing, voice cloning, and AI publishing strategy.
                </p>
              </div>
              
              <div className="w-full md:w-auto flex-1 max-w-md">
                <form onSubmit={handleSubscribe} className="flex flex-col gap-3">
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input 
                      type="email" 
                      placeholder="Enter your email address"
                      value={newsletterEmail}
                      onChange={(e) => setNewsletterEmail(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all backdrop-blur-sm"
                      required
                    />
                  </div>
                  <button 
                    type="submit" 
                    disabled={subscribing}
                    className="w-full py-4 bg-white text-slate-900 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-indigo-50 transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
                  >
                    {subscribing ? 'Subscribing...' : 'Subscribe to the Journal'} <ChevronRight size={16} />
                  </button>
                  <p className="text-center text-[10px] text-slate-400 uppercase tracking-widest mt-2">Zero spam. Pure signal. Unsubscribe anytime.</p>
                </form>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-[#f9f9f8] border-t border-slate-200 py-16 relative z-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <BookOpen size={24} className="text-indigo-600" />
            <span className="text-xl font-serif font-black tracking-widest uppercase text-slate-900 mt-1">Syllabexa</span>
          </div>
          <div className="flex gap-8">
            <Link to="/blog" className="text-xs font-bold text-slate-500 hover:text-indigo-600 uppercase tracking-widest transition-colors">Editorial</Link>
            <Link to="/privacy" className="text-xs font-bold text-slate-500 hover:text-indigo-600 uppercase tracking-widest transition-colors">Privacy</Link>
            <Link to="/terms" className="text-xs font-bold text-slate-500 hover:text-indigo-600 uppercase tracking-widest transition-colors">Terms</Link>
          </div>
          <p className="text-sm text-slate-500 font-serif">
            &copy; {new Date().getFullYear()} Syllabexa Enterprise Publishing.
          </p>
        </div>
      </footer>
    </div>
  );
}
