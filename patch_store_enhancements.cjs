const fs = require('fs');
const file = './src/store/manuscriptStore.ts';
let content = fs.readFileSync(file, 'utf8');

if (!content.includes('commitHash: string;')) {
  // Update Interface
  content = content.replace(
    `export interface ManuscriptState {`,
    `export interface ManuscriptState {\n  entityCodex: Record<string, any>;\n  updateEntityCodex: (codex: Record<string, any>) => void;\n  commitHash: string;\n  generateCommitHash: () => void;`
  ).replace( // Try alternative if no export interface
    `interface ManuscriptState {`,
    `interface ManuscriptState {\n  entityCodex: Record<string, any>;\n  updateEntityCodex: (codex: Record<string, any>) => void;\n  commitHash: string;\n  generateCommitHash: () => void;`
  );

  // Initial State
  content = content.replace(
    `stateLedger: 'LOCKED CONTINUITY LEDGER:\\n- Protagonist: Elias (VP Kremers Laundry)\\n- Arc: Expansion of operations\\n- Core Conflict: Maintaining scale without sacrificing quality\\n',`,
    `stateLedger: 'LOCKED CONTINUITY LEDGER:\\n- Protagonist: Elias (VP Kremers Laundry)\\n- Arc: Expansion of operations\\n- Core Conflict: Maintaining scale without sacrificing quality\\n',\n      entityCodex: { characters: { "Elias": "VP Kremers Laundry, struggling with scaling vs quality" }, locations: { "Facility 4": "Flagship laundromat" }, lore: { "The Incident": "A supply chain breakdown in 2024" } },\n      commitHash: crypto.randomUUID().substring(0, 8),`
  );

  // Actions
  content = content.replace(
    `updateStateLedger: (ledger) =>`,
    `generateCommitHash: () => set({ commitHash: crypto.randomUUID().substring(0, 8) }),\n      updateEntityCodex: (codex) => set(state => { state.generateCommitHash(); return { ...pushHistory(state), entityCodex: codex }; }),\n      updateStateLedger: (ledger) =>`
  );
  
  // Tie commitHash generation to updateChapter etc
  content = content.replace(
    `updateChapter: (id, updates) => set((state) => {`,
    `updateChapter: (id, updates) => set((state) => {\n        state.generateCommitHash();`
  );

  fs.writeFileSync(file, content);
  console.log('Patched manuscriptStore.ts');
} else {
  console.log('Already patched manuscriptStore.ts');
}
