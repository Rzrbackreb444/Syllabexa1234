import React from 'react';
import { Shield, ArrowLeft, FileText, Scale, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import SyllabexaIcon from './SyllabexaIcon';

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-[#07080a] text-slate-300 font-sans selection:bg-amber-500/30 selection:text-amber-200">
      {/* Top Header */}
      <header className="border-b border-white/10 bg-[#0a0c10]/80 backdrop-blur-md sticky top-0 z-50 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <SyllabexaIcon size={32} glow={true} />
            <span className="font-serif font-black tracking-widest text-white uppercase text-lg group-hover:text-amber-400 transition-colors">
              SYLLABEXA
            </span>
          </Link>
          <Link
            to="/"
            className="flex items-center gap-2 text-xs font-mono font-bold text-slate-400 hover:text-amber-400 transition-colors bg-white/5 hover:bg-white/10 px-4 py-2 rounded-xl border border-white/10"
          >
            <ArrowLeft className="w-4 h-4" />
            RETURN HOME
          </Link>
        </div>
      </header>

      {/* Hero Banner */}
      <section className="py-16 px-6 border-b border-white/5 bg-gradient-to-b from-amber-500/5 via-transparent to-transparent">
        <div className="max-w-3xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-mono uppercase tracking-widest">
            <Scale className="w-3.5 h-3.5" />
            Enterprise Terms of Service & License
          </div>
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-white tracking-tight">
            Terms of Service
          </h1>
          <p className="text-slate-400 text-sm font-mono uppercase tracking-widest">
            Effective Date: August 2, 2026 | Last Updated: August 2, 2026
          </p>
        </div>
      </section>

      {/* Terms Content Body */}
      <main className="max-w-3xl mx-auto px-6 py-12 space-y-10 text-sm leading-relaxed text-slate-300">
        <div className="p-6 bg-[#0a0c10] border border-amber-500/20 rounded-2xl space-y-3">
          <h2 className="text-base font-bold text-amber-400 flex items-center gap-2 font-mono uppercase tracking-wider">
            <FileText className="w-4 h-4" />
            Acceptance of Terms
          </h2>
          <p>
            By accessing or using <strong className="text-white">https://syllabexa.com</strong> ("Syllabexa"), creating an account, or subscribing to our creator tier services, you agree to be bound by these Terms of Service. If you do not agree to these terms, you must not access or use the platform.
          </p>
        </div>

        {/* Section 1 */}
        <section className="space-y-4">
          <h2 className="text-xl font-serif font-bold text-white border-b border-white/10 pb-2 flex items-center gap-2">
            <span className="text-amber-400 font-mono text-sm">01.</span> Intellectual Property & Content Ownership
          </h2>
          <p>
            You retain full, unencumbered ownership of all manuscripts, literary works, voice samples, and assets uploaded to or generated on Syllabexa.
          </p>
          <ul className="list-disc pl-6 space-y-2 text-slate-300">
            <li><strong className="text-white">Author Royalty Rights:</strong> Syllabexa claims zero copyright, royalty, or commercial ownership over your generated manuscripts or publications.</li>
            <li><strong className="text-white">Platform Rights:</strong> Syllabexa owns all rights, titles, and interests in the underlying platform architecture, UI, algorithms, and typesetting software.</li>
          </ul>
        </section>

        {/* Section 2 */}
        <section className="space-y-4">
          <h2 className="text-xl font-serif font-bold text-white border-b border-white/10 pb-2 flex items-center gap-2">
            <span className="text-amber-400 font-mono text-sm">02.</span> Acceptable Use Policy
          </h2>
          <p>You agree not to use Syllabexa to:</p>
          <ul className="list-disc pl-6 space-y-2 text-slate-300">
            <li>Violate applicable copyright laws, trademarks, or proprietary intellectual property rights.</li>
            <li>Generate or disseminate malicious code, automated scraping bots, or spam network campaigns.</li>
            <li>Attempt to bypass security layers, reverse-engineer encryption keys, or access unauthorized databases.</li>
          </ul>
        </section>

        {/* Section 3 */}
        <section className="space-y-4">
          <h2 className="text-xl font-serif font-bold text-white border-b border-white/10 pb-2 flex items-center gap-2">
            <span className="text-amber-400 font-mono text-sm">03.</span> Subscriptions, Billing, & Licensing
          </h2>
          <p>
            Access to Syllabexa Pro studios is provided on a recurring subscription basis. Subscriptions automatically renew unless cancelled prior to the billing cycle end date. Payments are handled via Stripe.
          </p>
        </section>

        {/* Section 4 */}
        <section className="space-y-4">
          <h2 className="text-xl font-serif font-bold text-white border-b border-white/10 pb-2 flex items-center gap-2">
            <span className="text-amber-400 font-mono text-sm">04.</span> Limitation of Liability
          </h2>
          <p>
            Syllabexa is provided on an "AS IS" and "AS AVAILABLE" basis. To the maximum extent permitted by law, Syllabexa shall not be liable for any indirect, incidental, or consequential damages resulting from platform downtime or data loss.
          </p>
        </section>

        {/* Section 5 */}
        <section className="space-y-4">
          <h2 className="text-xl font-serif font-bold text-white border-b border-white/10 pb-2 flex items-center gap-2">
            <span className="text-amber-400 font-mono text-sm">05.</span> Contact Information
          </h2>
          <p>
            For legal notices or questions regarding these Terms, contact us at:
          </p>
          <div className="p-4 bg-[#0a0c10] border border-white/10 rounded-xl font-mono text-xs space-y-1 text-slate-400">
            <div className="text-white font-bold">Syllabexa Publishing Infrastructure</div>
            <div>Email: terms@syllabexa.com</div>
            <div>URL: https://syllabexa.com/terms</div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-[#0a0c10] py-8 text-center text-xs font-mono text-slate-500">
        <p>&copy; {new Date().getFullYear()} Syllabexa. All rights reserved.</p>
      </footer>
    </div>
  );
}
