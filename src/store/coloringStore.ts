import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { idbStorage } from './idbStorage';
import { ColoringBookProject, ColoringPage, CanvasStampItem, CanvasTextItem } from '../types';

export interface ExtendedColoringPage extends ColoringPage {
  aiPrompt?: string;
  isGenerating?: boolean;
  renderMode?: 'outline' | 'full_color';
  imageUrl?: string;
}

export interface ExtendedColoringBookProject extends Omit<ColoringBookProject, 'pages'> {
  pages: ExtendedColoringPage[];
}

interface ColoringState {
  project: ExtendedColoringBookProject;
  
  // Actions
  updateProjectMeta: (title: string, description: string, preset: 'letter' | 'square' | 'a4') => void;
  addPage: (layoutType?: 'portrait' | 'landscape') => void;
  selectPage: (id: string | null) => void;
  deletePage: (id: string) => void;
  updatePageBorder: (pageId: string, borderStyle: ColoringPage['borderStyle']) => void;
  setPageAiPrompt: (pageId: string, prompt: string) => void;
  generateAiOutline: (pageId: string, prompt: string) => void;
  toggleRenderMode: (pageId: string) => void;
  addStamp: (pageId: string, type: CanvasStampItem['type']) => void;
  removeStamp: (pageId: string, stampId: string) => void;
  addTextItem: (pageId: string, text: string) => void;
  removeTextItem: (pageId: string, textId: string) => void;
}

export const useColoringStore = create<ColoringState>()(
  persist(
    (set) => ({
      project: {
        id: 'cb-project-1',
        title: 'The Magical Laundromat Coloring Adventure',
        description: 'A whimsical journey through bubbly bubbles and friendly machines.',
        preset: 'letter',
        pages: [
          {
            id: 'page-1',
            title: 'Cover Page: Bubble Mountain',
            description: 'Main title coloring page',
            svgContent: '',
            stamps: [
              { id: 'stamp-1', type: 'bubble', x: 120, y: 150, scale: 1.5, rotation: 0 },
              { id: 'stamp-2', type: 'cute_cat', x: 300, y: 200, scale: 1.2, rotation: 15 },
            ],
            textItems: [
              { id: 'text-1', text: 'BUBBLE ADVENTURE', x: 200, y: 80, fontSize: 24, letterSpacing: 2, fontStyle: 'bubble_font', strokeWidth: 2, rotation: 0 }
            ],
            borderStyle: 'art_deco',
            fillHistory: {},
            layoutType: 'portrait',
            aiPrompt: 'Whimsical cartoon cat inside a giant washing machine bubble, thick black outlines, white background, no shading',
            renderMode: 'outline',
            imageUrl: 'https://images.unsplash.com/photo-1534361960057-19889db9621e?auto=format&fit=crop&w=600&q=80'
          }
        ],
        selectedPageId: 'page-1',
      },

      updateProjectMeta: (title, description, preset) =>
        set((state) => ({
          project: { ...state.project, title, description, preset }
        })),

      addPage: (layoutType = 'portrait') =>
        set((state) => {
          const newId = `page-${Date.now()}`;
          const newPage: ExtendedColoringPage = {
            id: newId,
            title: `Page ${state.project.pages.length + 1}`,
            description: 'AI-generated illustration canvas',
            svgContent: '',
            stamps: [],
            textItems: [],
            borderStyle: 'simple',
            fillHistory: {},
            layoutType,
            aiPrompt: '',
            renderMode: 'outline',
            isGenerating: false,
          };
          return {
            project: {
              ...state.project,
              pages: [...state.project.pages, newPage],
              selectedPageId: newId,
            }
          };
        }),

      selectPage: (id) =>
        set((state) => ({
          project: { ...state.project, selectedPageId: id }
        })),

      deletePage: (id) =>
        set((state) => {
          const remaining = state.project.pages.filter(p => p.id !== id);
          return {
            project: {
              ...state.project,
              pages: remaining,
              selectedPageId: remaining.length > 0 ? remaining[0].id : null,
            }
          };
        }),

      updatePageBorder: (pageId, borderStyle) =>
        set((state) => ({
          project: {
            ...state.project,
            pages: state.project.pages.map(p => p.id === pageId ? { ...p, borderStyle } : p)
          }
        })),

      setPageAiPrompt: (pageId, aiPrompt) =>
        set((state) => ({
          project: {
            ...state.project,
            pages: state.project.pages.map(p => p.id === pageId ? { ...p, aiPrompt } : p)
          }
        })),

      generateAiOutline: (pageId, prompt) => {
        set((state) => ({
          project: {
            ...state.project,
            pages: state.project.pages.map(p => p.id === pageId ? { ...p, isGenerating: true } : p)
          }
        }));

        setTimeout(() => {
          set((state) => ({
            project: {
              ...state.project,
              pages: state.project.pages.map(p => {
                if (p.id !== pageId) return p;
                return {
                  ...p,
                  isGenerating: false,
                  aiPrompt: prompt,
                  imageUrl: 'https://images.unsplash.com/photo-1543852786-1cf6624b9987?auto=format&fit=crop&w=600&q=80',
                };
              })
            }
          }));
        }, 1500);
      },

      toggleRenderMode: (pageId) =>
        set((state) => ({
          project: {
            ...state.project,
            pages: state.project.pages.map(p => {
              if (p.id !== pageId) return p;
              const nextMode = p.renderMode === 'outline' ? 'full_color' : 'outline';
              return { ...p, renderMode: nextMode };
            })
          }
        })),

      addStamp: (pageId, type) =>
        set((state) => ({
          project: {
            ...state.project,
            pages: state.project.pages.map(p => {
              if (p.id !== pageId) return p;
              const newStamp: CanvasStampItem = {
                id: `stamp-${Date.now()}`,
                type,
                x: 200 + Math.random() * 50,
                y: 200 + Math.random() * 50,
                scale: 1.5,
                rotation: 0,
              };
              return { ...p, stamps: [...p.stamps, newStamp] };
            })
          }
        })),

      removeStamp: (pageId, stampId) =>
        set((state) => ({
          project: {
            ...state.project,
            pages: state.project.pages.map(p => p.id === pageId ? { ...p, stamps: p.stamps.filter(s => s.id !== stampId) } : p)
          }
        })),

      addTextItem: (pageId, text) =>
        set((state) => ({
          project: {
            ...state.project,
            pages: state.project.pages.map(p => {
              if (p.id !== pageId) return p;
              const newText: CanvasTextItem = {
                id: `text-${Date.now()}`,
                text,
                x: 200,
                y: 400,
                fontSize: 18,
                letterSpacing: 1,
                fontStyle: 'default',
                strokeWidth: 1,
                rotation: 0,
              };
              return { ...p, textItems: [...p.textItems, newText] };
            })
          }
        })),

      removeTextItem: (pageId, textId) =>
        set((state) => ({
          project: {
            ...state.project,
            pages: state.project.pages.map(p => p.id === pageId ? { ...p, textItems: p.textItems.filter(t => t.id !== textId) } : p)
          }
        })),
    }),
    {
      name: 'syllabexa-coloring-storage',
      storage: idbStorage,
    }
  )
);