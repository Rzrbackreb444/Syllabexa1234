import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Plus, 
  Trash2, 
  Copy, 
  Check, 
  FileText, 
  Sliders, 
  Bookmark, 
  FolderOpen, 
  AlertCircle, 
  Save, 
  ChevronDown, 
  ChevronUp, 
  Activity, 
  ShieldCheck, 
  BrainCircuit,
  CornerDownRight
} from 'lucide-react';
import { VoiceProfile } from '../types';
import { db, handleFirestoreError, OperationType } from '../lib/googleAuth';
import { 
  collection, 
  getDocs, 
  setDoc, 
  deleteDoc, 
  doc, 
  serverTimestamp 
} from 'firebase/firestore';

interface VoiceProfileManagerProps {
  userId: string | null;
  onSelectPrimaryProfile: (profile: VoiceProfile) => void;
  currentProfile: VoiceProfile | null;
}

const PRE_SEEDED_PRESETS: VoiceProfile[] = [
  {
    id: 'vp-stroke-preset',
    name: 'Stroke Recovery Sasquatch Style',
    tone: 'Raw, visceral, and unyielding',
    vocabulary: ['brick outhouse', 'neuroplasticity', 'Sasquatch', 'rebound', 'tactile'],
    pacing: 'Fast, rhythmic, short punches paired with deep flowing reflection',
    persona: 'Unyielding mentor and survivor',
    pov: 'First-person ("I")',
    dialogue: 'Sparse, casual, straightforward',
    isPrimary: true,
    createdAt: new Date('2026-07-15T00:00:00.000Z').toISOString(),
    updatedAt: new Date('2026-07-15T00:00:00.000Z').toISOString()
  },
  {
    id: 'vp-academic-preset',
    name: 'The Analytical Scholar',
    tone: 'Clinical, precise, and highly intellectual',
    vocabulary: ['empirical', 'cognitive framework', 'myelin sheath', 'heuristic', 'paradigm'],
    pacing: 'Flowing, complex academic syntax, highly structured and slow-tempo',
    persona: 'Distinguished neuroscience investigator',
    pov: 'Third-person limited',
    dialogue: 'Formal, highly articulate, verbose',
    isPrimary: false,
    createdAt: new Date('2026-07-15T00:00:00.000Z').toISOString(),
    updatedAt: new Date('2026-07-15T00:00:00.000Z').toISOString()
  },
  {
    id: 'vp-noir-preset',
    name: 'Hard-Boiled Noir Novelist',
    tone: 'Cynical, shadowy, atmospheric, and razor-sharp',
    vocabulary: ['neon-drenched', 'whiskey', 'double-cross', 'monologue', 'shadows'],
    pacing: 'Fast-paced, high tension, syncopated rhythm with abrupt breaks',
    persona: 'Gritty streetwise chronicler',
    pov: 'First-person ("I")',
    dialogue: 'Sardonic, crisp, layered with subtext and double-meanings',
    isPrimary: false,
    createdAt: new Date('2026-07-15T00:00:00.000Z').toISOString(),
    updatedAt: new Date('2026-07-15T00:00:00.000Z').toISOString()
  },
  {
    id: 'vp-high-fantasy-preset',
    name: 'Epic Mythic Chronicles',
    tone: 'Grand, legendary, archaic, and deeply descriptive',
    vocabulary: ['sovereign', 'ancient', 'prophecy', 'horizon', 'reign'],
    pacing: 'Slow, majestic, sweeping narrative cadences with poetic phrasing',
    persona: 'Omniscient historical sage',
    pov: 'Third-person omniscient',
    dialogue: 'Elevated, formal, respectful, often cryptic or formalistic',
    isPrimary: false,
    createdAt: new Date('2026-07-15T00:00:00.000Z').toISOString(),
    updatedAt: new Date('2026-07-15T00:00:00.000Z').toISOString()
  }
];

