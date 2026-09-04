const fs = require('fs');
const file = './src/lib/AuthContext.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  `activePlan: 'free' | 'pro' | 'enterprise';`,
  `activePlan: 'free' | 'pro' | 'agency' | 'enterprise';`
);

content = content.replace(
  `const isPro = true; // Instant full access for all signed-in users`,
  `const isPro = profile?.activePlan === 'pro' || profile?.activePlan === 'agency' || profile?.activePlan === 'enterprise';`
);

fs.writeFileSync(file, content);
console.log('Patched AuthContext.tsx');
