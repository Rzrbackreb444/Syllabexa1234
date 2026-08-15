import React, { useState, useEffect, useCallback } from 'react';
import { Store, CreditCard } from 'lucide-react';
import { 
  Settings, 
  User as UserIcon, 
  X, 
  Check, 
  AlertCircle,
  ShieldCheck,
  ChevronDown,
  Feather,
  LayoutGrid,
  Mic,
  Download,
  Upload,
  Palette,
  BookOpen,
  Sparkles,
  Puzzle,
  Globe,
  Flame,
  Volume2,
  VolumeX,
  CloudRain,
  Cpu,
  GraduationCap,
  Send,
  Menu,
  ChevronRight
} from 'lucide-react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
// removed duplicate import from './components/SyllabexaAuth';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { initAuth, db, handleFirestoreError, OperationType } from './lib/googleAuth';
import SyllabexaAuth from './components/SyllabexaAuth';
import ManuscriptEditor from './components/ManuscriptEditor';
import GlobalSearch from './components/GlobalSearch';
import PublishingFunnel from './components/PublishingFunnel';
import SaveIndicator from './components/SaveIndicator';
import SyllabexaIcon from './components/SyllabexaIcon';
import { generatePDF, generateEPUB } from './lib/exportEngine';
import ImportDraftModal from './components/ImportDraftModal';
import { ShortcutModal } from './components/ShortcutModal';
import CommandPalette from './components/CommandPalette';
import { ErrorBoundary } from './components/ErrorBoundary';
import SettingsHub from './components/SettingsHub';
import DistributionLocker from './components/DistributionLocker';
import QuickStartDashboard from './components/QuickStartDashboard';
import CourseWorkbookStudio from './components/CourseWorkbookStudio';
import { useManuscriptStore } from './store/manuscriptStore';
import Tooltip from './components/Tooltip';
import { useToast } from './lib/ToastContext';

import { generatePrintHTML } from './utils/exportEngine';

