import re

with open('src/components/ManuscriptEditor.tsx', 'r') as f:
    content = f.read()

# Wait for provider before rendering editor content
content = content.replace("return (", "if (!provider) return <div className=\"p-10 flex items-center justify-center\"><Loader2 className=\"animate-spin\" /></div>;\n\n  return (")

with open('src/components/ManuscriptEditor.tsx', 'w') as f:
    f.write(content)

