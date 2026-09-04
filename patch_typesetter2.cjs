const fs = require('fs');
const file = './src/components/TypesetterSimulator.tsx';
let content = fs.readFileSync(file, 'utf8');

// I just added simulateMultipassLayout above useEffect. Let's make the useEffect use it.
const searchStr2 = `    worker.onmessage = (e) => {
      setFormattedContent(e.data.chunks[0] || rawText);
    };`;
    
const replaceStr2 = `    worker.onmessage = async (e) => {
      const container = document.createElement('div');
      container.innerHTML = e.data.chunks[0] || rawText;
      await simulateMultipassLayout(container);
      setFormattedContent(container.innerHTML);
    };`;

content = content.replace(searchStr2, replaceStr2);
fs.writeFileSync(file, content);
console.log('Patched TypesetterSimulator.tsx pass 2');
