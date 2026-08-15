import React, { useState } from 'react';
import { Users, Link as LinkIcon, DollarSign, TrendingUp, BarChart, Download, Plus, Search } from 'lucide-react';
import { useToast } from '../lib/ToastContext';

export default function AffiliateDashboard() {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'overview' | 'links' | 'payouts'>('overview');
  
  const [affiliates, setAffiliates] = useState([
    { id: '1', name: 'Laundromat Hub', code: 'WASHBIZ', clicks: 1245, conversions: 87, revenue: 2174.13, pendingPayout: 652.24, commissionRate: 0.30 },
    { id: '2', name: 'Tech Startup Network', code: 'TSN_BOOKS', clicks: 832, conversions: 42, revenue: 1049.58, pendingPayout: 314.87, commissionRate: 0.30 }
  ]);

  const totalRevenue = affiliates.reduce((acc, curr) => acc + curr.revenue, 0);
  const totalPayouts = affiliates.reduce((acc, curr) => acc + curr.pendingPayout, 0);

  return (
    <div className="bg-[#0a0a0d] border border-white/5 rounded-2xl p-6 space-y-6 font-sans">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Users size={20} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white tracking-wide uppercase font-mono">Affiliate & Creator Payout Dashboard</h2>
            <p className="text-[11px] text-slate-400 font-mono">Manage tracking links, partner commissions, and net payout splits.</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 bg-black/40 p-1 rounded-xl border border-white/5">
          {(['overview', 'links', 'payouts'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-1.5 rounded-lg text-xs font-mono font-bold capitalize transition-all ${
                activeTab === tab 
                  ? 'bg-emerald-500/20 text-emerald-300 shadow-lg' 
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-3">
              <div className="text-[10px] font-mono text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <DollarSign size={14} className="text-emerald-400" /> Total Partner Revenue
              </div>
              <div className="text-3xl font-bold text-white">$\{(totalRevenue).toLocaleString('en-US', {minimumFractionDigits: 2})}</div>
              <p className="text-[10px] text-emerald-400 flex items-center gap-1"><TrendingUp size={12}/> +14.2% this month</p>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-3">
              <div className="text-[10px] font-mono text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <BarChart size={14} className="text-indigo-400" /> Pending Payouts
              </div>
              <div className="text-3xl font-bold text-white">$\{(totalPayouts).toLocaleString('en-US', {minimumFractionDigits: 2})}</div>
              <p className="text-[10px] text-indigo-400">Next cycle: 15th of month</p>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-3">
              <div className="text-[10px] font-mono text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Users size={14} className="text-amber-400" /> Active Affiliates
              </div>
              <div className="text-3xl font-bold text-white">{affiliates.length}</div>
              <p className="text-[10px] text-amber-400">Approved Creators</p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'links' && (
        <div className="space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-white font-mono uppercase">Tracking Link Management</h3>
            <button className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[10px] font-mono font-bold flex items-center gap-1.5 transition-all">
              <Plus size={14} /> New Tracking Link
            </button>
          </div>
          <div className="bg-black/50 border border-white/5 rounded-xl overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-white/5 border-b border-white/5 text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                <tr>
                  <th className="p-3">Partner Name</th>
                  <th className="p-3">Ref Code</th>
                  <th className="p-3">Clicks</th>
                  <th className="p-3">Conversions</th>
                  <th className="p-3">Rate</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-xs text-slate-300">
                {affiliates.map(aff => (
                  <tr key={aff.id} className="hover:bg-white/[0.02]">
                    <td className="p-3 font-bold text-white">{aff.name}</td>
                    <td className="p-3 font-mono text-emerald-400">?ref={aff.code}</td>
                    <td className="p-3">{aff.clicks.toLocaleString()}</td>
                    <td className="p-3">{aff.conversions}</td>
                    <td className="p-3">{(aff.commissionRate * 100).toFixed(0)}%</td>
                    <td className="p-3 text-right">
                      <button 
                        onClick={() => {
                          navigator.clipboard.writeText(`https://kremerscore.com/?ref=${aff.code}`);
                          showToast('Tracking link copied to clipboard', 'success');
                        }}
                        className="px-2 py-1 bg-white/5 hover:bg-white/10 rounded flex items-center gap-1 ml-auto text-[10px] text-slate-300 font-mono"
                      >
                        <LinkIcon size={12} /> Copy URL
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'payouts' && (
        <div className="space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-white font-mono uppercase">Commission Payouts</h3>
            <button 
              onClick={() => showToast('Initiating bulk Stripe Connect payouts...', 'info')}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-[10px] font-mono font-bold flex items-center gap-1.5 transition-all"
            >
              <Download size={14} /> Process Bulk Payouts
            </button>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl flex items-center justify-between">
            <div>
              <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1">Stripe Connect Integration</div>
              <p className="text-xs text-slate-300">Automatically disburse net commission splits directly to affiliate bank accounts via Stripe Connect.</p>
            </div>
            <div className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs font-bold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Connect Active
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
