// offscreenImageOptimizer.ts
// Utility for optimizing high-DPI images using OffscreenCanvas to maintain flat memory consumption.

export async function optimizeImageWithOffscreenCanvas(
  imageBlobOrUrl: string | Blob,
  maxWidth = 1200,
  maxHeight = 1600,
  quality = 0.85
): Promise<string> {
  try {
    let bitmap: ImageBitmap;
    if (typeof imageBlobOrUrl === 'string') {
      const res = await fetch(imageBlobOrUrl);
      const blob = await res.blob();
      bitmap = await createImageBitmap(blob);
    } else {
      bitmap = await createImageBitmap(imageBlobOrUrl);
    }

    let { width, height } = bitmap;
    if (width > maxWidth || height > maxHeight) {
      const ratio = Math.min(maxWidth / width, maxHeight / height);
      width = Math.round(width * ratio);
      height = Math.round(height * ratio);
    }

    if (typeof OffscreenCanvas !== 'undefined') {
      const canvas = new OffscreenCanvas(width, height);
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(bitmap, 0, 0, width, height);
        const optimizedBlob = await canvas.convertToBlob({ type: 'image/jpeg', quality });
        return URL.createObjectURL(optimizedBlob);
      }
    }

    // Fallback if OffscreenCanvas is unavailable
    return typeof imageBlobOrUrl === 'string' ? imageBlobOrUrl : URL.createObjectURL(imageBlobOrUrl);
  } catch (e) {
    console.warn('[OffscreenImageOptimizer] Optimization skipped:', e);
    return typeof imageBlobOrUrl === 'string' ? imageBlobOrUrl : URL.createObjectURL(imageBlobOrUrl);
  }
}
