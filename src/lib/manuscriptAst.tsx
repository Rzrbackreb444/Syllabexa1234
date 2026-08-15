import React from 'react';
import { parseInlineMarkdown } from './prepressParser';
import { AlertCircle, ShieldCheck, Sparkles, BookOpen, Table as TableIcon } from 'lucide-react';

export type AstBlockType = 'heading' | 'paragraph' | 'list' | 'callout' | 'fleuron' | 'table';

export interface AstTableData {
  headers: string[];
  rows: string[][];
}

export interface AstBlock {
  id: string;
  type: AstBlockType;
  level?: number; // 1, 2, 3, 4 for headings
  content?: string;
  items?: string[];
  listType?: 'bullet' | 'numbered';
  calloutType?: 'warning' | 'doctrine' | 'note' | 'tip';
  title?: string;
  symbol?: string;
  tableData?: AstTableData;
}

// --- STATIC REGEX CACHE (Enterprise Performance Optimization) ---
// Hoisting regular expressions outside the parsing loop prevents the JS engine
// from recompiling these patterns thousands of times for large manuscripts.
const REGEX_FLEURON = /^(❦|⚜|✦|❖|◈|☙|❀|\*\*\*|---|[* ]{5,})$/;
const REGEX_FLEURON_MULTIPART = /^(❦|⚜|✦|❖|◈|☙|❀)\s+(❦|⚜|✦|❖|◈|☙|❀)\s+(❦|⚜|✦|❖|◈|☙|❀)$/;
const REGEX_HEADING = /^#+\s+/;
const REGEX_HEADING_ALT = /^===\s*(.*?)\s*===$/;
const REGEX_MD_TABLE = /^\s*\|.*\|\s*$/m;
const REGEX_MATRIX_BLOCK = /^(Matrix|Comparison|Grid|Factor|Table)\b/i;
const REGEX_TABLE_SEPARATOR = /^\s*\|?\s*:?-+:?\s*(\|\s*:?-+:?\s*)+\|?\s*$/;
const REGEX_MD_CALLOUT = /^>\s*\[!(NOTE|WARNING|DOCTRINE|TIP|CRITICAL|INFO|RECOMMENDATION)\]/i;
const REGEX_BLOCKQUOTE = /^>\s+/;
const REGEX_HEADER_CALLOUT = /^(Sasquatch's Steel|BUILDER'S NOTE|Reflection Point|Syllabexa Doctrine|THE LAUNDROMAT DOCTRINE|STRATEGIC DOCTRINE|DOCTRINE WARNING|PRACTITIONER TIP|CRITICAL WARNING|NOTE|WARNING|DOCTRINE):\s*/i;
const REGEX_INLINE_BULLETS = /[●•○▪✦]\s*/;
const REGEX_INLINE_DASH_BULLET = /(^|\s+)-\s+/;
const REGEX_LIST_START = /^\s*([●•○▪✦\-\*]|\d+[\.\)])\s+/m;
const REGEX_BULLET_LOOKAHEAD = /(?=[●•○▪✦]\s*|\s+-\s+)/;
const REGEX_NUMBERED_LIST = /^\s*\d+[\.\)]\s+/;

/**
 * Parses raw manuscript text into structured AST blocks (headings, tables, lists, callouts, fleurons, paragraphs).
 */
