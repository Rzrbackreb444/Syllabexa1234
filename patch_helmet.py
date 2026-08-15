import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

content = "import { HelmetProvider } from 'react-helmet-async';\n" + content

content = content.replace("<ErrorBoundary>", "<HelmetProvider>\n    <ErrorBoundary>")
content = content.replace("</ErrorBoundary>", "</ErrorBoundary>\n    </HelmetProvider>")

with open('src/App.tsx', 'w') as f:
    f.write(content)
