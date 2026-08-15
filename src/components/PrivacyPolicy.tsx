import React from 'react';
import { Shield, ArrowLeft, Lock, Eye, FileText, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import SyllabexaIcon from './SyllabexaIcon';

export default function PrivacyPolicy() {
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
            <Shield className="w-3.5 h-3.5" />
            Official Privacy & Data Protection Policy
          </div>
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-white tracking-tight">
            Privacy Policy
          </h1>
          <p className="text-slate-400 text-sm font-mono uppercase tracking-widest">
            Effective Date: August 2, 2026 | Last Updated: August 2, 2026
          </p>
        </div>
      </section>

      {/* Policy Content Body */}
      <main className="max-w-3xl mx-auto px-6 py-12 space-y-10 text-sm leading-relaxed text-slate-300">
        <div className="p-6 bg-[#0a0c10] border border-amber-500/20 rounded-2xl space-y-3">
          <h2 className="text-base font-bold text-amber-400 flex items-center gap-2 font-mono uppercase tracking-wider">
            <Lock className="w-4 h-4" />
            Executive Summary & Commitment
          </h2>
          <p>
            At <strong className="text-white">Syllabexa.com</strong> ("Syllabexa", "we", "us", or "our"), operated by our enterprise publishing infrastructure platform, we respect your privacy and are committed to safeguarding your personal information, manuscript content, voice profiles, and literary intellectual property.
          </p>
        </div>

        {/* Section 1 */}
        <section className="space-y-4">
          <h2 className="text-xl font-serif font-bold text-white border-b border-white/10 pb-2 flex items-center gap-2">
            <span className="text-amber-400 font-mono text-sm">01.</span> Information We Collect
          </h2>
          <p>
            When you register for a Syllabexa account, connect your Google Workspace credentials, or utilize our linguistic engine, we collect the following types of information:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-slate-300">
            <li><strong className="text-white">Account Information:</strong> Your email address, display name, unique username handle, and authentication credentials managed securely via Firebase Authentication.</li>
            <li><strong className="text-white">Google Workspace & OAuth Data:</strong> When authorized, we collect your profile identifier and granted OAuth tokens solely to enable integration features (such as exporting manuscripts directly to Google Drive or Google Docs).</li>
            <li><strong className="text-white">Manuscript & Creative Assets:</strong> Text content, voice profiles, story bibles, character blueprints, and typesetting configurations created within Syllabexa. All manuscript data is encrypted in transit and at rest using AES-256 encryption.</li>
            <li><strong className="text-white">Technical & Analytics Data:</strong> IP address, browser user-agent, session telemetry, and performance metrics to ensure uptime and platform stability.</li>
          </ul>
        </section>

        {/* Section 2 */}
        <section className="space-y-4">
          <h2 className="text-xl font-serif font-bold text-white border-b border-white/10 pb-2 flex items-center gap-2">
            <span className="text-amber-400 font-mono text-sm">02.</span> How We Use Your Information
          </h2>
          <p>We use the collected information strictly for legitimate operational purposes:</p>
          <div className="grid md:grid-cols-2 gap-4 pt-2">
            <div className="p-4 bg-white/5 border border-white/10 rounded-xl space-y-2">
              <div className="font-mono text-xs text-amber-400 font-bold uppercase">Platform Delivery</div>
              <p className="text-xs text-slate-400">To render AI linguistic transformations, style extraction, book structuring, and pre-press exports.</p>
            </div>
            <div className="p-4 bg-white/5 border border-white/10 rounded-xl space-y-2">
              <div className="font-mono text-xs text-amber-400 font-bold uppercase">Authentication & Security</div>
              <p className="text-xs text-slate-400">To verify your creator license, enforce access controls, and prevent fraudulent access.</p>
            </div>
            <div className="p-4 bg-white/5 border border-white/10 rounded-xl space-y-2">
              <div className="font-mono text-xs text-amber-400 font-bold uppercase">Workspace Integration</div>
              <p className="text-xs text-slate-400">To sync documents with your connected Google Workspace apps upon your explicit command.</p>
            </div>
            <div className="p-4 bg-white/5 border border-white/10 rounded-xl space-y-2">
              <div className="font-mono text-xs text-amber-400 font-bold uppercase">No Model Training</div>
              <p className="text-xs text-slate-400">Your custom manuscripts and voice profiles are NEVER sold or used to train public foundational AI models.</p>
            </div>
          </div>
        </section>

        {/* Section 3 */}
        <section className="space-y-4">
          <h2 className="text-xl font-serif font-bold text-white border-b border-white/10 pb-2 flex items-center gap-2">
            <span className="text-amber-400 font-mono text-sm">03.</span> Third-Party Services & Integrations
          </h2>
          <p>
            Syllabexa integrates with trusted enterprise infrastructure providers:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-slate-300">
            <li><strong className="text-white">Google Cloud & Firebase:</strong> Provides underlying database hosting (Firestore), authentication, and serverless computing.</li>
            <li><strong className="text-white">Google Gemini API:</strong> Powers our linguistic transforms and editorial AI analysis via encrypted server-side proxy routes.</li>
            <li><strong className="text-white">Stripe Payment Gateway:</strong> Processes subscription payments securely without Syllabexa storing credit card numbers.</li>
          </ul>
        </section>

        {/* Section 4 */}
        <section className="space-y-4">
          <h2 className="text-xl font-serif font-bold text-white border-b border-white/10 pb-2 flex items-center gap-2">
            <span className="text-amber-400 font-mono text-sm">04.</span> Data Retention & Rights
          </h2>
          <p>
            You retain 100% ownership of your literary works and data. You may request account deletion, data export, or revoke OAuth access permissions at any time through your Account Settings or by contacting us at <a href="mailto:privacy@syllabexa.com" className="text-amber-400 underline">privacy@syllabexa.com</a>.
          </p>
        </section>

        {/* Section 5 */}
        <section className="space-y-4">
          <h2 className="text-xl font-serif font-bold text-white border-b border-white/10 pb-2 flex items-center gap-2">
            <span className="text-amber-400 font-mono text-sm">05.</span> Contact & DPO Inquiries
          </h2>
          <p>
            If you have questions regarding this Privacy Policy or data security practices, please reach out to our legal compliance desk:
          </p>
          <div className="p-4 bg-[#0a0c10] border border-white/10 rounded-xl font-mono text-xs space-y-1 text-slate-400">
            <div className="text-white font-bold">Syllabexa Legal & Data Governance Desk</div>
            <div>Email: privacy@syllabexa.com</div>
            <div>Domain: https://syllabexa.com</div>
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
