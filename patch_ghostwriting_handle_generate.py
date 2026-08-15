import re

with open('src/components/GhostwritingDrawer.tsx', 'r') as f:
    content = f.read()

stream_code = """
      const msgId = crypto.randomUUID();
      let accumulatedText = "";
      
      await new Promise<void>((resolve, reject) => {
        if (!workerRef.current) return reject("Worker not initialized");
        
        const handler = (e: MessageEvent) => {
          if (e.data.id !== msgId) return;
          if (e.data.type === 'chunk') {
            const chunk = e.data.chunk;
            accumulatedText += chunk;
            editor.commands.insertContent(chunk);
          } else if (e.data.type === 'done') {
            workerRef.current?.removeEventListener('message', handler);
            resolve();
          } else if (e.data.success === false) {
            workerRef.current?.removeEventListener('message', handler);
            reject(e.data.error);
          }
        };
        workerRef.current.addEventListener('message', handler);
        workerRef.current.postMessage({ id: msgId, prompt: systemPrompt, options: { temperature: 0.7 }, stream: true });
      });
"""

content = content.replace("await streamGeminiResponse(systemPrompt, (chunk) => {", stream_code + "      /*")
content = content.replace("});\n\n      // Save to snapshot", "*/\n\n      // Save to snapshot")

with open('src/components/GhostwritingDrawer.tsx', 'w') as f:
    f.write(content)
