import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Sparkles, Zap, Shield, Crown, Compass, Swords, Heart, Copy, Plus, BookOpen, Check, RefreshCw, Filter, Layers, ChevronDown } from 'lucide-react';
import { useBibleStore } from '../store/bibleStore';
import { useManuscriptStore } from '../store/manuscriptStore';
import { useToast } from '../lib/ToastContext';

export interface InfiniteHeroesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export type GenreMood = 'epic_fantasy' | 'hard_scifi' | 'cyberpunk_noir' | 'historical_fiction' | 'cozy_mystery' | 'dark_thriller';

interface InfiniteHero {
  id: string;
  name: string;
  epithet: string;
  archetype: string;
  genreMood: GenreMood;
  alignment: string;
  role: 'protagonist' | 'deuteragonist' | 'antagonist' | 'supporting' | 'other';
  fatalFlaw: string;
  coreDesire: string;
  psycWound: string;
  signatureTool: string;
  dialogueCadence: string;
  heroArcPhase: string;
  backstory: string;
  traits: string[];
}

interface PersonaTemplate {
  id: string;
  name: string;
  desc: string;
  tone: string;
  defaultAlignment: string;
}

const GENRE_MOODS: { id: GenreMood; label: string; desc: string; color: string }[] = [
  { id: 'epic_fantasy', label: 'Epic Fantasy', desc: 'Ancient oaths, elemental relics, runic beasts & noble lineage.', color: 'from-amber-500/20 to-yellow-600/10 text-amber-400 border-amber-500/30' },
  { id: 'hard_scifi', label: 'Hard Sci-Fi', desc: 'Orbital enclaves, quantum ciphers, relativistic velocity & AI bonds.', color: 'from-cyan-500/20 to-blue-600/10 text-cyan-400 border-cyan-500/30' },
  { id: 'cyberpunk_noir', label: 'Cyberpunk / Noir', desc: 'Neon alleys, neural implants, rain-slick streets & laconic wit.', color: 'from-fuchsia-500/20 to-purple-600/10 text-fuchsia-400 border-fuchsia-500/30' },
  { id: 'historical_fiction', label: 'Historical', desc: 'Gilded salons, duelist sabers, political intrigue & secret ledgers.', color: 'from-emerald-500/20 to-teal-600/10 text-emerald-400 border-emerald-500/30' },
  { id: 'cozy_mystery', label: 'Cozy Mystery', desc: 'Quaint coastal towns, sharp observation, hidden heirlooms & tea.', color: 'from-rose-500/20 to-pink-600/10 text-rose-400 border-rose-500/30' },
  { id: 'dark_thriller', label: 'Dark Thriller', desc: 'Covert ops, psychological trauma, relentless focus & moral gray.', color: 'from-red-500/20 to-slate-800/20 text-red-400 border-red-500/30' }
];

