// Enterprise-grade Worker Orchestrator & Auto-Optimizer Pipeline

import { getPrepressWorker, processManuscriptInWorker, processTypographyInWorker } from './lib/workerManager';
import { fastSmartQuotePass } from './lib/fastTypography';
import { renderGpuCmykPreview } from './lib/gpuPrepress';
import { globalVectorStore } from './store/useBookGenerator';

// Enterprise Stripe Billing & Checkout Orchestrator
import { getAuth } from 'firebase/auth';

export interface BillingTier {
  id: string;
  name: string;
  priceMonthly: number;
  stripePriceId: string;
  features: string[];
}

export const STRIPE_TIERS: BillingTier[] = [
  {
    id: 'tier_author',
    name: 'Syllabexa Author Pro',
    priceMonthly: 29,
    stripePriceId: 'price_author_pro_monthly',
    features: ['Unlimited 300 DPI Pre-Press Export', 'AI Outline & Prose Generator', 'Advanced Crossword & Puzzle Studio']
  },
  {
    id: 'tier_enterprise',
    name: 'Publishing Empire Suite',
    priceMonthly: 99,
    stripePriceId: 'price_empire_monthly',
    features: ['Multi-User Collaboration & VFS Ledger', 'Custom CMYK Press Profiling (SWOP/GRACoL)', 'Dedicated Web Worker Offloading']
  }
];

export async function createStripeCheckoutSession(priceId: string): Promise<void> {
  const auth = getAuth();
  const user = auth.currentUser;
  
  if (!user) {
    throw new Error('User must be authenticated to initiate billing sessions.');
  }

  const response = await fetch('/api/stripe/create-checkout-session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      priceId,
      userId: user.uid,
      email: user.email,
      successUrl: window.location.origin + '?checkout=success',
      cancelUrl: window.location.origin + '?checkout=cancel'
    })
  });

  const data = await response.json();
  if (data.url) {
    window.location.href = data.url;
  } else {
    throw new Error(data.error || 'Failed to create Stripe checkout session.');
  }
}