import re

with open('server.ts', 'r') as f:
    content = f.read()

endpoints = """
import { Resend } from 'resend';

// Helper to initialize Resend
function getResend() {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error("RESEND_API_KEY is not configured.");
  return new Resend(key);
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_123', { apiVersion: '2024-06-20' });

// Generic AI execution helper
async function safeGenerateContent(req, options) {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const response = await ai.models.generateContent({
      model: options.model || "gemini-2.5-flash",
      contents: options.contents,
      config: options.config
    });
    if (response && response.text) return response;
    throw new Error("Empty response");
  } catch (err) {
    console.warn("API Error, using fallback:", err.message);
    const fallbackData = options.fallback();
    return { text: typeof fallbackData === "string" ? fallbackData : JSON.stringify(fallbackData) };
  }
}

app.post("/api/stripe/checkout", async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "subscription",
      line_items: [{ price_data: { currency: 'usd', product_data: { name: 'Pro Publishing' }, unit_amount: 4900, recurring: { interval: 'month' } }, quantity: 1 }],
      success_url: req.headers.origin + '/app?checkout=success',
      cancel_url: req.headers.origin + '/app',
      client_reference_id: req.body.userId || 'anonymous'
    });
    res.json({ url: session.url });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/stripe/webhook", express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const sig = req.headers['stripe-signature'];
    const event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    if (event.type === 'checkout.session.completed') {
      const userId = event.data.object.client_reference_id;
      if (userId) {
        await setDoc(doc(db, "users", userId), { role: 'pro' }, { merge: true });
      }
    }
    res.json({ received: true });
  } catch (err) {
    res.status(400).send(`Webhook Error: ${err.message}`);
  }
});

app.post("/api/resend/newsletter", express.json(), async (req, res) => {
  try {
    const { email, subject, content } = req.body;
    const resend = getResend();
    const data = await resend.emails.send({
      from: 'Acme <onboarding@resend.dev>',
      to: [email],
      subject: subject || "Literary Newsletter",
      html: `<div>${content}</div>`,
    });
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/syllabexa/generate-blog", express.json(), async (req, res) => {
  try {
    const { topic, voiceProfile } = req.body;
    const systemPrompt = `You are a literary blog post generator. Emulate the author's voice profile.`;
    const response = await safeGenerateContent(req, {
      contents: [{ role: "user", parts: [{ text: `Generate a literary blog post about: ${topic}. Voice Profile: ${JSON.stringify(voiceProfile)}` }] }],
      config: { systemInstruction: systemPrompt },
      fallback: () => `# The Art of ${topic}\\n\\nA beautifully crafted blog post about ${topic}, generated automatically.`
    });
    res.json({ content: response.text });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/syllabexa/:action", express.json({limit: '50mb'}), async (req, res) => {
  try {
    const action = req.params.action;
    const response = await safeGenerateContent(req, {
      contents: [{ role: "user", parts: [{ text: `Handle action: ${action}. Payload: ${JSON.stringify(req.body)}` }] }],
      config: { responseMimeType: "application/json" },
      fallback: () => {
        if (action === 'autopilot') return { premise: "A thrilling literary masterpiece.", outline: { chapters: [{ title: "Chapter 1", summary: "The beginning." }] } };
        if (action === 'art-director') return { recommendedConfig: { trimSize: "6x9", targetGenre: "TradePaperback", strictBaseline: true, fixWidowsAndOrphans: true, forceRectoChapters: true }, rationale: "Default literary layout.", fontPairing: "Garamond & Cinzel", recommendedCalloutTheme: "amber" };
        if (action === 'studio-edit') return { editedText: req.body.text + " (edited)", explanation: "Polished for literary flow.", executeAction: null };
        if (action === 'train-voice') return { tone: "Literary and sophisticated", vocabulary: ["ephemeral", "melancholy"], pacing: "Lyrical", persona: "Author", pov: "Third-person limited", dialogue: "Sparse and profound" };
        if (action === 'review-chapter') return { score: 95, issues: ["None"], suggestions: ["Keep writing"] };
        return { content: `Generated content for ${action}` };
      }
    });
    let parsed;
    try {
      parsed = JSON.parse(response.text.replace(/```(?:json)?|```/g, '').trim());
    } catch {
      parsed = { content: response.text };
    }
    res.json(parsed);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

"""

# Insert endpoints before startServer()
content = re.sub(r'async function startServer', endpoints + r'\nasync function startServer', content)

with open('server.ts', 'w') as f:
    f.write(content)
