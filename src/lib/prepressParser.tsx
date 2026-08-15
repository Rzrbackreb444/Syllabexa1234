import React from 'react';
import mammoth from 'mammoth';
import { AlertCircle, ShieldCheck, Info, Sparkles, BookOpen, AlertTriangle, CheckCircle2, Bookmark } from 'lucide-react';
import { CalloutStyleConfig } from '../types';

export type { CalloutStyleConfig };

export interface ParsedChapter {
  id?: string;
  title: string;
  content: string;
  wordCount: number;
  readingTimeMinutes: number;
}

export interface DocumentAstNode {
  type: 'paragraph' | 'heading' | 'callout' | 'quote' | 'list' | 'table';
  level?: number;
  raw: string;
  htmlContent: string;
}

/**
 * Advanced inline markdown parser supporting bold, italics, code, strikethrough,
 * superscript, subscript, inline math, and footnotes/citations.
 */
export function parseInlineMarkdown(text: string): React.ReactNode[] {
  if (!text) return [];

  // Strip leading bullet or header symbols if raw text was passed directly
  let cleanedInput = text.replace(/^[-*]\s+/, '').replace(/^#+\s*/, '');

  // Match complex inline tokens: bold-italic, bold, italic, code, strikethrough, superscript, subscript, math
  const regex = /(\*\*\*[\s\S]+?\*\*\*|___[\s\S]+?___|\*\*[\s\S]+?\*\*|__[\s\S]+?__|`[\s\S]+?`|\*[\s\S]+?\*|_[\s\S]+?_|~~[\s\S]+?~~|\^[\s\S]+?\^|~[\s\S]+?~|\$[^$]+\$)/g;

  const parts = cleanedInput.split(regex);

  return parts.map((part, index) => {
    if (!part) return null;

    // Bold & Italic ***text*** or ___text___
    if ((part.startsWith('***') && part.endsWith('***')) || (part.startsWith('___') && part.endsWith('___'))) {
      return <strong key={index} className="font-bold"><em>{part.slice(3, -3)}</em></strong>;
    }

    // Bold **text** or __text__
    if ((part.startsWith('**') && part.endsWith('**')) || (part.startsWith('__') && part.endsWith('__'))) {
      return <strong key={index} className="font-bold">{part.slice(2, -2)}</strong>;
    }

    // Italic *text* or _text_
    if ((part.startsWith('*') && part.endsWith('*')) || (part.startsWith('_') && part.endsWith('_'))) {
      return <em key={index} className="italic">{part.slice(1, -1)}</em>;
    }

    // Inline Code `text`
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code key={index} className="font-mono bg-[#12151c] border border-slate-800 text-indigo-300 px-1.5 py-0.5 rounded text-[0.85em]">
          {part.slice(1, -1)}
        </code>
      );
    }

    // Strikethrough ~~text~~
    if (part.startsWith('~~') && part.endsWith('~~')) {
      return <del key={index} className="opacity-70">{part.slice(2, -2)}</del>;
    }

    // Superscript ^text^
    if (part.startsWith('^') && part.endsWith('^')) {
      return <sup key={index} className="text-[0.75em] font-mono">{part.slice(1, -1)}</sup>;
    }

    // Subscript ~text~
    if (part.startsWith('~') && part.endsWith('~')) {
      return <sub key={index} className="text-[0.75em] font-mono">{part.slice(1, -1)}</sub>;
    }

    // Inline Math $formula$
    if (part.startsWith('$') && part.endsWith('$')) {
      return <span key={index} className="font-mono text-amber-400">{part.slice(1, -1)}</span>;
    }

    // Standard plain text segment: sanitize lingering markdown symbols
    const sanitizedPart = part.replace(/[\*\_\`\#]+/g, '');
    return <React.Fragment key={index}>{sanitizedPart}</React.Fragment>;
  });
}

/**
 * Extracts clean drop cap character for professional book typesetting
 */
export function extractCleanDropCap(text: string): { dropChar: string; restOfText: string } {
  if (!text) return { dropChar: '', restOfText: '' };

  const cleaned = text.replace(/^[\*\_\#\"\`\s]+/, '');
  if (!cleaned) return { dropChar: '', restOfText: text };

  return {
    dropChar: cleaned.charAt(0),
    restOfText: cleaned.slice(1)
  };
}

/**
 * Renders professional InDesign-grade callout blocks with customizable styling,
 * icons, border widths, fill opacities, and custom CSS overrides.
 */
export function renderCalloutBlock(
  rawText: string,
  keyIdx: number,
  calloutConfig?: CalloutStyleConfig
): React.ReactNode {
  const textWithoutQuote = rawText.replace(/^>\s*/, '').trim();

  let type: 'warning' | 'doctrine' | 'note' | 'tip' = 'note';
  let title = 'DOCTRINE CALLOUT';
  let body = textWithoutQuote;

  if (/^\[!(WARNING|DOCTRINE-WARNING|CRITICAL)\]/i.test(textWithoutQuote)) {
    type = 'warning';
    title = 'DOCTRINE WARNING';
    body = textWithoutQuote.replace(/^\[!(WARNING|DOCTRINE-WARNING|CRITICAL)\]\s*/i, '');
  } else if (/^\[!(NOTE|INFO|DOCTRINE)\]/i.test(textWithoutQuote)) {
    type = 'doctrine';
    title = 'STRATEGIC DOCTRINE';
    body = textWithoutQuote.replace(/^\[!(NOTE|INFO|DOCTRINE)\]\s*/i, '');
  } else if (/^\[!(TIP|RECOMMENDATION)\]/i.test(textWithoutQuote)) {
    type = 'tip';
    title = 'PRACTITIONER TIP';
    body = textWithoutQuote.replace(/^\[!(TIP|RECOMMENDATION)\]\s*/i, '');
  }

  const bColor = calloutConfig?.borderColor || (type === 'warning' ? 'amber' : type === 'doctrine' ? 'indigo' : 'slate');
  
  const borderClassesMap: Record<string, string> = {
    indigo: 'border-indigo-600 bg-indigo-950/30 text-indigo-200',
    amber: 'border-amber-500 bg-amber-950/30 text-amber-200',
    slate: 'border-slate-700 bg-[#12151c] text-slate-200',
    crimson: 'border-rose-600 bg-rose-950/30 text-rose-200',
    emerald: 'border-emerald-600 bg-emerald-950/30 text-emerald-200',
    gold: 'border-amber-400 bg-amber-950/40 text-amber-200',
    cyan: 'border-cyan-600 bg-cyan-950/30 text-cyan-200',
    violet: 'border-violet-600 bg-violet-950/30 text-violet-200',
  };

  let colorClass = borderClassesMap[bColor] || borderClassesMap.indigo;

  if (calloutConfig?.fillOpacity === 'none') {
    colorClass = colorClass.replace(/bg-[a-z0-9\-\/]+/, 'bg-transparent');
  } else if (calloutConfig?.fillOpacity === 'subtle') {
    colorClass = colorClass.replace(/bg-([a-z0-9\-]+)\/[0-9]+/, 'bg-$1/15');
  } else if (calloutConfig?.fillOpacity === 'solid') {
    colorClass = colorClass.replace(/bg-([a-z0-9\-]+)\/[0-9]+/, 'bg-$1-900');
  }

  const paddingMap: Record<string, string> = {
    compact: 'p-3',
    standard: 'p-5',
    relaxed: 'p-6',
    spacious: 'p-8',
  };
  const paddingClass = calloutConfig?.padding ? (paddingMap[calloutConfig.padding] || 'p-5') : 'p-5';
  const borderLeftWidth = calloutConfig?.borderWidth || '4px';

  const inlineStyles: React.CSSProperties = {
    borderLeftWidth,
  };

  if (calloutConfig?.customBorderColor) {
    inlineStyles.borderLeftColor = calloutConfig.customBorderColor;
  }
  if (calloutConfig?.customBgColor) {
    inlineStyles.backgroundColor = calloutConfig.customBgColor;
  }
  if (calloutConfig?.customPadding) {
    inlineStyles.padding = calloutConfig.customPadding;
  }

  return (
    <div
      key={keyIdx}
      style={inlineStyles}
      className={`my-5 rounded-2xl border-y border-r border-slate-800 shadow-xl ${colorClass} ${paddingClass} font-sans leading-relaxed transition-all`}
    >
      <div className="flex items-center gap-2 font-mono font-bold uppercase tracking-widest text-[10px] mb-2 opacity-90">
        {type === 'warning' ? (
          <AlertCircle size={14} className="text-amber-400 shrink-0" />
        ) : type === 'doctrine' ? (
          <ShieldCheck size={14} className="text-indigo-400 shrink-0" />
        ) : (
          <Sparkles size={14} className="text-amber-400 shrink-0" />
        )}
        <span>{title}</span>
      </div>
      <div className="font-serif text-xs leading-relaxed opacity-95">
        {parseInlineMarkdown(body)}
      </div>
    </div>
  );
}

/**
 * Ingests multi-format documents (.docx, .md, .txt) with advanced section detection,
 * word count computation, and reading time estimation.
 */
export async function parseUploadedDocument(file: File): Promise<{
  docTitle: string;
  chapters: ParsedChapter[];
}> {
  const fileName = file.name;
  const extension = fileName.split('.').pop()?.toLowerCase();
  let rawText = '';

  if (extension === 'docx') {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    rawText = result.value || '';
  } else {
    rawText = await file.text();
  }

  rawText = rawText.replace(/\r\n/g, '\n');

  const chapterRegex = /(?=\n(?:#+\s+|Chapter\s+\d+|SECTION\s+\d+|PART\s+\d+))/i;
  const sections = rawText.split(chapterRegex).map(s => s.trim()).filter(Boolean);

  if (sections.length > 1) {
    const chapters: ParsedChapter[] = sections.map((sec, idx) => {
      const lines = sec.split('\n');
      let title = lines[0].replace(/^#+\s*/, '').trim();
      if (!title || title.length > 80) {
        title = `Chapter ${idx + 1}`;
      }
      const content = lines.slice(1).join('\n').trim() || sec;
      const words = content.replace(/<[^>]*>/g, '').split(/\s+/).filter(Boolean).length;
      
      return {
        id: `imported-ch-${Date.now()}-${idx}`,
        title,
        content: `<p>${content.replace(/\n\n/g, '</p><p>').replace(/\n/g, '<br/>')}</p>`,
        wordCount: words,
        readingTimeMinutes: Math.max(1, Math.round(words / 230))
      };
    });

    return {
      docTitle: fileName.replace(/\.[^/.]+$/, ''),
      chapters
    };
  }

  const totalWords = rawText.split(/\s+/).filter(Boolean).length;
  return {
    docTitle: fileName.replace(/\.[^/.]+$/, ''),
    chapters: [
      {
        id: `imported-ch-${Date.now()}-0`,
        title: fileName.replace(/\.[^/.]+$/, ''),
        content: `<p>${rawText.replace(/\n\n/g, '</p><p>').replace(/\n/g, '<br/>')}</p>`,
        wordCount: totalWords,
        readingTimeMinutes: Math.max(1, Math.round(totalWords / 230))
      }
    ]
  };
}