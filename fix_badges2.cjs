const fs = require('fs');
let code = fs.readFileSync('src/components/SyllabexaBilling.tsx', 'utf8');

// replace the tokenPacks definition
const oldPacks = `const tokenPacks = [
  { id: 'tokens_1', name: 'Starter Reserve', price: 49, description: '~1-2 Books', tokens: '10M Compute Credits' },
  { id: 'tokens_5', name: 'Pro Reserve', price: 149, description: '~5 Books', popular: true, tokens: '50M Compute Credits' },
  { id: 'tokens_10', name: 'Enterprise Reserve', price: 399, description: '~15 Books (Best Value)', tokens: '100M Compute Credits' }
];`;

const newPacks = `const tokenPacks = [
  { id: 'tokens_1', name: 'Starter Reserve', price: 49, description: '~1-2 Books', tokens: '10M Compute Credits' },
  { id: 'tokens_5', name: 'Pro Reserve', price: 149, description: '~5 Books', popular: true, tokens: '50M Compute Credits' },
  { id: 'tokens_10', name: 'Enterprise Reserve', price: 399, description: '~15 Books', bestValue: true, tokens: '100M Compute Credits' }
];`;
code = code.replace(oldPacks, newPacks);

// fix JSX
code = code.replace(/<div key=\{pack\.id\} className=\{`relative p-6 rounded-2xl border \$\{pack\.popular \? 'bg-indigo-500\/10 border-indigo-500' : 'bg-slate-950 border-slate-800'\}`\}>/,
  "<div key={pack.id} className={`relative p-6 rounded-2xl border ${(pack as any).popular || (pack as any).bestValue ? 'bg-indigo-500/10 border-indigo-500' : 'bg-slate-950 border-slate-800'}`}>");

code = code.replace(/\{pack\.popular && \(/, "{((pack as any).popular || (pack as any).bestValue) && (");

code = code.replace(/<span className="bg-indigo-500 text-white text-\[10px\] font-black px-3 py-1 rounded-full uppercase tracking-widest">\{pack.id === "tokens_5" \? "MOST POPULAR" : "BEST VALUE"\}<\/span><\/span>/,
  '<span className="bg-indigo-500 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">{(pack as any).popular ? "MOST POPULAR" : "BEST VALUE"}</span>');

fs.writeFileSync('src/components/SyllabexaBilling.tsx', code);
