const fs = require('fs');
let serverCode = fs.readFileSync('server.ts', 'utf8');

serverCode = serverCode.replace(/mode: isTopUp \? "payment" : "subscription",/, 'mode: "subscription",');
fs.writeFileSync('server.ts', serverCode);
