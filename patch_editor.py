import re

with open('src/components/ManuscriptEditor.tsx', 'r') as f:
    content = f.read()

imports = """import Collaboration from '@tiptap/extension-collaboration';
import CollaborationCursor from '@tiptap/extension-collaboration-cursor';
import { useCollaborationSync } from '../utils/useCollaborationSync';
"""

content = content.replace("import StarterKit from '@tiptap/starter-kit';", imports + "import StarterKit from '@tiptap/starter-kit';")

editor_init_regex = re.compile(r"(const editor = useEditor\(\{)")
replacement_editor = """
  const { ydoc, provider, collaborators } = useCollaborationSync(chapterId, { name: 'User_' + Math.floor(Math.random()*100), color: '#' + Math.floor(Math.random()*16777215).toString(16) });

  const editor = useEditor({
"""

content = editor_init_regex.sub(replacement_editor, content)

extensions_regex = re.compile(r"(CharacterCount\.configure\(\{[\s\S]*?limit: 100000,\s*\}\),)")
replacement_ext = """\\1
      ...(ydoc && provider ? [
        Collaboration.configure({
          document: ydoc,
        }),
        CollaborationCursor.configure({
          provider: provider,
          user: {
            name: 'Me',
            color: '#f783ac',
          },
        }),
      ] : []),"""

content = extensions_regex.sub(replacement_ext, content)

# Remove `content: initialContent,` if we are using Yjs to avoid overwriting remote content immediately.
# Actually, wait. It's safe to keep it, but it's better to pass it to Tiptap cautiously, or better:
content = content.replace("content: initialContent,", "content: ydoc ? undefined : initialContent,")

with open('src/components/ManuscriptEditor.tsx', 'w') as f:
    f.write(content)

