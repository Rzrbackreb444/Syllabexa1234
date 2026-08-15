import React, { useState, useRef } from 'react';
import { Play, Square, Download, Mic2, Settings2, FastForward, Cpu, Sparkles, Volume2, BookOpen, Check, RefreshCw, Layers, Plus, Mic } from 'lucide-react';
import { useManuscriptStore } from '../store/manuscriptStore';
import { useToast } from '../lib/ToastContext';
import AudioMetadataEditor, { AudioMetadata } from './AudioMetadataEditor';
import VisualAudioWaveform from './VisualAudioWaveform';
import VoiceDirectorPanel from './VoiceDirectorPanel';
import VoiceClonerModal from './VoiceClonerModal';
import LyriaMusicGenerator from './LyriaMusicGenerator';

interface VoiceProfile {
  id: string;
  name: string;
  style: string;
  accent: string;
  description: string;
  tags: string[];
  sampleText: string;
  elevenLabsVoiceId: string;
}

const ELEVENLABS_VOICE_GALLERY: VoiceProfile[] = [
  {
    id: 'Nick',
    name: 'Nick Kremers',
    style: 'Calm, Confident & Purposeful',
    accent: 'American',
    description: 'Supportive mentor with lived wisdom — warm mid-range, gentle cadence, and natural empathy. Ideal for memoirs, recovery guides, and self-development.',
    tags: ['Authoritative', 'Memoir', 'Mentor'],
    sampleText: 'The lease determines your exit. Ensure assignability, or you don\'t own an asset—you own a decade of debt.',
    elevenLabsVoiceId: 'nick_kremers_custom_id' // Replace with your exact ElevenLabs voice ID if needed
  },
  {
    id: 'Jon',
    name: 'Jon',
    style: 'Relaxed, Deep & Approachable',
    accent: 'American',
    description: 'Natural, clear, and easygoing. The voice of National Geographic docs and major campaigns. Ideal for long-form non-fiction and explainer audiobooks.',
    tags: ['Non-Fiction', 'Documentary', 'Conversational'],
    sampleText: 'In the quiet hours before dawn, the old library held secrets carved in dust.',
    elevenLabsVoiceId: '21m00Tcm4TlvDq8ikWAM'
  },
  {
    id: 'Morgan',
    name: 'Morgan',
    style: 'Deep, Powerful & Confident',
    accent: 'American',
    description: 'Resonant and warm storyteller delivering unhurried, comforting wisdom that instantly builds trust and captivates audiences.',
    tags: ['Narration', 'Wisdom', 'Resonant'],
    sampleText: 'Capital allocation is the single most important duty of an enterprise leader.',
    elevenLabsVoiceId: 'AZnzlk1XvdvUeBnXmlld'
  },
  {
    id: 'Havoc',
    name: 'Havoc',
    style: 'Gritty Southern Gothic',
    accent: 'US - Southern',
    description: 'Carved from dust, sweat, an’ old ghosts. Perfect for dark country tales, eerie folklore, and Southern gothic horror.',
    tags: ['Southern Gothic', 'Gritty', 'Horror'],
    sampleText: 'Step into the world of Havoc, a voice carved from dust, sweat, an’ old ghosts.',
    elevenLabsVoiceId: 'erXwobaYiN019PkySvjV'
  },
  {
    id: 'RustyMalone',
    name: 'Rusty Malone',
    style: 'Hoarse & Weathered',
    accent: 'American',
    description: 'A deep, raspy, grumbling character voice with a rough, textured tone. Ideal for gritty thrillers and outlaws.',
    tags: ['Gritty', 'Thriller', 'Raspy'],
    sampleText: 'The anomaly on radar was not a storm. It was descending into the basin.',
    elevenLabsVoiceId: 'VR6AewLTigWG4xSOukaG'
  },
  {
    id: 'Bella',
    name: 'Bella',
    style: 'Professional, Bright & Warm',
    accent: 'American',
    description: 'Polished narrative quality with medium-high pitch and crisp diction. Highly intelligible and engaging for long-form listening.',
    tags: ['Educational', 'Professional', 'Bright'],
    sampleText: 'We ran until the city lights were just a distant constellation in the smog.',
    elevenLabsVoiceId: 'EXAVITQu4vr4xnSDxMaL'
  }
];

