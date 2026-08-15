// pdfEngine.ts
// Integration service for WebAssembly-based Rust PDF compiler

import { WasmPdfCompiler } from '../workers/wasmPdfCompiler';

export interface PdfEngineOptions {
  compliance: 'PDF/X-1a:2001' | 'PDF/X-4';
  embedFonts: boolean;
  cmykProfile: string;
  stripUnusedGlyphs: boolean;
}

export class PdfEngine {
  private static compilerInstance: WasmPdfCompiler | null = null;

  public static async generatePrintReadyPdf(htmlContent: string, options: PdfEngineOptions): Promise<Uint8Array> {
    if (!this.compilerInstance) {
      this.compilerInstance = new WasmPdfCompiler();
    }
    
    console.log('[PdfEngine] Initializing WASM module for CMYK-compliant PDF compilation...');
    await this.compilerInstance.initWasmModule();
    
    console.log(`[PdfEngine] Compiling manuscript to ${options.compliance}...`);
    const pdfBytes = await this.compilerInstance.compilePdf(htmlContent, options);
    
    return pdfBytes;
  }
}
