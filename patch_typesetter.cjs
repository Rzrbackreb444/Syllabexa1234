const fs = require('fs');
const file = './src/components/TypesetterSimulator.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  `const [typo, setTypo] = useState<TypographySpecs>(DEFAULT_BOOK_TYPOGRAPHY);`,
  `const prepressRules = useManuscriptStore((state) => state.prepressRules);\n  const [typo, setTypo] = useState<TypographySpecs>({\n    ...DEFAULT_BOOK_TYPOGRAPHY,\n    fontFamily: prepressRules?.fontBody || DEFAULT_BOOK_TYPOGRAPHY.fontFamily,\n  });`
);

fs.writeFileSync(file, content);
console.log('TypesetterSimulator patched');
