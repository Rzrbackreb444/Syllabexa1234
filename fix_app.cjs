const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Import SyllabexaBlogPost
if (!code.includes('import SyllabexaBlogPost')) {
  code = code.replace(/import SyllabexaBlogHub from '.\/components\/SyllabexaBlogHub';/, 
    "import SyllabexaBlogHub from './components/SyllabexaBlogHub';\nimport SyllabexaBlogPost from './components/SyllabexaBlogPost';");
}

// Add the routes
if (!code.includes('<Route path="/blog"')) {
  code = code.replace(/<Route path="\/terms" element=\{<TermsOfService \/>\} \/>/, 
    '<Route path="/terms" element={<TermsOfService />} />\n          <Route path="/blog" element={<SyllabexaBlogHub />} />\n          <Route path="/blog/:slug" element={<SyllabexaBlogPost />} />');
}

fs.writeFileSync('src/App.tsx', code);
