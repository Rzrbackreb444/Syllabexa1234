const fs = require('fs');

let serverCode = fs.readFileSync('server.ts', 'utf8');

const newRoutes = `
// ==========================================
// PREPRESS & TYPESETTING EXPORT ENGINE
// ==========================================
import PDFDocument from 'pdfkit';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, PageBreak, AlignmentType } from 'docx';

app.post("/api/export/pdf", express.json({ limit: '50mb' }), async (req, res) => {
  try {
    const { title, chapters } = req.body;
    
    // Server-side PDF generation (simulating Puppeteer/PrinceXML engine)
    const doc = new PDFDocument({
      size: [432, 648], // 6x9 inches in points (72ppi)
      margins: { top: 72, bottom: 72, left: 72, right: 72 } // Simulating KDP bleed/gutter
    });
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="Syllabexa_Master.pdf"');
    
    doc.pipe(res);
    
    doc.font('Times-Roman').fontSize(24).text(title || 'Syllabexa Manuscript', { align: 'center' });
    doc.moveDown(2);
    
    if (chapters && Array.isArray(chapters)) {
      for (const chapter of chapters) {
        doc.addPage();
        doc.font('Times-Bold').fontSize(18).text(chapter.title, { align: 'center' });
        doc.moveDown(2);
        
        doc.font('Times-Roman').fontSize(11).text(chapter.content || '', {
          align: 'justify',
          indent: 20,
          lineGap: 4
        });
      }
    }
    
    doc.end();
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/export/docx", express.json({ limit: '50mb' }), async (req, res) => {
  try {
    const { title, chapters } = req.body;
    
    const docChildren = [];
    docChildren.push(new Paragraph({
      text: title || 'Syllabexa Manuscript',
      heading: HeadingLevel.TITLE,
      alignment: AlignmentType.CENTER,
    }));
    docChildren.push(new Paragraph({ text: "", pageBreakBefore: true }));
    
    if (chapters && Array.isArray(chapters)) {
      for (const chapter of chapters) {
        docChildren.push(new Paragraph({
          text: chapter.title,
          heading: HeadingLevel.HEADING_1,
          alignment: AlignmentType.CENTER,
        }));
        
        const paragraphs = (chapter.content || '').split('\\n').filter(Boolean);
        for (const pText of paragraphs) {
          docChildren.push(new Paragraph({
            children: [new TextRun(pText)],
            alignment: AlignmentType.JUSTIFIED,
            indent: { firstLine: 720 }, // half inch
            spacing: { line: 360 } // 1.5 spacing
          }));
        }
        docChildren.push(new Paragraph({ text: "", pageBreakBefore: true }));
      }
    }

    const doc = new Document({
      sections: [{
        properties: {},
        children: docChildren,
      }],
    });

    const b64string = await Packer.toBase64String(doc);
    const buffer = Buffer.from(b64string, 'base64');
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', 'attachment; filename="Syllabexa_Master.docx"');
    res.send(buffer);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
`;

// Insert the new routes before app.listen
serverCode = serverCode.replace('app.listen(PORT, "0.0.0.0", () => {', newRoutes + '\n\n  app.listen(PORT, "0.0.0.0", () => {');
fs.writeFileSync('server.ts', serverCode);
