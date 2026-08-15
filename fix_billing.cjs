const fs = require('fs');

let file = fs.readFileSync('src/components/SyllabexaBilling.tsx', 'utf8');

const oldTokenPacksRegex = /const tokenPacks = \[\s*\{[\s\S]*?\}\s*\];/;
const newTokenPacks = `const tokenPacks = [
  { id: 'tokens_1', name: 'Starter Reserve', price: 49, description: '~1-2 Books (High margin)', tokens: '10M Compute Credits' },
  { id: 'tokens_5', name: 'Pro Reserve', price: 149, description: '~5 Books', popular: true, tokens: '50M Compute Credits' },
  { id: 'tokens_10', name: 'Enterprise Reserve', price: 399, description: '~15 Books (Best Value)', tokens: '100M Compute Credits' }
];`;

file = file.replace(oldTokenPacksRegex, newTokenPacks);

file = file.replace(/const \[billingInterval, setBillingInterval\] = useState<'month' \| 'year'>\('month'\);/, "const [billingInterval, setBillingInterval] = useState<'month' | 'year'>('year');");

file = file.replace(/Annual Billing <span className="text-\[10px\] bg-emerald-500\/20 text-emerald-400 px-2 py-0\.5 rounded-full uppercase tracking-wider">Save 20%<\/span>/, 'Annual Billing <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full uppercase tracking-wider">2 Months Free</span>');

file = file.replace(/<Coins size=\{16\} \/> Token Top-Ups/, '<Coins size={16} /> Compute Credits');

file = file.replace(/<h2 className="text-3xl font-serif font-black text-white mb-2">Token Reserves<\/h2>/, '<h2 className="text-3xl font-serif font-black text-white mb-2">Compute Credits</h2>');

file = file.replace(/Once you exceed your monthly baseline tokens, top-up packs allow you to continue generating without interruption\. Tokens never expire as long as your base subscription is active\./, 'Once you exceed your monthly baseline compute credits, reserve packs allow you to continue generating without interruption. Credits never expire as long as your base subscription is active.');

file = file.replace(/'Buy Tokens'/, "'Buy Credits'");

fs.writeFileSync('src/components/SyllabexaBilling.tsx', file);
