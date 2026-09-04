const fs = require('fs');
const file = './src/services/exportEngine.ts';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  `margin:       [0.8, 0.6, 0.8, 1.0],`,
  `margin:       [0.8, 0.6, 0.8, 1.0] as [number, number, number, number],`
);

content = content.replace(
  `const buffer = await epubGen(options);`,
  `// @ts-ignore\n    const buffer = await epubGen(options, epubChapters);`
);

fs.writeFileSync(file, content);
