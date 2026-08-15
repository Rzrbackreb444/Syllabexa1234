import re

with open('src/components/ManuscriptEditor.tsx', 'r') as f:
    content = f.read()

# Replace basic StarterKit with collaboration extensions
imports_regex = re.compile(r"(import StarterKit from '@tiptap/starter-kit';)")
replacement_imports = """import StarterKit from '@tiptap/starter-kit';
import Collaboration from '@tiptap/extension-collaboration';
import CollaborationCursor from '@tiptap/extension-collaboration-cursor';
import { useCollaborationSync } from '../utils/collaborationSync';
import { useManuscriptStore } from '../store/manuscriptStore';
"""
content = imports_regex.sub(replacement_imports, content)

# Inject collaboration hook inside component
hook_regex = re.compile(r"(const \[isGhostwriting, setIsGhostwriting\] = useState\(false\);)")
replacement_hook = """\\1
  
  const userProfile = { name: 'User_' + Math.floor(Math.random()*100), color: '#' + Math.floor(Math.random()*16777215).toString(16) };
  const { ydoc, provider, collaborators, syncStatus } = useCollaborationSync(chapterId, userProfile);
"""
content = hook_regex.sub(replacement_hook, content)

# Add collaboration extensions to Tiptap
editor_regex = re.compile(r"(CharacterCount\.configure\(\{ limit: 500000 \}\),)")
replacement_editor = """\\1
      ...(ydoc && provider ? [
        Collaboration.configure({ document: ydoc }),
        CollaborationCursor.configure({
          provider: provider,
          user: { name: userProfile.name, color: userProfile.color },
        }),
      ] : []),"""
content = editor_regex.sub(replacement_editor, content)

# Pass ydoc? undefined : initialContent
content = content.replace("content: initialContent,", "content: ydoc ? undefined : initialContent,")

# Update sync indicator
content = content.replace("<span className=\"text-[10px] font-mono text-slate-500 flex items-center gap-1.5 uppercase tracking-widest\">", """<span className="text-[10px] font-mono text-slate-500 flex items-center gap-1.5 uppercase tracking-widest">
              {syncStatus === 'connected' ? <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="CRDT Mesh Connected" /> : <div className="w-2 h-2 rounded-full bg-amber-500" />}""")

# Show remote cursors
content = content.replace("</div>\n        </header>", """</div>
          <div className="flex -space-x-2 mr-4">
            {collaborators.map((c, i) => (
              <div key={i} className="w-7 h-7 rounded-full border-2 border-[#12141a] flex items-center justify-center text-[10px] font-bold text-white shadow-sm" style={{ backgroundColor: c.color }} title={c.name}>
                {c.name.charAt(0)}
              </div>
            ))}
          </div>
        </header>""")

with open('src/components/ManuscriptEditor.tsx', 'w') as f:
    f.write(content)

