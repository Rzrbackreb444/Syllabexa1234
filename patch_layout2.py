import re

with open('src/components/AppLayout.tsx', 'r') as f:
    content = f.read()

pattern = re.compile(r"\{\s*studioView === 'quick-start' \? \([\s\S]*?\}\)\s*\}\s*</div", re.MULTILINE)
replacement = "<Outlet />\n      </div"

content = pattern.sub(replacement, content)

with open('src/components/AppLayout.tsx', 'w') as f:
    f.write(content)

