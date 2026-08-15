import re

with open('src/components/SyllabexaLandingPage.tsx', 'r') as f:
    content = f.read()

# Add a Link wrapper around the navigation
content = "import { Link } from 'react-router-dom';\n" + content

# Fix the navigation header to include a blog link
content = content.replace(
    '''<nav className="flex items-center justify-between p-6">
          <div className="flex items-center gap-2">''',
    '''<nav className="flex items-center justify-between p-6">
          <div className="flex items-center gap-2">'''
)

nav_links = '''<div className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-300">
            <Link to="/blog" className="hover:text-white transition-colors">EEAT Insights</Link>
            <button onClick={() => setActiveTab('landing')} className="hover:text-white transition-colors">Features</button>
            <button onClick={() => setActiveTab('pricing')} className="hover:text-white transition-colors">Pricing</button>
          </div>'''

content = content.replace(
    '''<div className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-300">
            <button onClick={() => setActiveTab('landing')} className="hover:text-white transition-colors">Features</button>
            <button onClick={() => setActiveTab('pricing')} className="hover:text-white transition-colors">Pricing</button>
          </div>''',
    nav_links
)

# If 'pricing' tab wasn't there before, let's just forcefully replace the entire block
if 'hidden md:flex items-center gap-8 text-sm font-semibold text-slate-300' not in content:
    content = content.replace(
        '''<nav className="flex items-center justify-between p-6">''',
        '''<nav className="flex items-center justify-between p-6">
          <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-300 ml-12">
            <Link to="/blog" className="hover:text-white transition-colors font-mono uppercase tracking-widest text-xs">EEAT Blog</Link>
          </div>'''
    )


with open('src/components/SyllabexaLandingPage.tsx', 'w') as f:
    f.write(content)
