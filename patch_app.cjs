const fs = require('fs');

// Patch AppLayout.tsx
let layoutCode = fs.readFileSync('src/AppLayout.tsx', 'utf8');

// Add the Commerce icon import
if (!layoutCode.includes('Store,')) {
  layoutCode = layoutCode.replace('import { ', 'import { Store, ');
}

// Add the route normalization
layoutCode = layoutCode.replace(
  "if (sub === 'workspace') return 'workspace';",
  "if (sub === 'workspace') return 'workspace';\n    if (sub === 'commerce') return 'commerce';"
);

layoutCode = layoutCode.replace(
  "else if (view === 'workspace') navigate('/app/workspace');",
  "else if (view === 'workspace') navigate('/app/workspace');\n    else if (view === 'commerce') navigate('/app/commerce');"
);

// Add to operator sidebar
const operatorSidebarBefore = "{ id: 'pipeline', icon: <Cpu size={14} className=\"text-indigo-400\" />, label: 'AI' },";
const operatorSidebarAfter = "{ id: 'commerce', icon: <Store size={14} className=\"text-amber-400\" />, label: 'Commerce' },\n              { id: 'pipeline', icon: <Cpu size={14} className=\"text-indigo-400\" />, label: 'AI' },";
layoutCode = layoutCode.replace(operatorSidebarBefore, operatorSidebarAfter);

// Add to mobile menu
const mobileMenuBefore = "{ id: 'pipeline', icon: <Cpu size={14} className=\"text-indigo-400\" />, label: 'AI' },";
const mobileMenuAfter = "{ id: 'commerce', icon: <Store size={14} className=\"text-amber-400\" />, label: 'Commerce' },\n                { id: 'pipeline', icon: <Cpu size={14} className=\"text-indigo-400\" />, label: 'AI' },";
layoutCode = layoutCode.replace(mobileMenuBefore, mobileMenuAfter);

fs.writeFileSync('src/AppLayout.tsx', layoutCode);

// Patch App.tsx
let appCode = fs.readFileSync('src/App.tsx', 'utf8');
if (!appCode.includes('SyllabexaCommerceEngine')) {
  appCode = appCode.replace(
    "import BookThemeBuilder from './components/BookThemeBuilder';",
    "import BookThemeBuilder from './components/BookThemeBuilder';\nimport SyllabexaCommerceEngine from './components/SyllabexaCommerceEngine';"
  );
  
  appCode = appCode.replace(
    "<Route path=\"theme-builder\" element={<ProtectedProRoute><BookThemeBuilder /></ProtectedProRoute>} />",
    "<Route path=\"theme-builder\" element={<ProtectedProRoute><BookThemeBuilder /></ProtectedProRoute>} />\n                <Route path=\"commerce\" element={<ProtectedProRoute><SyllabexaCommerceEngine /></ProtectedProRoute>} />"
  );
  
  fs.writeFileSync('src/App.tsx', appCode);
}