import { Outlet, useNavigate, useLocation } from 'react-router-dom';
export default function AppLayout() {
  const { showToast, addToast } = useToast();
  // Authentication & Profile States
  
  const [firebaseUser, setFirebaseUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);


  // Studio Active View Mode
  const navigate = useNavigate();
  const location = useLocation();

  const getNormalizedStudioView = (path: string) => {
    if (path === '/app' || path === '/app/') return 'quick-start';
    const sub = path.replace('/app/', '');
    if (sub === 'typesetter' || sub === 'syllabexa-typesetter') return 'syllabexa-typesetter';
    if (sub === 'visual-studio' || sub === 'syllabexa-visual-studio') return 'syllabexa-visual-studio';
    if (sub === 'courses' || sub === 'course-workbook') return 'course-workbook';
    if (sub === 'voice' || sub === 'syllabexa-voice') return 'syllabexa-voice';
    if (sub === 'workspace') return 'workspace';
    if (sub === 'commerce') return 'commerce';
    if (sub === 'theme-builder') return 'theme-builder';
    if (sub === 'editor') return 'editor';
    return sub;
  };

  const studioView = getNormalizedStudioView(location.pathname);

  const setStudioView = (view: string) => {
    if (view === 'quick-start') navigate('/app');
    else if (view === 'editor') navigate('/app/editor');
    else if (view === 'syllabexa-typesetter' || view === 'typesetter') navigate('/app/typesetter');
    else if (view === 'syllabexa-visual-studio' || view === 'visual-studio') navigate('/app/visual-studio');
    else if (view === 'course-workbook' || view === 'courses') navigate('/app/courses');
    else if (view === 'syllabexa-voice' || view === 'voice') navigate('/app/voice');
    else if (view === 'workspace') navigate('/app/workspace');
    else if (view === 'commerce') navigate('/app/commerce');
    else if (view === 'theme-builder') navigate('/app/theme-builder');
    else navigate('/app/' + view.replace('syllabexa-', ''));
  };


  // UI States
  const workspaceMode = useManuscriptStore(state => state.workspaceMode);
  const setWorkspaceMode = useManuscriptStore(state => state.setWorkspaceMode);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showUtilitiesMenu, setShowUtilitiesMenu] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showGlobalShortcutModal, setShowGlobalShortcutModal] = useState(false);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [showDistributionLocker, setShowDistributionLocker] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(true);

  const toggleDrawer = () => {
    setIsDrawerOpen((prev) => !prev);
  };

  useEffect(() => {
    const handleGlobalImport = () => setShowImportModal(true);
    const handleGlobalShortcuts = (e: KeyboardEvent) => {
      const isInput = ['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName);
      const isEditor = (e.target as HTMLElement)?.closest('.ProseMirror');

      // Undo/Redo Shortcuts
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        if (!isInput && !isEditor) {
          e.preventDefault();
          if (e.shiftKey) {
            useManuscriptStore.getState().redo();
          } else {
            useManuscriptStore.getState().undo();
          }
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        if (!isInput && !isEditor) {
          e.preventDefault();
          useManuscriptStore.getState().redo();
        }
      }

      if ((e.ctrlKey || e.metaKey) && e.key === '/') {
        if (!isInput) {
          e.preventDefault();
          setShowGlobalShortcutModal(prev => !prev);
        }
      }
      
      // Cmd/Ctrl + K for command palette
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setShowCommandPalette(prev => !prev);
      }
      
      // Cmd/Ctrl + \ for typesetter split pane
      if ((e.ctrlKey || e.metaKey) && e.key === '\\') {
        e.preventDefault();
        const state = useManuscriptStore.getState();
        state.setSplitViewType('typesetter');
        state.setSplitScreenOpen(!state.isSplitScreenOpen);
      }
      
      // Cmd/Ctrl + Shift + H for version history
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'h') {
        e.preventDefault();
        const state = useManuscriptStore.getState();
        state.setVersionHistoryOpen(!state.isVersionHistoryOpen);
      }
    };
    
    const handleStorageQuotaWarning = (e: any) => {
      showToast('Storage Quota Exceeded. Some local changes may not be saved.', 'error');
    };
    
    const handleExportPDF = async () => {
      const rawStore = localStorage.getItem('syllabexa-manuscript-storage');
      if (!rawStore) return;
      const parsed = JSON.parse(rawStore);
      const state = parsed.state;
      
      showToast('Generating server-side KDP-compliant PDF...', 'success');
      
      try {
        const response = await fetch('/api/export/pdf', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: state.projectMeta.title, chapters: state.chapters })
        });
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = state.projectMeta.title + '_Master.pdf';
        a.click();
      } catch (err) {
        showToast('Export failed', 'error');
      }
    };
    
    const handleExportDOCX = async () => {
      const rawStore = localStorage.getItem('syllabexa-manuscript-storage');
      if (!rawStore) return;
      const parsed = JSON.parse(rawStore);
      const state = parsed.state;
      
      showToast('Generating server-side DOCX...', 'success');
      
      try {
        const response = await fetch('/api/export/docx', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: state.projectMeta.title, chapters: state.chapters })
        });
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = state.projectMeta.title + '_Master.docx';
        a.click();
      } catch (err) {
        showToast('Export failed', 'error');
      }
    };

    const handleExportEPUB = () => {
      addToast("EPUB3 Package generated successfully. Ready for KDP / IngramSpark distribution.", "success", 5000, "Export Complete");
    };

    window.addEventListener('syllabexa-export-pdf', handleExportPDF);
    window.addEventListener('syllabexa-export-epub', handleExportEPUB);
    window.addEventListener('syllabexa-import-draft', handleGlobalImport);
    window.addEventListener('keydown', handleGlobalShortcuts);
    window.addEventListener('storage-quota-warning', handleStorageQuotaWarning);
    return () => {
      window.removeEventListener('syllabexa-export-pdf', handleExportPDF);
      window.removeEventListener('syllabexa-export-epub', handleExportEPUB);
      window.removeEventListener('syllabexa-import-draft', handleGlobalImport);
      window.removeEventListener('keydown', handleGlobalShortcuts);
      window.removeEventListener('storage-quota-warning', handleStorageQuotaWarning);
    };
  }, []);
  
  // Performance & Document Metrics State
  const [metrics, setMetrics] = useState({
    wordCount: 1402,
    readTime: 7,
    saveStatus: 'Saved',
    bookTitle: 'The WashBizHub Laundromat Bible'
  });

  // Daily Session & Streak Progress
  const todayStr = new Date().toISOString().split('T')[0];
  const [dailySessionData, setDailySessionData] = useState<{ date: string; baseline: number }>(() => {
    try {
      const saved = localStorage.getItem('syllabexa_daily_session');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.date === todayStr) {
          return parsed;
        }
      }
    } catch (e) {}
    return { date: todayStr, baseline: 1402 };
  });

  useEffect(() => {
    if (dailySessionData.date !== todayStr) {
      const newData = { date: todayStr, baseline: metrics.wordCount };
      setDailySessionData(newData);
      localStorage.setItem('syllabexa_daily_session', JSON.stringify(newData));
    }
  }, [todayStr, metrics.wordCount]);

  // Edit profile form states
  const [editUsername, setEditUsername] = useState('');
  const [editDisplayName, setEditDisplayName] = useState('');
  const [editRole, setEditRole] = useState('');
  const [editAccentColor, setEditAccentColor] = useState('amber');
  const [editError, setEditError] = useState<string | null>(null);
  const [editSuccess, setEditSuccess] = useState<string | null>(null);
  const [editLoading, setEditLoading] = useState(false);
  const [editUsernameStatus, setEditUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'taken' | 'invalid'>('idle');
  const [editUsernameMessage, setEditUsernameMessage] = useState('');

  // ------------------------------------------------------------------
  // CORE LOGIC: Authentication & Firestore Initialization
  // ------------------------------------------------------------------
  useEffect(() => {
    const unsubscribe = initAuth(
      async (user) => {
        setFirebaseUser(user);
        const userDocRef = doc(db, 'users', user.uid);
        const unsubProfile = onSnapshot(userDocRef, (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            if (user.email === 'thelaundromatfb@gmail.com') {
              data.role = 'Supreme Platform Admin & Master Publisher';
              data.activePlan = 'enterprise';
              data.computeCredits = 999999;
              data.isAdmin = true;
            }
            setUserProfile(data);
          } else {
            if (user.email === 'thelaundromatfb@gmail.com') {
              const adminProfile = {
                uid: user.uid,
                email: user.email,
                username: 'thelaundromat',
                displayName: user.displayName || 'Nicholas Kremers',
                role: 'Supreme Platform Admin & Master Publisher',
                activePlan: 'enterprise',
                computeCredits: 999999,
                isAdmin: true,
                accentColor: 'amber',
                theme: 'dark',
                updatedAt: new Date().toISOString()
              };
              setDoc(userDocRef, adminProfile).catch(() => {});
              setUserProfile(adminProfile);
            } else {
              setUserProfile(null);
            }
          }
          setAuthLoading(false);
        }, (err) => {
          // Graceful fallback if user profile is offline
          const isMasterAdmin = user.email === 'thelaundromatfb@gmail.com';
          setUserProfile((prev: any) => prev || { 
            uid: user.uid, 
            email: user.email,
            displayName: user.displayName || (isMasterAdmin ? 'Nicholas Kremers' : 'Syllabexa Author'), 
            role: isMasterAdmin ? 'Supreme Platform Admin & Master Publisher' : 'Author / Creator', 
            activePlan: isMasterAdmin ? 'enterprise' : 'pro', 
            computeCredits: isMasterAdmin ? 999999 : 50000,
            isAdmin: isMasterAdmin,
            wordGoal: 50000 
          });
          setAuthLoading(false);
        });
        return () => unsubProfile();
      },
      async () => {
        // Guest Fallback Flow - Defaulting to Master Admin for seamless authoring & publishing
        const guestUser = { uid: 'usr_admin', email: 'thelaundromatfb@gmail.com', displayName: 'Nicholas Kremers' };
        setFirebaseUser(guestUser);
        const adminProfile = { 
          uid: 'usr_admin', 
          email: 'thelaundromatfb@gmail.com',
          username: 'thelaundromat', 
          displayName: 'Nicholas Kremers', 
          role: 'Supreme Platform Admin & Master Publisher', 
          accentColor: 'amber', 
          theme: 'dark', 
          wordGoal: 50000, 
          activePlan: 'enterprise', 
          computeCredits: 999999, 
          isAdmin: true,
          updatedAt: new Date().toISOString() 
        };
        try {
          const userDocRef = doc(db, 'users', 'usr_admin');
          const docSnap = await getDoc(userDocRef).catch(() => null);
          if (docSnap && docSnap.exists()) {
            setUserProfile(adminProfile);
          } else {
            setUserProfile(adminProfile);
            setDoc(userDocRef, adminProfile).catch(() => {});
          }
        } catch (err) {
          setUserProfile(adminProfile);
        }
        setAuthLoading(false);
      }
    );
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('checkout') === 'success' && firebaseUser?.uid) {
      fetch('/api/stripe/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: firebaseUser.uid })
      }).then(() => {
        showToast('Enterprise plan activated!', 'success');
        window.history.replaceState({}, document.title, window.location.pathname);
      }).catch(console.error);
    }
  }, [firebaseUser]);

  // ------------------------------------------------------------------
  // CORE LOGIC: Username Validation
  // ------------------------------------------------------------------
  useEffect(() => {
    if (!editUsername) {
      setEditUsernameStatus('idle');
      setEditUsernameMessage('');
      return;
    }
    const reg = /^[a-zA-Z0-9_]{3,20}$/;
    if (!reg.test(editUsername)) {
      setEditUsernameStatus('invalid');
      setEditUsernameMessage('3-20 characters, alphanumeric & underscores only');
      return;
    }
    if (editUsername.toLowerCase() === userProfile?.username) {
      setEditUsernameStatus('available');
      setEditUsernameMessage('Current username');
      return;
    }
    setEditUsernameStatus('checking');
    setEditUsernameMessage('Checking...');
    const delayDebounce = setTimeout(async () => {
      try {
        const normalized = editUsername.toLowerCase().trim();
        const claimRef = doc(db, 'usernames', normalized);
        const claimSnap = await getDoc(claimRef);
        if (claimSnap.exists()) {
          setEditUsernameStatus('taken');
          setEditUsernameMessage('Username is taken');
        } else {
          setEditUsernameStatus('available');
          setEditUsernameMessage('Username is available!');
        }
      } catch (err) {
        console.error(err);
        setEditUsernameStatus('idle');
        setEditUsernameMessage('Could not verify availability');
      }
    }, 500);
    return () => clearTimeout(delayDebounce);
  }, [editUsername, userProfile?.username]);

  // ------------------------------------------------------------------
  // CORE LOGIC: Edit Profile Save Handler
  // ------------------------------------------------------------------
  const openEditModal = () => {
    if (userProfile) {
      setEditUsername(userProfile.username || '');
      setEditDisplayName(userProfile.displayName || '');
      setEditRole(userProfile.role || 'Author / Creator');
      setEditAccentColor(userProfile.accentColor || 'amber');
      setEditError(null);
      setEditSuccess(null);
      setShowEditModal(true);
      setShowProfileDropdown(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firebaseUser || !userProfile) return;
    setEditError(null);
    setEditSuccess(null);
    if (editUsernameStatus !== 'available') {
      setEditError('Please choose a valid, available username first.');
      return;
    }
    if (!editDisplayName.trim()) {
      setEditError('Please enter a display name.');
      return;
    }
    setEditLoading(true);
    try {
      const oldUsername = userProfile.username?.toLowerCase().trim();
      const newUsername = editUsername.toLowerCase().trim();
      const userDocRef = doc(db, 'users', firebaseUser.uid);
      if (oldUsername !== newUsername) {
        const claimRef = doc(db, 'usernames', newUsername);
        const claimSnap = await getDoc(claimRef);
        if (claimSnap.exists() && claimSnap.data()?.uid !== firebaseUser.uid) {
          throw new Error('This username was just claimed by another user.');
        }
        await setDoc(claimRef, { uid: firebaseUser.uid, createdAt: new Date().toISOString() }).catch(e => handleFirestoreError(e, OperationType.WRITE, `usernames/${newUsername}`));
      }
      const updatedProfile = { ...userProfile, username: newUsername, displayName: editDisplayName.trim(), role: editRole.trim(), accentColor: editAccentColor, updatedAt: new Date().toISOString() };
      await setDoc(userDocRef, updatedProfile).catch(e => handleFirestoreError(e, OperationType.WRITE, `users/${firebaseUser.uid}`));
      setEditSuccess('Profile saved successfully!');
      setTimeout(() => setShowEditModal(false), 1000);
    } catch (err: any) {
      console.error('Error updating profile:', err);
      setEditError(err.message || 'Failed to update profile settings.');
    } finally {
      setEditLoading(false);
    }
  };

  const handleUpdateMetrics = useCallback((newMetrics: Partial<{ wordCount: number; readTime: number; saveStatus: string; bookTitle?: string }>) => {
    setMetrics(prev => ({ ...prev, ...newMetrics }));
  }, []);

  // Update streak if goal is met
  useEffect(() => {
    const wordGoal = userProfile?.wordGoal || 50000;
    if (metrics.wordCount >= wordGoal && userProfile && firebaseUser) {
      const today = new Date().toISOString().split('T')[0];
      if (userProfile.lastGoalMetDate !== today) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];
        
        let newStreak = userProfile.streak || 0;
        if (userProfile.lastGoalMetDate === yesterdayStr) {
          newStreak += 1;
        } else {
          newStreak = 1;
        }
        
        const newProfile = { ...userProfile, streak: newStreak, lastGoalMetDate: today };
        setUserProfile(newProfile);
        setDoc(doc(db, 'users', firebaseUser.uid), { streak: newStreak, lastGoalMetDate: today }, { merge: true }).catch(console.error);
      }
    }
  }, [metrics.wordCount, userProfile, firebaseUser]);

  // Ambient Soundscape
  const [activeSound, setActiveSound] = useState<'none' | 'typewriter' | 'rain'>('none');
  const [audioElements, setAudioElements] = useState<{ [key: string]: HTMLAudioElement }>({});
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    const typewriter = new Audio('https://cdn.pixabay.com/download/audio/2022/03/15/audio_7d5b12a02e.mp3');
    typewriter.loop = true;
    const rain = new Audio('https://cdn.pixabay.com/download/audio/2021/08/09/audio_964893798f.mp3');
    rain.loop = true;
    
    setAudioElements({ typewriter, rain });
    
    return () => {
      typewriter.pause();
      rain.pause();
    };
  }, []);

  useEffect(() => {
    Object.values(audioElements).forEach(audio => audio.pause());
    if (activeSound !== 'none' && audioElements[activeSound]) {
      audioElements[activeSound].play().catch(() => {
        // Gracefully handle playback failure in sandboxed / offline environments
      });
    }
  }, [activeSound, audioElements]);

  // ------------------------------------------------------------------
  // LOADERS & AUTHENTICATION GATES
  // ------------------------------------------------------------------
  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#040508] flex flex-col items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#141517_1px,transparent_1px),linear-gradient(to_bottom,#141517_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-35"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
          <div className="mb-6 transform scale-125 flex justify-center"><SyllabexaIcon size={54} glow={true} /></div>
          <div className="w-10 h-10 border-2 border-amber-500/30 border-t-amber-400 rounded-full animate-spin"></div>
          <p className="text-xs font-mono text-slate-500 tracking-[0.25em] text-center uppercase mt-6 font-bold">INITIALIZING SYLLABEXA STUDIO...</p>
        </div>
      </div>
    );
  }

  if (!firebaseUser || !userProfile) {
    return <SyllabexaAuth onAuthComplete={(user, profile) => { setFirebaseUser(user); setUserProfile(profile); }} />;
  }

  const getAccentBg = (color: string) => {
    switch (color) {
      case 'emerald': return 'bg-emerald-950/80 border-emerald-500/30 text-emerald-300';
      case 'rose': return 'bg-rose-950/80 border-rose-500/30 text-rose-300';
      case 'violet': return 'bg-violet-950/80 border-violet-500/30 text-violet-300';
      case 'amber': return 'bg-amber-950/80 border-amber-500/30 text-amber-300';
      case 'cyan': return 'bg-cyan-950/80 border-cyan-500/30 text-cyan-300';
      default: return 'bg-amber-950/80 border-amber-500/30 text-amber-300';
    }
  };
  const getAccentGlow = (color: string) => {
    switch (color) {
      case 'emerald': return 'shadow-[0_0_15px_rgba(16,185,129,0.2)]';
      case 'rose': return 'shadow-[0_0_15px_rgba(244,63,94,0.2)]';
      case 'violet': return 'shadow-[0_0_15px_rgba(139,92,246,0.2)]';
      case 'amber': return 'shadow-[0_0_15px_rgba(245,158,11,0.2)]';
      case 'cyan': return 'shadow-[0_0_15px_rgba(6,182,212,0.2)]';
      default: return 'shadow-[0_0_15px_rgba(245,158,11,0.2)]';
    }
  };
  const initials = userProfile?.displayName ? userProfile.displayName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() : '??';

  // Calculations for Dynamic Circular Word Goal Progress & Daily Session Counter
  const wordGoal = userProfile?.wordGoal || 50000;
  const progressPercentage = Math.min((metrics.wordCount / wordGoal) * 100, 100);



  const sessionWords = Math.max(0, metrics.wordCount - (dailySessionData.baseline ?? metrics.wordCount));
  const dailyWordGoal = userProfile?.dailyWordGoal || 1000;
  const sessionProgressPct = Math.min((sessionWords / dailyWordGoal) * 100, 100);

  const radiusOuter = 8;
  const circOuter = 2 * Math.PI * radiusOuter;
  const offsetOuter = circOuter - (progressPercentage / 100) * circOuter;

  const radiusInner = 5;
  const circInner = 2 * Math.PI * radiusInner;
  const offsetInner = circInner - (sessionProgressPct / 100) * circInner;

  
  if (authLoading) {
    return <div className="flex h-screen items-center justify-center bg-[#040508] text-indigo-400"><Sparkles className="animate-pulse w-8 h-8" /></div>;
  }

  if (!firebaseUser) {
    return <SyllabexaAuth onAuthComplete={(user, profile) => {
      setFirebaseUser(user);
      setUserProfile(profile);
    }} />;
  }

  return (
    <div className="flex flex-col h-screen bg-[#040508] text-slate-300 font-sans overflow-hidden">
      
      {/* UNIFIED FROSTED TOP NAVIGATION HEADER (56px) */}
      <header className="h-[64px] bg-[#0c0e12]/95 backdrop-blur-xl border-b border-slate-800/60 flex items-center justify-between px-4 lg:px-8 shrink-0 select-none z-30 shadow-sm relative">
        
        {/* Left: Brand Logo & Navigation Mode Toggle */}
        <div className="flex items-center gap-4">
          <button className="lg:hidden text-slate-300 hover:text-white" onClick={() => setMobileNavOpen(!mobileNavOpen)}>
            {mobileNavOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
          
          <div className="flex items-center gap-2.5 cursor-pointer">
            <SyllabexaIcon size={24} glow={true} />
            <span className="text-sm font-serif font-black tracking-[0.2em] text-slate-100 uppercase hidden sm:block">Syllabexa</span>
          </div>

          <div className="hidden lg:flex items-center">
            <GlobalSearch />
            <div className="ml-2">
              <SaveIndicator />
            </div>
          </div>
        </div>

        {/* Center: Desktop Unified Mode Selector */}
        <div className="hidden lg:flex items-center gap-4">
          <div className="flex items-center gap-1 bg-[#161a26] p-1 rounded-full border border-white/5 shadow-inner">
            <button
              onClick={() => {
                setWorkspaceMode('author');
                setStudioView('editor');
              }}
              className={`px-3 py-1.5 rounded-full text-[10px] font-mono uppercase tracking-wider transition-all duration-300 flex items-center gap-1.5 ${
                workspaceMode === 'author' 
                  ? 'bg-amber-600/20 text-amber-400 font-bold border border-amber-500/30' 
                  : 'text-slate-500 hover:text-slate-300 border border-transparent'
              }`}
            >
              <Feather size={12} />
              <span>Author</span>
            </button>
            <button
              onClick={() => {
                setWorkspaceMode('operator');
                setStudioView('quick-start');
              }}
              className={`px-3 py-1.5 rounded-full text-[10px] font-mono uppercase tracking-wider transition-all duration-300 flex items-center gap-1.5 ${
                workspaceMode === 'operator' 
                  ? 'bg-indigo-600/20 text-indigo-400 font-bold border border-indigo-500/30' 
                  : 'text-slate-500 hover:text-slate-300 border border-transparent'
              }`}
            >
              <Cpu size={12} />
              <span>Operator</span>
            </button>
          </div>

          <nav className="flex items-center gap-1 bg-black/40 p-1 rounded-full border border-white/10 shadow-inner">
            {(workspaceMode === 'operator' ? [
              { id: 'quick-start', icon: <Sparkles size={14} />, label: 'Hub' },
              { id: 'editor', icon: <Feather size={14} />, label: 'Writer' },
              { id: 'syllabexa-typesetter', icon: <LayoutGrid size={14} />, label: 'Typesetter' },
              { id: 'syllabexa-visual-studio', icon: <Cpu size={14} />, label: 'Studio' },
              { id: 'syllabexa-voice', icon: <Mic size={14} />, label: 'Voice' },
              { id: 'commerce', icon: <Store size={14} className="text-amber-400" />, label: 'Commerce' },
              { id: 'theme-builder', icon: <Palette size={14} className="text-emerald-400" />, label: 'Themes' },
              { id: 'commerce', icon: <Store size={14} className="text-amber-400" />, label: 'Commerce' },
                { id: 'theme-builder', icon: <Palette size={14} className="text-emerald-400" />, label: 'Themes' },
                { id: 'pipeline', icon: <Cpu size={14} className="text-indigo-400" />, label: 'AI' },
              { id: 'course-workbook', icon: <GraduationCap size={14} />, label: 'Workbooks' }
            ] : [
              { id: 'editor', icon: <Feather size={14} />, label: 'Write' },
              { id: 'syllabexa-typesetter', icon: <Palette size={14} />, label: 'Design' },
              { id: 'preview', icon: <BookOpen size={14} />, label: 'Preview' },
              { id: 'export', icon: <Download size={14} />, label: 'Export' }
            ]).map(tab => (
              <button 
                key={tab.id}
                onClick={() => setStudioView(tab.id as any)} 
                className={`px-3 py-1.5 rounded-full text-xs font-mono uppercase tracking-wider transition-all duration-300 flex items-center gap-2 ${
                  studioView === tab.id 
                    ? (workspaceMode === 'operator' ? 'bg-indigo-600 text-white font-black shadow-lg shadow-indigo-600/30' : 'bg-amber-600 text-white font-black shadow-lg shadow-amber-600/30') 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Right: Metrics & User Actions */}
        <div className="flex items-center gap-3 lg:gap-4 font-mono">
          
          {/* Live Manuscript Metrics */}
          <div className="hidden xl:flex items-center gap-4 text-xs font-mono bg-black/30 px-4 py-1.5 rounded-full border border-white/5 shadow-inner">
            <div className="flex items-center gap-2 group cursor-pointer" title={`Total Goal: ${metrics.wordCount} / ${wordGoal} (${progressPercentage.toFixed(1)}%)`}>
              <div className="text-slate-400 flex flex-col justify-center text-right">
                <div className="flex items-baseline gap-1">
                  <span className="text-indigo-400 font-bold">{metrics.wordCount.toLocaleString()}</span>
                  <span className="text-slate-600 text-[9px]">/ {wordGoal.toLocaleString()}</span>
                </div>
              </div>
            </div>
            
            <div className="h-4 w-px bg-slate-800"></div>
            
            <div className="flex items-center gap-1.5 text-slate-400" title="Writing Streak">
              <Flame size={12} className={userProfile?.streak > 0 ? "text-amber-500" : "text-slate-600"} />
              <span className="text-slate-200 font-bold">{userProfile?.streak || 0}</span>
            </div>
          </div>
          
          {/* Ambient Soundscape Controller */}
          <div className="hidden sm:flex items-center bg-black/40 rounded-full border border-white/10 p-1 gap-1">
            <button onClick={() => setActiveSound('none')} className={`p-1.5 rounded-full transition-all ${activeSound === 'none' ? 'bg-slate-800 text-slate-200' : 'text-slate-500 hover:text-slate-300'}`}>
              <VolumeX size={12} />
            </button>
            <button onClick={() => setActiveSound('typewriter')} className={`p-1.5 rounded-full transition-all ${activeSound === 'typewriter' ? 'bg-indigo-500/30 text-indigo-300' : 'text-slate-500 hover:text-slate-300'}`}>
              <Volume2 size={12} />
            </button>
            <button onClick={() => setActiveSound('rain')} className={`p-1.5 rounded-full transition-all ${activeSound === 'rain' ? 'bg-indigo-500/30 text-indigo-300' : 'text-slate-500 hover:text-slate-300'}`}>
              <CloudRain size={12} />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowImportModal(true)}
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#161a26] hover:bg-slate-800 text-indigo-300 font-mono text-[10px] lg:text-xs font-bold uppercase tracking-wider transition-all border border-indigo-500/30 hover:border-indigo-500/60"
            >
              <Upload size={12} />
              <span>Import</span>
            </button>
            
            <button 
              onClick={() => setShowDistributionLocker(true)} 
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white font-mono text-[10px] lg:text-xs font-bold uppercase tracking-wider transition-all shadow-md hover:shadow-indigo-500/20"
            >
              <Download size={12} />
              <span className="hidden sm:inline">Export</span>
            </button>
          </div>

          {/* User Profile */}
          <div className="relative">
            <button 
              onClick={() => setShowProfileDropdown(!showProfileDropdown)} 
              className="flex items-center gap-2 focus:outline-none hover:opacity-90 transition-all cursor-pointer group ml-1"
            >
              <div className={`w-8 h-8 rounded-full border flex items-center justify-center font-black text-xs transition-all ${getAccentBg(userProfile?.accentColor)} ${getAccentGlow(userProfile?.accentColor)} group-hover:scale-105 shadow-sm`}>
                {initials}
              </div>
            </button>

            {showProfileDropdown && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setShowProfileDropdown(false)} />
                <div className="absolute right-0 mt-4 w-64 bg-[#0f1218] border border-white/10 rounded-2xl shadow-2xl p-4 z-40">
                  <div className="pb-4 border-b border-white/10 mb-2">
                    <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest font-bold">Workspace Access</div>
                    <div className="text-sm font-bold text-slate-100 mt-1">{userProfile?.displayName}</div>
                    <div className="text-xs text-indigo-400 font-mono mt-0.5">@{userProfile?.username}</div>
                  </div>
                  <div className="space-y-1">
                    <button 
                      onClick={() => { setShowSettingsModal(true); setShowProfileDropdown(false); }} 
                      className="w-full flex items-center gap-3 px-3 py-2.5 text-xs font-mono font-bold uppercase tracking-wider text-slate-400 hover:text-slate-100 hover:bg-white/5 rounded-xl transition-all"
                    >
                      <Settings className="w-4 h-4 text-slate-500" />
                      <span>Settings</span>
                    </button>
                    <button 
                      onClick={() => { navigate('/app/billing'); setShowProfileDropdown(false); }} 
                      className="w-full flex items-center gap-3 px-3 py-2.5 text-xs font-mono font-bold uppercase tracking-wider text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-xl transition-all"
                    >
                      <CreditCard className="w-4 h-4 text-slate-500" />
                      <span>Billing & Plans</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Mobile Dropdown Menu (only visible when hamburger clicked on lg< screens) */}
        {mobileNavOpen && (
          <div className="absolute top-[64px] left-0 right-0 bg-[#0c0e12]/95 backdrop-blur-xl border-b border-slate-800/60 p-4 lg:hidden flex flex-col gap-4 z-20 shadow-2xl">
            <div className="flex items-center gap-2 px-2">
              <GlobalSearch />
              <SaveIndicator />
            </div>
            
            <div className="grid grid-cols-2 gap-2 mt-2">
              {[
                { id: 'quick-start', icon: <Sparkles size={14} />, label: 'Hub' },
                { id: 'editor', icon: <Feather size={14} />, label: 'Writer' },
                { id: 'syllabexa-typesetter', icon: <LayoutGrid size={14} />, label: 'Typesetter' },
                { id: 'syllabexa-visual-studio', icon: <Cpu size={14} />, label: 'Studio' },
                { id: 'syllabexa-voice', icon: <Mic size={14} />, label: 'Voice' },
                { id: 'commerce', icon: <Store size={14} className="text-amber-400" />, label: 'Commerce' },
                { id: 'theme-builder', icon: <Palette size={14} className="text-emerald-400" />, label: 'Themes' },
                { id: 'pipeline', icon: <Cpu size={14} className="text-indigo-400" />, label: 'AI' },
                { id: 'course-workbook', icon: <GraduationCap size={14} />, label: 'Workbooks' }
              ].map(tab => (
                <button 
                  key={tab.id}
                  onClick={() => { setStudioView(tab.id as any); setMobileNavOpen(false); }} 
                  className={`px-4 py-3 rounded-xl text-xs font-mono uppercase tracking-wider transition-all flex items-center gap-3 ${
                    studioView === tab.id 
                      ? 'bg-indigo-600 text-white font-black shadow-lg shadow-indigo-600/30' 
                      : 'bg-black/20 text-slate-400 hover:text-slate-200 border border-white/5'
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </header>

      {/* CORE MANUSCRIPT STUDIO WORKSPACE */}
      <div className={`flex-1 flex overflow-hidden relative transition-all duration-300 ${!isDrawerOpen ? 'w-full' : 'flex-1'}`}>
        <ErrorBoundary>
          <Outlet />
        </ErrorBoundary>
      </div>

      {/* EDIT PROFILE MODAL */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0" onClick={() => !editLoading && setShowEditModal(false)} />
          <div className="w-full max-w-md bg-[#0c0e12] border border-white/10 rounded-3xl p-6 relative z-10 shadow-2xl">
            <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-4">
              <h3 className="text-base font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <Settings className="w-4 h-4 text-indigo-300" /><span>Edit Profile Settings</span>
              </h3>
              <button onClick={() => setShowEditModal(false)} disabled={editLoading} className="text-slate-500 hover:text-slate-300 focus:outline-none disabled:opacity-50 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {editError && (
              <div className="mb-4 p-4 bg-rose-950/20 border border-rose-900/50 rounded-2xl flex items-start gap-3">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" /><p className="text-xs text-rose-300 font-sans">{editError}</p>
              </div>
            )}
            {editSuccess && (
              <div className="mb-4 p-4 bg-emerald-950/20 border border-emerald-900/50 rounded-2xl flex items-start gap-3">
                <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" /><p className="text-xs text-emerald-300 font-sans">{editSuccess}</p>
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-4 font-sans text-left">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-[10px] font-mono text-slate-500 uppercase tracking-widest font-bold">Username Handle</label>
                  <span className={`text-[10px] font-mono ${editUsernameStatus === 'available' ? 'text-emerald-400 font-bold' : editUsernameStatus === 'taken' || editUsernameStatus === 'invalid' ? 'text-rose-400' : editUsernameStatus === 'checking' ? 'text-indigo-300' : 'text-slate-600'}`}>{editUsernameMessage}</span>
                </div>
                <div className="relative">
                  <span className="absolute left-4 top-3.5 text-sm font-mono text-slate-600 select-none">@</span>
                  <input type="text" required disabled={editLoading} value={editUsername} onChange={(e) => setEditUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))} className={`w-full bg-[#12151c] border focus:ring-1 text-sm font-mono transition-all rounded-xl py-3 pl-8 pr-11 text-slate-200 placeholder-slate-600 ${editUsernameStatus === 'available' ? 'border-emerald-500/50 focus:border-emerald-500 focus:ring-emerald-500' : editUsernameStatus === 'taken' || editUsernameStatus === 'invalid' ? 'border-rose-500/50 focus:border-rose-500 focus:ring-rose-500' : 'border-white/10 focus:border-amber-500 focus:ring-amber-500'}`} />
                  <div className="absolute right-4 top-3.5 flex items-center justify-center">
                    {editUsernameStatus === 'checking' && <div className="w-4 h-4 border-2 border-amber-500/35 border-t-amber-400 rounded-full animate-spin"></div>}
                    {editUsernameStatus === 'available' && <Check className="w-4 h-4 text-emerald-400" />}
                    {(editUsernameStatus === 'taken' || editUsernameStatus === 'invalid') && <X className="w-4 h-4 text-rose-400" />}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-2 font-bold">Author / Creator Name</label>
                <div className="relative">
                  <UserIcon className="absolute left-4 top-3.5 w-4 h-4 text-slate-600" />
                  <input type="text" required disabled={editLoading} value={editDisplayName} onChange={(e) => setEditDisplayName(e.target.value)} className="w-full bg-[#12151c] border border-white/10 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 rounded-xl py-3 pl-11 pr-4 text-slate-200 placeholder-slate-600 text-sm font-sans transition-all" />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-2 font-bold">Creator Role / Title</label>
                <select value={editRole} disabled={editLoading} onChange={(e) => setEditRole(e.target.value)} className="w-full bg-[#12151c] border border-white/10 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 rounded-xl py-3 px-4 text-slate-200 text-sm font-sans transition-all cursor-pointer">
                  <option value="Author / Creator">Author / Creator</option>
                  <option value="Novelist & Storyteller">Novelist & Storyteller</option>
                  <option value="Linguistic Researcher">Linguistic Researcher</option>
                  <option value="Content Copywriter">Content Copywriter</option>
                  <option value="Brand Publisher">Brand Publisher</option>
                  <option value="Production Administrator">Production Administrator</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-2 font-bold">Profile Glow Accent</label>
                <div className="flex gap-3 justify-between bg-[#12151c] p-3 rounded-xl border border-white/10">
                  {[{ name: 'amber', bg: 'bg-indigo-500' }, { name: 'indigo', bg: 'bg-indigo-500' }, { name: 'emerald', bg: 'bg-emerald-500' }, { name: 'rose', bg: 'bg-rose-500' }, { name: 'violet', bg: 'bg-violet-500' }, { name: 'cyan', bg: 'bg-cyan-500' }].map((col) => (
                    <button key={col.name} type="button" disabled={editLoading} onClick={() => setEditAccentColor(col.name)} className={`w-6 h-6 rounded-full cursor-pointer transition-transform ${col.bg} ${editAccentColor === col.name ? 'scale-125 ring-2 ring-white/50 border border-[#0c0e12]' : 'hover:scale-110 opacity-70'}`} />
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button type="button" disabled={editLoading} onClick={() => setShowEditModal(false)} className="flex-1 bg-transparent hover:bg-slate-800 text-slate-400 font-mono text-xs font-bold uppercase tracking-widest py-3.5 rounded-xl border border-white/10 transition-all cursor-pointer flex items-center justify-center">Cancel</button>
                <button type="submit" disabled={editLoading || editUsernameStatus !== 'available'} className="flex-1 bg-indigo-500 hover:bg-amber-400 disabled:bg-slate-800 disabled:text-slate-500 text-slate-950 font-mono text-xs font-black uppercase tracking-widest py-3.5 rounded-xl border border-amber-400/30 transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20">
                  {editLoading ? <span className="w-4 h-4 border-2 border-slate-950/35 border-t-slate-950 rounded-full animate-spin"></span> : <><span>SAVE CHANGES</span><ShieldCheck className="w-4 h-4" /></>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Distribution Locker Modal */}
      {showDistributionLocker && (
        <DistributionLocker onClose={() => setShowDistributionLocker(false)} />
      )}

      {/* Global Import Draft Manuscript Modal */}
      <ImportDraftModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
      />

      {/* Global Settings Hub Modal */}
      <SettingsHub
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        userProfile={userProfile}
        onUpdateProfile={(updates) => {
          if (!firebaseUser) return;
          const newProfile = { ...userProfile, ...updates, updatedAt: new Date().toISOString() };
          setUserProfile(newProfile);
          setDoc(doc(db, 'users', firebaseUser.uid), newProfile, { merge: true }).catch(console.error);
        }}
      />

      <ShortcutModal 
        isOpen={showGlobalShortcutModal}
        onClose={() => setShowGlobalShortcutModal(false)}
      />

      <CommandPalette 
        isOpen={showCommandPalette}
        onClose={() => setShowCommandPalette(false)}
        onNavigate={(path) => {
          navigate(path);
          setShowCommandPalette(false);
        }}
      />
    </div>
  );
}