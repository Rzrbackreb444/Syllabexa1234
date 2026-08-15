import re

with open('src/components/VoiceStudio.tsx', 'r') as f:
    content = f.read()

# Enhance it
content = content.replace("export default function VoiceStudio() {", """
export default function VoiceStudio() {
  // Enhanced state for simulated TTS Generation
  const [ttsText, setTtsText] = useState("The lease determines your exit. Ensure assignability, or you don't own an asset—you own a decade of debt.");
  
  // Update token generation on text change
  useEffect(() => {
    setTokens(ttsText.split(' ').map((word, i) => ({ id: `t-${i}`, word })));
  }, [ttsText]);
""")

content = content.replace('const initialText = "The lease determines your exit. Ensure assignability, or you don\'t own an asset—you own a decade of debt.";', '')
content = content.replace('const [tokens, setTokens] = useState<ScriptToken[]>(', 'const [tokens, setTokens] = useState<ScriptToken[]>([]); /*')
content = content.replace('    initialText.split(\' \').map((word, i) => ({ id: `t-${i}`, word }))', '    */')
content = content.replace('  );', '')

with open('src/components/VoiceStudio.tsx', 'w') as f:
    f.write(content)
