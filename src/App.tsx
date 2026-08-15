import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './lib/AuthContext'; // The file I gave you previously
import AppLayout from './AppLayout'; // Your dark mode shell wrapping the sidebar and header
import { SubdomainRouter } from './components/SubdomainRouter';
import { ErrorBoundary } from './components/ErrorBoundary';
import { WorkspaceController } from './components/WorkspaceController';

// Marketing Pages
import MarketingLanding from './components/MarketingLanding';
import SyllabexaBlogHub from './components/SyllabexaBlogHub';
import SyllabexaBlogPost from './components/SyllabexaBlogPost';
import PrivacyPolicy from './components/PrivacyPolicy';
import TermsOfService from './components/TermsOfService';

// Private App Pages
import DashboardHub from './components/QuickStartDashboard';
import EditorWorkspace from './components/EditorWorkspace';
import TypesetterSimulator from './components/TypesetterSimulator';
import SyllabexaVisualStudio from './components/SyllabexaVisualStudio';
import CourseWorkbookStudio from './components/CourseWorkbookStudio';
import VoiceStudio from './components/VoiceStudio';
import SyllabexaBilling from './components/SyllabexaBilling';
import SyllabexaAuth from './components/SyllabexaAuth';
import GoogleWorkspaceHub from './components/GoogleWorkspaceHub';
import SyllabexaMultiModelPipeline from './components/SyllabexaMultiModelPipeline';
import MarketingContentEngine from './components/MarketingContentEngine';
import BookThemeBuilder from './components/BookThemeBuilder';
import SyllabexaCommerceEngine from './components/SyllabexaCommerceEngine';

// --- THE IRON-CLAD GATEKEEPER ---
// This wrapper forces users to log in and have a 'pro' subscription before accessing the tools.
const ProtectedProRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isPro, loading } = useAuth();
  
  if (loading) {
    return <div className="h-screen w-screen flex items-center justify-center bg-[#050505] text-slate-400 font-mono text-sm">VERIFYING ENCRYPTION KEYS...</div>;
  }
  
  if (!user) {
    return <Navigate to="/login" replace />; // Route to your Firebase login page
  }
  
  if (!isPro) {
    // They are logged in, but haven't paid. Trap them in billing.
    return <Navigate to="/app/billing" replace />; 
  }

  return <>{children}</>;
};

const ProtectedAuthRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="h-screen w-screen flex items-center justify-center bg-[#050505] text-slate-400 font-mono text-sm">VERIFYING ENCRYPTION KEYS...</div>;
  }
  
  if (!user) {
    return <Navigate to="/login" replace />; 
  }

  return <>{children}</>;
};

// Login wrapper to handle navigation on completion
const LoginWrapper = () => {
  return <SyllabexaAuth onAuthComplete={() => window.location.href = '/app'} />;
};

export default function App() {
  return (
    <ErrorBoundary>
      <WorkspaceController>
        <AuthProvider>
          <BrowserRouter>
            <SubdomainRouter />
            <Routes>
              
              {/* PUBLIC MARKETING FUNNEL (Unprotected, SEO Indexed) */}
              <Route path="/" element={<MarketingLanding />} />
              <Route path="/privacy" element={<PrivacyPolicy />} />
              <Route path="/terms" element={<TermsOfService />} />
              <Route path="/blog" element={<SyllabexaBlogHub />} />
              <Route path="/blog/:slug" element={<SyllabexaBlogPost />} />
              <Route path="/login" element={<LoginWrapper />} />
              
              {/* SECURE APPLICATION SHELL (Protected) */}
              <Route path="/app" element={<AppLayout />}>
                
                {/* The Billing Page is inside the app, requires login but not Pro status */}
                <Route path="billing" element={<ProtectedAuthRoute><SyllabexaBilling /></ProtectedAuthRoute>} />
                
                {/* --- LOCKED PREMIUM LITERARY STUDIOS --- */}
                <Route index element={<ProtectedProRoute><DashboardHub /></ProtectedProRoute>} />
                <Route path="editor" element={<ProtectedProRoute><EditorWorkspace /></ProtectedProRoute>} />
                <Route path="typesetter" element={<ProtectedProRoute><TypesetterSimulator /></ProtectedProRoute>} />
                <Route path="visual-studio" element={<ProtectedProRoute><SyllabexaVisualStudio /></ProtectedProRoute>} />
                <Route path="courses" element={<ProtectedProRoute><CourseWorkbookStudio /></ProtectedProRoute>} />
                <Route path="voice" element={<ProtectedProRoute><VoiceStudio /></ProtectedProRoute>} />
                <Route path="workspace" element={<ProtectedProRoute><GoogleWorkspaceHub /></ProtectedProRoute>} />
                <Route path="pipeline" element={<ProtectedProRoute><SyllabexaMultiModelPipeline /></ProtectedProRoute>} />
                <Route path="marketing-engine" element={<ProtectedProRoute><MarketingContentEngine /></ProtectedProRoute>} />
                <Route path="theme-builder" element={<ProtectedProRoute><BookThemeBuilder /></ProtectedProRoute>} />
                <Route path="commerce" element={<ProtectedProRoute><SyllabexaCommerceEngine /></ProtectedProRoute>} />
                
                {/* Catch-all redirect back to hub */}
                <Route path="*" element={<Navigate to="/app" replace />} />
              </Route>
              
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </WorkspaceController>
    </ErrorBoundary>
  );
}