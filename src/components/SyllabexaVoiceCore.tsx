import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mic, MicOff, Sparkles, Send, Volume2, Square, Radio, Wand2, RefreshCw } from 'lucide-react';

interface SyllabexaVoiceCoreProps {
  onVoiceResult: (prose: string, directive?: { action: string; value: string }) => void;
  voiceProfile?: any;
  isProcessing?: boolean;
  setIsProcessing?: (processing: boolean) => void;
  placeholder?: string;
  className?: string;
}

export default function SyllabexaVoiceCore({
  onVoiceResult,
  voiceProfile,
  isProcessing: externalProcessing,
  setIsProcessing: setExternalProcessing,
  placeholder = "Speak continuous prose or dictate formatting instructions...",
  className = ""
}: SyllabexaVoiceCoreProps) {
  const [isListening, setIsListening] = useState(false);
  const [typedInput, setTypedInput] = useState("");
  const [localProcessing, setLocalProcessing] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState("");
  const [transcriptHistory, setTranscriptHistory] = useState<string[]>([]);
  const [speechError, setSpeechError] = useState<string | null>(null);

  const isProcessing = externalProcessing !== undefined ? externalProcessing : localProcessing;
  const setIsProcessing = setExternalProcessing || setLocalProcessing;

  const recognitionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const [audioLevel, setAudioLevel] = useState<number>(0);

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = 'en-US';

      rec.onstart = () => {
        setIsListening(true);
        setSpeechError(null);
        startAudioVisualizer();
      };

      rec.onresult = (event: any) => {
        let interim = "";
        let final = "";

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            final += event.results[i][0].transcript;
          } else {
            interim += event.results[i][0].transcript;
          }
        }

        if (interim) {
          setInterimTranscript(interim);
        }

        if (final.trim()) {
          setInterimTranscript("");
          handleSendRawText(final);
        }
      };

      rec.onerror = (event: any) => {
        console.error("Speech Recognition Error:", event.error);
        if (event.error === 'not-allowed') {
          setSpeechError("Microphone access blocked. Click a preset simulation button to test voice commands.");
        } else {
          setSpeechError(`Speech error: ${event.error}`);
        }
        setIsListening(false);
        stopAudioVisualizer();
      };

      rec.onend = () => {
        setIsListening(false);
        stopAudioVisualizer();
      };

      recognitionRef.current = rec;
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      stopAudioVisualizer();
    };
  }, [voiceProfile]);

  // Audio spectrum visualizer
  const startAudioVisualizer = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioContextClass();
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 64;
      source.connect(analyser);

      audioContextRef.current = ctx;
      analyserRef.current = analyser;

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const draw = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);
        
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const average = sum / bufferLength;
        setAudioLevel(average); // average sound amplitude
        
        animationFrameRef.current = requestAnimationFrame(draw);
      };

      draw();
    } catch (err) {
      console.warn("Could not start visual audio visualizer:", err);
    }
  };

  const stopAudioVisualizer = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close();
    }
    audioContextRef.current = null;
    analyserRef.current = null;
    setAudioLevel(0);
  };

  const toggleListening = () => {
    if (!recognitionRef.current) {
      setSpeechError("Web Speech API not supported in this browser. Please use simulation options below.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      try {
        recognitionRef.current.start();
      } catch (err) {
        console.error("Failed to start speech recognition:", err);
        recognitionRef.current.abort();
        setTimeout(() => recognitionRef.current.start(), 200);
      }
    }
  };

  const handleSendRawText = async (textToSend: string) => {
    const rawText = textToSend.trim();
    if (!rawText) return;

    setIsProcessing(true);
    setTranscriptHistory(prev => [rawText, ...prev].slice(0, 5));

    try {
      const response = await fetch('/api/syllabexa/speech-to-print', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rawSpeech: rawText,
          voiceProfile: voiceProfile,
          currentBlocks: []
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }

      const result = await response.json();
      
      // Pass the outcome back to the orchestrator / ManuscriptEditor
      if (result.hasProse && result.processedProse) {
        onVoiceResult(
          result.processedProse,
          result.hasLayoutCommand ? result.layoutDirectives : undefined
        );
      } else if (result.hasLayoutCommand) {
        onVoiceResult("", result.layoutDirectives);
      }
    } catch (err) {
      console.error("Speech-to-print processing failed:", err);
      // Fallback
      onVoiceResult(rawText);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!typedInput.trim() || isProcessing) return;
    const text = typedInput;
    setTypedInput("");
    handleSendRawText(text);
  };

  // Simulation templates for reliable testing inside sandboxed iframe
  const presets = [
    {
      label: "🎙️ Start Chapter",
      text: "start a new chapter called The Iron Law of Location and say foot traffic and vehicle visibility are paramount to finding success."
    },
    {
      label: "📦 Insert Callout",
      text: "put Cornelius Kremers quote A business built on hot water and clean sheets will outlast any empire built on sand as an elegant callout box and then toggle dropcap please."
    },
    {
      label: "🎨 Toggle Dropcap",
      text: "please toggle dropcap"
    },
    {
      label: "📏 Shift Trim to 5x8",
      text: "shift trim size to 5x8 and format the first block as editorial"
    }
  ];

  return (
    <aside aria-label="Syllabexa Voice Core" id="syllabexa-voice-core-container" className={`bg-[#0f1115] border border-slate-800 rounded-2xl p-4 space-y-4 shadow-xl custom-scrollbar ${className}`}>
      
      {/* Microphone Indicator & Visualizer */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {/* Pulsing microphone outer ring */}
          <button
            type="button"
            onClick={toggleListening}
            disabled={isProcessing}
            className={`w-12 h-12 rounded-full flex items-center justify-center relative cursor-pointer focus:outline-none transition-all duration-300 ${
              isListening
                ? 'bg-red-600 shadow-[0_0_20px_rgba(220,38,38,0.5)] border-2 border-red-400'
                : 'bg-[#181d26] hover:bg-[#1f2632] border border-slate-700/60 shadow-[0_0_12px_rgba(99,102,241,0.15)] hover:border-indigo-500/30'
            }`}
            style={{
              transform: isListening ? `scale(${1 + (audioLevel / 150)})` : 'scale(1)'
            }}
            title={isListening ? "Stop listening" : "Start voice listening"}
          >
            {isListening ? (
              <Mic className="w-5 h-5 text-white animate-pulse" />
            ) : (
              <MicOff className="w-5 h-5 text-slate-400 group-hover:text-slate-200" />
            )}
            
            {/* Glowing active animation indicator */}
            {isListening && (
              <span className="absolute inset-0 rounded-full border-2 border-red-500 animate-ping opacity-75 pointer-events-none" />
            )}
          </button>

          <div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <h4 className="text-xs font-mono uppercase tracking-widest text-slate-300 font-bold">
                {isListening ? "Continuous Dictation Active" : "Syllabexa VoiceCore Ready"}
              </h4>
            </div>
            <p className="text-[10px] text-slate-500 font-mono mt-0.5">
              {isListening 
                ? "Listening to raw verbal stream..." 
                : "Continuous speech streaming & layouts engine"}
            </p>
          </div>
        </div>

        {/* Real-time spectrum visualization */}
        {isListening ? (
          <div className="flex items-center gap-1 h-5 bg-[#090b0e] px-2.5 py-1.5 rounded-full border border-slate-850">
            {[...Array(6)].map((_, i) => {
              const h = Math.max(3, (audioLevel / 10) * (0.4 + Math.random() * 0.8));
              return (
                <span 
                  key={i} 
                  className="w-0.75 bg-red-500 rounded-full transition-all duration-75"
                  style={{ height: `${h}px` }}
                />
              );
            })}
          </div>
        ) : (
          <div className="text-[9px] font-mono font-bold text-indigo-400/80 bg-indigo-950/20 border border-indigo-900/30 px-2.5 py-1 rounded-full flex items-center gap-1.5">
            <Radio className="w-3 h-3 text-indigo-400 animate-pulse" />
            <span>VOICE TO CANVAS</span>
          </div>
        )}
      </div>

      {/* Interim Speech Transcription Block */}
      <AnimatePresence>
        {(interimTranscript || speechError) && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="p-3 rounded-xl border text-[11px] leading-relaxed font-sans"
            style={{
              backgroundColor: speechError ? '#450a0a20' : '#0a0d14',
              borderColor: speechError ? '#ef444430' : '#1e293b'
            }}
          >
            {speechError ? (
              <span className="text-red-400">{speechError}</span>
            ) : (
              <span className="text-indigo-300 italic">"{interimTranscript}"</span>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Text Input Proxy Box */}
      <form onSubmit={handleTextSubmit} className="relative flex items-center gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={typedInput}
            onChange={(e) => setTypedInput(e.target.value)}
            placeholder={placeholder}
            disabled={isProcessing}
            className="w-full bg-[#14171d] border border-slate-800 focus:border-indigo-500 outline-none rounded-xl pl-3 pr-10 py-3 text-xs text-slate-200 placeholder-slate-500 transition-colors font-sans"
          />
          <button
            type="submit"
            disabled={isProcessing || !typedInput.trim()}
            className="absolute right-2 top-2 p-1.5 text-slate-400 hover:text-indigo-400 disabled:opacity-20 transition-colors cursor-pointer"
          >
            {isProcessing ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-400" />
            ) : (
              <Send className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </form>

      {/* Simulated Raw Dictation Triggers */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-1">
          <Wand2 className="w-3 h-3 text-indigo-400" />
          <span className="block text-[9px] font-mono uppercase tracking-wider text-slate-500 font-bold">
            Simulate Voice Command Presets
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {presets.map((p, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                if (isProcessing) return;
                setTypedInput(p.text);
                handleSendRawText(p.text);
              }}
              disabled={isProcessing}
              className="px-2.5 py-1.5 bg-[#14171d] hover:bg-[#1a1f29] border border-slate-800 hover:border-indigo-500/30 rounded-lg text-left text-[10px] font-mono text-slate-400 hover:text-slate-200 transition-all cursor-pointer flex items-center justify-between group"
            >
              <span className="truncate">{p.label}</span>
              <span className="text-[8px] text-slate-600 group-hover:text-indigo-400 font-black">RUN</span>
            </button>
          ))}
        </div>
      </div>

      {/* Mini History Stream */}
      {transcriptHistory.length > 0 && (
        <div className="pt-2 border-t border-slate-850">
          <span className="block text-[8px] font-mono uppercase tracking-widest text-slate-600 mb-1">Last Dictated</span>
          <div className="space-y-1">
            {transcriptHistory.map((h, i) => (
              <div key={i} className="text-[10px] text-slate-500 font-mono truncate">
                • "{h}"
              </div>
            ))}
          </div>
        </div>
      )}

    </aside>
  );
}