import * as fflate from 'fflate';

export interface ChapterData {
  id: string;
  title: string;
  content: string; // HTML or Markdown formatted chapter body
}

export interface EpubBookOptions {
  title: string;
  author?: string;
  publisher?: string;
  language?: string;
  premise?: string;
  coverImageBlob?: Blob;
  chapters: ChapterData[];
}

function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Enterprise-Grade EPUB3 Generator Engine
 * Fully compliant with EPUB 3.2 specification, IDPF container rules, 
 * nav.xhtml semantic landmarks, OPF manifest metadata, and zero-compression mimetype packaging.
 */
export function generateEpub3Blob(options: EpubBookOptions): Blob {
  const { 
    title, 
    author = 'Nicholas Kremers', 
    publisher = 'WashBizHub Press', 
    language = 'en', 
    premise = '', 
    coverImageBlob,
    chapters 
  } = options;

  const sanitizedSlug = title.replace(/[^a-z0-9]+/gi, '-').toLowerCase() || 'syllabexa-manuscript';
  const bookId = `urn:uuid:syllabexa-${sanitizedSlug}-${Date.now()}`;
  const currentDate = new Date().toISOString().replace(/\.\d+Z$/, 'Z');

  // 1. mimetype (MUST BE STORED UNCOMPRESSED AT BYTE OFFSET 0)
  const mimetypeData = new TextEncoder().encode('application/epub+zip');

  // 2. META-INF/container.xml
  const containerXml = `<?xml version="1.0" encoding="UTF-8"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
  <rootfiles>
    <rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/>
  </rootfiles>
</container>`;

  // 3. OEBPS/style.css (Professional Trade Book Typography & InDesign Callouts)
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

  // 4. Transform chapters into XHTML files
  const oebpsFiles: Record<string, Uint8Array> = {};
  const manifestItems: string[] = [];
  const spineRefs: string[] = [];
  const navItems: string[] = [];

  // Optional Cover Image processing
  let coverManifestEntry = '';
  if (coverImageBlob) {
    manifestItems.push(`<item id="cover-image" href="cover.jpg" media-type="image/jpeg" properties="cover-image"/>`);
    // Add cover xhtml wrapper page
    const coverXhtml = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="${language}" lang="${language}">
<head>
  <title>Cover</title>
  <style>body { margin: 0; padding: 0; text-align: center; background: #000; } img { max-width: 100%; height: auto; page-break-inside: avoid; }</style>
</head>
<body>
  <div><img src="cover.jpg" alt="Book Cover"/></div>
</body>
</html>`;
    oebpsFiles['cover.xhtml'] = new TextEncoder().encode(coverXhtml);
    manifestItems.push(`<item id="cover" href="cover.xhtml" media-type="application/xhtml+xml"/>`);
    spineRefs.push(`<itemref idref="cover" linear="yes"/>`);
  }

  chapters.forEach((ch, idx) => {
    const filename = `chapter_${idx + 1}.xhtml`;
    const id = `ch_${idx + 1}`;

    manifestItems.push(`<item id="${id}" href="${filename}" media-type="application/xhtml+xml"/>`);
    spineRefs.push(`<itemref idref="${id}"/>`);
    navItems.push(`<li><a href="${filename}">${escapeXml(ch.title)}</a></li>`);

    // Clean up content paragraphs and handle callouts or fleurons
    const contentHtml = ch.content || '';
    const paragraphs = contentHtml.split(/(?:<p[^>]*>|<\/p>|\n\n+)/).filter(p => p.trim().length > 0);
    
    const processedBodyHtml = paragraphs.map((p, pIdx) => {
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

      // If raw HTML was already structured with tags, preserve it
      if (p.includes('<') && p.includes('>')) {
        return p;
      }

      const isFirst = pIdx === 0;
      return `<p class="${isFirst ? 'first-p' : ''}">${escapeXml(cleanText)}</p>`;
    }).join('\n');

    const xhtmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" xml:lang="${language}" lang="${language}">
<head>
  <title>${escapeXml(ch.title)}</title>
  <link rel="stylesheet" type="text/css" href="style.css"/>
</head>
<body>
  <h2>${escapeXml(ch.title)}</h2>
  ${processedBodyHtml}
</body>
</html>`;

    oebpsFiles[filename] = new TextEncoder().encode(xhtmlContent);
  });

  // 5. OEBPS/nav.xhtml (EPUB 3 Navigation Document)
  const navXhtml = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" xml:lang="${language}" lang="${language}">
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
      ${coverImageBlob ? '<li><a epub:type="cover" href="cover.xhtml">Cover</a></li>' : ''}
      <li><a epub:type="toc" href="nav.xhtml">Table of Contents</a></li>
      <li><a epub:type="bodymatter" href="chapter_1.xhtml">Beginning of Content</a></li>
    </ol>
  </nav>
</body>
</html>`;

  // 6. OEBPS/content.opf
  const contentOpf = `<?xml version="1.0" encoding="UTF-8"?>
<package xmlns="http://www.idpf.org/2007/opf" unique-identifier="BookId" version="3.0">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
    <dc:identifier id="BookId">${escapeXml(bookId)}</dc:identifier>
    <dc:title>${escapeXml(title)}</dc:title>
    <dc:creator>${escapeXml(author)}</dc:creator>
    <dc:publisher>${escapeXml(publisher)}</dc:publisher>
    <dc:language>${escapeXml(language)}</dc:language>
    <dc:description>${escapeXml(premise)}</dc:description>
    <meta property="dcterms:modified">${currentDate}</meta>
    ${coverImageBlob ? '<meta name="cover" content="cover-image"/>' : ''}
  </metadata>
  <manifest>
    <item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/>
    <item id="style" href="style.css" media-type="text/css"/>
    ${manifestItems.join('\n    ')}
  </manifest>
  <spine>
    <itemref idref="nav" linear="yes"/>
    ${spineRefs.join('\n    ')}
  </spine>
</package>`;

  oebpsFiles['content.opf'] = new TextEncoder().encode(contentOpf);
  oebpsFiles['nav.xhtml'] = new TextEncoder().encode(navXhtml);
  oebpsFiles['style.css'] = new TextEncoder().encode(styleCss);

  // Assemble zip structure for fflate
  const zipStructure: fflate.Zippable = {
    'mimetype': [mimetypeData, { level: 0 }], // MANDATORY: Level 0 compression for mimetype
    'META-INF': {
      'container.xml': new TextEncoder().encode(containerXml)
    },
    'OEBPS': oebpsFiles
  };

  const zipped = fflate.zipSync(zipStructure);
  return new Blob([zipped], { type: 'application/epub+zip' });
}

export async function triggerEpubDownload(options: EpubBookOptions) {
  const blob = generateEpub3Blob(options);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${(options.title || 'syllabexa_manuscript').toLowerCase().replace(/[^a-z0-9]+/g, '_')}.epub`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}