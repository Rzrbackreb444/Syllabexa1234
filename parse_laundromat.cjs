const fs = require('fs');

const rawText = fs.readFileSync('./raw_manuscript.txt', 'utf8');

function parseMarkdown(markdown) {
  let html = markdown
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
  
  html = html.replace(/^## (.*?)$/gm, '<h2>$1</h2>');
  html = html.replace(/^# (.*?)$/gm, '<h2>$1</h2>');
  html = html.replace(/^### (.*?)$/gm, '<h3>$1</h3>');
  
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
  
  html = html.replace(/^&gt;\s*\[!(NOTE|WARNING|TIP|DOCTRINE)\]\s*(.*?)$/gm, '<div class="callout-block callout-$1"><p><strong>$1:</strong> $2</p></div>');
  html = html.replace(/^&gt; (.*?)$/gm, '<blockquote><p>$1</p></blockquote>');
  
  html = html.replace(/^\s*[-*] (.*?)$/gm, '<ul><li>$1</li></ul>');
  html = html.replace(/<\/ul>\s*<ul>/g, '');
  
  const paragraphs = html.split(/\n\n+/);
  return paragraphs.map(p => {
    p = p.trim();
    if (!p) return '';
    if (p.startsWith('<h') || p.startsWith('<ul') || p.startsWith('<blockquote') || p.startsWith('<div')) {
      return p;
    }
    return `<p>${p.replace(/\n/g, '<br/>')}</p>`;
  }).filter(Boolean).join('');
}

// split at '---' or '<h2>'
const sections = rawText.split(/^---\s*$/m);

const chapters = [];
let idCounter = 1;

for (const section of sections) {
  if (!section.trim()) continue;
  
  const html = parseMarkdown(section);
  
  // try to extract title from first <h2>
  let title = "Untitled Chapter";
  const titleMatch = html.match(/<h2>(.*?)<\/h2>/);
  if (titleMatch) {
    title = titleMatch[1];
  } else if (html.includes("copyright-page")) {
    title = "Copyright Page";
  }

  // extract content (remove title if it's there)
  let content = html;
  if (titleMatch) {
    content = html.replace(/<h2>.*?<\/h2>/, '').trim();
  }
  
  chapters.push({
    id: `laundromat-ch-${idCounter++}-${Date.now()}`,
    title: title.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>'),
    content
  });
}

const output = {
  chapters,
  metadata: {
    title: "The Laundromat Doctrine",
    subtitle: "A Three-Generation Blueprint for Building an Automated Coin-Op Empire",
    author: "Nicholas Kremers & Lawrence Larsen",
    trimSize: "6x9"
  }
};

fs.writeFileSync('./src/data/laundromat_doctrine.json', JSON.stringify(output, null, 2));
console.log('Successfully wrote laundromat_doctrine.json with ' + chapters.length + ' chapters.');
