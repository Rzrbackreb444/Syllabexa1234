const fs = require('fs');

let file = fs.readFileSync('server.ts', 'utf8');

// Add Anthropic import
if (!file.includes("import Anthropic from '@anthropic-ai/sdk';")) {
  file = file.replace(/import { GoogleGenAI } from "@google\/genai";/, match => match + "\nimport Anthropic from '@anthropic-ai/sdk';");
}

const safeGenStart = file.indexOf('async function safeGenerateContent(req, options) {');
const safeGenEnd = file.indexOf('app.post("/api/stripe/checkout"', safeGenStart);

const newSafeGen = `async function safeGenerateContent(req, options) {
  const provider = options.provider || req?.body?.provider || "auto";

  if (provider === "anthropic" && process.env.ANTHROPIC_API_KEY) {
    try {
      const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
      const promptText = typeof options.contents === 'string' ? options.contents : JSON.stringify(options.contents);
      
      const message = await anthropic.messages.create({
        max_tokens: 4096,
        model: "claude-3-5-sonnet-20241022",
        system: options.config?.systemInstruction || undefined,
        messages: [{ role: 'user', content: promptText + (options.config?.responseMimeType === "application/json" ? " (Respond with JSON)" : "") }]
      });
      const resText = message.content[0]?.type === 'text' ? message.content[0].text : '';
      if (resText) return { text: resText, provider: "anthropic" };
    } catch (err: any) {
      console.warn("Anthropic API error, falling back to OpenAI (GPT-4o):", err.message);
      failoverTelemetry.unshift({ timestamp: new Date().toISOString(), provider: 'anthropic', error: err.message });
      if (failoverTelemetry.length > 100) failoverTelemetry.pop();
      // FALLBACK TO GPT-4o
      if (process.env.OPENAI_API_KEY) {
         try {
            const openai = getOpenAI();
            if (openai) {
              const promptText = typeof options.contents === 'string' ? options.contents : JSON.stringify(options.contents);
              const completion = await openai.chat.completions.create({
                model: "gpt-4o",
                messages: [
                  ...(options.config?.systemInstruction ? [{ role: "system" as const, content: options.config.systemInstruction }] : []),
                  { role: "user", content: promptText }
                ],
                response_format: options.config?.responseMimeType === "application/json" ? { type: "json_object" } : undefined,
                temperature: 0.7,
              });
              const resText = completion.choices[0]?.message?.content;
              if (resText) return { text: resText, provider: "openai_fallback" };
            }
         } catch (fallbackErr: any) {
             console.warn("Failover OpenAI API Error:", fallbackErr.message);
         }
      }
    }
  }

  // Attempt OpenAI
  if ((provider === "openai" || provider === "auto") && process.env.OPENAI_API_KEY) {
    try {
      const openai = getOpenAI();
      if (openai) {
        const promptText = typeof options.contents === 'string' ? options.contents : JSON.stringify(options.contents);
        const completion = await openai.chat.completions.create({
          model: "gpt-4o",
          messages: [
            ...(options.config?.systemInstruction ? [{ role: "system" as const, content: options.config.systemInstruction }] : []),
            { role: "user", content: promptText }
          ],
          response_format: options.config?.responseMimeType === "application/json" ? { type: "json_object" } : undefined,
          temperature: 0.7,
        });
        const resText = completion.choices[0]?.message?.content;
        if (resText) return { text: resText, provider: "openai" };
      }
    } catch (err: any) {
      console.warn("OpenAI API call error, falling back to Gemini:", err.message);
    }
  }

  // Gemini primary / fallback
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const response = await ai.models.generateContent({
      model: options.model || "gemini-2.5-flash",
      contents: options.contents,
      config: options.config
    });
    if (response && response.text) return { text: response.text, provider: "gemini" };
    throw new Error("Empty response");
  } catch (err: any) {
    console.warn("Gemini API Error, attempting failover:", err.message);
    failoverTelemetry.unshift({ timestamp: new Date().toISOString(), provider: 'gemini', error: err.message });
    if (failoverTelemetry.length > 100) failoverTelemetry.pop();

    if (process.env.OPENAI_API_KEY) {
      try {
        const openai = getOpenAI();
        if (openai) {
          const promptText = typeof options.contents === 'string' ? options.contents : JSON.stringify(options.contents);
          const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini", // Fallback model
            messages: [
              ...(options.config?.systemInstruction ? [{ role: "system" as const, content: options.config.systemInstruction }] : []),
              { role: "user", content: promptText }
            ],
            response_format: options.config?.responseMimeType === "application/json" ? { type: "json_object" } : undefined,
            temperature: 0.7,
          });
          const resText = completion.choices[0]?.message?.content;
          if (resText) return { text: resText, provider: "openai_fallback" };
        }
      } catch (fallbackErr: any) {
        console.warn("Failover OpenAI API Error:", fallbackErr.message);
        failoverTelemetry.unshift({ timestamp: new Date().toISOString(), provider: 'openai_fallback', error: fallbackErr.message });
        if (failoverTelemetry.length > 100) failoverTelemetry.pop();
      }
    }
    
    console.warn("All models failed. Using static fallback.");
    const fallbackData = options.fallback();
    return { text: typeof fallbackData === "string" ? fallbackData : JSON.stringify(fallbackData), provider: "fallback" };
  }
}

`;

file = file.slice(0, safeGenStart) + newSafeGen + file.slice(safeGenEnd);

// Also update the routes to specify the correct provider
file = file.replace(/app\.post\("\/api\/syllabexa\/multi-model-polish", authenticateUser, express\.json\(\), async \(req, res\) => {[\s\S]*?const response = await safeGenerateContent\(req, {/, match => match + '\n      provider: "anthropic",');
file = file.replace(/app\.post\("\/api\/syllabexa\/multi-model-draft", authenticateUser, express\.json\(\), async \(req, res\) => {[\s\S]*?const response = await safeGenerateContent\(req, {/, match => match + '\n      provider: "gemini",');

fs.writeFileSync('server.ts', file);
