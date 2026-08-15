const fs = require('fs');
const file = './src/components/QuickStartDashboard.tsx';
let content = fs.readFileSync(file, 'utf8');

// Replace imports
content = content.replace(
  `import strokeRecoveryData from '../data/stroke_recovery_bible.json';`,
  `import laundromatData from '../data/laundromat_doctrine.json';`
);

// Replace load function
content = content.replace(
  `const loadStrokeRecoveryManuscript = () => {
    const { loadSampleManuscript } = useManuscriptStore.getState();
    loadSampleManuscript(strokeRecoveryData.metadata as any, strokeRecoveryData.chapters as any);
    showToast('Loaded The Stroke Recovery Bible successfully!', 'success');
    navigate('/app');
  };`,
  `const loadLaundromatManuscript = () => {
    const { loadSampleManuscript } = useManuscriptStore.getState();
    loadSampleManuscript(laundromatData.metadata as any, laundromatData.chapters as any);
    showToast('Loaded The Laundromat Doctrine successfully!', 'success');
    navigate('/app');
  };`
);

// Replace button
content = content.replace(
  `<button
                onClick={loadStrokeRecoveryManuscript}
                className="px-6 py-3 bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-400 font-bold uppercase text-xs tracking-wider rounded-2xl border border-emerald-500/30 transition-all cursor-pointer flex items-center gap-2"
              >
                <BookOpen size={14} /> Load Stroke Recovery Bible
              </button>`,
  `<button
                onClick={loadLaundromatManuscript}
                className="px-6 py-3 bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-400 font-bold uppercase text-xs tracking-wider rounded-2xl border border-emerald-500/30 transition-all cursor-pointer flex items-center gap-2"
              >
                <BookOpen size={14} /> Load Laundromat Doctrine
              </button>`
);

fs.writeFileSync(file, content);
console.log('Dashboard updated for Laundromat Doctrine');
