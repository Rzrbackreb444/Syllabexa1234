const punctuationCache = new Map<string, string>();
const MAX_CACHE_SIZE = 5000;

export function fastSmartQuotePass(text: string): string {
  if (!text) return '';
  if (punctuationCache.has(text)) {
    return punctuationCache.get(text)!;
  }
  
  // Single-pass optimized evaluation
  const transformed = text
    .replace(/(^|\s)"(\S)/g, '$1“$2')
    .replace(/(\S)"/g, '$1”')
    .replace(/(^|\s)'(\S)/g, '$1‘$2')
    .replace(/(\S)'/g, '$1’')
    .replace(/---/g, '—')
    .replace(/--/g, '–');

  if (punctuationCache.size >= MAX_CACHE_SIZE) {
    const firstKey = punctuationCache.keys().next().value;
    if (firstKey) punctuationCache.delete(firstKey);
  }

  punctuationCache.set(text, transformed);
  return transformed;
}

export function clearTypographyCache(): void {
  punctuationCache.clear();
}
