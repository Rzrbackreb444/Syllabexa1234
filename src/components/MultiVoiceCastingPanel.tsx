import React, { useState } from 'react';
import { Users, User, Mic2, Sparkles, Check, Plus, Trash2, Volume2 } from 'lucide-react';
import { useToast } from '../lib/ToastContext';

interface CharacterVoiceMapping {
  id: string;
  characterName: string;
  role: string;
  voiceId: string;
  voiceName: string;
  sampleDialogue: string;
}

const DEFAULT_CHARACTERS: CharacterVoiceMapping[] = [
  { id: 'c1', characterName: 'Narrator', role: 'Omniscient Voice', voiceId: '21m00Tcm4TlvDq8ikWAM', voiceName: 'Rachel', sampleDialogue: 'The clock struck midnight as the rain battered the frosted windowpanes.' },
  { id: 'c2', characterName: 'Elias Vance', role: 'Protagonist / Lead', voiceId: 'ErXwobaYiN019PkySvjV', voiceName: 'Antoni', sampleDialogue: 'We have precisely twelve minutes before the firewall collapses entirely.' },
  { id: 'c3', characterName: 'Serafina', role: 'Antagonist / Hacker', voiceId: 'AZnzlk1XvdvUeBnXmlld', voiceName: 'Domi', sampleDialogue: 'You always assume you are the only one holding the master key, Elias.' }
];

