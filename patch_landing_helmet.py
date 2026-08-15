import re

with open('src/components/SyllabexaLandingPage.tsx', 'r') as f:
    content = f.read()

if 'import { Helmet }' not in content:
    content = "import { Helmet } from 'react-helmet-async';\n" + content

helmet_tag = """
      <Helmet>
        <title>Syllabexa | AI Ghostwriting & Autonomous Book Publishing</title>
        <meta name="description" content="Scale your publishing house with Syllabexa. Train Neural Voice Profiles, deploy Book Autopilots, and manage multi-client CRDT collaboration for ghostwriting agencies." />
        <meta name="keywords" content="AI Ghostwriting, Neural Voice Training, Autopilot Publishing, Book Generation, Syllabexa, Puzzle Generator" />
        <link rel="canonical" href="https://syllabexa.com/" />
      </Helmet>
"""

content = content.replace("<div className=\"min-h-screen bg-[#07080a] text-slate-200 font-sans selection:bg-indigo-500/30 overflow-x-hidden\">", 
                          "<div className=\"min-h-screen bg-[#07080a] text-slate-200 font-sans selection:bg-indigo-500/30 overflow-x-hidden\">" + helmet_tag)

with open('src/components/SyllabexaLandingPage.tsx', 'w') as f:
    f.write(content)
