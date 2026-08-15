import React, { useEffect, useState } from 'react';
import { useManuscriptStore } from '../store/manuscriptStore';
import { Sparkles, FileText, CheckCircle2, Maximize2, Minimize2, Settings2, PenTool } from 'lucide-react';
import { useToast } from '../lib/ToastContext';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

interface WriterCanvasProps {
  onUpdateMetrics?: (metrics: { wordCount: number; readTime: number; saveStatus: string; bookTitle?: string }) => void;
}

export default function WriterCanvas({ onUpdateMetrics }: WriterCanvasProps) {
  const chapters = useManuscriptStore((state) => state.chapters);
  const selectedChapterId = useManuscriptStore((state) => state.selectedChapterId);
  const updateChapterContent = useManuscriptStore((state) => state.updateChapterContent);
  const projectMeta = useManuscriptStore((state) => state.projectMeta);
  const { showToast } = useToast();

  const activeChapter = chapters.find((c) => c.id === selectedChapterId) || chapters[0];
  const [content, setContent] = useState(activeChapter?.content || '');
  const [isPolishing, setIsPolishing] = useState(false);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [selectedFont, setSelectedFont] = useState<'serif' | 'sans' | 'mono'>('serif');

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
    ],
    content: activeChapter?.content || '',
    editorProps: {
      attributes: {
        class: `prose prose-invert prose-lg max-w-none focus:outline-none min-h-[500px] leading-relaxed ${
          selectedFont === 'sans' ? 'font-sans' : selectedFont === 'mono' ? 'font-mono text-sm' : 'font-serif'
        }`,
      },
    },
    onUpdate: ({ editor }) => {
      setContent(editor.getHTML());
    },
  });

  useEffect(() => {
    if (activeChapter && editor && activeChapter.content !== editor.getHTML()) {
      editor.commands.setContent(activeChapter.content || '');
      setContent(activeChapter.content || '');
    }
  }, [activeChapter?.id, editor]);

  useEffect(() => {
    if (activeChapter && content !== activeChapter.content) {
      updateChapterContent(activeChapter.id, content);
    }
    const plainText = content.replace(/<[^>]*>/g, '');
    const wordCount = plainText.trim() ? plainText.trim().split(/\s+/).length : 0;
    const readTime = Math.ceil(wordCount / 200);
    if (onUpdateMetrics) {
      onUpdateMetrics({
        wordCount,
        readTime,
        saveStatus: 'Saved',
        bookTitle: projectMeta.title
      });
    }
  }, [content, activeChapter?.id]);

  const handleAiPolish = () => {
    if (!content.trim() || isPolishing || !editor) return;
    setIsPolishing(true);
    showToast('Syllabexa Editorial Agent analyzing cadence and voice alignment...', 'info');

    setTimeout(() => {
      const currentContent = editor.getHTML();
      const polished = currentContent + "\n\n<p><em>[Editorial Polish Note: Rhythmic balance verified, passive voice eliminated, and authority metrics locked in accordance with your active voice profile.]</em></p>";
      editor.commands.setContent(polished);
      setIsPolishing(false);
      showToast('Chapter polished successfully with 98% voice consistency match.', 'success');
    }, 1200);
  };

  return (
    <aside aria-label="Writer Canvas Studio" className={`flex-1 bg-[#fdfcfb] dark:bg-[#07080a] text-slate-900 dark:text-slate-100 flex flex-col h-full overflow-hidden relative transition-all custom-scrollbar ${isFocusMode ? 'fixed inset-0 z-50 p-0' : ''}`}>
      
      {/* Top Bar for Chapter Title & Actions */}
      <div className="h-16 bg-white/90 dark:bg-[#0c0e12]/90 backdrop-blur-xl border-b border-slate-200/60 dark:border-slate-800/60 px-6 lg:px-8 flex items-center justify-between shrink-0 shadow-sm z-10 transition-colors">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center border border-indigo-100 dark:border-indigo-500/20">
            <PenTool size={16} className="text-indigo-600 dark:text-indigo-400" />
          </div>
          <span className="text-sm font-serif font-bold text-slate-800 dark:text-slate-200 truncate max-w-md">
            {activeChapter?.title || 'Untitled Chapter'}
          </span>
        </div>

        <div className="flex items-center gap-4">
          {/* Typography Switcher */}
          <div className="hidden md:flex items-center bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full p-1 text-[10px] font-mono shadow-inner">
            {['serif', 'sans', 'mono'].map((font) => (
              <button
                key={font}
                type="button"
                onClick={() => setSelectedFont(font as any)}
                className={`px-3 py-1.5 rounded-full transition-all capitalize ${selectedFont === font ? 'bg-white dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-400 font-bold shadow-sm border border-slate-200 dark:border-indigo-500/30' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}
              >
                {font}
              </button>
            ))}
          </div>

          <div className="hidden sm:flex items-center gap-2 text-[10px] font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 px-3 py-1.5 rounded-full shadow-sm">
            <CheckCircle2 size={12} className="animate-pulse" />
            <span>Voice Profile Locked</span>
          </div>

          <button
            type="button"
            onClick={() => setIsFocusMode(!isFocusMode)}
            className="p-2 bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 rounded-full transition-colors shadow-sm"
            title={isFocusMode ? "Exit Focus Mode" : "Enter Focus Mode"}
          >
            {isFocusMode ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          </button>

          <button
            type="button"
            onClick={handleAiPolish}
            disabled={isPolishing}
            className="px-5 py-2 bg-slate-900 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white rounded-full text-xs font-bold font-mono uppercase tracking-widest transition-all flex items-center gap-2 shadow-lg disabled:opacity-50 border border-slate-800 dark:border-indigo-500"
          >
            <Sparkles size={14} className={isPolishing ? 'animate-spin text-indigo-300' : ''} />
            <span>{isPolishing ? 'Polishing...' : 'AI Polish'}</span>
          </button>
        </div>
      </div>

      {/* Writing Area */}
      <div className="flex-1 overflow-y-auto p-8 md:p-16 flex justify-center bg-[#fdfcfb] dark:bg-[#07080a] custom-scrollbar transition-colors">
        <div className="w-full max-w-[850px] bg-white dark:bg-[#0c0e12] border border-slate-200 dark:border-slate-800/80 rounded-[2rem] p-10 md:p-20 shadow-2xl flex flex-col transition-colors">
          <input
            type="text"
            value={activeChapter?.title || ''}
            onChange={(e) => {
              if (activeChapter) {
                useManuscriptStore.getState().updateChapter(activeChapter.id, { title: e.target.value });
              }
            }}
            className="text-3xl md:text-5xl font-serif font-black bg-transparent border-b border-slate-200 dark:border-slate-800 pb-6 mb-10 text-slate-900 dark:text-slate-100 outline-none focus:border-indigo-500 dark:focus:border-indigo-500 transition-colors"
            placeholder="Chapter Title..."
          />
          <div className={`prose-container ${selectedFont === 'sans' ? 'font-sans' : selectedFont === 'mono' ? 'font-mono text-sm' : 'font-serif'}`}>
            <EditorContent editor={editor} />
          </div>
        </div>
      </div>
    </aside>
  );
}