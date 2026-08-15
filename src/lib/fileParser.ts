import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';

// Configure pdfjs worker source for browser environment
if (typeof window !== 'undefined' && !pdfjsLib.GlobalWorkerOptions.workerSrc) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjsLib.version || '4.10.38'}/build/pdf.worker.min.mjs`;
}

export interface ExtractedChapter {
  id: string;
  title: string;
  content: string; // HTML format for Tiptap editor
}

/**
 * Converts markdown text into structured rich HTML preserving headings, bold, lists, and quotes.
 */
export function convertMarkdownToHtml(markdown: string): string {
  if (!markdown) return '';
  
  let html = markdown
    // Escape HTML special chars except tags
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Code blocks ``` code ```
  html = html.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');

  // Headings
  html = html.replace(/^# (.*?)$/gm, '<h1>$1</h1>');
  html = html.replace(/^## (.*?)$/gm, '<h2>$1</h2>');
  html = html.replace(/^### (.*?)$/gm, '<h3>$1</h3>');
  html = html.replace(/^#### (.*?)$/gm, '<h4>$1</h4>');

  // Bold & Italics & Underline & Inline Code & Links
  html = html.replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>');
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
  html = html.replace(/__(.*?)__/g, '<u>$1</u>');
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
  html = html.replace(/\[\^(\d+)\]/g, '<sup class="footnote-ref">[$1]</sup>');

  // Blockquotes & Callouts
  html = html.replace(/^>\s*\[!(NOTE|WARNING|TIP|DOCTRINE)\]\s*(.*?)$/gm, '<div class="callout-block callout-$1"><p><strong>$1:</strong> $2</p></div>');
  html = html.replace(/^> (.*?)$/gm, '<blockquote><p>$1</p></blockquote>');

  // Lists (Unordered & Ordered)
  html = html.replace(/^\s*[-*] (.*?)$/gm, '<ul><li>$1</li></ul>');
  html = html.replace(/^\s*(\d+)\.\s+(.*?)$/gm, '<ol><li>$2</li></ol>');
  // Collapse adjacent lists
  html = html.replace(/<\/ul>\s*<ul>/g, '');
  html = html.replace(/<\/ol>\s*<ol>/g, '');

  // Paragraphs & line breaks
  const paragraphs = html.split(/\n\n+/);
  return paragraphs.map(p => {
    p = p.trim();
    if (!p) return '';
    if (p.startsWith('<h') || p.startsWith('<ul') || p.startsWith('<ol') || p.startsWith('<blockquote') || p.startsWith('<table') || p.startsWith('<pre') || p.startsWith('<div')) {
      return p;
    }
    return `<p>${p.replace(/\n/g, '<br/>')}</p>`;
  }).filter(Boolean).join('');
}

/**
 * Extracts rich HTML content from a DOCX ArrayBuffer using mammoth.
 */
export async function extractRichHtmlFromDocx(arrayBuffer: ArrayBuffer): Promise<string> {
  try {
    const result = await mammoth.convertToHtml({ arrayBuffer });
    return result.value; // Mammoth returns clean HTML with headings, lists, tables, bold, italic
  } catch (err) {
    console.error('Mammoth DOCX HTML conversion error:', err);
    throw err;
  }
}

/**
 * Extracts rich HTML content from a PDF ArrayBuffer.
 */
export async function extractRichHtmlFromPdf(arrayBuffer: ArrayBuffer): Promise<string> {
  try {
    const loadingTask = pdfjsLib.getDocument({
      data: new Uint8Array(arrayBuffer),
      useSystemFonts: true,
    });
    const pdfDoc = await loadingTask.promise;
    const numPages = pdfDoc.numPages;
    const pageTexts: string[] = [];

    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
      const page = await pdfDoc.getPage(pageNum);
      const textContent = await page.getTextContent();
      let pageStr = '';
      for (const item of textContent.items as any[]) {
        if ('str' in item && item.str) {
          pageStr += item.str + ' ';
        }
      }
      if (pageStr.trim()) {
        pageTexts.push(`<p>${pageStr.trim()}</p>`);
      }
    }

    return pageTexts.join('');
  } catch (err) {
    console.warn('PDF extraction fallback error:', err);
    const decoder = new TextDecoder('utf-8', { fatal: false });
    const rawStr = decoder.decode(arrayBuffer);
    return `<p>${rawStr.replace(/\n\n/g, '</p><p>').replace(/\n/g, '<br/>')}</p>`;
  }
}

/**
 * Splits rich HTML content or markdown into structured chapter blocks.
 */
export function splitRichContentIntoChapters(htmlContent: string, fileTitle: string): ExtractedChapter[] {
  if (!htmlContent) return [];

  // If content contains headings like <h1> or <h2>, split by them
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlContent, 'text/html');
  const bodyChildren = Array.from(doc.body.children);

  if (bodyChildren.length === 0) {
    return [{
      id: `imported-ch-1-${Date.now()}`,
      title: fileTitle || 'Imported Chapter',
      content: htmlContent
    }];
  }

  const chapters: ExtractedChapter[] = [];
  let currentTitle = fileTitle || 'Chapter 1';
  let currentElements: Element[] = [];
  let chapterIndex = 1;

  for (const el of bodyChildren) {
    const tagName = el.tagName.toLowerCase();
    if (tagName === 'h1' || (tagName === 'h2' && el.textContent && el.textContent.length < 60 && /^(chapter|chap\.|part|section)\b/i.test(el.textContent))) {
      if (currentElements.length > 0) {
        const tempDiv = document.createElement('div');
        currentElements.forEach(child => tempDiv.appendChild(child.cloneNode(true)));
        chapters.push({
          id: `imported-ch-${chapterIndex}-${Date.now()}`,
          title: currentTitle,
          content: tempDiv.innerHTML
        });
        chapterIndex++;
        currentElements = [];
      }
      currentTitle = el.textContent || `Chapter ${chapterIndex}`;
    } else {
      currentElements.push(el);
    }
  }

  // Final push
  if (currentElements.length > 0 || chapters.length === 0) {
    const tempDiv = document.createElement('div');
    currentElements.forEach(child => tempDiv.appendChild(child.cloneNode(true)));
    chapters.push({
      id: `imported-ch-${chapterIndex}-${Date.now()}`,
      title: currentTitle,
      content: tempDiv.innerHTML || htmlContent
    });
  }

  return chapters;
}