export default function SyllabexaVoiceProfileManager({ 
  userId, 
  onSelectPrimaryProfile, 
  currentProfile 
}: VoiceProfileManagerProps) {
  const [profiles, setProfiles] = useState<VoiceProfile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [expandedProfileId, setExpandedProfileId] = useState<string | null>(null);
  const [deleteConfirmProfile, setDeleteConfirmProfile] = useState<{ id: string; name: string } | null>(null);

  // Form State for manually creating / editing a profile
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProfileId, setEditingProfileId] = useState<string | null>(null);
  const [formName, setFormName] = useState('');
  const [formTone, setFormTone] = useState('');
  const [formVocabulary, setFormVocabulary] = useState('');
  const [formPacing, setFormPacing] = useState('');
  const [formPersona, setFormPersona] = useState('');
  const [formPov, setFormPov] = useState('');
  const [formDialogue, setFormDialogue] = useState('');

  // Load Voice Profiles from Firestore or LocalStorage
  const loadProfiles = async () => {
    setIsLoading(true);
    setError(null);
    try {
      if (userId) {
        // Fetch from Firestore
        const colRef = collection(db, 'users', userId, 'voiceProfiles');
        const snap = await getDocs(colRef).catch(e => {
          handleFirestoreError(e, OperationType.LIST, `users/${userId}/voiceProfiles`);
          return null;
        });

        if (snap && !snap.empty) {
          const loaded: VoiceProfile[] = [];
          snap.forEach(docSnap => {
            const data = docSnap.data();
            loaded.push({
              id: data.id,
              name: data.name,
              tone: data.tone,
              vocabulary: Array.isArray(data.vocabulary) ? data.vocabulary : [],
              pacing: data.pacing,
              persona: data.persona,
              pov: data.pov,
              dialogue: data.dialogue,
              isPrimary: !!data.isPrimary,
              createdAt: data.createdAt,
              updatedAt: data.updatedAt
            });
          });
          
          // Sort with primary first, then by name
          loaded.sort((a, b) => (b.isPrimary ? 1 : 0) - (a.isPrimary ? 1 : 0));
          setProfiles(loaded);

          // Find current active profile if any
          const primaryProfile = loaded.find(p => p.isPrimary);
          if (primaryProfile && (!currentProfile || currentProfile.id !== primaryProfile.id)) {
            onSelectPrimaryProfile(primaryProfile);
          }
        } else {
          // If Firestore is empty, seed it with defaults
          const seededList = [...PRE_SEEDED_PRESETS];
          for (const p of seededList) {
            const docRef = doc(db, 'users', userId, 'voiceProfiles', p.id);
            await setDoc(docRef, p).catch(e => handleFirestoreError(e, OperationType.WRITE, `users/${userId}/voiceProfiles/${p.id}`));
          }
          setProfiles(seededList);
          const primary = seededList.find(p => p.isPrimary) || seededList[0];
          if (primary && (!currentProfile || currentProfile.id !== primary.id)) {
            onSelectPrimaryProfile(primary);
          }
        }
      } else {
        // Fallback to LocalStorage
        const saved = localStorage.getItem('syllabexa_voice_library');
        if (saved) {
          try {
            // Check structural layout, some files could contain the legacy "LibraryVoiceProfile" format
            const parsed = JSON.parse(saved);
            const normalized: VoiceProfile[] = parsed.map((item: any) => {
              // Legacy format check
              if (item.profile && item.id) {
                return {
                  id: item.id,
                  name: item.name || 'Legacy Trained Style',
                  tone: item.profile.tone || '',
                  vocabulary: item.profile.vocabulary || [],
                  pacing: item.profile.pacing || '',
                  persona: item.profile.persona || '',
                  pov: item.profile.pov || '',
                  dialogue: item.profile.dialogue || '',
                  isPrimary: item.id === 'vp-stroke',
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString()
                };
              }
              return item;
            });
            setProfiles(normalized);
            const primary = normalized.find(p => p.isPrimary) || normalized[0];
            if (primary && (!currentProfile || currentProfile.id !== primary.id)) {
              onSelectPrimaryProfile(primary);
            }
          } catch (e) {
            setProfiles(PRE_SEEDED_PRESETS);
          }
        } else {
          setProfiles(PRE_SEEDED_PRESETS);
          localStorage.setItem('syllabexa_voice_library', JSON.stringify(PRE_SEEDED_PRESETS));
        }
      }
    } catch (err: any) {
      console.error("Error loading voice profiles:", err);
      setError("Failed to synchronize voice profiles: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProfiles();
  }, [userId]);

  const handleSetPrimary = async (targetProfile: VoiceProfile) => {
    setError(null);
    setSuccess(null);
    
    // Create optimized local update
    const updated = profiles.map(p => ({
      ...p,
      isPrimary: p.id === targetProfile.id,
      updatedAt: new Date().toISOString()
    }));

    setProfiles(updated);
    onSelectPrimaryProfile({ ...targetProfile, isPrimary: true });

    try {
      if (userId) {
        // Push full state to Firestore
        await Promise.all(updated.map(p => {
          const docRef = doc(db, 'users', userId, 'voiceProfiles', p.id);
          return setDoc(docRef, p).catch(e => {
            handleFirestoreError(e, OperationType.WRITE, `users/${userId}/voiceProfiles/${p.id}`);
          });
        }));
      } else {
        localStorage.setItem('syllabexa_voice_library', JSON.stringify(updated));
      }
      setSuccess(`"${targetProfile.name}" locked in as primary Autopilot style.`);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      console.error("Failed to set primary style:", err);
      setError("Unable to save selection to server: " + err.message);
    }
  };

  const handleDuplicate = async (p: VoiceProfile) => {
    setError(null);
    setSuccess(null);

    const newId = `vp-clone-${Date.now()}`;
    const clone: VoiceProfile = {
      ...p,
      id: newId,
      name: `${p.name} (Copy)`,
      isPrimary: false, // Force duplicated profile as secondary
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const updated = [...profiles, clone];
    setProfiles(updated);

    try {
      if (userId) {
        const docRef = doc(db, 'users', userId, 'voiceProfiles', newId);
        await setDoc(docRef, clone).catch(e => handleFirestoreError(e, OperationType.WRITE, `users/${userId}/voiceProfiles/${newId}`));
      } else {
        localStorage.setItem('syllabexa_voice_library', JSON.stringify(updated));
      }
      setSuccess(`Duplicated style: "${p.name}"`);
      setExpandedProfileId(newId);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      console.error(err);
      setError("Failed to duplicate style: " + err.message);
    }
  };

  const handleDelete = (profileId: string, name: string) => {
    if (profiles.length <= 1) {
      setError("The engine requires at least one voice profile to be registered in the vault.");
      return;
    }
    setDeleteConfirmProfile({ id: profileId, name });
  };

  const executeDelete = async (profileId: string, name: string) => {
    const isPrimaryDeleted = profiles.find(p => p.id === profileId)?.isPrimary;
    setError(null);
    setSuccess(null);

    let remaining = profiles.filter(p => p.id !== profileId);
    
    // If we deleted the primary profile, set the first remaining profile as primary
    if (isPrimaryDeleted && remaining.length > 0) {
      remaining = remaining.map((p, idx) => ({
        ...p,
        isPrimary: idx === 0,
        updatedAt: new Date().toISOString()
      }));
      onSelectPrimaryProfile(remaining[0]);
    }

    setProfiles(remaining);

    try {
      if (userId) {
        // Delete document
        const docRef = doc(db, 'users', userId, 'voiceProfiles', profileId);
        await deleteDoc(docRef).catch(e => handleFirestoreError(e, OperationType.DELETE, `users/${userId}/voiceProfiles/${profileId}`));

        // Update remaining primary states in Firestore if needed
        if (isPrimaryDeleted) {
          await Promise.all(remaining.map(p => {
            const rRef = doc(db, 'users', userId, 'voiceProfiles', p.id);
            return setDoc(rRef, p).catch(e => handleFirestoreError(e, OperationType.WRITE, `users/${userId}/voiceProfiles/${p.id}`));
          }));
        }
      } else {
        localStorage.setItem('syllabexa_voice_library', JSON.stringify(remaining));
      }
      setSuccess(`Permanently removed "${name}" from engine library.`);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      console.error(err);
      setError("Failed to delete style: " + err.message);
    }
  };

  const handleOpenForm = (p?: VoiceProfile) => {
    setError(null);
    setSuccess(null);
    if (p) {
      // Edit mode
      setEditingProfileId(p.id);
      setFormName(p.name);
      setFormTone(p.tone);
      setFormVocabulary(p.vocabulary.join(', '));
      setFormPacing(p.pacing);
      setFormPersona(p.persona);
      setFormPov(p.pov);
      setFormDialogue(p.dialogue);
    } else {
      // Create mode
      setEditingProfileId(null);
      setFormName('');
      setFormTone('');
      setFormVocabulary('');
      setFormPacing('');
      setFormPersona('');
      setFormPov('First-person ("I")');
      setFormDialogue('');
    }
    setIsFormOpen(true);
  };

  const handleSaveForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Structural validations
    if (!formName.trim()) {
      setError("Profile Name is required.");
      return;
    }
    if (!formTone.trim()) {
      setError("Tone attribute is required.");
      return;
    }

    const vocabList = formVocabulary
      .split(',')
      .map(v => v.trim())
      .filter(v => v.length > 0);

    const isEditing = !!editingProfileId;
    const targetId = editingProfileId || `vp-custom-${Date.now()}`;
    
    // Check if we are creating first profile, making it primary
    const shouldBePrimary = !isEditing && profiles.length === 0;

    const savedProfile: VoiceProfile = {
      id: targetId,
      name: formName.trim(),
      tone: formTone.trim(),
      vocabulary: vocabList,
      pacing: formPacing.trim() || 'Balanced',
      persona: formPersona.trim() || 'Dynamic Author',
      pov: formPov.trim() || 'First-person ("I")',
      dialogue: formDialogue.trim() || 'Naturalistic',
      isPrimary: isEditing ? (profiles.find(p => p.id === targetId)?.isPrimary || false) : shouldBePrimary,
      createdAt: isEditing ? (profiles.find(p => p.id === targetId)?.createdAt || new Date().toISOString()) : new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    let updatedList: VoiceProfile[] = [];
    if (isEditing) {
      updatedList = profiles.map(p => p.id === targetId ? savedProfile : p);
    } else {
      updatedList = [...profiles, savedProfile];
    }

    setProfiles(updatedList);
    
    if (savedProfile.isPrimary) {
      onSelectPrimaryProfile(savedProfile);
    }

    try {
      if (userId) {
        const docRef = doc(db, 'users', userId, 'voiceProfiles', targetId);
        await setDoc(docRef, savedProfile).catch(e => handleFirestoreError(e, OperationType.WRITE, `users/${userId}/voiceProfiles/${targetId}`));
      } else {
        localStorage.setItem('syllabexa_voice_library', JSON.stringify(updatedList));
      }
      
      setSuccess(isEditing ? `Updated custom profile "${formName}"` : `Successfully created style "${formName}"`);
      setIsFormOpen(false);
      setExpandedProfileId(targetId);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      console.error(err);
      setError("Could not save to the database: " + err.message);
    }
  };

  return (
    <aside aria-label="Syllabexa Voice Profile Manager" className="bg-[#0f1115] border border-slate-800 rounded-xl p-5 space-y-6 shadow-2xl relative custom-scrollbar">
      {/* Title block */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg">
            <Sliders size={18} className="animate-pulse" />
          </div>
          <div>
            <h3 className="text-sm font-mono uppercase tracking-wider text-slate-100 font-bold flex items-center gap-1.5">
              <span>Linguistic DNA Vault</span>
              <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded border border-slate-700/60 lowercase">
                {userId ? 'cloud-synced' : 'local-mode'}
              </span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Manage writing voices and toggle primary settings for the Autopilot writing engine.</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => handleOpenForm()}
          className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-slate-950 text-xs font-mono font-black uppercase tracking-wider rounded-lg flex items-center gap-1.5 transition-all shadow-lg hover:shadow-emerald-500/10 cursor-pointer"
        >
          <Plus size={14} />
          Create custom voice
        </button>
      </div>

      {/* Notification banners */}
      {error && (
        <div className="p-3.5 bg-red-950/25 border border-red-900/40 rounded-lg text-xs text-red-400 flex items-start gap-2 animate-fade-in">
          <AlertCircle size={15} className="shrink-0 mt-0.5" />
          <span className="font-mono">{error}</span>
        </div>
      )}

      {success && (
        <div className="p-3.5 bg-emerald-950/20 border border-emerald-500/30 rounded-lg text-xs text-emerald-400 flex items-start gap-2 animate-fade-in">
          <ShieldCheck size={15} className="shrink-0 mt-0.5" />
          <span className="font-mono">{success}</span>
        </div>
      )}

      {/* Manual editing or creation Form */}
      {isFormOpen && (
        <form onSubmit={handleSaveForm} className="bg-[#141822] border border-slate-800 rounded-xl p-5 space-y-4 animate-fade-in">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
              <BrainCircuit size={14} />
              {editingProfileId ? 'Edit Author Profile' : 'Register New Linguistic Style'}
            </h4>
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="text-[10px] font-mono text-slate-500 hover:text-slate-300 uppercase tracking-widest cursor-pointer"
            >
              Cancel
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Left Col */}
            <div className="space-y-3">
              <div>
                <label className="block text-[10px] font-mono uppercase tracking-widest text-slate-400 font-bold mb-1">
                  Profile Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={e => setFormName(e.target.value)}
                  placeholder="e.g. Stephen King Dark Suspense"
                  className="w-full bg-[#0a0c10] border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 outline-none focus:border-emerald-500/50"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase tracking-widest text-slate-400 font-bold mb-1">
                  Tone & Subtext <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={2}
                  value={formTone}
                  onChange={e => setFormTone(e.target.value)}
                  placeholder="e.g. Visceral, cynical, heavy with dread and slow suspense"
                  className="w-full bg-[#0a0c10] border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 outline-none focus:border-emerald-500/50 resize-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase tracking-widest text-slate-400 font-bold mb-1">
                  Dynamic Vocabulary (Comma-separated)
                </label>
                <input
                  type="text"
                  value={formVocabulary}
                  onChange={e => setFormVocabulary(e.target.value)}
                  placeholder="e.g. shadows, typewriter, blood, dread"
                  className="w-full bg-[#0a0c10] border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 outline-none focus:border-emerald-500/50"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase tracking-widest text-slate-400 font-bold mb-1">
                  Pacing Characteristics
                </label>
                <input
                  type="text"
                  value={formPacing}
                  onChange={e => setFormPacing(e.target.value)}
                  placeholder="e.g. Rapid short punches leading to sudden descriptive breaths"
                  className="w-full bg-[#0a0c10] border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 outline-none focus:border-emerald-500/50"
                />
              </div>
            </div>

            {/* Right Col */}
            <div className="space-y-3">
              <div>
                <label className="block text-[10px] font-mono uppercase tracking-widest text-slate-400 font-bold mb-1">
                  Narrative POV
                </label>
                <select
                  value={formPov}
                  onChange={e => setFormPov(e.target.value)}
                  className="w-full bg-[#0a0c10] border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 outline-none focus:border-emerald-500/50 cursor-pointer"
                >
                  <option value='First-person ("I")'>First-person ("I")</option>
                  <option value="Third-person limited">Third-person limited</option>
                  <option value="Third-person omniscient">Third-person omniscient</option>
                  <option value='Second-person ("You")'>Second-person ("You")</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase tracking-widest text-slate-400 font-bold mb-1">
                  Dialogue Styling Style
                </label>
                <input
                  type="text"
                  value={formDialogue}
                  onChange={e => setFormDialogue(e.target.value)}
                  placeholder="e.g. Sardonic, sparse, subtext-heavy with colloquial dialect"
                  className="w-full bg-[#0a0c10] border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 outline-none focus:border-emerald-500/50"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase tracking-widest text-slate-400 font-bold mb-1">
                  Linguistic Persona Profile
                </label>
                <textarea
                  rows={3}
                  value={formPersona}
                  onChange={e => setFormPersona(e.target.value)}
                  placeholder="e.g. An unseen, knowing witness who analyzes the micro-expressions of people"
                  className="w-full bg-[#0a0c10] border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 outline-none focus:border-emerald-500/50 resize-none"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-slate-950 text-xs font-mono font-black uppercase tracking-wider rounded-lg flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
            >
              <Save size={14} />
              Lock in Voice style
            </button>
          </div>
        </form>
      )}

      {/* Loading state indicator */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12 gap-3 text-xs font-mono uppercase tracking-widest text-slate-400">
          <div className="w-5 h-5 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin"></div>
          Accessing Linguistic Database...
        </div>
      ) : (
        <div className="space-y-3">
          {profiles.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-slate-800 rounded-xl text-xs text-slate-500 font-mono">
              No custom style DNA found in the database. Preset profiles will be seeded shortly.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {profiles.map(p => {
                const isActive = p.isPrimary;
                const isCurrentInEditor = currentProfile?.id === p.id;
                const isExpanded = expandedProfileId === p.id;

                return (
                  <div
                    key={p.id}
                    className={`rounded-xl border transition-all relative flex flex-col justify-between p-4 group select-none ${
                      isActive 
                        ? 'bg-emerald-950/15 border-emerald-500/40 shadow-xl shadow-emerald-500/2' 
                        : 'bg-[#12141c]/40 border-slate-800 hover:border-slate-700/80 hover:bg-[#12141c]/80'
                    }`}
                  >
                    {/* Glowing Accent Ring for primary */}
                    {isActive && (
                      <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/5 blur-xl rounded-full pointer-events-none"></div>
                    )}

                    {/* Card Top section */}
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-serif font-black text-slate-100 text-sm leading-tight">
                              {p.name}
                            </h4>
                            {isActive && (
                              <span className="text-[9px] font-mono font-extrabold uppercase tracking-widest bg-emerald-500 text-slate-950 px-1.5 py-0.5 rounded shrink-0">
                                primary
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] font-mono text-slate-500">
                            ID: {p.id.substring(0, 12)}...
                          </p>
                        </div>

                        {/* Interactive Toolbar Actions */}
                        <div className="flex items-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                          <button
                            type="button"
                            onClick={() => handleDuplicate(p)}
                            className="p-1.5 bg-slate-800 hover:bg-slate-700 hover:text-white rounded text-slate-400 transition-all cursor-pointer"
                            title="Duplicate style"
                          >
                            <Copy size={11} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenForm(p)}
                            className="p-1.5 bg-slate-800 hover:bg-slate-700 hover:text-white rounded text-slate-400 transition-all cursor-pointer"
                            title="Edit attributes manually"
                          >
                            <Sliders size={11} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(p.id, p.name)}
                            className="p-1.5 bg-slate-800 hover:bg-red-900/40 hover:text-red-400 rounded text-slate-400 transition-all cursor-pointer"
                            title="Delete profile"
                          >
                            <Trash2 size={11} />
                          </button>
                        </div>
                      </div>

                      {/* Display the tone in italic display format */}
                      <div className="text-xs italic text-slate-300 font-serif border-l-2 border-emerald-500/20 pl-2.5 py-0.5 leading-relaxed">
                        &ldquo;{p.tone}&rdquo;
                      </div>

                      {/* Pill characteristics */}
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-slate-800/80 border border-slate-700/60 text-slate-400">
                          POV: {p.pov.split(' ')[0]}
                        </span>
                        <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-slate-800/80 border border-slate-700/60 text-slate-400 truncate max-w-[120px]">
                          pacing: {p.pacing.split(',')[0]}
                        </span>
                      </div>

                      {/* Collapsible details accordion */}
                      {isExpanded ? (
                        <div className="space-y-2 text-[11px] font-mono text-slate-400 border-t border-slate-800/80 pt-3 animate-fade-in">
                          <div className="grid grid-cols-1 gap-2.5 bg-[#0a0c10]/40 p-2.5 rounded border border-slate-800/60">
                            <div>
                              <span className="text-slate-500 uppercase text-[9px] tracking-widest font-bold block mb-0.5">Vocabulary Archetypes:</span>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {p.vocabulary.length > 0 ? (
                                  p.vocabulary.map((v, i) => (
                                    <span key={i} className="text-[10px] bg-slate-900 text-indigo-400 px-1.5 py-0.5 rounded border border-slate-800">
                                      {v}
                                    </span>
                                  ))
                                ) : (
                                  <span className="text-slate-600 text-[10px]">No unique constraints set</span>
                                )}
                              </div>
                            </div>
                            <div>
                              <span className="text-slate-500 uppercase text-[9px] tracking-widest font-bold block mb-0.5">Author Persona:</span>
                              <span className="text-slate-300 leading-normal">{p.persona}</span>
                            </div>
                            <div>
                              <span className="text-slate-500 uppercase text-[9px] tracking-widest font-bold block mb-0.5">Dialogue Rule:</span>
                              <span className="text-slate-300 leading-normal">{p.dialogue}</span>
                            </div>
                          </div>
                        </div>
                      ) : null}
                    </div>

                    {/* Expand and Set Primary buttons at bottom */}
                    <div className="flex items-center justify-between gap-4 border-t border-slate-850 pt-3 mt-4">
                      <button
                        type="button"
                        onClick={() => setExpandedProfileId(isExpanded ? null : p.id)}
                        className="text-[10px] font-mono text-slate-400 hover:text-slate-200 flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        {isExpanded ? (
                          <>
                            <ChevronUp size={11} /> Hide Linguistic Blueprint
                          </>
                        ) : (
                          <>
                            <ChevronDown size={11} /> View Linguistic Blueprint
                          </>
                        )}
                      </button>

                      {isActive ? (
                        <div className="text-[10px] font-mono text-emerald-400 font-extrabold uppercase tracking-widest flex items-center gap-1">
                          <Check size={12} className="stroke-[3]" />
                          <span>Active style</span>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleSetPrimary(p)}
                          className="px-2.5 py-1 bg-slate-800 hover:bg-emerald-600/20 hover:border-emerald-500/30 hover:text-emerald-400 text-slate-300 text-[10px] font-mono font-bold uppercase tracking-wider rounded border border-slate-700/60 cursor-pointer transition-all"
                        >
                          Lock as Primary
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {deleteConfirmProfile && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
          <div className="bg-[#12141c] border border-slate-800 rounded-xl p-6 max-w-sm w-full space-y-4 shadow-2xl animate-fade-in text-center">
            <div className="w-12 h-12 bg-red-500/10 text-red-500 border border-red-500/20 rounded-full flex items-center justify-center mx-auto">
              <Trash2 size={24} />
            </div>
            <div className="space-y-1.5">
              <h4 className="font-mono text-xs uppercase tracking-wider text-slate-100 font-bold">Remove Voice Profile?</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Are you sure you want to permanently delete <strong className="text-slate-200">"{deleteConfirmProfile.name}"</strong>? This action cannot be undone.
              </p>
            </div>
            <div className="flex gap-2 justify-center pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmProfile(null)}
                className="px-3 py-1.5 bg-slate-850 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-mono font-bold uppercase tracking-wider rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  const targetId = deleteConfirmProfile.id;
                  const targetName = deleteConfirmProfile.name;
                  setDeleteConfirmProfile(null);
                  executeDelete(targetId, targetName);
                }}
                className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white text-xs font-mono font-bold uppercase tracking-wider rounded-lg transition-colors cursor-pointer shadow-lg hover:shadow-red-600/10"
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