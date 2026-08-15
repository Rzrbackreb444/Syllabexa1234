const fs = require('fs');
const file = './src/store/manuscriptStore.ts';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  `projectMeta: metadata,`,
  `projectMeta: metadata,\n            prepressRules: {\n              ...defaultPrepressRules,\n              fontBody: "Source Serif 4",\n              fontHeading: "Playfair Display",\n              baseFontSize: "11pt",\n              baseLeading: "15pt",\n              margins: { top: "0.8in", bottom: "0.8in", inside: "1.0in", outside: "0.6in" },\n              chapterStartOnRight: true,\n              hyphenation: true\n            },`
);

fs.writeFileSync(file, content);
console.log('patched manuscriptStore.ts for professional theme on load');
