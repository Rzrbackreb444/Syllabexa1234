const fs = require('fs');
const file = './src/components/QuickStartDashboard.tsx';
let content = fs.readFileSync(file, 'utf8');

const importStatement = `import { useManuscriptStore } from '../store/manuscriptStore';\nimport strokeRecoveryData from '../data/stroke_recovery_bible.json';`;

if (!content.includes('useManuscriptStore')) {
  content = content.replace(
    `import { useSelfOptimizer } from '../store/useSelfOptimizer';`,
    `import { useSelfOptimizer } from '../store/useSelfOptimizer';\n${importStatement}`
  );
}

const loadFunction = `
  const loadStrokeRecoveryManuscript = () => {
    const { loadSampleManuscript } = useManuscriptStore.getState();
    loadSampleManuscript(strokeRecoveryData.metadata, strokeRecoveryData.chapters);
    showToast('Loaded The Stroke Recovery Bible successfully!', 'success');
    navigate('/app');
  };
`;

content = content.replace(
  `const handleOpenStudio = (view: string) => {`,
  `${loadFunction}\n\n  const handleOpenStudio = (view: string) => {`
);

const buttonHtml = `
              <button
                onClick={loadStrokeRecoveryManuscript}
                className="px-6 py-3 bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-400 font-bold uppercase text-xs tracking-wider rounded-2xl border border-emerald-500/30 transition-all cursor-pointer flex items-center gap-2"
              >
                <BookOpen size={14} /> Load Stroke Recovery Bible
              </button>`;

content = content.replace(
  `<Upload size={14} className="text-indigo-400" /> Import Draft File (.docx/.md/.txt)\n              </button>`,
  `<Upload size={14} className="text-indigo-400" /> Import Draft File (.docx/.md/.txt)\n              </button>\n${buttonHtml}`
);

fs.writeFileSync(file, content);
console.log('dashboard patched');