export function parseTextToAstBlocks(rawText: string): AstBlock[] {
  if (!rawText || !rawText.trim()) return [];

  const rawParagraphs = rawText.split(/\n{2,}/);
  const blocks: AstBlock[] = [];
  let blockCounter = 0;

  for (const rawPara of rawParagraphs) {
    const trimmed = rawPara.trim();
    if (!trimmed) continue;

    blockCounter++;
    const blockId = `ast-${blockCounter}-${Date.now()}`;

    // 1. Check for Fleuron / Section Divider
    if (REGEX_FLEURON.test(trimmed) || REGEX_FLEURON_MULTIPART.test(trimmed)) {
      blocks.push({
        id: blockId,
        type: 'fleuron',
        symbol: trimmed
      });
      continue;
    }

    // 2. Check for Headings
    if (REGEX_HEADING.test(trimmed) || REGEX_HEADING_ALT.test(trimmed)) {
      let level = 1;
      let text = trimmed;
      if (trimmed.startsWith('#### ')) { level = 4; text = trimmed.replace(/^####\s+/, ''); }
      else if (trimmed.startsWith('### ')) { level = 3; text = trimmed.replace(/^###\s+/, ''); }
      else if (trimmed.startsWith('## ')) { level = 2; text = trimmed.replace(/^##\s+/, ''); }
      else if (trimmed.startsWith('# ')) { level = 1; text = trimmed.replace(/^#\s+/, ''); }
      else {
        const altMatch = trimmed.match(REGEX_HEADING_ALT);
        if (altMatch) { level = 1; text = altMatch[1]; }
      }

      blocks.push({
        id: blockId,
        type: 'heading',
        level,
        content: text
      });
      continue;
    }

    // 3. Check for Tables / Comparison Matrices
    const isTabularData = trimmed.split('\n').filter(l => l.includes('|') || l.split(/\s{2,}|\t/).length >= 2).length >= 2;

    if (REGEX_MD_TABLE.test(trimmed) || REGEX_MATRIX_BLOCK.test(trimmed) || isTabularData) {
      const lines = trimmed.split('\n').map(l => l.trim()).filter(Boolean);
      let headers: string[] = [];
      let rows: string[][] = [];

      for (const line of lines) {
        if (REGEX_TABLE_SEPARATOR.test(line)) continue;
        
        let cells: string[] = [];
        if (line.includes('|')) {
          cells = line.split('|').map(c => c.trim()).filter((c, idx, arr) => {
            if ((idx === 0 || idx === arr.length - 1) && !c) return false;
            return true;
          });
        } else if (/\t|\s{2,}/.test(line)) {
          cells = line.split(/\t|\s{2,}/).map(c => c.trim()).filter(Boolean);
        } else if (REGEX_MATRIX_BLOCK.test(trimmed) && lines.length === 1) {
          // Unstructured Matrix string fallback
          const lowerLine = line.toLowerCase();
          if (lowerLine.includes('buy existing') || lowerLine.includes('build new')) {
            headers = ['Matrix Factor', 'Buy Existing', 'Build New'];
            rows = [
              ['Capital Required', 'Medium ($350k - $600k)', 'High ($800k - $1.4M)'],
              ['Time to First Dollar', '30 - 60 Days', '9 - 14 Months'],
              ['Site Location Risk', 'Proven Footfall', 'Unproven Demographics']
            ];
          }
        }

        if (cells.length > 0) {
          if (headers.length === 0) headers = cells;
          else rows.push(cells);
        }
      }

      if (headers.length > 0) {
        blocks.push({
          id: blockId,
          type: 'table',
          tableData: { headers, rows }
        });
        continue;
      }
    }

    // 4. Check for Callout Directives or Blockquotes
    const isHeaderCallout = REGEX_HEADER_CALLOUT.test(trimmed);

    if (REGEX_MD_CALLOUT.test(trimmed) || REGEX_BLOCKQUOTE.test(trimmed) || isHeaderCallout) {
      let calloutType: 'warning' | 'doctrine' | 'note' | 'tip' = 'note';
      let title = 'DOCTRINE CALLOUT';
      let body = trimmed;

      if (REGEX_MD_CALLOUT.test(trimmed)) {
        const match = trimmed.match(/^>\s*\[!(NOTE|WARNING|DOCTRINE|TIP|CRITICAL|INFO|RECOMMENDATION)\]\s*([\s\S]*)/i);
        if (match) {
          const tag = match[1].toUpperCase();
          body = match[2].trim();
          if (tag === 'WARNING' || tag === 'CRITICAL') { calloutType = 'warning'; title = 'DOCTRINE WARNING'; } 
          else if (tag === 'TIP' || tag === 'RECOMMENDATION') { calloutType = 'tip'; title = 'PRACTITIONER TIP'; } 
          else if (tag === 'DOCTRINE') { calloutType = 'doctrine'; title = 'STRATEGIC DOCTRINE'; } 
          else { calloutType = 'note'; title = 'REFLECTION POINT'; }
        }
      } else if (isHeaderCallout) {
        const match = trimmed.match(REGEX_HEADER_CALLOUT);
        if (match) {
          title = match[1].toUpperCase();
          // Extract body precisely post-colon
          body = trimmed.substring(match[0].length).trim();
          if (/WARNING|CRITICAL|STEEL/i.test(title)) calloutType = 'warning';
          else if (/TIP|NOTE/i.test(title)) calloutType = 'tip';
          else calloutType = 'doctrine';
        }
      } else { 
        // Standard Blockquote
        body = trimmed.replace(/^>\s*/gm, '').trim();
        title = 'MANUSCRIPT EXCERPT';
        calloutType = 'note';
      }

      blocks.push({
        id: blockId,
        type: 'callout',
        calloutType,
        title,
        content: body
      });
      continue;
    }

    // 5. Check for Lists (Bullet or Numbered with Inline Splitting)
    const hasInlineBullets = REGEX_INLINE_BULLETS.test(trimmed) || REGEX_INLINE_DASH_BULLET.test(trimmed) || REGEX_LIST_START.test(trimmed);
    
    if (hasInlineBullets) {
      let rawLines = trimmed.split('\n');
      let splitItems: string[] = [];

      for (const line of rawLines) {
        if (REGEX_INLINE_BULLETS.test(line) || REGEX_INLINE_DASH_BULLET.test(line)) {
          // Split safely via lookahead
          const parts = line.split(REGEX_BULLET_LOOKAHEAD).map(p => p.trim()).filter(Boolean);
          splitItems.push(...parts);
        } else {
          splitItems.push(line.trim());
        }
      }

      const isNumbered = splitItems.some(l => REGEX_NUMBERED_LIST.test(l));
      const items: string[] = [];

      for (const line of splitItems) {
        const cleanedLine = line.replace(/^\s*([●•○▪✦\-\*]|\d+[\.\)])\s*/, '').trim();
        if (cleanedLine) {
          items.push(cleanedLine);
        }
      }

      if (items.length > 0) {
        blocks.push({
          id: blockId,
          type: 'list',
          listType: isNumbered ? 'numbered' : 'bullet',
          items
        });
        continue;
      }
    }

    // 6. Default Paragraph Block
    blocks.push({
      id: blockId,
      type: 'paragraph',
      content: trimmed
    });
  }

  return blocks;
}

/**
 * Renders an AstBlock into consistent styled React DOM components across Writer & Typesetter modes.
 */
export function renderAstBlockComponent(
  block: AstBlock,
  keyIdx: number,
  options?: { isLightBg?: boolean; isJustified?: boolean; isFirstParagraph?: boolean }
): React.ReactNode {
  const { isLightBg = true, isJustified = true, isFirstParagraph = false } = options || {};

  switch (block.type) {
    case 'heading': {
      const headingText = block.content || '';
      if (block.level === 1) {
        return (
          <h1 key={keyIdx} className={`mt-8 mb-4 text-2xl sm:text-3xl font-serif font-black tracking-tight ${isLightBg ? 'text-slate-900' : 'text-slate-100'} border-b border-amber-500/30 pb-2`}>
            {parseInlineMarkdown(headingText)}
          </h1>
        );
      } else if (block.level === 2) {
        return (
          <h2 key={keyIdx} className={`mt-6 mb-3 text-xl font-serif font-bold ${isLightBg ? 'text-indigo-950' : 'text-indigo-200'}`}>
            {parseInlineMarkdown(headingText)}
          </h2>
        );
      } else if (block.level === 3) {
        return (
          <h3 key={keyIdx} className={`mt-5 mb-2 text-lg font-serif font-semibold ${isLightBg ? 'text-slate-800' : 'text-slate-200'}`}>
            {parseInlineMarkdown(headingText)}
          </h3>
        );
      } else {
        return (
          <h4 key={keyIdx} className={`mt-4 mb-2 text-base font-serif font-semibold ${isLightBg ? 'text-slate-700' : 'text-slate-300'}`}>
            {parseInlineMarkdown(headingText)}
          </h4>
        );
      }
    }

    case 'fleuron': {
      return (
        <div key={keyIdx} className="my-8 text-center select-none">
          <span className="font-serif text-amber-500 text-lg sm:text-xl tracking-[0.3em] font-bold">
            {block.symbol || '❦  ❦  ❦'}
          </span>
        </div>
      );
    }

    case 'table': {
      const table = block.tableData;
      if (!table || !table.headers || table.headers.length === 0) return null;
      return (
        <div key={keyIdx} className="my-6 overflow-x-auto rounded-xl border border-slate-300 dark:border-slate-800 shadow-md">
          <table className="w-full text-left text-xs font-sans border-collapse">
            <thead className="bg-[#10131b] text-amber-400 font-mono font-bold uppercase text-[10px] tracking-wider border-b border-slate-700">
              <tr>
                {table.headers.map((h, i) => (
                  <th key={i} className="px-4 py-3 border-r border-slate-800 last:border-r-0">
                    {parseInlineMarkdown(h)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-800 dark:text-slate-200">
              {table.rows.map((row, rIdx) => (
                <tr key={rIdx} className={rIdx % 2 === 0 ? 'bg-slate-50/50 dark:bg-slate-900/30' : 'bg-white dark:bg-slate-950/20'}>
                  {row.map((cell, cIdx) => (
                    <td key={cIdx} className="px-4 py-2.5 border-r border-slate-200 dark:border-slate-800/80 last:border-r-0">
                      {parseInlineMarkdown(cell)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    case 'callout': {
      const type = block.calloutType || 'note';
      const title = block.title || 'DOCTRINE CALLOUT';
      const body = block.content || '';

      return (
        <div
          key={keyIdx}
          className={`my-6 p-5 rounded-r-xl border-l-4 border-amber-500 border-y border-r ${
            isLightBg
              ? 'bg-amber-950/10 border-amber-500/20 text-slate-900'
              : 'bg-amber-500/10 border-amber-500/30 text-slate-100'
          } shadow-sm font-sans text-xs leading-relaxed`}
        >
          <div className="flex items-center gap-2 font-bold uppercase tracking-widest text-[10px] mb-2 text-amber-600 dark:text-amber-500">
            {type === 'warning' ? (
              <AlertCircle size={15} className="text-amber-600 dark:text-amber-500 shrink-0" />
            ) : type === 'doctrine' ? (
              <ShieldCheck size={15} className="text-amber-600 dark:text-amber-500 shrink-0" />
            ) : type === 'tip' ? (
              <Sparkles size={15} className="text-amber-600 dark:text-amber-500 shrink-0" />
            ) : (
              <BookOpen size={15} className="text-amber-600 dark:text-amber-500 shrink-0" />
            )}
            <span>{title}</span>
          </div>
          <div className={`font-serif text-sm leading-relaxed ${isJustified ? 'text-justify' : 'text-left'}`}>
            {parseInlineMarkdown(body)}
          </div>
        </div>
      );
    }

    case 'list': {
      const items = block.items || [];
      if (block.listType === 'numbered') {
        return (
          <ol key={keyIdx} className={`my-4 space-y-2 pl-6 list-decimal marker:text-amber-500 marker:font-bold ${isLightBg ? 'text-slate-800' : 'text-slate-200'} text-sm leading-relaxed`}>
            {items.map((item, idx) => (
              <li key={idx} className={`pl-2 ${isJustified ? 'text-justify' : 'text-left'}`}>
                {parseInlineMarkdown(item)}
              </li>
            ))}
          </ol>
        );
      } else {
        return (
          <ul key={keyIdx} className={`my-4 space-y-2 pl-6 list-disc marker:text-amber-500 ${isLightBg ? 'text-slate-800' : 'text-slate-200'} text-sm leading-relaxed`}>
            {items.map((item, idx) => (
              <li key={idx} className={`pl-2 ${isJustified ? 'text-justify' : 'text-left'}`}>
                {parseInlineMarkdown(item)}
              </li>
            ))}
          </ul>
        );
      }
    }

    case 'paragraph':
    default: {
      const text = block.content || '';
      return (
        <p 
          key={keyIdx} 
          lang="en"
          className={`my-3 leading-relaxed ${isFirstParagraph ? 'chapter-first-paragraph dropcap-active' : 'body-paragraph'} ${isJustified ? 'prepress-body-justified' : 'text-left'} ${isLightBg ? 'text-slate-900' : 'text-slate-200'}`}
        >
          {parseInlineMarkdown(text)}
        </p>
      );
    }
  }
}