import React, { useState, useEffect } from 'react';
import { Sparkles, FileText, CheckCircle, BrainCircuit, RefreshCw, Edit3, Save, Copy, Trash, Plus, FolderOpen, Upload, X, File, FileImage, FileUp, AlertCircle, Paperclip } from 'lucide-react';

export interface VoiceProfile {
  tone: string;
  vocabulary: string[];
  pacing: string;
  persona: string;
  pov: string;
  dialogue: string;
}

export interface LibraryVoiceProfile {
  id: string;
  name: string;
  clientName?: string;
  profile: VoiceProfile;
}

interface VoiceTrainerProps {
  currentProfile: VoiceProfile | null;
  onProfileUpdate: (profile: VoiceProfile) => void;
}

const DEFAULT_SAMPLE_TEXT = `I remember the exact moment because I have replayed it ten thousand times since.
I was thirty-six years old. Two hundred and fifty pounds of Arkansas, built like a brick outhouse. I had benched over four hundred pounds the week before. I was Vice President of Kremers Laundry Equipment — third-generation family operation, working the kind of long days that make you feel like you can't be killed. Our son was due in the spring. Life was loaded and pointed in one direction: more.`;

export default function SyllabexaVoiceTrainer({ currentProfile, onProfileUpdate }: VoiceTrainerProps) {
  const [sampleText, setSampleText] = useState(DEFAULT_SAMPLE_TEXT);
  const [isTraining, setIsTraining] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingProfile, setEditingProfile] = useState<VoiceProfile | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // States for uploading multiple document types and scanned text images
  const [attachedFiles, setAttachedFiles] = useState<Array<{ name: string; mimeType: string; data: string; sizeStr: string }>>([]);
  const [dragActive, setDragActive] = useState(false);

  // Helper to convert File to Base64 data string
  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        const base64Data = result.split(',')[1];
        resolve(base64Data);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  // Handler for files selected or dropped
  const handleFileSelection = async (filesList: FileList | null) => {
    if (!filesList) return;
    setError(null);

    const filesArray = Array.from(filesList);
    const newAttachments: Array<{ name: string; mimeType: string; data: string; sizeStr: string }> = [];

    for (const file of filesArray) {
      let mimeType = file.type;
      
      // Fallback mimeType detection
      if (!mimeType) {
        if (file.name.endsWith('.txt')) mimeType = 'text/plain';
        else if (file.name.endsWith('.md')) mimeType = 'text/markdown';
        else if (file.name.endsWith('.pdf')) mimeType = 'application/pdf';
        else if (file.name.endsWith('.png')) mimeType = 'image/png';
        else if (file.name.endsWith('.jpg') || file.name.endsWith('.jpeg')) mimeType = 'image/jpeg';
        else mimeType = 'application/octet-stream';
      }

      const sizeInKb = file.size / 1024;
      const sizeStr = sizeInKb > 1024
        ? `${(sizeInKb / 1024).toFixed(1)} MB`
        : `${sizeInKb.toFixed(0)} KB`;

      try {
        if (mimeType === 'text/plain' || mimeType === 'text/markdown') {
          // Plain text files can be read and appended directly to the text area
          const text = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target?.result as string || '');
            reader.onerror = (e) => reject(e);
            reader.readAsText(file);
          });
          setSampleText(prev => prev ? `${prev}\n\n--- Imported ${file.name} ---\n${text}` : text);
          setSuccessMessage(`Imported text from ${file.name}`);
          setTimeout(() => setSuccessMessage(null), 3500);
        } else {
          // Images or PDFs are converted to base64 so Gemini can process them multimodally
          const base64Data = await convertFileToBase64(file);
          newAttachments.push({
            name: file.name,
            mimeType,
            data: base64Data,
            sizeStr
          });
        }
      } catch (err) {
        console.error("Error reading file:", err);
        setError(`Failed to read file: ${file.name}`);
      }
    }

    if (newAttachments.length > 0) {
      setAttachedFiles(prev => [...prev, ...newAttachments]);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await handleFileSelection(e.dataTransfer.files);
    }
  };

  const removeAttachment = (index: number) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Multiple Voice Profile Library state
  const [voiceLibrary, setVoiceLibrary] = useState<LibraryVoiceProfile[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('syllabexa_voice_library');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            return parsed.map((item: any) => {
              if (!item) return null;
              if (item.profile) {
                return {
                  id: item.id || `vp-${Date.now()}-${Math.random()}`,
                  name: item.name || 'Trained Voice',
                  clientName: item.clientName || item.persona || 'Client',
                  profile: {
                    tone: item.profile.tone || '',
                    vocabulary: Array.isArray(item.profile.vocabulary) ? item.profile.vocabulary : [],
                    pacing: item.profile.pacing || '',
                    persona: item.profile.persona || '',
                    pov: item.profile.pov || '',
                    dialogue: item.profile.dialogue || ''
                  }
                };
              }
              // Flat format mapping
              return {
                id: item.id || `vp-${Date.now()}-${Math.random()}`,
                name: item.name || 'Trained Voice',
                clientName: item.clientName || item.persona || 'Client',
                profile: {
                  tone: item.tone || '',
                  vocabulary: Array.isArray(item.vocabulary) ? item.vocabulary : [],
                  pacing: item.pacing || '',
                  persona: item.persona || '',
                  pov: item.pov || '',
                  dialogue: item.dialogue || ''
                }
              };
            }).filter(Boolean) as LibraryVoiceProfile[];
          }
        } catch (e) {
          console.error("Failed to load and normalize syllabexa_voice_library", e);
        }
      }
    }
    return [
      {
        id: 'vp-stroke',
        name: 'Stroke Recovery Sasquatch Style',
        clientName: 'Nicholas Kremers',
        profile: {
          tone: 'Raw, visceral, and unyielding',
          vocabulary: ['brick outhouse', 'neuroplasticity', 'Sasquatch', 'rebound', 'tactile'],
          pacing: 'Fast, rhythmic, short punches paired with deep flowing reflection',
          persona: 'Unyielding mentor and survivor',
          pov: 'First-person ("I")',
          dialogue: 'Sparse, casual, straightforward'
        }
      },
      {
        id: 'vp-academic',
        name: 'The Analytical Scholar',
        clientName: 'Dr. Evelyn Carter',
        profile: {
          tone: 'Clinical, precise, and highly intellectual',
          vocabulary: ['empirical', 'cognitive framework', 'myelin sheath', 'heuristic', 'paradigm'],
          pacing: 'Flowing, complex academic syntax, highly structured and slow-tempo',
          persona: 'Distinguished neuroscience investigator',
          pov: 'Third-person limited',
          dialogue: 'Formal, highly articulate, verbose'
        }
      }
    ];
  });

  // Active Profile selection
  const [activeProfileId, setActiveProfileId] = useState<string>('vp-stroke');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem('syllabexa_voice_library', JSON.stringify(voiceLibrary));
  }, [voiceLibrary]);

  useEffect(() => {
    const activeItem = voiceLibrary.find(v => v.id === activeProfileId) || voiceLibrary[0];
    if (activeItem) {
      if (activeItem.id !== activeProfileId) {
        setActiveProfileId(activeItem.id);
      }
      
      // Prevent unnecessary parent state updates by checking if the profile is already selected
      const currentId = (currentProfile as any)?.id;
      const itemId = activeItem.id;
      if (!currentProfile || currentId !== itemId) {
        onProfileUpdate(activeItem.profile);
      }
      
      setEditingProfile({ ...activeItem.profile });
    }
  }, [activeProfileId, voiceLibrary, currentProfile, onProfileUpdate]);

  const handleTrain = async () => {
    if (!sampleText.trim() && attachedFiles.length === 0) {
      setError("Please provide a text sample or upload at least one writing draft/image/PDF.");
      return;
    }

    setIsTraining(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await fetch('/api/syllabexa/train-voice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          sampleText,
          files: attachedFiles.map(f => ({
            name: f.name,
            mimeType: f.mimeType,
            data: f.data
          }))
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to train voice profile.");
      }

      const trainedProfile: VoiceProfile = await response.json();
      
      // Save trained profile to library
      const newId = `vp-trained-${Date.now()}`;
      const newLibItem: LibraryVoiceProfile = {
        id: newId,
        name: `Trained Voice Profile ${voiceLibrary.length + 1}`,
        clientName: 'New Creator Client',
        profile: trainedProfile
      };

      setVoiceLibrary([...voiceLibrary, newLibItem]);
      setActiveProfileId(newId);
      // Clean up uploaded files after successful training
      setAttachedFiles([]);
      setSuccessMessage("Linguistic DNA successfully analyzed and registered into library!");
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An error occurred during voice training.");
    } finally {
      setIsTraining(false);
    }
  };

  const handleSaveEdit = () => {
    if (editingProfile) {
      setVoiceLibrary(prev => prev.map(item => {
        if (item.id === activeProfileId) {
          return { ...item, profile: editingProfile };
        }
        return item;
      }));
      onProfileUpdate(editingProfile);
      setSuccessMessage("Voice profile updated and locked in!");
      setTimeout(() => setSuccessMessage(null), 5000);
    }
  };

  const handleDuplicateProfile = (id: string) => {
    const original = voiceLibrary.find(v => v.id === id);
    if (!original) return;
    const dup: LibraryVoiceProfile = {
      id: `vp-dup-${Date.now()}`,
      name: `${original.name} (Copy)`,
      clientName: original.clientName ? `${original.clientName} (Copy)` : undefined,
      profile: { ...original.profile }
    };
    setVoiceLibrary([...voiceLibrary, dup]);
    setActiveProfileId(dup.id);
    setSuccessMessage(`Voice "${original.name}" duplicated successfully.`);
    setTimeout(() => setSuccessMessage(null), 4000);
  };

  const handleDeleteProfile = (id: string) => {
    if (voiceLibrary.length <= 1) {
      setError("You must keep at least one voice profile in the engine library.");
      return;
    }
    setDeleteConfirmId(id);
  };

  const executeDeleteProfile = (id: string) => {
    const remaining = voiceLibrary.filter(v => v.id !== id);
    setVoiceLibrary(remaining);
    if (activeProfileId === id && remaining.length > 0) {
      setActiveProfileId(remaining[0].id);
    }
    setDeleteConfirmId(null);
    setSuccessMessage("Voice profile permanently deleted.");
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const handleCreateEmptyProfile = () => {
    const emptyId = `vp-empty-${Date.now()}`;
    const newEmpty: LibraryVoiceProfile = {
      id: emptyId,
      name: `Blank Custom Voice ${voiceLibrary.length + 1}`,
      clientName: 'Custom Brand',
      profile: {
        tone: 'Aesthetic, crisp and minimal',
        vocabulary: ['minimalism', 'structure', 'rhythm'],
        pacing: 'Medium pace',
        persona: 'Polished coach',
        pov: 'First-person ("I")',
        dialogue: 'Sparse and casual'
      }
    };
    setVoiceLibrary([...voiceLibrary, newEmpty]);
    setActiveProfileId(emptyId);
  };

  return (
    <aside aria-label="Syllabexa Voice Trainer" className="p-6 max-w-4xl mx-auto space-y-8 animate-fade-in text-slate-850 custom-scrollbar">
      
      {/* Header section */}
      <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
        <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
          <BrainCircuit size={24} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900">Syllabexa Voice Trainer & Engine Library</h2>
          <p className="text-sm text-slate-500">Analyze raw writing samples to lock in unique signature Author Voice Profiles for different brands and clients.</p>
        </div>
      </div>

      {/* Voice Engine Library Segment */}
      <div className="bg-slate-900 text-white rounded-2xl p-5 border border-slate-800 space-y-4 shadow-md">
        <div className="flex justify-between items-center">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
            <FolderOpen size={14} />
            Voice Profile Library ({voiceLibrary.length})
          </span>
          <button
            type="button"
            onClick={handleCreateEmptyProfile}
            className="text-[10px] bg-indigo-600 hover:bg-indigo-700 font-bold px-2.5 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer transition-all"
          >
            <Plus size={11} /> Create Custom Profile
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {voiceLibrary.map((libItem) => (
            <div
              key={libItem.id}
              onClick={() => setActiveProfileId(libItem.id)}
              className={`p-3 rounded-xl border transition-all cursor-pointer text-left space-y-1.5 ${activeProfileId === libItem.id ? 'bg-indigo-950 border-indigo-500 text-white shadow-md' : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:bg-slate-800/40 hover:text-slate-300'}`}
            >
              <div className="flex justify-between items-start gap-2">
                <div className="min-w-0">
                  <h4 className="font-bold text-xs truncate text-slate-200">{libItem.name}</h4>
                  <p className="text-[10px] text-slate-500 truncate">{libItem.clientName || 'Independent Creator'}</p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); handleDuplicateProfile(libItem.id); }}
                    className="p-1 hover:bg-indigo-900 text-slate-400 hover:text-white rounded cursor-pointer"
                    title="Duplicate voice"
                  >
                    <Copy size={11} />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); handleDeleteProfile(libItem.id); }}
                    className="p-1 hover:bg-red-950 text-slate-400 hover:text-red-400 rounded cursor-pointer"
                    title="Delete voice"
                  >
                    <Trash size={11} />
                  </button>
                </div>
              </div>

              <div className="text-[10px] bg-indigo-950/40 p-1.5 border border-indigo-900/30 rounded font-mono truncate text-indigo-300">
                {libItem.profile?.tone || ''}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Sample Upload Section */}
        <div className="lg:col-span-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <FileText size={14} />
              Train New Profile from Sample
            </label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setSampleText(DEFAULT_SAMPLE_TEXT);
                  setAttachedFiles([]);
                }}
                className="text-[11px] text-indigo-600 hover:underline cursor-pointer font-bold"
              >
                Reset to Default Text
              </button>
            </div>
          </div>

          {/* Unified Input and Dropzone Area */}
          <div 
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            className={`relative border-2 border-dashed rounded-xl transition-all p-4 space-y-4 ${
              dragActive 
                ? 'border-indigo-500 bg-indigo-50/40 shadow-sm' 
                : 'border-slate-200 hover:border-slate-300 bg-white'
            }`}
          >
            {dragActive && (
              <div className="absolute inset-0 bg-indigo-600/10 backdrop-blur-[1px] rounded-xl flex flex-col items-center justify-center pointer-events-none z-10">
                <FileUp className="text-indigo-600 animate-bounce mb-2" size={32} />
                <span className="text-xs font-bold text-indigo-700 font-mono">Drop files anywhere to import...</span>
              </div>
            )}

            {/* Standard Text Box Input */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-[10px] font-mono text-slate-400">
                <span>Text Box Sample (Typed/Pasted)</span>
                <span>{sampleText.length} chars</span>
              </div>
              <textarea
                value={sampleText}
                onChange={(e) => setSampleText(e.target.value)}
                className="w-full h-44 p-3 border border-slate-100 rounded-lg focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-xs font-mono leading-relaxed resize-none outline-none bg-slate-50/50"
                placeholder="Paste drafts, notes, email sequences, or previous chapters here, or upload files below to extract a cohesive voice..."
              />
            </div>

            {/* File upload prompt & Dropzone buttons */}
            <div className="border-t border-slate-100 pt-4 flex flex-col items-center justify-center text-center p-3 bg-slate-50/40 rounded-lg border border-slate-100">
              <Upload size={20} className="text-slate-400 mb-1.5" />
              <div className="text-xs font-medium text-slate-700">
                <span>Upload manuscripts, images, PDFs, or notes</span>
              </div>
              <p className="text-[10px] text-slate-400 max-w-xs mt-1 mb-2.5 font-mono">
                Drop files here, or click to browse. Reads text files, scanned page images, or full PDF materials.
              </p>
              
              <input
                type="file"
                multiple
                id="voice-multimodal-upload"
                className="hidden"
                onChange={async (e) => {
                  if (e.target.files) {
                    await handleFileSelection(e.target.files);
                  }
                }}
              />
              <label
                htmlFor="voice-multimodal-upload"
                className="text-[11px] bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg cursor-pointer font-bold flex items-center gap-1.5 transition-colors shadow-sm"
              >
                <Paperclip size={12} />
                Attach File(s)
              </label>
            </div>

            {/* Attached files list */}
            {attachedFiles.length > 0 && (
              <div className="space-y-2 border-t border-slate-100 pt-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1 font-mono">
                  <Paperclip size={10} /> Attached Reference Materials ({attachedFiles.length})
                </span>
                <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto pr-1">
                  {attachedFiles.map((file, idx) => (
                    <div 
                      key={idx} 
                      className="flex items-center justify-between p-2 rounded-lg bg-slate-100/80 border border-slate-200/60 text-xs font-mono"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        {file.mimeType.startsWith('image/') ? (
                          <FileImage size={14} className="text-indigo-500 shrink-0" />
                        ) : (
                          <File size={14} className="text-amber-500 shrink-0" />
                        )}
                        <span className="truncate text-slate-700 font-medium max-w-[160px] sm:max-w-[200px]" title={file.name}>
                          {file.name}
                        </span>
                        <span className="text-[9px] text-slate-400">({file.sizeStr})</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeAttachment(idx)}
                        className="text-slate-400 hover:text-red-500 p-1 rounded transition-colors cursor-pointer"
                        title="Remove file"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {error && (
            <div className="p-3 bg-red-50 text-red-700 text-xs rounded-lg border border-red-200 flex items-start gap-2">
              <AlertCircle size={14} className="shrink-0 mt-0.5 text-red-500" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="button"
            onClick={handleTrain}
            disabled={isTraining}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold rounded-xl text-xs transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
          >
            {isTraining ? (
              <>
                <RefreshCw size={14} className="animate-spin" />
                Analyzing Multi-Format DNA with Gemini...
              </>
            ) : (
              <>
                <Sparkles size={14} />
                Analyze linguistic DNA & Add to Library
              </>
            )}
          </button>
        </div>

        {/* Profile Output Section */}
        <section aria-label="Profile Output" className="lg:col-span-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden h-full flex flex-col">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
                Active Profile Linguistic DNA
              </span>
              <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                <CheckCircle size={10} />
                Profile Loaded
              </span>
            </div>

            <div className="p-6 flex-1 space-y-6">
              {editingProfile ? (
                <div className="space-y-4 text-xs">
                  {/* Name field for renaming updatable profiles */}
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Profile Name</label>
                    <input
                      type="text"
                      value={voiceLibrary.find(v => v.id === activeProfileId)?.name || ''}
                      onChange={(e) => {
                        const nextName = e.target.value;
                        setVoiceLibrary(prev => prev.map(item => {
                          if (item.id === activeProfileId) {
                            return { ...item, name: nextName };
                          }
                          return item;
                        }));
                      }}
                      className="w-full p-2 border border-slate-200 rounded-md focus:ring-1 focus:ring-indigo-500 outline-none font-bold text-slate-800"
                    />
                  </div>

                  {/* Client Name field */}
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Client / Brand Label</label>
                    <input
                      type="text"
                      value={voiceLibrary.find(v => v.id === activeProfileId)?.clientName || ''}
                      onChange={(e) => {
                        const nextClientName = e.target.value;
                        setVoiceLibrary(prev => prev.map(item => {
                          if (item.id === activeProfileId) {
                            return { ...item, clientName: nextClientName };
                          }
                          return item;
                        }));
                      }}
                      placeholder="e.g. Independent Creator"
                      className="w-full p-2 border border-slate-200 rounded-md focus:ring-1 focus:ring-indigo-500 outline-none text-slate-800 font-medium"
                    />
                  </div>

                  {/* Tone */}
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Tone & Emotional Flavor</label>
                    <input
                      type="text"
                      value={editingProfile.tone}
                      onChange={(e) => setEditingProfile({ ...editingProfile, tone: e.target.value })}
                      className="w-full p-2 border border-slate-200 rounded-md focus:ring-1 focus:ring-indigo-500 outline-none"
                    />
                  </div>

                  {/* POV */}
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Point of View (POV)</label>
                    <input
                      type="text"
                      value={editingProfile.pov}
                      onChange={(e) => setEditingProfile({ ...editingProfile, pov: e.target.value })}
                      className="w-full p-2 border border-slate-200 rounded-md focus:ring-1 focus:ring-indigo-500 outline-none"
                    />
                  </div>

                  {/* Persona */}
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Narrative Persona</label>
                    <input
                      type="text"
                      value={editingProfile.persona}
                      onChange={(e) => setEditingProfile({ ...editingProfile, persona: e.target.value })}
                      className="w-full p-2 border border-slate-200 rounded-md focus:ring-1 focus:ring-indigo-500 outline-none"
                    />
                  </div>

                  {/* Pacing */}
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Syntactic Pacing & Rhythm</label>
                    <input
                      type="text"
                      value={editingProfile.pacing}
                      onChange={(e) => setEditingProfile({ ...editingProfile, pacing: e.target.value })}
                      className="w-full p-2 border border-slate-200 rounded-md focus:ring-1 focus:ring-indigo-500 outline-none"
                    />
                  </div>

                  {/* Dialogue */}
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Dialogue Handling</label>
                    <input
                      type="text"
                      value={editingProfile.dialogue}
                      onChange={(e) => setEditingProfile({ ...editingProfile, dialogue: e.target.value })}
                      className="w-full p-2 border border-slate-200 rounded-md focus:ring-1 focus:ring-indigo-500 outline-none"
                    />
                  </div>

                  {/* Vocabulary Tags */}
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Signature Vocabulary Keywords</label>
                    <input
                      type="text"
                      value={editingProfile.vocabulary.join(', ')}
                      onChange={(e) => setEditingProfile({ ...editingProfile, vocabulary: e.target.value.split(',').map(s => s.trim()) })}
                      className="w-full p-2 border border-slate-200 rounded-md focus:ring-1 focus:ring-indigo-500 outline-none text-slate-600"
                      placeholder="Comma-separated keywords"
                    />
                  </div>

                  {successMessage && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg font-medium animate-fade-in flex items-center gap-1.5">
                      <CheckCircle size={14} className="text-emerald-600 shrink-0" />
                      {successMessage}
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={handleSaveEdit}
                    className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-bold flex items-center justify-center gap-1.5 cursor-pointer mt-4"
                  >
                    <Save size={14} />
                    Apply Changes & Lock-In
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-center py-20 text-slate-400 space-y-4">
                  <div className="p-4 bg-slate-50 rounded-full border border-slate-100 animate-pulse">
                    <BrainCircuit size={40} className="text-slate-300" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-slate-600">No voice profile trained yet</p>
                    <p className="text-xs text-slate-400 max-w-xs mx-auto mt-1">
                      Provide writing samples on the left and click train, or import a pre-saved profile.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>

      {deleteConfirmId && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-[9999] p-4 text-slate-800">
          <div className="bg-white border border-slate-200 rounded-xl p-6 max-w-sm w-full space-y-4 shadow-2xl animate-fade-in text-center">
            <div className="w-12 h-12 bg-red-50 text-red-600 border border-red-100 rounded-full flex items-center justify-center mx-auto">
              <Trash size={24} />
            </div>
            <div className="space-y-1.5">
              <h4 className="text-base font-bold text-slate-900">Delete Voice Profile?</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Are you sure you want to permanently delete this voice profile? This action cannot be undone.
              </p>
            </div>
            <div className="flex gap-2 justify-center pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => executeDeleteProfile(deleteConfirmId)}
                className="px-4 py-1.5 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer shadow-lg hover:shadow-red-600/10"
              >
                Delete permanently
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}