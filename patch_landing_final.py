import re

with open('src/components/SyllabexaLandingPage.tsx', 'r') as f:
    content = f.read()

helmet_tag = """
      <Helmet>
        <title>Syllabexa | AI Ghostwriting & Autonomous Book Publishing</title>
        <meta name="description" content="Scale your publishing house with Syllabexa. Train Neural Voice Profiles, deploy Book Autopilots, and manage multi-client CRDT collaboration for ghostwriting agencies." />
        <meta name="keywords" content="AI Ghostwriting, Neural Voice Training, Autopilot Publishing, Book Generation, Syllabexa, Puzzle Generator" />
        <link rel="canonical" href="https://syllabexa.com/" />
      </Helmet>
"""

if 'import { Helmet }' not in content:
    content = "import { Helmet } from 'react-helmet-async';\n" + content

# Replace return ( \n <aside...
content = content.replace(
    '''  return (
    <aside aria-label="Syllabexa Landing Page"''',
    '''  return (
    <aside aria-label="Syllabexa Landing Page"'''
)

# wait actually we need a parent container to hold helmet and aside or we can just put helmet inside aside
content = content.replace(
    '<aside aria-label="Syllabexa Landing Page" className="flex-1 overflow-y-auto bg-slate-50 text-slate-800 custom-scrollbar">',
    '<aside aria-label="Syllabexa Landing Page" className="flex-1 overflow-y-auto bg-slate-50 text-slate-800 custom-scrollbar">' + helmet_tag
)

# And add the blog link at the top nav somewhere
nav = """        <div className="absolute top-6 left-6 z-50">
          <Link to="/blog" className="px-4 py-2 bg-indigo-600/20 text-indigo-300 rounded-full font-mono text-xs uppercase tracking-widest hover:bg-indigo-600/40 transition-colors border border-indigo-500/30">EEAT Blog Insights</Link>
        </div>"""

content = content.replace(
    '<div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(99,102,241,0.18),rgba(255,255,255,0))]"></div>',
    '<div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(99,102,241,0.18),rgba(255,255,255,0))]"></div>\n' + nav
)

with open('src/components/SyllabexaLandingPage.tsx', 'w') as f:
    f.write(content)
