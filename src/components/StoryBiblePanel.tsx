import React, { useState } from 'react';
import { 
  Users, 
  MapPin, 
  Film, 
  Clock, 
  TrendingUp, 
  Plus, 
  Trash2, 
  Edit, 
  Check, 
  X, 
  Sparkles,
  Bookmark,
  RefreshCw
} from 'lucide-react';
import { CharacterSheet, LocationSheet, SceneCard, TimelineEvent, Chapter } from '../types';
import { useToast } from '../lib/ToastContext';
import InfiniteHeroesModal from './InfiniteHeroesModal';

interface StoryBiblePanelProps {
  bible: {
    characters: CharacterSheet[];
    locations: LocationSheet[];
    scenes: SceneCard[];
    timeline: TimelineEvent[];
  };
  chapters: Chapter[];
  onUpdateBible: (updatedBible: any) => void;
}

export default function StoryBiblePanel({
  bible,
  chapters,
  onUpdateBible
}: StoryBiblePanelProps) {
  const [activeTab, setActiveTab] = useState<'characters' | 'locations' | 'scenes' | 'timeline' | 'arcs'>('characters');
  const [isHeroModalOpen, setIsHeroModalOpen] = useState(false);

  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [charForm, setCharForm] = useState<Partial<CharacterSheet>>({
    name: '', role: 'protagonist', traits: [], backstory: '', appearance: '', arc: '', notes: ''
  });
  const [traitInput, setTraitInput] = useState('');

  const [locForm, setLocForm] = useState<Partial<LocationSheet>>({
    name: '', type: '', atmosphere: '', sensoryDetails: '', significance: '', notes: ''
  });

  const [sceneForm, setSceneForm] = useState<Partial<SceneCard>>({
    title: '', chapterId: '', summary: '', pov: '', conflict: '', setting: ''
  });

  const [timelineForm, setTimelineForm] = useState<Partial<TimelineEvent>>({
    timeLabel: '', title: '', description: '', chaptersInvolved: []
  });

  const [selectedArcTemplate, setSelectedArcTemplate] = useState<'hero' | 'savethecat'>('hero');
  const [customArcBeats, setCustomArcBeats] = useState<Record<string, string>>({});
  const { showToast } = useToast();

  const heroBeats = [
    { key: 'ordinary_world', name: '1. Ordinary World', desc: 'Introduce the hero in their normal, boring or stable environment.' },
    { key: 'call_to_adventure', name: '2. Call to Adventure', desc: 'An event disrupts the ordinary world and poses a challenge.' },
    { key: 'refusal_of_call', name: '3. Refusal of the Call', desc: 'The hero hesitates, fearing risk or loss.' },
    { key: 'meeting_mentor', name: '4. Meeting the Mentor', desc: 'An experienced figure gives advice, tools, or confidence.' },
    { key: 'crossing_threshold', name: '5. Crossing the Threshold', desc: 'The hero fully commits and steps into the special world.' },
    { key: 'tests_allies_enemies', name: '6. Tests, Allies, Enemies', desc: 'The hero faces trials, makes friends, and meets foes.' },
    { key: 'approach_inmost_cave', name: '7. Approach to the Inmost Cave', desc: 'Preparation for the main ordeal or conflict.' },
    { key: 'ordeal', name: '8. The Ordeal', desc: 'A central crisis where the hero faces death or their greatest fear.' },
    { key: 'reward', name: '9. The Reward', desc: 'The hero gains the prize, insight, or elixir.' },
    { key: 'road_back', name: '10. The Road Back', desc: 'Urgent stakes push the hero back toward home.' },
    { key: 'resurrection', name: '11. The Resurrection', desc: 'A final test requiring everything they learned to defeat the ultimate threat.' },
    { key: 'return_with_elixir', name: '12. Return with Elixir', desc: 'The hero returns, transformed, bringing hope or change.' }
  ];

  const saveTheCatBeats = [
    { key: 'opening_image', name: '1. Opening Image', desc: 'A snapshot of the before state of the world.' },
    { key: 'theme_stated', name: '2. Theme Stated', desc: 'Someone mentions what the book is really about.' },
    { key: 'setup', name: '3. Setup', desc: 'Exploring the flaws and environment of the protagonist.' },
    { key: 'catalyst', name: '4. Catalyst', desc: 'The life-changing incident (inciting incident).' },
    { key: 'debate', name: '5. Debate', desc: 'Protagonist questions if they can or should act.' },
    { key: 'break_into_two', name: '6. Break into Two', desc: 'Entering the second act; no turning back.' },
    { key: 'b_story', name: '7. B-Story', desc: 'Introducing the love interest or primary helper.' },
    { key: 'fun_and_games', name: '8. Fun and Games', desc: 'The promise of the premise (cool scenes/action).' },
    { key: 'midpoint', name: '9. Midpoint', desc: 'A false victory or false defeat that shifts stakes.' },
    { key: 'bad_guys_close_in', name: '10. Bad Guys Close In', desc: 'External pressure increases; internal flaws collide.' },
    { key: 'all_is_lost', name: '11. All is Lost', desc: 'A total defeat. The whiff of death.' },
    { key: 'dark_night_of_soul', name: '12. Dark Night of the Soul', desc: 'The absolute lowest depth before an epiphany.' },
    { key: 'break_into_three', name: '13. Break into Three', desc: 'The epiphany provides the solution for Act 3.' },
    { key: 'finale', name: '14. Finale', desc: 'Executing the new plan; old world is dismantled.' },
    { key: 'final_image', name: '15. Final Image', desc: 'A snapshot of how things have changed.' }
  ];

  const handleSaveCharacter = () => {
    if (!charForm.name) {
      showToast('Character name is required', 'error');
      return;
    }
    const items = [...(bible.characters || [])];
    if (editingId) {
      const idx = items.findIndex(c => c.id === editingId);
      if (idx !== -1) items[idx] = { ...items[idx], ...charForm } as CharacterSheet;
      showToast('Character sheet updated', 'success');
    } else {
      items.push({ id: `char-${Date.now()}`, ...charForm } as CharacterSheet);
      showToast('New character added to story bible', 'success');
    }
    onUpdateBible({ ...bible, characters: items });
    resetForm();
  };

  const handleSaveLocation = () => {
    if (!locForm.name) {
      showToast('Location name is required', 'error');
      return;
    }
    const items = [...(bible.locations || [])];
    if (editingId) {
      const idx = items.findIndex(l => l.id === editingId);
      if (idx !== -1) items[idx] = { ...items[idx], ...locForm } as LocationSheet;
      showToast('Setting sheet updated', 'success');
    } else {
      items.push({ id: `loc-${Date.now()}`, ...locForm } as LocationSheet);
      showToast('New setting added to story bible', 'success');
    }
    onUpdateBible({ ...bible, locations: items });
    resetForm();
  };

  const handleSaveScene = () => {
    if (!sceneForm.title) {
      showToast('Scene title is required', 'error');
      return;
    }
    const items = [...(bible.scenes || [])];
    if (editingId) {
      const idx = items.findIndex(s => s.id === editingId);
      if (idx !== -1) items[idx] = { ...items[idx], ...sceneForm } as SceneCard;
      showToast('Scene card updated', 'success');
    } else {
      items.push({ id: `scene-${Date.now()}`, ...sceneForm } as SceneCard);
      showToast('New scene card added', 'success');
    }
    onUpdateBible({ ...bible, scenes: items });
    resetForm();
  };

  const handleSaveTimeline = () => {
    if (!timelineForm.title) {
      showToast('Event title is required', 'error');
      return;
    }
    const items = [...(bible.timeline || [])];
    if (editingId) {
      const idx = items.findIndex(t => t.id === editingId);
      if (idx !== -1) items[idx] = { ...items[idx], ...timelineForm } as TimelineEvent;
      showToast('Timeline event updated', 'success');
    } else {
      items.push({ id: `timeline-${Date.now()}`, ...timelineForm } as TimelineEvent);
      showToast('Timeline event added', 'success');
    }
    onUpdateBible({ ...bible, timeline: items });
    resetForm();
  };

  const handleDeleteItem = (tab: 'characters' | 'locations' | 'scenes' | 'timeline', id: string) => {
    const key = tab === 'characters' ? 'characters' : tab === 'locations' ? 'locations' : tab === 'scenes' ? 'scenes' : 'timeline';
    const items = (bible[key] || []).filter((x: any) => x.id !== id);
    onUpdateBible({ ...bible, [key]: items });
    showToast('Item deleted from story bible', 'info');
  };

  const resetForm = () => {
    setIsAdding(false);
    setEditingId(null);
    setCharForm({ name: '', role: 'protagonist', traits: [], backstory: '', appearance: '', arc: '', notes: '' });
    setLocForm({ name: '', type: '', atmosphere: '', sensoryDetails: '', significance: '', notes: '' });
    setSceneForm({ title: '', chapterId: '', summary: '', pov: '', conflict: '', setting: '' });
    setTimelineForm({ timeLabel: '', title: '', description: '', chaptersInvolved: [] });
    setTraitInput('');
  };

  const addTrait = () => {
    if (!traitInput.trim()) return;
    setCharForm(prev => ({
      ...prev,
      traits: [...(prev.traits || []), traitInput.trim()]
    }));
    setTraitInput('');
  };

  const removeTrait = (t: string) => {
    setCharForm(prev => ({
      ...prev,
      traits: (prev.traits || []).filter(x => x !== t)
    }));
  };

  const handleAutoGenerateOutlineFromArcs = () => {
    const targetBeats = selectedArcTemplate === 'hero' ? heroBeats : saveTheCatBeats;
    const sceneCards: SceneCard[] = [];
    
    targetBeats.forEach((beat, index) => {
      const textVal = customArcBeats[beat.key];
      if (textVal && textVal.trim() !== '') {
        sceneCards.push({
          id: `scene-arc-${beat.key}-${Date.now()}`,
          title: beat.name,
          chapterId: chapters[Math.min(index, chapters.length - 1)]?.id || '',
          summary: textVal,
          pov: 'Main Character',
          conflict: 'Internal adaptation to plot beats',
          setting: 'Ordinary World Transition'
        });
      }
    });

    if (sceneCards.length > 0) {
      onUpdateBible({
        ...bible,
        scenes: [...(bible.scenes || []), ...sceneCards]
      });
      showToast(`Auto-generated ${sceneCards.length} Scene Cards from beat sheet!`, 'success');
    } else {
      showToast('Please fill out at least one beat description first.', 'error');
    }
  };

  return (
    <aside aria-label="Story Bible and Plot Architect" className="flex flex-col h-full bg-[#07080a] text-slate-200 font-sans select-none relative z-0">
      
      {/* Structural Subheader Tabs */}
      <div className="h-16 bg-[#0c0e12] border-b border-slate-800/80 px-8 flex items-center justify-between shrink-0 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Users size={18} />
          </div>
          <div>
            <h2 className="text-xs font-mono font-bold text-slate-100 uppercase tracking-widest flex items-center gap-2">
              <span>Story Bible & Plot Architect</span>
              <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 text-[10px]">Canon Pro</span>
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsHeroModalOpen(true)}
            className="px-3.5 py-2 bg-gradient-to-r from-amber-500/20 to-amber-500/10 hover:from-amber-500/30 hover:to-amber-500/20 border border-amber-500/40 text-amber-300 rounded-xl font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer shadow-md shadow-amber-500/10 active:scale-95 shrink-0"
          >
            <Sparkles size={14} className="text-amber-400 animate-pulse" />
            <span>Forge Hero</span>
          </button>

          <nav aria-label="Story Bible Sub-Tabs" className="flex items-center gap-1.5 bg-[#12151c] p-1.5 rounded-2xl border border-slate-800">
          <button
            onClick={() => { setActiveTab('characters'); resetForm(); }}
            className={`px-4 py-2 rounded-xl text-xs font-mono uppercase tracking-wider transition-all cursor-pointer font-bold flex items-center gap-2 ${activeTab === 'characters' ? 'bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/20' : 'text-slate-400 hover:text-slate-200'}`}
          >
            <Users size={14} />
            <span>Characters ({ (bible.characters || []).length })</span>
          </button>
          <button
            onClick={() => { setActiveTab('locations'); resetForm(); }}
            className={`px-4 py-2 rounded-xl text-xs font-mono uppercase tracking-wider transition-all cursor-pointer font-bold flex items-center gap-2 ${activeTab === 'locations' ? 'bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/20' : 'text-slate-400 hover:text-slate-200'}`}
          >
            <MapPin size={14} />
            <span>Locations ({ (bible.locations || []).length })</span>
          </button>
          <button
            onClick={() => { setActiveTab('scenes'); resetForm(); }}
            className={`px-4 py-2 rounded-xl text-xs font-mono uppercase tracking-wider transition-all cursor-pointer font-bold flex items-center gap-2 ${activeTab === 'scenes' ? 'bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/20' : 'text-slate-400 hover:text-slate-200'}`}
          >
            <Film size={14} />
            <span>Scenes ({ (bible.scenes || []).length })</span>
          </button>
          <button
            onClick={() => { setActiveTab('timeline'); resetForm(); }}
            className={`px-4 py-2 rounded-xl text-xs font-mono uppercase tracking-wider transition-all cursor-pointer font-bold flex items-center gap-2 ${activeTab === 'timeline' ? 'bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/20' : 'text-slate-400 hover:text-slate-200'}`}
          >
            <Clock size={14} />
            <span>Timeline ({ (bible.timeline || []).length })</span>
          </button>
          <button
            onClick={() => { setActiveTab('arcs'); resetForm(); }}
            className={`px-4 py-2 rounded-xl text-xs font-mono uppercase tracking-wider transition-all cursor-pointer font-bold flex items-center gap-2 ${activeTab === 'arcs' ? 'bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/20' : 'text-slate-400 hover:text-slate-200'}`}
          >
            <TrendingUp size={14} />
            <span>Story Arcs</span>
          </button>
        </nav>
        </div>
      </div>

      {/* Primary Panels Content */}
      <div className="flex-1 overflow-y-auto p-8 max-w-7xl mx-auto w-full ambient-glow custom-scrollbar">
        
        {/* CHARACTERS PANEL */}
        {activeTab === 'characters' && (
          <div className="space-y-6">
            {!isAdding && !editingId ? (
              <>
                <div className="flex justify-between items-center bg-[#0c0e12] border border-slate-800 p-4 rounded-2xl shadow-lg">
                  <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest">Story Cast Repository</span>
                  <button
                    onClick={() => setIsAdding(true)}
                    className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-mono text-xs font-black uppercase tracking-wider px-5 py-2.5 rounded-xl cursor-pointer shadow-lg shadow-amber-500/20 transition-all"
                  >
                    <Plus size={14} /> Add Character
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {(!bible.characters || bible.characters.length === 0) ? (
                    <div className="col-span-full border border-dashed border-slate-800 rounded-3xl p-12 text-center text-slate-500 text-xs font-mono">
                      No character sheets yet. Click 'Add Character' to populate your cast.
                    </div>
                  ) : (
                    bible.characters.map(char => (
                      <div key={char.id} className="bg-[#0c0e12] border border-slate-800 hover:border-slate-700 rounded-3xl p-6 relative shadow-xl space-y-4 transition-all">
                        <div className="absolute top-5 right-5 flex items-center gap-2">
                          <button
                            onClick={() => {
                              setEditingId(char.id);
                              setCharForm(char);
                            }}
                            className="p-2 bg-[#12151c] hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 rounded-xl cursor-pointer transition-all"
                          >
                            <Edit size={14} />
                          </button>
                          <button
                            onClick={() => handleDeleteItem('characters', char.id)}
                            className="p-2 bg-[#12151c] hover:bg-rose-950/30 text-slate-400 hover:text-rose-400 border border-slate-800 rounded-xl cursor-pointer transition-all"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>

                        <div className="flex items-center gap-3">
                          <h3 className="text-base font-bold text-slate-100 font-serif tracking-wide">{char.name}</h3>
                          <span className={`text-[10px] uppercase font-mono font-bold px-2.5 py-0.5 rounded-lg border ${char.role === 'protagonist' ? 'bg-emerald-950/60 border-emerald-500/30 text-emerald-300' : char.role === 'antagonist' ? 'bg-rose-950/60 border-rose-500/30 text-rose-300' : 'bg-amber-950/60 border-amber-500/30 text-amber-300'}`}>
                            {char.role}
                          </span>
                        </div>

                        {char.traits && char.traits.length > 0 && (
                          <div className="flex flex-wrap gap-1.5">
                            {char.traits.map(t => (
                              <span key={t} className="text-[10px] font-mono bg-[#12151c] border border-slate-800 text-slate-300 px-2.5 py-1 rounded-xl">
                                {t}
                              </span>
                            ))}
                          </div>
                        )}

                        {char.backstory && (
                          <div className="text-xs text-slate-300 font-sans leading-relaxed">
                            <strong className="font-mono text-slate-400 uppercase text-[10px] block mb-1">Backstory:</strong> {char.backstory}
                          </div>
                        )}
                        {char.arc && (
                          <div className="text-xs text-slate-300 font-sans leading-relaxed pt-2 border-t border-slate-800">
                            <strong className="font-mono text-slate-400 uppercase text-[10px] block mb-1">Story Arc:</strong> {char.arc}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </>
            ) : (
              <div className="bg-[#0c0e12] border border-slate-800 rounded-3xl p-8 space-y-5 shadow-2xl">
                <h3 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-widest pb-3 border-b border-slate-800">
                  {editingId ? 'Edit Character Sheet' : 'Create Character Sheet'}
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-widest mb-1 font-bold">Character Name</label>
                    <input
                      type="text"
                      value={charForm.name || ''}
                      onChange={e => setCharForm(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full bg-[#12151c] border border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-200 focus:border-amber-500 focus:outline-none shadow-inner"
                      placeholder="e.g. Nicholas Kremers"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-widest mb-1 font-bold">Narrative Role</label>
                    <select
                      value={charForm.role || 'protagonist'}
                      onChange={e => setCharForm(prev => ({ ...prev, role: e.target.value as any }))}
                      className="w-full bg-[#12151c] border border-slate-800 rounded-xl px-4 py-3 text-xs font-mono text-slate-200 focus:border-amber-500 focus:outline-none cursor-pointer shadow-inner"
                    >
                      <option value="protagonist">Protagonist (Hero)</option>
                      <option value="antagonist">Antagonist (Villain)</option>
                      <option value="deuteragonist">Deuteragonist (Secondary)</option>
                      <option value="supporting">Supporting Cast</option>
                      <option value="other">Other / Foil</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-widest mb-1 font-bold">Character Traits</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={traitInput}
                      onChange={e => setTraitInput(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && addTrait()}
                      className="flex-1 bg-[#12151c] border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 outline-none focus:border-amber-500 shadow-inner"
                      placeholder="Add trait (e.g. Stubborn, Methodical) and press Enter"
                    />
                    <button
                      type="button"
                      onClick={addTrait}
                      className="bg-amber-500 hover:bg-amber-400 text-slate-950 px-5 py-2.5 rounded-xl text-xs font-mono font-black uppercase tracking-wider cursor-pointer transition-all shadow-md shadow-amber-500/20"
                    >
                      Add
                    </button>
                  </div>
                  {charForm.traits && charForm.traits.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {charForm.traits.map(t => (
                        <span key={t} className="text-xs font-mono bg-[#12151c] border border-slate-800 text-slate-200 px-3 py-1 rounded-xl flex items-center gap-2 shadow-sm">
                          {t}
                          <button type="button" onClick={() => removeTrait(t)} className="hover:text-rose-400 text-slate-500 font-bold">×</button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-widest mb-1 font-bold">Physical Appearance</label>
                  <textarea
                    value={charForm.appearance || ''}
                    onChange={e => setCharForm(prev => ({ ...prev, appearance: e.target.value }))}
                    className="w-full h-20 bg-[#12151c] border border-slate-800 rounded-xl p-4 text-xs text-slate-200 outline-none focus:border-amber-500 shadow-inner resize-none font-sans"
                    placeholder="e.g. 6ft tall, athletic build, focused expression..."
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-widest mb-1 font-bold">Backstory & Motivations</label>
                  <textarea
                    value={charForm.backstory || ''}
                    onChange={e => setCharForm(prev => ({ ...prev, backstory: e.target.value }))}
                    className="w-full h-24 bg-[#12151c] border border-slate-800 rounded-xl p-4 text-xs text-slate-200 outline-none focus:border-amber-500 shadow-inner resize-none font-sans"
                    placeholder="Provide depth into background lore and core drivers..."
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-widest mb-1 font-bold">Character Arc / Metamorphosis</label>
                  <textarea
                    value={charForm.arc || ''}
                    onChange={e => setCharForm(prev => ({ ...prev, arc: e.target.value }))}
                    className="w-full h-20 bg-[#12151c] border border-slate-800 rounded-xl p-4 text-xs text-slate-200 outline-none focus:border-amber-500 shadow-inner resize-none font-sans"
                    placeholder="How do they evolve or transform by the climax?"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                  <button
                    onClick={resetForm}
                    className="px-5 py-3 rounded-xl border border-slate-800 text-slate-400 font-mono text-xs font-bold hover:bg-slate-800 hover:text-slate-200 cursor-pointer transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveCharacter}
                    className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-mono text-xs font-black uppercase tracking-wider rounded-xl cursor-pointer shadow-xl shadow-amber-500/20 transition-all flex items-center gap-2"
                  >
                    <Check size={14} /> Save Character
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* LOCATIONS PANEL */}
        {activeTab === 'locations' && (
          <div className="space-y-6">
            {!isAdding && !editingId ? (
              <>
                <div className="flex justify-between items-center bg-[#0c0e12] border border-slate-800 p-4 rounded-2xl shadow-lg">
                  <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest">Atmospheric Settings</span>
                  <button
                    onClick={() => setIsAdding(true)}
                    className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-mono text-xs font-black uppercase tracking-wider px-5 py-2.5 rounded-xl cursor-pointer shadow-lg shadow-amber-500/20 transition-all"
                  >
                    <Plus size={14} /> Add Setting
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {(!bible.locations || bible.locations.length === 0) ? (
                    <div className="col-span-full border border-dashed border-slate-800 rounded-3xl p-12 text-center text-slate-500 text-xs font-mono">
                      No locations saved yet. Click 'Add Setting' to outline your worlds.
                    </div>
                  ) : (
                    bible.locations.map(loc => (
                      <div key={loc.id} className="bg-[#0c0e12] border border-slate-800 hover:border-slate-700 rounded-3xl p-6 relative shadow-xl space-y-4 transition-all">
                        <div className="absolute top-5 right-5 flex items-center gap-2">
                          <button
                            onClick={() => {
                              setEditingId(loc.id);
                              setLocForm(loc);
                            }}
                            className="p-2 bg-[#12151c] hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 rounded-xl cursor-pointer transition-all"
                          >
                            <Edit size={14} />
                          </button>
                          <button
                            onClick={() => handleDeleteItem('locations', loc.id)}
                            className="p-2 bg-[#12151c] hover:bg-rose-950/30 text-slate-400 hover:text-rose-400 border border-slate-800 rounded-xl cursor-pointer transition-all"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>

                        <div className="flex items-center gap-3">
                          <h3 className="text-base font-bold text-slate-100 font-serif tracking-wide">{loc.name}</h3>
                          <span className="text-[10px] font-mono uppercase font-bold px-2.5 py-0.5 rounded-lg bg-emerald-950/60 border border-emerald-500/30 text-emerald-300">
                            {loc.type || 'Setting'}
                          </span>
                        </div>

                        {loc.atmosphere && (
                          <div className="text-xs text-slate-300 font-sans leading-relaxed">
                            <strong className="font-mono text-slate-400 uppercase text-[10px] block mb-1">Atmosphere:</strong> {loc.atmosphere}
                          </div>
                        )}
                        {loc.sensoryDetails && (
                          <div className="text-xs text-slate-300 font-sans leading-relaxed pt-2 border-t border-slate-800">
                            <strong className="font-mono text-slate-400 uppercase text-[10px] block mb-1">Sensory Details:</strong> {loc.sensoryDetails}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </>
            ) : (
              <div className="bg-[#0c0e12] border border-slate-800 rounded-3xl p-8 space-y-5 shadow-2xl">
                <h3 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-widest pb-3 border-b border-slate-800">
                  {editingId ? 'Edit Setting Sheet' : 'Create Setting Sheet'}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-widest mb-1 font-bold">Location Name</label>
                    <input
                      type="text"
                      value={locForm.name || ''}
                      onChange={e => setLocForm(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full bg-[#12151c] border border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-200 outline-none focus:border-amber-500 shadow-inner"
                      placeholder="e.g. WashBizHub Facility"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-widest mb-1 font-bold">Setting Type</label>
                    <input
                      type="text"
                      value={locForm.type || ''}
                      onChange={e => setLocForm(prev => ({ ...prev, type: e.target.value }))}
                      className="w-full bg-[#12151c] border border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-200 outline-none focus:border-amber-500 shadow-inner"
                      placeholder="e.g. Commercial Store, Office"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-widest mb-1 font-bold">Vibe & Atmosphere</label>
                  <textarea
                    value={locForm.atmosphere || ''}
                    onChange={e => setLocForm(prev => ({ ...prev, atmosphere: e.target.value }))}
                    className="w-full h-20 bg-[#12151c] border border-slate-800 rounded-xl p-4 text-xs text-slate-200 outline-none focus:border-amber-500 shadow-inner resize-none font-sans"
                    placeholder="e.g. Bright fluorescent lights, humming commercial extractors..."
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-widest mb-1 font-bold">Sensory Details</label>
                  <textarea
                    value={locForm.sensoryDetails || ''}
                    onChange={e => setLocForm(prev => ({ ...prev, sensoryDetails: e.target.value }))}
                    className="w-full h-20 bg-[#12151c] border border-slate-800 rounded-xl p-4 text-xs text-slate-200 outline-none focus:border-amber-500 shadow-inner resize-none font-sans"
                    placeholder="The warmth of steam dryers, the clink of stainless steel drums..."
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-widest mb-1 font-bold">Thematic Significance</label>
                  <textarea
                    value={locForm.significance || ''}
                    onChange={e => setLocForm(prev => ({ ...prev, significance: e.target.value }))}
                    className="w-full h-20 bg-[#12151c] border border-slate-800 rounded-xl p-4 text-xs text-slate-200 outline-none focus:border-amber-500 shadow-inner resize-none font-sans"
                    placeholder="What major plot developments happen here?"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                  <button
                    onClick={resetForm}
                    className="px-5 py-3 rounded-xl border border-slate-800 text-slate-400 font-mono text-xs font-bold hover:bg-slate-800 hover:text-slate-200 cursor-pointer transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveLocation}
                    className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-mono text-xs font-black uppercase tracking-wider rounded-xl cursor-pointer shadow-xl shadow-amber-500/20 transition-all flex items-center gap-2"
                  >
                    <Check size={14} /> Save Setting
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* SCENE CARDS PANEL */}
        {activeTab === 'scenes' && (
          <div className="space-y-6">
            {!isAdding && !editingId ? (
              <>
                <div className="flex justify-between items-center bg-[#0c0e12] border border-slate-800 p-4 rounded-2xl shadow-lg">
                  <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest">Story Outline & Scene Cards</span>
                  <button
                    onClick={() => setIsAdding(true)}
                    className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-mono text-xs font-black uppercase tracking-wider px-5 py-2.5 rounded-xl cursor-pointer shadow-lg shadow-amber-500/20 transition-all"
                  >
                    <Plus size={14} /> Add Scene Card
                  </button>
                </div>

                <div className="space-y-4">
                  {(!bible.scenes || bible.scenes.length === 0) ? (
                    <div className="border border-dashed border-slate-800 rounded-3xl p-12 text-center text-slate-500 text-xs font-mono">
                      No scene cards. Outline your book chapter-by-chapter using Scene Cards.
                    </div>
                  ) : (
                    bible.scenes.map(scene => {
                      const chap = chapters.find(c => c.id === scene.chapterId);
                      return (
                        <div key={scene.id} className="bg-[#0c0e12] border border-slate-800 hover:border-slate-700 rounded-3xl p-6 relative shadow-xl space-y-4 transition-all">
                          <div className="absolute top-5 right-5 flex items-center gap-2">
                            <button
                              onClick={() => {
                                setEditingId(scene.id);
                                setSceneForm(scene);
                              }}
                              className="p-2 bg-[#12151c] hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 rounded-xl cursor-pointer transition-all"
                            >
                              <Edit size={14} />
                            </button>
                            <button
                              onClick={() => handleDeleteItem('scenes', scene.id)}
                              className="p-2 bg-[#12151c] hover:bg-rose-950/30 text-slate-400 hover:text-rose-400 border border-slate-800 rounded-xl cursor-pointer transition-all"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>

                          <div className="flex flex-wrap items-center gap-3">
                            <h3 className="text-base font-bold text-slate-100 font-serif tracking-wide">{scene.title}</h3>
                            {chap && (
                              <span className="text-[10px] font-mono bg-amber-950/60 border border-amber-500/30 text-amber-300 font-bold px-2.5 py-1 rounded-xl">
                                {chap.title}
                              </span>
                            )}
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono text-slate-400 bg-[#12151c] border border-slate-800 p-3.5 rounded-2xl shadow-inner">
                            <div><strong className="text-slate-200">POV:</strong> {scene.pov || 'Unassigned'}</div>
                            <div><strong className="text-slate-200">Setting:</strong> {scene.setting || 'Unassigned'}</div>
                            <div><strong className="text-slate-200">Conflict:</strong> {scene.conflict || 'Unassigned'}</div>
                          </div>

                          <p className="text-xs text-slate-300 font-sans leading-relaxed">
                            {scene.summary}
                          </p>
                        </div>
                      );
                    })
                  )}
                </div>
              </>
            ) : (
              <div className="bg-[#0c0e12] border border-slate-800 rounded-3xl p-8 space-y-5 shadow-2xl">
                <h3 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-widest pb-3 border-b border-slate-800">
                  {editingId ? 'Edit Scene Card' : 'Create Scene Card'}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-widest mb-1 font-bold">Scene Title / Beat</label>
                    <input
                      type="text"
                      value={sceneForm.title || ''}
                      onChange={e => setSceneForm(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full bg-[#12151c] border border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-200 outline-none focus:border-amber-500 shadow-inner"
                      placeholder="e.g. The 400G Extraction Test"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-widest mb-1 font-bold">Link to Chapter</label>
                    <select
                      value={sceneForm.chapterId || ''}
                      onChange={e => setSceneForm(prev => ({ ...prev, chapterId: e.target.value }))}
                      className="w-full bg-[#12151c] border border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-200 outline-none focus:border-amber-500 cursor-pointer shadow-inner"
                    >
                      <option value="">-- select chapter --</option>
                      {chapters.map(c => (
                        <option key={c.id} value={c.id}>{c.title}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-widest mb-1 font-bold">POV Character</label>
                    <input
                      type="text"
                      value={sceneForm.pov || ''}
                      onChange={e => setSceneForm(prev => ({ ...prev, pov: e.target.value }))}
                      className="w-full bg-[#12151c] border border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-200 outline-none focus:border-amber-500 shadow-inner"
                      placeholder="e.g. Nicholas"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-widest mb-1 font-bold">Setting Used</label>
                    <input
                      type="text"
                      value={sceneForm.setting || ''}
                      onChange={e => setSceneForm(prev => ({ ...prev, setting: e.target.value }))}
                      className="w-full bg-[#12151c] border border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-200 outline-none focus:border-amber-500 shadow-inner"
                      placeholder="e.g. Main Floor"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-widest mb-1 font-bold">Core Conflict</label>
                    <input
                      type="text"
                      value={sceneForm.conflict || ''}
                      onChange={e => setSceneForm(prev => ({ ...prev, conflict: e.target.value }))}
                      className="w-full bg-[#12151c] border border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-200 outline-none focus:border-amber-500 shadow-inner"
                      placeholder="e.g. Equipment failure"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-widest mb-1 font-bold">Scene Summary / Event Beats</label>
                  <textarea
                    value={sceneForm.summary || ''}
                    onChange={e => setSceneForm(prev => ({ ...prev, summary: e.target.value }))}
                    className="w-full h-28 bg-[#12151c] border border-slate-800 rounded-xl p-4 text-xs text-slate-200 outline-none focus:border-amber-500 shadow-inner resize-none font-sans"
                    placeholder="Explain active dialogue points, action transitions, or character developments..."
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                  <button
                    onClick={resetForm}
                    className="px-5 py-3 rounded-xl border border-slate-800 text-slate-400 font-mono text-xs font-bold hover:bg-slate-800 hover:text-slate-200 cursor-pointer transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveScene}
                    className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-mono text-xs font-black uppercase tracking-wider rounded-xl cursor-pointer shadow-xl shadow-amber-500/20 transition-all flex items-center gap-2"
                  >
                    <Check size={14} /> Save Scene
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TIMELINE PANEL */}
        {activeTab === 'timeline' && (
          <div className="space-y-6">
            {!isAdding && !editingId ? (
              <>
                <div className="flex justify-between items-center bg-[#0c0e12] border border-slate-800 p-4 rounded-2xl shadow-lg">
                  <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest">Chronological Timeline Events</span>
                  <button
                    onClick={() => setIsAdding(true)}
                    className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-mono text-xs font-black uppercase tracking-wider px-5 py-2.5 rounded-xl cursor-pointer shadow-lg shadow-amber-500/20 transition-all"
                  >
                    <Plus size={14} /> Add Event
                  </button>
                </div>

                <div className="relative border-l-2 border-amber-500/40 pl-6 ml-3 space-y-6">
                  {(!bible.timeline || bible.timeline.length === 0) ? (
                    <div className="border border-dashed border-slate-800 rounded-3xl p-12 text-center text-slate-500 text-xs font-mono ml-[-26px]">
                      Timeline is currently empty. Chronologize your plot events here.
                    </div>
                  ) : (
                    [...(bible.timeline || [])].map((evt) => (
                      <div key={evt.id} className="relative bg-[#0c0e12] border border-slate-800 hover:border-slate-700 rounded-3xl p-6 shadow-xl transition-all">
                        <span className="absolute left-[-31px] top-6 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 ring-4 ring-[#07080a]">
                          <Bookmark size={8} className="text-slate-950 font-bold" />
                        </span>

                        <div className="absolute top-5 right-5 flex items-center gap-2">
                          <button
                            onClick={() => {
                              setEditingId(evt.id);
                              setTimelineForm(evt);
                            }}
                            className="p-2 bg-[#12151c] hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 rounded-xl cursor-pointer transition-all"
                          >
                            <Edit size={14} />
                          </button>
                          <button
                            onClick={() => handleDeleteItem('timeline', evt.id)}
                            className="p-2 bg-[#12151c] hover:bg-rose-950/30 text-slate-400 hover:text-rose-400 border border-slate-800 rounded-xl cursor-pointer transition-all"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>

                        <div className="flex flex-wrap items-center gap-3 mb-2">
                          <span className="text-[10px] font-mono font-bold text-amber-300 bg-amber-950/60 border border-amber-500/30 px-3 py-1 rounded-xl">
                            {evt.timeLabel}
                          </span>
                          <h3 className="text-base font-bold text-slate-100 font-serif tracking-wide">{evt.title}</h3>
                        </div>

                        <p className="text-xs text-slate-300 font-sans leading-relaxed">
                          {evt.description}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </>
            ) : (
              <div className="bg-[#0c0e12] border border-slate-800 rounded-3xl p-8 space-y-5 shadow-2xl">
                <h3 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-widest pb-3 border-b border-slate-800">
                  {editingId ? 'Edit Timeline Event' : 'Create Timeline Event'}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-widest mb-1 font-bold">Time Stamp / Period</label>
                    <input
                      type="text"
                      value={timelineForm.timeLabel || ''}
                      onChange={e => setTimelineForm(prev => ({ ...prev, timeLabel: e.target.value }))}
                      className="w-full bg-[#12151c] border border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-200 outline-none focus:border-amber-500 shadow-inner"
                      placeholder="e.g. Act I (Opening)"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-widest mb-1 font-bold">Event Title</label>
                    <input
                      type="text"
                      value={timelineForm.title || ''}
                      onChange={e => setTimelineForm(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full bg-[#12151c] border border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-200 outline-none focus:border-amber-500 shadow-inner"
                      placeholder="e.g. Initial operational audit"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-widest mb-1 font-bold">Event Description & Action</label>
                  <textarea
                    value={timelineForm.description || ''}
                    onChange={e => setTimelineForm(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full h-28 bg-[#12151c] border border-slate-800 rounded-xl p-4 text-xs text-slate-200 outline-none focus:border-amber-500 shadow-inner resize-none font-sans"
                    placeholder="Describe what occurs and how it advances chronology..."
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                  <button
                    onClick={resetForm}
                    className="px-5 py-3 rounded-xl border border-slate-800 text-slate-400 font-mono text-xs font-bold hover:bg-slate-800 hover:text-slate-200 cursor-pointer transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveTimeline}
                    className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-mono text-xs font-black uppercase tracking-wider rounded-xl cursor-pointer shadow-xl shadow-amber-500/20 transition-all flex items-center gap-2"
                  >
                    <Check size={14} /> Save Event
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* STORY ARCS TAB */}
        {activeTab === 'arcs' && (
          <div className="space-y-6">
            <div className="bg-[#0c0e12] border border-slate-800 rounded-3xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
              <div>
                <h3 className="text-xs font-mono font-bold text-slate-100 uppercase tracking-widest flex items-center gap-2 mb-1">
                  <Sparkles size={16} className="text-amber-400" />
                  <span>Plot Structure Architect</span>
                </h3>
                <p className="text-xs text-slate-400 font-sans">
                  Choose a legendary narrative framework to plan your plot progression beat-by-beat.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedArcTemplate('hero')}
                  className={`px-4 py-2.5 text-xs font-mono uppercase tracking-wider rounded-xl border transition-all cursor-pointer font-bold ${selectedArcTemplate === 'hero' ? 'bg-amber-500 border-amber-400 text-slate-950 font-black shadow-lg shadow-amber-500/20' : 'bg-[#12151c] border-slate-800 text-slate-400 hover:text-slate-200'}`}
                >
                  Hero's Journey
                </button>
                <button
                  onClick={() => setSelectedArcTemplate('savethecat')}
                  className={`px-4 py-2.5 text-xs font-mono uppercase tracking-wider rounded-xl border transition-all cursor-pointer font-bold ${selectedArcTemplate === 'savethecat' ? 'bg-amber-500 border-amber-400 text-slate-950 font-black shadow-lg shadow-amber-500/20' : 'bg-[#12151c] border-slate-800 text-slate-400 hover:text-slate-200'}`}
                >
                  Save the Cat!
                </button>
              </div>
            </div>

            <div className="flex justify-between items-center bg-[#0c0e12] border border-slate-800 p-4 rounded-2xl shadow-md">
              <span className="text-xs font-mono text-slate-400">
                Active Framework: <strong className="text-slate-200 font-bold">{selectedArcTemplate === 'hero' ? "The Hero's Journey (12 Stages)" : "Save the Cat! 15-Beats"}</strong>
              </span>
              <button
                onClick={handleAutoGenerateOutlineFromArcs}
                className="flex items-center gap-2 text-xs font-mono font-bold bg-emerald-950/60 hover:bg-emerald-900/50 text-emerald-300 border border-emerald-500/30 px-4 py-2 rounded-xl transition-all shadow-sm cursor-pointer"
              >
                <Sparkles size={14} className="text-emerald-400" />
                <span>Convert to Scene Outline</span>
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {(selectedArcTemplate === 'hero' ? heroBeats : saveTheCatBeats).map((beat) => (
                <div key={beat.key} className="bg-[#0c0e12] border border-slate-800 hover:border-slate-700 rounded-3xl p-6 shadow-xl space-y-3 transition-all">
                  <div>
                    <h4 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-widest">{beat.name}</h4>
                    <p className="text-xs text-slate-400 font-sans italic mt-1">{beat.desc}</p>
                  </div>
                  <textarea
                    value={customArcBeats[beat.key] || ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      setCustomArcBeats(prev => ({ ...prev, [beat.key]: val }));
                    }}
                    className="w-full h-20 bg-[#12151c] border border-slate-800 rounded-2xl p-4 text-xs text-slate-200 outline-none focus:border-amber-500 shadow-inner resize-none font-sans custom-scrollbar"
                    placeholder={`Outline your draft ideas for the ${beat.name} stage here...`}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* On-Demand Infinite Heroes Modal */}
      <InfiniteHeroesModal
        isOpen={isHeroModalOpen}
        onClose={() => setIsHeroModalOpen(false)}
      />
    </aside>
  );
}