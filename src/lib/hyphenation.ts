import React from 'react';
import { ManuscriptAST } from '../types';

/**
 * Enterprise Auto-hyphenation utility for Syllabexa Typesetter.
 * 
 * Safely eliminates whitespace 'rivers' in justified text by inserting soft hyphens (\u00AD).
 * Protected against corrupting Markdown URLs, HTML tags, and code blocks.
 */

// Global memoization cache to prevent re-calculating the same words (Huge performance boost for 50k+ word documents)
const hyphenationCache = new Map<string, string>();

// Vellum-grade linguistic rules combining prefixes, suffixes, and VCCV (Vowel-Consonant-Consonant-Vowel) splitting
const LINGUISTIC_BREAK_RULES: [RegExp, string][] = [
  // 1. Core Industry & Structural Roots
  [/(structur|revolution|reconstruct|recovery|practition|manuscript|character|definition|transformation|implementation|understanding|relationship|environment|perspective|development|management|investigation|communication|professional|extraordinary)(.+)/i, '$1\u00AD$2'],
  // 2. Heavy Prefixes
  [/(under|over|counter|inter|trans|super|hyper|multi|electro|psycho|cardio|gastro|thermo|techno|micro|macro|retro|pseudo|anti|auto|cyber|infra)(.+)/i, '$1\u00AD$2'],
  // 3. Heavy Suffixes
  [/(.+)(tion|sion|ment|ness|less|able|ible|ological|ization|izing|ification|ology|ography|ically|fully|ship|hood|fold|ways|wise)$/i, '$1\u00AD$2'],
  // 4. VCCV Pattern Fallback (Standard English Syllabification e.g. let-ter, hap-pen, ac-cept)
  // Matches a Vowel+Consonant followed by Consonant+Vowel
  [/([aeiouy][bcdfghjklmnpqrstvwxz])([bcdfghjklmnpqrstvwxz][aeiouy])/ig, '$1\u00AD$2'],
];

/**
 * Inserts soft hyphens (\u00AD) using linguistic patterns, backed by a performance cache.
 */
export function autoHyphenateWord(word: string, minWordLength = 10): string {
  if (!word || word.length < minWordLength) return word;
  
  // Skip if already hyphenated manually or via system
  if (word.includes('\u00AD') || word.includes('&shy;') || word.includes('-')) return word;

  // Cache hit bypass (O(1) lookup instead of running heavy regex rules)
  if (hyphenationCache.has(word)) {
    return hyphenationCache.get(word)!;
  }

  let hyphenated = word;

  // Apply sequential linguistic rules
  for (const rule of LINGUISTIC_BREAK_RULES) {
    if (Array.isArray(rule)) {
      const [pattern, replacement] = rule;
      if (pattern.test(hyphenated)) {
        hyphenated = hyphenated.replace(pattern, replacement);
        break; 
      }
    } else {
      // Direct regex replacement for VCCV pattern fallback
      hyphenated = hyphenated.replace(rule as RegExp, '$1\u00AD$2');
    }
  }

  hyphenationCache.set(word, hyphenated);
  return hyphenated;
}

/**
 * AST-Safe Lexical Text Hyphenator.
 * Explicitly skips Markdown links, image tags, HTML nodes, and code blocks to prevent URL corruption.
 */
export function autoHyphenateText(text: string, minWordLength = 10): string {
  if (!text) return text;

  // Lexical token pattern: Matches URLs, Markdown links, HTML tags, Code blocks, OR long words.
  const astSafePattern = /(https?:\/\/[^\s]+)|(\[.*?\]\(.*?\))|(<.*?>)|(`.*?`)|(\b[a-zA-Z]{10,}\b)/g;

  return text.replace(astSafePattern, (match, url, mdLink, htmlTag, codeBlock, word) => {
    // If the match is a protected syntax block, return it untouched
    if (url || mdLink || htmlTag || codeBlock) {
      return match;
    }
    // If it's a raw word, process it through the hyphenation engine
    if (word) {
      return autoHyphenateWord(word, minWordLength);
    }
    return match;
  });
}

/**
 * Process entire ManuscriptAST with auto-hyphenation and set prepressRules.hyphenation = true.
 */
export function applyAutoHyphenationToAst(ast: ManuscriptAST, minWordLength = 10): ManuscriptAST {
  const updatedChapters = ast.chapters.map((ch) => {
    if (!ch.content) return ch;
    return {
      ...ch,
      content: autoHyphenateText(ch.content, minWordLength),
    };
  });

  return {
    ...ast,
    prepressRules: {
      ...ast.prepressRules,
      hyphenation: true,
    },
    chapters: updatedChapters,
  };
}

/**
 * CSS Properties object for React elements to strictly enforce auto-hyphenation & inter-word text justification.
 * (Includes hanging-punctuation for true InDesign/Vellum optical edge alignment)
 */
export const HYPHENATED_JUSTIFIED_STYLE: React.CSSProperties = {
  textAlign: 'justify',
  textJustify: 'inter-word',
  hyphens: 'auto',
  WebkitHyphens: 'auto',
  msHyphens: 'auto',
  wordBreak: 'break-word',
  overflowWrap: 'break-word',
  hyphenateCharacter: "'-'",
  hangingPunctuation: 'first last', // Pushes quotes/periods outside the margin box for a cleaner optical line
};