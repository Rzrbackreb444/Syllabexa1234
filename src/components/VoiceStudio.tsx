import React, { useState } from 'react';
import NeuralAudioStudio from './NeuralAudioStudio';
import SyllabexaVoiceTrainer from './SyllabexaVoiceTrainer';
import { useVoiceStore } from '../store/voiceStore';
import { Mic, PenTool } from 'lucide-react';

export default function VoiceStudio() {
  const [activeTab, setActiveTab] = useState<'text' | 'audio'>('text');
  const { activeProfileId, profiles, updateProfile } = useVoiceStore();
  const currentProfile = profiles.find(p => p.id === activeProfileId) || null;

  return (
    <div className="h-full flex flex-col bg-[#050505]">
      {/* Voice Studio Header Tabs */}
      <div className="h-16 border-b border-white/10 flex items-center px-8 space-x-6 shrink-0 bg-[#0A0A0A]">
        <button
          onClick={() => setActiveTab('text')}
          className={`flex items-center space-x-2 text-sm font-semibold transition-colors ${activeTab === 'text' ? 'text-indigo-400' : 'text-slate-500 hover:text-slate-300'}`}
        >
          <PenTool size={16} />
          <span>Stylistic Voice Training (Text)</span>
        </button>
        <button
          onClick={() => setActiveTab('audio')}
          className={`flex items-center space-x-2 text-sm font-semibold transition-colors ${activeTab === 'audio' ? 'text-emerald-400' : 'text-slate-500 hover:text-slate-300'}`}
        >
          <Mic size={16} />
          <span>Neural Audio Cloning (TTS)</span>
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden relative">
        {activeTab === 'text' ? (
          <div className="absolute inset-0 overflow-y-auto overflow-x-hidden">
            <SyllabexaVoiceTrainer 
              currentProfile={currentProfile}
              onProfileUpdate={(updatedProfile) => {
                if (currentProfile) {
                  updateProfile(currentProfile.id, updatedProfile);
                }
              }}
            />
          </div>
        ) : (
          <NeuralAudioStudio />
        )}
      </div>
    </div>
  );
}