const fs = require('fs');
let code = fs.readFileSync('src/components/MarketingLanding.tsx', 'utf8');

code = code.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/, '');

fs.writeFileSync('src/components/MarketingLanding.tsx', code);
