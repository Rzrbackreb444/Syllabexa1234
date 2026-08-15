export interface Part {
  id: string;
  title: string;
  orderIndex?: number;
}

export interface Chapter {
  id: string;
  title: string;
  content: string;
  orderIndex?: number;
  partId?: string | null;
  isPartHeader?: boolean;
}

export interface CharacterSheet {
  id: string;
  name: string;
  role: 'protagonist' | 'antagonist' | 'deuteragonist' | 'supporting' | 'other';
  traits: string[];
  backstory: string;
  appearance: string;
  arc: string;
  notes: string;
}

export interface LocationSheet {
  id: string;
  name: string;
  type: string;
  atmosphere: string;
  sensoryDetails: string;
  significance: string;
  notes: string;
}

export interface SceneCard {
  id: string;
  title: string;
  chapterId: string;
  summary: string;
  pov: string;
  conflict: string;
  setting: string;
}

export interface TimelineEvent {
  id: string;
  timeLabel: string;
  title: string;
  description: string;
  chaptersInvolved: string[];
}

export interface Snapshot {
  id: string;
  timestamp: string;
  title: string;
  chapters: Chapter[];
  bible?: {
    characters: CharacterSheet[];
    locations: LocationSheet[];
    scenes: SceneCard[];
    timeline: TimelineEvent[];
  };
}

export interface CommentItem {
  id: string;
  author: string;
  text: string;
  timestamp: string;
  resolved: boolean;
  chapterId: string;
  selectionText?: string;
  aiSuggestedEdit?: string;
}

export interface WritingGoals {
  dailyWordGoal: number;
  wordStreak: number;
  lastWrittenDate: string;
  overallWordGoal: number;
  deadline?: string;
}

export interface HealthReport {
  overusedWords: { word: string; count: number }[];
  passiveVoiceCount: number;
  readingLevel: string;
  characterConsistencyIssues: string[];
  plotHoles: string[];
  dialogueRatio: number;
  pacingReview: string;
}

export interface BookProject {
  title: string;
  author: string;
  chapters: Chapter[];
  selectedChapterId: string | null;
  bible?: {
    characters: CharacterSheet[];
    locations: LocationSheet[];
    scenes: SceneCard[];
    timeline: TimelineEvent[];
  };
  snapshots?: Snapshot[];
  comments?: CommentItem[];
  goals?: WritingGoals;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export interface ColoringPagePreset {
  id: string;
  name: string;
  width: number; 
  height: number; 
  unit: 'inch' | 'mm';
  printSizeText: string;
}

export interface CanvasStampItem {
  id: string;
  type: 'star' | 'heart' | 'butterfly' | 'flower' | 'cute_cat' | 'rocket' | 'crown' | 'sparkle' | 'bubble' | 'swirl';
  x: number; 
  y: number;
  scale: number; 
  rotation: number; 
}

export interface CanvasTextItem {
  id: string;
  text: string;
  x: number; 
  y: number;
  fontSize: number; 
  letterSpacing: number; 
  fontStyle: 'default' | 'bubble_font' | 'stencil_font' | 'stencil_bold' | 'elegant_cursive';
  strokeWidth: number; 
  rotation: number;
}

export interface ColoringPage {
  id: string;
  title: string;
  description: string;
  svgContent: string; 
  stamps: CanvasStampItem[];
  textItems: CanvasTextItem[];
  borderStyle: 'none' | 'simple' | 'double_line' | 'art_deco' | 'stars_border' | 'floral_border';
  fillHistory: Record<string, string>; 
  layoutType: 'portrait' | 'landscape';
}

export interface ColoringBookProject {
  id: string;
  title: string;
  description: string;
  preset: 'letter' | 'square' | 'a4';
  pages: ColoringPage[];
  selectedPageId: string | null;
}

export interface SampleTemplate {
  name: string;
  category: string;
  prompt: string;
  svgContent: string;
}

export interface VoiceProfile {
  id: string;
  name: string;
  tone: string;
  vocabulary: string[];
  pacing: string;
  persona: string;
  pov: string;
  dialogue: string;
  isPrimary: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CalloutStyleConfig {
  borderColor: 'indigo' | 'amber' | 'slate' | 'crimson' | 'emerald' | 'gold' | 'cyan' | 'violet' | string;
  borderWidth: '2px' | '4px' | '6px' | '8px' | string;
  fillOpacity: 'subtle' | 'tint' | 'solid' | 'none' | string;
  padding: 'compact' | 'standard' | 'relaxed' | 'spacious' | string;
  customBgColor?: string;
  customBorderColor?: string;
  customPadding?: string;
}

export interface GhostwritingRules {
  tone: string;
  targetAudience: string;
  industryVocabulary: string;
}

export interface ProjectMeta {
  title: string;
  subtitle?: string;
  author: string;
  publisher?: string;
  trimSize: '6x9' | '5.5x8.5' | '5x8' | '8.5x11';
  isbn?: string;
  projectType?: 'reflowable' | 'fixed-layout';
  publicationDate?: string;
  qrUrl?: string;
  watermarkLogoUrl?: string;
  ghostwritingRules?: GhostwritingRules;
}

export interface PrepressRules {
  baseFontSize: string;
  baseLeading: string;
  margins: {
    top: string;
    bottom: string;
    inside: string;
    outside: string;
  };
  chapterStartOnRight: boolean;
  hyphenation: boolean;
  fontBody: string;
  fontHeading: string;
  indentFirstLine: string;
  runningHeaders?: boolean;
  pageNumberStyle?: 'arabic' | 'roman';
  calloutRules?: CalloutStyleConfig;
  customCss?: string;
}

export interface FrontmatterItem {
  id: string;
  type: 'half-title' | 'title-page' | 'copyright' | 'dedication' | 'epigraph' | 'toc' | 'foreword' | 'acknowledgments';
  title: string;
  content: string;
  includeInExport: boolean;
}

export interface BackmatterItem {
  id: string;
  type: 'appendix' | 'glossary' | 'index' | 'about-author';
  title: string;
  content: string;
  includeInExport: boolean;
}

export interface ManuscriptAST {
  projectMeta: ProjectMeta;
  prepressRules: PrepressRules;
  frontmatter: FrontmatterItem[];
  chapters: Chapter[];
  backmatter: BackmatterItem[];
}

export interface ExportVersion {
  id: string;
  timestamp: string;
  projectMeta: ProjectMeta;
  prepressRules: PrepressRules;
  format: 'pdf' | 'epub';
}

export interface CoreConcept {
  id: string;
  term: string;
  context: string;
  chapterId: string;
}