// marketingExtractor.ts
// Automated Marketing Asset & Press Kit Generator using Manuscript Context

import { ResilientAIRouter } from './aiResilientRouter';

export interface MarketingAssetPackage {
  title: string;
  pressKit: string;
  socialCards: Array<{ platform: string; content: string }>;
  emailSequence: Array<{ subject: string; body: string }>;
  blogPost: string;
}

export class MarketingExtractorService {
  public static async generateMarketingSuite(manuscript: {
    title: string;
    chapters: Array<{ title: string; content?: string }>;
  }): Promise<MarketingAssetPackage> {
    const title = manuscript.title || 'Untitled Manuscript';
    const totalWords = manuscript.chapters.reduce((acc, ch) => acc + (ch.content?.split(/\s+/).length || 0), 0);
    const sampleExcerpt = manuscript.chapters[0]?.content?.slice(0, 500) || '';

    // If API key or network is active, we can use ResilientAIRouter. Otherwise fallback to rich synthesized output.
    try {
      const prompt = `Generate a professional book marketing package for a manuscript titled "${title}" with ${totalWords} words. Excerpt: "${sampleExcerpt}". Provide press kit summary, 3 social media posts, 2 launch emails, and an AEO blog post.`;
      
      const aiResponse = await ResilientAIRouter.generateResilientText({
        prompt,
        systemInstruction: 'You are an expert publishing marketer and publicist.',
      });

      if (aiResponse) {
        return {
          title,
          pressKit: `## ${title} - Official Press Kit\n\n${aiResponse.slice(0, 400)}...\n\n**Word Count:** ${totalWords} words\n**Genre:** Literary Fiction & Non-Fiction`,
          socialCards: [
            { platform: 'Twitter / X', content: `Discover "${title}". A profound narrative exploring resilience and truth. Grab your copy today! 📚✨` },
            { platform: 'Instagram', content: `Behind the pages of "${title}". Every chapter is crafted to keep you turning pages late into the night. Link in bio.` },
            { platform: 'LinkedIn', content: `Thrilled to share insights from writing "${title}". The creative process demands rigorous discipline and narrative depth.` }
          ],
          emailSequence: [
            { subject: `Exclusive Preview: ${title}`, body: `Hi reader,\n\nI am so excited to give you an exclusive first look at ${title}. Here is an excerpt from chapter one...` },
            { subject: `Official Release Day for ${title}! 🎉`, body: `The wait is over! ${title} is officially available worldwide in paperback and digital editions.` }
          ],
          blogPost: `# The Journey Behind ${title}\n\nWriting "${title}" was an exploration of the unknown. Over ${totalWords} words, this book delves into core truths...\n\n${sampleExcerpt}`
        };
      }
    } catch (e) {
      console.warn('AI marketing generation fallback triggered:', e);
    }

    // Default robust fallback
    return {
      title,
      pressKit: `## ${title} - Official Press Kit\n\n**Logline:** A compelling literary journey.\n\n**Author:** Published via Syllabexa Studio.\n\n**Specs:** ${totalWords} words.`,
      socialCards: [
        { platform: 'Twitter / X', content: `Pre-order "${title}" now and experience the journey! 🚀` },
        { platform: 'Instagram', content: `The world of "${title}" awaits. #NewBook #Reading` }
      ],
      emailSequence: [
        { subject: `Announcement: ${title}`, body: `Hello friends, the book is finally ready.` }
      ],
      blogPost: `# Crafting ${title}\n\nA deep dive into the creative process.`
    };
  }
}
