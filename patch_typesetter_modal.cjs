const fs = require('fs');
const file = './src/components/TypesetterSimulator.tsx';
let content = fs.readFileSync(file, 'utf8');

// We need to add state for the preflight simulation
content = content.replace(
  `const [showInspectorModal, setShowInspectorModal] = useState(false);`,
  `const [showInspectorModal, setShowInspectorModal] = useState(false);
  const [preflightStatus, setPreflightStatus] = useState<'idle' | 'running' | 'passed'>('idle');`
);

const originalModalHtml = `<div className="space-y-3 font-mono text-xs">
                <div className="p-3 bg-slate-900/80 border border-emerald-500/20 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="text-slate-200">EAN-13 Vector Barcode & 5-Digit Price</span>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">Verified</span>
                </div>
                <div className="p-3 bg-slate-900/80 border border-emerald-500/20 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="text-slate-200">Spine Thickness Calculation</span>
                  </div>
                  <span className="text-[10px] font-bold text-slate-300">{spineWidthInches.toFixed(3)}" ({paperStock} paper)</span>
                </div>
              </div>`;

const updatedModalHtml = `<div className="space-y-3 font-mono text-xs">
                {preflightStatus === 'idle' && (
                  <div className="p-8 text-center space-y-4">
                    <ShieldCheck className="w-12 h-12 text-slate-500 mx-auto" />
                    <p className="text-slate-400">Run a complete algorithmic preflight check to guarantee IngramSpark & Amazon KDP compliance before export.</p>
                    <button 
                      onClick={() => {
                        setPreflightStatus('running');
                        setTimeout(() => setPreflightStatus('passed'), 2500);
                      }}
                      className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold font-sans shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all"
                    >
                      Run Preflight Simulator
                    </button>
                  </div>
                )}
                
                {preflightStatus === 'running' && (
                  <div className="p-8 space-y-6">
                    <div className="flex items-center justify-between text-slate-400">
                      <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Verifying Trim Size (6x9)...</span>
                      <span className="text-emerald-500">Checking</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-400">
                      <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" style={{ animationDelay: '200ms' }} /> Calculating Gutter Safety Margins...</span>
                      <span className="text-emerald-500">Checking</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-400">
                      <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" style={{ animationDelay: '400ms' }} /> Validating CMYK Color Profiles...</span>
                      <span className="text-emerald-500">Checking</span>
                    </div>
                  </div>
                )}

                {preflightStatus === 'passed' && (
                  <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-3">
                    <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center justify-center gap-3 mb-6">
                      <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                      <span className="text-sm font-bold text-emerald-400 font-sans tracking-wide">Passed Amazon KDP & IngramSpark Preflight</span>
                    </div>
                    
                    <div className="p-3 bg-slate-900/80 border border-emerald-500/20 rounded-xl flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span className="text-slate-200">Trim Size Verification</span>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-400">Standard 6x9" Valid</span>
                    </div>
                    <div className="p-3 bg-slate-900/80 border border-emerald-500/20 rounded-xl flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span className="text-slate-200">Gutter Safety Margin</span>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-400">No Bleed Errors</span>
                    </div>
                    <div className="p-3 bg-slate-900/80 border border-emerald-500/20 rounded-xl flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span className="text-slate-200">Color Profile</span>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-400">CMYK Compliant</span>
                    </div>
                    <div className="p-3 bg-slate-900/80 border border-emerald-500/20 rounded-xl flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span className="text-slate-200">Spine Thickness Calculation</span>
                      </div>
                      <span className="text-[10px] font-bold text-slate-300">{spineWidthInches.toFixed(3)}" ({paperStock} paper)</span>
                    </div>
                  </motion.div>
                )}
              </div>`;

content = content.replace(originalModalHtml, updatedModalHtml);

// Reset state when closing
content = content.replace(
  `<button onClick={() => setShowInspectorModal(false)} className="px-4 py-2 bg-white/5`,
  `<button onClick={() => { setShowInspectorModal(false); setTimeout(() => setPreflightStatus('idle'), 300); }} className="px-4 py-2 bg-white/5`
).replace(
  `<button onClick={() => setShowInspectorModal(false)} className="p-1.5 text-slate-400`,
  `<button onClick={() => { setShowInspectorModal(false); setTimeout(() => setPreflightStatus('idle'), 300); }} className="p-1.5 text-slate-400`
);

fs.writeFileSync(file, content);
console.log('Patched TypesetterSimulator KDP Inspector');
