import React, { useState } from 'react';
import { useBibleStore } from '../store/bibleStore';
import { BookOpen, Users, MapPin, Film, Clock, Plus, Trash2, Ghost, Sparkles } from 'lucide-react';
import { useToast } from '../lib/ToastContext';
import InfiniteHeroesModal from './InfiniteHeroesModal';

type TabId = 'characters' | 'locations' | 'scenes' | 'timeline';

export default function BibleStudio() {
  const { 
    characters, locations, scenes, timeline, 
    addCharacter, deleteCharacter, 
    addLocation, deleteLocation, 
    addScene, deleteScene,
    addTimelineEvent, deleteTimelineEvent
  } = useBibleStore();
  
  const [activeTab, setActiveTab] = useState<TabId>('characters');
  const [isHeroModalOpen, setIsHeroModalOpen] = useState<boolean>(false);

  // Unified state for all repository tabs
  const [inputs, setInputs] = useState({ 
    character: '', 
    location: '', 
    scene: '', 
    timelineTitle: '', 
    timelineLabel: 'Year 1' 
  });
  
  const { showToast } = useToast();

  // --- OPTIMIZED HANDLERS ---
  const handleAddCharacter = () => {
    if (!inputs.character.trim()) return;
    addCharacter({
      name: inputs.character.trim(),
      role: 'protagonist',
      traits: ['Key Entity'],
      backstory: '',
      appearance: '',
      arc: '',
      notes: ''
    });
    setInputs(prev => ({ ...prev, character: '' }));
    showToast('Character added to Story Bible.', 'success');
  };

  const handleAddLocation = () => {
    if (!inputs.location.trim()) return;
    addLocation({ 
      name: inputs.location.trim(), 
      type: 'Primary Hub', 
      atmosphere: '',
      sensoryDetails: '',
      significance: '',
      notes: ''
    });
    setInputs(prev => ({ ...prev, location: '' }));
    showToast('Location secured in Canon Bible.', 'success');
  };

  const handleAddScene = () => {
    if (!inputs.scene.trim()) return;
    addScene({ 
      title: inputs.scene.trim(), 
      chapterId: 'chap-1', 
      summary: '', 
      pov: 'First Person', 
      conflict: 'Equipment failure', 
      setting: 'Main Floor' 
    });
    setInputs(prev => ({ ...prev, scene: '' }));
    showToast('Scene card integrated.', 'success');
  };

  const handleAddTimeline = () => {
    if (!inputs.timelineTitle.trim()) return;
    addTimelineEvent({
      timeLabel: inputs.timelineLabel.trim() || 'Milestone',
      title: inputs.timelineTitle.trim(),
      description: 'Temporal node initialized.',
      chaptersInvolved: []
    });
    setInputs(prev => ({ ...prev, timelineTitle: '' }));
    showToast('Temporal milestone recorded.', 'success');
  };

  // --- CONFIGURATIONS ---
  const TABS = [
    { id: 'characters' as TabId, label: 'Characters', icon: Users, count: characters.length },
    { id: 'locations' as TabId, label: 'Locations', icon: MapPin, count: locations.length },
    { id: 'scenes' as TabId, label: 'Scenes', icon: Film, count: scenes.length },
    { id: 'timeline' as TabId, label: 'Timeline', icon: Clock, count: timeline.length }
  ];

  // Reusable Empty State Component
  const EmptyState = ({ message }: { message: string }) => (
    <div className="flex flex-col items-center justify-center py-16 px-4 border-2 border-dashed border-slate-800/50 rounded-3xl bg-[#0c0e12]/50">
      <Ghost size={48} className="text-slate-700 mb-4" />
      <p className="text-slate-500 font-mono text-xs uppercase tracking-widest text-center">{message}</p>
    </div>
  );

  return (
    <div className="flex-1 bg-[#07080a] flex flex-col h-full font-sans overflow-hidden select-none relative z-0">
      
      {/* Studio Header Bar */}
      <div className="h-16 bg-[#0c0e12] border-b border-white/5 px-8 flex items-center justify-between shrink-0 shadow-lg z-10">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.15)]">
            <BookOpen size={20} />
          </div>
          <div>
            <h2 className="text-xs font-mono font-bold text-slate-100 uppercase tracking-widest flex items-center gap-2">
              <span>Story Bible Repository</span>
              <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 text-[9px] border border-amber-500/30">CANON PRO</span>
            </h2>
            <p className="text-[10px] text-slate-500 font-mono mt-0.5">Manage consistency, entity arcs, lore, and temporal data</p>
          </div>
        </div>

        {/* Dynamic Navigation Tabs & Quick Launch Button */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsHeroModalOpen(true)}
            className="px-3.5 py-2 bg-gradient-to-r from-amber-500/20 to-amber-500/10 hover:from-amber-500/30 hover:to-amber-500/20 border border-amber-500/40 text-amber-300 rounded-xl font-mono text-[11px] font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer shadow-md shadow-amber-500/10 active:scale-95"
          >
            <Sparkles size={14} className="text-amber-400 animate-pulse" />
            <span>Forge Infinite Hero</span>
          </button>

          <div className="flex items-center gap-1 bg-[#040506] p-1.5 rounded-xl border border-white/5">
            {TABS.map(({ id, label, icon: Icon, count }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`px-4 py-2 rounded-lg text-[11px] font-mono uppercase tracking-wider transition-all duration-200 cursor-pointer flex items-center gap-2 ${
                  activeTab === id 
                    ? 'bg-amber-500 text-black font-bold shadow-md shadow-amber-500/20' 
                    : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
                }`}
              >
                <Icon size={14} />
                <span>{label}</span>
                <span className={`ml-1 px-1.5 py-0.5 rounded-full text-[9px] ${activeTab === id ? 'bg-black/20' : 'bg-white/5'}`}>
                  {count}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Workspace */}
      <div className="flex-1 overflow-y-auto p-8 max-w-6xl mx-auto w-full custom-scrollbar">
        
        {/* CHARACTERS TAB */}
        {activeTab === 'characters' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {/* Quick Add Form */}
            <div className="bg-[#0c0e12] border border-white/5 rounded-2xl p-4 flex gap-3 shadow-md">
              <input 
                type="text" 
                placeholder="New character name..."
                value={inputs.character}
                onChange={e => setInputs({ ...inputs, character: e.target.value })}
                onKeyDown={e => e.key === 'Enter' && handleAddCharacter()}
                className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-slate-100 placeholder-slate-600 font-mono focus:outline-none focus:border-amber-500/50"
              />
              <button 
                onClick={handleAddCharacter}
                className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-black rounded-xl font-mono text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 shrink-0"
              >
                <Plus size={16} />
                <span>Add Entity</span>
              </button>
            </div>

            {/* List */}
            {characters.length === 0 ? (
              <EmptyState message="No character entities registered in Canon Bible yet." />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {characters.map(item => (
                  <div key={item.id} className="bg-[#0c0e12] border border-white/5 hover:border-amber-500/30 rounded-2xl p-5 space-y-3 transition-all group">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="text-sm font-bold font-serif text-slate-100 group-hover:text-amber-400 transition-colors">
                          {item.name}
                        </h3>
                        <span className="inline-block px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 text-[10px] font-mono mt-1 border border-amber-500/20">
                          {item.role}
                        </span>
                      </div>
                      <button 
                        onClick={() => deleteCharacter(item.id)}
                        className="text-slate-600 hover:text-red-400 p-1 transition-colors cursor-pointer"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    {item.appearance && (
                      <p className="text-xs text-slate-400 font-serif leading-relaxed line-clamp-2">
                        {item.appearance}
                      </p>
                    )}

                    {item.arc && (
                      <p className="text-[11px] text-amber-300/80 font-mono line-clamp-2">
                        {item.arc}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* LOCATIONS TAB */}
        {activeTab === 'locations' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="bg-[#0c0e12] border border-white/5 rounded-2xl p-4 flex gap-3 shadow-md">
              <input 
                type="text" 
                placeholder="New location / hub name..."
                value={inputs.location}
                onChange={e => setInputs({ ...inputs, location: e.target.value })}
                onKeyDown={e => e.key === 'Enter' && handleAddLocation()}
                className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-slate-100 placeholder-slate-600 font-mono focus:outline-none focus:border-amber-500/50"
              />
              <button 
                onClick={handleAddLocation}
                className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-black rounded-xl font-mono text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 shrink-0"
              >
                <Plus size={16} />
                <span>Add Location</span>
              </button>
            </div>

            {locations.length === 0 ? (
              <EmptyState message="No geographic or setting nodes established." />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {locations.map(item => (
                  <div key={item.id} className="bg-[#0c0e12] border border-white/5 hover:border-amber-500/30 rounded-2xl p-5 space-y-3 transition-all group">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="text-sm font-bold font-serif text-slate-100 group-hover:text-amber-400 transition-colors">
                          {item.name}
                        </h3>
                        <span className="inline-block px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-mono mt-1 border border-emerald-500/20">
                          {item.type || 'Setting'}
                        </span>
                      </div>
                      <button 
                        onClick={() => deleteLocation(item.id)}
                        className="text-slate-600 hover:text-red-400 p-1 transition-colors cursor-pointer"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* SCENES TAB */}
        {activeTab === 'scenes' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="bg-[#0c0e12] border border-white/5 rounded-2xl p-4 flex gap-3 shadow-md">
              <input 
                type="text" 
                placeholder="New scene title..."
                value={inputs.scene}
                onChange={e => setInputs({ ...inputs, scene: e.target.value })}
                onKeyDown={e => e.key === 'Enter' && handleAddScene()}
                className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-slate-100 placeholder-slate-600 font-mono focus:outline-none focus:border-amber-500/50"
              />
              <button 
                onClick={handleAddScene}
                className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-black rounded-xl font-mono text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 shrink-0"
              >
                <Plus size={16} />
                <span>Add Scene</span>
              </button>
            </div>

            {scenes.length === 0 ? (
              <EmptyState message="No narrative scenes or conflict cards drafted." />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {scenes.map(item => (
                  <div key={item.id} className="bg-[#0c0e12] border border-white/5 hover:border-amber-500/30 rounded-2xl p-5 space-y-3 transition-all group">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-sm font-bold font-serif text-slate-100 group-hover:text-amber-400 transition-colors">
                        {item.title}
                      </h3>
                      <button 
                        onClick={() => deleteScene(item.id)}
                        className="text-slate-600 hover:text-red-400 p-1 transition-colors cursor-pointer"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TIMELINE TAB */}
        {activeTab === 'timeline' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="bg-[#0c0e12] border border-white/5 rounded-2xl p-4 flex gap-3 shadow-md">
              <input 
                type="text" 
                placeholder="Milestone label (e.g. Year 1842)..."
                value={inputs.timelineLabel}
                onChange={e => setInputs({ ...inputs, timelineLabel: e.target.value })}
                className="w-40 bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-slate-100 placeholder-slate-600 font-mono focus:outline-none focus:border-amber-500/50"
              />
              <input 
                type="text" 
                placeholder="Temporal event title..."
                value={inputs.timelineTitle}
                onChange={e => setInputs({ ...inputs, timelineTitle: e.target.value })}
                onKeyDown={e => e.key === 'Enter' && handleAddTimeline()}
                className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-slate-100 placeholder-slate-600 font-mono focus:outline-none focus:border-amber-500/50"
              />
              <button 
                onClick={handleAddTimeline}
                className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-black rounded-xl font-mono text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 shrink-0"
              >
                <Plus size={16} />
                <span>Add Node</span>
              </button>
            </div>

            {timeline.length === 0 ? (
              <EmptyState message="No temporal milestones logged." />
            ) : (
              <div className="space-y-3 relative before:absolute before:inset-0 before:left-6 before:w-0.5 before:bg-white/5">
                {timeline.map(item => (
                  <div key={item.id} className="bg-[#0c0e12] border border-white/5 rounded-2xl p-4 ml-12 relative flex items-center justify-between gap-4 group hover:border-amber-500/30 transition-all">
                    <div className="absolute -left-12 w-8 h-8 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 text-[10px] font-mono font-bold">
                      {item.timeLabel?.substring(0, 4) || 'T'}
                    </div>
                    <div>
                      <span className="text-[10px] font-mono text-amber-400">{item.timeLabel}</span>
                      <h4 className="text-sm font-bold font-serif text-slate-100">{item.title}</h4>
                    </div>
                    <button 
                      onClick={() => deleteTimelineEvent(item.id)}
                      className="text-slate-600 hover:text-red-400 p-1 transition-colors cursor-pointer"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>

      {/* On-Demand Infinite Heroes Modal */}
      <InfiniteHeroesModal
        isOpen={isHeroModalOpen}
        onClose={() => setIsHeroModalOpen(false)}
      />

    </div>
  );
}
