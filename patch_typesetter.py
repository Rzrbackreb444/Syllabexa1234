import re

with open('src/components/TypesetterSimulator.tsx', 'r') as f:
    content = f.read()

# Remove the old worker import
content = content.replace("import { processTypographyInWorker } from '../lib/workerManager';", "")

# Find the useEffect and useMemo sections
pattern = re.compile(r"useEffect\(\(\) => \{.*?const handleMouseDown", re.DOTALL)

replacement = """useEffect(() => {
    const rawText = chapters[0]?.content || "Your manuscript text will flow here dynamically. The layout engine utilizes strict CSS Paged Media standards to ensure orphans, widows, and baseline grids are mathematically perfect before export. Adjust the sliders in the left panel to see this text reflow in real-time.";
    
    const worker = new Worker(new URL('../workers/prepressWorker.ts', import.meta.url), { type: 'module' });
    
    worker.onmessage = (e) => {
      // Update your React state with the off-thread calculations!
      setFormattedContent(e.data.chunks[0] || rawText);
      // Let's store the advanced calculations in local state if we had them, 
      // but for now we'll just update a local ref or state if needed.
    };

    worker.postMessage({ 
        content: rawText, 
        fontSizePt: typo.fontSizePt, 
        lineHeightPt: typo.lineHeightPt,
        widthInches: dims.widthInches,
        heightInches: dims.heightInches
    });

    return () => worker.terminate();
  }, [chapters, typo, dims]);

  const totalChars = chapters.reduce((acc, ch) => acc + (ch.content?.length || 0), 0);
  const estimatedPages = Math.max(1, Math.ceil(totalChars / (typo.fontSizePt > 11 ? 1200 : 1500)));
  const spineWidthInches = estimatedPages * (paperStock === 'cream' ? 0.002252 : 0.00212);

  const handleMouseDown"""

content = pattern.sub(replacement, content)

with open('src/components/TypesetterSimulator.tsx', 'w') as f:
    f.write(content)

