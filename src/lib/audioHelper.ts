/**
 * Production-Grade Mechanical Typewriter Audio Synthesizer (v4.0)
 * Upgraded with Master Limiting, Randomized Noise Slicing for organic texture,
 * and Anti-Pop ADSR envelopes.
 */

let audioCtx: AudioContext | null = null;
let masterCompressor: DynamicsCompressorNode | null = null;
let cachedNoisePool: AudioBuffer | null = null;
let masterVolume = 0.4;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    audioCtx = new AudioContextClass();
    
    // OPTIMIZATION: Brick-wall limiter prevents digital distortion when typing at 120+ WPM
    masterCompressor = audioCtx.createDynamicsCompressor();
    masterCompressor.threshold.value = -3; // Start compressing at -3dB
    masterCompressor.knee.value = 0;       // Hard knee for strict limiting
    masterCompressor.ratio.value = 20;     // Aggressive 20:1 limiting ratio
    masterCompressor.attack.value = 0.002; // 2ms attack
    masterCompressor.release.value = 0.1;  // 100ms release
    
    masterCompressor.connect(audioCtx.destination);
  }
  
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

/**
 * Creates a continuous 2-second pool of organic noise.
 * We extract random slices from this pool to prevent phase-cancellation ("machine gun effect").
 */
function getCachedNoisePool(ctx: AudioContext): AudioBuffer {
  if (cachedNoisePool && cachedNoisePool.sampleRate === ctx.sampleRate) {
    return cachedNoisePool;
  }
  
  // 2 full seconds of noise
  const bufferSize = ctx.sampleRate * 2.0; 
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  
  for (let i = 0; i < bufferSize; i++) {
    // Pure White/Pink noise blend. We do NOT bake the decay here; 
    // we sculpt the decay dynamically using Gain nodes later.
    data[i] = (Math.random() * 2 - 1) * 0.8;
  }
  
  cachedNoisePool = buffer;
  return buffer;
}

export function setTypewriterVolume(volume: number) {
  masterVolume = Math.max(0, Math.min(1, volume));
}

/**
 * Play a high-fidelity mechanical key strike (Key-Down)
 */
export function playKeyClick(isSpecialKey = false) {
  try {
    const ctx = getAudioContext();
    if (!masterCompressor) return;
    const now = ctx.currentTime;

    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(masterVolume, now);
    masterGain.connect(masterCompressor);

    // 1. High-frequency metallic slug clack
    const noise = ctx.createBufferSource();
    noise.buffer = getCachedNoisePool(ctx);

    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.value = (isSpecialKey ? 1400 : 1800) + (Math.random() * 400 - 200);
    noiseFilter.Q.value = 3.5;

    const noiseGain = ctx.createGain();
    const noiseVol = isSpecialKey ? 0.22 : 0.15;
    // Envelope: Fast attack, exponential decay
    noiseGain.gain.setValueAtTime(0, now);
    noiseGain.gain.linearRampToValueAtTime(noiseVol, now + 0.002);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);

    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(masterGain);

    // 2. Low-frequency wooden/platen bottoming out thud
    const oscillator = ctx.createOscillator();
    oscillator.type = 'triangle';
    const baseFreq = isSpecialKey ? 85 : 120;
    oscillator.frequency.setValueAtTime(baseFreq + (Math.random() * 20 - 10), now);
    oscillator.frequency.exponentialRampToValueAtTime(30, now + 0.03);

    const oscGain = ctx.createGain();
    const oscVol = isSpecialKey ? 0.5 : 0.35;
    // Envelope: 2ms attack prevents DC offset "clicking" artifacts
    oscGain.gain.setValueAtTime(0, now);
    oscGain.gain.linearRampToValueAtTime(oscVol, now + 0.002);
    oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.025);

    oscillator.connect(oscGain);
    oscGain.connect(masterGain);

    // OPTIMIZATION: Start at a random offset in the 2-second noise pool
    const randomOffset = Math.random() * 1.5; 
    noise.start(now, randomOffset);
    noise.stop(now + 0.04);

    oscillator.start(now);
    oscillator.stop(now + 0.04);
  } catch (err) {
    // Silent fail for rapid typing edge-cases
  }
}

/**
 * Play key-release spring snap click
 */
export function playKeyRelease() {
  try {
    const ctx = getAudioContext();
    if (!masterCompressor) return;
    const now = ctx.currentTime;

    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(masterVolume * 0.4, now);
    masterGain.connect(masterCompressor);

    const noise = ctx.createBufferSource();
    noise.buffer = getCachedNoisePool(ctx);

    const filter = ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 3200 + (Math.random() * 400); // Slight variance

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.05, now + 0.002);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.02);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(masterGain);

    const randomOffset = Math.random() * 1.5;
    noise.start(now, randomOffset);
    noise.stop(now + 0.03);
  } catch (e) {
    // Silent fail
  }
}

/**
 * Play a metallic mechanical carriage return bell chime ring
 */
export function playCarriageBell() {
  try {
    const ctx = getAudioContext();
    if (!masterCompressor) return;
    const now = ctx.currentTime;

    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(masterVolume, now);
    masterGain.connect(masterCompressor);

    // Dissonant harmonic bell ratios for authentic chime resonance
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const osc3 = ctx.createOscillator(); // Added third harmonic for richness

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(1050, now);

    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(1575, now);
    
    osc3.type = 'sine';
    osc3.frequency.setValueAtTime(2200, now);

    const bellGain1 = ctx.createGain();
    bellGain1.gain.setValueAtTime(0, now);
    bellGain1.gain.linearRampToValueAtTime(0.25, now + 0.01); // 10ms bell strike attack
    bellGain1.gain.exponentialRampToValueAtTime(0.0001, now + 0.8);

    const bellGain2 = ctx.createGain();
    bellGain2.gain.setValueAtTime(0, now);
    bellGain2.gain.linearRampToValueAtTime(0.15, now + 0.01);
    bellGain2.gain.exponentialRampToValueAtTime(0.0001, now + 0.5);
    
    const bellGain3 = ctx.createGain();
    bellGain3.gain.setValueAtTime(0, now);
    bellGain3.gain.linearRampToValueAtTime(0.05, now + 0.01);
    bellGain3.gain.exponentialRampToValueAtTime(0.0001, now + 0.3);

    osc1.connect(bellGain1).connect(masterGain);
    osc2.connect(bellGain2).connect(masterGain);
    osc3.connect(bellGain3).connect(masterGain);

    osc1.start(now); osc1.stop(now + 0.85);
    osc2.start(now); osc2.stop(now + 0.55);
    osc3.start(now); osc3.stop(now + 0.35);
  } catch (err) {
    console.warn('Carriage bell audio failed:', err);
  }
}

/**
 * Play a swift mechanical carriage return slide zip
 */
export function playCarriageReturnNoise() {
  try {
    const ctx = getAudioContext();
    if (!masterCompressor) return;
    const now = ctx.currentTime;

    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(masterVolume, now);
    masterGain.connect(masterCompressor);

    const noise = ctx.createBufferSource();
    noise.buffer = getCachedNoisePool(ctx);

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(400, now);
    filter.frequency.exponentialRampToValueAtTime(2200, now + 0.2); // Wider sweep
    filter.Q.value = 2.0;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.08, now + 0.05); // Zip speeds up
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35); // Long friction fade

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(masterGain);

    // Now works perfectly because our pool is 2 seconds long
    const randomOffset = Math.random() * 1.0;
    noise.start(now, randomOffset); 
    noise.stop(now + 0.4);
  } catch (err) {
    // Ignored
  }
}