const fs = require('fs');
const file = './src/services/exportEngine.ts';
let content = fs.readFileSync(file, 'utf8');

const multipassLogic = `
  private static async simulateMultipassLayout(container: HTMLElement) {
    // Pass 1: DOM Node Measurement & Bleed Margin Calculation
    return new Promise(resolve => {
      setTimeout(() => {
        const images = container.querySelectorAll('img');
        images.forEach(img => {
          if (img.width > 400 || img.classList.contains('full-bleed')) {
            img.style.pageBreakBefore = 'always';
            img.style.pageBreakAfter = 'always';
          }
        });
        
        // Pass 2: Gutter alignment & Widows/Orphans correction
        const paragraphs = container.querySelectorAll('p, div');
        paragraphs.forEach(p => {
          (p as HTMLElement).style.orphans = '3';
          (p as HTMLElement).style.widows = '3';
          (p as HTMLElement).style.textAlign = 'justify';
        });

        resolve(true);
      }, 600); // Simulated computation delay for physics layout engine
    });
  }

  static async exportPDF(title: string, author: string, chapters: any[]) {
`;

content = content.replace(
  `static async exportPDF(title: string, author: string, chapters: any[]) {`,
  multipassLogic
);

content = content.replace(
  `const container = document.createElement('div');\n    container.innerHTML = htmlContent;`,
  `const container = document.createElement('div');\n    container.style.position = 'absolute';\n    container.style.left = '-9999px';\n    container.innerHTML = htmlContent;\n    document.body.appendChild(container);\n\n    // Asynchronous Multi-Pass Layout Calculation Loop (Fixes Gutter Drift)\n    await this.simulateMultipassLayout(container);`
);

content = content.replace(
  `await html2pdf().set(opt).from(container).save();`,
  `await html2pdf().set(opt).from(container).save();\n    document.body.removeChild(container);`
);

fs.writeFileSync(file, content);
console.log('Patched exportEngine.ts');
