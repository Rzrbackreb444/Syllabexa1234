const fs = require('fs');
const file = './src/components/ManuscriptEditor.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Add entityCodex and commitHash to hooks
content = content.replace(
  `const updateStateLedger = useManuscriptStore(state => state.updateStateLedger);`,
  `const updateStateLedger = useManuscriptStore(state => state.updateStateLedger);\n  const entityCodex = useManuscriptStore(state => state.entityCodex);\n  const commitHash = useManuscriptStore(state => state.commitHash);`
);

// 2. Add Live/Simulated mode to Token Cost Meter
content = content.replace(
  `{/* Live Token Cost Meter */}`,
  `{/* Live Token Cost Meter */}`
).replace(
  `<DollarSign className="w-3.5 h-3.5" />`,
  `<div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" title="Simulation Ledger Active" />\n                  <DollarSign className="w-3.5 h-3.5" />`
);

// 3. Add Entity Codex to Continuity Ledger Tab
const codexHtml = `
                    <div className="mt-6 border-t border-white/5 pt-4">
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest flex items-center gap-1.5">
                          <Database className="w-3.5 h-3.5" /> Entity Codex (Structured)
                        </label>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed mb-3">
                        Deterministic key-value persistence to eliminate lossy recursive summary drift.
                      </p>
                      <pre className="w-full bg-black/60 border border-emerald-500/10 rounded-xl p-4 text-[10px] font-mono text-emerald-400 overflow-x-auto">
                        {JSON.stringify(entityCodex, null, 2)}
                      </pre>
                    </div>
`;

content = content.replace(
  `<button \n                      onClick={() => showToast('Continuity ledger re-synchronized across agent context window!', 'success')}`,
  codexHtml + `\n                    <button \n                      onClick={() => showToast('Continuity ledger & Entity Codex synchronized!', 'success')}`
);

// 4. Update the Client Review Modal to use Commit Hash / Optimistic Locking
content = content.replace(
  `<h4 className="text-sm font-bold text-emerald-400 mb-1">Approval Workflow Enabled</h4>`,
  `<h4 className="text-sm font-bold text-emerald-400 mb-1">Optimistic Locking & Approval Workflow</h4>`
).replace(
  `When the client clicks "Approve Chapter", Syllabexa will automatically unlock the Director Agent for Chapter 5 and append the client's margin comments to the Continuity Ledger.`,
  `When the client clicks "Approve Chapter", Syllabexa validates the AST against commit hash <span className="font-mono text-emerald-300">[{commitHash}]</span> to prevent race conditions. Upon verification, the Director Agent is unlocked for the next chapter.`
);

fs.writeFileSync(file, content);
console.log('Patched ManuscriptEditor.tsx');
