const fs = require('fs');
const file = './src/store/manuscriptStore.ts';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  `  reorderChapters: (startIndex: number, endIndex: number) => void;\n  setSelectedChapterId: (id: string | null) => void;`,
  `  reorderChapters: (startIndex: number, endIndex: number) => void;\n  loadSampleManuscript: (metadata: ProjectMeta, chapters: Chapter[]) => void;\n  setSelectedChapterId: (id: string | null) => void;`
);

content = content.replace(
  `          const reordered = result.map((chap, index) => ({ ...chap, orderIndex: index }));\n          return { \n            ...historyState,\n            chapters: reordered \n          };\n        }),`,
  `          const reordered = result.map((chap, index) => ({ ...chap, orderIndex: index }));\n          return { \n            ...historyState,\n            chapters: reordered \n          };\n        }),\n      \n      loadSampleManuscript: (metadata, chapters) =>\n        set((state) => {\n          const historyState = pushHistory(state);\n          return {\n            ...historyState,\n            projectMeta: metadata,\n            chapters: chapters.map((c, i) => ({ ...c, orderIndex: i })),\n            selectedChapterId: chapters.length > 0 ? chapters[0].id : null,\n            parts: [],\n            frontmatter: [\n              { id: "fm-1", type: "title-page", title: "Title Page", content: "", includeInExport: true },\n              { id: "fm-2", type: "copyright", title: "Copyright", content: "", includeInExport: true },\n              { id: "fm-3", type: "toc", title: "Table of Contents", content: "", includeInExport: true },\n            ],\n            backmatter: [\n              { id: "bm-1", type: "appendix", title: "Appendix", content: "", includeInExport: true },\n              { id: "bm-2", type: "glossary", title: "Glossary", content: "", includeInExport: true },\n            ]\n          };\n        }),`
);

fs.writeFileSync(file, content);
console.log('patched');