const PERSONA_TEMPLATES_BY_GENRE: Record<GenreMood, PersonaTemplate[]> = {
  epic_fantasy: [
    { id: 'ef_guardian', name: 'The Reluctant Guardian', desc: 'Bears heavy duty with quiet resolve. Protects others while wrestling with internal guilt.', tone: 'Solemn, Duty-Bound, Majestic', defaultAlignment: 'Lawful Good' },
    { id: 'ef_sovereign', name: 'The Lost Sovereign', desc: 'Heir to a fallen realm, forced to unite warring factions under a fractured banner.', tone: 'Regal, Unyielding, Strategic', defaultAlignment: 'Lawful Neutral' },
    { id: 'ef_catalyst', name: 'The Runebound Catalyst', desc: 'Involuntary vessel for an ancient magical surge that alters terrain and weather.', tone: 'Volatile, Mystical, Intense', defaultAlignment: 'Chaotic Good' },
    { id: 'ef_antihero', name: 'The Shadow Exile', desc: 'Cursed outcast using forbidden dark magic to execute vigilante retribution.', tone: 'Grim, Brooding, Dangerous', defaultAlignment: 'Dark Anti-Hero' }
  ],
  hard_scifi: [
    { id: 'hs_architect', name: 'The Orbital Architect', desc: 'Precision strategist calculating orbital mechanics while navigating corporate oligarchy.', tone: 'Analytical, Cold, High-Concept', defaultAlignment: 'Lawful Neutral' },
    { id: 'hs_salvager', name: 'The Deep-Space Salvager', desc: 'Pragmatic veteran surviving on derelict hulks with a strict personal honor code.', tone: 'Gritty, Resourceful, Laconic', defaultAlignment: 'True Neutral' },
    { id: 'hs_scholar', name: 'The Quantum Scholar', desc: 'Obsessive seeker of extra-dimensional anomalies willing to risk reality for truth.', tone: 'Intellectual, Driven, Visionary', defaultAlignment: 'Chaotic Neutral' },
    { id: 'hs_commander', name: 'The Fleet Commander', desc: 'Battle-hardened leader responsible for thousands of human lives in deep-space conflict.', tone: 'Authoritative, Stoic, Tactical', defaultAlignment: 'Lawful Good' }
  ],
  cyberpunk_noir: [
    { id: 'cp_maverick', name: 'The Shadow Maverick', desc: 'Operates in moral gray zones with neural implants to accomplish street justice.', tone: 'Cynical, Fast-Paced, Edgy', defaultAlignment: 'Chaotic Good' },
    { id: 'cp_inquisitor', name: 'The Chrome Inquisitor', desc: 'Former corporate enforcer seeking redemption by protecting the underworld outcast.', tone: 'Melancholic, Heavily Armored, Remorseful', defaultAlignment: 'True Neutral' },
    { id: 'cp_oracle', name: 'The Synthetic Oracle', desc: 'Augmented code-weaver who sees pattern streams hidden beneath city neon lights.', tone: 'Cryptic, Hyper-Focused, Tech-Adept', defaultAlignment: 'Chaotic Neutral' },
    { id: 'cp_fixer', name: 'The Neon Fixer', desc: 'Master broker of high-risk corporate data and illicit cyberware modifications.', tone: 'Slick, Calculating, Charismatic', defaultAlignment: 'Dark Anti-Hero' }
  ],
  historical_fiction: [
    { id: 'hf_duelist', name: 'The Gilded Duelist', desc: 'Master of sword and razor wit, hiding a secret allegiance behind salon elegance.', tone: 'Elegant, Sharp, Courtly', defaultAlignment: 'Chaotic Good' },
    { id: 'hf_cartographer', name: 'The Rebellious Cartographer', desc: 'Maps uncharted borders and smuggles forbidden manuscripts across royal lines.', tone: 'Adventurous, Meticulous, Idealistic', defaultAlignment: 'Lawful Neutral' },
    { id: 'hf_diplomat', name: 'The Disgraced Diplomat', desc: 'Navigates high-stakes royal courts using whispers, bribes, and flawless etiquette.', tone: 'Subtle, Scheming, Refined', defaultAlignment: 'True Neutral' },
    { id: 'hf_revolutionary', name: 'The Guild Champion', desc: 'Leads underground artisan movements seeking freedom from feudal tyranny.', tone: 'Passionate, Eloquent, Fierce', defaultAlignment: 'Chaotic Neutral' }
  ],
  cozy_mystery: [
    { id: 'cm_antiquarian', name: 'The Unassuming Antiquarian', desc: 'Notices micro-details and historic provenance that elude official inspectors.', tone: 'Warm, Observant, Quaint', defaultAlignment: 'Lawful Good' },
    { id: 'cm_cryptographer', name: 'The Retired Cryptographer', desc: 'Applies wartime codebreaking to decipher local village secrets over afternoon tea.', tone: 'Clever, Unflappable, Methodical', defaultAlignment: 'Lawful Good' },
    { id: 'cm_botanist', name: 'The Eccentric Botanist', desc: 'Identifies rare toxins and garden clues with uncanny botanical expertise.', tone: 'Whimsical, Insightful, Gentle', defaultAlignment: 'True Neutral' },
    { id: 'cm_archivist', name: 'The Village Archivist', desc: 'Uncovers decades-old family grudges buried deep within town ledgers.', tone: 'Persistent, Polite, Sharp-Minded', defaultAlignment: 'Lawful Neutral' }
  ],
  dark_thriller: [
    { id: 'dt_enforcer', name: 'The Rogue Tactical Enforcer', desc: 'Burned intelligence agent pursuing a syndicate that framed their entire team.', tone: 'Relentless, Cold, High-Tension', defaultAlignment: 'Dark Anti-Hero' },
    { id: 'dt_profiler', name: 'The Clinical Profiler', desc: 'Reads psychological micro-expressions but struggles with personal human intimacy.', tone: 'Clinical, Distant, Razor-Sharp', defaultAlignment: 'Lawful Neutral' },
    { id: 'dt_whistleblower', name: 'The Vengeful Whistleblower', desc: 'Exposes bioweapons contracts while staying one step ahead of clean-up squads.', tone: 'Desperate, Brilliant, Fearless', defaultAlignment: 'Chaotic Good' },
    { id: 'dt_interrogator', name: 'The Black-Ops Specialist', desc: 'Master of covert ops and psychological warfare breaking down conspiracy networks.', tone: 'Uncompromising, Quiet, Lethal', defaultAlignment: 'Chaotic Neutral' }
  ]
};

