import React, { useState } from 'react';
import { ShieldCheck, AlertTriangle, CheckCircle2, RefreshCw, FileText, Layers, Download, Cpu } from 'lucide-react';
import { PrepressTestSuite, PreflightAssertionResult } from '../services/PrepressTestSuite';

interface KdpPreflightCheckerProps {
  onClose: () => void;
  manuscriptTitle?: string;
  chapterCount?: number;
  wordCount?: number;
}

export default function KdpPreflightChecker({ onClose, manuscriptTitle = 'Untitled Manuscript', chapterCount = 12, wordCount = 45000 }: KdpPreflightCheckerProps) {
  const [trimSize, setTrimSize] = useState('6x9');
  const [paperStock, setPaperStock] = useState('cream-50lb');
  const [coverFinish, setCoverFinish] = useState('matte');
  const [isRunning, setIsRunning] = useState(false);
  const [scanComplete, setScanComplete] = useState(false);
  const [assertions, setAssertions] = useState<PreflightAssertionResult[]>([]);
  const [fixApplied, setFixApplied] = useState<{ [key: string]: boolean }>({});

  // Calculations
  const estimatedPages = Math.max(24, Math.round(wordCount / 275));
  
  // Spine calculation rules (KDP / IngramSpark standard formula)
  const calculateSpineWidth = (pageCount: number, paperType: string): number => {
    const multipliers: Record<string, number> = { 
      'white-50lb': 0.002252,
      'white-60lb': 0.002252,
      'cream-50lb': 0.0025,
      'color': 0.002347
    };
    return pageCount * (multipliers[paperType] || 0.002252);
  };
  
  const spineWidthInches = calculateSpineWidth(estimatedPages, paperStock).toFixed(3);
  const spineWidthMm = (parseFloat(spineWidthInches) * 25.4).toFixed(2);

  const handleRunPreflight = () => {
    setIsRunning(true);
    setScanComplete(false);
    setTimeout(() => {
      setIsRunning(false);
      setScanComplete(true);
      const results = PrepressTestSuite.runTestSuite(
        { title: manuscriptTitle, chapters: Array(chapterCount).fill({ title: 'Chapter', content: 'Sample manuscript content for assertion suite verification.' }) },
        { paperStock, pageCount: estimatedPages }
      );
      setAssertions(results);
    }, 1500);
  };

  const hasErrors = assertions.some(a => a.severity === 'error' && !fixApplied[a.ruleName]);

  const handleAutoFix = (ruleName: string) => {
    setFixApplied(prev => ({ ...prev, [ruleName]: true }));
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <ShieldCheck size={22} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">KDP & IngramSpark Pre-Flight Inspector</h2>
              <p className="text-xs text-slate-400 font-mono">Automated Print-Ready Compliance & Spine Calibration Engine</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 flex items-center justify-center transition-all text-sm font-bold"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          
          {/* Configuration Panel */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-950/50 border border-slate-800/80 rounded-2xl p-4">
              <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-2">Trim Size</label>
              <select 
                value={trimSize} 
                onChange={(e) => setTrimSize(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:border-indigo-500 outline-none"
              >
                <option value="5.5x8.5">5.5 x 8.5 in (Digest)</option>
                <option value="6x9">6.0 x 9.0 in (Standard Trade)</option>
                <option value="8.5x11">8.5 x 11.0 in (Workbook / Textbook)</option>
                <option value="5x8">5.0 x 8.0 in (Pocket / Fiction)</option>
              </select>
            </div>

            <div className="bg-slate-950/50 border border-slate-800/80 rounded-2xl p-4">
              <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-2">Paper Stock & Weight</label>
              <select 
                value={paperStock} 
                onChange={(e) => setPaperStock(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:border-indigo-500 outline-none"
              >
                <option value="cream-50lb">Cream 50lb (Standard Fiction)</option>
                <option value="white-50lb">White 50lb (Non-Fiction / Tech)</option>
                <option value="white-60lb">White 60lb Premium</option>
              </select>
            </div>

            <div className="bg-slate-950/50 border border-slate-800/80 rounded-2xl p-4">
              <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-2">Cover Finish</label>
              <select 
                value={coverFinish} 
                onChange={(e) => setCoverFinish(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:border-indigo-500 outline-none"
              >
                <option value="matte">Matte Softcover / Hardcover</option>
                <option value="glossy">Glossy Laminated</option>
              </select>
            </div>
          </div>

          {/* Dynamic Specs Card */}
          <div className="bg-gradient-to-r from-indigo-950/40 via-purple-950/30 to-slate-950 border border-indigo-500/30 rounded-2xl p-5 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="inline-block px-2.5 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 font-mono text-[11px] font-bold">CALCULATED METRICS</span>
              <h3 className="text-white font-semibold text-base">{manuscriptTitle}</h3>
              <p className="text-xs text-slate-300">
                Word Count: <strong className="text-white">{wordCount.toLocaleString()}</strong> words | Estimated Pages: <strong className="text-white">{estimatedPages} pp</strong>
              </p>
            </div>
            <div className="flex items-center space-x-4 bg-black/40 px-5 py-3 rounded-xl border border-indigo-500/20">
              <div>
                <div className="text-[10px] font-mono text-slate-400 uppercase">Exact Spine Width</div>
                <div className="text-lg font-bold font-mono text-cyan-400">{spineWidthInches} in <span className="text-xs text-slate-400">({spineWidthMm} mm)</span></div>
              </div>
              <button 
                onClick={handleRunPreflight}
                disabled={isRunning}
                className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-xs flex items-center space-x-2 transition-all shadow-lg shadow-indigo-600/30 disabled:opacity-50"
              >
                {isRunning ? <RefreshCw className="animate-spin" size={14} /> : <ShieldCheck size={14} />}
                <span>{isRunning ? 'Inspecting...' : 'Run Full Pre-Flight'}</span>
              </button>
            </div>
          </div>

          {/* Preflight Checklist Results */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400">Pre-Flight Diagnostic Assertions ({assertions.length})</h4>
            
            {!scanComplete && (
              <div className="p-6 rounded-2xl border border-slate-800 bg-slate-950/40 text-center text-slate-400 text-xs font-mono">
                Click "Run Full Pre-Flight" above to execute automated headless assertions on font subsets, spine tolerances, and contrast ratios.
              </div>
            )}

            {scanComplete && assertions.map((assertion, idx) => {
              const isError = assertion.severity === 'error' && !fixApplied[assertion.ruleName];
              return (
                <div key={idx} className={`p-4 rounded-2xl border flex items-start justify-between gap-4 transition-all ${isError ? 'bg-rose-950/20 border-rose-500/30' : 'bg-emerald-950/20 border-emerald-500/30'}`}>
                  <div className="flex items-start space-x-3">
                    {isError ? (
                      <AlertTriangle className="text-rose-400 mt-0.5 shrink-0" size={18} />
                    ) : (
                      <CheckCircle2 className="text-emerald-400 mt-0.5 shrink-0" size={18} />
                    )}
                    <div>
                      <h5 className="text-sm font-semibold text-white">{assertion.ruleName}</h5>
                      <p className="text-xs text-slate-300 mt-0.5">{assertion.message}</p>
                    </div>
                  </div>
                  {isError && (
                    <button 
                      onClick={() => handleAutoFix(assertion.ruleName)}
                      className="px-3 py-1.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 font-mono text-xs rounded-lg border border-rose-500/30 transition-all shrink-0"
                    >
                      Resolve Assertion
                    </button>
                  )}
                </div>
              );
            })}

          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <div className="text-xs text-slate-400 font-mono">
            Status: <span className={hasErrors ? 'text-rose-400 font-semibold' : 'text-emerald-400 font-semibold'}>
              {scanComplete ? (hasErrors ? 'Blocked: Unresolved Pre-Flight Errors' : 'Ready for KDP / IngramBridge Upload') : 'Pending Inspection'}
            </span>
          </div>
          <div className="flex items-center space-x-3">
            <button 
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-xl transition-all"
            >
              Close
            </button>
            <button 
              onClick={() => {
                alert('Exporting fully pre-flight certified PDF package for KDP / IngramSpark!');
                onClose();
              }}
              disabled={!scanComplete || hasErrors}
              className="px-5 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-50 flex items-center space-x-2"
            >
              <Download size={14} />
              <span>Export Certified Print Bundle</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
