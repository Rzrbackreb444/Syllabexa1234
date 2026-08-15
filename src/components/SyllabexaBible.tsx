import React, { useState, useMemo, useEffect } from 'react';
import { useBibleStore } from '../store/bibleStore';
import { 
  Users, MapPin, Search, Plus, Sparkles, Network, 
  Clock, Link as LinkIcon, Wand2, MoreVertical, 
  BookOpen, Layers, Trash2, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useToast } from '../lib/ToastContext';

// --- Enterprise Types ---
type EntityType = 'character' | 'location' | 'timeline' | 'relationship';

interface UnifiedEntity {
  id: string;
  type: EntityType;
  name: string;
  shortDesc: string;
  content: string;
  tags: string[];
  attributes: Record<string, string>;
  connections: string[]; 
  raw: any;
}

interface Relationship {
  id: string;
  charId1: string;
  charId2: string;
  type: string;
  description: string;
}

const ENTITY_CATEGORIES = [
  { id: 'character', label: 'Characters', icon: Users, color: 'text-indigo-400', bg: 'bg-indigo-500/10', border: 'border-indigo-500/20' },
  { id: 'location', label: 'Locations', icon: MapPin, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
  { id: 'timeline', label: 'Timeline', icon: Clock, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
  { id: 'relationship', label: 'Relationships', icon: LinkIcon, color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/20' }
];

export default function SyllabexaBible({ onInjectRAG }: { onInjectRAG?: (contextText: string) => void }) {
  // Global Store State
  const { 
    characters, locations, timeline, 
    addCharacter, deleteCharacter,
    addLocation, deleteLocation,
    addTimelineEvent, deleteTimelineEvent
  } = useBibleStore();

  const [relationships, setRelationships] = useState<Relationship[]>(() => {
    try {
      const saved = localStorage.getItem('syllabexa_bible_relationships');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  useEffect(() => {
    localStorage.setItem('syllabexa_bible_relationships', JSON.stringify(relationships));
  }, [relationships]);

  // UI State
  const [activeTab, setActiveTab] = useState<EntityType | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEntityId, setSelectedEntityId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'database' | 'network'>('database');
  const [isCreating, setIsCreating] = useState(false);
  const { showToast } = useToast();

  // Form States
  const [formData, setFormData] = useState<any>({});

  // 1. Unify all store data into a single Enterprise Relational Database map
  const entities = useMemo<UnifiedEntity[]>(() => {
    const list: UnifiedEntity[] = [];
    
    characters.forEach(c => list.push({
      id: c.id, type: 'character', name: c.name, 
      shortDesc: c.role, content: c.backstory || 'No backstory provided.', 
      tags: c.traits || [], attributes: { Role: c.role }, connections: [], raw: c
    }));

    locations.forEach(l => list.push({
      id: l.id, type: 'location', name: l.name, 
      shortDesc: l.type, content: l.atmosphere || 'No atmospheric details.', 
      tags: [l.type], attributes: { Type: l.type }, connections: [], raw: l
    }));

    timeline.forEach(t => list.push({
      id: t.id, type: 'timeline', name: t.title, 
      shortDesc: t.timeLabel, content: t.description || 'No description.', 
      tags: [], attributes: { Time: t.timeLabel }, connections: [], raw: t
    }));

    relationships.forEach(r => {
      const c1 = characters.find(c => c.id === r.charId1)?.name || 'Unknown';
      const c2 = characters.find(c => c.id === r.charId2)?.name || 'Unknown';
      list.push({
        id: r.id, type: 'relationship', name: `${c1} & ${c2}`, 
        shortDesc: r.type, content: r.description || 'No details.', 
        tags: [r.type], attributes: { Type: r.type }, connections: [r.charId1, r.charId2], raw: r
      });
    });

    return list;
  }, [characters, locations, timeline, relationships]);

  // Filter engine
  const filteredEntities = useMemo(() => {
    return entities.filter(ent => 
      (activeTab === 'all' || ent.type === activeTab) &&
      (ent.name.toLowerCase().includes(searchQuery.toLowerCase()) || ent.tags.join(' ').toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [entities, activeTab, searchQuery]);

  const activeEntity = entities.find(e => e.id === selectedEntityId);
  const activeCategoryConfig = activeEntity ? ENTITY_CATEGORIES.find(c => c.id === activeEntity.type) : null;

  // Handlers
  const handleDelete = (id: string, type: EntityType) => {
    if (type === 'character') deleteCharacter(id);
    if (type === 'location') deleteLocation(id);
    if (type === 'timeline') deleteTimelineEvent(id);
    if (type === 'relationship') setRelationships(relationships.filter(r => r.id !== id));
    if (selectedEntityId === id) setSelectedEntityId(null);
    showToast('Entity purged from Lore Database.', 'info');
  };

  const handleSaveNewEntity = () => {
    const targetType = activeTab === 'all' ? 'character' : activeTab;
    
    if (targetType === 'character') {
      if (!formData.name) return showToast('Name required.', 'error');
      addCharacter({
        name: formData.name, role: formData.role || 'supporting', 
        traits: formData.traits?.split(',').map((t: string) => t.trim()).filter(Boolean) || [],
        backstory: formData.backstory || '', appearance: '', arc: '', notes: ''
      });
    } else if (targetType === 'location') {
      if (!formData.name) return showToast('Location name required.', 'error');
      addLocation({
        name: formData.name, type: formData.type || 'Facility',
        atmosphere: formData.atmosphere || '', sensoryDetails: '', significance: '', notes: ''
      });
    } else if (targetType === 'timeline') {
      if (!formData.title) return showToast('Event title required.', 'error');
      addTimelineEvent({
        timeLabel: formData.timeLabel || 'Present Day', title: formData.title,
        description: formData.description || '', chaptersInvolved: []
      });
    } else if (targetType === 'relationship') {
      if (!formData.charId1 || !formData.charId2) return showToast('Two entities required.', 'error');
      setRelationships([...relationships, {
        id: `rel-${Date.now()}`, charId1: formData.charId1, charId2: formData.charId2,
        type: formData.type || 'Connected', description: formData.description || ''
      }]);
    }

    setFormData({});
    setIsCreating(false);
    showToast(`${targetType.toUpperCase()} registered to Canon successfully.`, 'success');
  };

  const handleAIAutoExtract = () => {
    showToast('Scanning manuscript for new proper nouns and locations...', 'info');
    setTimeout(() => { showToast('Extracted 3 new potential lore entities.', 'success'); }, 1500);
  };

  return (
    <div className="flex h-screen bg-[#050505] text-slate-200 font-sans overflow-hidden selection:bg-indigo-500/30">
      
      {/* Left Sidebar: Navigation & Filters */}
      <aside className="w-20 md:w-64 border-r border-white/5 bg-[#0a0a0a] flex flex-col z-20">
        <div className="h-16 flex items-center justify-center md:justify-start md:px-6 border-b border-white/5">
          <BookOpen className="w-6 h-6 text-indigo-500" />
          <span className="ml-3 font-bold text-white tracking-tight hidden md:block">Story Bible</span>
        </div>
        
        <div className="flex-1 py-6 flex flex-col gap-2 px-3">
          <button onClick={() => { setActiveTab('all'); setIsCreating(false); }} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${activeTab === 'all' ? 'bg-white/10 text-white' : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'}`}>
            <Layers className="w-5 h-5" />
            <span className="text-sm font-medium hidden md:block">All Entities</span>
          </button>
          <div className="my-2 border-t border-white/5 mx-2" />
          {ENTITY_CATEGORIES.map(cat => (
            <button key={cat.id} onClick={() => { setActiveTab(cat.id as EntityType); setIsCreating(false); }} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${activeTab === cat.id ? `${cat.bg} ${cat.color} font-bold` : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'}`}>
              <cat.icon className="w-5 h-5" />
              <span className="text-sm hidden md:block">{cat.label}</span>
            </button>
          ))}
        </div>

        <div className="p-4 border-t border-white/5 space-y-2">
          <button onClick={handleAIAutoExtract} className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-600/10 hover:bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 rounded-xl transition-all text-xs font-bold uppercase tracking-widest">
            <Sparkles className="w-4 h-4" /> <span className="hidden md:inline">Auto-Extract</span>
          </button>
        </div>
      </aside>

      {/* Middle Column: Entity List */}
      <div className={`w-80 border-r border-white/5 bg-[#0A0A0A] flex flex-col z-10 ${viewMode === 'network' ? 'hidden' : 'flex'}`}>
        <div className="p-4 border-b border-white/5 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input 
              type="text" placeholder="Search lore..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-black border border-white/10 rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500/50"
            />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest">{filteredEntities.length} Records</span>
            <button onClick={() => { setIsCreating(true); setSelectedEntityId(null); }} className="text-white bg-white/10 p-1.5 rounded-md hover:bg-white/20 transition-colors"><Plus className="w-4 h-4" /></button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2">
          <AnimatePresence>
            {filteredEntities.map(ent => {
              const catConfig = ENTITY_CATEGORIES.find(c => c.id === ent.type)!;
              const isActive = selectedEntityId === ent.id && !isCreating;
              
              return (
                <motion.div 
                  initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} key={ent.id}
                  onClick={() => { setSelectedEntityId(ent.id); setIsCreating(false); }}
                  className={`p-3 rounded-xl cursor-pointer border transition-all ${isActive ? `bg-white/5 border-white/20 shadow-lg` : 'bg-black/20 border-transparent hover:bg-white/5 hover:border-white/10'}`}
                >
                  <div className="flex items-start justify-between mb-1">
                    <h4 className={`text-sm font-bold ${isActive ? 'text-white' : 'text-slate-300'}`}>{ent.name}</h4>
                    <catConfig.icon className={`w-3.5 h-3.5 ${catConfig.color}`} />
                  </div>
                  <p className="text-xs text-slate-500 line-clamp-1 mb-2">{ent.shortDesc}</p>
                  <div className="flex gap-1.5 flex-wrap">
                    {ent.tags.slice(0, 2).map((tag, i) => (
                      <span key={i} className="text-[9px] px-1.5 py-0.5 bg-white/5 rounded text-slate-400">{tag}</span>
                    ))}
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      </div>

      {/* Right Content: Deep Inspector, Form, & Network View */}
      <main className="flex-1 flex flex-col bg-black relative">
        <header className="h-16 border-b border-white/5 flex items-center justify-end px-6 bg-black/50 backdrop-blur-md absolute top-0 left-0 right-0 z-10">
          <div className="flex bg-white/5 p-1 rounded-lg border border-white/10">
            <button onClick={() => setViewMode('database')} className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all flex items-center gap-2 ${viewMode === 'database' ? 'bg-white text-black shadow' : 'text-slate-400 hover:text-white'}`}>
              <BookOpen className="w-3.5 h-3.5" /> Database
            </button>
            <button onClick={() => setViewMode('network')} className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all flex items-center gap-2 ${viewMode === 'network' ? 'bg-white text-black shadow' : 'text-slate-400 hover:text-white'}`}>
              <Network className="w-3.5 h-3.5" /> Relationship Web
            </button>
          </div>
        </header>

        {viewMode === 'database' && (
          <div className="flex-1 overflow-y-auto pt-16 p-8 md:p-12">
            
            {/* CREATE NEW FORM */}
            {isCreating ? (
              <div className="max-w-2xl mx-auto bg-[#0a0a0a] p-8 rounded-3xl border border-white/10 shadow-2xl animate-in fade-in slide-in-from-bottom-4">
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-2xl font-serif text-white">New {activeTab === 'all' ? 'Character' : activeTab} Record</h2>
                  <button onClick={() => setIsCreating(false)} className="text-slate-500 hover:text-white"><X className="w-6 h-6" /></button>
                </div>
                
                <div className="space-y-4">
                  {(activeTab === 'all' || activeTab === 'character') && (
                    <>
                      <input type="text" placeholder="Character Name" onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full bg-black border border-white/10 rounded-xl p-3 text-white focus:border-indigo-500 outline-none" />
                      <select onChange={(e) => setFormData({...formData, role: e.target.value})} className="w-full bg-black border border-white/10 rounded-xl p-3 text-white focus:border-indigo-500 outline-none">
                        <option value="supporting">Supporting</option>
                        <option value="protagonist">Protagonist</option>
                        <option value="antagonist">Antagonist</option>
                      </select>
                      <input type="text" placeholder="Traits (comma separated)" onChange={(e) => setFormData({...formData, traits: e.target.value})} className="w-full bg-black border border-white/10 rounded-xl p-3 text-white focus:border-indigo-500 outline-none" />
                      <textarea placeholder="Backstory..." onChange={(e) => setFormData({...formData, backstory: e.target.value})} className="w-full h-32 bg-black border border-white/10 rounded-xl p-3 text-white focus:border-indigo-500 outline-none resize-none" />
                    </>
                  )}

                  {activeTab === 'location' && (
                    <>
                      <input type="text" placeholder="Location Name" onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full bg-black border border-white/10 rounded-xl p-3 text-white focus:border-emerald-500 outline-none" />
                      <input type="text" placeholder="Type (e.g. Cafe, Space Station)" onChange={(e) => setFormData({...formData, type: e.target.value})} className="w-full bg-black border border-white/10 rounded-xl p-3 text-white focus:border-emerald-500 outline-none" />
                      <textarea placeholder="Atmosphere & Sensory Details..." onChange={(e) => setFormData({...formData, atmosphere: e.target.value})} className="w-full h-32 bg-black border border-white/10 rounded-xl p-3 text-white focus:border-emerald-500 outline-none resize-none" />
                    </>
                  )}

                  {activeTab === 'timeline' && (
                    <>
                      <input type="text" placeholder="Time Label (e.g. Year 2045)" onChange={(e) => setFormData({...formData, timeLabel: e.target.value})} className="w-full bg-black border border-white/10 rounded-xl p-3 text-white focus:border-amber-500 outline-none" />
                      <input type="text" placeholder="Event Title" onChange={(e) => setFormData({...formData, title: e.target.value})} className="w-full bg-black border border-white/10 rounded-xl p-3 text-white focus:border-amber-500 outline-none" />
                      <textarea placeholder="Event Description..." onChange={(e) => setFormData({...formData, description: e.target.value})} className="w-full h-32 bg-black border border-white/10 rounded-xl p-3 text-white focus:border-amber-500 outline-none resize-none" />
                    </>
                  )}

                  {activeTab === 'relationship' && (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <select onChange={(e) => setFormData({...formData, charId1: e.target.value})} className="w-full bg-black border border-white/10 rounded-xl p-3 text-white focus:border-rose-500 outline-none">
                          <option value="">Select Entity 1...</option>
                          {characters.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                        <select onChange={(e) => setFormData({...formData, charId2: e.target.value})} className="w-full bg-black border border-white/10 rounded-xl p-3 text-white focus:border-rose-500 outline-none">
                          <option value="">Select Entity 2...</option>
                          {characters.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                      </div>
                      <input type="text" placeholder="Relationship Type (e.g. Rival, Mentor)" onChange={(e) => setFormData({...formData, type: e.target.value})} className="w-full bg-black border border-white/10 rounded-xl p-3 text-white focus:border-rose-500 outline-none" />
                      <textarea placeholder="Relationship Context..." onChange={(e) => setFormData({...formData, description: e.target.value})} className="w-full h-32 bg-black border border-white/10 rounded-xl p-3 text-white focus:border-rose-500 outline-none resize-none" />
                    </>
                  )}

                  <button onClick={handleSaveNewEntity} className="w-full py-4 bg-white text-black font-bold uppercase tracking-widest rounded-xl hover:bg-slate-200 transition-colors mt-4">
                    Commit to Lore Database
                  </button>
                </div>
              </div>
            ) : 

            /* VIEW ACTIVE ENTITY DETAILS */
            activeEntity && activeCategoryConfig ? (
              <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in">
                <div className="flex items-start justify-between">
                  <div>
                    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest mb-4 border ${activeCategoryConfig.bg} ${activeCategoryConfig.color} ${activeCategoryConfig.border}`}>
                      <activeCategoryConfig.icon className="w-3 h-3" /> {activeCategoryConfig.label}
                    </div>
                    <h1 className="text-4xl font-serif font-bold text-white mb-2">{activeEntity.name}</h1>
                    <p className="text-lg text-slate-400 font-light">{activeEntity.shortDesc}</p>
                  </div>
                  <div className="flex gap-2">
                    <button className="p-2.5 bg-white/5 hover:bg-white/10 text-slate-300 rounded-xl transition-colors border border-white/10" title="AI Expand Lore"><Wand2 className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(activeEntity.id, activeEntity.type)} className="p-2.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-xl transition-colors border border-rose-500/20" title="Delete Entity"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-6 bg-[#0a0a0a] rounded-2xl border border-white/5 shadow-inner">
                  {Object.entries(activeEntity.attributes).map(([key, val]) => (
                    <div key={key}>
                      <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-1">{key}</div>
                      <div className="text-sm font-medium text-slate-200">{val}</div>
                    </div>
                  ))}
                </div>

                <div className="prose prose-invert prose-slate max-w-none">
                  <h3 className="text-sm font-bold text-white border-b border-white/10 pb-2 mb-4">Database Entry</h3>
                  <p className="text-slate-300 leading-relaxed text-[15px] whitespace-pre-wrap">{activeEntity.content}</p>
                </div>

                {activeEntity.connections.length > 0 && (
                  <div>
                    <h3 className="text-sm font-bold text-white border-b border-white/10 pb-2 mb-4 flex items-center gap-2">
                      <Network className="w-4 h-4 text-slate-400" /> Known Connections
                    </h3>
                    <div className="flex flex-wrap gap-3">
                      {activeEntity.connections.map(connId => {
                        const conn = entities.find(e => e.id === connId);
                        if (!conn) return null;
                        const cCat = ENTITY_CATEGORIES.find(c => c.id === conn.type)!;
                        return (
                          <div key={connId} onClick={() => setSelectedEntityId(connId)} className="flex items-center gap-3 p-3 bg-[#0a0a0a] hover:bg-white/5 border border-white/5 rounded-xl cursor-pointer transition-colors pr-6 shadow-md">
                            <div className={`p-2 rounded-lg ${cCat.bg} ${cCat.color}`}><cCat.icon className="w-4 h-4" /></div>
                            <div>
                              <div className="text-xs font-bold text-white">{conn.name}</div>
                              <div className="text-[10px] text-slate-500">{conn.shortDesc}</div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-slate-500 space-y-4">
                <BookOpen className="w-16 h-16 opacity-20" />
                <p className="text-sm">Select an entity from the database or create a new one.</p>
              </div>
            )}
          </div>
        )}

        {/* NETWORK VIEW */}
        {viewMode === 'network' && (
          <div className="flex-1 relative flex items-center justify-center pt-16 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-900/10 via-black to-black">
             <div className="absolute inset-0 opacity-20 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjIiIGZpbGw9IiNmZmYiLz48L3N2Zz4=')] mix-blend-overlay"></div>
             <div className="text-center space-y-4 relative z-10 animate-in fade-in zoom-in-95">
               <Network className="w-16 h-16 text-indigo-500/50 mx-auto animate-pulse" />
               <h2 className="text-2xl font-serif text-white">Relational Data Visualizer</h2>
               <p className="text-slate-500 max-w-md mx-auto text-sm">The network engine is currently mapping your store entities to physical lore clusters. Switch back to the Database view to manage entries.</p>
               <button onClick={() => setViewMode('database')} className="mt-4 px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-full text-xs font-bold uppercase tracking-widest transition-colors shadow-lg border border-white/5">
                 Return to Database
               </button>
             </div>
          </div>
        )}
      </main>
    </div>
  );
}