import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { idbStorage } from './idbStorage';
import { CharacterSheet, LocationSheet, SceneCard, TimelineEvent } from '../types';

interface BibleState {
  characters: CharacterSheet[];
  locations: LocationSheet[];
  scenes: SceneCard[];
  timeline: TimelineEvent[];

  // Actions
  addCharacter: (character: Omit<CharacterSheet, 'id'>) => void;
  updateCharacter: (id: string, updates: Partial<CharacterSheet>) => void;
  deleteCharacter: (id: string) => void;

  addLocation: (location: Omit<LocationSheet, 'id'>) => void;
  updateLocation: (id: string, updates: Partial<LocationSheet>) => void;
  deleteLocation: (id: string) => void;

  addScene: (scene: Omit<SceneCard, 'id'>) => void;
  updateScene: (id: string, updates: Partial<SceneCard>) => void;
  deleteScene: (id: string) => void;

  addTimelineEvent: (event: Omit<TimelineEvent, 'id'>) => void;
  deleteTimelineEvent: (id: string) => void;
}

export const useBibleStore = create<BibleState>()(
  persist(
    (set) => ({
      characters: [
        {
          id: 'char-1',
          name: 'Lawrence "Laundromat Larry" Larsen',
          role: 'protagonist',
          traits: ['Methodical', 'Relentless operator', 'Mentor'],
          backstory: 'Built a 20-store coin laundry portfolio from scratch over three decades.',
          appearance: '6 feet 3 inches, weathered hands, always wearing a faded facility jacket.',
          arc: 'Transitions from solo operator to industry icon training the next generation.',
          notes: 'Key anchor for operational wisdom chapters.'
        }
      ],
      locations: [
        {
          id: 'loc-1',
          name: 'WashBizHub Flagship Facility',
          type: 'Commercial Laundromat',
          atmosphere: 'Humming extractors, pristine folding stations, smell of fresh ozone and bleach.',
          sensoryDetails: 'Constant bass hum of 400G centrifugal spin cycles.',
          significance: 'The testing ground for all automation frameworks.',
          notes: 'Located in the downtown district.'
        }
      ],
      scenes: [
        {
          id: 'scene-1',
          title: 'The 400G Centrifugal Awakening',
          chapterId: 'chap-1',
          summary: 'Larry explains utility drop-down management and water efficiency ratios.',
          pov: 'First-person authoritative',
          conflict: 'Balancing utility spikes against fluctuating coin-vending revenue.',
          setting: 'WashBizHub Flagship Facility'
        }
      ],
      timeline: [
        {
          id: 'time-1',
          timeLabel: 'Year 1: Acquisition',
          title: 'Purchasing the First Failing Store',
          description: 'Acquiring an unattended facility with broken Dexter dryers and fixing the coin slides.',
          chaptersInvolved: ['chap-1']
        }
      ],

      addCharacter: (char) => set((state) => ({ characters: [...state.characters, { ...char, id: `char-${Date.now()}` }] })),
      updateCharacter: (id, updates) => set((state) => ({ characters: state.characters.map(c => c.id === id ? { ...c, ...updates } : c) })),
      deleteCharacter: (id) => set((state) => ({ characters: state.characters.filter(c => c.id !== id) })),

      addLocation: (loc) => set((state) => ({ locations: [...state.locations, { ...loc, id: `loc-${Date.now()}` }] })),
      updateLocation: (id, updates) => set((state) => ({ locations: state.locations.map(l => l.id === id ? { ...l, ...updates } : l) })),
      deleteLocation: (id) => set((state) => ({ locations: state.locations.filter(l => l.id !== id) })),

      addScene: (scene) => set((state) => ({ scenes: [...state.scenes, { ...scene, id: `scene-${Date.now()}` }] })),
      updateScene: (id, updates) => set((state) => ({ scenes: state.scenes.map(s => s.id === id ? { ...s, ...updates } : s) })),
      deleteScene: (id) => set((state) => ({ scenes: state.scenes.filter(s => s.id !== id) })),

      addTimelineEvent: (event) => set((state) => ({ timeline: [...state.timeline, { ...event, id: `time-${Date.now()}` }] })),
      deleteTimelineEvent: (id) => set((state) => ({ timeline: state.timeline.filter(t => t.id !== id) })),
    }),
    {
      name: 'syllabexa-bible-storage',
      storage: idbStorage,
    }
  )
);