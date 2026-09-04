const fs = require('fs');
const file = './src/components/SyllabexaMultiModelPipeline.tsx';
let content = fs.readFileSync(file, 'utf8');

// Add the state hooks
content = content.replace(
  `const projectMeta = useManuscriptStore(state => state.projectMeta);`,
  `const projectMeta = useManuscriptStore(state => state.projectMeta);\n  const subscriptionTier = useManuscriptStore(state => state.subscriptionTier);`
);

content = content.replace(
  `import { Lock, Sparkle`,
  `import { Lock, Sparkle, ShieldAlert`
);

// Modify startPipeline to check tier
content = content.replace(
  `const startPipeline = async () => {`,
  `const startPipeline = async () => {\n    if (subscriptionTier === 'free') {\n      addToast('Multi-Agent Waterfall requires a Pro or Agency subscription.', 'error');\n      return;\n    }`
);

// Modify the button to show the lock state
const buttonOriginal = `<button
                  onClick={startPipeline}
                  className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-bold uppercase tracking-wider text-sm flex items-center justify-center gap-3 transition-all shadow-lg shadow-indigo-600/20 cursor-pointer"
                >
                  <Sparkle size={18} />
                  Launch Chapter Waterfall Engine
                  <ArrowRight size={18} />
                </button>`;

const buttonLocked = `<button
                  onClick={startPipeline}
                  className={\`w-full py-4 rounded-2xl font-bold uppercase tracking-wider text-sm flex items-center justify-center gap-3 transition-all cursor-pointer \${subscriptionTier === 'free' ? 'bg-slate-800 text-slate-500 border border-slate-700 hover:bg-slate-700' : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20'}\`}
                >
                  {subscriptionTier === 'free' ? (
                    <>
                      <Lock size={18} className="text-amber-500" />
                      <span className="text-slate-400">Launch Chapter Waterfall Engine</span>
                      <span className="text-[10px] bg-amber-500/20 text-amber-500 px-2 py-0.5 rounded border border-amber-500/30">PRO REQUIRED</span>
                    </>
                  ) : (
                    <>
                      <Sparkle size={18} />
                      Launch Chapter Waterfall Engine
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>`;

content = content.replace(buttonOriginal, buttonLocked);

fs.writeFileSync(file, content);
console.log('Patched SyllabexaMultiModelPipeline.tsx');
