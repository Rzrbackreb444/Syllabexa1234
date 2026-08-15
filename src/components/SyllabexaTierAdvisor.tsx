import React, { useState } from 'react';
import { Sparkles, Check, HelpCircle, DollarSign, Award, ArrowRight } from 'lucide-react';

export default function SyllabexaTierAdvisor() {
  const [booksPerMonth, setBooksPerMonth] = useState<number>(2);
  const [clientCount, setClientCount] = useState<number>(1);
  const [requiresTeam, setRequiresTeam] = useState<boolean>(false);
  const [selectedPreset, setSelectedPreset] = useState<'creator' | 'agency' | 'enterprise' | null>(null);

  const getRecommendedTier = () => {
    if (booksPerMonth >= 15 || clientCount >= 8 || requiresTeam) {
      return {
        tier: "Agency Pro",
        price: "$499/mo",
        reason: "High book/chapter volumes for multiple brands/clients with collaboration capabilities.",
        features: [
          "Unlimited Voice Profile locks",
          "Automated Series Sequential Planning",
          "Advanced Batch Generation API (Up to 100 books/mo)",
          "Shared workspaces & editorial workflows",
          "Full custom CSS & PDF export branding layouts"
        ]
      };
    } else if (booksPerMonth >= 5 || clientCount >= 3) {
      return {
        tier: "Agency",
        price: "$199/mo",
        reason: "Medium volumes spanning multiple distinct voices or regular agency workloads.",
        features: [
          "Up to 10 locked Voice Profiles",
          "Book Autopilot drafting loops (Up to 15 books/mo)",
          "Editorial agent chapter scoreboards",
          "Front & Back Matter automatic structuring",
          "Google Drive & standard Docx integrations"
        ]
      };
    } else {
      return {
        tier: "Creator",
        price: "$49/mo",
        reason: "Perfect for single authors, content designers, or independent creators.",
        features: [
          "1 Locked Voice Profile",
          "Book Autopilot outlines & drafts (Up to 3 books/mo)",
          "Core Editorial Review agent score",
          "Export planner print templates",
          "Basic snapshot drafts & diffs"
        ]
      };
    }
  };

  const recommendation = getRecommendedTier();

  return (
    <aside aria-label="Syllabexa Usage & Tier Advisor" className="p-6 max-w-4xl mx-auto space-y-8 animate-fade-in text-slate-800 custom-scrollbar">
      <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
        <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
          <Award size={24} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900">Syllabexa Usage & Tier Advisor</h2>
          <p className="text-sm text-slate-500">Calculate volume, estimate capacity, and map your writing output to optimal pricing tiers.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Advisor Calculator */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-5 border border-slate-200 rounded-2xl shadow-sm space-y-5">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-500">Usage Questionnaire</h3>

            {/* Books slider */}
            <div className="space-y-1.5 text-xs">
              <label className="font-bold text-slate-600 flex justify-between">
                <span>Books Drafted / Month:</span>
                <span className="text-indigo-600 font-extrabold">{booksPerMonth} Books</span>
              </label>
              <input
                type="range"
                min="1"
                max="30"
                value={booksPerMonth}
                onChange={(e) => setBooksPerMonth(Number(e.target.value))}
                className="w-full accent-indigo-600 cursor-pointer"
              />
              <p className="text-[10px] text-slate-400">Est. {booksPerMonth * 5} chapters total generated per month.</p>
            </div>

            {/* Client slider */}
            <div className="space-y-1.5 text-xs">
              <label className="font-bold text-slate-600 flex justify-between">
                <span>Unique Author Voices / Clients:</span>
                <span className="text-indigo-600 font-extrabold">{clientCount} Voices</span>
              </label>
              <input
                type="range"
                min="1"
                max="15"
                value={clientCount}
                onChange={(e) => setClientCount(Number(e.target.value))}
                className="w-full accent-indigo-600 cursor-pointer"
              />
              <p className="text-[10px] text-slate-400">Distinct Author Voice Profile locks needed.</p>
            </div>

            {/* Team workspace toggle */}
            <div className="flex items-center justify-between text-xs font-semibold p-3 bg-slate-50 rounded-xl border border-slate-100">
              <label className="text-slate-700 flex flex-col gap-0.5 cursor-pointer">
                <span>Team & Agency Workspaces?</span>
                <span className="text-[10px] text-slate-400 font-medium">Multiple editors reviewing books simultaneously.</span>
              </label>
              <input
                type="checkbox"
                checked={requiresTeam}
                onChange={(e) => setRequiresTeam(e.target.checked)}
                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Advisor Recommendation Output */}
        <section aria-label="Tier Recommendation" className="lg:col-span-7 space-y-6">
          <div className="bg-gradient-to-tr from-slate-900 to-indigo-950 text-white rounded-2xl p-6 space-y-4 shadow-lg border border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-full">
                Optimal Operational Fit
              </span>
              <span className="text-lg font-black text-indigo-300">{recommendation.price}</span>
            </div>

            <div className="space-y-1">
              <h3 className="text-2xl font-black text-white">{recommendation.tier} Recommended</h3>
              <p className="text-xs text-slate-300 font-medium leading-relaxed italic">
                "{recommendation.reason}"
              </p>
            </div>

            <div className="space-y-2 pt-4 border-t border-slate-800">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Included Features:</span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px]">
                {recommendation.features.map((feat, idx) => (
                  <div key={idx} className="flex gap-2 items-start text-slate-200">
                    <Check size={12} className="text-indigo-400 mt-0.5 shrink-0" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Pricing tier details comparison table */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5 space-y-3">
            <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-500">Plan presets comparison</h4>
            <div className="grid grid-cols-3 gap-3 text-center text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="font-bold text-slate-800 block">Creator</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">1 voice profile</span>
                <span className="font-black text-slate-900 mt-2 block">$49/mo</span>
              </div>
              <div className="p-3 bg-indigo-50/50 rounded-xl border border-indigo-200">
                <span className="font-extrabold text-indigo-900 block">Agency</span>
                <span className="text-[10px] text-indigo-500 block mt-0.5">10 voice profiles</span>
                <span className="font-black text-indigo-900 mt-2 block">$199/mo</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="font-bold text-slate-800 block">Agency Pro</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">Unlimited voices</span>
                <span className="font-black text-slate-900 mt-2 block">$499/mo</span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </aside>
  );
}