const fs = require('fs');
const file = './src/App.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  '<Route index element={<ProtectedProRoute><DashboardHub /></ProtectedProRoute>} />',
  '<Route index element={<ProtectedAuthRoute><DashboardHub /></ProtectedAuthRoute>} />'
);

content = content.replace(
  '<Route path="editor" element={<ProtectedProRoute><EditorWorkspace /></ProtectedProRoute>} />',
  '<Route path="editor" element={<ProtectedAuthRoute><EditorWorkspace /></ProtectedAuthRoute>} />'
);

content = content.replace(
  '<Route path="typesetter" element={<ProtectedProRoute><TypesetterSimulator /></ProtectedProRoute>} />',
  '<Route path="typesetter" element={<ProtectedAuthRoute><TypesetterSimulator /></ProtectedAuthRoute>} />'
);

fs.writeFileSync(file, content);
console.log('Patched App.tsx routes');