const GENRE_NAMES: Record<GenreMood, string[]> = {
  epic_fantasy: ['Kaelen', 'Lyra', 'Vance', 'Orion', 'Astrid', 'Thorne', 'Vivienne', 'Zephyr', 'Seraphina', 'Cassian'],
  hard_scifi: ['Commander Mercer', 'Dr. Vane', 'Astraea-9', 'Jax Vance', 'Soren Drake', 'Valerie Chen', 'Darian Hawke'],
  cyberpunk_noir: ['Kira "Zero" Vex', 'Marcus Steele', 'Nyx Sterling', 'Gideon Cross', 'Roxie Vance', 'Cipher Slate'],
  historical_fiction: ['Lord Alistair Sterling', 'Lady Evelyn Vance', 'Captain Julian Rhys', 'Isolde von Berg', 'Henri Dubois'],
  cozy_mystery: ['Penelope Finch', 'Barnaby Croft', 'Beatrix Vance', 'Professor Arthur Plum', 'Clara Higgins'],
  dark_thriller: ['Agent Jack Reaver', 'Sloan Vance', 'Dr. Mara Sterling', 'Victor Vance', 'Specialist Maya Lin']
};

const GENRE_EPITHETS: Record<GenreMood, string[]> = {
  epic_fantasy: ['The Obsidian Weaver', 'The Unbroken Sentinel', 'The Fatebreaker', 'The Celestial Rogue', 'The Crimson Herald'],
  hard_scifi: ['The Stellar Vector', 'The Relay Warden', 'The Gravity Weaver', 'The Tachyon Ghost', 'The Zenith Sentinel'],
  cyberpunk_noir: ['The Netrunner Sovereign', 'The Chrome Phantom', 'The Neon Spectre', 'The Wire-Biter', 'The Shadow Protocol'],
  historical_fiction: ['The Velvet Blade', 'The Whispering Chancellor', 'The Crown Breaker', 'The Gilded Lion', 'The Court Cipher'],
  cozy_mystery: ['The Teapot Detective', 'The Archive Whisperer', 'The Harbor Sentinel', 'The Rosewood Sleuth', 'The Attic Scholar'],
  dark_thriller: ['The Silent Spectre', 'The Apex Hunter', 'The Ghost Protocol', 'The Blackout Sentinel', 'The Rogue Vector']
};

const GENRE_TOOLS: Record<GenreMood, string[]> = {
  epic_fantasy: ['An ancient runic cipher blade forged in dragonfire', 'A brass astrolabe pointing toward forgotten ley-lines'],
  hard_scifi: ['A neural-linked quantum pulse pistol', 'An orbital telemetry wrist-array with hardlight shields'],
  cyberpunk_noir: ['A suppressed heavy thermal sidearm', 'A mono-filament deck cipher embedded in forearm cyberware'],
  historical_fiction: ['A Toledo-steel rapier with a hidden poison cavity', 'A leather-bound cipher diary sealed with royal wax'],
  cozy_mystery: ['A vintage brass magnifying monocle', 'A leather notebook containing heirloom botanical sketches'],
  dark_thriller: ['A suppressed sub-compact tactical pistol', 'An encrypted satellite transmitter with self-destruct key']
};

