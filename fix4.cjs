const fs = require('fs');

let layoutCode = fs.readFileSync('src/AppLayout.tsx', 'utf8');

const mobileMenuBefore = "{ id: 'pipeline', icon: <Cpu size={14} className=\"text-indigo-400\" />, label: 'AI' },";
const mobileMenuAfter = "{ id: 'commerce', icon: <Store size={14} className=\"text-amber-400\" />, label: 'Commerce' },\n                { id: 'theme-builder', icon: <Palette size={14} className=\"text-emerald-400\" />, label: 'Themes' },\n                { id: 'pipeline', icon: <Cpu size={14} className=\"text-indigo-400\" />, label: 'AI' },";
layoutCode = layoutCode.replace(mobileMenuBefore, mobileMenuAfter);

fs.writeFileSync('src/AppLayout.tsx', layoutCode);
