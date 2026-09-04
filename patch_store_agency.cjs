const fs = require('fs');
const file = './src/store/manuscriptStore.ts';
let content = fs.readFileSync(file, 'utf8');

if (!content.includes('agencyBranding: {')) {
  // Update Interface
  content = content.replace(
    `interface ManuscriptState {`,
    `interface ManuscriptState {
  subscriptionTier: 'free' | 'pro' | 'agency';
  setSubscriptionTier: (tier: 'free' | 'pro' | 'agency') => void;
  agencyBranding: { logoUrl: string; primaryColor: string; isEnabled: boolean };
  updateAgencyBranding: (branding: Partial<{ logoUrl: string; primaryColor: string; isEnabled: boolean }>) => void;`
  );

  // Initial State
  content = content.replace(
    `commitHash: crypto.randomUUID().substring(0, 8),`,
    `commitHash: crypto.randomUUID().substring(0, 8),
      subscriptionTier: 'agency',
      agencyBranding: { logoUrl: '', primaryColor: '#6366f1', isEnabled: false },`
  );

  // Actions
  content = content.replace(
    `generateCommitHash: () => set({ commitHash: crypto.randomUUID().substring(0, 8) }),`,
    `generateCommitHash: () => set({ commitHash: crypto.randomUUID().substring(0, 8) }),
      setSubscriptionTier: (tier) => set({ subscriptionTier: tier }),
      updateAgencyBranding: (branding) => set((state) => ({ agencyBranding: { ...state.agencyBranding, ...branding } })),`
  );

  fs.writeFileSync(file, content);
  console.log('Patched manuscriptStore.ts for Agency Branding');
}
