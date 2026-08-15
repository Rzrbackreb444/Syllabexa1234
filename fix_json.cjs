const fs = require('fs');
const data = JSON.parse(fs.readFileSync('./src/data/stroke_recovery_bible.json', 'utf8'));
data.metadata.trimSize = "6x9";
fs.writeFileSync('./src/data/stroke_recovery_bible.json', JSON.stringify(data, null, 2));
