const fs = require('fs');
const file = './server.ts';
let content = fs.readFileSync(file, 'utf8');

if (!content.includes('/api/stripe/webhook')) {
  // Add import if not present
  if (!content.includes("import Stripe from 'stripe'")) {
    content = content.replace("import express from 'express';", "import express from 'express';\nimport Stripe from 'stripe';");
  }

  const webhookRoute = `
// ==========================================
// STRIPE WEBHOOK LISTENER
// ==========================================
app.post('/api/stripe/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_mock', { apiVersion: '2023-10-16' } as any);
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;
  try {
    if (endpointSecret && sig) {
      event = stripe.webhooks.constructEvent(req.body, sig as string, endpointSecret);
    } else {
      // Fallback for simulation / testing without secret
      event = JSON.parse(req.body.toString());
    }
  } catch (err: any) {
    return res.status(400).send(\`Webhook Error: \${err.message}\`);
  }

  // Handle the event
  if (event.type === 'checkout.session.completed' || event.type === 'invoice.payment_succeeded') {
    const session = event.data.object as any;
    
    // We expect the user's Firebase UID to be passed in client_reference_id
    const uid = session.client_reference_id;
    
    if (uid) {
      try {
        const db = getClientFirestore(firebaseApp);
        const userRef = doc(db, 'users', uid);
        
        // Determine tier from metadata or default to 'pro'
        const tier = session.metadata?.tier || 'pro';
        
        await setDoc(userRef, { 
          activePlan: tier,
          stripeCustomerId: session.customer,
          updatedAt: new Date().toISOString()
        }, { merge: true });
        
        console.log(\`Successfully upgraded user \${uid} to \${tier} tier via Stripe Webhook.\`);
      } catch (err) {
        console.error('Error updating user plan in Firestore:', err);
      }
    } else {
      console.warn('Webhook received but no client_reference_id (uid) found.');
    }
  }

  res.json({ received: true });
});

`;

  // Insert before initializeNewsletterCron()
  content = content.replace("initializeNewsletterCron();", webhookRoute + "\n  initializeNewsletterCron();");
  
  fs.writeFileSync(file, content);
  console.log('Patched server.ts with Stripe webhook');
} else {
  console.log('Stripe webhook already exists.');
}
