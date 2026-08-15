import React, { useEffect, useState, useRef } from 'react';
import { NodeViewWrapper } from '@tiptap/react';
import mermaid from 'mermaid';
import { GitFork, Edit, Check, Settings, Info } from 'lucide-react';

// Initialize mermaid for premium dark theme matching our obsidian layout
// Note: We use the base theme with a high-contrast grayscale setup to ensure
// legibility when users print directly from the editor view, maintaining
// a strict minimum font size.
mermaid.initialize({
  startOnLoad: false,
  theme: 'base',
  themeVariables: {
    primaryColor: '#ffffff',
    primaryTextColor: '#111111',
    primaryBorderColor: '#333333',
    lineColor: '#333333',
    secondaryColor: '#f8f9fa',
    tertiaryColor: '#ffffff',
    nodeBorder: '#333333',
    mainBkg: '#ffffff',
    actorBorder: '#111111',
    actorBkg: '#ffffff',
    signalColor: '#111111',
    fontSize: '12px',
    fontFamily: 'monospace',
  },
  securityLevel: 'loose',
});

export default function MermaidNodeView({ node, updateAttributes }: any) {
  const [isEditing, setIsEditing] = useState(false);
  const [code, setCode] = useState(node.attrs.code || 'graph TD\n  A[Start Audit] --> B(Verify Meter)\n  B --> C{Water Ratio OK?}\n  C -- Yes --> D[Proceed to LOI]\n  C -- No --> E[Reprogram Controller]');
  const [svg, setSvg] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const containerId = useRef(`mermaid-viewer-${Math.floor(Math.random() * 1000000)}`);

  const compileDiagram = async (currentCode: string) => {
    if (!currentCode.trim()) return;
    try {
      setError(null);
      // Clean previous rendering to avoid cache collisions
      const element = document.getElementById(containerId.current);
      if (element) {
        element.innerHTML = '';
      }
      
      const { svg: renderedSvg } = await mermaid.render(containerId.current + '-svg', currentCode);
      setSvg(renderedSvg);
      updateAttributes({ code: currentCode });
    } catch (err: any) {
      console.warn("Mermaid parsing error (expected during active typing):", err);
      setError(err?.message || 'Mermaid.js Syntax Error');
    }
  };

  useEffect(() => {
    compileDiagram(code);
  }, [code]);

  const insertPreset = (presetCode: string) => {
    setCode(presetCode);
    setIsEditing(false);
  };

  const presets = [
    {
      name: "Larry Larsen Framework",
      code: `graph TD
  A[Meter Base Audit] --> B(Verify Municipal Sewer Ratio)
  B --> C{Within 22% Target?}
  C -- Yes --> D[Execute Binding LOI]
  C -- No --> E[Reprogram Controller Depth]
  E --> F[Reduce Deep Rinses 1.5"]
  F --> B`
    },
    {
      name: "Asset Intake Pipeline",
      code: `graph LR
  A[Identify Site] --> B[Utility Invoice Scan]
  B --> C[Extract Flow Rate]
  C --> D[DPI Validation Check]
  D --> E[Final Underwrite]`
    }
  ];

  return (
    <NodeViewWrapper className="mermaid-node-wrapper my-6 relative select-none">
      <div className="border border-slate-800 rounded-2xl bg-[#0a0c12]/85 backdrop-blur-md overflow-hidden shadow-2xl">
        
        {/* Top Control Header */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900/60 border-b border-slate-800/80">
          <div className="flex items-center gap-2">
            <GitFork size={14} className="text-amber-400" />
            <span className="text-[10px] font-mono uppercase tracking-widest font-black text-slate-300">Syllabexa Flowchart Node</span>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[9px] font-mono uppercase font-bold transition-all cursor-pointer ${isEditing ? 'bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/20' : 'bg-[#12151c] hover:bg-slate-800 text-slate-300 border border-slate-800'}`}
            >
              {isEditing ? <Check size={10} /> : <Edit size={10} />}
              <span>{isEditing ? 'Render' : 'Edit Code'}</span>
            </button>
          </div>
        </div>

        {/* Edit Panel */}
        {isEditing && (
          <div className="p-4 bg-slate-950/90 border-b border-slate-800/80">
            <div className="mb-2.5 flex flex-wrap gap-2 items-center">
              <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider">Presets:</span>
              {presets.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => insertPreset(p.code)}
                  className="px-2 py-0.5 bg-slate-900 hover:bg-amber-950/40 text-slate-400 hover:text-amber-300 border border-slate-800 rounded text-[9px] font-mono transition-colors cursor-pointer"
                >
                  {p.name}
                </button>
              ))}
            </div>
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full h-40 p-3 bg-slate-900 border border-slate-800 rounded-xl font-mono text-[10px] text-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-500 resize-none leading-relaxed shadow-inner custom-scrollbar"
              placeholder="Enter Mermaid.js code..."
            />
            {error && (
              <div className="mt-2 p-2 bg-red-950/30 border border-red-900/40 text-red-400 text-[9px] font-mono rounded-lg flex items-center gap-1.5">
                <Info size={10} />
                <span>{error}</span>
              </div>
            )}
          </div>
        )}

        {/* SVG Diagram Canvas Display */}
        <div className="p-6 flex items-center justify-center bg-slate-950/25 relative min-h-32">
          {svg ? (
            <div 
              className="w-full h-full flex items-center justify-center transition-opacity duration-300"
              dangerouslySetInnerHTML={{ __html: svg }} 
            />
          ) : (
            <div className="text-slate-600 text-[10px] font-mono flex items-center gap-1.5 animate-pulse">
              <Settings size={12} className="animate-spin text-amber-500" />
              <span>Initializing Diagram...</span>
            </div>
          )}
          {/* Secret background compiler div */}
          <div id={containerId.current} className="hidden" />
        </div>
      </div>
    </NodeViewWrapper>
  );
}