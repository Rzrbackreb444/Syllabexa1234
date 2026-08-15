import { Resend } from 'resend';
import { GoogleGenAI } from '@google/genai';
import { getFirestore } from 'firebase-admin/firestore';
import cron from 'node-cron';

export function initializeNewsletterCron() {
  // We'll run this daily at 9:00 AM (0 9 * * *)
  // Or for testing/development, every Friday (0 9 * * 5)
  // We'll just set it to run once a week for the "periodic newsletter"
  cron.schedule('0 9 * * 5', async () => {
    console.log('Running scheduled Syllabexa Newsletter generation...');
    await generateAndSendNewsletter();
  });
}

export async function generateAndSendNewsletter() {
  if (!process.env.RESEND_API_KEY || !process.env.GEMINI_API_KEY) {
    console.log('Skipping newsletter: Missing RESEND_API_KEY or GEMINI_API_KEY.');
    return;
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const db = getFirestore();

  try {
    // 1. Generate the newsletter content with Gemini
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-pro',
      contents: `You are the lead editor at Syllabexa, a premium enterprise ghostwriting platform. 
Write a weekly literary newsletter aimed at professional authors, agency ghostwriters, and publishers.
Keep it strictly under 400 words.
Tone: Sophisticated, insightful, literary, highly actionable, premium.
Format: HTML. Use elegant typography styling in inline CSS where appropriate, focusing on a clean editorial aesthetic (deep charcoal text on cream backgrounds).
Include a clear, bold hook, 2-3 advanced writing/publishing tips (e.g. pacing, character dimensionality, CMYK print considerations, narrative voice), and a soft call to action to open their Syllabexa Studio.
Output ONLY the raw HTML body (no markdown blocks, no html/head/body wrappers, just the content).`,
    });

    const htmlContent = response.text || '';
    if (!htmlContent) throw new Error('Gemini failed to generate newsletter content.');

    // 2. Fetch all subscribers from Firestore
    const subscribersSnapshot = await db.collection('newsletter_subscribers').get();
    if (subscribersSnapshot.empty) {
      console.log('No newsletter subscribers found. Skipping send.');
      return;
    }

    const bccEmails = subscribersSnapshot.docs
      .map(doc => doc.data().email)
      .filter(email => typeof email === 'string' && email.includes('@'));

    if (bccEmails.length === 0) {
      console.log('No valid subscriber emails found.');
      return;
    }

    // Since Resend BCC limits to 50 recipients per API call, we batch them.
    const batchSize = 50;
    for (let i = 0; i < bccEmails.length; i += batchSize) {
      const emailBatch = bccEmails.slice(i, i + batchSize);
      
      await resend.emails.send({
        from: 'Syllabexa Editorial <newsletter@syllabexa.com>', // User needs to verify domain in Resend
        to: ['newsletter@syllabexa.com'],
        bcc: emailBatch,
        subject: 'Syllabexa Weekly: The Craft & The Business',
        html: `
          <div style="font-family: 'Georgia', serif; color: #1a1b1e; background-color: #fdfcfb; padding: 40px 20px; line-height: 1.6; max-w-2xl; margin: 0 auto;">
            <div style="max-width: 600px; margin: 0 auto; border-top: 4px solid #1a1b1e; padding-top: 30px;">
              <h1 style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 14px; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 40px; color: #4b5563;">
                Syllabexa Editorial
              </h1>
              ${htmlContent}
              <div style="margin-top: 50px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 12px; color: #9ca3af; text-align: center;">
                © ${new Date().getFullYear()} Syllabexa Publishing Suite. All rights reserved.<br/>
                <a href="https://syllabexa.com" style="color: #6366f1; text-decoration: none;">Launch Studio</a>
              </div>
            </div>
          </div>
        `
      });
      console.log(`Successfully sent newsletter batch to ${emailBatch.length} subscribers.`);
    }

  } catch (error) {
    console.error('Error generating or sending newsletter:', error);
  }
}
