import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { idbStorage } from './idbStorage';

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
  
  updateWordSearchTheme: (theme: string, words: string[]) => void;
  generateWordSearchGrid: () => void;
  
  addCrosswordEntry: (word: string, clue: string) => void;
  removeCrosswordEntry: (id: string) => void;
  generateCrosswordLayout: () => void;
}

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

      updateWordSearchTheme: (theme, words) => {
        set((state) => ({
          wordSearch: { ...state.wordSearch, theme, words }
        }));
        get().generateWordSearchGrid();
      },

      generateWordSearchGrid: () => {
        const { words } = get().wordSearch;
        const gridSize = Number(get().wordSearch.gridSize) || 12;
        const grid = Array(gridSize).fill(0).map(() => Array(gridSize).fill(''));
        const solution = Array(gridSize).fill(0).map(() => Array(gridSize).fill(false));
        const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const directions = [[0,1], [1,0], [1,1]];

        words.forEach((w) => {
          const cleanWord = w.toUpperCase().replace(/[^A-Z]/g, '');
          if (cleanWord.length > gridSize) return;
          
          let placed = false;
          let attempts = 0;
          while (!placed && attempts < 100) {
            const dir = directions[Math.floor(Math.random() * directions.length)];
            const row = Math.floor(Math.random() * gridSize);
            const col = Math.floor(Math.random() * gridSize);
            
            const endRow = row + dir[0] * (cleanWord.length - 1);
            const endCol = col + dir[1] * (cleanWord.length - 1);
            
            if (endRow < gridSize && endCol < gridSize) {
              let canPlace = true;
              for (let i = 0; i < cleanWord.length; i++) {
                const r = row + dir[0] * i;
                const c = col + dir[1] * i;
                if (grid[r][c] !== '' && grid[r][c] !== cleanWord[i]) {
                  canPlace = false;
                  break;
                }
              }
              
              if (canPlace) {
                for (let i = 0; i < cleanWord.length; i++) {
                  const r = row + dir[0] * i;
                  const c = col + dir[1] * i;
                  grid[r][c] = cleanWord[i];
                  solution[r][c] = true;
                }
                placed = true;
              }
            }
            attempts++;
          }
        });

        for (let r = 0; r < gridSize; r++) {
          for (let c = 0; c < gridSize; c++) {
            if (!grid[r][c]) {
              grid[r][c] = alphabet[Math.floor(Math.random() * alphabet.length)];
            }
          }
        }

        set((state) => ({
          wordSearch: { ...state.wordSearch, grid, solution }
        }));
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
        const { entries } = get().crossword;
        const gridSize = Number(get().crossword.gridSize) || 15;
        const grid: CrosswordCell[][] = Array(gridSize).fill(0).map(() => Array(gridSize).fill(null).map(() => ({ isBlack: true, letter: '' })));
        
        if (entries.length === 0) {
           set((state) => ({ crossword: { ...state.crossword, grid } }));
           return;
        }

        const sortedEntries = [...entries].sort((a, b) => b.word.length - a.word.length);
        
        const firstWord = sortedEntries[0]?.word || '';
        if (!firstWord) {
           set((state) => ({ crossword: { ...state.crossword, grid } }));
           return;
        }
        const startRow = Math.max(0, Math.min(gridSize - 1, Math.floor(gridSize / 2) || 0));
        const startCol = Math.max(0, Math.floor((gridSize - firstWord.length) / 2) || 0);
        
        let numberCounter = 1;
        
        for (let i = 0; i < firstWord.length; i++) {
          grid[startRow][startCol + i] = { isBlack: false, letter: firstWord[i], number: i === 0 ? numberCounter : undefined };
        }
        numberCounter++;
        
        for (let i = 1; i < sortedEntries.length; i++) {
           const word = sortedEntries[i].word;
           let placed = false;
           
           for (let r = 0; r < gridSize && !placed; r++) {
             for (let c = 0; c < gridSize && !placed; c++) {
               if (!grid[r][c].isBlack) {
                 const intersectingLetter = grid[r][c].letter;
                 const indexInWord = word.indexOf(intersectingLetter);
                 
                 if (indexInWord !== -1) {
                   const vStartRow = r - indexInWord;
                   if (vStartRow >= 0 && vStartRow + word.length <= gridSize) {
                      let canPlace = true;
                      for (let j = 0; j < word.length; j++) {
                         if (j === indexInWord) continue;
                         const checkRow = vStartRow + j;
                         if (grid[checkRow][c] && !grid[checkRow][c].isBlack) {
                           canPlace = false;
                           break;
                         }
                      }
                      if (canPlace) {
                         for (let j = 0; j < word.length; j++) {
                           const targetRow = vStartRow + j;
                           if (targetRow < 0 || targetRow >= gridSize || c < 0 || c >= gridSize) continue;
                           grid[targetRow][c] = {
                             isBlack: false, 
                             letter: word[j],
                             number: grid[targetRow][c].number || (j === 0 ? numberCounter : undefined)
                           };
                         }
                         numberCounter++;
                         placed = true;
                      }
                   }
                 }
               }
             }
           }
        }
        
        set((state) => ({ crossword: { ...state.crossword, grid } }));
      },
    }),
    {
      name: 'syllabexa-puzzle-storage',
      // Reverting wrapping idbStorage
      storage: idbStorage,
    }
  )
);