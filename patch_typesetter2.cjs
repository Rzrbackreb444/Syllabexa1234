const fs = require('fs');
let code = fs.readFileSync('src/components/TypesetterSimulator.tsx', 'utf8');

const regexToReplace = /<label className="flex items-center justify-between cursor-pointer">\s*<span className="text-xs text-slate-300 flex items-center gap-2"><ScanLine className="w-3 h-3" \/> Show Safe Margins<\/span>\s*<input type="checkbox" checked=\{showTrimLines\} onChange=\{\(e\) => setShowTrimLines\(e\.target\.checked\)\} className="accent-indigo-500" \/>\s*<\/label>/;

const newCheckboxes = `
                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="text-xs text-slate-300 flex items-center gap-2"><ScanLine className="w-3 h-3" /> Show Safe Margins</span>
                    <input type="checkbox" checked={showTrimLines} onChange={(e) => setShowTrimLines(e.target.checked)} className="accent-indigo-500" />
                  </label>
                </div>
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 mt-2">
                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="text-xs text-amber-200 flex items-center gap-2"><ScanLine className="w-3 h-3" /> Layout Warnings (Orphans)</span>
                    <input type="checkbox" checked={showOrphans} onChange={(e) => setShowOrphans(e.target.checked)} className="accent-amber-500" />
                  </label>
`;

code = code.replace(regexToReplace, newCheckboxes);
fs.writeFileSync('src/components/TypesetterSimulator.tsx', code);
