const fs = require('fs');

let af = fs.readFileSync('src/components/AffiliateDashboard.tsx', 'utf8');
af = af.replace(/\\\$/g, '$');
af = af.replace(/\\`/g, '`');
fs.writeFileSync('src/components/AffiliateDashboard.tsx', af);

let cm = fs.readFileSync('src/components/SyllabexaCommerceEngine.tsx', 'utf8');
cm = cm.replace(/\\\$/g, '$');
cm = cm.replace(/\\`/g, '`');
fs.writeFileSync('src/components/SyllabexaCommerceEngine.tsx', cm);
