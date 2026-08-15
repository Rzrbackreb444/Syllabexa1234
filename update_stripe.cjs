const fs = require('fs');

let serverCode = fs.readFileSync('server.ts', 'utf8');

const oldCheckoutRoute = `app.post("/api/stripe/checkout", express.json(), async (req, res) => {
  try {
    const { priceId, userId, userEmail, interval } = req.body;
    let amount = 4900;
    let name = 'Syllabexa Creator';
    
    if (priceId === 'dummy_agency') {
      amount = 49900;
      name = 'Syllabexa Agency';
    } else if (priceId === 'dummy_agencypro') {
      amount = 99900;
      name = 'Syllabexa Agency Pro';
    }
    
    const isYearly = interval === 'year';
    if (isYearly) {
      amount = Math.floor(amount * 12 * 0.8);
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "subscription",
      line_items: [{ price_data: { currency: 'usd', product_data: { name }, unit_amount: amount, recurring: { interval: isYearly ? 'year' : 'month' } }, quantity: 1 }],
      success_url: req.headers.origin + '/app?checkout=success',
      cancel_url: req.headers.origin + '/app',
      client_reference_id: userId || 'anonymous',
      customer_email: userEmail && userEmail !== 'guest@example.com' ? userEmail : undefined
    });
    res.json({ url: session.url });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});`;

const newCheckoutRoute = `app.post("/api/stripe/checkout", express.json(), async (req, res) => {
  try {
    const { priceId, userId, userEmail, interval, isTopUp } = req.body;
    
    let amount = 4900;
    let name = 'Syllabexa Creator';
    
    if (isTopUp) {
      if (priceId === 'tokens_1') { amount = 1500; name = '10M Token Top-Up'; }
      if (priceId === 'tokens_5') { amount = 6000; name = '50M Token Top-Up'; }
      if (priceId === 'tokens_10') { amount = 10000; name = '100M Token Top-Up'; }
    } else {
      if (priceId === 'dummy_agency') { amount = 49900; name = 'Syllabexa Agency'; }
      if (priceId === 'dummy_agencypro') { amount = 99900; name = 'Syllabexa Agency Pro'; }
    }
    
    const isYearly = interval === 'year' && !isTopUp;
    if (isYearly) {
      amount = Math.floor(amount * 12 * 0.8);
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: isTopUp ? "payment" : "subscription",
      line_items: [{ 
        price_data: { 
          currency: 'usd', 
          product_data: { name }, 
          unit_amount: amount, 
          ...(isTopUp ? {} : { recurring: { interval: isYearly ? 'year' : 'month' } }) 
        }, 
        quantity: 1 
      }],
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

serverCode = serverCode.replace(oldCheckoutRoute, newCheckoutRoute);
fs.writeFileSync('server.ts', serverCode);
