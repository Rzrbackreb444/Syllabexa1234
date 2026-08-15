import React, { useState, useEffect } from 'react';
import { Book, FileText, Plus, GripVertical, Settings2, Search, Sparkles, Folder, Shield, Quote, List, BookOpen, Heart, MessageSquare, ChevronDown, ChevronRight, Layers } from 'lucide-react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { useManuscriptStore } from '../store/manuscriptStore';
import { useToast } from '../lib/ToastContext';
import { motion, AnimatePresence } from 'motion/react';
import Tooltip from './Tooltip';
import WritingGoals from './WritingGoals';
import PomodoroFocusTimer from './PomodoroFocusTimer';

const renderFmIcon = (type: string, active: boolean) => {
  const props = { size: 14, className: `shrink-0 ${active ? 'text-amber-400' : 'text-slate-500 group-hover:text-amber-500/70'}` };
  switch (type) {
    case 'title-page': return <BookOpen {...props} />;
    case 'copyright': return <Shield {...props} />;
    case 'dedication': return <Heart {...props} />;
    case 'epigraph': return <Quote {...props} />;
    case 'toc': return <List {...props} />;
    case 'acknowledgments': return <MessageSquare {...props} />;
    default: return <FileText {...props} />;
  }
};

export default function ManuscriptSidebar() {
  const chapters = useManuscriptStore((state) => state.chapters);
  const selectedChapterId = useManuscriptStore((state) => state.selectedChapterId);
  const setSelectedChapterId = useManuscriptStore((state) => state.setSelectedChapterId);
  const addChapter = useManuscriptStore((state) => state.addChapter);
  const addPart = useManuscriptStore((state) => state.addPart);
  const parts = useManuscriptStore((state) => state.parts);
  const reorderChapters = useManuscriptStore((state) => state.reorderChapters);
  const frontmatter = useManuscriptStore((state) => state.frontmatter);
  const initializeMissingFrontmatter = useManuscriptStore((state) => state.initializeMissingFrontmatter);
  const backmatter = useManuscriptStore((state) => state.backmatter);
  const projectMeta = useManuscriptStore((state) => state.projectMeta);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [openFrontMatter, setOpenFrontMatter] = useState(true);
  const [openChapters, setOpenChapters] = useState(true);
  const [openBackMatter, setOpenBackMatter] = useState(true);

  useEffect(() => {
    initializeMissingFrontmatter();
  }, []);
  const { showToast } = useToast();

  const handleAddChapter = () => {
    const newId = `chap-${Date.now()}`;
    const newChapterNum = chapters.length + 1;
    addChapter({
      id: newId,
      title: `Chapter ${newChapterNum}: Untitled`,
      content: '',
      orderIndex: chapters.length,
    });
    setSelectedChapterId(newId);
    showToast(`Created Chapter ${newChapterNum}`, 'success');
  };

  const handleAddPart = () => {
    const newId = `part-${Date.now()}`;
    const newPartNum = chapters.filter(c => c.isPartHeader).length + 1;
    addChapter({
      id: newId,
      title: `Part ${newPartNum}: Untitled`,
      content: '',
      orderIndex: chapters.length,
      isPartHeader: true,
    });
    setSelectedChapterId(newId);
    showToast(`Created Part ${newPartNum}`, 'success');
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    if (result.destination.index === result.source.index) return;
    
    reorderChapters(result.source.index, result.destination.index);
    showToast('Manuscript chapters reordered', 'info');
  };

  const filteredChapters = chapters.filter(c => c.title.toLowerCase().includes(searchQuery.toLowerCase()));

  const totalWords = chapters.reduce((acc, c) => {
    if (!c.content) return acc;
    const plain = c.content.replace(/<[^>]*>/g, '');
    return acc + (plain.trim() ? plain.trim().split(/\s+/).length : 0);
  }, 0);

  return (
    <aside aria-label="Manuscript Sidebar" className="w-80 bg-[#0c0e12] border-r border-slate-800/80 flex flex-col h-full select-none font-sans relative z-0">
      
      {/* Project Header */}
      <div className="p-5 border-b border-slate-800/80 bg-[#08090c] shadow-lg">
        <div className="flex items-start justify-between">
          <div className="min-w-0">
            <h2 className="text-xs font-mono font-bold text-slate-100 uppercase tracking-widest truncate">
              {projectMeta.title || 'Untitled Draft'}
            </h2>
            <p className="text-[11px] font-mono text-slate-100 font-medium mt-1 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
              <span className="truncate">{totalWords.toLocaleString()} words • {chapters.length} chapters</span>
            </p>
          </div>
          <Tooltip content="Project Settings" position="left">
            <button 
              onClick={() => showToast('Project metadata configuration accessed', 'info')}
              className="p-1.5 text-slate-500 hover:text-amber-400 hover:bg-slate-800 rounded-xl transition-all cursor-pointer shrink-0"
            >
              <Settings2 size={16} />
            </button>
          </Tooltip>
        </div>

        {/* Chapter Search Filter */}
        {chapters.length > 3 && (
          <div className="mt-4 relative">
            <Search size={13} className="absolute left-3.5 top-3 text-slate-500" />
            <input
              type="text"
              placeholder="Filter chapters..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#12151c] border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs font-mono text-slate-200 outline-none focus:border-amber-500 shadow-inner transition-all"
            />
          </div>
        )}
      </div>

      {/* Chapter List Navigation (Drag and Drop Enabled) */}
      <div className="flex-1 overflow-y-auto p-3 space-y-4 custom-scrollbar">
        <PomodoroFocusTimer />
        <WritingGoals />

        <div>
          <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest font-bold mb-2 px-2 flex items-center justify-between">
            <span className="flex items-center gap-1.5"><Book size={12} className="text-amber-400" /> Manuscript Stack</span>
            <span className="text-[9px] text-slate-600 font-mono">Drag to Reorder</span>
          </div>

        {/* Front Matter (Non-draggable) */}
        <div className="space-y-1">
          <button 
            onClick={() => setOpenFrontMatter(!openFrontMatter)}
            className="w-full flex items-center justify-between px-2 py-1.5 text-[10px] font-mono text-slate-400 uppercase tracking-widest font-bold hover:text-slate-200 transition-colors rounded-lg hover:bg-slate-900/60 cursor-pointer"
          >
            <span className="flex items-center gap-1.5">
              <BookOpen size={13} className="text-amber-400" /> Front Matter ({frontmatter.length})
            </span>
            {openFrontMatter ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
          </button>

          <AnimatePresence initial={false}>
            {openFrontMatter && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2, ease: 'easeInOut' }}
                className="overflow-hidden space-y-1.5 pl-2 pt-1"
              >
                {frontmatter.map((fm) => {
                  const isActive = selectedChapterId === fm.id;
                  return (
                  <div 
                    key={fm.id}
                    onClick={() => setSelectedChapterId(fm.id)}
                    className={`group flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border cursor-pointer transition-all ${
                      isActive 
                        ? 'bg-amber-950/30 border-amber-500/40 text-amber-200 shadow-md font-bold'
                        : 'border-slate-800/40 bg-[#0f1117] text-slate-400 hover:border-amber-500/30 hover:bg-[#161a26] hover:text-slate-200'
                    }`}
                  >
                    {renderFmIcon(fm.type, isActive)}
                    <span className="text-xs font-sans tracking-wide truncate">{fm.title}</span>
                  </div>
                )
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Chapters & Parts Accordion */}
        <div className="space-y-1">
          <button 
            onClick={() => setOpenChapters(!openChapters)}
            className="w-full flex items-center justify-between px-2 py-1 text-[10px] font-mono text-slate-400 uppercase tracking-widest font-bold hover:text-slate-200 transition-colors rounded-lg hover:bg-slate-900/60 cursor-pointer"
          >
            <span className="flex items-center gap-1.5">
              <Layers size={12} className="text-indigo-400" /> Manuscript Tree ({chapters.length})
            </span>
            {openChapters ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
          </button>

          <AnimatePresence initial={false}>
            {openChapters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2, ease: 'easeInOut' }}
                className="overflow-hidden"
              >
                <DragDropContext onDragEnd={handleDragEnd}>
                  <Droppable droppableId="manuscript-chapters">
                    {(provided) => (
                      <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-1 pl-3 pt-1 border-l border-slate-800/80 ml-2">
                        {filteredChapters.map((chapter, index) => {
                          const isActive = selectedChapterId === chapter.id;
                          const plainText = chapter.content ? chapter.content.replace(/<[^>]*>/g, '') : '';
                          const wordCount = plainText.trim() ? plainText.trim().split(/\s+/).length : 0;
                          
                          return (
                            <Draggable key={chapter.id} draggableId={chapter.id} index={index}>
                              {(provided, snapshot) => {
                                if (chapter.isPartHeader) {
                                  return (
                                    <div
                                      ref={provided.innerRef}
                                      {...provided.draggableProps}
                                      onClick={() => setSelectedChapterId(chapter.id)}
                                      className={`group relative flex items-center justify-between px-2.5 py-1.5 mt-2 mb-1 rounded-lg cursor-pointer transition-all border ${
                                        isActive
                                          ? 'bg-amber-950/40 border-amber-500/50 text-amber-200 shadow-sm font-bold'
                                          : 'border-slate-800/60 bg-[#141822] text-slate-300 hover:border-amber-500/40 hover:text-slate-100 hover:bg-[#181d2a]'
                                      } ${snapshot.isDragging ? 'shadow-xl shadow-amber-500/20 scale-105 z-50 bg-[#1a1e28] border-amber-500' : ''}`}
                                    >
                                      <div className="absolute -left-3 top-0 bottom-0 w-0.5 bg-slate-700 group-hover:bg-amber-500 transition-colors" />

                                      <div className="flex items-center gap-2 min-w-0 flex-1 pr-2">
                                        <div {...provided.dragHandleProps} className="flex items-center justify-center shrink-0">
                                          <GripVertical 
                                            size={12} 
                                            className={`opacity-0 group-hover:opacity-100 transition-opacity cursor-grab ${isActive ? 'text-amber-400' : 'text-slate-600'}`} 
                                          />
                                        </div>
                                        <Folder size={12} className={`shrink-0 ${isActive ? 'text-amber-400' : 'text-amber-500/80'}`} />
                                        <span className="text-[11px] font-mono font-bold uppercase tracking-wider truncate">{chapter.title}</span>
                                      </div>
                                    </div>
                                  );
                                }

                                return (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    onClick={() => setSelectedChapterId(chapter.id)}
                                    className={`group relative flex items-center justify-between px-2.5 py-1 rounded-xl cursor-pointer transition-all border ${
                                      isActive
                                        ? 'bg-amber-950/30 border-amber-500/40 text-amber-200 shadow-md font-bold'
                                        : 'border-transparent bg-transparent text-slate-400 hover:border-slate-800 hover:bg-[#12151c] hover:text-slate-200'
                                    } ${snapshot.isDragging ? 'shadow-xl shadow-amber-500/20 scale-105 z-50 bg-[#161a26] border-amber-500' : ''}`}
                                  >
                                    <div className="absolute -left-3 top-0 bottom-0 w-0.5 bg-slate-800 group-hover:bg-amber-500/70 transition-colors" />

                                    <div className="flex items-center gap-2 min-w-0 flex-1 pr-2">
                                      <div {...provided.dragHandleProps} className="flex items-center justify-center shrink-0">
                                        <GripVertical 
                                          size={12} 
                                          className={`opacity-0 group-hover:opacity-100 transition-opacity cursor-grab ${isActive ? 'text-amber-400' : 'text-slate-600'}`} 
                                        />
                                      </div>
                                      <FileText size={12} className={`shrink-0 ${isActive ? 'text-amber-400' : 'text-slate-500'}`} />
                                      <span className="text-[11px] font-sans truncate">{chapter.title}</span>
                                    </div>
                                    <span className={`text-[9px] font-mono shrink-0 px-1.5 py-0.5 rounded ${isActive ? 'bg-amber-500/20 text-amber-300 font-bold' : 'text-slate-600 bg-[#0c0e12]'}`}>
                                      {wordCount > 0 ? `${wordCount}w` : '0w'}
                                    </span>
                                  </div>
                                );
                              }}
                            </Draggable>
                          );
                        })}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Back Matter Accordion */}
        <div className="space-y-1">
          <button 
            onClick={() => setOpenBackMatter(!openBackMatter)}
            className="w-full flex items-center justify-between px-2 py-1.5 text-[10px] font-mono text-slate-400 uppercase tracking-widest font-bold hover:text-slate-200 transition-colors rounded-lg hover:bg-slate-900/60 cursor-pointer"
          >
            <span className="flex items-center gap-1.5">
              <Book size={13} className="text-emerald-400" /> Back Matter ({backmatter.length})
            </span>
            {openBackMatter ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
          </button>

          <AnimatePresence initial={false}>
            {openBackMatter && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2, ease: 'easeInOut' }}
                className="overflow-hidden space-y-1.5 pl-2 pt-1"
              >
                {backmatter.map((bm) => (
                  <div 
                    key={bm.id}
                    onClick={() => setSelectedChapterId(bm.id)}
                    className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border cursor-pointer transition-all ${
                      selectedChapterId === bm.id 
                        ? 'bg-amber-950/30 border-amber-500/40 text-amber-200 shadow-md font-bold'
                        : 'border-slate-800/40 bg-[#0f1117] text-slate-400 hover:border-slate-700/60 hover:text-slate-300'
                    }`}
                  >
                    <FileText size={13} className="shrink-0" />
                    <span className="text-xs font-sans">{bm.title}</span>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="p-2.5 border-t border-slate-800/80 bg-[#08090c] shadow-lg flex items-center gap-1.5">
        <button
          onClick={handleAddChapter}
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-[11px] font-mono font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-md shadow-amber-500/20 group"
          title="Create New Chapter"
        >
          <Plus size={13} className="group-hover:scale-110 transition-transform" />
          <span>Chapter</span>
        </button>
        <button
          onClick={handleAddPart}
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-[#12151c] hover:bg-[#1a1e28] border border-slate-800 hover:border-slate-700 text-slate-300 text-[11px] font-mono font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer group"
          title="Create New Part Header"
        >
          <Folder size={13} className="group-hover:scale-110 transition-transform text-amber-500" />
          <span>Part</span>
        </button>
      </div>

    </aside>
  );
}