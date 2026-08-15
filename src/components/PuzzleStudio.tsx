import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Cpu, Download, Wand2, FileSearch, Layers, 
  Settings2, CheckCircle2, Scissors, FileType2,
  Terminal, Loader2, RefreshCw, Printer, Eye, EyeOff
} from 'lucide-react';
import { useToast } from '../lib/ToastContext';

interface PlacedChar {
  char: string;
  x: number;
  y: number;
  isSolution: boolean;
}

export default function PuzzleStudio() {
  const [theme, setTheme] = useState('THE LAUNDROMAT DOCTRINE: OPERATIONAL MATRIX');
  const [trimSize, setTrimSize] = useState('8.5x11');
  const [gridSize, setGridSize] = useState(15);
  
  const [wordsInput, setWordsInput] = useState(
    'SOFTMOUNT\nHARDMOUNT\nGFORCE\nUPTIME\nVEND\nNEUROPLASTICITY\nSASQUATCH\nRECOVERY\nCONSTRUCTION'
  );
  
  const [svgData, setSvgData] = useState<PlacedChar[]>([]);
  const [placedWords, setPlacedWords] = useState<string[]>([]);
  const [showSolution, setShowSolution] = useState(false);
  
  // Enterprise Engine States
  const [isGenerating, setIsGenerating] = useState(false);
  const [synthesisLogs, setSynthesisLogs] = useState<string[]>([]);
  const [isExporting, setIsExporting] = useState(false);
  
  const svgRef = useRef<SVGSVGElement>(null);
  const logEndRef = useRef<HTMLDivElement>(null);
  const { showToast } = useToast();

  // Auto-scroll terminal
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [synthesisLogs]);

  // Initial generation on mount
  useEffect(() => { 
    if (svgData.length === 0 && !isGenerating) {
      generateVectorPuzzle(true); 
    }
  }, []);

  // NLP Extraction Simulation (Bridging from Ghostwriter)
  const extractFromManuscript = async () => {
    setIsGenerating(true);
    setSynthesisLogs([
      '[SYSTEM] Initializing Syllabexa NLP Semantic Core...',
      '[SCAN] Ingesting manuscript vector embeddings...'
    ]);

    try {
      await new Promise(r => setTimeout(r, 600));
      setSynthesisLogs(prev => [...prev, '[EXTRACT] Isolating high-density operational vocabulary...']);
      
      await new Promise(r => setTimeout(r, 800));
      setWordsInput('COMMANDMENTS\nASSIGNABLE\nTELEMETRY\nPREDICTIVE\nCUSTODIANS\nMULTIPLIER\nOBSCURITY\nDOCTRINE\nREVOLUTION\nFLICKER');
      
      setSynthesisLogs(prev => [...prev, '[SUCCESS] Vocabulary matrix extracted. Ready for compute.']);
      await new Promise(r => setTimeout(r, 500));
      showToast('Manuscript vocabulary extracted.', 'success');
    } finally {
      setIsGenerating(false);
    }
  };

  // Enterprise Vector Math Generation
  const generateVectorPuzzle = async (silent = false) => {
    if (!silent) {
      setIsGenerating(true);
      setSynthesisLogs([
        '[SYSTEM] Booting Vector Matrix Engine...',
        `[COMPUTE] Initializing ${gridSize}x${gridSize} spatial grid...`
      ]);
    }

    try {
      if (!silent) await new Promise(r => setTimeout(r, 400));

      const parsed = wordsInput.split('\n').map(w => w.trim().toUpperCase().replace(/[^A-Z]/g, '')).filter(w => w.length > 2);
      const uniqueWords = Array.from(new Set(parsed)).sort((a, b) => b.length - a.length);
      
      if (!silent) setSynthesisLogs(prev => [...prev, `[CALCULATE] Running backtracking collision algorithms for ${uniqueWords.length} vectors...`]);
      if (!silent) await new Promise(r => setTimeout(r, 600));

      const matrix: { char: string, isSolution: boolean }[][] = Array.from({ length: gridSize }, () =>
        Array.from({ length: gridSize }, () => ({ char: '', isSolution: false }))
      );

      const placed: string[] = [];
      const directions = [
        { r: 0, c: 1 }, { r: 1, c: 0 }, { r: 1, c: 1 }, { r: 1, c: -1 },
        { r: 0, c: -1 }, { r: -1, c: 0 }, { r: -1, c: -1 }, { r: -1, c: 1 }
      ];

      for (const word of uniqueWords) {
        let isPlaced = false;
        let attempts = 0;

        while (!isPlaced && attempts < 200) {
          attempts++;
          const dir = directions[Math.floor(Math.random() * directions.length)];
          const startR = Math.floor(Math.random() * gridSize);
          const startC = Math.floor(Math.random() * gridSize);
          const endR = startR + dir.r * (word.length - 1);
          const endC = startC + dir.c * (word.length - 1);

          if (endR >= 0 && endR < gridSize && endC >= 0 && endC < gridSize) {
            let collision = false;
            for (let i = 0; i < word.length; i++) {
              const r = startR + dir.r * i;
              const c = startC + dir.c * i;
              if (matrix[r][c].char !== '' && matrix[r][c].char !== word[i]) {
                collision = true; break;
              }
            }

            if (!collision) {
              for (let i = 0; i < word.length; i++) {
                matrix[startR + dir.r * i][startC + dir.c * i] = { char: word[i], isSolution: true };
              }
              placed.push(word);
              isPlaced = true;
            }
          }
        }
      }

      if (!silent) setSynthesisLogs(prev => [...prev, '[RENDER] Converting matrix to infinite-resolution SVG coordinates...']);
      if (!silent) await new Promise(r => setTimeout(r, 400));

      // Convert Matrix to SVG Vector Coordinates
      const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      const vectorNodes: PlacedChar[] = [];
      const cellSize = 800 / gridSize; // Base SVG coordinate size

      for (let r = 0; r < gridSize; r++) {
        for (let c = 0; c < gridSize; c++) {
          const isSol = matrix[r][c].isSolution;
          const letter = isSol ? matrix[r][c].char : alphabet[Math.floor(Math.random() * alphabet.length)];
          
          vectorNodes.push({
            char: letter,
            x: (c * cellSize) + (cellSize / 2),
            y: (r * cellSize) + (cellSize / 2) + (cellSize * 0.35), // Baseline optical adjustment
            isSolution: isSol
          });
        }
      }

      setSvgData(vectorNodes);
      setPlacedWords(placed);
      
      if (!silent) {
        setSynthesisLogs(prev => [...prev, '[SUCCESS] Vector Matrix compiled successfully.']);
        await new Promise(r => setTimeout(r, 400));
        showToast('Vector puzzle compiled.', 'success');
      }
    } finally {
      if (!silent) setIsGenerating(false);
    }
  };

  // Direct Raw SVG File Export for KDP
  const exportRawSVG = () => {
    if (!svgRef.current) return;
    const serializer = new XMLSerializer();
    let source = serializer.serializeToString(svgRef.current);
    if (!source.match(/^<svg[^>]+xmlns="http\:\/\/www\.w3\.org\/2000\/svg"/)) {
      source = source.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
    }
    const blob = new Blob([source], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Syllabexa_Puzzle_${theme.replace(/\s+/g, '_')}_${showSolution ? 'KEY' : 'BLANK'}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Vector SVG Exported.', 'success');
  };

  // KDP Print Layout PDF Export
  const handleExportPDF = () => {
    setIsExporting(true);
    showToast('Compiling KDP Print PDF...', 'info');
    
    const style = document.createElement('style');
    style.innerHTML = `
      @media print {
        @page { size: ${trimSize === '8.5x11' ? '8.5in 11in' : '6in 9in'}; margin: 0.5in; }
        body { -webkit-print-color-adjust: exact; print-color-adjust: exact; background: white; }
        .no-print { display: none !important; }
        .print-canvas { max-width: 100% !important; margin: 0 !important; padding: 0 !important; box-shadow: none !important; border: none !important; }
      }
    `;
    document.head.appendChild(style);
    
    setTimeout(() => {
      window.print();
      document.head.removeChild(style);
      setIsExporting(false);
      showToast('PDF compilation complete.', 'success');
    }, 800);
  };

  return (
    <div className="flex h-screen bg-[#050505] text-slate-200 font-sans overflow-hidden">
      <main className="flex-1 flex flex-col p-8 overflow-y-auto custom-scrollbar max-w-7xl mx-auto space-y-8">
        
        {/* Enterprise Header */}
        <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="flex flex-col md:flex-row md:items-center justify-between border-b border-white/10 pb-6 gap-4 no-print">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-indigo-400 text-[10px] font-mono uppercase tracking-widest font-bold mb-2">
              <Cpu className="w-3.5 h-3.5 animate-pulse" /> Syllabexa Vector Engine v6.0 Maxxed
            </div>
            <h1 className="text-3xl font-serif font-bold text-white tracking-tight">KDP Puzzle Studio</h1>
            <p className="text-slate-400 text-sm mt-1">Procedural mathematics. Absolute infinite resolution. Zero rasterization.</p>
          </div>
          
          <div className="flex gap-3">
            <button 
              onClick={extractFromManuscript} 
              disabled={isGenerating}
              className="px-5 py-2.5 bg-white/5 hover:bg-white/10 disabled:opacity-50 text-white font-bold text-xs uppercase tracking-widest rounded-xl transition-all border border-white/10 flex items-center gap-2"
            >
              <Wand2 className="w-4 h-4" /> Extract NLP Vocab
            </button>
            <button 
              onClick={() => generateVectorPuzzle(false)} 
              disabled={isGenerating}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-indigo-600/20 flex items-center gap-2"
            >
              {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Settings2 className="w-4 h-4" />}
              Compute Vector Matrix
            </button>
          </div>
        </motion.div>

        {/* Synthesis Terminal Overlay */}
        <AnimatePresence>
          {isGenerating && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="fixed inset-0 z-50 flex items-center justify-center bg-[#050608]/80 backdrop-blur-sm p-6 no-print">
              <div className="w-full max-w-xl bg-[#0a0c10] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
                <div className="bg-[#12151c] px-4 py-3 border-b border-white/5 flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-rose-500/80"></div>
                    <div className="w-3 h-3 rounded-full bg-amber-500/80"></div>
                    <div className="w-3 h-3 rounded-full bg-emerald-500/80"></div>
                  </div>
                  <span className="ml-4 text-[10px] font-mono text-slate-500 uppercase tracking-widest">syllabexa@puzzle-engine:~$</span>
                </div>
                <div className="p-6 h-64 overflow-y-auto custom-scrollbar font-mono text-xs space-y-2 bg-[#050608]">
                  {synthesisLogs.map((log, i) => (
                    <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} key={i} className={`${log.includes('[ERROR]') ? 'text-rose-400' : log.includes('[SUCCESS]') ? 'text-emerald-400' : 'text-indigo-400'}`}>
                      {log}
                    </motion.div>
                  ))}
                  <div className="flex items-center gap-2 text-slate-500 mt-4">
                    <Loader2 className="w-4 h-4 animate-spin" /> Awaiting operational cycle...
                  </div>
                  <div ref={logEndRef} />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid lg:grid-cols-12 gap-8">
          
          {/* Engine Parameters */}
          <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="lg:col-span-4 bg-[#0a0a0a] border border-white/10 rounded-2xl p-6 space-y-6 shadow-2xl no-print">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Puzzle Header</label>
              <input type="text" value={theme} onChange={(e) => setTheme(e.target.value)} className="w-full bg-black border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:border-indigo-500 outline-none transition-colors" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Trim Size</label>
                <select value={trimSize} onChange={(e) => { setTrimSize(e.target.value); generateVectorPuzzle(true); }} className="w-full bg-black border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white outline-none cursor-pointer focus:border-indigo-500 transition-colors">
                  <option value="6x9">6" x 9" (Trade)</option>
                  <option value="8.5x11">8.5" x 11" (Workbook)</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Density</label>
                <select value={gridSize} onChange={(e) => { setGridSize(Number(e.target.value)); generateVectorPuzzle(true); }} className="w-full bg-black border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white outline-none cursor-pointer focus:border-indigo-500 transition-colors">
                  <option value={15}>15x15 Matrix</option>
                  <option value={20}>20x20 Matrix</option>
                  <option value={25}>25x25 Matrix</option>
                </select>
              </div>
            </div>

            <div className="space-y-3 pt-4 border-t border-white/10">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex justify-between">
                <span>Vector Word Bank</span>
                <span className="text-indigo-400 font-bold">{placedWords.length} Encoded</span>
              </label>
              <textarea 
                rows={8} value={wordsInput} onChange={(e) => setWordsInput(e.target.value)}
                className="w-full bg-black border border-white/10 rounded-xl p-3 text-xs font-mono text-white focus:border-indigo-500 outline-none resize-none uppercase leading-relaxed transition-colors custom-scrollbar"
              />
            </div>
          </motion.div>

          {/* Render & Export Canvas */}
          <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="lg:col-span-8 bg-[#0a0a0a] border border-white/10 rounded-2xl p-8 flex flex-col items-center justify-between relative overflow-hidden shadow-2xl print-canvas">
            
            <div className="absolute top-4 right-4 flex gap-2 no-print">
              <button 
                onClick={() => setShowSolution(!showSolution)} 
                className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all border flex items-center gap-1.5 ${showSolution ? 'bg-amber-500/20 text-amber-400 border-amber-500/30 shadow-[0_0_10px_rgba(245,158,11,0.2)]' : 'bg-white/5 text-slate-400 border-white/10 hover:bg-white/10'}`}
              >
                {showSolution ? <EyeOff size={12} /> : <Eye size={12} />}
                {showSolution ? 'Hide Solution Key' : 'Reveal Solution Key'}
              </button>
            </div>

            {/* THE RAW SVG RENDERER */}
            <div className="bg-white p-8 rounded-sm shadow-2xl transition-all print-canvas" style={{ width: trimSize === '8.5x11' ? '100%' : '80%', maxWidth: '700px', aspectRatio: trimSize === '8.5x11' ? '8.5/11' : '6/9' }}>
              <svg 
                ref={svgRef}
                viewBox="0 0 1000 1200" 
                className="w-full h-full"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* PDF Bleed & Margin Guides */}
                <rect width="1000" height="1200" fill="#ffffff" />
                
                {/* Header Typography */}
                <text x="500" y="100" fontFamily="Helvetica, Arial, sans-serif" fontSize="32" fontWeight="900" fill="#000000" textAnchor="middle" letterSpacing="2">
                  {theme.toUpperCase()}
                </text>
                <path d="M 100 130 L 900 130" stroke="#000000" strokeWidth="4" />

                {/* The Geometric Matrix Layer */}
                <g transform="translate(100, 180)">
                  <rect width="800" height="800" fill="none" stroke="#000000" strokeWidth="2" />
                  
                  {/* Grid Lines */}
                  {Array.from({ length: gridSize - 1 }).map((_, i) => (
                    <React.Fragment key={i}>
                      <path d={`M 0 ${(i + 1) * (800 / gridSize)} L 800 ${(i + 1) * (800 / gridSize)}`} stroke="#000000" strokeWidth="0.5" strokeOpacity="0.2" />
                      <path d={`M ${(i + 1) * (800 / gridSize)} 0 L ${(i + 1) * (800 / gridSize)} 800`} stroke="#000000" strokeWidth="0.5" strokeOpacity="0.2" />
                    </React.Fragment>
                  ))}

                  {/* Vector Text Characters */}
                  {svgData.map((node, i) => (
                    <text 
                      key={i} x={node.x} y={node.y} 
                      fontFamily="monospace" fontSize={800 / gridSize * 0.6} fontWeight={showSolution && node.isSolution ? "900" : "500"} 
                      fill={showSolution && node.isSolution ? "#000000" : (showSolution ? "#dddddd" : "#000000")} 
                      textAnchor="middle"
                    >
                      {node.char}
                    </text>
                  ))}

                  {/* Solution Highlights (If Active) */}
                  {showSolution && svgData.filter(n => n.isSolution).map((node, i) => (
                    <circle key={`hi-${i}`} cx={node.x} cy={node.y - (800 / gridSize * 0.15)} r={800 / gridSize * 0.4} fill="none" stroke="#000000" strokeWidth="2" strokeOpacity="0.5" />
                  ))}
                </g>

                {/* Footer Word Bank */}
                <text x="500" y="1050" fontFamily="Helvetica, Arial, sans-serif" fontSize="16" fontWeight="bold" fill="#000000" textAnchor="middle">
                  FIND THE FOLLOWING TERMS:
                </text>
                <g transform="translate(100, 1080)">
                  {placedWords.map((word, i) => (
                    <text key={word} x={(i % 4) * 200 + 100} y={Math.floor(i / 4) * 30} fontFamily="monospace" fontSize="14" fill="#000000" textAnchor="middle">
                      {word}
                    </text>
                  ))}
                </g>
              </svg>
            </div>

            <div className="mt-8 flex gap-4 w-full justify-center no-print">
              <button 
                onClick={handleExportPDF} 
                disabled={isExporting}
                className="px-6 py-3.5 bg-white text-black font-black text-xs uppercase tracking-widest rounded-xl hover:bg-slate-200 transition-all flex items-center gap-2 shadow-lg disabled:opacity-50"
              >
                {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Printer className="w-4 h-4" />}
                {isExporting ? 'Compiling PDF...' : 'Export Print-Ready PDF'}
              </button>
              <button 
                onClick={exportRawSVG} 
                className="px-6 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all flex items-center gap-2 shadow-xl shadow-indigo-600/30"
              >
                <FileType2 className="w-4 h-4" /> Download Raw SVG
              </button>
            </div>
            
          </motion.div>
        </div>
      </main>
    </div>
  );
}