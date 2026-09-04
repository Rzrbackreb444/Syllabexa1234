const fs = require('fs');
const file = './src/components/TypesetterSimulator.tsx';
let content = fs.readFileSync(file, 'utf8');

// If not already there
if (!content.includes('simulateMultipassLayout')) {
  // Let's find a good place to put it. Around the prepressWorker useEffect.
  const searchStr = `  useEffect(() => {\n    const rawText = chapters[0]?.content`;
  
  const replaceStr = `  const simulateMultipassLayout = async (containerNode) => {
    return new Promise(resolve => {
      setTimeout(() => {
        const images = containerNode.querySelectorAll('img');
        images.forEach(img => {
          if (img.width > 400 || img.classList.contains('full-bleed')) {
            img.style.pageBreakBefore = 'always';
            img.style.pageBreakAfter = 'always';
          }
        });
        
        const paragraphs = containerNode.querySelectorAll('p, div');
        paragraphs.forEach(p => {
          p.style.orphans = '3';
          p.style.widows = '3';
          p.style.textAlign = 'justify';
        });

        resolve(true);
      }, 600);
    });
  };

  useEffect(() => {
    const rawText = chapters[0]?.content`;

  content = content.replace(searchStr, replaceStr);
  fs.writeFileSync(file, content);
  console.log('Patched TypesetterSimulator.tsx');
}
