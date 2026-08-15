import React, { useState } from 'react';
import { Sparkles, X, Send, Loader2, FileText, Database, Settings, UserPlus, BookOpen } from 'lucide-react';
import { useManuscriptStore } from '@/store/manuscriptStore';
import { useBibleStore } from '@/store/bibleStore';
import { useToast } from '@/lib/ToastContext';
import { generateGeminiResponse, streamGeminiResponse } from '@/lib/gemini';
import { globalVectorStore } from '@/lib/aiEngine';
import { Editor } from '@tiptap/react';
import SyllabexaBible from './SyllabexaBible';

interface GhostwritingDrawerProps {
  editor: Editor | null;
  isOpen: boolean;
  onClose: () => void;
  isPinned?: boolean;
  onTogglePin?: () => void;
}

const TONE_PROFILES: Record<string, string> = {
  "Author's Voice (Default)": "Standard author voice and style rules.",
  "High-Octane Thriller": "Fast-paced, high stakes, tension-filled prose with sharp sensory details.",
  "Hard Sci-Fi": "Technically accurate, visionary, emphasizing scale, technology, and philosophical stakes.",
  "Hemingwayesque": "Short, declarative sentences, stark realism, understated emotional depth.",
  "Technical Manual": "Precise terminology, highly structured, objective and analytical.",
  "Academic": "Rigorous scholarly phrasing, formal vocabulary, analytical depth.",
  "Narrative": "Immersive pacing, vivid sensory descriptions, character-driven flow."
};

