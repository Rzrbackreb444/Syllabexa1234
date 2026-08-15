const fs = require('fs');

let layoutCode = fs.readFileSync('src/AppLayout.tsx', 'utf8');

const opSidebarBefore = "{ id: 'commerce', icon: <Store size={14} className=\"text-amber-400\" />, label: 'Commerce' },";
const opSidebarAfter = "{ id: 'commerce', icon: <Store size={14} className=\"text-amber-400\" />, label: 'Commerce' },\n              { id: 'theme-builder', icon: <Palette size={14} className=\"text-emerald-400\" />, label: 'Themes' },";
layoutCode = layoutCode.replace(opSidebarBefore, opSidebarAfter);

// Add the route normalization
layoutCode = layoutCode.replace(
  "if (sub === 'commerce') return 'commerce';",
  "if (sub === 'commerce') return 'commerce';\n    if (sub === 'theme-builder') return 'theme-builder';"
);

layoutCode = layoutCode.replace(
  "else if (view === 'commerce') navigate('/app/commerce');",
  "else if (view === 'commerce') navigate('/app/commerce');\n    else if (view === 'theme-builder') navigate('/app/theme-builder');"
);

fs.writeFileSync('src/AppLayout.tsx', layoutCode);
