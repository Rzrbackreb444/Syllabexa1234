import JSZip from 'jszip';
import { Chapter, ProjectMeta } from '../types';

function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Enterprise-Grade EPUB3 Generator using JSZip
 * Fully compliant with EPUB 3.2 specifications, XML escaping, professional typography CSS,
 * EPUB 3 Navigation Documents (`nav.xhtml`), and zero-compression mimetype storage.
 */
export async function generateEpub(meta: ProjectMeta, chapters: Chapter[]): Promise<Blob> {
  const zip = new JSZip();

  // 1. mimetype (MUST be first and uncompressed - STORE)
  zip.file('mimetype', 'application/epub+zip', { compression: 'STORE' });

  // 2. META-INF/container.xml
  const containerXml = `<?xml version="1.0" encoding="UTF-8"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
  <rootfiles>
    <rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/>
  </rootfiles>
</container>`;
  zip.file('META-INF/container.xml', containerXml);

  // 3. OEBPS folder structure
  const oebps = zip.folder('OEBPS');
  if (!oebps) throw new Error('Could not create OEBPS folder in ZIP container');

  // Professional trade book typography & InDesign-grade callout stylesheet
  const styleCss = `
body {
  font-family: Garamond, Georgia, "Times New Roman", serif;
  margin: 1.5em 2em;
  line-height: 1.65;
  text-align: justify;
  color: #1a1a1a;
  background-color: #ffffff;
  widows: 2;
  orphans: 2;
}
h1, h2, h3 {
  font-family: "Cinzel", "Times New Roman", serif;
  text-align: center;
  margin-top: 2.5em;
  margin-bottom: 1em;
  line-height: 1.25;
  color: #111827;
  page-break-after: avoid;
}
h2 {
  font-size: 1.5em;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}
p {
  text-indent: 1.5em;
  margin-top: 0;
  margin-bottom: 0;
}
p.first-p, h1 + p, h2 + p, h3 + p {
  text-indent: 0;
}
.fleuron {
  text-align: center;
  margin: 2em 0;
  font-size: 1.2em;
  color: #4f46e5;
  page-break-inside: avoid;
}
.callout-box {
  background-color: #f8fafc;
  border-left: 4px solid #4f46e5;
  padding: 1em 1.25em;
  margin: 1.5em 0;
  font-style: italic;
  border-radius: 0 8px 8px 0;
  page-break-inside: avoid;
}
.callout-title {
  font-family: monospace;
  font-style: normal;
  font-weight: bold;
  font-size: 0.85em;
  text-transform: uppercase;
  color: #312e81;
  margin-bottom: 0.4em;
  display: block;
}
`;
  oebps.file('style.css', styleCss);

  const spineItems: string[] = [];
  const manifestItems: string[] = [];
  const navItems: string[] = [];

  chapters.forEach((chapter, i) => {
    const id = `ch_${i + 1}`;
    const filename = `chapter_${i + 1}.xhtml`;

    manifestItems.push(`<item id="${id}" href="${filename}" media-type="application/xhtml+xml"/>`);
    spineItems.push(`<itemref idref="${id}"/>`);
    navItems.push(`<li><a href="${filename}">${escapeXml(chapter.title)}</a></li>`);

    // Process raw content / markdown paragraphs with callout & fleuron recognition
    const rawContent = chapter.content || '';
    const paragraphs = rawContent.split(/(?:<p[^>]*>|<\/p>|\n\n+)/).filter(p => p.trim().length > 0);

    const bodyHtml = paragraphs.map((p, pIdx) => {
      const cleanText = p.replace(/<[^>]*>/g, '').trim();

      if (/^(❦|⚜|✦|❖|◈|☙|❧|\*\*\*|---|• • •)$/.test(cleanText)) {
        return `<div class="fleuron">${escapeXml(cleanText)}</div>`;
      }
      if (cleanText.startsWith('>[!') || cleanText.startsWith('>')) {
        const titleMatch = cleanText.match(/^>\[!([A-Z\-]+)\]\s*/);
        const calloutTitle = titleMatch ? titleMatch[1].replace('-', ' ') : 'Doctrine Note';
        const bodyText = cleanText.replace(/^>(\[[A-Z\-]+\])?\s*/, '');
        return `<div class="callout-box"><span class="callout-title">${escapeXml(calloutTitle)}</span>${escapeXml(bodyText)}</div>`;
      }

      if (p.includes('<') && p.includes('>')) {
        return p; // Preserve pre-formatted HTML tags
      }

      const isFirst = pIdx === 0;
      return `<p class="${isFirst ? 'first-p' : ''}">${escapeXml(cleanText)}</p>`;
    }).join('\n');

    const chapterXhtml = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" xml:lang="en" lang="en">
<head>
  <title>${escapeXml(chapter.title)}</title>
  <link rel="stylesheet" type="text/css" href="style.css"/>
</head>
<body>
  <h2>${escapeXml(chapter.title)}</h2>
  ${bodyHtml}
</body>
</html>`;

    oebps.file(filename, chapterXhtml);
  });

  // 4. OEBPS/nav.xhtml (EPUB 3 Navigation Document)
  const navXhtml = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" xml:lang="en" lang="en">
<head>
  <title>Table of Contents</title>
  <link rel="stylesheet" type="text/css" href="style.css"/>
</head>
<body>
  <nav epub:type="toc" id="toc">
    <h1>Table of Contents</h1>
    <ol>
      ${navItems.join('\n      ')}
    </ol>
  </nav>
  <nav epub:type="landmarks" hidden="hidden">
    <ol>
      <li><a epub:type="toc" href="nav.xhtml">Table of Contents</a></li>
      <li><a epub:type="bodymatter" href="chapter_1.xhtml">Beginning of Content</a></li>
    </ol>
  </nav>
</body>
</html>`;
  oebps.file('nav.xhtml', navXhtml);

  // 5. OEBPS/content.opf (Package Document)
  const bookId = `urn:uuid:syllabexa-${meta.title.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}-${Date.now()}`;
  const currentDate = new Date().toISOString().replace(/\.\d+Z$/, 'Z');

  const opf = `<?xml version="1.0" encoding="UTF-8"?>
<package xmlns="http://www.idpf.org/2007/opf" unique-identifier="BookId" version="3.0">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
    <dc:identifier id="BookId">${escapeXml(bookId)}</dc:identifier>
    <dc:title>${escapeXml(meta.title)}</dc:title>
    <dc:creator>${escapeXml(meta.author)}</dc:creator>
    <dc:language>en-US</dc:language>
    <meta property="dcterms:modified">${currentDate}</meta>
  </metadata>
  <manifest>
    <item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/>
    <item id="style" href="style.css" media-type="text/css"/>
    ${manifestItems.join('\n    ')}
  </manifest>
  <spine>
    <itemref idref="nav" linear="yes"/>
    ${spineItems.join('\n    ')}
  </spine>
</package>`;
  oebps.file('content.opf', opf);

  return await zip.generateAsync({
    type: 'blob',
    mimeType: 'application/epub+zip',
    compression: 'DEFLATE',
    compressionOptions: { level: 9 }
  });
}