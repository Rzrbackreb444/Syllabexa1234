const fs = require('fs');
let serverCode = fs.readFileSync('server.ts', 'utf8');

const oldPdfRouteRegex = /app\.post\("\/api\/export\/pdf", express\.json\(\{ limit: '50mb' \}\), async \(req, res\) => {[\s\S]*?doc\.end\(\);\n  \} catch \(err: any\) {\n    res\.status\(500\)\.json\(\{ error: err\.message \}\);\n  \}\n\}\);/g;

const newPdfRoute = `app.post("/api/export/pdf", express.json({ limit: '50mb' }), async (req, res) => {
  try {
    const { title, chapters, paperType = 'white' } = req.body;
    
    // 2026 KDP Prepress Constants
    const BLEED = 0.125 * 72; // 0.125 inches in points
    const WIDTH = 6 * 72; // 6 inches
    const HEIGHT = 9 * 72; // 9 inches
    
    // Calculate page count (approximate for spine width, assuming 1 page per 250 words)
    let totalWords = 0;
    if (chapters && Array.isArray(chapters)) {
      chapters.forEach(c => totalWords += (c.content || '').split(/\\s+/).length);
    }
    const estimatedPageCount = Math.max(1, Math.ceil(totalWords / 250));
    
    // Spine width calculation based on 2026 KDP formulas
    let spineWidthInches = 0;
    if (paperType === 'cream') {
      spineWidthInches = (estimatedPageCount * 0.0025) + 0.06;
    } else {
      spineWidthInches = (estimatedPageCount * 0.002252) + 0.06;
    }
    const hasSpineText = estimatedPageCount >= 79;
    
    // Server-side PDF generation with exact KDP Bleed
    const doc = new PDFDocument({
      size: [WIDTH + (BLEED * 2), HEIGHT + (BLEED * 2)], // Width + outer bleeds
      margins: { top: 72, bottom: 72, left: 72 + BLEED, right: 72 + BLEED } 
    });
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="Syllabexa_Master.pdf"');
    res.setHeader('X-KDP-Spine-Width', spineWidthInches.toFixed(4));
    res.setHeader('X-KDP-Page-Count', estimatedPageCount.toString());
    res.setHeader('X-KDP-Spine-Text', hasSpineText ? 'Allowed' : 'Rejected');
    
    doc.pipe(res);
    
    // Prepress Report Page
    doc.font('Helvetica-Bold').fontSize(16).text('KDP PREPRESS TELEMETRY REPORT', { align: 'center' });
    doc.moveDown(1);
    doc.font('Helvetica').fontSize(12).text(\`Trim Size: 6" x 9"\`);
    doc.text(\`Bleed: 0.125" on all outer edges\`);
    doc.text(\`Paper Type: \${paperType}\`);
    doc.text(\`Estimated Page Count: \${estimatedPageCount}\`);
    doc.text(\`Required Spine Width: \${spineWidthInches.toFixed(4)} inches\`);
    doc.text(\`Spine Text: \${hasSpineText ? 'APPROVED (>= 79 pages)' : 'REJECTED (Requires 79+ pages)'}\`);
    doc.moveDown(2);
    
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
});`;

serverCode = serverCode.replace(oldPdfRouteRegex, newPdfRoute);
fs.writeFileSync('server.ts', serverCode);
