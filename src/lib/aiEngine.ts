export interface Chunk {
  id: string;
  source: string;
  text: string;
  keywords: string[];
}

// Commercial-grade stop words filter to prevent irrelevant AI context matching
const STOP_WORDS = new Set([
  'that', 'this', 'with', 'from', 'your', 'have', 'they', 'will', 
  'what', 'about', 'when', 'which', 'their', 'there', 'would', 
  'could', 'should', 'then', 'than', 'into', 'upon', 'only',
  'these', 'those', 'am', 'is', 'are', 'was', 'were'
]);

export class InMemoryVectorStore {
  // OPTIMIZATION 1: Namespaced collections prevent cross-feature data pollution
  private collections: Map<string, Chunk[]> = new Map();

  // OPTIMIZATION 2: IDF Cache for BM25 inverse document frequency weighting
  private idfCache: Map<string, number> = new Map();

  constructor() {}

  public clearCollection(namespace: 'reference' | 'storyBible') {
    this.collections.set(namespace, []);
    this.idfCache.clear();
  }

  public indexReferenceData(
    coreConcepts: Array<{ term: string; context: string }>, 
    comments: Array<{ text: string; author?: string }>, 
    scratchpad?: string
  ) {
    const chunks: Chunk[] = [];

    coreConcepts.forEach((c, idx) => {
      const text = `${c.term}: ${c.context}`;
      chunks.push({ id: `concept-${idx}`, source: 'Core Concept', text, keywords: this.extractKeywords(text) });
    });

    comments.forEach((comm, idx) => {
      const text = `${comm.author || 'Editor'}: ${comm.text}`;
      chunks.push({ id: `comment-${idx}`, source: 'Outline Note', text, keywords: this.extractKeywords(text) });
    });

    if (scratchpad && scratchpad.trim()) {
      const paragraphs = scratchpad.split(/\n\n+/);
      paragraphs.forEach((p, idx) => {
        if (p.trim()) {
          chunks.push({ id: `scratchpad-${idx}`, source: 'Scratchpad', text: p.trim(), keywords: this.extractKeywords(p) });
        }
      });
    }

    this.collections.set('reference', chunks);
    this.computeIdfScores('reference');
  }

  public indexStoryStudio(
    coreConcepts: Array<{ term: string; context: string }>,
    characters: any[],
    locations: any[],
    scenes: any[],
    timeline: any[],
    chapters: any[],
    currentChapterId?: string | null
  ) {
    const chunks: Chunk[] = [];

    coreConcepts.forEach((c, idx) => {
      const text = `${c.term}: ${c.context}`;
      chunks.push({ id: `concept-${idx}`, source: 'Core Concept', text, keywords: this.extractKeywords(text) });
    });

    if (characters?.length) {
      characters.forEach((char, idx) => {
        const traitsStr = char.traits?.length ? `Traits: ${char.traits.join(', ')}. ` : '';
        const text = `Character Profile - Name: ${char.name}. Role: ${char.role}. ${traitsStr}Backstory: ${char.backstory || ''}. Appearance: ${char.appearance || ''}. Notes: ${char.notes || ''}`;
        chunks.push({ id: `char-${char.id || idx}`, source: `Story Bible (Character: ${char.name})`, text, keywords: this.extractKeywords(text) });
      });
    }

    if (locations?.length) {
      locations.forEach((loc, idx) => {
        const text = `Location Profile - Name: ${loc.name}. Type: ${loc.type}. Notes: ${loc.notes || ''}`;
        chunks.push({ id: `loc-${loc.id || idx}`, source: `Story Bible (Location: ${loc.name})`, text, keywords: this.extractKeywords(text) });
      });
    }

    if (scenes?.length) {
      scenes.forEach((scene, idx) => {
        const text = `Scene Card - Title: ${scene.title}. Summary: ${scene.summary || ''}`;
        chunks.push({ id: `scene-${scene.id || idx}`, source: `Story Bible (Scene: ${scene.title})`, text, keywords: this.extractKeywords(text) });
      });
    }

    if (chapters?.length) {
      chapters.forEach((ch) => {
        if (ch.content && ch.id !== currentChapterId) {
          const pureText = ch.content.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
          const words = pureText.split(' ').filter(Boolean);
          
          const segmentSize = 300; // Granular chunk segmentation
          for (let i = 0; i < words.length; i += segmentSize) {
            const segmentText = words.slice(i, i + segmentSize).join(' ');
            chunks.push({
              id: `chapter-${ch.id}-seg-${i}`,
              source: `${ch.title} (Section ${Math.floor(i / segmentSize) + 1})`,
              text: segmentText,
              keywords: this.extractKeywords(segmentText)
            });
          }
        }
      });
    }

    this.collections.set('storyBible', chunks);
    this.computeIdfScores('storyBible');
  }

  // OPTIMIZATION 3: Inverse Document Frequency (IDF) computation
  private computeIdfScores(namespace: string) {
    const chunks = this.collections.get(namespace) || [];
    const totalChunks = chunks.length;
    const docFrequency = new Map<string, number>();

    chunks.forEach(chunk => {
      const uniqueKeywords = new Set(chunk.keywords);
      uniqueKeywords.forEach(kw => {
        docFrequency.set(kw, (docFrequency.get(kw) || 0) + 1);
      });
    });

    docFrequency.forEach((count, kw) => {
      // Standard IDF logarithm calculation
      const idf = Math.log(1 + (totalChunks - count + 0.5) / (count + 0.5));
      this.idfCache.set(`${namespace}-${kw}`, Math.max(0.1, idf));
    });
  }

  private extractKeywords(text: string): string[] {
    const cleaned = text.toLowerCase().replace(/[^a-z0-9\s]/g, '');
    const words = cleaned.split(/\s+/).filter(w => w.length > 3 && !STOP_WORDS.has(w));
    return words; 
  }

  public query(searchQuery: string, topK: number = 3, targetNamespace?: 'reference' | 'storyBible'): Chunk[] {
    let activeChunks: Chunk[] = [];
    if (targetNamespace) {
      activeChunks = this.collections.get(targetNamespace) || [];
    } else {
      activeChunks = Array.from(this.collections.values()).flat();
    }

    if (activeChunks.length === 0) return [];

    const queryKeywords = Array.from(new Set(this.extractKeywords(searchQuery)));
    if (queryKeywords.length === 0) return []; 

    const scored = activeChunks.map(chunk => {
      let score = 0;
      queryKeywords.forEach(qk => {
        const occurrences = chunk.keywords.filter(k => k === qk).length;
        if (occurrences > 0) {
          // Retrieve namespace-specific IDF weight if available, default to 1.0
          const namespaceKey = targetNamespace ? `${targetNamespace}-${qk}` : qk;
          const idfWeight = this.idfCache.get(namespaceKey) || 1.0;
          
          // BM25-inspired scoring: Frequency boosted by Inverse Document Frequency
          const tfScore = 1 + Math.log(occurrences);
          score += tfScore * idfWeight;
        }
      });
      return { chunk, score };
    });

    scored.sort((a, b) => b.score - a.score);

    // Filter out zero matches to eliminate hallucination loops
    const topResults = scored.filter(s => s.score > 0).map(s => s.chunk);
    return topResults.slice(0, topK);
  }
}

export const globalVectorStore = new InMemoryVectorStore();