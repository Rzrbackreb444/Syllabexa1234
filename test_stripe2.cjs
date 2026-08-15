const Stripe = require('stripe');
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_123');

async function test() {
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [{
        price: process.env.STRIPE_PRODUCT_STARTER_PACK,
        quantity: 1
      }],
      success_url: 'http://localhost/success',
      cancel_url: 'http://localhost/cancel',
    });
    console.log(session.url);
  } catch (err) {
    console.error("ERROR:", err.message);
  }
}
test();