export default function GhostwritingDrawer({ editor, isOpen, onClose, isPinned = true, onTogglePin }: GhostwritingDrawerProps) {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState<'write' | 'character' | 'bible'>('write');
  
  // AI Provider State
  const [provider, setProvider] = useState(() => localStorage.getItem('syllabexa_ai_provider') || 'gemini');
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('syllabexa_ai_key') || '');

  const handleProviderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setProvider(val);
    localStorage.setItem('syllabexa_ai_provider', val);
  };

  const handleApiKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setApiKey(val);
    localStorage.setItem('syllabexa_ai_key', val);
  };
  const workerRef = React.useRef<Worker | null>(null);

  React.useEffect(() => {
    workerRef.current = new Worker(new URL('../workers/ghostwriterWorker.ts', import.meta.url), { type: 'module' });
    return () => workerRef.current?.terminate();
  }, []);
  const [characterName, setCharacterName] = useState('');
  const [toneProfile, setToneProfile] = useState("Author's Voice (Default)");
  const [autoRefine, setAutoRefine] = useState(true);
  const [retrievedChunks, setRetrievedChunks] = useState<Array<{ id: string; source: string; text: string }>>([]);
  const addCoreConcept = useManuscriptStore((state) => state.addCoreConcept);
  
  const selectedChapterId = useManuscriptStore((state) => state.selectedChapterId);
  const chapters = useManuscriptStore((state) => state.chapters);
  const projectMeta = useManuscriptStore((state) => state.projectMeta);
  const coreConcepts = useManuscriptStore((state) => state.coreConcepts);
  const { showToast } = useToast();

  const handleGenerateCharacterBio = async () => {
    if (!characterName.trim()) return;
    setIsGenerating(true);
    try {
      const conceptsContext = coreConcepts.length > 0 
        ? `Current Project Concepts:\n${coreConcepts.map(c => `- ${c.term}: ${c.context}`).join('\n')}` 
        : '';
        
      const systemPrompt = `You are an expert character developer. Generate a detailed, structured biography for a character named "${characterName}".
Context:
${conceptsContext}

Return the biography in a concise but detailed format. Focus on role, motivation, and physical description.`;

      showToast('Generating character biography...', 'info');
      
      const bio = await new Promise<string>((resolve, reject) => {
        if (!workerRef.current) return reject("Worker not initialized");
        const handler = (e: MessageEvent) => {
          workerRef.current?.removeEventListener('message', handler);
          if (e.data.success) resolve(e.data.text);
          else reject(e.data.error);
        };
        workerRef.current.addEventListener('message', handler);
        workerRef.current.postMessage({ prompt: systemPrompt, options: { provider, apiKey } });
      });

      
      addCoreConcept({
        id: crypto.randomUUID(),
        term: characterName,
        context: bio.substring(0, 500) + (bio.length > 500 ? '...' : ''),
        chapterId: selectedChapterId || 'global'
      });
      
      setCharacterName('');
      showToast('Character Biography generated and saved to Concepts Graph.', 'success');
    } catch (e) {
      console.error(e);
      showToast('Failed to generate biography.', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim() || !editor) return;
    
    setIsGenerating(true);
    try {
      const activeChapter = chapters.find(c => c.id === selectedChapterId);
      
      const bibleState = useBibleStore.getState();
      const characters = bibleState.characters || [];
      const locations = bibleState.locations || [];
      const scenes = bibleState.scenes || [];
      const timeline = bibleState.timeline || [];

      const currentText = editor.getText();
      const words = currentText.split(/\s+/);
      const preceding500 = words.slice(Math.max(words.length - 500, 0)).join(' ');
      const precedingContext = `Preceding Text (up to 500 words): ${preceding500}`;

      globalVectorStore.indexStoryStudio(
        coreConcepts,
        characters,
        locations,
        scenes,
        timeline,
        chapters,
        selectedChapterId
      );

      const relevantChunks = globalVectorStore.query(prompt, 4);
      setRetrievedChunks(relevantChunks);

      // Hard Token-Budget Governor for RAG Chunks (Limit to 2000 chars ~500 tokens)
      const RAG_CHAR_BUDGET = 2000;
      let currentRAGBudgetUsed = 0;
      const budgetGovernedRAGChunks: typeof relevantChunks = [];

      for (const rc of relevantChunks) {
        const rcStr = `- [${rc.source}]: ${rc.text}\n`;
        if (currentRAGBudgetUsed + rcStr.length <= RAG_CHAR_BUDGET) {
          budgetGovernedRAGChunks.push(rc);
          currentRAGBudgetUsed += rcStr.length;
        } else {
          break;
        }
      }

      const ragContext = budgetGovernedRAGChunks.length > 0 
        ? `Retrieved Reference Chunks (Governed Token Budget):\n${budgetGovernedRAGChunks.map(rc => `- [${rc.source}]: ${rc.text}`).join('\n')}`
        : '';

      const chapterContext = activeChapter ? `Chapter Title: ${activeChapter.title}` : '';

      // Mentions-based Concept Filtering (RAG Governor)
      const textToMatch = `${prompt} ${preceding500}`.toLowerCase();
      const matchedConcepts = coreConcepts.filter(concept => {
        const termClean = concept.term.toLowerCase();
        return textToMatch.includes(termClean);
      });

      // Hard Token-Budget Governor for Concepts (Limit to 1200 chars ~300 tokens)
      const CONCEPT_CHAR_BUDGET = 1200;
      let currentBudgetUsed = 0;
      const budgetGovernedConcepts: typeof coreConcepts = [];

      for (const concept of matchedConcepts) {
        const conceptStr = `- ${concept.term}: ${concept.context}\n`;
        if (currentBudgetUsed + conceptStr.length <= CONCEPT_CHAR_BUDGET) {
          budgetGovernedConcepts.push(concept);
          currentBudgetUsed += conceptStr.length;
        } else {
          break;
        }
      }

      const conceptsContext = budgetGovernedConcepts.length > 0 
        ? `Matched Core Concepts (Governed Token Budget):\n${budgetGovernedConcepts.map(c => `- ${c.term}: ${c.context}`).join('\n')}` 
        : '';

      const voiceToneRules = `
Voice & Tone Rules:
- Selected Profile: ${toneProfile} (${TONE_PROFILES[toneProfile] || ''})
- Tone: ${projectMeta.ghostwritingRules?.tone || 'Neutral'}
- Target Audience: ${projectMeta.ghostwritingRules?.targetAudience || 'General'}
- Industry Vocabulary: ${projectMeta.ghostwritingRules?.industryVocabulary || 'None'}
`;

      const autoRefineInstruction = autoRefine 
        ? `\nAuto-Refine Directive: Match the exact sentence length distribution, cadence, phrasing rhythm, and vocabulary complexity of the immediately preceding paragraph in the preceding text.` 
        : '';

      const systemPrompt = `You are a professional ghostwriter. Write the next section of the manuscript.
Follow these strictly:
${voiceToneRules}
${chapterContext}
${conceptsContext}
${ragContext}
${autoRefineInstruction}

${precedingContext}

User Request: ${prompt}

Output ONLY the requested text. Use HTML formatting (<p>, <strong>, <em>, <h2>, etc.) for paragraphs and emphasis if needed. Do not include markdown block quotes like \`\`\`html.`;

      showToast('Generating text with Context Injection & Rules Engine...', 'info');
      
      
      const msgId = crypto.randomUUID();
      let accumulatedText = "";
      
      await new Promise<void>((resolve, reject) => {
        if (!workerRef.current) return reject("Worker not initialized");
        
        const handler = (e: MessageEvent) => {
          if (e.data.id !== msgId) return;
          if (e.data.type === 'chunk') {
            const chunk = e.data.chunk;
            accumulatedText += chunk;
            editor.commands.insertContent(chunk);
          } else if (e.data.type === 'done') {
            workerRef.current?.removeEventListener('message', handler);
            resolve();
          } else if (e.data.success === false) {
            workerRef.current?.removeEventListener('message', handler);
            reject(e.data.error);
          }
        };
        workerRef.current.addEventListener('message', handler);
        workerRef.current.postMessage({ id: msgId, prompt: systemPrompt, options: { temperature: 0.7, provider, apiKey }, stream: true });
      });
      /*
        editor.commands.insertContent(chunk);
      });
      */
      
      setPrompt('');
      showToast('Ghostwriting injection complete.', 'success');
    } catch (error) {
      console.error(error);
      showToast('Ghostwriting failed.', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <aside aria-label="Ghostwriter Co-Pilot" className="absolute top-4 right-4 w-88 glass-panel rounded-3xl shadow-2xl overflow-hidden flex flex-col z-50 transition-all duration-300 ease-out animate-in fade-in slide-in-from-right-6 bg-[#0c0e12]/95 border border-slate-800">
      <div className="p-4 border-b border-slate-800 bg-[#0c0e12] flex items-center justify-between">
        <div className="flex items-center gap-2.5 text-amber-400 font-bold text-xs uppercase tracking-widest font-mono">
          <div className="w-6 h-6 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
            <Sparkles size={13} />
          </div>
          <span>Ghostwriter Co-Pilot</span>
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-100 transition-colors p-1.5 rounded-lg hover:bg-slate-800 cursor-pointer" title="Close Co-Pilot">
          <X size={14} />
        </button>
      </div>
      
      <nav aria-label="Co-Pilot Tabs" className="flex border-b border-slate-800 bg-[#07080a]">
        <button 
          onClick={() => setActiveTab('write')} 
          className={`flex-1 py-2.5 text-xs font-mono font-bold uppercase tracking-wider transition-all cursor-pointer ${activeTab === 'write' ? 'text-amber-400 bg-amber-500/10 border-b-2 border-amber-400' : 'text-slate-500 hover:text-slate-300'}`}
        >
          Drafting & RAG
        </button>
        <button 
          onClick={() => setActiveTab('character')} 
          className={`flex-1 py-2.5 text-xs font-mono font-bold uppercase tracking-wider transition-all cursor-pointer ${activeTab === 'character' ? 'text-amber-400 bg-amber-500/10 border-b-2 border-amber-400' : 'text-slate-500 hover:text-slate-300'}`}
        >
          Character Bios
        </button>
        <button 
          onClick={() => setActiveTab('bible')} 
          className={`flex-1 py-2.5 text-xs font-mono font-bold uppercase tracking-wider transition-all cursor-pointer ${activeTab === 'bible' ? 'text-amber-400 bg-amber-500/10 border-b-2 border-amber-400' : 'text-slate-500 hover:text-slate-300'}`}
        >
          Story Bible
        </button>
      </nav>
      
      <div className="p-5 flex-1 flex flex-col gap-4">

        {activeTab === 'write' && (
          <>
            <div className="bg-[#12151c] border border-slate-800 p-3.5 rounded-2xl flex flex-col gap-2.5 shadow-inner">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest font-bold">Configure Co-Pilot</span>
                <span className="px-2 py-0.5 rounded-md bg-amber-950/40 text-amber-300 border border-amber-500/30 text-[9px] font-mono font-bold">RAG Active</span>
              </div>
              
              <div>
                <label className="block text-[10px] uppercase font-mono text-slate-400 mb-1 font-bold">Multi-Model Router</label>
                <div className="flex gap-2">
                  <select 
                    value={provider}
                    onChange={handleProviderChange}
                    className="w-1/3 bg-[#0c0e12] border border-slate-800 rounded-xl px-2 py-2 text-xs text-slate-200 focus:border-amber-500 focus:outline-none transition-colors shadow-sm cursor-pointer"
                  >
                    <option value="gemini">Gemini</option>
                    <option value="anthropic">Anthropic</option>
                    <option value="grok">Grok</option>
                  </select>
                  <input 
                    type="password"
                    placeholder={provider === 'gemini' ? "Using default server key" : `Enter ${provider} API Key`}
                    value={apiKey}
                    onChange={handleApiKeyChange}
                    disabled={provider === 'gemini'}
                    className="flex-1 bg-[#0c0e12] border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:border-amber-500 focus:outline-none transition-colors disabled:opacity-50"
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800 mt-2">
                <label className="block text-[10px] uppercase font-mono text-slate-400 mb-1 font-bold">Select Tone Profile</label>
                <select 
                  value={toneProfile}
                  onChange={(e) => setToneProfile(e.target.value)}
                  className="w-full bg-[#0c0e12] border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:border-amber-500 focus:outline-none transition-colors font-medium shadow-sm cursor-pointer"
                >
                  {Object.keys(TONE_PROFILES).map((profile) => (
                    <option key={profile} value={profile}>{profile}</option>
                  ))}
                </select>
                <div className="mt-1.5 flex items-center gap-1.5 text-[10px] font-mono text-amber-400/90">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
                  <span>Active Profile: {toneProfile}</span>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between border-t border-slate-800 mt-1">
                <div>
                  <div className="text-[10px] font-mono font-bold text-slate-300 uppercase tracking-widest">Auto-Refine Engine</div>
                  <div className="text-[9px] text-slate-400 font-sans">Match cadence & sentence length of preceding paragraph</div>
                </div>
                <button
                  type="button"
                  onClick={() => setAutoRefine(!autoRefine)}
                  className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer ${autoRefine ? 'bg-amber-500' : 'bg-slate-800'}`}
                >
                  <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full transition-transform ${autoRefine ? 'translate-x-4 bg-slate-950' : 'translate-x-0 bg-slate-400'}`} />
                </button>
              </div>

              <div className="border-t border-slate-800 pt-2.5 mt-1">
                <div className="text-[10px] font-mono text-slate-400 uppercase tracking-widest font-bold mb-2">Context Pipeline</div>
                {isGenerating ? (
                  <div className="space-y-2 animate-pulse">
                    <div className="h-5 bg-slate-800 rounded-lg w-full"></div>
                    <div className="h-5 bg-slate-800 rounded-lg w-4/5"></div>
                    <div className="h-5 bg-slate-800 rounded-lg w-3/4"></div>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-xs text-slate-300 bg-[#0c0e12] px-2.5 py-1.5 rounded-xl border border-slate-800">
                      <FileText size={13} className="text-amber-400 shrink-0" /> 
                      <span className="truncate">Active Chapter Context Linked</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-300 bg-[#0c0e12] px-2.5 py-1.5 rounded-xl border border-slate-800">
                      <Database size={13} className="text-amber-400 shrink-0" /> 
                      <span className="truncate">{coreConcepts.length} Key Entities in Graph</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-300 bg-[#0c0e12] px-2.5 py-1.5 rounded-xl border border-slate-800">
                      <Settings size={13} className="text-amber-400 shrink-0" /> 
                      <span className="truncate">Voice & Tone Rules Enforced</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {retrievedChunks.length > 0 && (
              <div className="bg-[#12151c] border border-slate-800 p-3.5 rounded-2xl flex flex-col gap-2 shadow-inner animate-in fade-in">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-amber-400 uppercase tracking-widest font-bold flex items-center gap-1.5">
                    <Database size={12} />
                    Reference Search Results ({retrievedChunks.length})
                  </span>
                  <span className="text-[9px] font-mono text-slate-500">Vector Similarity</span>
                </div>
                <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                  {retrievedChunks.map((chunk) => (
                    <div key={chunk.id} className="p-2 bg-[#0c0e12] border border-slate-800 rounded-xl text-[11px] text-slate-300">
                      <div className="font-mono font-bold text-[9px] text-amber-400 mb-0.5">{chunk.source}</div>
                      <p className="line-clamp-2 leading-relaxed opacity-90">{chunk.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <textarea 
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="What should happen next? e.g. Describe the tension in the room..."
              className="w-full bg-[#12151c] border border-slate-800 rounded-2xl px-3.5 py-3 text-xs text-slate-200 focus:border-amber-500 focus:outline-none transition-all shadow-inner min-h-[110px] resize-none leading-relaxed font-sans"
            />
            
            <button 
              onClick={handleGenerate}
              disabled={isGenerating || !prompt.trim()}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 disabled:hover:bg-amber-500 text-slate-950 rounded-2xl text-xs font-mono font-black uppercase tracking-wider transition-all shadow-xl shadow-amber-500/20 cursor-pointer"
            >
              {isGenerating ? <Loader2 size={15} className="animate-spin text-slate-950" /> : <Send size={15} />}
              <span>{isGenerating ? 'Synthesizing Stream...' : 'Generate & Inject'}</span>
            </button>
          </>
        )}

        {activeTab === 'character' && (
          <div className="flex flex-col gap-4 py-2">
            <div className="text-xs font-mono text-slate-400">
              Generate structured character biographies and instantly inject them into the project's RAG knowledge graph.
            </div>
            <div>
              <label className="block text-[10px] uppercase font-mono text-slate-400 mb-1 font-bold">Character Name</label>
              <input 
                type="text"
                value={characterName}
                onChange={(e) => setCharacterName(e.target.value)}
                placeholder="e.g. Elena Vance"
                className="w-full bg-[#12151c] border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:border-amber-500 focus:outline-none transition-all font-sans"
              />
            </div>
            <button
              onClick={handleGenerateCharacterBio}
              disabled={isGenerating || !characterName.trim()}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-2xl text-xs font-mono font-black uppercase tracking-wider transition-all shadow-lg shadow-amber-500/20 cursor-pointer disabled:opacity-50"
            >
              {isGenerating ? <Loader2 size={14} className="animate-spin text-slate-950" /> : <UserPlus size={14} />}
              <span>{isGenerating ? 'Synthesizing Bio...' : 'Generate Character Bio'}</span>
            </button>
          </div>
        )}

        {activeTab === 'bible' && (
          <SyllabexaBible 
            onInjectRAG={(loreContext) => {
              setPrompt(prev => {
                const spacer = prev ? '\n\n' : '';
                return `${prev}${spacer}[Canon Lore RAG Context]:\n${loreContext}`;
              });
              setActiveTab('write');
              showToast('Canon lore injected into co-pilot prompt queue.', 'success');
            }}
          />
        )}

      </div>
    </aside>
  );
}