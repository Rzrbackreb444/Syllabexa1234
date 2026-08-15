import express from 'express';
import Stripe from 'stripe';
import { getFirestore } from 'firebase-admin/firestore'; // Requires firebase-admin setup on your Node server

// Initialize Stripe with your secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2026-07-29.dahlia' });
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET || 'whsec_test_secret';

export const stripeWebhookHandler = async (req: express.Request, res: express.Response) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    // SECURITY: Verify the event actually came from Stripe using the raw body
    event = stripe.webhooks.constructEvent(req.body, sig!, endpointSecret);
  } catch (err: any) {
    console.error(`Webhook Error: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
  
  const db = getFirestore();

  // Handle the subscription events
  if (event.type === 'checkout.session.completed' || event.type === 'customer.subscription.updated') {
    const session = event.data.object as Stripe.Checkout.Session | Stripe.Subscription;
    let userId = '';
    let subscriptionId = '';
    if (event.type === 'checkout.session.completed') {
        const sess = session as Stripe.Checkout.Session;
        userId = sess.client_reference_id as string;
        subscriptionId = sess.subscription as string;
    } else {
        // Find user by subscription ID
        const sub = session as Stripe.Subscription;
        subscriptionId = sub.id;
        const snapshot = await db.collection('users').where('stripeSubscriptionId', '==', subscriptionId).get();
        if (!snapshot.empty) {
            userId = snapshot.docs[0].id;
        }
    }

    if (userId) {
      try {
        // Upgrade the user to Pro in Firestore
        await db.collection('users').doc(userId).update({
          activePlan: 'pro',
          stripeSubscriptionId: subscriptionId,
          updatedAt: new Date().toISOString()
        });
        console.log(`[Stripe] Successfully upgraded user ${userId} to Pro.`);
      } catch (error) {
        console.error(`[Firestore] Failed to update user ${userId}:`, error);
      }
    }
  } else if (event.type === 'customer.subscription.deleted') {
    // Handle cancellations
    const subscription = event.data.object as Stripe.Subscription;
    // Query Firestore by subscription ID and downgrade them to 'free'
    const snapshot = await db.collection('users').where('stripeSubscriptionId', '==', subscription.id).get();
    snapshot.forEach(async (doc) => {
      await doc.ref.update({ activePlan: 'free' });
    });
  }

  res.status(200).send('Received');
};
