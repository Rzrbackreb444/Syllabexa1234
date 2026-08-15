const fs = require('fs');
const file = './src/components/QuickStartDashboard.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  `loadSampleManuscript(strokeRecoveryData.metadata, strokeRecoveryData.chapters);`,
  `loadSampleManuscript(strokeRecoveryData.metadata as any, strokeRecoveryData.chapters as any);`
);

fs.writeFileSync(file, content);
console.log('patched cast');
