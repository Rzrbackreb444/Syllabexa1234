import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { idbStorage } from './idbStorage';

export interface SceneCard {
  id: string;
  title: string;
  objective: string;
  wordCountTarget: number;
  status: 'pending' | 'drafting' | 'completed';
}

export interface ChapterOutline {
  id: string;
  chapterNumber: number;
  title: string;
  summary: string;
  scenes: SceneCard[];
}

interface GeneratorState {
  outline: ChapterOutline[];
  isGeneratingOutline: boolean;
  isGeneratingChapter: boolean;
  
  generateMacroOutline: (premise: string, targetChapters: number) => Promise<void>;
  generateSceneProse: (chapterId: string, sceneId: string) => Promise<string>;
}

export const useBookGenerator = create<GeneratorState>()(
  persist(
    (set, get) => ({
      outline: [],
      isGeneratingOutline: false,
      isGeneratingChapter: false,

      generateMacroOutline: async (premise, targetChapters) => {
        set({ isGeneratingOutline: true });
        
        // Simulate structural architecture generation based on project premise
        setTimeout(() => {
          const mockOutline: ChapterOutline[] = Array.from({ length: targetChapters }, (_, i) => ({
            id: `chap-${i + 1}`,
            chapterNumber: i + 1,
            title: `Chapter ${i + 1}: Operational Foundations`,
            summary: `Establish core principles regarding ${premise}, focusing on real-world constraints and systematic execution.`,
            scenes: [
              { id: `scene-${i}-1`, title: 'The Core Dilemma', objective: 'Define the primary operational hurdle.', wordCountTarget: 1200, status: 'pending' },
              { id: `scene-${i}-2`, title: 'Systemic Resolution', objective: 'Execute tactical framework to overcome the hurdle.', wordCountTarget: 1500, status: 'pending' }
            ]
          }));

          set({ outline: mockOutline, isGeneratingOutline: false });
        }, 1200);
      },

      generateSceneProse: async (chapterId, sceneId) => {
        set({ isGeneratingChapter: true });
        
        // Simulate isolated, high-density scene drafting with canon grounding
        return new Promise((resolve) => {
          setTimeout(() => {
            const draftedProse = "Operational resilience is built on absolute adherence to structural fundamentals. When equipment stress reaches threshold parameters, standard diagnostics fail if baseline telemetry is ignored...";
            
            set((state) => ({
              outline: state.outline.map(chap => 
                chap.id === chapterId 
                  ? {
                      ...chap,
                      scenes: chap.scenes.map(sc => sc.id === sceneId ? { ...sc, status: 'completed' } : sc)
                    }
                  : chap
              ),
              isGeneratingChapter: false
            }));

            resolve(draftedProse);
          }, 1500);
        });
      }
    }),
    {
      name: 'syllabexa-book-generator',
      storage: idbStorage
    }
  )
);