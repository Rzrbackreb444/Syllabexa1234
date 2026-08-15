const fs = require('fs');

let file = fs.readFileSync('src/components/SyllabexaBilling.tsx', 'utf8');

const oldTokenPacks = `const tokenPacks = [
  { id: 'tokens_1', name: '10M Tokens', price: 15, description: 'Approx. 2-3 standard length books.' },
  { id: 'tokens_5', name: '50M Tokens', price: 60, description: 'Approx. 10-15 standard length books.', popular: true },
  { id: 'tokens_10', name: '100M Tokens', price: 100, description: 'Bulk package for heavy production.' }
];`;

const newTokenPacks = `const tokenPacks = [
  { id: 'tokens_1', name: 'Starter Pack (10M Tokens)', price: 19, description: 'Approx. 2-3 standard length books.' },
  { id: 'tokens_5', name: 'Master Pack (50M Tokens)', price: 49, description: 'Approx. 10-15 standard length books.', popular: true },
  { id: 'tokens_10', name: 'Enterprise Pack (100M Tokens)', price: 149, description: 'Bulk package for heavy production.' }
];`;

file = file.replace(oldTokenPacks, newTokenPacks);
fs.writeFileSync('src/components/SyllabexaBilling.tsx', file);
