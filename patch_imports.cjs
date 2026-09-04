const fs = require('fs');
const file = './src/components/ManuscriptEditor.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  `} from 'lucide-react';`,
  `, X, Database, Hexagon} from 'lucide-react';`
);

fs.writeFileSync(file, content);
console.log('Patched imports in ManuscriptEditor.tsx');
