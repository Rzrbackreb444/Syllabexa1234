import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { idbStorage } from './idbStorage';
import { initManuscriptSync, syncLocalToYjs } from '../services/manuscriptSync';
import { 
  Chapter, 
  ProjectMeta, 
  PrepressRules, 
  FrontmatterItem, 
  BackmatterItem, 
  Part, 
  CoreConcept, 
  ExportVersion, 
  Snapshot 
} from '../types';

interface ManuscriptState {
  // Core AST Data
  projectMeta: ProjectMeta;
  prepressRules: PrepressRules;
  frontmatter: FrontmatterItem[];
  parts: Part[];
  chapters: Chapter[];
  backmatter: BackmatterItem[];
  snapshots: Snapshot[];
  
  // Active UI State
  selectedChapterId: string | null;
  isZenMode: boolean;
  isNotesOpen: boolean;
  isVersionHistoryOpen: boolean;
  isTyping: boolean;
  workspaceMode: 'author' | 'operator';
  writingGoals: {
    dailyGoal: number;
    weeklyGoal: number;
    projectGoal: number;
    todayCount: number;
    weeklyCount: number;
    streakDays: number;
    lastActiveDate: string;
  };
  updateWritingGoals: (goals: Partial<{ dailyGoal: number; weeklyGoal: number; projectGoal: number; todayCount: number; weeklyCount: number; streakDays: number }>) => void;

  // History State
  past: Array<{
    chapters: Chapter[];
    parts: Part[];
    projectMeta: ProjectMeta;
    prepressRules: PrepressRules;
  }>;
  future: Array<{
    chapters: Chapter[];
    parts: Part[];
    projectMeta: ProjectMeta;
    prepressRules: PrepressRules;
  }>;

  // Actions
  undo: () => void;
  redo: () => void;
  setWorkspaceMode: (mode: 'author' | 'operator') => void;
  updateProjectMeta: (meta: Partial<ProjectMeta>) => void;
  initializeMissingFrontmatter: () => void;
  updatePrepressRules: (rules: Partial<PrepressRules>) => void;
  addChapter: (chapter: Chapter) => void;
  addPart: (part: Part) => void;
  updateChapter: (id: string, update: Partial<Chapter>) => void;
  updateFrontmatter: (id: string, content: string) => void;
  updateFrontmatterItem: (id: string, update: Partial<FrontmatterItem>) => void;
  updateChapterContent: (id: string, content: string) => void;
  updateBackmatter: (id: string, content: string) => void;
  updateBackmatterItem: (id: string, update: Partial<BackmatterItem>) => void;
  reorderChapters: (startIndex: number, endIndex: number) => void;
  loadSampleManuscript: (metadata: ProjectMeta, chapters: Chapter[]) => void;
  setSelectedChapterId: (id: string | null) => void;
  setZenMode: (isZenMode: boolean) => void;
  setNotesOpen: (isNotesOpen: boolean) => void;
  
  // Split Screen
  isSplitScreenOpen: boolean;
  splitPaneRatio: number;
  splitViewType: 'comments' | 'typesetter';
  setSplitViewType: (type: 'comments' | 'typesetter') => void;

  // Search & Tagging
  editorScrollPos: number;
  globalSearchQuery: string;
  coreConcepts: CoreConcept[];
  exportHistory: ExportVersion[];
  showPrintGuides: boolean;

  setSplitScreenOpen: (isOpen: boolean) => void;
  setSplitPaneRatio: (ratio: number) => void;
  setEditorScrollPos: (pos: number) => void;
  setGlobalSearchQuery: (query: string) => void;
  addCoreConcept: (concept: CoreConcept) => void;
  removeCoreConcept: (id: string) => void;
  addExportVersion: (version: ExportVersion) => void;
  restoreExportVersion: (id: string) => void;
  setShowPrintGuides: (show: boolean) => void;
  addSnapshot: (title: string) => void;
  deleteSnapshot: (id: string) => void;
  restoreSnapshot: (id: string) => void;
  setVersionHistoryOpen: (isOpen: boolean) => void;
  setIsTyping: (isTyping: boolean) => void;
}

