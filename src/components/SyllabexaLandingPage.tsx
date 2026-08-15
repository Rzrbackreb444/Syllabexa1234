import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import SyllabexaIcon from './SyllabexaIcon';
import { 
  BookOpen, 
  Palette, 
  ShieldAlert, 
  Volume2, 
  Play, 
  Pause, 
  TrendingUp, 
  Users, 
  Sparkles, 
  Cpu, 
  FileText, 
  CheckCircle2, 
  Globe, 
  Award, 
  ShieldCheck, 
  ArrowRight, 
  Clock, 
  AlertCircle,
  Mail,
  Building2,
  Bookmark,
  ChevronRight,
  Eye,
  Settings,
  Scale,
  DollarSign,
  Box
} from 'lucide-react';

interface SyllabexaLandingPageProps {
  onLaunchApp: () => void;
  onOpenSecrets?: () => void;
}

export default function SyllabexaLandingPage({ onLaunchApp, onOpenSecrets }: SyllabexaLandingPageProps) {
  // Navigation states
  const [activeTab, setActiveTab] = useState<'landing' | 'terms' | 'privacy'>('landing');

  // Waitlist Lead capture states
  const [showWaitlistModal, setShowWaitlistModal] = useState(false);
  const [waitlistEmail, setWaitlistEmail] = useState('');
  const [waitlistName, setWaitlistName] = useState('');
  const [waitlistAgency, setWaitlistAgency] = useState('');
  const [waitlistRole, setWaitlistRole] = useState('Agency Ghostwriter');
  const [waitlistStatus, setWaitlistStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [waitlistPosition, setWaitlistPosition] = useState<number | null>(null);
  const [allLeads, setAllLeads] = useState<any[]>([]);

  // Stripe Subscription states
  const [checkoutLoadingId, setCheckoutLoadingId] = useState<string | null>(null);
  const [stripeError, setStripeError] = useState<string | null>(null);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  // Interactive Voice Simulator states
  const [sampleText, setSampleText] = useState(
    `We don't need another generic startup advisory. What we need is leverage. Let's build a clean, bulletproof growth loop that acts as a gravity well for leads. Stop checking metrics daily; build the infrastructure that guarantees the metrics follow.`
  );
  const [voiceProfile, setVoiceProfile] = useState<any | null>(null);
  const [isAnalyzingVoice, setIsAnalyzingVoice] = useState(false);

  // Interactive Book Autopilot states
  const [bookGenre, setBookGenre] = useState('SaaS Scaling & Operations');
  const [chapterCount, setChapterCount] = useState(10);
  const [generatedOutline, setGeneratedOutline] = useState<any | null>(null);
  const [isGeneratingOutline, setIsGeneratingOutline] = useState(false);

  // Interactive Editorial Agent States
  const [toneDriftScore, setToneDriftScore] = useState(94);

  // Demowalkthrough slider state
  const [activeWalkthroughStep, setActiveWalkthroughStep] = useState(0);
  const [walkthroughPlaying, setWalkthroughPlaying] = useState(false);

  // Auto progression for walk-through
  useEffect(() => {
    let interval: any;
    if (walkthroughPlaying) {
      interval = setInterval(() => {
        setActiveWalkthroughStep((prev) => (prev + 1) % 4);
      }, 4000);
    }
    return () => clearInterval(interval);
  }, [walkthroughPlaying]);

  // Fetch leads on mount
  useEffect(() => {
    fetch('/api/waitlist')
      .then(res => res.json())
      .then(data => {
        if (data && data.leads) setAllLeads(data.leads);
      })
      .catch(err => console.error(err));
  }, [waitlistStatus]);

  // Handle Waitlist submission
  const handleJoinWaitlist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!waitlistEmail) return;

    setWaitlistStatus('loading');
    try {
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: waitlistEmail,
          name: waitlistName,
          agencyName: waitlistAgency,
          role: waitlistRole
        })
      });
      const data = await response.json();
      if (data.success) {
        setWaitlistStatus('success');
        setWaitlistPosition(data.position);
        setWaitlistEmail('');
        setWaitlistName('');
        setWaitlistAgency('');
      } else {
        setWaitlistStatus('error');
      }
    } catch (err) {
      console.error(err);
      setWaitlistStatus('error');
    }
  };

  // Launch Stripe checkout simulation or live session
  const handleCheckout = async (priceId: string, planName: string) => {
    setCheckoutLoadingId(priceId);
    setStripeError(null);
    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priceId,
          userId: 'usr_landing_test',
          userEmail: 'thelaundromatfb@gmail.com',
        })
      });
      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      } else if (data.error) {
        setStripeError(`Checkout launch failed: ${data.error}. Enter your Stripe Secret Key inside your server .env configuration.`);
        if (onOpenSecrets) onOpenSecrets();
      } else {
        setStripeError('Stripe server could not be reached. Ensure STRIPE_SECRET_KEY is configured.');
        if (onOpenSecrets) onOpenSecrets();
      }
    } catch (err: any) {
      setStripeError(err.message || 'Error occurred. Please check your Stripe configurations.');
      if (onOpenSecrets) onOpenSecrets();
    } finally {
      setCheckoutLoadingId(null);
    }
  };

  // Run simulated Voice Extraction Analysis
  const runVoiceAnalysis = () => {
    setIsAnalyzingVoice(true);
    setVoiceProfile(null);
    setTimeout(() => {
      setIsAnalyzingVoice(false);
      setVoiceProfile({
        tone: "Pragmatic, authority-led with tight metrics orientation",
        vocabulary: ["growth loop", "leverage", "infrastructure", "bottleneck", "trajectory"],
        pacing: "Direct, concise, short punches punctuated by robust lists",
        persona: "No-nonsense SaaS Operator / Managing Director",
        pov: "First-person plural ('We') of strategic partnership",
        dialogue: "Polished, result-focused, action-driven"
      });
    }, 1500);
  };

  // Run simulated Outline Generation
  const runOutlineGeneration = () => {
    setIsGeneratingOutline(true);
    setGeneratedOutline(null);
    setTimeout(() => {
      setIsGeneratingOutline(false);
      setGeneratedOutline({
        title: `The Leverage Loop: Scaling ${bookGenre}`,
        chapters: [
          "Chapter 1: The Invisible Typing Bottleneck",
          `Chapter 2: Designing the ${bookGenre} Core Flywheel`,
          "Chapter 3: Asset Audits and Voice Profiling Extraction",
          "Chapter 4: Scaling Content Without Degrading Tone Quality",
          "Chapter 5: The Editorial Agent Verification Protocol"
        ]
      });
    }, 1500);
  };

  // Dummy step definitions for Loom DemoWalkthrough
  const walkthroughSteps = [
    {
      title: "1. Train the Voice Engine",
      desc: "Upload sample emails, drafts, or books. Syllabexa generates a secure Voice Profile defining sentence length, vocabulary density, and dialogue pacing.",
      element: (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-xs font-mono text-slate-300 space-y-3">
          <div className="flex justify-between items-center border-b border-slate-800 pb-2">
            <span className="text-emerald-400 flex items-center gap-1">● VOICE_ENGINE_READY</span>
            <span className="text-slate-500 text-[10px]">ANALYZING...</span>
          </div>
          <p className="italic text-slate-400">"Pasting previous newsletters regarding growth loops..."</p>
          <div className="p-3 bg-slate-950 border border-slate-800/80 rounded-lg text-[10px] space-y-1.5">
            <p className="text-indigo-400">{"{"}</p>
            <p className="pl-4"><span className="text-pink-400">"tone"</span>: "Highly pragmatic, concise, action-oriented",</p>
            <p className="pl-4"><span className="text-pink-400">"pacing"</span>: "Fast, punchy, active voice focus",</p>
            <p className="pl-4"><span className="text-pink-400">"vocabulary"</span>: ["leverage", "velocity", "operational flywheels"]</p>
            <p className="text-indigo-400">{"}"}</p>
          </div>
        </div>
      )
    },
    {
      title: "2. Structuring Book Outlines",
      desc: "Enter your book premise, target reader, and total chapters. Autopilot instantly creates a fully integrated outline mapping core structural narrative arcs.",
      element: (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-xs font-mono text-slate-300 space-y-3">
          <div className="flex justify-between items-center border-b border-slate-800 pb-2">
            <span className="text-amber-500">Premise: The Velocity Paradox</span>
            <span className="text-slate-500 text-[10px]">10 Chapters</span>
          </div>
          <div className="space-y-1.5 text-[10.5px]">
            <p className="text-emerald-400">✓ Chapter 1: Overcoming the Typing Speed Constraint</p>
            <p className="text-slate-400">✦ Chapter 2: The Infrastructure of Content Leverages</p>
            <p className="text-slate-400">✦ Chapter 3: Designing Reusable Voice Blueprints</p>
          </div>
        </div>
      )
    },
    {
      title: "3. Stream Draft Autopilot",
      desc: "Run generation to stream complete chapters. Watch words render instantly conforming exactly to your extracted voice parameters without manual editing.",
      element: (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-xs font-mono text-slate-300 space-y-3">
          <div className="flex justify-between items-center border-b border-slate-800 pb-2">
            <span className="text-indigo-400 animate-pulse">STREAMING CHAPTER 1...</span>
            <span className="text-slate-500 text-[10px]">1,402 words / 2,500</span>
          </div>
          <p className="text-slate-300 leading-relaxed text-[11px] bg-slate-950 p-3 rounded border border-slate-800 border-dashed animate-pulse">
            The fundamental bottleneck of modern content studios isn't quality; it is typing speed. You are physically constrained by your keyboards. Syllabexa breaks that trajectory...
          </p>
        </div>
      )
    },
    {
      title: "4. Run Editorial Analysis",
      desc: "Assess manuscript quality. The Editorial Agent highlights tone drifting, scores word choices, and suggests context-preserving edits on the fly.",
      element: (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-xs font-mono text-slate-300 space-y-3">
          <div className="flex justify-between items-center border-b border-slate-800 pb-2">
            <span className="text-indigo-400">Editorial Review</span>
            <span className="bg-emerald-500/10 text-emerald-400 font-bold px-2 py-0.5 rounded text-[10px]">Score: 92%</span>
          </div>
          <div className="p-2.5 bg-rose-950/40 border border-rose-900/50 rounded text-[10.5px] text-rose-300">
            <span className="font-bold uppercase text-[9px] text-rose-400 block mb-1">Tone Drift Alert:</span>
            "The phrase 'this startup was incredibly exciting' drifts into passive hyperbole. Change to 'the loop captured high velocity traffic.'"
          </div>
        </div>
      )
    }
  ];

  if (activeTab === 'terms') {
    return (
      <aside aria-label="Syllabexa Terms of Service" className="flex-1 overflow-y-auto bg-slate-50 p-6 lg:p-12 text-slate-800 custom-scrollbar">
        <div className="max-w-3xl mx-auto space-y-6">
          <button onClick={() => setActiveTab('landing')} className="text-indigo-600 hover:underline text-xs font-mono uppercase tracking-wider flex items-center gap-1 cursor-pointer">
            ← Return to Landing Page
          </button>
          <div className="bg-white p-8 border border-slate-200 rounded-3xl shadow-sm space-y-6">
            <h1 className="text-3xl font-serif font-black text-slate-900">Syllabexa Terms of Service</h1>
            <p className="text-xs text-slate-400">Last updated: July 15, 2026</p>
            
            <div className="prose prose-slate text-xs leading-relaxed space-y-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 mt-6">1. Agreement to Terms</h2>
              <p>By accessing or using Syllabexa (the "Service"), you agree to be bound by these Terms of Service. If you do not agree to these terms, do not access or use the Service.</p>
              
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 mt-6">2. Description of Service</h2>
              <p>Syllabexa is an AI-powered publishing engine and content scaling assistant. Users can upload samples to extract voice profiles, auto-generate manuscripts, and conduct editorial reviews. The service is provided on an "as is" and "as available" basis.</p>

              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 mt-6">3. Subscriptions and Stripe Transactions</h2>
              <p>Certain components of our service require paid subscriptions. Payments are handled securely via Stripe. You agree to provide current, complete, and accurate billing and account information for all purchases. All fees are non-refundable.</p>

              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 mt-6">4. Intellectual Property & User Content</h2>
              <p>You retain full ownership of all writing samples you submit and all complete manuscripts generated for you by the Syllabexa engine. We claim no ownership over your intellectual property.</p>

              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 mt-6">5. Limitations of Liability</h2>
              <p>In no event shall Syllabexa, its directors, or employees be liable for any direct, indirect, incidental, or consequential damages resulting from the use of the service or generation outputs.</p>
            </div>
          </div>
        </div>
      </aside>
    );
  }

  if (activeTab === 'privacy') {
    return (
      <aside aria-label="Syllabexa Privacy Policy" className="flex-1 overflow-y-auto bg-slate-50 p-6 lg:p-12 text-slate-800 custom-scrollbar">
        <div className="max-w-3xl mx-auto space-y-6">
          <button onClick={() => setActiveTab('landing')} className="text-indigo-600 hover:underline text-xs font-mono uppercase tracking-wider flex items-center gap-1 cursor-pointer">
            ← Return to Landing Page
          </button>
          <div className="bg-white p-8 border border-slate-200 rounded-3xl shadow-sm space-y-6">
            <h1 className="text-3xl font-serif font-black text-slate-900">Syllabexa Privacy Policy</h1>
            <p className="text-xs text-slate-400">Last updated: July 15, 2026</p>
            
            <div className="prose prose-slate text-xs leading-relaxed space-y-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 mt-6">1. Information We Collect</h2>
              <p>We collect information you provide directly to us when joining our waitlist, purchasing plans, or configuring settings. This includes names, emails, billing details processed via Stripe, and uploaded writing samples.</p>
              
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 mt-6">2. How We Use Information</h2>
              <p>We use your information strictly to maintain your account, process billing transactions via Stripe, run local AI model requests, and notify you regarding waitlist placements or platform updates.</p>

              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 mt-6">3. Data Security and Privacy</h2>
              <p>We implement a robust security architecture to protect your credentials, writing history, and personal data. Your writing samples and voice profiles are securely isolated and never shared with third parties.</p>

              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 mt-6">4. Contact Information</h2>
              <p>If you have questions about this Privacy Policy or your personal data handling, contact our support team at thelaundromatfb@gmail.com.</p>
            </div>
          </div>
        </div>
      </aside>
    );
  }

  return (
    <aside aria-label="Syllabexa Landing Page" className="flex-1 overflow-y-auto bg-slate-50 text-slate-800 custom-scrollbar">
      <Helmet>
        <title>Syllabexa | AI Ghostwriting & Autonomous Book Publishing</title>
        <meta name="description" content="Scale your publishing house with Syllabexa. Train Neural Voice Profiles, deploy Book Autopilots, and manage multi-client CRDT collaboration for ghostwriting agencies." />
        <meta name="keywords" content="AI Ghostwriting, Neural Voice Training, Autopilot Publishing, Book Generation, Syllabexa, Puzzle Generator" />
        <link rel="canonical" href="https://syllabexa.com/" />
      </Helmet>

      {/* 1. Hero Section (Above the fold) */}
      <section className="relative overflow-hidden bg-slate-950 text-white pt-16 pb-20 px-6 lg:px-12 border-b border-slate-850">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(99,102,241,0.18),rgba(255,255,255,0))]"></div>
        <div className="absolute top-6 left-6 z-50">
          <Link to="/blog" className="px-4 py-2 bg-indigo-600/20 text-indigo-300 rounded-full font-mono text-xs uppercase tracking-widest hover:bg-indigo-600/40 transition-colors border border-indigo-500/30">EEAT Blog Insights</Link>
        </div>
        
        <div className="max-w-5xl mx-auto text-center space-y-6 relative z-10">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-indigo-500/5 rounded-3xl border border-indigo-500/10 shadow-2xl relative group">
              <div className="absolute inset-0 bg-indigo-500/10 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
              <SyllabexaIcon size={96} glow={true} className="relative z-10 animate-pulse" />
            </div>
          </div>

          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-indigo-500/10 border border-indigo-400/20 rounded-full text-[11px] font-bold text-indigo-400 tracking-wider uppercase">
            <SyllabexaIcon size={14} glow={true} />
            Syllabexa
          </div>

          <h1 className="text-5xl md:text-8xl font-serif font-black tracking-tight text-white leading-[1.1] max-w-4xl mx-auto uppercase">
            Syllabexa
          </h1>

          <div className="max-w-3xl mx-auto bg-slate-900/80 border border-slate-800 p-6 md:p-8 rounded-3xl space-y-4 my-8 text-left relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-indigo-500"></div>
            <h2 className="text-lg md:text-xl font-serif font-bold text-white tracking-tight border-b border-slate-800 pb-3 uppercase tracking-wider">
              A premium writing and publishing workspace for everyone — engineered for serious writers and creators.
            </h2>
            <p className="text-xs md:text-sm text-slate-300 leading-relaxed font-sans">
              Syllabexa is an AI-powered publishing platform designed for serious writers and creators to mass-produce high-quality books and operational manuals. The platform ingests client-provided documentation, extracts a unique voice profile, and uses an automated editorial pipeline to generate manuscripts, drastically reducing the cognitive load of large-scale writing projects.
            </p>
          </div>

          <p className="text-sm md:text-lg text-slate-300 leading-relaxed max-w-3xl mx-auto font-sans font-medium">
            Write full books in your voice automatically. Train the engine on your past writing, and mass-produce publish-ready manuscripts in hours, not months.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            <button
              onClick={() => setShowWaitlistModal(true)}
              className="w-full sm:w-auto px-8 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs font-mono uppercase tracking-wider transition-all rounded-xl shadow-lg shadow-indigo-600/20 cursor-pointer flex items-center justify-center gap-2"
            >
              Get Early Access
              <ArrowRight size={14} />
            </button>
            <button
              onClick={onLaunchApp}
              className="w-full sm:w-auto px-8 py-3.5 bg-slate-900 border border-slate-800 hover:bg-slate-850 text-slate-100 font-bold text-xs font-mono uppercase tracking-wider transition-all rounded-xl cursor-pointer flex items-center justify-center gap-2"
            >
              [ INITIALIZE SECURE PIPELINE ]
              <ChevronRight size={14} className="text-indigo-400" />
            </button>
          </div>

          <p className="text-[11px] text-slate-500 font-bold tracking-wide uppercase">
            Limited spots available for the Agency Beta.
          </p>
        </div>

        {/* Dynamic Graphic Visual representation of the typing speed vs. Syllabexa throughput */}
        <div className="max-w-4xl mx-auto mt-14 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative">
          <div className="absolute -top-3 left-6 text-[10px] bg-slate-800 border border-slate-700 text-slate-400 font-mono px-3 py-0.5 rounded-full">
            REAL-TIME WORKSPACE PREVIEW
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <div className="space-y-4">
              <span className="text-xs font-bold text-indigo-400 tracking-wider uppercase block">Engine Capacity comparison</span>
              <h4 className="text-lg font-serif font-bold text-white">Breaking the human-typing constraints</h4>
              <p className="text-[11.5px] text-slate-400 leading-relaxed">
                While a professional ghostwriter averages 12,000 words per week, Syllabexa Autopilot delivers up to 100,000 words in matching, editorial-grade voice profiles concurrently.
              </p>
              <div className="space-y-2 text-[11px] font-mono">
                <div>
                  <div className="flex justify-between text-slate-400 mb-1">
                    <span>Manual Human Speed</span>
                    <span className="text-rose-400">1.2k words/day</span>
                  </div>
                  <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
                    <div className="bg-rose-500 h-full w-[12%] rounded-full"></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-slate-400 mb-1">
                    <span>Syllabexa Voice Engine</span>
                    <span className="text-emerald-400">80k words/day (Parallel)</span>
                  </div>
                  <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full w-full rounded-full animate-pulse"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Interactive mini widget simulator of Voice Profile */}
            <div className="bg-slate-950 border border-slate-850 p-5 rounded-2xl space-y-3">
              <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></span>
                ACTIVE VOICE EXTRACTION
              </span>
              <p className="text-[10.5px] text-slate-400 italic">"Pasting writing drafts into simulator..."</p>
              <textarea
                value={sampleText}
                onChange={(e) => setSampleText(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-[11px] font-mono text-slate-300 outline-none h-16 resize-none focus:ring-1 focus:ring-indigo-500"
                placeholder="Enter sample text..."
              />
              <button
                onClick={runVoiceAnalysis}
                disabled={isAnalyzingVoice}
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold font-mono uppercase text-[9px] tracking-wider transition-all rounded-lg cursor-pointer"
              >
                {isAnalyzingVoice ? "Extracting Voice parameters..." : "Run Voice Profiling Analyzer"}
              </button>

              {voiceProfile && (
                <div className="bg-slate-900 border border-slate-850 p-3.5 rounded-xl space-y-2 text-[10.5px] font-mono animate-fade-in">
                  <div className="flex items-center justify-between text-[9px] uppercase tracking-wider text-slate-500">
                    <span>PROFILE GENERATED</span>
                    <span className="text-indigo-400">98% Accuracy</span>
                  </div>
                  <p><span className="text-indigo-400">Tone:</span> <span className="text-slate-300">{voiceProfile.tone}</span></p>
                  <p><span className="text-indigo-400">Pacing:</span> <span className="text-slate-300">{voiceProfile.pacing}</span></p>
                  <p><span className="text-indigo-400">Keywords:</span> <span className="text-slate-300">{voiceProfile.vocabulary.join(', ')}</span></p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 3D Pre-Press Feature Highlight */}
      <section className="py-24 bg-slate-50 px-6 lg:px-12 border-t border-slate-200">
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-16">
          <div className="flex-1 space-y-6">
            <span className="text-[10px] font-mono text-indigo-600 uppercase tracking-widest block font-bold">LIVE HOLOGRAPHIC PROOFING</span>
            <h2 className="text-4xl md:text-5xl font-serif font-black text-slate-950">
              Stop guessing.
              <br />Inspect the spine before you print.
            </h2>
            <p className="text-slate-500 text-lg leading-relaxed">
              Move away from static 2D PDF exports. Our interactive, real-time 3D physical book visualizer lets you inspect spine creasing, paper stock weight reflections, and gutter safety margins flipping page by page.
            </p>
            <div className="space-y-4 pt-4">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="text-emerald-500 mt-1 shrink-0" size={18} />
                <p className="text-sm text-slate-700"><strong>Cream vs. White 300 DPI Rendering:</strong> Verify how your typography contrasts against actual KDP or IngramSpark paper stock.</p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="text-emerald-500 mt-1 shrink-0" size={18} />
                <p className="text-sm text-slate-700"><strong>Spine & Gutter Safety:</strong> Ensure your inner margins won't swallow text when physically bound.</p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="text-emerald-500 mt-1 shrink-0" size={18} />
                <p className="text-sm text-slate-700"><strong>Interactive Rotations:</strong> Drag, rotate, and inspect your manuscript as a physical object right in your browser.</p>
              </div>
            </div>
            <button
              onClick={() => onLaunchApp()}
              className="mt-6 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-mono uppercase text-xs font-bold tracking-wider rounded-xl transition-all shadow-md cursor-pointer flex items-center gap-2"
            >
              <Box size={16} /> Try 3D Proofing in Studio
            </button>
          </div>
          
          <div className="flex-1 w-full relative">
            <div className="absolute inset-0 bg-indigo-500/5 rounded-[3rem] transform -rotate-3 scale-105"></div>
            <div className="relative bg-slate-950 rounded-3xl p-8 border border-slate-900 shadow-2xl flex items-center justify-center min-h-[400px]">
              
              {/* Dummy 3D element to showcase the feature */}
              <div style={{ perspective: '1000px', width: '220px', height: '320px' }}>
                <div 
                  style={{
                    transform: `rotateX(15deg) rotateY(-25deg)`,
                    transformStyle: 'preserve-3d',
                  }}
                  className="w-full h-full relative transition-transform duration-1000 hover:rotate-y-[-15deg] group"
                >
                  {/* Spine */}
                  <div 
                    style={{ 
                      transform: 'rotateY(-90deg) translateZ(15px) translateX(-15px)',
                      transformOrigin: 'left center',
                    }}
                    className={`absolute inset-y-0 left-0 w-[30px] bg-slate-900 shadow-xl border-r border-slate-800 flex items-center justify-center`}
                  >
                     <span className="text-indigo-300 font-mono text-[8px] transform -rotate-90 whitespace-nowrap tracking-[0.2em] uppercase">The Velocity Paradox</span>
                  </div>
                  {/* Pages */}
                  <div 
                    style={{ transform: 'translateZ(-1px)' }}
                    className={`absolute inset-0 bg-[#fdfbf7] rounded-r-md border border-black/10 shadow-[10px_10px_20px_rgba(0,0,0,0.5)]`}
                  ></div>
                  {/* Cover */}
                  <div 
                    style={{ transform: 'translateZ(15px)' }}
                    className={`absolute inset-0 bg-[#fdfbf7] text-slate-900 shadow-[inset_-10px_0_20px_rgba(0,0,0,0.03)] border border-black/5 p-6 flex flex-col justify-between font-serif group-hover:bg-[#ffffff] transition-colors duration-1000`}
                  >
                    <div className="absolute inset-y-0 left-0 w-4 bg-gradient-to-r from-black/20 to-transparent"></div>
                    <div>
                      <div className="text-[8px] font-mono text-slate-400 uppercase tracking-widest mb-2 opacity-70">Signature 1</div>
                      <h1 className="text-xl font-bold mb-1 leading-tight text-slate-900">The Velocity<br/>Paradox</h1>
                      <div className="w-12 h-0.5 bg-indigo-500 my-4"></div>
                      <p className="text-[9px] leading-relaxed text-slate-800 indent-3">
                        The fundamental bottleneck of modern content studios isn't quality; it is typing speed. You are physically constrained by your keyboards.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
            </div>
          </div>
        </div>
      </section>

      {/* 2. The Agitation Section */}
      <section className="py-20 px-6 lg:px-12 bg-white text-slate-800">
        <div className="max-w-4xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <span className="text-xs font-bold text-rose-600 tracking-widest uppercase font-mono">The Studio Bottleneck</span>
            <h2 className="text-3xl md:text-5xl font-serif font-black text-slate-950">
              You are bottlenecked by your own typing speed.
            </h2>
            <div className="w-16 h-1 bg-rose-500 mx-auto rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch pt-4">
            <div className="bg-slate-50 border border-slate-100 p-6 rounded-3xl space-y-4">
              <div className="w-10 h-10 bg-rose-50 rounded-xl flex items-center justify-center text-rose-600">
                <Clock size={20} />
              </div>
              <h4 className="font-serif font-bold text-lg text-slate-950">Scale is Currently Blocked</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Traditional ghostwriting and content creation don't scale. You can only take on so many clients before quality drops or you burn out. Keyboards are physical limits on your revenue streams.
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-100 p-6 rounded-3xl space-y-4">
              <div className="w-10 h-10 bg-rose-50 rounded-xl flex items-center justify-center text-rose-600">
                <ShieldAlert size={20} />
              </div>
              <h4 className="font-serif font-bold text-lg text-slate-950">The Garbage Output of Basic AI</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Generic AI tools output robotic fluff that requires heavier editing than just writing it yourself from scratch. Clients can spot generic chat-style essays instantly. Your reputation is too important.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. The Solution Section */}
      <section className="py-20 px-6 lg:px-12 bg-slate-50 border-y border-slate-200">
        <div className="max-w-5xl mx-auto space-y-16">
          <div className="text-center space-y-4">
            <span className="text-xs font-bold text-indigo-600 tracking-widest uppercase font-mono">A New Paradigm</span>
            <h2 className="text-3xl md:text-5xl font-serif font-black text-slate-950">
              The Syllabexa Engine Solution
            </h2>
            <p className="text-sm text-slate-500 max-w-xl mx-auto font-medium">
              We built three key modules together to act as a complete parallel production system.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-xs space-y-4 relative overflow-hidden group">
              <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 font-bold font-serif text-lg">
                01
              </div>
              <h4 className="font-serif font-bold text-lg text-slate-950">The Voice Engine</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Upload your notes, past drafts, or emails. Syllabexa extracts your exact tone, pacing, persona, and vocabulary into a reusable, locked Voice Profile.
              </p>
              <div className="border-t border-slate-100 pt-3 text-[11px] font-bold text-slate-500">
                ✓ Continuous vocabulary matching
              </div>
            </div>

            {/* Feature 2 */}
            <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-xs space-y-4 relative overflow-hidden group">
              <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 font-bold font-serif text-lg">
                02
              </div>
              <h4 className="font-serif font-bold text-lg text-slate-950">Book Autopilot</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Set your chapter count, target audience, and depth. The engine generates a cohesive premise, outline, and complete manuscript chapters entirely in your locked voice.
              </p>
              <div className="border-t border-slate-100 pt-3 text-[11px] font-bold text-slate-500">
                ✓ Full multi-chapter narrative structure
              </div>
            </div>

            {/* Feature 3 */}
            <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-xs space-y-4 relative overflow-hidden group">
              <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 font-bold font-serif text-lg">
                03
              </div>
              <h4 className="font-serif font-bold text-lg text-slate-950">The Editorial Agent</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Every chapter is ruthlessly scored against your Voice Profile. The system automatically detects tone drift, highlights bad vocabulary, and suggests precise rewrites.
              </p>
              <div className="border-t border-slate-100 pt-3 text-[11px] font-bold text-slate-500">
                ✓ Tone score meters from 0 to 100
              </div>
            </div>
          </div>

          {/* Interactive Feature Simulator */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 lg:p-8 grid grid-cols-1 md:grid-cols-2 gap-8 items-center shadow-xs">
            <div className="space-y-5">
              <div className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-indigo-600">
                <Settings size={14} /> INTERACTIVE PRESET BUILDER
              </div>
              <h3 className="text-2xl font-serif font-black text-slate-900">Configure book drafts instantly</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Choose parameters below to simulate our multi-chapter Autopilot structure in real time. Customize your target subject to generate outline structures instantly.
              </p>

              <div className="space-y-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Book Focus Area</label>
                  <input 
                    type="text" 
                    value={bookGenre} 
                    onChange={(e) => setBookGenre(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Target Chapters: {chapterCount}</label>
                  <input 
                    type="range" 
                    min={3} 
                    max={15} 
                    value={chapterCount} 
                    onChange={(e) => setChapterCount(Number(e.target.value))}
                    className="w-full accent-indigo-600"
                  />
                </div>
                <button
                  onClick={runOutlineGeneration}
                  disabled={isGeneratingOutline}
                  className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-mono uppercase text-xs font-bold tracking-wider transition-colors rounded-xl cursor-pointer"
                >
                  {isGeneratingOutline ? "Compiling Book Framework..." : "Generate Prototype Outline"}
                </button>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-5 min-h-[220px] flex flex-col justify-between">
              {generatedOutline ? (
                <div className="space-y-3 font-mono text-[11px] text-slate-700 animate-fade-in">
                  <span className="text-[10px] text-indigo-600 font-bold block uppercase tracking-wider">★ OUTLINE GENERATED</span>
                  <p className="font-serif font-bold text-xs text-slate-900">{generatedOutline.title}</p>
                  <div className="space-y-1 text-[10px] border-l border-slate-200 pl-3.5">
                    {generatedOutline.chapters.map((ch: string, idx: number) => (
                      <p key={idx} className="text-slate-600">{ch}</p>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="m-auto text-center space-y-2">
                  <BookOpen size={28} className="mx-auto text-slate-300" />
                  <p className="text-[11px] text-slate-400 font-mono">Select a topic and generate outlines above to see layout mechanics.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 4. The Demo Video walk-through simulator (Walkthrough Screen) */}
      <section className="py-20 px-6 lg:px-12 bg-slate-950 text-white">
        <div className="max-w-5xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <span className="text-xs font-bold text-indigo-400 tracking-widest uppercase font-mono">Watch the App in Action</span>
            <h2 className="text-3xl md:text-5xl font-serif font-black text-white">
              The 60-Second walkthrough
            </h2>
            <p className="text-xs md:text-sm text-slate-400 max-w-xl mx-auto">
              Skip the long documentation. Click play below to watch Syllabexa model training and parallel autopilot drafting live.
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl grid grid-cols-1 lg:grid-cols-3">
            {/* Step Selection Navigation */}
            <div className="bg-slate-950 p-6 border-r border-slate-800 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Simulation Steps</span>
                <div className="space-y-2">
                  {walkthroughSteps.map((step, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setActiveWalkthroughStep(idx);
                        setWalkthroughPlaying(false);
                      }}
                      className={`w-full text-left p-3 rounded-xl border transition-all flex gap-3 cursor-pointer ${
                        activeWalkthroughStep === idx 
                          ? 'bg-indigo-600/10 border-indigo-500 text-white' 
                          : 'bg-transparent border-transparent hover:bg-slate-900/50 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                        activeWalkthroughStep === idx ? 'bg-indigo-500 text-white' : 'bg-slate-850 text-slate-500'
                      }`}>
                        {idx + 1}
                      </span>
                      <div className="space-y-0.5">
                        <p className="text-xs font-bold leading-none">{step.title}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Player Controls */}
              <div className="flex items-center gap-3 bg-slate-900 p-3 rounded-xl border border-slate-850">
                <button
                  onClick={() => setWalkthroughPlaying(!walkthroughPlaying)}
                  className="w-8 h-8 rounded-full bg-indigo-600 hover:bg-indigo-500 flex items-center justify-center text-white cursor-pointer transition-colors"
                >
                  {walkthroughPlaying ? <Pause size={14} /> : <Play size={14} className="ml-0.5" />}
                </button>
                <div className="flex-1 space-y-1">
                  <p className="text-[10px] font-bold font-mono uppercase tracking-wider text-slate-400">
                    {walkthroughPlaying ? "Playing walk-through..." : "Walkthrough Paused"}
                  </p>
                  <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-indigo-500 h-full transition-all duration-300"
                      style={{ width: `${((activeWalkthroughStep + 1) / 4) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Simulated Live walk-through panel */}
            <div className="lg:col-span-2 p-6 lg:p-10 flex flex-col justify-between space-y-6">
              <div className="space-y-3">
                <span className="text-[9px] bg-slate-800 text-slate-400 font-mono px-2 py-0.5 rounded uppercase">
                  ACTIVE DISPLAY WINDOW
                </span>
                <h3 className="text-xl font-serif font-bold text-white">
                  {walkthroughSteps[activeWalkthroughStep].title}
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {walkthroughSteps[activeWalkthroughStep].desc}
                </p>
              </div>

              {/* Dynamic Step visual preview representation */}
              <div className="p-1 bg-slate-950 rounded-2xl border border-slate-800">
                {walkthroughSteps[activeWalkthroughStep].element}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* About the Founder Section */}
      <section className="py-20 px-6 lg:px-12 bg-slate-950 border-t border-slate-900 text-white overflow-hidden relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(99,102,241,0.08),transparent)]"></div>
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-10">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-tr from-indigo-600 to-emerald-500 rounded-3xl opacity-20 group-hover:opacity-40 transition duration-700 blur-lg"></div>
            <img src="/logo.jpg" alt="Nicholas Kremers, Stroked-Out Sasquatch" className="relative w-full max-w-md mx-auto h-auto rounded-3xl shadow-2xl object-cover border border-slate-800" />
            <div className="absolute -bottom-6 -right-6 bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-xl max-w-[200px] animate-fade-in delay-200">
              <p className="text-[10px] font-mono text-indigo-400 font-bold mb-1">FOUNDER & ARCHITECT</p>
              <p className="text-sm font-black font-serif text-white">Nicholas Kremers</p>
              <p className="text-xs text-slate-400">"The Stroked-Out Sasquatch"</p>
            </div>
          </div>
          
          <div className="space-y-8">
            <div className="space-y-4">
              <span className="text-xs font-bold text-indigo-400 tracking-widest uppercase font-mono">The Story Behind the Engine</span>
              <h2 className="text-3xl md:text-5xl font-serif font-black text-white leading-tight">
                Built from the Rubble. Engineered for Scale.
              </h2>
            </div>
            
            <div className="space-y-6 text-sm text-slate-400 leading-relaxed font-medium">
              <p>
                I'm Nicholas Kremers—a stroke survivor, laundromat connoisseur, and the architect behind Syllabexa. When I suffered a massive stroke at 36, I lost half my physical mobility, but I refused to lose my voice.
              </p>
              <p>
                Writing is hard enough. But writing a 50,000-word book when your body fights every keystroke? It was brutally difficult. I realized that if I wanted to continue my career, write my books ("The Laundromat Doctrine" and "The Stroke Recovery Bible"), and share my expertise, I couldn't rely on legacy tools that required infinite endurance.
              </p>
              <p>
                I needed a system that actively collaborated with me. A machine that could take my raw structural outlines and orchestrate them into polished, press-ready manuscripts without diluting my voice. That necessity birthed Syllabexa.
              </p>
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl relative mt-4">
                <p className="font-serif italic text-base text-slate-300 relative z-10">
                  "I determined this was needed because writing a book is hard, and I wanted to find a way to make it profoundly more accessible. With Syllabexa, I believe I've done exactly that."
                </p>
              </div>
            </div>
            
            <div className="pt-4 flex flex-wrap items-center gap-4">
              <button 
                onClick={() => onLaunchApp()}
                className="px-6 py-3 bg-white text-slate-950 font-bold rounded-xl shadow-lg hover:bg-slate-100 transition-colors font-mono text-xs uppercase tracking-wider"
              >
                Use the System
              </button>
              <a 
                href="https://strokelyfe.org" 
                target="_blank" 
                rel="noopener noreferrer"
                className="px-6 py-3 bg-slate-900 text-white border border-slate-800 font-bold rounded-xl shadow-lg hover:bg-slate-800 transition-colors font-mono text-xs uppercase tracking-wider"
              >
                Visit Stroke Lyfe
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 5. The Pricing Section (Revenue Engine) */}
      <section className="py-20 px-6 lg:px-12 bg-white text-slate-800">
        <div className="max-w-5xl mx-auto space-y-14">
          <div className="text-center space-y-4">
            <span className="text-xs font-bold text-indigo-600 tracking-widest uppercase font-mono">Select Your Engine Speed</span>
            <h2 className="text-3xl md:text-5xl font-serif font-black text-slate-950">
              The Revenue Engine
            </h2>
            <p className="text-sm text-slate-500 max-w-lg mx-auto">
              Simple, transparent enterprise pricing built on concurrent processing streams.
            </p>

            {/* Monthly / Yearly cycle selector */}
            <div className="inline-flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-xl border border-slate-200 mt-2">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-4 py-1.5 text-xs font-mono uppercase tracking-wider rounded-lg font-bold cursor-pointer transition-all ${
                  billingCycle === 'monthly' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle('yearly')}
                className={`px-4 py-1.5 text-xs font-mono uppercase tracking-wider rounded-lg font-bold cursor-pointer transition-all flex items-center gap-1 ${
                  billingCycle === 'yearly' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                Yearly
                <span className="text-[9px] bg-emerald-100 text-emerald-800 font-black px-1.5 py-0.5 rounded">SAVE 20%</span>
              </button>
            </div>
          </div>

          {stripeError && (
            <div className="p-4 bg-rose-50 text-rose-800 text-xs font-semibold rounded-2xl border border-rose-200 flex items-start gap-3 max-w-2xl mx-auto animate-fade-in">
              <AlertCircle size={18} className="text-rose-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="font-extrabold">Stripe Integration Status</span>
                <p>{stripeError}</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
            
            {/* Free/Trial Tier */}
            <div className="bg-slate-50 border border-slate-200 p-6 rounded-3xl space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <span className="text-[9px] font-mono text-slate-400 uppercase tracking-widest block font-bold">THE HOOK</span>
                <h4 className="font-serif font-black text-xl text-slate-950">Free Trial</h4>
                <p className="text-4xl font-black text-slate-900">
                  $0
                  <span className="text-xs text-slate-400 font-normal">/mo</span>
                </p>
                <p className="text-xs text-slate-500 leading-relaxed min-h-[40px]">
                  Experience the magic of publication-grade production before you ever hit a paywall.
                </p>
                <div className="text-xs font-bold text-slate-600 space-y-2 pt-4 border-t border-slate-200">
                  <p className="flex items-center gap-2">✓ <span className="text-slate-500 font-medium">Write your first chapter</span></p>
                  <p className="flex items-center gap-2">✓ <span className="text-slate-500 font-medium">3D Pre-Press Viewer Access</span></p>
                  <p className="flex items-center gap-2">✓ <span className="text-slate-500 font-medium">Watermarked PDF export</span></p>
                </div>
              </div>
              <button
                onClick={() => onLaunchApp()}
                className="w-full mt-6 px-4 py-3 bg-slate-200 hover:bg-slate-300 text-slate-900 font-mono uppercase text-xs font-bold tracking-wider rounded-xl transition-all shadow-sm cursor-pointer text-center"
              >
                Start Writing Free
              </button>
            </div>

            {/* Pro Tier - MOST POPULAR */}
            <div className="bg-white border-2 border-indigo-600 p-6 rounded-3xl space-y-4 flex flex-col justify-between relative ring-4 ring-indigo-50">
              <span className="absolute -top-3 right-6 text-[9px] bg-indigo-600 text-white font-black tracking-widest uppercase px-3 py-1 rounded-full shadow-sm">
                MOST POPULAR
              </span>
              <div className="space-y-3">
                <span className="text-[9px] font-mono text-indigo-600 uppercase tracking-widest block font-bold">SCALE CAPACITIES</span>
                <h4 className="font-serif font-black text-xl text-slate-950">Pro Plan</h4>
                <p className="text-4xl font-black text-slate-900">
                  ${billingCycle === 'monthly' ? '29' : '23'}
                  <span className="text-xs text-slate-400 font-normal">/mo</span>
                </p>
                {billingCycle === 'yearly' && <p className="text-[10px] text-emerald-600 font-bold font-mono">Billed annually ($276/yr)</p>}
                <p className="text-xs text-slate-500 leading-relaxed min-h-[40px]">
                  Uncompromising publishing power for serious indie authors and creators.
                </p>
                <div className="text-xs font-bold text-slate-600 space-y-2 pt-4 border-t border-slate-200">
                  <p className="flex items-center gap-2">✓ <span className="text-slate-500 font-medium">Unlimited 300 DPI exports</span></p>
                  <p className="flex items-center gap-2">✓ <span className="text-slate-500 font-medium">3D Holographic Proofing Engine</span></p>
                  <p className="flex items-center gap-2">✓ <span className="text-slate-500 font-medium">Advanced Voice DNA Cloning</span></p>
                  <p className="flex items-center gap-2">✓ <span className="text-slate-500 font-medium">Professional Typesetting Controls</span></p>
                </div>
              </div>
              <button
                onClick={() => handleCheckout('price_1P_pro_dummy', 'Pro Plan')}
                disabled={checkoutLoadingId !== null}
                className="w-full mt-6 px-4 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-mono uppercase text-xs font-bold tracking-wider rounded-xl transition-all shadow-md cursor-pointer disabled:opacity-50 text-center"
              >
                {checkoutLoadingId === 'price_1P_pro_dummy' ? 'Launching Stripe...' : 'Subscribe Pro'}
              </button>
            </div>

            {/* Studio Tier */}
            <div className="bg-slate-950 text-white border border-slate-850 p-6 rounded-3xl space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <span className="text-[9px] font-mono text-indigo-400 uppercase tracking-widest block font-bold">ENTERPRISE SCALE</span>
                <h4 className="font-serif font-black text-xl text-white">Studio Plan</h4>
                <p className="text-4xl font-black text-white">
                  ${billingCycle === 'monthly' ? '99' : '79'}
                  <span className="text-xs text-indigo-300 font-normal">/mo</span>
                </p>
                {billingCycle === 'yearly' && <p className="text-[10px] text-indigo-400 font-bold font-mono">Billed annually ($948/yr)</p>}
                <p className="text-xs text-slate-400 leading-relaxed min-h-[40px]">
                  Turn a manuscript into a multi-stream publishing agency.
                </p>
                <div className="text-xs font-bold text-slate-300 space-y-2 pt-4 border-t border-slate-800">
                  <p className="flex items-center gap-2">✓ <span className="text-slate-400 font-medium">Multi-Platform Funnel Generator</span></p>
                  <p className="flex items-center gap-2">✓ <span className="text-slate-400 font-medium">Programmatic SEO Blogging Suites</span></p>
                  <p className="flex items-center gap-2">✓ <span className="text-slate-400 font-medium">Interactive Puzzle Book Exports</span></p>
                  <p className="flex items-center gap-2">✓ <span className="text-slate-400 font-medium">Team Collaboration Vaults</span></p>
                </div>
              </div>
              <button
                onClick={() => handleCheckout('price_1P_studio_dummy', 'Studio Plan')}
                disabled={checkoutLoadingId !== null}
                className="w-full mt-6 px-4 py-3 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-white font-mono uppercase text-xs font-bold tracking-wider rounded-xl transition-all shadow-md cursor-pointer disabled:opacity-50 text-center"
              >
                {checkoutLoadingId === 'price_1P_studio_dummy' ? 'Launching Stripe...' : 'Subscribe Studio'}
              </button>
            </div>

          </div>
        </div>
      </section>

      {/* 6. Final CTA Section */}
      <section className="bg-slate-950 text-white py-24 px-6 lg:px-12 text-center relative border-t border-slate-900">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,rgba(99,102,241,0.15),transparent)]"></div>
        <div className="max-w-4xl mx-auto space-y-6 relative z-10">
          <span className="text-xs font-bold text-indigo-400 tracking-widest uppercase font-mono">Unlock Your Ghostwriting Leverage</span>
          <h2 className="text-3xl md:text-5xl font-serif font-black text-white leading-tight">
            Stop playing business. Start scaling your production.
          </h2>
          <p className="text-sm md:text-base text-slate-400 max-w-2xl mx-auto font-medium">
            Train the AI engine on your unique samples once, and let your production engine run parallel books perpetually.
          </p>

          <div className="pt-4">
            <button
              onClick={() => {
                const element = document.getElementById('syllabexa-pricing-header');
                if (element) {
                  element.scrollIntoView({ behavior: 'smooth' });
                } else {
                  setShowWaitlistModal(true);
                }
              }}
              className="px-10 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold font-mono text-xs uppercase tracking-wider transition-all rounded-xl shadow-lg shadow-indigo-600/35 cursor-pointer inline-flex items-center gap-2"
            >
              Select Your Plan
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </section>

      {/* Google Workspace Compliance & Data Usage Section */}
      <section id="google-compliance" className="py-20 px-6 lg:px-12 bg-gradient-to-b from-slate-900 to-slate-950 text-slate-300 border-t border-slate-800">
        <div className="max-w-4xl mx-auto space-y-8 bg-slate-900/90 p-8 md:p-12 rounded-3xl border-2 border-indigo-500/30 shadow-2xl relative overflow-hidden backdrop-blur-md">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-indigo-600/20 border border-indigo-500/40 rounded-2xl flex items-center justify-center text-indigo-400 shadow-inner">
                <ShieldCheck size={26} />
              </div>
              <div>
                <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-indigo-400">Google Trust & Safety Compliance Hub</span>
                <h3 className="text-2xl font-serif font-bold text-white tracking-tight">Google Workspace Integration & Data Usage</h3>
              </div>
            </div>
            <div className="px-3 py-1 bg-indigo-950 border border-indigo-500/40 rounded-full text-[11px] font-mono text-indigo-300 self-start md:self-auto">
              OAuth Scopes: Drive & Docs API
            </div>
          </div>

          <div className="space-y-4 font-sans text-sm text-slate-300 leading-relaxed">
            <p className="font-medium text-white text-base">
              Syllabexa is an enterprise publishing suite designed for professional authors and ghostwriting agencies. By authenticating with your Google account, Syllabexa allows you to seamlessly import manuscript drafts directly from Google Docs and export KDP-ready print files back to your Google Drive.
            </p>
          </div>

          <div className="p-6 bg-slate-950 border border-indigo-500/20 rounded-2xl space-y-3 shadow-inner">
            <h4 className="text-xs font-bold text-indigo-300 uppercase font-mono tracking-widest flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
              Why we need access & exact data handling transparency:
            </h4>
            <p className="text-xs md:text-sm text-slate-300 leading-relaxed font-sans">
              We request OAuth permissions strictly to read the documents you choose to import and to write the formatted files you export. Syllabexa does not scan your wider Drive, we do not use your Google Workspace data to train AI models, and your intellectual property remains 100% under your control.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 text-xs font-mono text-slate-400 border-t border-slate-800/80">
            <div className="p-3 bg-slate-950/50 rounded-xl border border-slate-800">
              <span className="text-indigo-400 block font-bold mb-1">1. Scope Limitations</span>
              Restricted solely to user-selected files via Google Picker or direct URI binding.
            </div>
            <div className="p-3 bg-slate-950/50 rounded-xl border border-slate-800">
              <span className="text-indigo-400 block font-bold mb-1">2. Zero Training Policy</span>
              Your manuscript text and private documents are never ingested into foundational AI training sets.
            </div>
            <div className="p-3 bg-slate-950/50 rounded-xl border border-slate-800">
              <span className="text-indigo-400 block font-bold mb-1">3. Revocation Ready</span>
              Disconnect instantly at any time via your Google Account Permissions settings.
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-800 text-xs font-mono">
            <div className="flex gap-4">
              <button onClick={() => setActiveTab('privacy')} className="text-indigo-400 hover:text-indigo-300 underline flex items-center gap-1 cursor-pointer font-semibold">
                → Official Privacy Policy (Data Handling)
              </button>
              <span className="text-slate-700">|</span>
              <button onClick={() => setActiveTab('terms')} className="text-indigo-400 hover:text-indigo-300 underline flex items-center gap-1 cursor-pointer font-semibold">
                → Terms of Service
              </button>
            </div>
            <span className="text-slate-500 text-[10px]">App Name: Syllabexa | Verified Domain</span>
          </div>
        </div>
      </section>

      {/* Footer Section with Stripe requirements */}
      <footer className="bg-slate-900 text-slate-400 border-t border-slate-850 py-12 px-6 lg:px-12">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6 text-xs font-mono">
          <div className="space-y-1.5 text-center md:text-left">
            <p className="text-slate-300 font-serif font-bold text-sm">Syllabexa Engine Inc.</p>
            <p className="text-[10px] text-slate-500">© 2026 Syllabexa. All rights reserved.</p>
          </div>
          <div className="flex gap-4 uppercase tracking-wider text-[10px]">
            <button onClick={() => setActiveTab('terms')} className="hover:text-white underline cursor-pointer">
              Terms of Service
            </button>
            <span className="text-slate-800">|</span>
            <button onClick={() => setActiveTab('privacy')} className="hover:text-white underline cursor-pointer">
              Privacy Policy
            </button>
            <span className="text-slate-800">|</span>
            <button onClick={onLaunchApp} className="hover:text-indigo-400 cursor-pointer">
              Launch App Console
            </button>
          </div>
        </div>
      </footer>

      {/* waitlist Modal - Lead capture */}
      {showWaitlistModal && (
        <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden text-slate-800 flex flex-col">
            <div className="bg-slate-900 p-5 text-white flex justify-between items-center">
              <div className="space-y-0.5">
                <span className="text-[9px] bg-indigo-500/10 text-indigo-400 font-bold uppercase px-2 py-0.5 rounded border border-indigo-500/20">
                  Waitlist Intake
                </span>
                <h3 className="font-serif font-bold text-base mt-1">Join the Agency Waitlist</h3>
              </div>
              <button 
                onClick={() => {
                  setShowWaitlistModal(false);
                  setWaitlistStatus('idle');
                }}
                className="p-1 text-slate-400 hover:text-white rounded-full transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleJoinWaitlist} className="p-6 space-y-4">
              <p className="text-xs text-slate-500 leading-relaxed">
                Due to heavy database retention loads for personal voice engine training, we limit Agency Beta onboarding spots weekly. Secure your position in line below.
              </p>

              {waitlistStatus === 'success' ? (
                <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl text-center space-y-2 animate-fade-in text-slate-800">
                  <CheckCircle2 size={36} className="text-emerald-600 mx-auto" />
                  <h4 className="font-serif font-bold text-base text-slate-900">Waitlist Registered!</h4>
                  <p className="text-xs text-slate-600">
                    Your spot is confirmed. You are <span className="font-black text-indigo-600">#{waitlistPosition}</span> in queue.
                  </p>
                  <p className="text-[10px] text-slate-400">
                    We will dispatch credentials to your provided address as processing slots activate.
                  </p>
                </div>
              ) : (
                <>
                  {waitlistStatus === 'error' && (
                    <div className="p-3 bg-rose-50 text-rose-800 text-[11px] font-bold rounded-xl border border-rose-100 flex items-center gap-1.5">
                      <AlertCircle size={14} className="text-rose-600 shrink-0" />
                      Failed to join waitlist. Try again.
                    </div>
                  )}

                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Your Name</label>
                      <input
                        type="text"
                        required
                        value={waitlistName}
                        onChange={(e) => setWaitlistName(e.target.value)}
                        placeholder="Sarah Jenkins"
                        className="w-full border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Email Address</label>
                      <input
                        type="email"
                        required
                        value={waitlistEmail}
                        onChange={(e) => setWaitlistEmail(e.target.value)}
                        placeholder="sarah@agency.com"
                        className="w-full border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Agency / Company Name</label>
                      <input
                        type="text"
                        value={waitlistAgency}
                        onChange={(e) => setWaitlistAgency(e.target.value)}
                        placeholder="Jenkins Media Group"
                        className="w-full border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Role / Profile</label>
                      <select
                        value={waitlistRole}
                        onChange={(e) => setWaitlistRole(e.target.value)}
                        className="w-full border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:ring-1 focus:ring-indigo-500 bg-white font-medium"
                      >
                        <option value="Agency Ghostwriter">Agency Ghostwriter</option>
                        <option value="Publishing House Lead">Publishing House Lead</option>
                        <option value="Solo Book Author">Solo Book Author</option>
                        <option value="Content Marketing Studio">Content Marketing Studio</option>
                      </select>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={waitlistStatus === 'loading'}
                    className="w-full mt-2 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-mono uppercase text-xs font-bold tracking-wider rounded-xl transition-all shadow-md cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    {waitlistStatus === 'loading' ? 'Registering...' : 'Secure My Beta Spot'}
                  </button>
                </>
              )}
            </form>
          </div>
        </div>
      )}

    </aside>
  );
}