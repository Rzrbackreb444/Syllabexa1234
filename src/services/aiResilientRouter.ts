import { useSelfOptimizer } from '../store/useSelfOptimizer';

export interface GenerationOptions {
  prompt: string;
  systemInstruction?: string;
  temperature?: number;
  onFallbackTriggered?: (failedModel: string, nextModel: string) => void;
}

export class ResilientAIRouter {
  public static async generateResilientText(options: GenerationOptions): Promise<string> {
    const optimizer = useSelfOptimizer.getState();
    const PRIMARY_PIPELINE = [
      { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro' },
      { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash' },
      { id: 'gpt-4o-mini', name: 'GPT-4o Mini Fallback' },
    ];

    let lastError: Error | null = null;

    for (let i = 0; i < PRIMARY_PIPELINE.length; i++) {
      const currentModel = PRIMARY_PIPELINE[i];
      try {
        const response = await fetch('/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: currentModel.id,
            prompt: options.prompt,
            systemInstruction: options.systemInstruction,
            temperature: options.temperature ?? 0.7,
          }),
        });

        if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        const data = await response.json();
        return data.output || data.text;
      } catch (error: any) {
        lastError = error;
        
        // Log telemetry event to self-optimizer queue
        optimizer.logTelemetry(
          'worker',
          `Model ${currentModel.name} failed (${error.message}). Attempting hot-swap.`
        );

        const nextModel = PRIMARY_PIPELINE[i + 1];
        if (nextModel && options.onFallbackTriggered) {
          options.onFallbackTriggered(currentModel.name, nextModel.name);
        }
      }
    }

    // Trigger autonomous optimization if all primary models failed
    optimizer.runAutonomousOptimization();
    throw new Error(`All generation tiers failed. Last error: ${lastError?.message}`);
  }
}
