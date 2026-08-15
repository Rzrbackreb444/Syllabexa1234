import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Download, Copy, Check, Terminal, ShieldAlert } from 'lucide-react';
import { useSelfOptimizer } from '../store/useSelfOptimizer';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  copied: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
    copied: false,
  };

  public static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Syllabexa Studio Exception Captured:", error, errorInfo);
    this.setState({ errorInfo });

    // Log crash telemetry to IndexedDB via useSelfOptimizer
    useSelfOptimizer.getState().logTelemetry(
      'performance',
      `UI Crash in ${errorInfo.componentStack?.slice(0, 80) || 'Component'}: ${error.message}`
    );

    // Run self-healing routines asynchronously
    useSelfOptimizer.getState().runAutonomousOptimization();
  }

  private handleCopyError = () => {
    const errorDetails = `Error: ${this.state.error?.toString()}\n\nStack Trace:\n${this.state.errorInfo?.componentStack || 'No stack trace available'}`;
    navigator.clipboard.writeText(errorDetails);
    this.setState({ copied: true });
    setTimeout(() => this.setState({ copied: false }), 2500);
  };

  private handleDownloadLog = () => {
    const errorDetails = `=== SYLLABEXA STUDIO CRASH REPORT ===\nTimestamp: ${new Date().toISOString()}\nError: ${this.state.error?.toString()}\n\nComponent Stack:\n${this.state.errorInfo?.componentStack || 'N/A'}`;
    const blob = new Blob([errorDetails], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Syllabexa_CrashReport_${Date.now()}.txt`;
    a.click();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#07080a] flex items-center justify-center p-6 text-slate-200 font-sans select-none ambient-glow relative overflow-hidden">
          
          {/* Background Grid Accent */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e243310_1px,transparent_1px),linear-gradient(to_bottom,#1e243310_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

          <div className="max-w-xl w-full bg-[#0c0e12] border border-slate-800 rounded-3xl p-8 text-center space-y-6 shadow-2xl relative z-10">
            
            {/* Icon Header */}
            <div className="w-16 h-16 bg-rose-950/40 border border-rose-500/30 rounded-3xl flex items-center justify-center mx-auto text-rose-400 shadow-xl shadow-rose-500/10">
              <ShieldAlert size={32} />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-bold text-slate-100 font-serif tracking-wide">
                Studio Exception Encountered
              </h2>
              <p className="text-xs text-slate-400 font-mono leading-relaxed">
                {this.state.error?.message || "An unexpected rendering fault occurred in the active workspace canvas."}
              </p>
            </div>

            {/* Error Stack Trace Box */}
            {this.state.errorInfo && (
              <div className="bg-[#12151c] border border-slate-800 rounded-2xl p-4 text-left font-mono text-[10px] text-rose-300 max-h-36 overflow-y-auto space-y-1 shadow-inner">
                <div className="flex items-center gap-1.5 text-slate-500 uppercase tracking-widest font-bold mb-1">
                  <Terminal size={12} />
                  <span>Diagnostic Stack Trace</span>
                </div>
                <pre className="whitespace-pre-wrap leading-relaxed opacity-80">
                  {this.state.errorInfo.componentStack}
                </pre>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-3 pt-2">
              <button
                onClick={() => window.location.reload()}
                className="w-full flex items-center justify-center gap-2 py-3.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-mono text-xs font-black uppercase tracking-wider rounded-2xl cursor-pointer shadow-xl shadow-amber-500/20 transition-all"
              >
                <RefreshCw size={15} />
                <span>Reload Studio Session</span>
              </button>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={this.handleCopyError}
                  className="flex items-center justify-center gap-2 py-3 bg-[#12151c] hover:bg-slate-800 border border-slate-800 text-slate-300 font-mono text-xs font-bold rounded-xl cursor-pointer transition-all"
                >
                  {this.state.copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                  <span>{this.state.copied ? 'Copied Trace' : 'Copy Report'}</span>
                </button>

                <button
                  onClick={this.handleDownloadLog}
                  className="flex items-center justify-center gap-2 py-3 bg-[#12151c] hover:bg-slate-800 border border-slate-800 text-slate-300 font-mono text-xs font-bold rounded-xl cursor-pointer transition-all"
                >
                  <Download size={14} />
                  <span>Download Log</span>
                </button>
              </div>
            </div>

            <div className="text-[10px] font-mono text-slate-600">
              Syllabexa Autonomous Prepress Engine • Safe Mode Active
            </div>

          </div>
        </div>
      );
    }

    return this.props.children;
  }
}