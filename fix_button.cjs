const fs = require('fs');
let code = fs.readFileSync('src/components/SyllabexaBilling.tsx', 'utf8');

code = code.replace(/className=\{`w-full py-3 rounded-lg font-bold text-sm tracking-wide transition-all disabled:opacity-50 \$\{pack\.popular \? 'bg-indigo-500 hover:bg-indigo-400 text-white' : 'bg-slate-800 hover:bg-slate-700 text-white'\}`\}/,
  'className={`w-full py-3 rounded-lg font-bold text-sm tracking-wide transition-all disabled:opacity-50 ${(pack as any).popular || (pack as any).bestValue ? "bg-indigo-500 hover:bg-indigo-400 text-white" : "bg-slate-800 hover:bg-slate-700 text-white"}`}');

fs.writeFileSync('src/components/SyllabexaBilling.tsx', code);
