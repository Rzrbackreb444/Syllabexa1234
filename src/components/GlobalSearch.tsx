import React, { useMemo } from 'react';
import { useManuscriptStore } from '../store/manuscriptStore';
import { Search, MapPin } from 'lucide-react';

export default function GlobalSearch() {
  const globalSearchQuery = useManuscriptStore(state => state.globalSearchQuery);
  const setGlobalSearchQuery = useManuscriptStore(state => state.setGlobalSearchQuery);
  const chapters = useManuscriptStore(state => state.chapters);
  const frontmatter = useManuscriptStore(state => state.frontmatter);
  const backmatter = useManuscriptStore(state => state.backmatter);
  const setSelectedChapterId = useManuscriptStore(state => state.setSelectedChapterId);

  // OPTIMIZATION: Memoize search indexing and filtering to prevent redundant DOM parsing on typing
  const results = useMemo(() => {
    if (!globalSearchQuery || globalSearchQuery.length < 2) return [];
    const query = globalSearchQuery.toLowerCase();
    const allDocs = [...frontmatter, ...chapters, ...backmatter];
    const found: { id: string, title: string, snippet: string }[] = [];

    allDocs.forEach(doc => {
      // Safe DOM-based HTML stripping for robust client-side search indexing
      let text = '';
      if (typeof window !== 'undefined') {
        const docParser = new DOMParser().parseFromString(doc.content || '', 'text/html');
        text = docParser.body.textContent || '';
      } else {
        text = (doc.content || '').replace(/<[^>]*>?/gm, '');
      }

      const idx = text.toLowerCase().indexOf(query);
      if (idx !== -1) {
        const start = Math.max(0, idx - 40);
        const end = Math.min(text.length, idx + query.length + 40);
        let snippet = text.substring(start, end);
        if (start > 0) snippet = '...' + snippet;
        if (end < text.length) snippet = snippet + '...';
        
        found.push({
          id: doc.id,
          title: doc.title,
          snippet
        });
      }
    });
    return found;
  }, [globalSearchQuery, chapters, frontmatter, backmatter]);

  return (
    <div className="flex-1 max-w-md mx-4 hidden md:flex items-center relative z-50">
      <Search size={14} className="absolute left-3 text-slate-500" />
      <input 
        type="text" 
        placeholder="Search across all chapters..."
        value={globalSearchQuery}
        onChange={(e) => setGlobalSearchQuery(e.target.value)}
        className="w-full bg-[#12151c] border border-slate-700/50 focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 rounded-xl py-1.5 pl-9 pr-3 text-xs text-slate-300 placeholder-slate-600 outline-none transition-all shadow-inner"
      />
      
      {globalSearchQuery.length >= 2 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-[#0c0e12]/90 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl max-h-96 overflow-y-auto z-50 flex flex-col custom-scrollbar animate-in fade-in slide-in-from-top-2 duration-200">
          {results.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500 font-mono">
              <Search className="w-8 h-8 text-slate-700 mx-auto mb-3" />
              No results found for "{globalSearchQuery}"
            </div>
          ) : (
            results.map((res, i) => (
              <button
                key={res.id + '-' + i}
                onClick={() => {
                  setSelectedChapterId(res.id);
                  setGlobalSearchQuery('');
                }}
                className="flex flex-col items-start p-3.5 hover:bg-slate-800 border-b border-slate-800/50 last:border-0 text-left transition-colors cursor-pointer"
              >
                <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest font-mono flex items-center gap-1.5 mb-1">
                  <MapPin size={11} /> {res.title}
                </span>
                <span className="text-xs text-slate-300 font-serif italic">"{res.snippet}"</span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}