const fs = require('fs');
const file = './src/components/BookThemeBuilder.tsx';
let content = fs.readFileSync(file, 'utf8');

const saveFunction = `
  const handleSaveTheme = useCallback(() => {
    manuscript.updatePrepressRules({
      fontBody: selectedFontBody,
      fontHeading: selectedFontHeading
    });
    showToast('Typography theme & prepress rules saved successfully!', 'success');
  }, [manuscript, selectedFontBody, selectedFontHeading, showToast]);
`;

if (!content.includes('handleSaveTheme')) {
  content = content.replace(
    `const handleApplyThemePreset = useCallback((preset: ThemePreset) => {`,
    `${saveFunction}\n\n  const handleApplyThemePreset = useCallback((preset: ThemePreset) => {`
  );
}

content = content.replace(
  `onClick={() => showToast('Typography theme & prepress rules saved successfully!', 'success')}`,
  `onClick={handleSaveTheme}`
);

fs.writeFileSync(file, content);
console.log('BookThemeBuilder patched');
