const fs = require('fs');
let serverCode = fs.readFileSync('server.ts', 'utf8');

const oldCheckoutRouteRegex = /app\.post\("\/api\/stripe\/checkout", express\.json\(\), async \(req, res\) => {[\s\S]*?res\.status\(500\)\.json\(\{ error: err\.message \}\);\n  \}\n\}\);/g;

const newCheckoutRoute = `app.post("/api/stripe/checkout", express.json(), async (req, res) => {
  try {
    const { priceId, userId, userEmail, interval, isTopUp } = req.body;
    
    let line_items = [];
    
    if (isTopUp) {
      // Topups use pre-created Stripe Price IDs
      let stripePriceId;
      if (priceId === 'tokens_1') stripePriceId = process.env.STRIPE_PRODUCT_STARTER_PACK;
      else if (priceId === 'tokens_5') stripePriceId = process.env.STRIPE_PRODUCT_MASTER_PACK;
      else if (priceId === 'tokens_10') stripePriceId = process.env.STRIPE_PRODUCT_ENTERPRISE_PACK;
      else stripePriceId = process.env.STRIPE_PRODUCT_STARTER_PACK; // fallback
      
      line_items = [{
        price: stripePriceId,
        quantity: 1
      }];
    } else {
      // Subscriptions use pre-created Stripe Product IDs and dynamic prices
      let stripeProductId;
      let amount = 4900;
      
      if (priceId === 'dummy_agency') {
        stripeProductId = process.env.STRIPE_PRODUCT_AGENCY;
        amount = 49900;
      } else if (priceId === 'dummy_agencypro') {
        stripeProductId = process.env.STRIPE_PRODUCT_AGENCY_PRO;
        amount = 99900;
      } else {
        stripeProductId = process.env.STRIPE_PRODUCT_CREATOR;
        amount = 4900;
      }
      
      const isYearly = interval === 'year';
      if (isYearly) {
        amount = Math.floor(amount * 12 * 0.8);
      }
      
      line_items = [{
        price_data: {
          currency: 'usd',
          product: stripeProductId,
          unit_amount: amount,
          recurring: { interval: isYearly ? 'year' : 'month' }
        },
        quantity: 1
      }];
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "subscription",
      line_items,
      success_url: req.headers.origin + '/app?checkout=success' + (isTopUp ? '&type=tokens' : ''),
      cancel_url: req.headers.origin + '/app/billing',
      client_reference_id: userId || 'anonymous',
      customer_email: userEmail && userEmail !== 'guest@example.com' ? userEmail : undefined
    });
    res.json({ url: session.url });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});`;

serverCode = serverCode.replace(oldCheckoutRouteRegex, newCheckoutRoute);
fs.writeFileSync('server.ts', serverCode);
