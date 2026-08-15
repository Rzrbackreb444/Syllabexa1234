const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// Import blogs
if (!code.includes("import { blogs } from './src/data/blogs';")) {
  code = code.replace(/import express from "express";/, 'import express from "express";\nimport { blogs } from "./src/data/blogs";\nimport fs from "fs";');
}

// Replace the standard fallback
const standardFallback = `    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });`;

const newFallback = `    app.get('*', (req, res) => {
      let indexPath = path.join(distPath, 'index.html');
      if (!fs.existsSync(indexPath)) {
        indexPath = path.join(process.cwd(), 'index.html');
      }
      
      let html = fs.readFileSync(indexPath, 'utf8');
      
      if (req.path.startsWith('/blog/')) {
        const slug = req.path.split('/')[2];
        const blog = blogs.find(b => b.slug === slug);
        if (blog) {
          const jsonLd = {
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            "mainEntityOfPage": {
              "@type": "WebPage",
              "@id": \`https://syllabexa.com/blog/\${blog.slug}\`
            },
            "headline": blog.seoTitle || blog.title,
            "description": blog.seoDescription,
            "image": \`https://syllabexa.com\${blog.featuredImage}\`,
            "author": { "@type": "Organization", "name": blog.author },
            "publisher": { "@type": "Organization", "name": "Syllabexa", "logo": { "@type": "ImageObject", "url": "https://syllabexa.com/logo.png" } }
          };
          
          html = html.replace(/<title>.*?<\\/title>/, \`<title>\${blog.seoTitle || blog.title}</title>\\n<meta name="description" content="\${blog.seoDescription}" />\\n<script type="application/ld+json">\${JSON.stringify(jsonLd)}</script>\`);
          html = html.replace(/<div id="seo-crawler-content"[^>]*>[\\s\\S]*?<\\/div>/, \`<div id="seo-crawler-content" style="display: none;" aria-hidden="true"><h1>\${blog.seoTitle || blog.title}</h1><p>\${blog.seoDescription}</p>\${blog.content}</div>\`);
        }
      }
      
      res.send(html);
    });`;

if (code.includes(standardFallback)) {
  code = code.replace(standardFallback, newFallback);
} else {
  console.log("Could not find standard fallback. Searching for app.get('*'");
}

fs.writeFileSync('server.ts', code);
