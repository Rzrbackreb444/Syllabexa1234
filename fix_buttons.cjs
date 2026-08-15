const fs = require('fs');

let file = fs.readFileSync('src/components/TypesetterSimulator.tsx', 'utf8');

const oldButtonStr = `<button onClick={() => window.dispatchEvent(new Event('syllabexa-export-pdf'))} className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold rounded-lg transition-all shadow-[0_0_20px_rgba(79,70,229,0.3)] flex items-center gap-2 cursor-pointer">
              <Download size={14} /> Export Master PDF
            </button>`;

const newButtonStr = `<button onClick={() => window.dispatchEvent(new Event('syllabexa-export-docx'))} className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 text-sm font-bold rounded-lg transition-all flex items-center gap-2 cursor-pointer">
              <Download size={14} /> DOCX
            </button>
            <button onClick={() => window.dispatchEvent(new Event('syllabexa-export-pdf'))} className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold rounded-lg transition-all shadow-[0_0_20px_rgba(79,70,229,0.3)] flex items-center gap-2 cursor-pointer">
              <Download size={14} /> Export CMYK PDF
            </button>`;

file = file.replace(oldButtonStr, newButtonStr);
fs.writeFileSync('src/components/TypesetterSimulator.tsx', file);
