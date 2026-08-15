const fs = require('fs');
let code = fs.readFileSync('src/components/SyllabexaBilling.tsx', 'utf8');

code = code.replace(/\{pack\.id === "tokens_5" \? "MOST POPULAR" : "BEST VALUE"\}<\/span>/, 
  '<span className="bg-indigo-500 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">{(pack as any).popular ? "MOST POPULAR" : "BEST VALUE"}</span>');

fs.writeFileSync('src/components/SyllabexaBilling.tsx', code);