export default function InfiniteHeroesModal({ isOpen, onClose }: InfiniteHeroesModalProps) {
  const [selectedGenre, setSelectedGenre] = useState<GenreMood>('epic_fantasy');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('all');
  const [hero, setHero] = useState<InfiniteHero | null>(null);
  const [copied, setCopied] = useState(false);

  const { addCharacter } = useBibleStore();
  const { selectedChapterId, chapters, updateChapterContent } = useManuscriptStore();
  const { showToast } = useToast();

  const handleGenerateHero = () => {
    const templates = PERSONA_TEMPLATES_BY_GENRE[selectedGenre];
    
    // Pick selected template or random
    const chosenTemplate = selectedTemplateId === 'all'
      ? templates[Math.floor(Math.random() * templates.length)]
      : templates.find(t => t.id === selectedTemplateId) || templates[0];

    const names = GENRE_NAMES[selectedGenre];
    const epithets = GENRE_EPITHETS[selectedGenre];
    const tools = GENRE_TOOLS[selectedGenre];

    const name = names[Math.floor(Math.random() * names.length)];
    const epithet = epithets[Math.floor(Math.random() * epithets.length)];
    const tool = tools[Math.floor(Math.random() * tools.length)];

    const alignment = chosenTemplate.defaultAlignment || 'Chaotic Good';

    const flaws = [
      'Inability to delegate critical burdens',
      'Obsessive loyalty to a broken oath',
      'Reckless overconfidence masking a fear of failure',
      'Deep cynicism that delays compassionate action',
      'Secret shame regarding a past betrayal'
    ];
    const desires = [
      'To break an inherited curse before it consumes their lineage',
      'To defend the last surviving enclave against hostile forces',
      'To uncover suppressed truths behind the cataclysm',
      'To forge an enduring peace out of factional chaos'
    ];
    const wounds = [
      'Witnessed the fall of their home enclave during the Partition',
      'Betrayed by a trusted mentor at age seventeen',
      'Forced to abandon their birth name to survive',
      'Carries guilt from surviving when their unit fell'
    ];
    const cadences = [
      'Laconic and clipped; uses precise terminology to suppress raw emotion.',
      'Poetic and rhythmic; speaks in metaphors, old proverbs, and calm cadences.',
      'Sharp and sarcastic; uses biting wit as an armor against intimacy.',
      'Commanding and soft-spoken; never raises voice, yet commands instant silence.'
    ];
    const phases = [
      'Refusing the Call (Hesitation & Fear)',
      'Crossing the Threshold (Point of No Return)',
      'Inmost Cave Trial (Facing Core Trauma)',
      'The Resurrection (Final Metamorphosis)'
    ];

    const generated: InfiniteHero = {
      id: 'hero-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      name,
      epithet,
      archetype: chosenTemplate.name,
      genreMood: selectedGenre,
      alignment,
      role: Math.random() > 0.3 ? 'protagonist' : 'deuteragonist',
      fatalFlaw: flaws[Math.floor(Math.random() * flaws.length)],
      coreDesire: desires[Math.floor(Math.random() * desires.length)],
      psycWound: wounds[Math.floor(Math.random() * wounds.length)],
      signatureTool: tool,
      dialogueCadence: cadences[Math.floor(Math.random() * cadences.length)],
      heroArcPhase: phases[Math.floor(Math.random() * phases.length)],
      backstory: `${name} (${epithet}) operates as ${chosenTemplate.name.toLowerCase()} guided by a ${alignment.toLowerCase()} moral compass. Tone Vector: ${chosenTemplate.tone}. Driven by a core desire ${desires[0].toLowerCase()}, ${name} bears a psychological wound: ${wounds[0].toLowerCase()}. Their greatest internal battle is ${flaws[0].toLowerCase()}.`,
      traits: [chosenTemplate.name, alignment, chosenTemplate.tone, selectedGenre.replace('_', ' ')]
    };

    setHero(generated);
    showToast(`Forged ${name} (${epithet}) — Ready for insertion!`, 'success');
  };

  const handleBindToBible = () => {
    if (!hero) return;
    addCharacter({
      name: `${hero.name} — ${hero.epithet}`,
      role: hero.role,
      traits: hero.traits,
      backstory: hero.backstory,
      appearance: `Signature Asset: ${hero.signatureTool}. Alignment: ${hero.alignment}.`,
      arc: `Arc Phase: ${hero.heroArcPhase}. Fatal Flaw: ${hero.fatalFlaw}. Core Desire: ${hero.coreDesire}.`,
      notes: `Genre: ${hero.genreMood}. Dialogue Cadence: ${hero.dialogueCadence}. Trauma: ${hero.psycWound}.`
    });
    showToast(`Bound ${hero.name} to Canon Story Bible!`, 'success');
  };

  const handleInsertToManuscript = () => {
    if (!hero) return;
    if (!selectedChapterId) {
      showToast('Please select an active chapter first!', 'info');
      return;
    }

    const currentChap = chapters.find(c => c.id === selectedChapterId);
    if (!currentChap) return;

    const calloutHtml = `<div style="background-color: rgba(245, 158, 11, 0.08); border-left: 4px solid #f59e0b; padding: 12px 16px; margin: 16px 0; border-radius: 4px;">
      <p style="font-family: monospace; font-weight: bold; color: #f59e0b; margin: 0 0 4px 0; font-size: 11px; text-transform: uppercase;">
        DRAMATIS PERSONAE: ${hero.name} (${hero.epithet})
      </p>
      <p style="margin: 0; font-style: italic; font-size: 13px; color: #cbd5e1;">
        "${hero.backstory}"
      </p>
      <p style="margin: 6px 0 0 0; font-size: 11px; color: #94a3b8;">
        <strong>Asset:</strong> ${hero.signatureTool} | <strong>Flaw:</strong> ${hero.fatalFlaw} | <strong>Cadence:</strong> ${hero.dialogueCadence}
      </p>
    </div><p></p>`;

    updateChapterContent(selectedChapterId, (currentChap.content || '') + calloutHtml);
    showToast(`Inserted Dramatis Personae for ${hero.name} into active chapter!`, 'success');
  };

  const handleCopyProfile = () => {
    if (!hero) return;
    const text = `HERO PROFILE:\nName: ${hero.name} (${hero.epithet})\nArchetype: ${hero.archetype}\nGenre: ${hero.genreMood}\nAlignment: ${hero.alignment}\nFatal Flaw: ${hero.fatalFlaw}\nCore Desire: ${hero.coreDesire}\nTrauma: ${hero.psycWound}\nSignature Tool: ${hero.signatureTool}\nCadence: ${hero.dialogueCadence}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    showToast('Copied Hero Profile to clipboard!', 'info');
  };

  if (!isOpen) return null;

  const currentTemplates = PERSONA_TEMPLATES_BY_GENRE[selectedGenre];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2 }}
          className="bg-[#0c0e12] border border-amber-500/40 rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden relative"
        >
          {/* Header */}
          <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-amber-950/40 via-[#0c0e12] to-amber-950/20">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400">
                <Sparkles size={20} />
              </div>
              <div>
                <h2 className="text-lg font-bold font-serif text-slate-100 flex items-center gap-2">
                  <span>Hero Forge Character Generator</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    Syllabexa Engine
                  </span>
                </h2>
                <p className="text-xs text-slate-400">
                  Select genre mood & persona templates to forge archetypal characters aligned with your manuscript's tone.
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X size={20} />
            </button>
          </div>

          {/* Modal Body */}
          <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-6">
            
            {/* Genre Filter Tabs */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                  <Filter size={14} className="text-amber-400" />
                  <span>1. Select Book Genre Mood</span>
                </label>
              </div>

              {/* Tabbed Genre Navigation */}
              <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar pb-1">
                {GENRE_MOODS.map(g => (
                  <button
                    key={g.id}
                    onClick={() => {
                      setSelectedGenre(g.id);
                      setSelectedTemplateId('all');
                    }}
                    className={`px-4 py-2 rounded-xl border text-xs font-mono uppercase tracking-wider transition-all shrink-0 cursor-pointer flex items-center gap-2 ${
                      selectedGenre === g.id
                        ? 'bg-amber-500 text-slate-950 font-black border-amber-400 shadow-lg shadow-amber-500/20'
                        : 'bg-white/5 border-white/5 hover:border-amber-500/30 text-slate-300 hover:bg-white/10'
                    }`}
                  >
                    <span>{g.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Persona Template Selector (Dropdown & Tab Cards) */}
            <div className="space-y-3 bg-white/5 p-4 rounded-2xl border border-white/10">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <label className="text-xs font-mono font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
                  <Layers size={14} className="text-amber-400" />
                  <span>2. Select Persona Template ({GENRE_MOODS.find(g => g.id === selectedGenre)?.label})</span>
                </label>

                {/* Dropdown Select Menu */}
                <div className="relative shrink-0">
                  <select
                    value={selectedTemplateId}
                    onChange={e => setSelectedTemplateId(e.target.value)}
                    className="appearance-none bg-black/60 border border-amber-500/40 text-amber-300 rounded-xl px-3 py-1.5 pr-8 text-xs font-mono focus:outline-none focus:border-amber-400 cursor-pointer"
                  >
                    <option value="all">⚡ Any Persona Template (Randomize)</option>
                    {currentTemplates.map(t => (
                      <option key={t.id} value={t.id}>
                        {t.name} ({t.tone})
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="absolute right-2.5 top-2.5 text-amber-400 pointer-events-none" />
                </div>
              </div>

              {/* Persona Template Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                <button
                  onClick={() => setSelectedTemplateId('all')}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    selectedTemplateId === 'all'
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300 shadow-md'
                      : 'bg-black/30 border-white/5 hover:border-amber-500/30 text-slate-300'
                  }`}
                >
                  <div className="text-xs font-bold font-serif flex items-center justify-between">
                    <span>⚡ Any Archetypal Persona</span>
                    <span className="text-[9px] font-mono uppercase text-amber-400">RANDOM</span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">
                    Procedurally mix traits from all {GENRE_MOODS.find(g => g.id === selectedGenre)?.label} persona archetypes.
                  </div>
                </button>

                {currentTemplates.map(t => (
                  <button
                    key={t.id}
                    onClick={() => setSelectedTemplateId(t.id)}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      selectedTemplateId === t.id
                        ? 'bg-amber-500/20 border-amber-500 text-amber-300 shadow-md'
                        : 'bg-black/30 border-white/5 hover:border-amber-500/30 text-slate-300'
                    }`}
                  >
                    <div className="text-xs font-bold font-serif flex items-center justify-between">
                      <span>{t.name}</span>
                      <span className="text-[9px] font-mono text-indigo-300 px-1.5 py-0.5 rounded bg-indigo-500/20 border border-indigo-500/30">
                        {t.defaultAlignment}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400 mt-1 line-clamp-1">{t.desc}</div>
                    <div className="text-[9px] font-mono text-amber-400/80 mt-1 italic">Tone: {t.tone}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Action Trigger Banner */}
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-amber-500/15 via-amber-500/10 to-amber-950/20 border border-amber-500/30 rounded-2xl shadow-lg">
              <div className="text-xs text-slate-200 font-serif">
                Forge hero with <strong className="text-amber-400">{GENRE_MOODS.find(g => g.id === selectedGenre)?.label}</strong> tone vector using <strong className="text-amber-300">{selectedTemplateId === 'all' ? 'Random Archetype' : currentTemplates.find(t => t.id === selectedTemplateId)?.name}</strong> template.
              </div>
              <button
                onClick={handleGenerateHero}
                className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 rounded-xl font-mono text-xs font-black uppercase tracking-wider shadow-lg shadow-amber-500/20 transition-all cursor-pointer flex items-center gap-2 shrink-0 active:scale-95"
              >
                <Zap size={14} className="fill-slate-950" />
                <span>Forge Hero Now</span>
              </button>
            </div>

            {/* Generated Hero Result */}
            {hero ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-black/40 border-2 border-amber-500/40 rounded-2xl p-6 space-y-5 relative overflow-hidden"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-mono font-bold uppercase border border-amber-500/30">
                        {hero.archetype}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 text-[10px] font-mono font-bold uppercase border border-indigo-500/30">
                        {hero.alignment}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold font-serif text-white">
                      {hero.name}
                    </h3>
                    <div className="text-xs font-mono text-amber-400 font-bold">
                      "{hero.epithet}"
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0 flex-wrap">
                    <button
                      onClick={handleBindToBible}
                      className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl font-mono text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 shadow-md shadow-amber-500/20"
                    >
                      <Plus size={14} />
                      <span>Bind to Bible</span>
                    </button>

                    <button
                      onClick={handleInsertToManuscript}
                      className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-mono text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 shadow-md shadow-emerald-600/20"
                      title="Insert Dramatis Personae callout into active chapter"
                    >
                      <BookOpen size={14} />
                      <span>Insert in Chapter</span>
                    </button>

                    <button
                      onClick={handleCopyProfile}
                      className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 rounded-xl transition-colors cursor-pointer"
                      title="Copy Profile"
                    >
                      {copied ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
                    </button>

                    <button
                      onClick={handleGenerateHero}
                      className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 rounded-xl transition-colors cursor-pointer"
                      title="Reroll Hero"
                    >
                      <RefreshCw size={16} />
                    </button>
                  </div>
                </div>

                {/* Hero Details Matrix */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="bg-white/5 p-3.5 rounded-xl border border-white/5 space-y-1">
                    <span className="text-[10px] font-mono font-bold uppercase text-amber-400 flex items-center gap-1">
                      <Heart size={12} /> Core Desire
                    </span>
                    <p className="text-slate-200 font-serif leading-relaxed">{hero.coreDesire}</p>
                  </div>

                  <div className="bg-white/5 p-3.5 rounded-xl border border-white/5 space-y-1">
                    <span className="text-[10px] font-mono font-bold uppercase text-rose-400 flex items-center gap-1">
                      <Shield size={12} /> Fatal Flaw
                    </span>
                    <p className="text-slate-200 font-serif leading-relaxed">{hero.fatalFlaw}</p>
                  </div>

                  <div className="bg-white/5 p-3.5 rounded-xl border border-white/5 space-y-1">
                    <span className="text-[10px] font-mono font-bold uppercase text-indigo-400 flex items-center gap-1">
                      <Swords size={12} /> Signature Asset
                    </span>
                    <p className="text-slate-200 font-serif leading-relaxed">{hero.signatureTool}</p>
                  </div>

                  <div className="bg-white/5 p-3.5 rounded-xl border border-white/5 space-y-1">
                    <span className="text-[10px] font-mono font-bold uppercase text-emerald-400 flex items-center gap-1">
                      <Compass size={12} /> Dialogue Cadence
                    </span>
                    <p className="text-slate-200 font-serif leading-relaxed">{hero.dialogueCadence}</p>
                  </div>
                </div>

                {/* Backstory */}
                <div className="p-3.5 bg-amber-500/5 border border-amber-500/20 rounded-xl text-xs font-serif italic text-slate-300">
                  "{hero.backstory}"
                </div>

              </motion.div>
            ) : (
              <div className="text-center py-12 border-2 border-dashed border-white/10 rounded-2xl space-y-3">
                <Crown size={32} className="mx-auto text-amber-500/40" />
                <div className="text-sm font-bold text-slate-300 font-serif">No Hero Forged Yet</div>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Select a genre mood and persona template above, then click "Forge Hero Now" to generate an archetypal hero profile.
                </p>
              </div>
            )}

          </div>

          {/* Modal Footer */}
          <div className="px-6 py-4 border-t border-white/10 bg-black/40 flex items-center justify-between text-xs text-slate-500 font-mono">
            <span>Syllabexa Linguistic Engine v4.8 • Infinite Heroes Suite</span>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-white/5 hover:bg-white/10 text-slate-300 rounded-xl font-mono text-xs transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
