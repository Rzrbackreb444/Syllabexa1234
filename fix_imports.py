import re

with open('src/components/ManuscriptEditor.tsx', 'r') as f:
    content = f.read()

# Replace any occurrence of BubbleMenu in the @tiptap/react import
content = re.sub(r"import\s*\{(.*?)\}\s*from\s*'@tiptap/react';", 
                 lambda m: "import {" + m.group(1).replace("BubbleMenu", "").replace("FloatingMenu", "").replace(", ,", ",").replace(",,", ",") + "} from '@tiptap/react';", 
                 content)

# Ensure BubbleMenu and FloatingMenu are imported from @tiptap/react/menus
if "'@tiptap/react/menus'" not in content:
    content = content.replace("from '@tiptap/react';", "from '@tiptap/react';\nimport { BubbleMenu, FloatingMenu } from '@tiptap/react/menus';")

with open('src/components/ManuscriptEditor.tsx', 'w') as f:
    f.write(content)

