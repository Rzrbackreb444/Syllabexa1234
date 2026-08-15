import { ManuscriptAST } from '../types';

export function generatePrintHTML(ast: ManuscriptAST): string {
  const { projectMeta, prepressRules, chapters } = ast;

  const chaptersHtml = chapters.map((chap, idx) => `
    <section class="chapter" style="page-break-before: always; ${prepressRules.chapterStartOnRight && idx % 2 === 0 ? 'page-break-before: right;' : ''}">
      <h2 style="font-family: ${prepressRules.fontHeading}; font-size: 20pt; margin-top: 3in; margin-bottom: 1.5in; text-align: center; text-indent: 0;">
        ${chap.title}
      </h2>
      <div class="chapter-body">
        ${chap.content}
      </div>
    </section>
  `).join('');

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>${projectMeta.title}</title>
      <style>
        @page {
          size: ${projectMeta.trimSize.replace('x', 'in x ')}in;
          margin-top: ${prepressRules.margins.top};
          margin-bottom: ${prepressRules.margins.bottom};
          @bottom-center {
            content: counter(page);
            font-family: sans-serif;
            font-size: 9pt;
            color: #666;
          }
        }
        body {
          font-family: "${prepressRules.fontBody}", serif;
          font-size: ${prepressRules.baseFontSize};
          line-height: ${prepressRules.baseLeading};
          text-align: justify;
          hyphens: ${prepressRules.hyphenation ? 'auto' : 'none'};
          color: #111;
          margin: 0;
          padding: 0;
        }
        p {
          margin: 0;
          text-indent: ${prepressRules.indentFirstLine};
        }
        p:first-of-type {
          text-indent: 0;
        }
        h1, h2, h3 {
          font-family: "${prepressRules.fontHeading}", serif;
          page-break-after: avoid;
        }
        .book-title-page {
          height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          page-break-after: always;
        }
        .book-title-page h1 {
          font-size: 32pt;
          margin-bottom: 0.5in;
        }
        .book-title-page p {
          text-indent: 0;
          font-size: 12pt;
          text-transform: uppercase;
          letter-spacing: 2px;
          color: #555;
        }
      </style>
    </head>
    <body>
      <!-- Half Title / Title Page -->
      <div class="book-title-page">
        <h1>${projectMeta.title}</h1>
        <p>By ${projectMeta.author}</p>
      </div>

      <!-- Main Manuscript Body -->
      ${chaptersHtml}
    </body>
    </html>
  `;
}