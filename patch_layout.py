import re

with open('src/components/AppLayout.tsx', 'r') as f:
    content = f.read()

content = content.replace("export default function App() {", "import { Outlet, useNavigate, useLocation } from 'react-router-dom';\nexport default function AppLayout() {")

state_regex = re.compile(r"const\s+\[studioView,\s*setStudioView\]\s*=\s*useState<[^>]*>\([^)]*\);")
replacement = """
  const navigate = useNavigate();
  const location = useLocation();
  const studioView = location.pathname === '/' ? 'quick-start' : location.pathname.substring(1);
  const setStudioView = (view: string) => {
    if (view === 'quick-start') navigate('/');
    else if (view === 'editor') navigate('/editor');
    else if (view === 'syllabexa-typesetter') navigate('/typesetter');
    else if (view === 'syllabexa-visual-studio') navigate('/visual-studio');
    else if (view === 'course-workbook') navigate('/courses');
    else if (view === 'syllabexa-voice') navigate('/voice');
    else if (view === 'syllabexa-puzzle') navigate('/puzzles');
    else navigate('/' + view.replace('syllabexa-', ''));
  };
"""

content = state_regex.sub(replacement, content)

view_render_regex = re.compile(r"\{\s*studioView === 'quick-start' \? \([\s\S]*?\}\)\s*\}\s*</div", re.MULTILINE)
outlet_replacement = "<Outlet />\n      </div"

content = view_render_regex.sub(outlet_replacement, content)

with open('src/components/AppLayout.tsx', 'w') as f:
    f.write(content)

