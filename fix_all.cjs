const fs = require('fs');
let file = './src/store/manuscriptStore.ts';
let content = fs.readFileSync(file, 'utf8');

if (!content.includes('stateLedger: string;')) {
  content = content.replace(
    `interface ManuscriptState {`,
    `interface ManuscriptState {\n  stateLedger: string;\n  updateStateLedger: (ledger: string) => void;`
  );
  fs.writeFileSync(file, content);
}

file = './src/services/exportEngine.ts';
content = fs.readFileSync(file, 'utf8');
content = content.replace(
  `{ type: 'jpeg', quality: 0.98 }`,
  `{ type: 'jpeg' as const, quality: 0.98 }`
);
fs.writeFileSync(file, content);
