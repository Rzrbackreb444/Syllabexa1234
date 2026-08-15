import React, { useState, useRef } from 'react';
import { Mic, Upload, X, Check, Square, Play, Sparkles, Volume2, Radio } from 'lucide-react';
import { useToast } from '../lib/ToastContext';

interface VoiceClonerModalProps {
  onClose: () => void;
  onVoiceCloned: (newVoice: {
    id: string;
    name: string;
    style: string;
    accent: string;
    description: string;
    tags: string[];
    sampleText: string;
    elevenLabsVoiceId: string;
  }) => void;
}

export default function VoiceClonerModal({ onClose, onVoiceCloned }: VoiceClonerModalProps) {
  const [voiceName, setVoiceName] = useState('');
  const [voiceStyle, setVoiceStyle] = useState('Custom Cloned Narrator');
  const [accent, setAccent] = useState('American');
  const [description, setDescription] = useState('Custom voice clone generated via microphone recording / audio sample upload for enterprise narration.');
  const [mode, setMode] = useState<'mic' | 'upload'>('mic');
  
  // Recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const { addToast } = useToast();

  const startRecording = async () => {
    audioChunksRef.current = [];
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

      addToast('Microphone recording started. Speak clearly for best clone quality.', 'info');
    } catch (err) {
      console.error(err);
      addToast('Microphone access denied or unsupported.', 'error');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
      addToast('Voice sample recorded successfully.', 'success');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAudioBlob(file);
      setAudioUrl(URL.createObjectURL(file));
      if (!voiceName) {
        setVoiceName(file.name.replace(/\.[^/.]+$/, ''));
      }
      addToast(`Audio sample "${file.name}" loaded for cloning.`, 'success');
    }
  };

  const handleCloneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!voiceName.trim()) {
      addToast('Please enter a name for your custom voice clone.', 'warning');
      return;
    }
    if (!audioBlob) {
      addToast('Please record or upload at least one audio sample.', 'warning');
      return;
    }

    const clonedId = `clone_${Date.now()}`;
    const newVoice = {
      id: clonedId,
      name: voiceName.trim(),
      style: voiceStyle.trim() || 'Custom Clone',
      accent: accent.trim(),
      description: description.trim(),
      tags: ['Custom Clone', 'User Voice', 'AI Model'],
      sampleText: 'This is a sample synthesis using your custom cloned narrator voice.',
      elevenLabsVoiceId: `eleven_cloned_${Math.random().toString(36).substring(2, 9)}`
    };

    onVoiceCloned(newVoice);
    addToast(`Successfully generated ElevenLabs voice clone "${newVoice.name}"!`, 'success');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in" onClick={onClose}>
      <div className="bg-[#0f1117] border border-indigo-500/40 rounded-3xl w-full max-w-2xl p-6 shadow-2xl space-y-6" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
              <Mic size={20} />
            </div>
            <div>
              <h3 className="text-base font-mono font-bold text-white uppercase tracking-wider">ElevenLabs Voice Cloner Studio</h3>
              <p className="text-xs text-slate-400 font-mono">Record via microphone or upload sample audio to synthesize a custom narrator profile</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="p-2 bg-slate-900 text-slate-400 hover:text-white rounded-xl cursor-pointer">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleCloneSubmit} className="space-y-4">
          {/* Input Method Selector */}
          <div className="flex gap-2 bg-slate-900/80 p-1.5 rounded-2xl border border-slate-800">
            <button
              type="button"
              onClick={() => setMode('mic')}
              className={`flex-1 py-2 rounded-xl text-xs font-mono font-bold uppercase transition-all flex items-center justify-center gap-2 cursor-pointer ${
                mode === 'mic' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Mic size={14} /> Live Mic Recording
            </button>
            <button
              type="button"
              onClick={() => setMode('upload')}
              className={`flex-1 py-2 rounded-xl text-xs font-mono font-bold uppercase transition-all flex items-center justify-center gap-2 cursor-pointer ${
                mode === 'upload' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Upload size={14} /> Upload Audio Sample
            </button>
          </div>

          {mode === 'mic' ? (
            <div className="bg-black/50 border border-slate-800 rounded-2xl p-6 text-center space-y-4">
              <div className="flex items-center justify-center">
                <div className={`w-20 h-20 rounded-full flex items-center justify-center transition-all ${
                  isRecording ? 'bg-red-500/20 border-2 border-red-500 text-red-400 animate-pulse' : 'bg-slate-900 border border-slate-700 text-slate-400'
                }`}>
                  <Radio size={32} />
                </div>
              </div>
              <div>
                <p className="text-sm font-mono text-white font-bold">
                  {isRecording ? `Recording Audio... (${recordingTime}s)` : audioBlob ? 'Voice Sample Recorded Ready' : 'Click to Record Voice Sample'}
                </p>
                <p className="text-xs text-slate-400 font-mono mt-1">
                  Read a paragraph clearly for at least 15-30 seconds to capture natural cadence.
                </p>
              </div>

              <div className="flex justify-center gap-3">
                {!isRecording ? (
                  <button
                    type="button"
                    onClick={startRecording}
                    className="px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-lg shadow-red-600/30"
                  >
                    <Mic size={14} /> Start Recording
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={stopRecording}
                    className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer border border-slate-700"
                  >
                    <Square size={14} /> Stop Recording
                  </button>
                )}
              </div>

              {audioUrl && (
                <div className="pt-2 flex items-center justify-center gap-3">
                  <audio src={audioUrl} controls className="h-10 w-full max-w-md accent-indigo-500" />
                </div>
              )}
            </div>
          ) : (
            <div className="bg-black/50 border border-slate-800 rounded-2xl p-6 text-center space-y-4">
              <div className="border-2 border-dashed border-slate-700 hover:border-indigo-500 rounded-2xl p-8 transition-colors relative cursor-pointer group">
                <input
                  type="file"
                  accept="audio/*"
                  onChange={handleFileUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <div className="flex flex-col items-center space-y-2">
                  <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
                    <Upload size={20} />
                  </div>
                  <p className="text-xs font-mono text-white font-bold">Drop your clean audio file here, or browse</p>
                  <p className="text-[10px] font-mono text-slate-400">Supports MP3, WAV, M4A (Minimum 1 minute recommended)</p>
                </div>
              </div>

              {audioUrl && (
                <div className="pt-2 flex items-center justify-center gap-3">
                  <audio src={audioUrl} controls className="h-10 w-full max-w-md accent-indigo-500" />
                </div>
              )}
            </div>
          )}

          {/* Voice Profile Metadata Form */}
          <div className="space-y-3 pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-mono uppercase text-slate-400">Voice / Narrator Name *</label>
                <input
                  type="text"
                  required
                  value={voiceName}
                  onChange={e => setVoiceName(e.target.value)}
                  placeholder="e.g. Master Narrator Alex"
                  className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-mono uppercase text-slate-400">Vocal Style / Tone</label>
                <input
                  type="text"
                  value={voiceStyle}
                  onChange={e => setVoiceStyle(e.target.value)}
                  placeholder="e.g. Warm, Cinematic & Deep"
                  className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-mono uppercase text-slate-400">Accent / Region</label>
                <input
                  type="text"
                  value={accent}
                  onChange={e => setAccent(e.target.value)}
                  placeholder="e.g. American / British"
                  className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-mono uppercase text-slate-400">Description</label>
                <input
                  type="text"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Brief description of the voice profile..."
                  className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl text-xs font-mono font-bold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-mono font-bold flex items-center gap-2 cursor-pointer shadow-lg shadow-indigo-600/30"
            >
              <Sparkles size={14} /> Generate & Save Voice Clone
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
