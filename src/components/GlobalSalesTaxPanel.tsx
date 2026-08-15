import React, { useState } from 'react';
import { Globe, ShieldCheck, MapPin, AlertTriangle, Settings2, ExternalLink } from 'lucide-react';
import { useToast } from '../lib/ToastContext';

export default function GlobalSalesTaxPanel() {
  const { showToast } = useToast();
  const [taxEnabled, setTaxEnabled] = useState(true);
  const [digitalGoods, setDigitalGoods] = useState(true);
  const [physicalGoods, setPhysicalGoods] = useState(true);

  return (
    <div className="bg-[#0a0a0d] border border-white/5 rounded-2xl p-6 space-y-6 font-sans">
      <div className="flex items-center justify-between border-b border-white/5 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <Globe size={20} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white tracking-wide uppercase font-mono">Global Sales Tax & VAT Engine</h2>
            <p className="text-[11px] text-slate-400 font-mono">Automated nexus calculations and tax collection via Stripe Tax.</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
           <button 
             onClick={() => showToast('Stripe Tax settings synchronized.', 'success')}
             className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-white rounded-lg text-[10px] font-mono font-bold flex items-center gap-1.5 transition-all"
           >
             <Settings2 size={14} /> Sync Settings
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-[10px] font-mono text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <ShieldCheck size={14} className="text-purple-400" /> Stripe Tax Integration
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" checked={taxEnabled} onChange={(e) => setTaxEnabled(e.target.checked)} className="sr-only peer" />
                <div className="w-9 h-5 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-500"></div>
              </label>
            </div>
            
            <p className="text-xs text-slate-300">
              When enabled, checkout sessions will dynamically calculate and collect U.S. Sales Tax and international VAT/GST based on the buyer's billing location and local nexus thresholds.
            </p>
            
            <div className="pt-4 border-t border-slate-800 space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={digitalGoods} onChange={(e) => setDigitalGoods(e.target.checked)} className="rounded bg-black border-white/10 text-purple-500 focus:ring-purple-500/30 w-4 h-4" />
                <div className="text-xs text-slate-300">
                  <span className="font-bold text-white block">Digital Goods (EPUB/M4B)</span>
                  <span className="text-[10px] text-slate-400">Subject to digital VAT/GST rules (e.g. EU VAT MOSS)</span>
                </div>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={physicalGoods} onChange={(e) => setPhysicalGoods(e.target.checked)} className="rounded bg-black border-white/10 text-purple-500 focus:ring-purple-500/30 w-4 h-4" />
                <div className="text-xs text-slate-300">
                  <span className="font-bold text-white block">Physical Goods (Print-on-Demand)</span>
                  <span className="text-[10px] text-slate-400">Subject to local state sales tax rules for printed books</span>
                </div>
              </label>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-black/40 border border-white/5 p-5 rounded-xl h-full flex flex-col">
            <h3 className="text-xs font-bold text-white font-mono uppercase mb-3 flex items-center gap-2">
              <MapPin size={14} className="text-slate-400" /> Active Tax Nexuses
            </h3>
            <div className="space-y-3 flex-1">
              <div className="p-3 bg-white/5 border border-white/10 rounded-lg flex items-center justify-between">
                <div className="text-xs font-bold text-white">United States (Florida)</div>
                <div className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded">Active Collection</div>
              </div>
              <div className="p-3 bg-white/5 border border-white/10 rounded-lg flex items-center justify-between">
                <div className="text-xs font-bold text-white">European Union (VAT)</div>
                <div className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded">Active Collection</div>
              </div>
              <div className="p-3 bg-white/5 border border-white/10 rounded-lg flex items-center justify-between">
                <div className="text-xs font-bold text-white">United Kingdom (HMRC)</div>
                <div className="text-[10px] font-mono text-amber-400 bg-amber-500/10 px-2 py-1 rounded flex items-center gap-1">
                  <AlertTriangle size={10} /> Approaching Threshold
                </div>
              </div>
            </div>
            
            <button 
              onClick={() => showToast('Redirecting to Stripe Dashboard...', 'info')}
              className="mt-4 w-full py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-mono font-bold flex items-center justify-center gap-2 transition-all"
            >
              Manage Registrations in Stripe <ExternalLink size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
