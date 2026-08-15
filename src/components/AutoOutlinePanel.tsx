import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { idbStorage } from '../store/idbStorage';

export interface CrosswordEntry {
  id: string;
  word: string;
  clue: string;
}

export interface CrosswordCell {
  letter: string;
  number?: number;
  isBlack: boolean;
}

export interface WordSearchProject {
  id: string;
  title: string;
  theme: string;
  gridSize: number;
  words: string[];
  grid: string[][];
  solution: boolean[][];
}

export interface CrosswordProject {
  id: string;
  title: string;
  entries: CrosswordEntry[];
  grid: CrosswordCell[][];
  gridSize: number;
}

interface PuzzleState {
  wordSearch: WordSearchProject;
  crossword: CrosswordProject;
  
  isGeneratingWordSearch: boolean;
  isGeneratingCrossword: boolean;
  
  updateWordSearchTheme: (theme: string, words: string[]) => void;
  generateWordSearchGrid: () => void;
  
  addCrosswordEntry: (word: string, clue: string) => void;
  removeCrosswordEntry: (id: string) => void;
  generateCrosswordLayout: () => void;
}

let activeWordSearchWorker: Worker | null = null;
let activeCrosswordWorker: Worker | null = null;

export const usePuzzleStore = create<PuzzleState>()(
  persist(
    (set, get) => ({
      wordSearch: {
        id: 'ws-1',
        title: 'Laundromat Operations Word Search',
        theme: 'Laundromat Business & Equipment',
        gridSize: 12,
        words: ['EXTRACTOR', 'DEXTER', 'COINSLIDE', 'BUBBLE', 'UTILITY', 'BOILER'],
        grid: Array(12).fill(0).map(() => Array(12).fill('')),
        solution: Array(12).fill(0).map(() => Array(12).fill(false))
      },
      crossword: {
        id: 'cw-1',
        title: 'The WashBizHub Cryptic Crossword',
        gridSize: 15,
        grid: Array(15).fill(0).map(() => Array(15).fill({ isBlack: true, letter: '' })),
        entries: [
          { id: 'e-1', word: 'EXTRACTOR', clue: 'High-speed machine that spins water out of laundry.' },
          { id: 'e-2', word: 'BOILER', clue: 'Provides hot water and commercial heating.' },
          { id: 'e-3', word: 'DEXTER', clue: 'Renowned commercial laundry equipment manufacturer.' }
        ]
      },

      isGeneratingWordSearch: false,
      isGeneratingCrossword: false,

      updateWordSearchTheme: (theme, words) => {
        set((state) => ({
          wordSearch: { ...state.wordSearch, theme, words }
        }));
        get().generateWordSearchGrid();
      },

      generateWordSearchGrid: () => {
        set({ isGeneratingWordSearch: true });
        
        if (activeWordSearchWorker) {
          activeWordSearchWorker.terminate();
        }
        
        activeWordSearchWorker = new Worker(new URL('../workers/puzzleWorker.ts', import.meta.url), { type: 'module' });
        
        activeWordSearchWorker.onmessage = (e) => {
          if (e.data.status === 'success') {
            set((state) => ({
              wordSearch: { ...state.wordSearch, grid: e.data.grid, solution: e.data.solution },
              isGeneratingWordSearch: false
            }));
          } else {
            console.error("Word Search generation failed");
            set({ isGeneratingWordSearch: false });
          }
          activeWordSearchWorker?.terminate();
          activeWordSearchWorker = null;
        };

        // PRACTICAL FIX: Deep-clone payload to prevent DataCloneError with proxies/non-cloneable properties
        activeWordSearchWorker.postMessage({ 
          type: 'GENERATE_WORD_SEARCH', 
          payload: JSON.parse(JSON.stringify(get().wordSearch)) 
        });
      },

      addCrosswordEntry: (word, clue) => {
        set((state) => ({
          crossword: {
            ...state.crossword,
            entries: [...state.crossword.entries, { id: `e-${Date.now()}`, word: word.toUpperCase(), clue }]
          }
        }));
        get().generateCrosswordLayout();
      },

      removeCrosswordEntry: (id) => {
        set((state) => ({
          crossword: {
            ...state.crossword,
            entries: state.crossword.entries.filter(e => e.id !== id)
          }
        }));
        get().generateCrosswordLayout();
      },

      generateCrosswordLayout: () => {
        set({ isGeneratingCrossword: true });
        
        if (activeCrosswordWorker) {
          activeCrosswordWorker.terminate();
        }
        
        activeCrosswordWorker = new Worker(new URL('../workers/puzzleWorker.ts', import.meta.url), { type: 'module' });
        
        activeCrosswordWorker.onmessage = (e) => {
          if (e.data.status === 'success') {
            set((state) => ({
              crossword: { ...state.crossword, grid: e.data.grid },
              isGeneratingCrossword: false
            }));
          } else {
            console.error("Crossword generation failed");
            set({ isGeneratingCrossword: false });
          }
          activeCrosswordWorker?.terminate();
          activeCrosswordWorker = null;
        };

        // PRACTICAL FIX: Deep-clone payload to prevent DataCloneError with proxies/non-cloneable properties
        activeCrosswordWorker.postMessage({ 
          type: 'GENERATE_CROSSWORD', 
          payload: JSON.parse(JSON.stringify(get().crossword)) 
        });
      },
    }),
    {
      name: 'syllabexa-puzzle-storage',
      storage: idbStorage,
      partialize: (state) => {
        const { isGeneratingWordSearch, isGeneratingCrossword, ...persistentState } = state;
        return persistentState;
      }
    }
  )
);