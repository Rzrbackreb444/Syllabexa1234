const fs = require('fs');
const file = './src/components/TypesetterSimulator.tsx';
let content = fs.readFileSync(file, 'utf8');

const effect = `
  useEffect(() => {
    if (prepressRules) {
      setTypo(prev => ({
        ...prev,
        fontFamily: prepressRules.fontBody || prev.fontFamily,
      }));
    }
  }, [prepressRules]);
`;

if (!content.includes('fontFamily: prepressRules.fontBody')) {
  // It shouldn't get here unless my first patch didn't include the effect, which it didn't.
}

content = content.replace(
  `useEffect(() => {\n    if (isDragging)`,
  `${effect}\n  useEffect(() => {\n    if (isDragging)`
);

fs.writeFileSync(file, content);
console.log('TypesetterSimulator effect patched');
