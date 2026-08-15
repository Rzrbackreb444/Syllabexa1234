const fs = require('fs');
let serverCode = fs.readFileSync('server.ts', 'utf8');

const badImports = `import PDFDocument from 'pdfkit';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, PageBreak, AlignmentType } from 'docx';`;

serverCode = serverCode.replace(badImports, '');

const topImports = `import PDFDocument from 'pdfkit';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, PageBreak, AlignmentType } from 'docx';
`;

serverCode = topImports + serverCode;

fs.writeFileSync('server.ts', serverCode);
