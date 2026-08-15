import re

with open('src/components/GhostwritingDrawer.tsx', 'r') as f:
    content = f.read()

# Add worker ref
if 'ghostwriterWorker' not in content:
    content = content.replace(
        "const [activeTab, setActiveTab] = useState<'write' | 'character' | 'bible'>('write');",
        "const [activeTab, setActiveTab] = useState<'write' | 'character' | 'bible'>('write');\n  const workerRef = React.useRef<Worker | null>(null);\n\n  React.useEffect(() => {\n    workerRef.current = new Worker(new URL('../workers/ghostwriterWorker.ts', import.meta.url), { type: 'module' });\n    return () => workerRef.current?.terminate();\n  }, []);"
    )

# Modify handleGenerateCharacterBio to use worker
if 'const bio = await generateGeminiResponse(systemPrompt);' in content:
    bio_code = """
      const bio = await new Promise<string>((resolve, reject) => {
        if (!workerRef.current) return reject("Worker not initialized");
        const handler = (e: MessageEvent) => {
          workerRef.current?.removeEventListener('message', handler);
          if (e.data.success) resolve(e.data.text);
          else reject(e.data.error);
        };
        workerRef.current.addEventListener('message', handler);
        workerRef.current.postMessage({ prompt: systemPrompt, options: {} });
      });
"""
    content = content.replace("const bio = await generateGeminiResponse(systemPrompt);", bio_code)

with open('src/components/GhostwritingDrawer.tsx', 'w') as f:
    f.write(content)
