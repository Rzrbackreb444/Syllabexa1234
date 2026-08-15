import React, { useState } from 'react';
import { Store, TrendingUp, Users, Globe, Settings, ArrowRight } from 'lucide-react';
import AffiliateDashboard from './AffiliateDashboard';
import GlobalSalesTaxPanel from './GlobalSalesTaxPanel';
import ReaderAnalyticsLoop from './ReaderAnalyticsLoop';

export default function SyllabexaCommerceEngine() {
  const [activeTab, setActiveTab] = useState<'tax' | 'affiliates' | 'analytics'>('tax');

  return (
    <div className="h-full flex flex-col bg-[#050505] overflow-y-auto custom-scrollbar">
      <div className="max-w-6xl mx-auto w-full p-6 lg:p-12 space-y-8 animate-in fade-in duration-500">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500 shadow-[0_0_30px_rgba(245,158,11,0.15)]">
                <Store size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-black text-white tracking-tight uppercase">Publishing Commerce Engine</h1>
                <p className="text-sm text-slate-400 font-mono mt-1">Autonomous direct-to-consumer monetization and compliance.</p>
              </div>
            </div>
          </div>
          
          <div className="flex gap-2 p-1 bg-black/40 border border-white/5 rounded-xl">
            <button
              onClick={() => setActiveTab('tax')}
              className={`px-4 py-2 rounded-lg text-xs font-mono font-bold uppercase transition-all flex items-center gap-2 ${
                activeTab === 'tax' ? 'bg-amber-500/20 text-amber-300 shadow-lg' : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Globe size={14} /> Tax Engine
            </button>
            <button
              onClick={() => setActiveTab('affiliates')}
              className={`px-4 py-2 rounded-lg text-xs font-mono font-bold uppercase transition-all flex items-center gap-2 ${
                activeTab === 'affiliates' ? 'bg-emerald-500/20 text-emerald-300 shadow-lg' : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Users size={14} /> Affiliates
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`px-4 py-2 rounded-lg text-xs font-mono font-bold uppercase transition-all flex items-center gap-2 ${
                activeTab === 'analytics' ? 'bg-cyan-500/20 text-cyan-300 shadow-lg' : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <TrendingUp size={14} /> Analytics
            </button>
          </div>
        </div>

        {/* Dynamic Workspace */}
        <div className="min-h-[600px]">
          {activeTab === 'tax' && (
            <div className="animate-in slide-in-from-bottom-4 duration-300">
              <GlobalSalesTaxPanel />
            </div>
          )}
          
          {activeTab === 'affiliates' && (
            <div className="animate-in slide-in-from-bottom-4 duration-300">
              <AffiliateDashboard />
            </div>
          )}
          
          {activeTab === 'analytics' && (
            <div className="animate-in slide-in-from-bottom-4 duration-300">
              <ReaderAnalyticsLoop />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
