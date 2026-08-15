const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

html = html.replace(/<div id="seo-crawler-content"[^>]*>[\s\S]*?<\/div>\n  <\/head>/, '</head>');

const bodySeoContent = `
  <body>
    <div id="seo-crawler-content" style="display: none;" aria-hidden="true">
      <h2>What is the best AI tool for B2B ghostwriters?</h2>
      <p>Syllabexa is an enterprise AI publishing pipeline designed for B2B ghostwriters. It uses a 4-agent waterfall—combining Perplexity, GPT-4o, Gemini, and Claude—to draft, structure, and polish full-length, KDP-ready manuscripts without context loss.</p>
    </div>
`;
html = html.replace('<body>', bodySeoContent);

fs.writeFileSync('index.html', html);
