const fs = require('fs');
const file = './src/store/manuscriptStore.ts';
let content = fs.readFileSync(file, 'utf8');

if (!content.includes('stateLedger: string;')) {
  content = content.replace(
    `export interface ManuscriptState {`,
    `export interface ManuscriptState {\n  stateLedger: string;\n  updateStateLedger: (ledger: string) => void;`
  );
}

fs.writeFileSync(file, content);
