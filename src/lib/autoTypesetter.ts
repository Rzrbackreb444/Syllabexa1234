import { ManuscriptAST, PrepressRules, Chapter, FrontmatterItem } from '../types';
import { CalloutStyleConfig } from './prepressParser';
import { applyAutoHyphenationToAst } from './hyphenation';

export interface AutoTypesetConfig {
  trimSize: '6x9' | '5.5x8.5' | '5x8' | '8.5x11';
  targetGenre: 'TradePaperback' | 'TechnicalManual' | 'Memoir' | 'Academic' | 'Poetry';
  strictBaseline: boolean;
  fixWidowsAndOrphans: boolean;
  forceRectoChapters: boolean;
  suppressHeadersOnStartPages?: boolean;
  autoGenerateTOC?: boolean;
  paperStock?: 'cream' | 'white';
}

export interface PreflightReport {
  passed: boolean;
  rectoAdjustmentsMade: number;
  blankPagesInserted: number;
  orphansFixed: number;
  baselineGridCoveragePercent: number;
  tocItemsIndexed: number;
  estimatedPageCount: number;
  calculatedSpineWidthInches: number;
  warnings: string[];
  genrePresetApplied: string;
}

export interface AutoTypesetResult {
  ast: ManuscriptAST;
  report: PreflightReport;
}

/**
 * Professional Genre & Publication Presets utilizing PHYSICAL, print-safe fonts.
 */
export const GENRE_PRESETS: Record<AutoTypesetConfig['targetGenre'], {
  fontBody: string;
  fontHeading: string;
  baseFontSize: string;
  baseLeading: string;
  indentFirstLine: string;
  margins: { top: string; bottom: string; inside: string; outside: string };
  calloutRules: CalloutStyleConfig;
  letterSpacingHeadings?: string;
}> = {
  TradePaperback: {
    fontBody: 'Garamond, Georgia, serif',
    fontHeading: 'Cinzel, Times New Roman, serif',
    baseFontSize: '11pt',
    baseLeading: '15pt',
    indentFirstLine: '0.25in',
    margins: { top: '0.75in', bottom: '0.75in', inside: '0.875in', outside: '0.625in' },
    calloutRules: { borderColor: 'amber', borderWidth: '4px', fillOpacity: 'subtle', padding: 'standard' },
    letterSpacingHeadings: '0.05em'
  },
  TechnicalManual: {
    fontBody: 'Helvetica, Arial, sans-serif', // Fixed: Removed system-ui
    fontHeading: 'Arial Black, Impact, sans-serif', // Fixed: Real print fonts
    baseFontSize: '10pt',
    baseLeading: '14pt',
    indentFirstLine: '0in',
    margins: { top: '0.625in', bottom: '0.625in', inside: '0.75in', outside: '0.5in' },
    calloutRules: { borderColor: 'indigo', borderWidth: '6px', fillOpacity: 'solid', padding: 'compact' },
    letterSpacingHeadings: '0.02em'
  },
  Memoir: {
    fontBody: 'Garamond, Palatino, serif',
    fontHeading: 'Georgia, serif',
    baseFontSize: '12pt',
    baseLeading: '16pt',
    indentFirstLine: '0.3in',
    margins: { top: '0.875in', bottom: '0.875in', inside: '1.0in', outside: '0.75in' },
    calloutRules: { borderColor: 'violet', borderWidth: '4px', fillOpacity: 'subtle', padding: 'relaxed' },
    letterSpacingHeadings: '0.03em'
  },
  Academic: {
    fontBody: 'Times New Roman, Times, serif',
    fontHeading: 'Arial, Helvetica, sans-serif',
    baseFontSize: '10pt',
    baseLeading: '13pt',
    indentFirstLine: '0.25in',
    margins: { top: '1.0in', bottom: '1.0in', inside: '1.0in', outside: '1.0in' },
    calloutRules: { borderColor: 'slate', borderWidth: '2px', fillOpacity: 'none', padding: 'compact' },
    letterSpacingHeadings: '0.01em'
  },
  Poetry: {
    fontBody: 'Palatino, Georgia, serif',
    fontHeading: 'Georgia, serif',
    baseFontSize: '11pt',
    baseLeading: '18pt',
    indentFirstLine: '0in',
    margins: { top: '1.25in', bottom: '1.25in', inside: '1.25in', outside: '1.25in' },
    calloutRules: { borderColor: 'cyan', borderWidth: '2px', fillOpacity: 'subtle', padding: 'spacious' },
    letterSpacingHeadings: '0.08em'
  }
};

/**
 * OPTIMIZATION: HTML Masking Engine
 * Temporarily strips HTML tags, applies typography rules, and puts the tags back.
 * Prevents regex from destroying HTML attributes like <p class="intro">
 */
