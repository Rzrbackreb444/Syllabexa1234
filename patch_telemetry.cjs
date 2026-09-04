const fs = require('fs');
const file = './src/components/ManuscriptEditor.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  `<div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" title="Simulation Ledger Active" />`,
  `<div className="flex items-center gap-1.5 px-1.5 py-0.5 rounded bg-amber-500/20 border border-amber-500/50" title="Simulation Ledger Active">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                    <span className="text-[9px] font-bold text-amber-500 uppercase tracking-widest">Simulated</span>
                  </div>`
);

fs.writeFileSync(file, content);
