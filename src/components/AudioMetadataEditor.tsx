import React, { useState } from 'react';
import { Tag, Music, Disc, Check, Sparkles, Layers } from 'lucide-react';
import { useToast } from '../lib/ToastContext';

export interface AudioMetadata {
  title: string;
  author: string;
  genre: string;
  year: string;
  album: string;
  trackNumber: string;
  seriesTitle?: string;
  bookNumber?: string;
  publisher?: string;
}

interface AudioMetadataEditorProps {
  initialTitle?: string;
  initialAuthor?: string;
  onMetadataChange: (meta: AudioMetadata) => void;
}

export default function AudioMetadataEditor({
  initialTitle = 'Untitled Audiobook Chapter',
  initialAuthor = 'Nicholas Kremers',
  onMetadataChange,
}: AudioMetadataEditorProps) {
  const [metadata, setMetadata] = useState<AudioMetadata>({
    title: initialTitle,
    author: initialAuthor,
    genre: 'Audiobook / Non-Fiction',
    year: new Date().getFullYear().toString(),
    album: 'Syllabexa Master Edition',
    trackNumber: '1',
    seriesTitle: 'The Syllabexa Series',
    bookNumber: 'Book 1',
    publisher: 'Syllabexa Publishing Press',
  });
  const [isOpen, setIsOpen] = useState(false);
  const { showToast } = useToast();

  const handleChange = (field: keyof AudioMetadata, value: string) => {
    const updated = { ...metadata, [field]: value };
    setMetadata(updated);
    onMetadataChange(updated);
  };

  const handleApply = () => {
    onMetadataChange(metadata);
    showToast('ID3 Audiobook Metadata & series tags locked for batch export.', 'success');
    setIsOpen(false);
  };

  return (
    <div className="bg-[#0a0a0d] border border-white/5 rounded-2xl p-5 space-y-4 shadow-xl">
      <div className="flex items-center justify-between border-b border-white/5 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <Tag size={16} />
          </div>
          <div>
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-white">ID3 Audiobook & Series Metadata</h3>
            <p className="text-[10px] text-slate-400 font-mono">Batch-apply ID3 tags, series titles, book numbers & publisher data</p>
          </div>
        </div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-mono text-indigo-300 transition-all cursor-pointer"
        >
          {isOpen ? 'Hide Editor' : 'Configure Tags'}
        </button>
      </div>

      <div className="flex items-center justify-between text-xs font-mono text-slate-300 bg-black/40 px-3 py-2.5 rounded-xl border border-white/5">
        <span className="truncate"><strong>Series:</strong> {metadata.seriesTitle} ({metadata.bookNumber})</span>
        <span className="text-indigo-400"><strong>Author:</strong> {metadata.author}</span>
      </div>

      {isOpen && (
        <div className="space-y-4 pt-2 border-t border-white/5 animate-fadeIn">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] font-mono uppercase text-slate-400">Track Title</label>
              <input
                type="text"
                value={metadata.title}
                onChange={(e) => handleChange('title', e.target.value)}
                className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-mono uppercase text-slate-400">Author / Narrator</label>
              <input
                type="text"
                value={metadata.author}
                onChange={(e) => handleChange('author', e.target.value)}
                className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] font-mono uppercase text-slate-400">Series Title</label>
              <input
                type="text"
                value={metadata.seriesTitle || ''}
                onChange={(e) => handleChange('seriesTitle', e.target.value)}
                className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-mono uppercase text-slate-400">Book Number</label>
              <input
                type="text"
                value={metadata.bookNumber || ''}
                onChange={(e) => handleChange('bookNumber', e.target.value)}
                className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-mono uppercase text-slate-400">Publisher</label>
              <input
                type="text"
                value={metadata.publisher || ''}
                onChange={(e) => handleChange('publisher', e.target.value)}
                className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] font-mono uppercase text-slate-400">Genre / Category</label>
              <input
                type="text"
                value={metadata.genre}
                onChange={(e) => handleChange('genre', e.target.value)}
                className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-mono uppercase text-slate-400">Release Year</label>
              <input
                type="text"
                value={metadata.year}
                onChange={(e) => handleChange('year', e.target.value)}
                className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-mono uppercase text-slate-400">Track Number</label>
              <input
                type="text"
                value={metadata.trackNumber}
                onChange={(e) => handleChange('trackNumber', e.target.value)}
                className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={handleApply}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-mono font-bold flex items-center gap-2 cursor-pointer shadow-lg shadow-indigo-500/20 transition-all"
            >
              <Check size={14} /> Lock Batch ID3 Tags
            </button>
          </div>
        </div>
      )}
    </div>
  );
}