const defaultPrepressRules: PrepressRules = {
  baseFontSize: "11pt",
  baseLeading: "15pt",
  margins: { top: "0.75in", bottom: "0.75in", inside: "0.875in", outside: "0.625in" },
  chapterStartOnRight: true,
  hyphenation: true,
  fontBody: "Garamond",
  fontHeading: "Cinzel",
  indentFirstLine: "0.25in",
  runningHeaders: true,
  pageNumberStyle: 'arabic'
};

const pushHistory = (state: ManuscriptState) => {
  const currentSnapshot = {
    chapters: state.chapters,
    parts: state.parts,
    projectMeta: state.projectMeta,
    prepressRules: state.prepressRules
  };
  const newPast = [...(state.past || []), currentSnapshot].slice(-50);
  return {
    past: newPast,
    future: []
  };
};

export const useManuscriptStore = create<ManuscriptState>()(
  persist(
    (set) => ({
      // Initial State
      projectMeta: { title: "Untitled Draft", author: "", trimSize: "6x9" },
      prepressRules: defaultPrepressRules,
      frontmatter: [
        { id: "fm-1", type: "title-page", title: "Title Page", content: "", includeInExport: true },
        { id: "fm-2", type: "copyright", title: "Copyright", content: "", includeInExport: true },
        { id: "fm-3", type: "toc", title: "Table of Contents", content: "", includeInExport: true },
      ],
      parts: [],
      chapters: [
        { 
          id: "chap-1", 
          title: "Chapter 1", 
          content: "<p>Tutorial: Mastering physical page margins is the first step toward commercial self-publishing success. Standard 6x9 trade paperbacks demand strict inside gutters that expand as page count climbs. All figures, tables, and charts must be meticulously interleaved within these margins to ensure the physical pages look spectacular under standard binder trimming.</p><p>When laying out high-end business guides, visual aids like diagrams and charts should be placed cleanly between text blocks. Consider the following structural flowcharts and reference data for water consumption auditing:</p><p>[Figure: https://images.unsplash.com/photo-1455390582262-044cdead277a?q=80&w=1200 | Figure D.1: The Larry Larsen Method Flowchart]</p><p>As you audit the locations, compile the measurements in a structured reference grid:</p><p>[Figure: https://images.unsplash.com/photo-1551836022-d5d88e9218df?q=80&w=1200 | Figure D.2: Water Usage Reference Chart]</p><p>By applying these strict ratios, you can secure robust margins and scale your laundromat empire cleanly.</p>", 
          orderIndex: 0 
        }
      ],
      backmatter: [
        { id: "bm-1", type: "appendix", title: "Appendix", content: "", includeInExport: true },
        { id: "bm-2", type: "glossary", title: "Glossary", content: "", includeInExport: true },
      ],
      selectedChapterId: "chap-1",
      isZenMode: false,
      isNotesOpen: false,
      isVersionHistoryOpen: false,
      isTyping: false,
      workspaceMode: 'author',
      writingGoals: {
        dailyGoal: 1000,
        weeklyGoal: 5000,
        projectGoal: 50000,
        todayCount: 450,
        weeklyCount: 3200,
        streakDays: 4,
        lastActiveDate: new Date().toISOString().split('T')[0]
      },
      isSplitScreenOpen: false,
      splitPaneRatio: 60,
      splitViewType: 'comments',
      editorScrollPos: 0,
      globalSearchQuery: "",
      coreConcepts: [
        { id: 'concept-1', term: 'Vending Syndication', context: 'Chapter 1: The Operator', chapterId: 'chap-1' },
        { id: 'concept-2', term: 'Route Amortization', context: 'Chapter 2: Logistics', chapterId: 'chap-2' }
      ],
      exportHistory: [],
      showPrintGuides: false,
      snapshots: [],
      past: [],
      future: [],

      // Actions
      updateWritingGoals: (goals) => set((state) => ({
        writingGoals: { ...state.writingGoals, ...goals }
      })),
      setWorkspaceMode: (mode) => set({ workspaceMode: mode }),
      undo: () => set((state) => {
        if (!state.past || state.past.length === 0) return {};
        const previous = state.past[state.past.length - 1];
        const newPast = state.past.slice(0, state.past.length - 1);
        const currentSnapshot = {
          chapters: state.chapters,
          parts: state.parts,
          projectMeta: state.projectMeta,
          prepressRules: state.prepressRules
        };
        return {
          chapters: previous.chapters,
          parts: previous.parts,
          projectMeta: previous.projectMeta,
          prepressRules: previous.prepressRules,
          past: newPast,
          future: [currentSnapshot, ...(state.future || [])]
        };
      }),

      redo: () => set((state) => {
        if (!state.future || state.future.length === 0) return {};
        const next = state.future[0];
        const newFuture = state.future.slice(1);
        const currentSnapshot = {
          chapters: state.chapters,
          parts: state.parts,
          projectMeta: state.projectMeta,
          prepressRules: state.prepressRules
        };
        return {
          chapters: next.chapters,
          parts: next.parts,
          projectMeta: next.projectMeta,
          prepressRules: next.prepressRules,
          past: [...(state.past || []), currentSnapshot],
          future: newFuture
        };
      }),

      updateProjectMeta: (meta) => 
        set((state) => ({ 
          ...pushHistory(state),
          projectMeta: { ...state.projectMeta, ...meta } 
        })),

      updatePrepressRules: (rules) => 
        set((state) => ({ 
          ...pushHistory(state),
          prepressRules: { ...state.prepressRules, ...rules } 
        })),

      addChapter: (chapter) => 
        set((state) => ({ 
          ...pushHistory(state),
          chapters: [...state.chapters, { ...chapter, orderIndex: state.chapters.length }] 
        })),

      addPart: (part) =>
        set((state) => ({
          ...pushHistory(state),
          parts: [...state.parts, { ...part, orderIndex: state.parts.length }]
        })),

      updateChapter: (id, update) =>
        set((state) => ({
          ...pushHistory(state),
          chapters: state.chapters.map((chap) =>
            chap.id === id ? { ...chap, ...update } : chap
          )
        })),

      updateFrontmatter: (id, content) => set((state) => ({ frontmatter: state.frontmatter.map((fm) => fm.id === id ? { ...fm, content } : fm) })),
      updateFrontmatterItem: (id, update) => set((state) => ({ frontmatter: state.frontmatter.map((fm) => fm.id === id ? { ...fm, ...update } : fm) })),
      
      initializeMissingFrontmatter: () => set((state) => {
        const required = [
          { type: 'title-page', title: 'Title Page' },
          { type: 'copyright', title: 'Copyright' },
          { type: 'epigraph', title: 'Epigraph' },
          { type: 'dedication', title: 'Dedication' },
          { type: 'toc', title: 'Table of Contents' },
          { type: 'acknowledgments', title: 'Acknowledgments' }
        ];
        
        let currentFm = [...state.frontmatter];
        
        required.forEach((req, idx) => {
          if (!currentFm.some(fm => fm.type === req.type)) {
            currentFm.push({
              id: `fm-${Date.now()}-${idx}`,
              type: req.type as any,
              title: req.title,
              content: '',
              includeInExport: true
            });
          }
        });
        
        const order = ['half-title', 'title-page', 'copyright', 'dedication', 'epigraph', 'toc', 'foreword', 'acknowledgments'];
        currentFm.sort((a, b) => order.indexOf(a.type) - order.indexOf(b.type));
        
        return { frontmatter: currentFm };
      }),
      
      updateChapterContent: (id, content) =>
        set((state) => ({
          chapters: state.chapters.map((chap) => 
            chap.id === id ? { ...chap, content } : chap
          )
        })),

      updateBackmatter: (id, content) => set((state) => ({ backmatter: state.backmatter.map((bm) => bm.id === id ? { ...bm, content } : bm) })),
      updateBackmatterItem: (id, update) => set((state) => ({ backmatter: state.backmatter.map((bm) => bm.id === id ? { ...bm, ...update } : bm) })),
      
      reorderChapters: (startIndex, endIndex) =>
        set((state) => {
          const historyState = pushHistory(state);
          const result = Array.from(state.chapters);
          const [removed] = result.splice(startIndex, 1);
          result.splice(endIndex, 0, removed);
          
          const reordered = result.map((chap, index) => ({ ...chap, orderIndex: index }));
          return { 
            ...historyState,
            chapters: reordered 
          };
        }),
      
      loadSampleManuscript: (metadata, chapters) =>
        set((state) => {
          const historyState = pushHistory(state);
          return {
            ...historyState,
            projectMeta: metadata,
            prepressRules: {
              ...defaultPrepressRules,
              fontBody: "Source Serif 4",
              fontHeading: "Playfair Display",
              baseFontSize: "11pt",
              baseLeading: "15pt",
              margins: { top: "0.8in", bottom: "0.8in", inside: "1.0in", outside: "0.6in" },
              chapterStartOnRight: true,
              hyphenation: true
            },
            chapters: chapters.map((c, i) => ({ ...c, orderIndex: i })),
            selectedChapterId: chapters.length > 0 ? chapters[0].id : null,
            parts: [],
            frontmatter: [
              { id: "fm-1", type: "title-page", title: "Title Page", content: "", includeInExport: true },
              { id: "fm-2", type: "copyright", title: "Copyright", content: "", includeInExport: true },
              { id: "fm-3", type: "toc", title: "Table of Contents", content: "", includeInExport: true },
            ],
            backmatter: [
              { id: "bm-1", type: "appendix", title: "Appendix", content: "", includeInExport: true },
              { id: "bm-2", type: "glossary", title: "Glossary", content: "", includeInExport: true },
            ]
          };
        }),

      setSelectedChapterId: (id) => set({ selectedChapterId: id }),
      setZenMode: (isZenMode) => set({ isZenMode }),
      setNotesOpen: (isNotesOpen) => set({ isNotesOpen }),
      setSplitScreenOpen: (isOpen) => set({ isSplitScreenOpen: isOpen }),
      setSplitViewType: (type) => set({ splitViewType: type }),
      setSplitPaneRatio: (ratio) => set({ splitPaneRatio: ratio }),
      setEditorScrollPos: (pos) => set({ editorScrollPos: pos }),
      setGlobalSearchQuery: (query) => set({ globalSearchQuery: query }),
      addCoreConcept: (concept) => set((state) => ({ coreConcepts: [...state.coreConcepts, concept] })),
      removeCoreConcept: (id) => set((state) => ({ coreConcepts: state.coreConcepts.filter(c => c.id !== id) })),
      addExportVersion: (version) => set((state) => ({ exportHistory: [version, ...state.exportHistory] })),
      restoreExportVersion: (id) => set((state) => {
        const version = state.exportHistory.find(v => v.id === id);
        if (version) {
          return { projectMeta: version.projectMeta, prepressRules: version.prepressRules };
        }
        return state;
      }),
      setShowPrintGuides: (show) => set({ showPrintGuides: show }),
      
      addSnapshot: (title) => set((state) => {
        const newSnapshot: Snapshot = {
          id: `snap-${Date.now()}`,
          timestamp: new Date().toISOString(),
          title,
          chapters: JSON.parse(JSON.stringify(state.chapters)),
        };
        // The Web Worker will handle pushing this massive payload to IDB in the background
        return { snapshots: [...state.snapshots, newSnapshot] };
      }),
      
      deleteSnapshot: (id) => set((state) => ({
        snapshots: state.snapshots.filter(s => s.id !== id)
      })),
      
      restoreSnapshot: (id) => set((state) => {
        const snap = state.snapshots.find(s => s.id === id);
        if (!snap) return {};
        return {
          chapters: JSON.parse(JSON.stringify(snap.chapters)),
        };
      }),
      
      setVersionHistoryOpen: (isOpen) => set({ isVersionHistoryOpen: isOpen }),
      setIsTyping: (isTyping) => set({ isTyping }),
    }),
    {
      name: 'syllabexa-manuscript-storage',
      storage: idbStorage,
      partialize: (state) => {
        // STRICT OMISSION: Destructure out massive arrays to prevent UI thread freezing
        // The Web Worker handles snapshots, and we do not persist undo/redo history across reloads.
        const { past, future, snapshots, ...liveState } = state;
        return liveState;
      },
    }
  )
);

// Initialize real-time Yjs CRDT WebRTC sync
try {
  initManuscriptSync();
  useManuscriptStore.subscribe((state) => {
    syncLocalToYjs(state.chapters, state.projectMeta);
  });
} catch (e) {
  console.warn('[ManuscriptStore] Yjs sync subscription failed:', e);
}
