import React, { useState } from 'react';
import { Download, CheckCircle2, Loader2, X, Archive, FileText, Music, LayoutGrid, Zap } from 'lucide-react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { useManuscriptStore } from '../store/manuscriptStore';
import { useVoiceStore } from '../store/voiceStore';
import { usePuzzleStore } from '../store/puzzleStore';

export default function DistributionLocker({ onClose }: { onClose: () => void }) {
  const { projectMeta, chapters } = useManuscriptStore();
  const { profiles, activeProfileId } = useVoiceStore();
  const activeProfile = profiles.find(p => p.id === activeProfileId);
  const { wordSearch, crossword } = usePuzzleStore();
  const [isCompiling, setIsCompiling] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  const handleCompile = async () => {
    setIsCompiling(true);
    setProgress(10);
    const zip = new JSZip();
    
    // Add Manuscript
    setProgress(30);
    const manuscriptText = chapters.map(c => `# ${c.title}\n\n${c.content}`).join('\n\n');
    zip.file("manuscript.txt", manuscriptText);
    zip.file("manuscript.md", manuscriptText);
    
    // Add EPUB (mock binary or simple text)
    setProgress(50);
    zip.file("manuscript.epub", "EPUB DATA PLACEHOLDER");
    
    // Add PDF
    setProgress(70);
    zip.file("print_ready_cmyk.pdf", "PDF DATA PLACEHOLDER");
    
    // Add Audio (Mock)
    setProgress(80);
    zip.file("audio/chapter_1.mp3", "AUDIO DATA PLACEHOLDER");
    
    // Add Meta
    setProgress(85);
    zip.file("metadata/voice_profile.json", JSON.stringify(activeProfile || {}, null, 2));
    
    // Add Puzzles
    setProgress(90);
    if (wordSearch.grid && wordSearch.grid.length > 0) {
      const wsText = `Theme: ${wordSearch.theme}\nWords: ${wordSearch.words.join(', ')}\n\n` + 
                     wordSearch.grid.map(row => row.join(' ')).join('\n');
      zip.file("puzzles/word_search.txt", wsText);
    }
    if (crossword.entries && crossword.entries.length > 0) {
      const cwText = crossword.entries.map(e => `${e.word}: ${e.clue}`).join('\n');
      zip.file("puzzles/crossword_clues.txt", cwText);
    }

    // Generate ZIP
    const content = await zip.generateAsync({ type: 'blob' });
    setProgress(100);
    
    saveAs(content, `${projectMeta.title ? projectMeta.title.toLowerCase().replace(/\s+/g, '_') : 'syllabexa_book'}_export.zip`);
    
    setIsCompiling(false);
    setIsComplete(true);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4 font-sans">
      <div className="absolute inset-0" onClick={() => !isCompiling && onClose()} />
      <div className="w-full max-w-2xl bg-[#0c0e12] border border-amber-900/30 rounded-3xl p-8 relative z-10 shadow-2xl">
        <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-4">
          <h3 className="text-xl font-bold text-slate-200 flex items-center gap-2 font-serif">
            <Archive className="w-5 h-5 text-amber-500" /><span>Distribution Locker</span>
          </h3>
          <button onClick={onClose} disabled={isCompiling} className="text-slate-500 hover:text-slate-300 focus:outline-none disabled:opacity-50">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-8">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Included Assets</h4>
              <ul className="space-y-3">
                <li className="flex items-center gap-3 text-sm text-slate-300 bg-[#12151c] p-3 rounded-lg border border-slate-800">
                  <FileText className="w-4 h-4 text-emerald-400" /> Print-Ready CMYK PDF
                </li>
                <li className="flex items-center gap-3 text-sm text-slate-300 bg-[#12151c] p-3 rounded-lg border border-slate-800">
                  <LayoutGrid className="w-4 h-4 text-emerald-400" /> Reflowable EPUB
                </li>
                <li className="flex items-center gap-3 text-sm text-slate-300 bg-[#12151c] p-3 rounded-lg border border-slate-800">
                  <Music className="w-4 h-4 text-indigo-400" /> Neural Audio Masters
                </li>
                <li className="flex items-center gap-3 text-sm text-slate-300 bg-[#12151c] p-3 rounded-lg border border-slate-800">
                  <Zap className="w-4 h-4 text-amber-400" /> Word Search Appendix
                </li>
              </ul>
            </div>
            
            <div className="bg-[#12151c] border border-slate-800 rounded-xl p-6 flex flex-col justify-center items-center text-center space-y-4">
              <div className="w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center mb-2">
                <Download className="w-8 h-8 text-amber-500" />
              </div>
              <h4 className="text-lg font-bold text-slate-200">Compile Unified Export</h4>
              <p className="text-xs text-slate-400">Bundle your manuscript, formatting, and multimedia assets into a single distributable ZIP archive.</p>
              
              {isCompiling ? (
                <div className="w-full space-y-2 mt-4">
                  <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-500 transition-all duration-300" style={{ width: `${progress}%` }} />
                  </div>
                  <div className="text-xs text-amber-500 font-mono text-center font-bold animate-pulse">COMPILING... {progress}%</div>
                </div>
              ) : isComplete ? (
                <div className="w-full mt-4 flex items-center justify-center gap-2 text-emerald-400 font-bold bg-emerald-950/30 py-3 rounded-lg border border-emerald-900/50">
                  <CheckCircle2 className="w-5 h-5" /> Download Complete
                </div>
              ) : (
                <button
                  onClick={handleCompile}
                  className="w-full mt-4 bg-amber-600 hover:bg-amber-500 text-white font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-lg shadow-amber-900/20"
                >
                  <Archive className="w-4 h-4" /> Download Zip
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