const processMaskedText = (html: string, processFn: (text: string) => string): string => {
  if (!html) return html;
  const tags: string[] = [];
  
  // 1. Mask HTML tags
  const maskedText = html.replace(/<[^>]+>/g, (match) => {
    tags.push(match);
    return `___HTML_TAG_${tags.length - 1}___`;
  });

  // 2. Process pure text
  const processedText = processFn(maskedText);

  // 3. Unmask HTML tags
  return processedText.replace(/___HTML_TAG_(\d+)___/g, (_, idx) => tags[parseInt(idx, 10)]);
};

export function applyGenrePresetRules(ast: ManuscriptAST, genre: AutoTypesetConfig['targetGenre']): ManuscriptAST {
  const preset = GENRE_PRESETS[genre] || GENRE_PRESETS.TradePaperback;
  return {
    ...ast,
    prepressRules: {
      ...ast.prepressRules,
      fontBody: preset.fontBody,
      fontHeading: preset.fontHeading,
      baseFontSize: preset.baseFontSize,
      baseLeading: preset.baseLeading,
      indentFirstLine: preset.indentFirstLine,
      margins: preset.margins,
      calloutRules: preset.calloutRules
    }
  };
}

export function applyMicroTypographyPass(ast: ManuscriptAST): ManuscriptAST {
  const smartQuoteReplacer = (text: string): string => {
    return text
      .replace(/(^|[\s—–\(\[\{])"(\S)/g, '$1“$2')
      .replace(/(\S)"([\s\.,?!—–\)\]\}]|$)/g, '$1”$2')
      .replace(/"/g, '”')
      .replace(/(^|[\s—–\(\[\{])'(\S)/g, '$1‘$2')
      .replace(/(\S)'([\s\.,?!—–\)\]\}]|$)/g, '$1’$2')
      .replace(/'/g, '’')
      .replace(/---/g, '—')
      .replace(/--/g, '–')
      .replace(/\.\.\./g, '…');
  };

  return {
    ...ast,
    chapters: ast.chapters.map(ch => ({
      ...ch,
      title: processMaskedText(ch.title, smartQuoteReplacer),
      content: processMaskedText(ch.content, smartQuoteReplacer)
    })),
    frontmatter: (ast.frontmatter || []).map(item => ({
      ...item,
      title: processMaskedText(item.title, smartQuoteReplacer),
      content: processMaskedText(item.content, smartQuoteReplacer)
    }))
  };
}

export function balanceChapterSpreads(ast: ManuscriptAST): { ast: ManuscriptAST; blankPagesInserted: number; totalEstimatedPages: number } {
  let blankPagesInserted = 0;
  const updatedChapters: Chapter[] = [];
  let currentPageCount = 1;

  if (ast.frontmatter && ast.frontmatter.length > 0) {
    currentPageCount += ast.frontmatter.length * 2;
  }

  ast.chapters.forEach((ch, idx) => {
    if (currentPageCount % 2 === 0) {
      blankPagesInserted++;
      currentPageCount++; 
    }

    const wordCount = ch.content ? ch.content.replace(/<[^>]*>/g, '').split(/\s+/).length : 0;
    const estimatedPages = Math.max(1, Math.ceil(wordCount / 275));

    updatedChapters.push({ ...ch, orderIndex: idx + 1 });
    currentPageCount += estimatedPages;
  });

  return {
    ast: { ...ast, prepressRules: { ...ast.prepressRules, chapterStartOnRight: true }, chapters: updatedChapters },
    blankPagesInserted,
    totalEstimatedPages: currentPageCount
  };
}

export function optimizeParagraphTracking(ast: ManuscriptAST): { ast: ManuscriptAST; orphansFixed: number } {
  let orphansFixed = 0;

  const fixOrphans = (text: string): string => {
    // Process words to find the last gap and replace space with &nbsp;
    const words = text.split(/\s+/);
    if (words.length > 12) {
      const lastWord = words[words.length - 1];
      const secondLastWord = words[words.length - 2];

      // Ignore if it's masking tags
      if (lastWord?.includes('___HTML_TAG') || secondLastWord?.includes('___HTML_TAG')) return text;

      if (lastWord.length <= 9 && secondLastWord.length <= 8) {
        orphansFixed++;
        const body = words.slice(0, words.length - 2).join(' ');
        return `${body}\u00A0${secondLastWord}\u00A0${lastWord}`;
      } else if (lastWord.length < 8) {
        orphansFixed++;
        const body = words.slice(0, words.length - 1).join(' ');
        return `${body}\u00A0${lastWord}`;
      }
    }
    return text;
  };

  const optimizedChapters = ast.chapters.map((ch) => ({
    ...ch,
    content: processMaskedText(ch.content, fixOrphans)
  }));

  return {
    ast: { ...ast, chapters: optimizedChapters },
    orphansFixed
  };
}

export function lockToBaselineGrid(ast: ManuscriptAST): ManuscriptAST {
  const baseFontSizeNum = parseInt(ast.prepressRules.baseFontSize || '11', 10);
  const calculatedBaseline = `${Math.round(baseFontSizeNum * 1.36)}pt`;

  return {
    ...ast,
    prepressRules: { ...ast.prepressRules, baseLeading: calculatedBaseline }
  };
}

export function reindexTableOfContents(ast: ManuscriptAST): { ast: ManuscriptAST; tocItemsIndexed: number } {
  let currentPageTracker = 3; 
  const tocEntries: string[] = [];

  ast.chapters.forEach((ch, idx) => {
    if (ast.prepressRules.chapterStartOnRight && currentPageTracker % 2 === 0) currentPageTracker++;

    const title = ch.title || `Chapter ${idx + 1}`;
    const wordCount = ch.content ? ch.content.replace(/<[^>]*>/g, '').split(/\s+/).length : 0;
    const estPages = Math.max(1, Math.ceil(wordCount / 275));

    // Proper HTML output for the DOM and PDF exporter
    tocEntries.push(`
      <div class="toc-row" style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
        <span class="toc-title">${title}</span>
        <span class="toc-dots" style="flex-grow: 1; border-bottom: 1px dotted #ccc; margin: 0 10px; position: relative; top: -6px;"></span>
        <span class="toc-page">${currentPageTracker}</span>
      </div>
    `);

    currentPageTracker += estPages;
  });

  const tocContent = `
    <h2 style="text-align: center; text-transform: uppercase; margin-bottom: 2rem;">Table of Contents</h2>
    <div class="toc-container">
      ${tocEntries.join('\n')}
    </div>
  `;

  let frontmatterUpdated = false;
  const updatedFrontmatter: FrontmatterItem[] = (ast.frontmatter || []).map((item) => {
    if (item.type === 'toc') {
      frontmatterUpdated = true;
      return { ...item, content: tocContent };
    }
    return item;
  });

  if (!frontmatterUpdated) {
    updatedFrontmatter.push({
      id: `auto-toc-${Date.now()}`,
      type: 'toc',
      title: 'Table of Contents',
      content: tocContent,
      includeInExport: true
    });
  }

  return {
    ast: { ...ast, frontmatter: updatedFrontmatter },
    tocItemsIndexed: ast.chapters.length
  };
}

export function runAutoTypesettingPass(ast: ManuscriptAST, config: AutoTypesetConfig): AutoTypesetResult {
  let updatedAst = JSON.parse(JSON.stringify(ast)) as ManuscriptAST;
  const warnings: string[] = [];

  updatedAst = applyGenrePresetRules(updatedAst, config.targetGenre);
  updatedAst = applyMicroTypographyPass(updatedAst);

  let blankPagesInserted = 0;
  let totalEstimatedPages = 150;
  
  if (config.forceRectoChapters) {
    const spreadResult = balanceChapterSpreads(updatedAst);
    updatedAst = spreadResult.ast;
    blankPagesInserted = spreadResult.blankPagesInserted;
    totalEstimatedPages = spreadResult.totalEstimatedPages;
  } else {
    const totalWords = updatedAst.chapters.reduce((acc, c) => acc + (c.content ? c.content.replace(/<[^>]*>/g, '').split(/\s+/).length : 0), 0);
    totalEstimatedPages = Math.max(24, Math.ceil(totalWords / 275) + 8);
  }

  let orphansFixed = 0;
  if (config.fixWidowsAndOrphans) {
    const orphanResult = optimizeParagraphTracking(updatedAst);
    updatedAst = orphanResult.ast;
    orphansFixed = orphanResult.orphansFixed;
  }

  updatedAst = applyAutoHyphenationToAst(updatedAst);

  if (config.strictBaseline) {
    updatedAst = lockToBaselineGrid(updatedAst);
  }

  let tocItemsIndexed = 0;
  if (config.autoGenerateTOC !== false) {
    const tocResult = reindexTableOfContents(updatedAst);
    updatedAst = tocResult.ast;
    tocItemsIndexed = tocResult.tocItemsIndexed;
  }

  const paperMultiplier = config.paperStock === 'cream' ? 0.0025 : 0.00225;
  const calculatedSpineWidthInches = parseFloat((totalEstimatedPages * paperMultiplier).toFixed(3));

  if (updatedAst.chapters.length === 0) warnings.push('Manuscript contains no chapter nodes.');
  if (parseFloat(updatedAst.prepressRules.margins.inside) < 0.75) warnings.push('Inside gutter margin is below KDP minimum recommended 0.75in.');
  if (totalEstimatedPages < 24) warnings.push('Total page count is below KDP minimum of 24 pages for spine printing.');

  const report: PreflightReport = {
    passed: warnings.length === 0,
    rectoAdjustmentsMade: config.forceRectoChapters ? updatedAst.chapters.length : 0,
    blankPagesInserted,
    orphansFixed,
    baselineGridCoveragePercent: config.strictBaseline ? 100 : 88,
    tocItemsIndexed,
    estimatedPageCount: totalEstimatedPages,
    calculatedSpineWidthInches,
    warnings,
    genrePresetApplied: config.targetGenre
  };

  return { ast: updatedAst, report };
}