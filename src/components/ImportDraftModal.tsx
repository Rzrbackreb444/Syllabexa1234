import React, { useState, useRef } from 'react';
import { X, Upload, CheckCircle2, Sparkles, FolderOpen } from 'lucide-react';
import { useManuscriptStore } from '../store/manuscriptStore';
import { useToast } from '../lib/ToastContext';
import { extractRichHtmlFromPdf, extractRichHtmlFromDocx, convertMarkdownToHtml, splitRichContentIntoChapters } from '../lib/fileParser';

export default function ImportDraftModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [importText, setImportText] = useState('');
  const [importTitle, setImportTitle] = useState('Imported Manuscript Chapter');
  const [isParsing, setIsParsing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const addChapter = useManuscriptStore((state) => state.addChapter);
  const { showToast } = useToast();

  if (!isOpen) return null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsParsing(true);
    showToast(`Reading and parsing rich formatting from ${file.name}...`, 'info');

    try {
      let richHtml = '';
      const ext = file.name.split('.').pop()?.toLowerCase();

      if (ext === 'pdf') {
        const buffer = await file.arrayBuffer();
        richHtml = await extractRichHtmlFromPdf(buffer);
      } else if (ext === 'docx' || ext === 'doc') {
        const buffer = await file.arrayBuffer();
        richHtml = await extractRichHtmlFromDocx(buffer);
      } else {
        const rawText = await file.text();
        richHtml = convertMarkdownToHtml(rawText);
      }

      const chapters = splitRichContentIntoChapters(richHtml, file.name.replace(/\.[^/.]+$/, ''));
      if (chapters.length > 0) {
        if (chapters.length === 1) {
          setImportTitle(chapters[0].title);
          setImportText(chapters[0].content);
        } else {
          chapters.forEach(ch => {
            addChapter({
              id: `imported-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
              title: ch.title,
              content: ch.content
            });
          });
          showToast(`Successfully imported ${chapters.length} chapters with full formatting from ${file.name}!`, 'success');
          setIsParsing(false);
          onClose();
          return;
        }
      } else {
        setImportText(richHtml);
      }

      showToast(`File successfully parsed with rich-text preservation! Ready to import.`, 'success');
    } catch (err: any) {
      console.error('File import error:', err);
      showToast(`Failed to parse file: ${err.message || 'Unknown error'}`, 'error');
    } finally {
      setIsParsing(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleImport = () => {
    if (!importText.trim()) {
      showToast('Please paste or upload manuscript content before importing.', 'error');
      return;
    }
    
    setIsParsing(true);
    showToast('Formatting manuscript rich-text into AST...', 'info');

    setTimeout(() => {
      const newId = `chap-${Date.now()}`;
      const finalHtml = importText.startsWith('<') ? importText : `<p>${importText.replace(/\n\n/g, '</p><p>').replace(/\n/g, '<br/>')}</p>`;
      addChapter({
        id: newId,
        title: importTitle.trim() || 'Imported Chapter',
        content: finalHtml,
      });

      setIsParsing(false);
      showToast('Manuscript draft successfully imported with rich formatting!', 'success');
      setImportText('');
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4 font-sans select-none animate-in fade-in">
      <div className="absolute inset-0" onClick={onClose} />
      
      <div className="w-full max-w-xl bg-[#0c0e12] border border-slate-800 rounded-3xl p-8 relative z-10 shadow-2xl ambient-glow">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-800 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Upload size={18} />
            </div>
            <div>
              <h3 className="text-xs font-mono font-bold text-slate-100 uppercase tracking-widest flex items-center gap-2">
                <span>Import Rich Manuscript & File Parser</span>
                <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 text-[10px]">Parser Pro</span>
              </h3>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 text-slate-500 hover:text-slate-200 hover:bg-slate-800 rounded-xl cursor-pointer transition-all"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body Form */}
        <div className="space-y-5">
          {/* File Upload Dropzone / Button */}
          <div>
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".pdf,.docx,.doc,.txt,.md"
              className="hidden"
            />
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-800 hover:border-amber-500/60 bg-[#12151c]/70 hover:bg-[#12151c] rounded-2xl p-6 text-center cursor-pointer transition-all group"
            >
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto mb-3 group-hover:scale-110 transition-transform">
                <FolderOpen size={20} />
              </div>
              <div className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider mb-1">
                Upload Manuscript File (DOCX, PDF, MD, TXT)
              </div>
              <div className="text-[11px] text-slate-400 font-sans">
                Preserves bold, italics, H1-H6, lists, tables, and blockquotes automatically
              </div>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-widest mb-2 font-bold">Chapter Title</label>
            <input 
              type="text" 
              value={importTitle} 
              onChange={(e) => setImportTitle(e.target.value)}
              className="w-full bg-[#12151c] border border-slate-800 rounded-2xl px-4 py-3 text-xs text-slate-200 font-sans focus:outline-none focus:border-amber-500 transition-all shadow-inner"
            />
          </div>

          <div>
            <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-widest mb-2 font-bold">Or Paste Rich Content / HTML / Markdown</label>
            <textarea 
              rows={6}
              placeholder="Paste your chapter content or HTML/Markdown here..."
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              className="w-full bg-[#12151c] border border-slate-800 rounded-2xl p-4 text-xs text-slate-300 font-serif resize-none focus:outline-none focus:border-amber-500 transition-all shadow-inner leading-relaxed custom-scrollbar"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <button 
              onClick={onClose} 
              className="px-5 py-3 rounded-xl border border-slate-800 text-slate-400 font-mono text-xs font-bold hover:bg-slate-800 hover:text-slate-200 cursor-pointer transition-all"
            >
              Cancel
            </button>
            <button 
              onClick={handleImport} 
              disabled={isParsing}
              className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-mono text-xs font-black uppercase tracking-wider cursor-pointer shadow-xl shadow-amber-500/20 transition-all flex items-center gap-2"
            >
              {isParsing ? <Sparkles size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
              <span>{isParsing ? 'Parsing Rich AST...' : 'Import to Studio'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}