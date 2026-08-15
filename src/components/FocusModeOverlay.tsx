import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, Minimize2, Settings, Play, Pause, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useToast } from '../lib/ToastContext';

interface FocusModeOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  content: string;
  onChange: (text: string) => void;
  wordGoal: number;
}

export default function FocusModeOverlay({
  isOpen,
  onClose,
  title,
  content,
  onChange,
  wordGoal
}: FocusModeOverlayProps) {
  const [theme, setTheme] = useState<'sepia' | 'dark' | 'coal'>('sepia');
  const [font, setFont] = useState<'serif' | 'mono' | 'sans'>('serif');
  const [activeSound, setActiveSound] = useState<'none' | 'rain' | 'fireplace' | 'cafe'>('none');
  const [soundVolume, setSoundVolume] = useState<number>(0.3);
  const [enableKeyboardSound, setEnableKeyboardSound] = useState<boolean>(true);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const rainNodeRef = useRef<AudioNode | null>(null);
  const fireplaceNodeRef = useRef<AudioNode | null>(null);
  const cafeNodeRef = useRef<AudioNode | null>(null);
  const volumeGainNodeRef = useRef<GainNode | null>(null);
  const { showToast } = useToast();

  const words = content.trim() === "" ? 0 : content.trim().split(/\s+/).length;

  // Initialize Audio Context on demand
  const initAudio = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      volumeGainNodeRef.current = audioContextRef.current.createGain();
      volumeGainNodeRef.current.gain.setValueAtTime(soundVolume, audioContextRef.current.currentTime);
      volumeGainNodeRef.current.connect(audioContextRef.current.destination);
    }
    if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }
  };

  // Synthesize Keyclick sound
  const playKeyclick = (isSpecialKey = false) => {
    if (!enableKeyboardSound) return;
    try {
      initAudio();
      const ctx = audioContextRef.current;
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const clickGain = ctx.createGain();

      if (isSpecialKey) {
        osc.frequency.setValueAtTime(140, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.08);
        clickGain.gain.setValueAtTime(0.12, ctx.currentTime);
        clickGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.07);
      } else {
        osc.frequency.setValueAtTime(850, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.04);
        clickGain.gain.setValueAtTime(0.06, ctx.currentTime);
        clickGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.035);
      }

      osc.connect(clickGain);
      clickGain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.09);
    } catch (e) {
      // Silence fails gracefully
    }
  };

  // Synthesize Rain (Brownian/Pink Noise)
  const createRainNode = (ctx: AudioContext): AudioNode => {
    const bufferSize = 2 * ctx.sampleRate;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    
    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      output[i] = (lastOut + (0.02 * white)) / 1.02;
      lastOut = output[i];
      output[i] *= 3.5;
    }

    const whiteNoise = ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1200, ctx.currentTime);

    whiteNoise.connect(filter);
    whiteNoise.start();
    return filter;
  };

  // Synthesize Fireplace Crackles
  const createFireplaceNode = (ctx: AudioContext): AudioNode => {
    const bufferSize = ctx.sampleRate * 2;
    const rumbleBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = rumbleBuffer.getChannelData(0);
    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      output[i] = (lastOut + (0.015 * white)) / 1.015;
      lastOut = output[i];
      output[i] *= 1.8;
    }

    const rumbleNode = ctx.createBufferSource();
    rumbleNode.buffer = rumbleBuffer;
    rumbleNode.loop = true;
    rumbleNode.start();

    const lowpass = ctx.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.setValueAtTime(250, ctx.currentTime);
    rumbleNode.connect(lowpass);

    const interval = setInterval(() => {
      if (activeSound !== 'fireplace') {
        clearInterval(interval);
        return;
      }
      if (Math.random() > 0.4) {
        try {
          const osc = ctx.createOscillator();
          const clickG = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(1200 + Math.random() * 800, ctx.currentTime);
          clickG.gain.setValueAtTime(0.08 + Math.random() * 0.12, ctx.currentTime);
          clickG.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.01 + Math.random() * 0.02);
          
          osc.connect(clickG);
          if (volumeGainNodeRef.current) {
            clickG.connect(volumeGainNodeRef.current);
          }
          osc.start();
          osc.stop(ctx.currentTime + 0.04);
        } catch (e) {}
      }
    }, 120);

    return lowpass;
  };

  // Synthesize Cafe Murmur
  const createCafeNode = (ctx: AudioContext): AudioNode => {
    const bufferSize = ctx.sampleRate * 3;
    const cafeBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = cafeBuffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
      output[i] = (
        Math.sin(2 * Math.PI * 110 * (i / ctx.sampleRate)) * 0.2 +
        Math.sin(2 * Math.PI * 180 * (i / ctx.sampleRate)) * 0.15 +
        Math.sin(2 * Math.PI * 320 * (i / ctx.sampleRate)) * 0.08 +
        (Math.random() * 2 - 1) * 0.05
      );
    }

    const cafeSource = ctx.createBufferSource();
    cafeSource.buffer = cafeBuffer;
    cafeSource.loop = true;
    cafeSource.start();

    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.setValueAtTime(450, ctx.currentTime);
    cafeSource.connect(lp);

    return lp;
  };

  // Handle background ambient sound transitions
  useEffect(() => {
    if (!isOpen) {
      stopAllAmbient();
      return;
    }

    initAudio();
    const ctx = audioContextRef.current;
    const masterGain = volumeGainNodeRef.current;
    if (!ctx || !masterGain) return;

    masterGain.gain.setValueAtTime(soundVolume, ctx.currentTime);
    stopAllAmbient();

    if (activeSound === 'rain') {
      try {
        const rainNode = createRainNode(ctx);
        rainNode.connect(masterGain);
        rainNodeRef.current = rainNode;
      } catch (err) {
        console.error("Rain synthesis error", err);
      }
    } else if (activeSound === 'fireplace') {
      try {
        const fireNode = createFireplaceNode(ctx);
        fireNode.connect(masterGain);
        fireplaceNodeRef.current = fireNode;
      } catch (err) {
        console.error("Fireplace synthesis error", err);
      }
    } else if (activeSound === 'cafe') {
      try {
        const cafeNode = createCafeNode(ctx);
        cafeNode.connect(masterGain);
        cafeNodeRef.current = cafeNode;
      } catch (err) {
        console.error("Cafe synthesis error", err);
      }
    }

    return () => {
      stopAllAmbient();
    };
  }, [activeSound, isOpen]);

  // Handle master volume changes
  useEffect(() => {
    if (volumeGainNodeRef.current && audioContextRef.current) {
      volumeGainNodeRef.current.gain.setValueAtTime(soundVolume, audioContextRef.current.currentTime);
    }
  }, [soundVolume]);

  const stopAllAmbient = () => {
    try {
      if (rainNodeRef.current) {
        rainNodeRef.current.disconnect();
        rainNodeRef.current = null;
      }
      if (fireplaceNodeRef.current) {
        fireplaceNodeRef.current.disconnect();
        fireplaceNodeRef.current = null;
      }
      if (cafeNodeRef.current) {
        cafeNodeRef.current.disconnect();
        cafeNodeRef.current = null;
      }
    } catch (e) {
      // Ignored
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const isSpecial = e.key === ' ' || e.key === 'Enter' || e.key === 'Backspace' || e.key === 'Delete';
    playKeyclick(isSpecial);
  };

  const themes = {
    sepia: {
      bg: "bg-[#f4ebd0]",
      text: "text-[#433422]",
      textarea: "bg-[#f4ebd0] text-[#433422] border-none",
      vignette: "from-[#f4ebd0]/10 via-transparent to-[#2c1d0f]/25",
      menu: "bg-[#efe5c4] border-[#d8cda2]",
      activeBtn: "bg-[#e2d5b0] text-[#433422]",
      caretColor: "#433422"
    },
    dark: {
      bg: "bg-[#161b22]",
      text: "text-slate-200",
      textarea: "bg-[#161b22] text-slate-200 border-none",
      vignette: "from-transparent via-transparent to-black/55",
      menu: "bg-[#21262d] border-[#30363d]",
      activeBtn: "bg-[#30363d] text-white",
      caretColor: "#38bdf8"
    },
    coal: {
      bg: "bg-[#0d1117]",
      text: "text-slate-300",
      textarea: "bg-[#0d1117] text-slate-300 border-none",
      vignette: "from-[#0d1117]/10 via-transparent to-[#000000]/80",
      menu: "bg-[#161b22] border-[#21262d]",
      activeBtn: "bg-[#21262d] text-white",
      caretColor: "#ffffff"
    }
  };

  const fonts = {
    serif: "font-serif tracking-normal leading-relaxed text-lg lg:text-xl",
    mono: "font-mono tracking-tight leading-loose text-base lg:text-lg",
    sans: "font-sans tracking-tight leading-relaxed text-base lg:text-lg"
  };

  const currentTheme = themes[theme];

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className={`fixed inset-0 z-50 flex flex-col items-center justify-center p-4 lg:p-12 overflow-hidden select-none transition-colors duration-700 ${currentTheme.bg}`}
      >
        {/* Soft Vignette Overlay */}
        <div className={`absolute inset-0 pointer-events-none bg-radial ${currentTheme.vignette}`} />

        {/* Minimalist Floated Toolbar - Fades out, visible on hover at the top */}
        <div className="absolute top-6 left-1/2 transform -translate-x-1/2 flex items-center justify-center gap-3 px-5 py-2.5 rounded-2xl shadow-2xl border backdrop-blur-xl z-30 opacity-20 hover:opacity-100 transition-opacity duration-300 bg-[#0c0e12]/80 border-slate-800 text-slate-200">
          
          {/* Sounds selector */}
          <div className="flex items-center gap-1.5 border-r border-slate-800 pr-3">
            <span className="text-[10px] uppercase font-mono tracking-widest opacity-50 mr-1 text-slate-400">Atmosphere</span>
            <button
              onClick={() => { setActiveSound('none'); showToast('Atmosphere muted', 'info'); }}
              className={`px-2.5 py-1 rounded-xl text-[10px] font-mono font-bold cursor-pointer transition-all ${activeSound === 'none' ? 'bg-amber-500 text-slate-950 font-black shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
            >
              Mute
            </button>
            <button
              onClick={() => { setActiveSound('rain'); showToast('Rain atmosphere activated', 'success'); }}
              className={`px-2.5 py-1 rounded-xl text-[10px] font-mono font-bold cursor-pointer transition-all ${activeSound === 'rain' ? 'bg-amber-500 text-slate-950 font-black shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
            >
              Rain
            </button>
            <button
              onClick={() => { setActiveSound('fireplace'); showToast('Hearth fireplace activated', 'success'); }}
              className={`px-2.5 py-1 rounded-xl text-[10px] font-mono font-bold cursor-pointer transition-all ${activeSound === 'fireplace' ? 'bg-amber-500 text-slate-950 font-black shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
            >
              Hearth
            </button>
            <button
              onClick={() => { setActiveSound('cafe'); showToast('Cafe murmur activated', 'success'); }}
              className={`px-2.5 py-1 rounded-xl text-[10px] font-mono font-bold cursor-pointer transition-all ${activeSound === 'cafe' ? 'bg-amber-500 text-slate-950 font-black shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
            >
              Cafe
            </button>
          </div>

          {/* Keyclick sfx toggle */}
          <button
            onClick={() => {
              setEnableKeyboardSound(!enableKeyboardSound);
              showToast(enableKeyboardSound ? 'Keyclick sounds disabled' : 'Keyclick sounds enabled', 'info');
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono flex items-center gap-1.5 cursor-pointer border transition-all ${enableKeyboardSound ? 'bg-amber-500/10 border-amber-500/30 text-amber-400 font-bold' : 'border-slate-800 text-slate-400'}`}
            title="Toggle Mechanical Keypress Sounds"
          >
            <Volume2 size={13} />
            <span className="text-[10px]">{enableKeyboardSound ? 'Clicks On' : 'Clicks Off'}</span>
          </button>

          <div className="w-px h-5 bg-slate-800"></div>

          {/* Theme Selector */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setTheme('sepia')}
              className={`w-5 h-5 rounded-full bg-[#f4ebd0] border border-[#d8cda2] cursor-pointer transition-transform ${theme === 'sepia' ? 'scale-110 ring-2 ring-amber-500' : 'hover:scale-105'}`}
              title="Sepia Vintage Theme"
            />
            <button
              onClick={() => setTheme('dark')}
              className={`w-5 h-5 rounded-full bg-[#161b22] border border-[#30363d] cursor-pointer transition-transform ${theme === 'dark' ? 'scale-110 ring-2 ring-amber-500' : 'hover:scale-105'}`}
              title="Midnight Dark Theme"
            />
            <button
              onClick={() => setTheme('coal')}
              className={`w-5 h-5 rounded-full bg-[#0d1117] border border-black cursor-pointer transition-transform ${theme === 'coal' ? 'scale-110 ring-2 ring-white' : 'hover:scale-105'}`}
              title="Pure Pitch Coal Theme"
            />
          </div>

          <div className="w-px h-5 bg-slate-800"></div>

          {/* Font selection */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setFont('serif')}
              className={`px-2.5 py-1 text-[10px] font-mono rounded-xl cursor-pointer ${font === 'serif' ? 'bg-amber-500 text-slate-950 font-black shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
            >
              Serif
            </button>
            <button
              onClick={() => setFont('mono')}
              className={`px-2.5 py-1 text-[10px] font-mono rounded-xl cursor-pointer ${font === 'mono' ? 'bg-amber-500 text-slate-950 font-black shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
            >
              Mono
            </button>
            <button
              onClick={() => setFont('sans')}
              className={`px-2.5 py-1 text-[10px] font-mono rounded-xl cursor-pointer ${font === 'sans' ? 'bg-amber-500 text-slate-950 font-black shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
            >
              Sans
            </button>
          </div>

          {activeSound !== 'none' && (
            <>
              <div className="w-px h-5 bg-slate-800"></div>
              <div className="flex items-center gap-2">
                <Volume2 size={13} className="text-slate-400" />
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={soundVolume}
                  onChange={(e) => setSoundVolume(parseFloat(e.target.value))}
                  className="w-16 h-1.5 accent-amber-500 bg-slate-800 rounded-lg cursor-pointer"
                />
              </div>
            </>
          )}

          <div className="w-px h-5 bg-slate-800"></div>

          {/* Exit Focus Mode */}
          <button
            onClick={() => {
              onClose();
              showToast('Exited focus mode workspace', 'info');
            }}
            className="flex items-center gap-1.5 bg-rose-950/40 hover:bg-rose-900/60 border border-rose-500/30 text-rose-300 font-mono text-xs font-bold px-3 py-1.5 rounded-xl transition-all cursor-pointer shadow-md"
          >
            <Minimize2 size={13} />
            <span>Exit Zen</span>
          </button>
        </div>

        {/* Content Sheet */}
        <div className="w-full max-w-3xl flex-1 flex flex-col justify-start mt-16 mb-8 z-10">
          {/* Header Title */}
          <div className="text-center mb-6">
            <h2 className="text-xs uppercase font-mono tracking-widest font-bold opacity-40 select-none">
              {title}
            </h2>
          </div>

          {/* Text Area */}
          <div className="flex-1 w-full relative">
            <textarea
              value={content}
              onKeyDown={handleKeyDown}
              onChange={(e) => onChange(e.target.value)}
              className={`w-full h-full resize-none focus:outline-none select-text pr-2 py-2 overflow-y-auto ${currentTheme.textarea} ${fonts[font]}`}
              placeholder="Begin writing... let your thoughts flow into the digital ether."
              style={{
                caretColor: currentTheme.caretColor,
                lineHeight: '2.2'
              }}
              id="cinematic-focus-editor"
            />
          </div>
        </div>

        {/* Bottom Minimalist Status Bar */}
        <div className="absolute bottom-0 inset-x-0 h-12 flex items-center justify-between px-12 text-xs font-mono select-none opacity-0 hover:opacity-100 transition-opacity duration-300 bg-gradient-to-t from-black/80 to-transparent text-slate-300">
          <div>
            Words: <span className="text-amber-400 font-bold">{words.toLocaleString()}</span>
          </div>
          <div>
            Session: <span className="text-slate-100 font-bold">Zen Flow Workspace</span>
          </div>
          {wordGoal > 0 && (
            <div>
              Goal: <span className="text-amber-400 font-bold">{words.toLocaleString()} / {wordGoal.toLocaleString()} ({Math.round((words / wordGoal) * 100)}%)</span>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}