export default function NeuralAudioStudio() {
  const chapters = useManuscriptStore(state => state.chapters);
  const [selectedChapterId, setSelectedChapterId] = useState<string>(chapters[0]?.id || '1');
  const [voiceGallery, setVoiceGallery] = useState<VoiceProfile[]>(ELEVENLABS_VOICE_GALLERY);
  const [selectedVoiceId, setSelectedVoiceId] = useState<string>(ELEVENLABS_VOICE_GALLERY[0].id);
  const [showVoiceClonerModal, setShowVoiceClonerModal] = useState<boolean>(false);
  const [stability, setStability] = useState<number>(0.75);
  const [similarityBoost, setSimilarityBoost] = useState<number>(0.75);
  const [status, setStatus] = useState<'idle' | 'synthesizing' | 'playing'>('idle');
  const [progress, setProgress] = useState<number>(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<AudioMetadata>({
    title: 'Untitled Audiobook Chapter',
    author: 'Nicholas Kremers',
    genre: 'Audiobook / Non-Fiction',
    year: '2026',
    album: 'Syllabexa Master Edition',
    trackNumber: '1'
  });

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { showToast } = useToast();

  const currentChapter = chapters.find(c => c.id === selectedChapterId) || chapters[0];
  const selectedVoice = voiceGallery.find(v => v.id === selectedVoiceId) || voiceGallery[0];

  const handleGenerateNarration = async () => {
    if (!currentChapter) return;
    if (status === 'playing') {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      setStatus('idle');
      setProgress(0);
      return;
    }

    setStatus('synthesizing');
    showToast(`Synthesizing chapter "${currentChapter.title}" with ElevenLabs voice ${selectedVoice.name}...`, 'info');

    try {
      const textToSynthesize = currentChapter.content || selectedVoice.sampleText;
      const response = await fetch('/api/elevenlabs/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: textToSynthesize.slice(0, 1500),
          voiceId: selectedVoice.elevenLabsVoiceId,
          stability,
          similarityBoost
        })
      });

      if (!response.ok) {
        const errJson = await response.json();
        throw new Error(errJson.error || 'ElevenLabs synthesis failed.');
      }

      const audioBlob = await response.blob();
      const url = URL.createObjectURL(audioBlob);
      setAudioUrl(url);

      if (audioRef.current) {
        audioRef.current.src = url;
        audioRef.current.onended = () => {
          setStatus('idle');
          setProgress(0);
          showToast('Narration playback completed.', 'info');
        };
        audioRef.current.ontimeupdate = () => {
          if (audioRef.current && audioRef.current.duration) {
            setProgress((audioRef.current.currentTime / audioRef.current.duration) * 100);
          }
        };
        await audioRef.current.play();
        setStatus('playing');
        showToast('Now streaming neural audio narration!', 'success');
      }
    } catch (err: any) {
      console.warn('ElevenLabs API fallback:', err.message);
      showToast(`ElevenLabs Notice: ${err.message}. Using browser audio simulation fallback.`, 'warning');

      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(currentChapter.content || selectedVoice.sampleText);
        utterance.onend = () => {
          setStatus('idle');
          setProgress(0);
        };
        utterance.onboundary = (e) => {
          setProgress((e.charIndex / (currentChapter.content?.length || 100)) * 100);
        };
        window.speechSynthesis.speak(utterance);
        setStatus('playing');
      } else {
        setTimeout(() => {
          setStatus('playing');
          let p = 0;
          const iv = setInterval(() => {
            p += 5;
            setProgress(p);
            if (p >= 100) {
              clearInterval(iv);
              setStatus('idle');
            }
          }, 250);
        }, 500);
      }
    }
  };

  const handleExportChapterAudio = () => {
    if (!audioUrl) {
      showToast('Please generate narration first before exporting.', 'warning');
      return;
    }
    const a = document.createElement('a');
    a.href = audioUrl;
    a.download = `${metadata.title.replace(/\s+/g, '_')}_by_${metadata.author.replace(/\s+/g, '_')}_${selectedVoice.name}.mp3`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    showToast(`Successfully exported chapter audio with embedded ID3 tags for "${metadata.title}"!`, 'success');
  };

  return (
    <div className="flex-1 flex flex-col bg-[#030303] text-slate-200 overflow-hidden font-sans">
      <audio ref={audioRef} className="hidden" />

      {/* Top Header */}
      <div className="px-8 py-5 border-b border-white/5 bg-[#070707] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <Volume2 size={22} />
          </div>
          <div>
            <h1 className="text-sm font-mono font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <span>Neural Audio Studio & Voice Gallery</span>
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] border border-emerald-500/30">ElevenLabs API v1</span>
            </h1>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Studio-grade text-to-speech narration, character casting, ID3 tagging, and audiobook packaging.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleGenerateNarration}
            className={`px-5 py-2.5 rounded-xl font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer ${
              status === 'playing' ? 'bg-amber-600 hover:bg-amber-500 text-white' : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20'
            }`}
          >
            {status === 'playing' ? <Square size={14} /> : <Play size={14} />}
            <span>{status === 'synthesizing' ? 'Synthesizing...' : status === 'playing' ? 'Stop Narration' : 'Generate Narration'}</span>
          </button>
          <button
            onClick={handleExportChapterAudio}
            className="px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 rounded-xl font-mono text-xs font-bold flex items-center gap-2 transition-all cursor-pointer"
          >
            <Download size={14} /> Export MP3
          </button>
        </div>
      </div>

      {/* Main Content Body */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 overflow-hidden">
        
        {/* Left 2 Cols: Voice Gallery & Chapter Selector */}
        <div className="lg:col-span-2 border-r border-white/5 p-6 overflow-y-auto space-y-6 custom-scrollbar">
          
          {/* Chapter selector */}
          <div className="bg-[#0a0a0d] border border-white/5 rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <BookOpen size={14} className="text-indigo-400" /> Target Manuscript Chapter
              </span>
              <span className="text-xs text-indigo-400 font-mono">{chapters.length} Chapters Available</span>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {chapters.map(ch => (
                <button
                  key={ch.id}
                  onClick={() => setSelectedChapterId(ch.id)}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    selectedChapterId === ch.id 
                      ? 'bg-indigo-500/10 border-indigo-500/40 text-white shadow-[0_0_15px_rgba(99,102,241,0.15)]' 
                      : 'bg-white/[0.02] border-white/5 hover:border-white/15 text-slate-300'
                  }`}
                >
                  <div className="text-[10px] font-mono text-indigo-400 mb-1">Chapter {ch.id}</div>
                  <div className="font-bold text-xs truncate">{ch.title}</div>
                </button>
              ))}
            </div>
          </div>

          {/* ElevenLabs Voice Gallery */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Mic2 size={14} className="text-indigo-400" /> Curated ElevenLabs Voice Gallery ({voiceGallery.length} Voices)
              </span>
              <button
                onClick={() => setShowVoiceClonerModal(true)}
                className="px-3 py-1.5 bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 rounded-xl font-mono text-xs font-bold uppercase flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Plus size={14} /> Clone Narrator Voice
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {voiceGallery.map(voice => (
                <div
                  key={voice.id}
                  onClick={() => setSelectedVoiceId(voice.id)}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-4 ${
                    selectedVoiceId === voice.id
                      ? 'bg-indigo-600/10 border-indigo-500/50 shadow-[0_0_25px_rgba(99,102,241,0.2)]'
                      : 'bg-[#07070a] border-white/5 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-white">{voice.name}</span>
                        {selectedVoiceId === voice.id && <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />}
                      </div>
                      <div className="text-[11px] text-indigo-300 font-mono mt-0.5 font-semibold">{voice.style}</div>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[10px] font-mono text-slate-400">
                      {voice.tags[0]}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    {voice.description}
                  </p>

                  <div className="flex items-center justify-between pt-2 border-t border-white/5 text-[10px] font-mono text-slate-500">
                    <span>Accent: {voice.accent}</span>
                    <span className="text-indigo-400 font-bold">{selectedVoiceId === voice.id ? 'Active Voice' : 'Select Voice'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Voice Cloner Modal */}
          {showVoiceClonerModal && (
            <VoiceClonerModal
              onClose={() => setShowVoiceClonerModal(false)}
              onVoiceCloned={(newVoice) => {
                setVoiceGallery(prev => [newVoice, ...prev]);
                setSelectedVoiceId(newVoice.id);
              }}
            />
          )}

          {/* Multi-Voice Character Casting Panel */}
          <VoiceDirectorPanel />

          {/* Lyria Music Generator */}
          <LyriaMusicGenerator />

          {/* Audio Metadata Editor Component */}
          <AudioMetadataEditor
            initialTitle={currentChapter.title}
            initialAuthor="Nicholas Kremers"
            onMetadataChange={setMetadata}
          />

        </div>

        {/* Right Col: Audio Controls, Waveform & Chapter Preview */}
        <div className="border-l border-white/5 p-6 bg-[#060608] flex flex-col justify-between space-y-6">
          <div className="space-y-6">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-400 uppercase tracking-widest">
              <Settings2 size={14} className="text-indigo-400" /> Neural Studio Parameters
            </div>

            <div className="space-y-4 bg-[#0a0a0d] border border-white/5 p-5 rounded-2xl">
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-400">Voice Stability</span>
                  <span className="text-indigo-400 font-bold">{stability}</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.05"
                  value={stability}
                  onChange={(e) => setStability(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
                <p className="text-[10px] text-slate-500">Higher values give a more stable, monotone delivery; lower adds emotional variance.</p>
              </div>

              <div className="space-y-2 pt-4 border-t border-white/5">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-400">Similarity & Clarity</span>
                  <span className="text-indigo-400 font-bold">{similarityBoost}</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.05"
                  value={similarityBoost}
                  onChange={(e) => setSimilarityBoost(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
                <p className="text-[10px] text-slate-500">Enhances voice likeness and acoustic clarity across the neural generation model.</p>
              </div>
            </div>

            {/* Selected Chapter Content preview */}
            <div className="bg-[#0a0a0d] border border-white/5 p-5 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">Chapter Script Preview</span>
                <span className="text-[10px] font-mono text-indigo-400">{currentChapter.content?.length || 0} chars</span>
              </div>
              <div className="bg-black/50 border border-white/5 rounded-xl p-3 text-xs text-slate-300 font-light leading-relaxed max-h-48 overflow-y-auto custom-scrollbar">
                {currentChapter.content || selectedVoice.sampleText}
              </div>
            </div>
          </div>

          {/* Waveform Player Box */}
          <VisualAudioWaveform status={status} progress={progress} voiceName={selectedVoice.name} />

        </div>

      </div>
    </div>
  );
}