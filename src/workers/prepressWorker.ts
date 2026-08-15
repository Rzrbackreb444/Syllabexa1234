/// <reference lib="webworker" />

export interface LayoutJob {
  content: string;
  widthInches: number;
  heightInches: number;
  fontSizePt: number;
  lineHeightPt: number;
}

export interface LayoutResult {
  estimatedPages: number;
  spineWidthInches: number;
  chunks: string[];
}

// Listen for messages from the main thread
self.onmessage = (e: MessageEvent<LayoutJob>) => {
  const { content, fontSizePt, lineHeightPt } = e.data;

  // 1. Heavy Mathematical Estimation
  // Estimate characters per page based on typography specs
  const charsPerPage = (fontSizePt > 11 ? 1200 : 1500) * (15 / lineHeightPt);
  const totalChars = content?.length || 0;
  
  const estimatedPages = Math.max(1, Math.ceil(totalChars / charsPerPage));
  
  // 2. Exact Caliper Spine Calculation (assuming cream paper)
  const spineWidthInches = estimatedPages * 0.002252;

  // 3. Simulate expensive pagination/chunking logic
  const chunks = [];
  if (content) {
    for (let i = 0; i < totalChars; i += charsPerPage) {
      chunks.push(content.slice(i, i + charsPerPage));
    }
  }

  // 4. Send the calculated layout back to the UI thread
  const result: LayoutResult = {
    estimatedPages,
    spineWidthInches,
    chunks
  };

  self.postMessage(result);
};
