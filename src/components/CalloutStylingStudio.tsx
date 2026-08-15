import React, { useState } from 'react';
import { Palette, Layers, Sliders, Check, Sparkles, Eye, Type } from 'lucide-react';
import { CalloutStyleConfig } from '../types';
import { renderCalloutBlock } from '../lib/prepressParser';
import { useToast } from '../lib/ToastContext';

interface CalloutStylingStudioProps {
  config: CalloutStyleConfig;
  onChange: (newConfig: CalloutStyleConfig) => void;
  onApplyToAST?: () => void;
}

type TabId = 'palette' | 'fill' | 'border' | 'padding';

export const CalloutStylingStudio: React.FC<CalloutStylingStudioProps> = ({
  config,
  onChange,
  onApplyToAST
}) => {
  const [activeTab, setActiveTab] = useState<TabId>('palette');
  // OPTIMIZATION: Now fully interactive via the Sandbox text area
  const [showLivePreviewText, setShowLivePreviewText] = useState<string>(
    ">[!NOTE] Strategic real estate acquisitions require auditing historical municipal utility bills prior to executing binding purchase agreements."
  );
  const { showToast } = useToast();

  const PRESET_COLORS: Array<{ name: string; value: CalloutStyleConfig['borderColor']; bgClass: string }> = [
    { name: 'Warm Amber', value: 'amber', bgClass: 'bg-amber-500' },
    { name: 'Imperial Gold', value: 'gold', bgClass: 'bg-amber-400' },
    { name: 'Obsidian Slate', value: 'slate', bgClass: 'bg-slate-800' },
    { name: 'Crimson Doctrine', value: 'crimson', bgClass: 'bg-rose-600' },
    { name: 'Emerald Vault', value: 'emerald', bgClass: 'bg-emerald-600' },
    { name: 'Cyan Tech', value: 'cyan', bgClass: 'bg-cyan-600' },
    { name: 'Violet Velvet', value: 'violet', bgClass: 'bg-violet-600' }
  ];

  const TABS = [
    { id: 'palette' as TabId, label: 'Border Palette', icon: Palette },
    { id: 'fill' as TabId, label: 'Background Fill', icon: Layers },
    { id: 'border' as TabId, label: 'Bar Thickness', icon: Sliders },
    { id: 'padding' as TabId, label: 'Padding & Inset', icon: Eye }
  ];

  // OPTIMIZATION: Strict Type Inference (No more 'any')
  const updateConfig = <K extends keyof CalloutStyleConfig>(key: K, value: CalloutStyleConfig[K]) => {
    onChange({ ...config, [key]: value });
  };

  return (
    <div className="bg-[#0c0e12] border border-white/5 rounded-3xl p-6 shadow-2xl space-y-6 font-sans select-none relative z-0">
      
      {/* Studio Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-5">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.15)]">
            <Palette size={20} />
          </div>
          <div>
            <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-slate-100 flex items-center gap-2">
              <span>Callout Styling Studio</span>
              <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 text-[9px] border border-amber-500/30">INDESIGN PRO</span>
            </h3>
            <p className="text-[10px] text-slate-500 font-mono mt-0.5">
              Interactive border, fill, and inset typography typesetting engine.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="px-3 py-1.5 bg-amber-950/40 text-amber-400 border border-amber-500/20 rounded-lg text-[9px] font-mono font-bold flex items-center gap-1.5 shadow-sm">
            <Sparkles size={12} />
            AST Metadata Sync
          </span>
          {onApplyToAST && (
            <button
              onClick={() => {
                onApplyToAST();
                showToast('Callout styling applied to manuscript AST!', 'success');
              }}
              className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-black rounded-xl text-xs font-mono font-black uppercase tracking-wider shadow-[0_0_15px_rgba(245,158,11,0.2)] transition-all cursor-pointer flex items-center gap-2"
            >
              <Check size={14} /> Apply to AST
            </button>
          )}
        </div>
      </div>

      {/* Dynamic Control Tabs */}
      <div className="flex bg-[#040506] p-1.5 rounded-2xl gap-1 border border-white/5">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex-1 py-2.5 rounded-xl text-[11px] font-mono uppercase tracking-wider transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 ${
              activeTab === id 
                ? 'bg-amber-500 text-black font-bold shadow-md shadow-amber-500/20' 
                : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
            }`}
          >
            <Icon size={14} />
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>

      {/* TAB 1: BORDER PALETTE */}
      {activeTab === 'palette' && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <label className="block text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest">
            Accent Border Color Palette
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {PRESET_COLORS.map((color) => (
              <button
                key={color.value}
                onClick={() => {
                  updateConfig('borderColor', color.value);
                  updateConfig('customBorderColor', undefined);
                  showToast(`Selected ${color.name} border`, 'info');
                }}
                className={`p-3.5 rounded-xl border flex items-center gap-3 text-xs font-mono font-bold cursor-pointer transition-all duration-200 ${
                  config.borderColor === color.value && !config.customBorderColor
                    ? 'border-amber-500 bg-amber-500/10 text-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.1)]'
                    : 'border-white/5 bg-black/20 text-slate-400 hover:border-white/20 hover:text-slate-200'
                }`}
              >
                <span className={`w-3.5 h-3.5 rounded-full ${color.bgClass} shrink-0 shadow-sm`} />
                <span className="truncate">{color.name}</span>
              </button>
            ))}
          </div>

          <div className="pt-2 flex flex-col sm:flex-row sm:items-center gap-3 bg-black/40 p-4 rounded-xl border border-white/5 focus-within:border-amber-500/50 transition-colors">
            <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest shrink-0">Custom Hex:</span>
            <div className="flex items-center gap-3 w-full">
              <input
                type="text"
                placeholder="#f59e0b"
                value={config.customBorderColor || ''}
                onChange={(e) => updateConfig('customBorderColor', e.target.value || undefined)}
                className="bg-transparent border-b border-dashed border-slate-700 px-2 py-1 text-sm font-mono font-bold text-slate-200 w-32 outline-none focus:border-amber-500 transition-colors"
              />
              {config.customBorderColor && (
                <span className="w-6 h-6 rounded-md border border-white/10 shadow-inner shrink-0" style={{ backgroundColor: config.customBorderColor }} />
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: BACKGROUND FILL */}
      {activeTab === 'fill' && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <label className="block text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest">
            Callout Background Fill Opacity Mode
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { id: 'subtle', label: 'Subtle Tint', desc: 'Minimal soft tone (20%)' },
              { id: 'tint', label: 'Standard Tint', desc: 'Balanced fill (50%)' },
              { id: 'solid', label: 'Solid Accent', desc: 'High emphasis (100%)' },
              { id: 'none', label: 'Transparent', desc: 'Border-only quote bar' }
            ].map((fill) => (
              <button
                key={fill.id}
                onClick={() => {
                  updateConfig('fillOpacity', fill.id as CalloutStyleConfig['fillOpacity']);
                  showToast(`Fill set to ${fill.label}`, 'info');
                }}
                className={`p-4 rounded-xl border text-left cursor-pointer transition-all duration-200 ${
                  config.fillOpacity === fill.id
                    ? 'border-amber-500 bg-amber-500/10 text-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.1)]'
                    : 'border-white/5 bg-black/20 text-slate-400 hover:border-white/20 hover:text-slate-200'
                }`}
              >
                <div className="font-mono font-bold text-xs mb-1">{fill.label}</div>
                <div className="text-[10px] opacity-70">{fill.desc}</div>
              </button>
            ))}
          </div>

          <div className="pt-2 flex flex-col sm:flex-row sm:items-center gap-3 bg-black/40 p-4 rounded-xl border border-white/5 focus-within:border-amber-500/50 transition-colors">
            <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest shrink-0">Custom Fill CSS:</span>
            <input
              type="text"
              placeholder="rgba(245, 158, 11, 0.08)"
              value={config.customBgColor || ''}
              onChange={(e) => updateConfig('customBgColor', e.target.value || undefined)}
              className="bg-transparent border-b border-dashed border-slate-700 px-2 py-1 text-sm font-mono font-bold text-slate-200 w-full sm:w-64 outline-none focus:border-amber-500 transition-colors"
            />
          </div>
        </div>
      )}

      {/* TAB 3: BAR THICKNESS */}
      {activeTab === 'border' && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <label className="block text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest">
            Accent Border Width & Geometry
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { width: '2px', name: 'Fine Line', desc: 'Subtle editorial accent' },
              { width: '4px', name: 'Standard Bar', desc: 'Classic KDP book callout' },
              { width: '6px', name: 'Doctrine Bar', desc: 'Prominent heavy rule' },
              { width: '8px', name: 'Heavy Bar', desc: 'High priority block' }
            ].map((b) => (
              <button
                key={b.width}
                onClick={() => {
                  updateConfig('borderWidth', b.width);
                  showToast(`Border width set to ${b.width}`, 'info');
                }}
                className={`p-4 rounded-xl border text-left cursor-pointer transition-all duration-200 ${
                  config.borderWidth === b.width
                    ? 'border-amber-500 bg-amber-500/10 text-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.1)]'
                    : 'border-white/5 bg-black/20 text-slate-400 hover:border-white/20 hover:text-slate-200'
                }`}
              >
                <div className="font-mono font-bold text-xs mb-1">{b.width} {b.name}</div>
                <div className="text-[10px] opacity-70">{b.desc}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: PADDING & INSET */}
      {activeTab === 'padding' && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <label className="block text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest">
            Callout Box Inner Padding & Inset Ratio
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { id: 'compact', label: 'Compact', desc: 'Dense reference manual (10px)' },
              { id: 'standard', label: 'Standard', desc: 'Classic trade book (16px)' },
              { id: 'relaxed', label: 'Relaxed', desc: 'Spacious reader edition (24px)' },
              { id: 'spacious', label: 'Spacious', desc: 'Full-page pull quote (32px)' }
            ].map((p) => (
              <button
                key={p.id}
                onClick={() => {
                  updateConfig('padding', p.id as CalloutStyleConfig['padding']);
                  updateConfig('customPadding', undefined);
                  showToast(`Padding set to ${p.label}`, 'info');
                }}
                className={`p-4 rounded-xl border text-left cursor-pointer transition-all duration-200 ${
                  config.padding === p.id && !config.customPadding
                    ? 'border-amber-500 bg-amber-500/10 text-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.1)]'
                    : 'border-white/5 bg-black/20 text-slate-400 hover:border-white/20 hover:text-slate-200'
                }`}
              >
                <div className="font-mono font-bold text-xs mb-1">{p.label}</div>
                <div className="text-[10px] opacity-70">{p.desc}</div>
              </button>
            ))}
          </div>

          <div className="pt-2 flex flex-col sm:flex-row sm:items-center gap-3 bg-black/40 p-4 rounded-xl border border-white/5 focus-within:border-amber-500/50 transition-colors">
            <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest shrink-0">Custom Padding:</span>
            <input
              type="text"
              placeholder="12px 20px"
              value={config.customPadding || ''}
              onChange={(e) => updateConfig('customPadding', e.target.value || undefined)}
              className="bg-transparent border-b border-dashed border-slate-700 px-2 py-1 text-sm font-mono font-bold text-slate-200 w-full sm:w-48 outline-none focus:border-amber-500 transition-colors"
            />
          </div>
        </div>
      )}

      {/* LIVE INTERACTIVE PREVIEW */}
      <div className="pt-6 border-t border-white/5 space-y-4">
        
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="flex items-center gap-2 text-amber-400 uppercase tracking-wider font-bold">
              <Eye size={14} />
              Interactive Prepress Sandbox
            </span>
            <span className="text-slate-500 text-[10px] border border-slate-800 px-2 py-0.5 rounded-md">300 DPI RENDER</span>
          </div>
          
          {/* OPTIMIZATION: Actual Interactive Input for Sandbox */}
          <div className="relative group">
            <Type size={14} className="absolute left-3 top-3 text-slate-600 group-focus-within:text-amber-500 transition-colors" />
            <textarea
              value={showLivePreviewText}
              onChange={(e) => setShowLivePreviewText(e.target.value)}
              placeholder="Type markdown callout text here to preview..."
              className="w-full bg-black/30 border border-white/5 rounded-xl pl-9 pr-4 py-3 text-[13px] text-slate-300 font-mono focus:outline-none focus:border-amber-500/40 transition-colors resize-none h-20 shadow-inner custom-scrollbar"
            />
          </div>
        </div>

        {/* 300 DPI Export Simulation Canvas */}
        <div className="p-6 bg-[#fdfcfaf0] border-4 border-slate-900 rounded-xl shadow-2xl text-black">
          {renderCalloutBlock(showLivePreviewText, 9999, config)}
        </div>
        
      </div>
    </div>
  );
};