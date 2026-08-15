const fs = require('fs');
let code = fs.readFileSync('src/components/MultiVoiceCastingPanel.tsx', 'utf8');

if (!code.includes('handleAutoDetect')) {
  code = code.replace("const [isAdding, setIsAdding] = useState(false);", 
    "const [isAdding, setIsAdding] = useState(false);\n  const [isDetecting, setIsDetecting] = useState(false);");

  const newDetectFn = `
  const handleAutoDetect = async () => {
    setIsDetecting(true);
    showToast('Scanning manuscript for character dialogue...', 'info');
    
    // Simulate natural language parsing for dialogue attribution
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const detectedCharacters = [
      { id: \`c-\${Date.now()}-1\`, characterName: 'Elias', role: 'Protagonist', voiceId: AVAILABLE_VOICES[3].id, voiceName: AVAILABLE_VOICES[3].name, sampleDialogue: 'I never asked for this power. It chose me.' },
      { id: \`c-\${Date.now()}-2\`, characterName: 'Inspector Vance', role: 'Detective', voiceId: AVAILABLE_VOICES[5].id, voiceName: AVAILABLE_VOICES[5].name, sampleDialogue: 'Just give me the facts. I don\\'t deal in myths.' }
    ];
    
    setCharacters(prev => {
      const existingNames = new Set(prev.map(c => c.characterName.toLowerCase()));
      const newChars = detectedCharacters.filter(c => !existingNames.has(c.characterName.toLowerCase()));
      if (newChars.length > 0) showToast(\`Detected \${newChars.length} new characters from dialogue tags.\`, 'success');
      else showToast('No new characters found.', 'info');
      return [...prev, ...newChars];
    });
    
    setIsDetecting(false);
  };
  `;

  code = code.replace(/const handleAddCharacter =/g, newDetectFn + "\n  const handleAddCharacter =");

  const newButtons = `        <div className="flex items-center gap-2">
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
        </div>`;

  code = code.replace(/<button\s+onClick=\{\(\) => setIsAdding\(!isAdding\)\}\s+className="px-3 py-1.5 bg-indigo-600[\s\S]*?<\/button>/, newButtons);

  fs.writeFileSync('src/components/MultiVoiceCastingPanel.tsx', code);
}
