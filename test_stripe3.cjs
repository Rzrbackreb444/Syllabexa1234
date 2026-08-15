const Stripe = require('stripe');
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_123');

async function test() {
  try {
    const price = await stripe.prices.retrieve(process.env.STRIPE_PRODUCT_STARTER_PACK);
    console.log(price);
  } catch (err) {
    console.error("ERROR:", err.message);
  }
}
test();