const AVAILABLE_VOICES = [
  { id: '21m00Tcm4TlvDq8ikWAM', name: 'Rachel', style: 'Warm & Engaging' },
  { id: 'AZnzlk1XvdvUeBnXmlld', name: 'Domi', style: 'Strong & Energetic' },
  { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Bella', style: 'Soft & Expressive' },
  { id: 'ErXwobaYiN019PkySvjV', name: 'Antoni', style: 'Rich & Authoritative' },
  { id: 'MF3mGyEYCl7XYWbV9V6O', name: 'Elli', style: 'Expressive & Young' },
  { id: 'TxGEqnHWrfWFTfGW9XjX', name: 'Josh', style: 'Gritty & Hardboiled' }
];

export default function MultiVoiceCastingPanel() {
  const [characters, setCharacters] = useState<CharacterVoiceMapping[]>(DEFAULT_CHARACTERS);
  const [newCharName, setNewCharName] = useState('');
  const [newCharRole, setNewCharRole] = useState('');
  const [selectedVoiceId, setSelectedVoiceId] = useState(AVAILABLE_VOICES[0].id);
  const [isAdding, setIsAdding] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const { showToast } = useToast();

  
  const handleAutoDetect = async () => {
    setIsDetecting(true);
    showToast('Scanning manuscript for character dialogue...', 'info');
    
    // Simulate natural language parsing for dialogue attribution
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const detectedCharacters = [
      { id: `c-${Date.now()}-1`, characterName: 'Elias', role: 'Protagonist', voiceId: AVAILABLE_VOICES[3].id, voiceName: AVAILABLE_VOICES[3].name, sampleDialogue: 'I never asked for this power. It chose me.' },
      { id: `c-${Date.now()}-2`, characterName: 'Inspector Vance', role: 'Detective', voiceId: AVAILABLE_VOICES[5].id, voiceName: AVAILABLE_VOICES[5].name, sampleDialogue: 'Just give me the facts. I don\'t deal in myths.' }
    ];
    
    setCharacters(prev => {
      const existingNames = new Set(prev.map(c => c.characterName.toLowerCase()));
      const newChars = detectedCharacters.filter(c => !existingNames.has(c.characterName.toLowerCase()));
      if (newChars.length > 0) showToast(`Detected ${newChars.length} new characters from dialogue tags.`, 'success');
      else showToast('No new characters found.', 'info');
      return [...prev, ...newChars];
    });
    
    setIsDetecting(false);
  };
  
  const handleAddCharacter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCharName.trim()) {
      showToast('Please enter a character name.', 'warning');
      return;
    }
    const voice = AVAILABLE_VOICES.find(v => v.id === selectedVoiceId) || AVAILABLE_VOICES[0];
    const newChar: CharacterVoiceMapping = {
      id: `c-${Date.now()}`,
      characterName: newCharName.trim(),
      role: newCharRole.trim() || 'Supporting Character',
      voiceId: voice.id,
      voiceName: voice.name,
      sampleDialogue: `Hello, I am ${newCharName.trim()} ready for the scene.`
    };
    setCharacters([...characters, newChar]);
    setNewCharName('');
    setNewCharRole('');
    setIsAdding(false);
    showToast(`Added character "${newChar.characterName}" assigned to voice ${voice.name}.`, 'success');
  };

  const handleUpdateVoice = (charId: string, voiceId: string) => {
    const voice = AVAILABLE_VOICES.find(v => v.id === voiceId) || AVAILABLE_VOICES[0];
    setCharacters(characters.map(c => c.id === charId ? { ...c, voiceId: voice.id, voiceName: voice.name } : c));
    showToast(`Updated character voice to ${voice.name}.`, 'success');
  };

  const handleDeleteCharacter = (charId: string) => {
    setCharacters(characters.filter(c => c.id !== charId));
    showToast('Removed character casting mapping.', 'info');
  };

  const handlePreviewDialogue = (char: CharacterVoiceMapping) => {
    showToast(`Generating multi-voice sample for ${char.characterName} using voice ${char.voiceName}...`, 'info');
    if ('speechSynthesis' in window) {
      const utt = new SpeechSynthesisUtterance(char.sampleDialogue);
      window.speechSynthesis.speak(utt);
    }
  };

  return (
    <div className="bg-[#0a0a0d] border border-white/5 rounded-2xl p-5 space-y-5 font-sans">
      <div className="flex items-center justify-between border-b border-white/5 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <Users size={16} />
          </div>
          <div>
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-white">Multi-Voice Character Casting</h3>
            <p className="text-[10px] text-slate-400 font-mono">Assign distinct ElevenLabs neural voices to individual book characters</p>
          </div>
        </div>
                <div className="flex items-center gap-2">
          <button
            onClick={handleAutoDetect}
            disabled={isDetecting}
            className="px-3 py-1.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            {isDetecting ? <div className="w-3.5 h-3.5 border-2 border-indigo-400/30 border-t-indigo-400 rounded-full animate-spin" /> : <Users size={14} />} 
            Auto-Detect
          </button>
          <button
            onClick={() => setIsAdding(!isAdding)}
            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer shadow-lg shadow-indigo-500/20"
          >
            <Plus size={14} /> {isAdding ? 'Cancel' : 'Cast Character'}
          </button>
        </div>
      </div>

      {isAdding && (
        <form onSubmit={handleAddCharacter} className="bg-black/50 border border-indigo-500/30 p-4 rounded-xl space-y-3 animate-fadeIn">
          <h4 className="text-xs font-mono font-bold text-indigo-300 uppercase">New Character Voice Profile</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="Character Name (e.g. Inspector Vance)"
              value={newCharName}
              onChange={e => setNewCharName(e.target.value)}
              className="bg-black/80 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
            />
            <input
              type="text"
              placeholder="Role / Archetype (e.g. Lead Detective)"
              value={newCharRole}
              onChange={e => setNewCharRole(e.target.value)}
              className="bg-black/80 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-slate-400">Assign Voice:</span>
              <select
                value={selectedVoiceId}
                onChange={e => setSelectedVoiceId(e.target.value)}
                className="bg-black/80 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
              >
                {AVAILABLE_VOICES.map(v => (
                  <option key={v.id} value={v.id}>{v.name} ({v.style})</option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-mono font-bold cursor-pointer"
            >
              Save Character
            </button>
          </div>
        </form>
      )}

      {/* Character List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {characters.map(char => (
          <div key={char.id} className="bg-[#07070a] border border-white/5 p-4 rounded-xl flex flex-col justify-between space-y-3 hover:border-white/15 transition-all">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-bold text-sm text-white flex items-center gap-2">
                  <User size={13} className="text-indigo-400" />
                  {char.characterName}
                </h4>
                <p className="text-[11px] text-slate-400 font-mono mt-0.5">{char.role}</p>
              </div>
              <button
                onClick={() => handleDeleteCharacter(char.id)}
                className="text-slate-500 hover:text-red-400 transition-colors cursor-pointer p-1"
                title="Delete Character"
              >
                <Trash2 size={13} />
              </button>
            </div>

            <div className="bg-black/40 border border-white/5 p-2.5 rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mic2 size={14} className="text-indigo-400" />
                <span className="text-xs font-mono font-bold text-indigo-200">{char.voiceName}</span>
              </div>
              <select
                value={char.voiceId}
                onChange={e => handleUpdateVoice(char.id, e.target.value)}
                className="bg-black/80 border border-white/10 rounded-lg px-2 py-1 text-[10px] text-slate-300 font-mono focus:outline-none"
              >
                {AVAILABLE_VOICES.map(v => (
                  <option key={v.id} value={v.id}>{v.name}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 pt-1 border-t border-white/5">
              <span className="truncate italic">"{char.sampleDialogue}"</span>
              <button
                onClick={() => handlePreviewDialogue(char)}
                className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-bold cursor-pointer shrink-0 ml-2"
              >
                <Volume2 size={12} /> Test Voice
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
