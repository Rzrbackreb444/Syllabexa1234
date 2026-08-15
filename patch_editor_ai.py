import re

with open('src/components/ManuscriptEditor.tsx', 'r') as f:
    content = f.read()

# Add AI trigger
trigger_regex = re.compile(r"const triggerGhostwriter = \(\) => \{[\s\S]*?setIsGhostwriting\(false\);\n      \}\);\n    \}, 3000\);\n  \};")
replacement_trigger = """const triggerGhostwriter = async () => {
    if (!editor || !aiPrompt) return;
    setIsGhostwriting(true);
    
    try {
      const response = await fetch('/api/syllabexa/studio-edit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: editor.getText(),
          prompt: aiPrompt,
          mode: 'ghostwrite',
          toneStyle: 'professional',
          depth: 'deep'
        })
      });
      
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      
      if (data.content) {
        editor.commands.insertContent('<p><strong>[Ghostwriter]:</strong> ' + data.content + '</p>');
      }
    } catch (e) {
      console.error("AI Ghostwriter Error:", e);
      editor.commands.insertContent('<p><strong>[Ghostwriter Error]:</strong> Unable to connect to Syllabexa AI.</p>');
    } finally {
      setIsGhostwriting(false);
      setAiPrompt('');
    }
  };"""

content = trigger_regex.sub(replacement_trigger, content)

with open('src/components/ManuscriptEditor.tsx', 'w') as f:
    f.write(content)

