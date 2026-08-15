import re

with open('src/lib/gemini.ts', 'r') as f:
    content = f.read()

target = r"""export const streamGeminiResponse = async \(
  prompt: string, 
  onChunk: \(chunk: string\) => void, 
  options: GeminiOptions = \{\}
\): Promise<void> => \{
  const apiKey = getApiKey\(\);
  const model = options\.model \|\| DEFAULT_MODEL;"""

replacement = """export const streamGeminiResponse = async (
  prompt: string, 
  onChunk: (chunk: string) => void, 
  options: GeminiOptions = {}
): Promise<void> => {
  const apiKey = getApiKey(options.apiKey);
  const provider = options.provider || 'gemini';
  const model = options.model || (provider === 'anthropic' ? 'claude-3-5-sonnet-20240620' : provider === 'grok' ? 'grok-beta' : DEFAULT_MODEL);"""

content = re.sub(target, replacement, content)

with open('src/lib/gemini.ts', 'w') as f:
    f.write(content)
