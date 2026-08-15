import re

with open('src/AppLayout.tsx', 'r') as f:
    content = f.read()

# Fix setStudioView to point to /app/...
content = content.replace(
"""  const setStudioView = (view: string) => {
    if (view === 'quick-start') navigate('/');
    else if (view === 'editor') navigate('/editor');
    else if (view === 'syllabexa-typesetter') navigate('/typesetter');
    else if (view === 'syllabexa-visual-studio') navigate('/visual-studio');
    else if (view === 'course-workbook') navigate('/courses');
    else if (view === 'syllabexa-voice') navigate('/voice');
    else if (view === 'syllabexa-puzzle') navigate('/puzzles');
    else navigate('/' + view.replace('syllabexa-', ''));
  };""",
"""  const setStudioView = (view: string) => {
    if (view === 'quick-start') navigate('/app');
    else if (view === 'editor') navigate('/app/editor');
    else if (view === 'syllabexa-typesetter') navigate('/app/typesetter');
    else if (view === 'syllabexa-visual-studio') navigate('/app/visual-studio');
    else if (view === 'course-workbook') navigate('/app/courses');
    else if (view === 'syllabexa-voice') navigate('/app/voice');
    else if (view === 'syllabexa-puzzle') navigate('/app/puzzles');
    else navigate('/app/' + view.replace('syllabexa-', ''));
  };"""
)

# And fix the profile dropdown billing link
content = content.replace("navigate('/billing');", "navigate('/app/billing');")

# Also fix the studioView active check
content = content.replace(
    "const studioView = location.pathname === '/' ? 'quick-start' : location.pathname.substring(1);",
    "const studioView = location.pathname === '/app' ? 'quick-start' : location.pathname.replace('/app/', '');"
)

with open('src/AppLayout.tsx', 'w') as f:
    f.write(content)
