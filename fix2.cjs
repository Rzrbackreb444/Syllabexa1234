const fs = require('fs');

let layoutCode = fs.readFileSync('src/AppLayout.tsx', 'utf8');

// Replace duplicate commerce entries
layoutCode = layoutCode.replace(
  "{ id: 'commerce', icon: <Store size={14} className=\"text-amber-400\" />, label: 'Commerce' },\n              { id: 'commerce', icon: <Store size={14} className=\"text-amber-400\" />, label: 'Commerce' },\n                { id: 'pipeline', icon: <Cpu size={14} className=\"text-indigo-400\" />, label: 'AI' },",
  "{ id: 'commerce', icon: <Store size={14} className=\"text-amber-400\" />, label: 'Commerce' },\n              { id: 'pipeline', icon: <Cpu size={14} className=\"text-indigo-400\" />, label: 'AI' },"
);

fs.writeFileSync('src/AppLayout.tsx', layoutCode);
