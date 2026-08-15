import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { idbStorage } from './idbStorage';
import { VoiceProfile } from '../types';

interface VoiceState {
  profiles: VoiceProfile[];
  activeProfileId: string;
  
  // Actions
  addProfile: (profile: Omit<VoiceProfile, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateProfile: (id: string, updates: Partial<VoiceProfile>) => void;
  deleteProfile: (id: string) => void;
  setActiveProfile: (id: string) => void;
}

const defaultProfiles: VoiceProfile[] = [
  {
    id: 'profile-author',
    name: 'Author & Industry Authority',
    tone: 'Authoritative, direct, analytical, yet engaging and practical.',
    vocabulary: ['diagnostics', 'framework', 'optimization', 'execution', 'leverage', 'scale'],
    pacing: 'Brisk, punchy sentences interspersed with deep explanatory clauses.',
    persona: 'A seasoned entrepreneur and operator writing from hard-won operational experience.',
    pov: 'First-person authoritative / Direct address to the reader.',
    dialogue: 'Natural, grounded, avoiding overly stylized theatrical flourishes.',
    isPrimary: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'profile-novelist',
    name: 'Cinematic Novelist',
    tone: 'Atmospheric, visceral, tense, and character-driven.',
    vocabulary: ['shadow', 'gleam', 'echo', 'friction', 'silence', 'resolve'],
    pacing: 'Dynamic rhythmic shifts matching emotional tension.',
    persona: 'Immersive storyteller focusing on sensory grounding and subtext.',
    pov: 'Third-person limited / Deep point of view.',
    dialogue: 'Sharp, subtext-heavy, authentic to character background.',
    isPrimary: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
];

export const useVoiceStore = create<VoiceState>()(
  persist(
    (set) => ({
      profiles: defaultProfiles,
      activeProfileId: 'profile-author',

      addProfile: (newProfileData) => 
        set((state) => {
          const id = `profile-${Date.now()}`;
          const now = new Date().toISOString();
          const newProfile: VoiceProfile = {
            ...newProfileData,
            id,
            createdAt: now,
            updatedAt: now,
          };
          return { profiles: [...state.profiles, newProfile] };
        }),

      updateProfile: (id, updates) =>
        set((state) => ({
          profiles: state.profiles.map((p) => 
            p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p
          ),
        })),

      deleteProfile: (id) =>
        set((state) => ({
          profiles: state.profiles.filter((p) => p.id !== id),
        })),

      setActiveProfile: (id) => set({ activeProfileId: id }),
    }),
    {
      name: 'syllabexa-voice-storage',
      storage: idbStorage,
    }
  )
);