
function formatAuthorName(name: string) {
  if (!name) return "";
  return name.replace(/\b(Dr\.|Mr\.|Mrs\.|Ms\.|Prof\.|Ph\.D|M\.D\.)\b/gi, '')
             .replace(/['"].*?['"]/g, '')
             .trim();
}

function decodeHtmlEntities(str: string) {
  return str
    .replace(/&ldquo;/g, '"')
    .replace(/&rdquo;/g, '"')
    .replace(/&lsquo;/g, "'")
    .replace(/&rsquo;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&mdash;/g, '—')
    .replace(/&ndash;/g, '–')
    .replace(/&nbsp;/g, ' ')
    .replace(/&middot;/g, '·')
    .replace(/&bull;/g, '•')
    .replace(/&#39;/g, "'")
    .replace(/&#039;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}

import { jsPDF } from 'jspdf';
import JSZip from 'jszip';
import { ProjectMeta, PrepressRules, Chapter, FrontmatterItem, BackmatterItem } from '../types';



export const generatePDF = async (
  projectMeta: ProjectMeta,
  prepressRules: PrepressRules,
  chapters: Chapter[],
  frontmatter: FrontmatterItem[],
  backmatter: BackmatterItem[]
) => {
  const [wStr, hStr] = (projectMeta.trimSize || '6x9').split('x');
  const widthIn = parseFloat(wStr);
  const heightIn = parseFloat(hStr);

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'in',
    format: [widthIn, heightIn]
  });

  doc.setProperties({
    title: projectMeta.title,
    author: formatAuthorName(projectMeta.author || 'Author Name'),
    creator: 'Syllabexa Typesetting Engine (CMYK Print-Ready / PDF/X)',
    subject: projectMeta.subtitle || '',
    keywords: `ISBN:${projectMeta.isbn || 'N/A'}; Publisher:${projectMeta.publisher || 'N/A'}; ColorSpace:CMYK; Profile:PDF/X-1a; Date:${projectMeta.publicationDate || 'N/A'}`
  });

  // KDP Dynamic Gutter Math
  let totalWordCount = 0;
  chapters.forEach(ch => totalWordCount += ch.content.replace(/<[^>]*>?/gm, '').split(/\s+/).length);
  const estimatedPages = Math.max(Math.ceil(totalWordCount / 250), chapters.length * 5);
  
  let dynamicGutter = 0.375;
  if (estimatedPages >= 151 && estimatedPages <= 300) dynamicGutter = 0.5;
  else if (estimatedPages >= 301 && estimatedPages <= 500) dynamicGutter = 0.625;
  else if (estimatedPages > 500) dynamicGutter = 0.75;
  
  const outsideMargin = parseFloat(prepressRules.margins.outside) || 0.5;
  const topMargin = parseFloat(prepressRules.margins.top) || 0.75;
  const bottomMargin = parseFloat(prepressRules.margins.bottom) || 0.75;
  
  const fontSizePt = parseInt(prepressRules.baseFontSize) || 11;
  const leadingPt = parseInt(prepressRules.baseLeading) || 15;
  
  // Calculate line height in inches (approximate)
  const lineHeightIn = leadingPt / 72;
  
  let pageNum = 1;
  let isFirstItem = true;

  const watermarkLogoUrl = (projectMeta as any).watermarkLogoUrl;
  let watermarkImgData: HTMLImageElement | null = null;
  if (watermarkLogoUrl) {
    watermarkImgData = new Image();
    watermarkImgData.src = watermarkLogoUrl;
    await new Promise((resolve) => {
      watermarkImgData.onload = resolve;
      watermarkImgData.onerror = resolve; // Continue even if it fails
    });
  }

  const renderItem = async (title: string, contentText: string, context: { isFrontMatter: boolean, isChapter: boolean, fmType?: string }) => {
    // We are no longer using html2canvas, so we parse content directly.
    
    // Very simple HTML stripping to retain paragraphs
    let rawText = decodeHtmlEntities(
      contentText
        .replace(/<p[^>]*>/gi, '') // remove opening p
        .replace(/<\/p>/gi, '\n\n') // replace closing p with double newline
        .replace(/<br\s*\/?>/gi, '\n') // br to newline
        .replace(/<[^>]*>?/gm, '') // strip remaining HTML
        .trim()
    );
      
    // Determine if this item should force a Recto (right-hand, odd numbered) page start.
    const isMajorSection = context.isChapter || (context.isFrontMatter && ['title-page', 'copyright', 'dedication', 'epigraph', 'toc', 'acknowledgments', 'foreword'].includes((context as any).fmType));
    
    // If we've already started, we need to add at least one page for this new item.
    if (!isFirstItem) {
      doc.addPage();
      pageNum++;
    }
    
    // If it's a major section and pageNum is even (Verso), we need it to be odd (Recto).
    if (isMajorSection && pageNum % 2 === 0) {
      // Add a blank page
      doc.addPage();
      pageNum++;
    }
    
    isFirstItem = false;

    let isVerso = pageNum % 2 === 0;
    let leftMargin = isVerso ? outsideMargin : dynamicGutter;
    let rightMargin = isVerso ? dynamicGutter : outsideMargin;
    let contentWidth = widthIn - leftMargin - rightMargin;
    
    let currentY = topMargin;
    
    const drawHeadersFooters = (isFirstPage: boolean = false) => {
      // Draw Watermark
      if (watermarkImgData) {
        const w = widthIn * 0.4;
        const h = (watermarkImgData.height / watermarkImgData.width) * w;
        try {
           doc.setGState(new (doc as any).GState({opacity: 0.1}));
        } catch(e){}
        doc.addImage(watermarkImgData, 'PNG', (widthIn - w) / 2, (heightIn - h) / 2, w, h);
        try {
           doc.setGState(new (doc as any).GState({opacity: 1.0}));
        } catch(e){}
      }
      
      // Draw Headers & Footers
      if (prepressRules.runningHeaders && !isFirstPage) { // Not chapter title page
        doc.setFontSize(8);
        const headerText = isVerso ? (projectMeta.title || 'Book Title') : title;
        doc.text(headerText.toUpperCase(), widthIn / 2, topMargin - 0.25, { align: 'center' });
      }
      
      if (prepressRules.runningHeaders) {
        doc.setFontSize(8);
        let folio = '';
        if (context.isFrontMatter) {
          const roman = ["i","ii","iii","iv","v","vi","vii","viii","ix","x","xi","xii","xiii","xiv","xv","xvi","xvii","xviii","xix","xx"];
          folio = roman[pageNum - 1] || pageNum.toString();
        } else {
          folio = pageNum.toString(); 
        }
        
        doc.text(folio, widthIn / 2, heightIn - bottomMargin + 0.25, { align: 'center' });
      }
      
      doc.setFont(prepressRules.fontBody || 'times');
    doc.setFontSize(fontSizePt);
    };
    
    // Initial draw for first page
    doc.setFont(prepressRules.fontHeading || 'times');
    doc.setFontSize(24);
    currentY += 1.0;
    doc.text(title, widthIn / 2, currentY, { align: 'center' });
    currentY += 0.5;
    
    drawHeadersFooters(true);
    
    doc.setFont(prepressRules.fontBody || 'times');
    doc.setFontSize(fontSizePt);
    
    const paragraphs = rawText.split('\n\n');
    for (const para of paragraphs) {
      if (!para.trim()) continue;
      
      const lines = doc.splitTextToSize(para.trim(), contentWidth);
      
      for (const line of lines) {
        if (currentY > heightIn - bottomMargin) {
          pageNum++;
          doc.addPage();
          isVerso = pageNum % 2 === 0;
          leftMargin = isVerso ? outsideMargin : dynamicGutter;
          rightMargin = isVerso ? dynamicGutter : outsideMargin;
          contentWidth = widthIn - leftMargin - rightMargin;
          currentY = topMargin + lineHeightIn;
          drawHeadersFooters();
        }
        
        doc.text(line, leftMargin, currentY);
        currentY += lineHeightIn;
      }
      currentY += lineHeightIn; // paragraph spacing
    }
    
  };

  let isFrontMatter = true;
  for (const fm of frontmatter) {
    let contentText = fm.content;
    
    // Generate specialized content for front matter sections
    if (fm.type === 'title-page') {
      contentText = "\n\n\n\n" + (projectMeta.title || '').toUpperCase() + "\n\n" + (projectMeta.subtitle || '') + "\n\n\n\n\n\n" + formatAuthorName(projectMeta.author || '');
    } else if (fm.type === 'copyright') {
      let rights = fm.content || 'All rights reserved.';
      contentText = "Copyright © " + (projectMeta.publicationDate || new Date().getFullYear()) + " " + formatAuthorName(projectMeta.author || '') + "\n\n" + rights + "\n\nPublished by " + (projectMeta.publisher || 'Independent') + "\nISBN: " + (projectMeta.isbn || 'N/A');
    } else if (fm.type === 'toc') {
      contentText = chapters.map((ch, idx) => (ch.title || 'Chapter ' + (idx + 1))).join('\n\n');
    } else if (fm.type === 'epigraph') {
      try {
        const parsed = JSON.parse(fm.content);
        contentText = "\n\n\n\n\"" + parsed.quote + "\"\n\n— " + parsed.source;
      } catch (e) {
        contentText = fm.content;
      }
    } else if (fm.type === 'dedication') {
      // Simulate vertical centering
      contentText = "\n\n\n\n\n\n\n" + fm.content;
    }
    
    await renderItem(fm.title, contentText, { isFrontMatter: true, isChapter: false, fmType: fm.type });
  }
  isFrontMatter = false;
  
  for (const ch of chapters) {
    await renderItem(ch.title, ch.content, { isFrontMatter: false, isChapter: true });
  }

  for (const bm of backmatter) {
    await renderItem(bm.title, bm.content, { isFrontMatter: false, isChapter: false });
  }
  
  if ((projectMeta as any).qrUrl) {
    // Generate simple text instead of actual QR in vector for simplicity if needed, but we can keep URL.
    await renderItem('Digital Appendix', `Scan for More\n\n${(projectMeta as any).qrUrl}`, { isFrontMatter: false, isChapter: false });
  }
  
  doc.save(`${projectMeta.title.replace(/\s+/g, '_')}_PrintMaster.pdf`);
};




export const generateEPUB = async (
  projectMeta: ProjectMeta,
  chapters: Chapter[],
  frontmatter: FrontmatterItem[],
  backmatter: BackmatterItem[]
) => {
  const zip = new JSZip();

  // mimetype
  zip.file('mimetype', 'application/epub+zip');

  // META-INF/container.xml
  const containerXml = `<?xml version="1.0" encoding="UTF-8"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
  <rootfiles>
    <rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/>
  </rootfiles>
</container>`;
  zip.file('META-INF/container.xml', containerXml);

  const cleanAuthor = formatAuthorName(projectMeta.author || 'Author Name');
  const allItems = [...frontmatter, ...chapters, ...backmatter];
  
  // OEBPS/content.opf
  let opfItems = '';
  let opfSpine = '';
  
  allItems.forEach((item, index) => {
    opfItems += `<item id="item${index}" href="text/item${index}.xhtml" media-type="application/xhtml+xml"/>\n`;
    opfSpine += `<itemref idref="item${index}"/>\n`;
  });

  const contentOpf = `<?xml version="1.0" encoding="UTF-8"?>
<package xmlns="http://www.idpf.org/2007/opf" unique-identifier="pub-id" version="3.0">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
    <dc:title>${projectMeta.title}</dc:title>
    <dc:creator>${cleanAuthor}</dc:creator>
    <dc:language>en</dc:language>
    ${projectMeta.isbn ? `<dc:identifier id="isbn">${projectMeta.isbn}</dc:identifier>` : `<dc:identifier id="pub-id">urn:uuid:${crypto.randomUUID ? crypto.randomUUID() : '123456789'}</dc:identifier>`}
    ${projectMeta.publisher ? `<dc:publisher>${projectMeta.publisher}</dc:publisher>` : ''}
    ${projectMeta.publicationDate ? `<dc:date>${projectMeta.publicationDate}</dc:date>` : ''}
  </metadata>
  <manifest>
    <item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/>
    <item id="ncx" href="toc.ncx" media-type="application/x-dtbncx+xml"/>
    <item id="style" href="styles/style.css" media-type="text/css"/>
    ${opfItems}
  </manifest>
  <spine toc="ncx">
    ${opfSpine}
  </spine>
</package>`;
  zip.file('OEBPS/content.opf', contentOpf);

  // OEBPS/toc.ncx (EPUB 2 compatibility for Kindle)
  let ncxNavPoints = '';
  allItems.forEach((item, index) => {
    ncxNavPoints += `
    <navPoint id="navPoint-${index+1}" playOrder="${index+1}">
      <navLabel>
        <text>${item.title.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</text>
      </navLabel>
      <content src="text/item${index}.xhtml"/>
    </navPoint>`;
  });
  
  const ncx = `<?xml version="1.0" encoding="UTF-8"?>
<ncx xmlns="http://www.daisy.org/z3986/2005/ncx/" version="2005-1">
  <head>
    <meta name="dtb:uid" content="${projectMeta.isbn || 'urn:uuid:123456789'}"/>
    <meta name="dtb:depth" content="1"/>
    <meta name="dtb:totalPageCount" content="0"/>
    <meta name="dtb:maxPageNumber" content="0"/>
  </head>
  <docTitle>
    <text>${projectMeta.title.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</text>
  </docTitle>
  <navMap>
    ${ncxNavPoints}
  </navMap>
</ncx>`;
  zip.file('OEBPS/toc.ncx', ncx);

  // OEBPS/nav.xhtml
  let navLinks = '';
  allItems.forEach((item, index) => {
    navLinks += `<li><a href="text/item${index}.xhtml">${item.title}</a></li>\n`;
  });
  
  const navXhtml = `<?xml version="1.0" encoding="UTF-8"?>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops">
  <head>
    <title>Table of Contents</title>
  </head>
  <body>
    <nav epub:type="toc" id="toc">
      <h1>Table of Contents</h1>
      <ol>
        ${navLinks}
      </ol>
    </nav>
  </body>
</html>`;
  zip.file('OEBPS/nav.xhtml', navXhtml);

  // OEBPS/styles/style.css
  const styleCss = `
    body { font-family: serif; line-height: 1.5; margin: 5%; hyphens: auto; -webkit-hyphens: auto; text-align: justify; orphans: 3; widows: 3; }
    h1 { text-align: center; margin-top: 2em; margin-bottom: 1em; page-break-after: avoid; }
    h2 { text-align: center; page-break-after: avoid; }
    p { text-align: justify; text-indent: 1.5em; margin-top: 0; margin-bottom: 0; orphans: 3; widows: 3; hyphens: auto; -webkit-hyphens: auto; }
    section.chapter > p:first-of-type::first-letter { font-size: 3.2em; float: left; line-height: 0.8; margin-right: 0.1em; font-family: serif; font-weight: bold; }
    aside.semantic-callout { margin: 2em 0; padding: 1em; border-left: 4px solid #f59e0b; background: #fffbeb; font-style: italic; page-break-inside: avoid; }
    blockquote.semantic-takeaway { margin: 2em 0; padding: 1em; border: 1px solid #6366f1; background: #e0e7ff; text-align: center; font-weight: bold; border-radius: 8px; page-break-inside: avoid; }
    section.chapter { page-break-before: always; }
  `;
  zip.file('OEBPS/styles/style.css', styleCss);

  // Content files
  allItems.forEach((item, index) => {
    // Semantic wrapper
    const isChapter = chapters.some(c => c.id === item.id);
    const sectionClass = isChapter ? "chapter" : "frontmatter";

    const docElement = document.createElement('div');
    docElement.innerHTML = item.content;
    
    // Convert Semantic Blocks
    const callouts = docElement.querySelectorAll('div[data-type="callout"]');
    callouts.forEach(c => {
       const aside = document.createElement('aside');
       aside.className = 'semantic-callout';
       aside.innerHTML = c.innerHTML;
       c.parentNode?.replaceChild(aside, c);
    });

    const takeaways = docElement.querySelectorAll('div[data-type="takeaway"]');
    takeaways.forEach(c => {
       const bq = document.createElement('blockquote');
       bq.className = 'semantic-takeaway';
       bq.innerHTML = c.innerHTML;
       c.parentNode?.replaceChild(bq, c);
    });
    
    let processedContent = docElement.innerHTML;

    const xhtml = `<?xml version="1.0" encoding="UTF-8"?>
<html xmlns="http://www.w3.org/1999/xhtml">
  <head>
    <title>${item.title}</title>
    <link href="../styles/style.css" rel="stylesheet" type="text/css"/>
  </head>
  <body>
    <section epub:type="${isChapter ? 'chapter' : 'frontmatter'}" class="${sectionClass}">
      <h1>${item.title}</h1>
      ${processedContent}
    </section>
  </body>
</html>`;
    zip.file(`OEBPS/text/item${index}.xhtml`, xhtml);
  });

  const content = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(content);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${projectMeta.title.replace(/\s+/g, '_')}.epub`;
  a.click();
  URL.revokeObjectURL(url);
};

