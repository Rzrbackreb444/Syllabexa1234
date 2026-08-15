import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

# Add AuthProvider import and ProRoute
new_imports_and_pro_route = """import { AuthProvider, useAuth } from './lib/AuthContext';

// A Higher-Order Component to protect Enterprise/Pro routes
const ProRoute = ({ children }: { children: React.ReactNode }) => {
  const { isPro, loading } = useAuth();
  if (loading) return <div className="flex h-screen items-center justify-center bg-[#07080a] text-slate-400 font-mono text-sm tracking-widest uppercase">Loading Secure Environment...</div>;
  if (!isPro) return <Navigate to="/billing" replace />;
  return <>{children}</>;
};

export default function App() {
"""

content = content.replace("export default function App() {", new_imports_and_pro_route)

# Wrap in AuthProvider
content = content.replace("<BrowserRouter>", "<AuthProvider>\n        <BrowserRouter>")
content = content.replace("</BrowserRouter>", "</BrowserRouter>\n      </AuthProvider>")

# Add ProRoute to specific routes
content = content.replace('element={<TypesetterSimulator />}', 'element={<ProRoute><TypesetterSimulator /></ProRoute>}')
content = content.replace('element={<VoiceStudio />}', 'element={<ProRoute><VoiceStudio /></ProRoute>}')
content = content.replace('element={<SyllabexaVisualStudio />}', 'element={<ProRoute><SyllabexaVisualStudio /></ProRoute>}')
content = content.replace('element={<PuzzleStudio />}', 'element={<ProRoute><PuzzleStudio /></ProRoute>}')

with open('src/App.tsx', 'w') as f:
    f.write(content)
