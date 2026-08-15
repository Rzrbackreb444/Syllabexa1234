import React, { useState, useEffect } from 'react';
import { 
  Mail, Lock, User as UserIcon, Sparkles, 
  Check, X, AlertCircle, Fingerprint, 
  ChevronRight, ShieldCheck, Eye, EyeOff, Loader2,
  Terminal
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { 
  db, googleSignIn, signUpWithEmail, signInWithEmail,
  OperationType, handleFirestoreError
} from '../lib/googleAuth';
import SyllabexaIcon from './SyllabexaIcon';

interface SyllabexaAuthProps {
  onAuthComplete: (firebaseUser: any, profile: any) => void;
}

// ============================================================================
// DEVELOPMENT OVERRIDE
// Set to 'false' to re-enable full Firebase Authentication and Profile Setup.
// ============================================================================
const DEV_MODE_BYPASS = false;

export default function SyllabexaAuth({ onAuthComplete }: SyllabexaAuthProps) {
  // --- DEV MODE AUTO-LOGIN EFFECT ---
  useEffect(() => {
    if (DEV_MODE_BYPASS) {
      const timer = setTimeout(() => {
        onAuthComplete(
          { 
            uid: 'dev-bypass-admin-999', 
            email: 'architect@syllabexa.local', 
            displayName: 'System Architect' 
          },
          {
            theme: 'dark',
            wordGoal: 5000,
            username: 'admin_architect',
            displayName: 'System Architect',
            role: 'Production Administrator',
            accentColor: 'amber',
            updatedAt: new Date().toISOString()
          }
        );
      }, 2000); // 2-second cinematic boot sequence
      return () => clearTimeout(timer);
    }
  }, [onAuthComplete]);

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [isSetupProfile, setIsSetupProfile] = useState(false);
  const [tempUser, setTempUser] = useState<any>(null);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [role, setRole] = useState('Author / Creator');
  const [accentColor, setAccentColor] = useState('amber');

  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'taken' | 'invalid'>('idle');
  const [usernameMessage, setUsernameMessage] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!username) {
      setUsernameStatus('idle');
      setUsernameMessage('');
      return;
    }

    const reg = /^[a-zA-Z0-9_]{3,20}$/;
    if (!reg.test(username)) {
      setUsernameStatus('invalid');
      setUsernameMessage('3-20 characters, letters, numbers, underscores only');
      return;
    }

    setUsernameStatus('checking');
    setUsernameMessage('Checking availability...');

    const delayDebounce = setTimeout(async () => {
      try {
        const normalized = username.toLowerCase();
        const claimRef = doc(db, 'usernames', normalized);
        const claimSnap = await getDoc(claimRef);
        
        if (claimSnap.exists()) {
          setUsernameStatus('taken');
          setUsernameMessage('This username is already claimed');
        } else {
          setUsernameStatus('available');
          setUsernameMessage('Username is available!');
        }
      } catch (err) {
        console.error(err);
        setUsernameStatus('idle');
        setUsernameMessage('Could not verify availability');
      }
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [username]);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === 'signup') {
        if (password.length < 6) {
          throw new Error('Password must be at least 6 characters');
        }
        const user = await signUpWithEmail(email, password);
        setTempUser(user);
        setIsSetupProfile(true);
      } else {
        const user = await signInWithEmail(email, password);
        await checkUserProfile(user);
      }
    } catch (err: any) {
      // Intentionally not logging expected auth errors to console to avoid false positive error reports
      let errMsg = err.message || 'Authentication failed';
      if (err.code === 'auth/email-already-in-use' || err.message?.includes('auth/email-already-in-use')) {
        errMsg = 'This email is already registered. Please sign in.';
      } else if (err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found' || err.message?.includes('auth/wrong-password') || err.message?.includes('auth/user-not-found')) {
        errMsg = 'Invalid email or password';
      } else if (err.code === 'auth/invalid-credential' || err.message?.includes('auth/invalid-credential')) {
        errMsg = 'Incorrect email or password';
      } else if (err.code === 'auth/operation-not-allowed' || err.message?.includes('auth/operation-not-allowed')) {
        errMsg = 'Email/Password sign in is disabled. Please enable it in Firebase Console -> Authentication -> Sign-in method, or sign in with Google instead.';
      }
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);
    try {
      const result = await googleSignIn();
      if (result?.user) {
        await checkUserProfile(result.user);
      }
    } catch (err: any) {
      // Intentionally not logging expected auth errors to console to avoid false positive error reports
      let errMsg = err.message || 'Google sign-in failed.';
      if (err.code === 'auth/operation-not-allowed' || err.message?.includes('auth/operation-not-allowed')) {
        errMsg = 'Google sign in is disabled. Please enable Google provider in your Firebase Authentication Console.';
      }
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const checkUserProfile = async (firebaseUser: any) => {
    try {
      const userDocRef = doc(db, 'users', firebaseUser.uid);
      const userSnap = await getDoc(userDocRef).catch(() => null);

      if (userSnap && userSnap.exists()) {
        const profile = userSnap.data();
        onAuthComplete(firebaseUser, profile);
      } else {
        setTempUser(firebaseUser);
        if (firebaseUser.displayName) {
          setDisplayName(firebaseUser.displayName);
        }
        setIsSetupProfile(true);
      }
    } catch (err) {
      setTempUser(firebaseUser);
      setIsSetupProfile(true);
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tempUser) return;
    setError(null);

    if (usernameStatus !== 'available') {
      setError('Please choose an available, valid username first.');
      return;
    }

    if (!displayName.trim()) {
      setError('Please enter a display name.');
      return;
    }

    setLoading(true);
    try {
      const normalizedUsername = username.toLowerCase().trim();
      const claimRef = doc(db, 'usernames', normalizedUsername);
      const userDocRef = doc(db, 'users', tempUser.uid);

      await setDoc(claimRef, {
        uid: tempUser.uid,
        createdAt: new Date().toISOString()
      }).catch(e => handleFirestoreError(e, OperationType.WRITE, `usernames/${normalizedUsername}`));

      const newProfile = {
        theme: 'dark',
        wordGoal: 1000,
        username: normalizedUsername,
        displayName: displayName.trim(),
        role: role.trim(),
        accentColor,
        computeCredits: 5, // The Welcome Grant
        updatedAt: new Date().toISOString()
      };

      await setDoc(userDocRef, newProfile).catch(e => handleFirestoreError(e, OperationType.WRITE, `users/${tempUser.uid}`));

      setSuccess('Profile initialized successfully!');
      setTimeout(() => {
        onAuthComplete(tempUser, newProfile);
      }, 1000);

    } catch (err: any) {
      console.error('Error setting up profile:', err);
      setError(err.message || 'Failed to complete profile setup. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // --- Animation Variants ---
  const formVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } }
  };

  // ============================================================================
  // DEV BYPASS VIEW
  // ============================================================================
  if (DEV_MODE_BYPASS) {
    return (
      <div className="min-h-screen bg-[#050608] flex items-center justify-center p-4 relative overflow-hidden select-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#141517_1px,transparent_1px),linear-gradient(to_bottom,#141517_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-20"></div>
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="relative z-10 flex flex-col items-center text-center p-12 bg-[#0a0c10] border border-amber-500/20 rounded-3xl shadow-[0_0_60px_rgba(245,158,11,0.1)]"
        >
          <motion.div 
            animate={{ rotate: 360 }} 
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            className="w-20 h-20 border-4 border-amber-500/20 border-t-amber-500 rounded-full mb-6 flex items-center justify-center"
          >
            <Terminal className="w-8 h-8 text-amber-500 animate-pulse" />
          </motion.div>
          <h1 className="text-3xl font-black uppercase tracking-widest text-white mb-2">Security Override</h1>
          <p className="text-amber-400 font-mono text-xs tracking-widest uppercase">Dev Mode Active • Bypassing Firebase</p>
          <div className="mt-8 space-y-2 text-left bg-black/50 p-4 rounded-xl border border-white/5 font-mono text-[10px] text-slate-500 w-full">
            <p className="text-emerald-400">{'>'} Payload: DEV_BYPASS_ADMIN</p>
            <p className="text-emerald-400">{'>'} Access Level: MAXIMUM</p>
            <p className="animate-pulse">{'>'} Routing to Main Hub...</p>
          </div>
        </motion.div>
      </div>
    );
  }

  // ============================================================================
  // STANDARD PRODUCTION VIEW
  // ============================================================================
  return (
    <div className="min-h-screen bg-[#07080a] flex items-center justify-center p-4 relative overflow-hidden select-none">
      {/* Enterprise Architectural Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#141517_1px,transparent_1px),linear-gradient(to_bottom,#141517_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-35"></div>
      
      {/* Dynamic Cinematic Ambient Glows */}
      <motion.div 
        animate={{ scale: [1, 1.05, 1], opacity: [0.3, 0.5, 0.3] }} 
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-amber-500/10 rounded-full filter blur-[120px] -z-10"
      />
      <motion.div 
        animate={{ scale: [1, 1.1, 1], opacity: [0.2, 0.4, 0.2] }} 
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-amber-600/10 rounded-full filter blur-[100px] -z-10"
      />

      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md bg-[#0a0c10]/90 backdrop-blur-xl border border-white/10 rounded-[2.5rem] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.8)] overflow-hidden p-8 relative z-10"
      >
        <div className="flex flex-col items-center text-center mb-10">
          <motion.div 
            initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2, type: 'spring' }}
            className="mb-4 transform hover:scale-105 transition-transform duration-300 relative"
          >
            <div className="absolute inset-0 bg-amber-500/20 blur-2xl rounded-full" />
            <SyllabexaIcon size={48} glow={true} />
          </motion.div>
          <motion.h1 initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="text-3xl font-serif font-black tracking-widest text-white uppercase drop-shadow-lg">
            Syllabexa
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="text-[10px] text-amber-400 font-mono tracking-[0.3em] uppercase font-bold mt-2">
            Enterprise Linguistic Engine
          </motion.p>
        </div>

        <AnimatePresence mode="wait">
          {!isSetupProfile ? (
            <motion.div
              key="auth-forms"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="mb-8 text-center">
                <h2 className="text-lg font-bold text-slate-200">
                  {mode === 'signin' ? 'Access Command Center' : 'Provision Creator License'}
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  {mode === 'signin' 
                    ? 'Authenticate to enter the active production matrix.' 
                    : 'Establish a secure credentials layer to persist your studio styles.'}
                </p>
              </div>

              <AnimatePresence>
                {error && (
                  <motion.div initial={{ opacity: 0, height: 0, y: -10 }} animate={{ opacity: 1, height: 'auto', y: 0 }} exit={{ opacity: 0, height: 0 }} className="mb-5 p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                    <p className="text-xs text-rose-300 leading-relaxed font-sans">{error}</p>
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.form variants={formVariants} initial="hidden" animate="show" onSubmit={handleEmailAuth} className="space-y-5">
                <motion.div variants={itemVariants}>
                  <label className="block text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-2 font-bold ml-1">
                    Secure Email Address
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-amber-500/0 via-amber-500/10 to-amber-500/0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                    <Mail className="absolute left-4 top-3.5 w-4 h-4 text-slate-500 group-focus-within:text-amber-400 transition-colors" />
                    <input
                      type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                      placeholder="author@syllabexa.com"
                      className="w-full bg-[#050608] border border-white/10 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 rounded-xl py-3.5 pl-11 pr-4 text-slate-200 placeholder-slate-600 text-sm font-sans transition-all shadow-inner"
                    />
                  </div>
                </motion.div>

                <motion.div variants={itemVariants}>
                  <label className="block text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-2 font-bold ml-1">
                    Access Key / Password
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-amber-500/0 via-amber-500/10 to-amber-500/0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                    <Lock className="absolute left-4 top-3.5 w-4 h-4 text-slate-500 group-focus-within:text-amber-400 transition-colors" />
                    <input
                      type={showPassword ? 'text' : 'password'} required value={password} onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-[#050608] border border-white/10 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 rounded-xl py-3.5 pl-11 pr-11 text-slate-200 placeholder-slate-600 text-sm font-sans transition-all shadow-inner"
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-3.5 text-slate-500 hover:text-amber-400 focus:outline-none transition-colors">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </motion.div>

                <motion.button
                  variants={itemVariants} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  type="submit" disabled={loading}
                  className="w-full bg-amber-500 hover:bg-amber-400 disabled:bg-white/5 disabled:text-slate-500 text-slate-950 font-mono text-xs font-black uppercase tracking-widest py-4 rounded-xl border border-amber-400/30 transition-all flex items-center justify-center gap-2 mt-8 shadow-[0_0_20px_rgba(245,158,11,0.2)] overflow-hidden relative group"
                >
                  <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out" />
                  {loading ? <Loader2 className="w-4 h-4 animate-spin text-slate-900" /> : (
                    <><span className="relative z-10">{mode === 'signin' ? 'AUTHORIZE ACCESS' : 'PROVISION LICENSE'}</span><ChevronRight className="w-4 h-4 relative z-10" /></>
                  )}
                </motion.button>
              </motion.form>

              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="relative my-8 text-center">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10"></div></div>
                <span className="relative bg-[#0a0c10] px-4 text-[10px] font-mono text-slate-500 uppercase tracking-widest font-bold">
                  OR SECURE POPUP
                </span>
              </motion.div>

              <motion.button
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                type="button" onClick={handleGoogleSignIn} disabled={loading}
                className="w-full bg-[#050608] hover:bg-white/5 disabled:bg-slate-800 text-slate-300 font-mono text-xs font-bold uppercase tracking-widest py-4 rounded-xl border border-white/10 hover:border-white/20 transition-all flex items-center justify-center gap-3 shadow-lg group"
              >
                <svg className="w-4 h-4 shrink-0 group-hover:scale-110 transition-transform" viewBox="0 0 24 24" fill="none">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
                </svg>
                <span>LOG IN WITH GOOGLE</span>
              </motion.button>

              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }} className="mt-8 text-center text-xs">
                <span className="text-slate-500 font-medium">
                  {mode === 'signin' ? "Don't have a creator license?" : "Already registered?"}
                </span>{' '}
                <button
                  type="button" onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
                  className="text-amber-400 hover:text-amber-300 font-bold transition-colors ml-1 uppercase tracking-wider text-[10px] px-2 py-1 rounded-md hover:bg-amber-500/10"
                >
                  {mode === 'signin' ? 'Provision Now' : 'Authorize Now'}
                </button>
              </motion.div>
            </motion.div>
          ) : (
            <motion.div
              key="profile-setup"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.4 }}
            >
              <div className="mb-8 text-center">
                <div className="inline-flex items-center justify-center p-3 bg-amber-500/10 rounded-full border border-amber-500/20 mb-4">
                  <Sparkles className="w-6 h-6 text-amber-400 animate-pulse" />
                </div>
                <h2 className="text-2xl font-serif font-bold text-slate-100">Configure Profile</h2>
                <p className="text-xs text-slate-400 mt-2 max-w-[280px] mx-auto">
                  Establish your secure identity. Your terminal username must be globally unique.
                </p>
              </div>

              <AnimatePresence>
                {error && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mb-5 p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                    <p className="text-xs text-rose-300 leading-relaxed">{error}</p>
                  </motion.div>
                )}
                {success && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mb-5 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-start gap-3">
                    <Check className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                    <p className="text-xs text-emerald-300 leading-relaxed font-bold">{success}</p>
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.form variants={formVariants} initial="hidden" animate="show" onSubmit={handleProfileSubmit} className="space-y-5">
                <motion.div variants={itemVariants}>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-[10px] font-mono text-slate-500 uppercase tracking-widest font-bold ml-1">
                      Unique Handle
                    </label>
                    <span className={`text-[9px] font-mono font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${
                      usernameStatus === 'available' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                      usernameStatus === 'taken' || usernameStatus === 'invalid' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                      usernameStatus === 'checking' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse' : 'text-slate-600'
                    }`}>
                      {usernameMessage || 'Awaiting Input'}
                    </span>
                  </div>
                  <div className="relative">
                    <span className="absolute left-4 top-3.5 text-sm font-mono text-slate-600 select-none">@</span>
                    <input
                      type="text" required value={username} onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                      placeholder="janesmith"
                      className={`w-full bg-[#050608] border focus:ring-1 text-sm font-mono transition-all rounded-xl py-3.5 pl-9 pr-11 text-slate-200 placeholder-slate-600 shadow-inner ${
                        usernameStatus === 'available' ? 'border-emerald-500/50 focus:border-emerald-500 focus:ring-emerald-500/30' :
                        usernameStatus === 'taken' || usernameStatus === 'invalid' ? 'border-rose-500/50 focus:border-rose-500 focus:ring-rose-500/30' :
                        'border-white/10 focus:border-amber-500 focus:ring-amber-500/30'
                      }`}
                    />
                    <div className="absolute right-4 top-3.5 flex items-center justify-center">
                      {usernameStatus === 'checking' && <Loader2 className="w-4 h-4 text-amber-400 animate-spin" />}
                      {usernameStatus === 'available' && <Check className="w-4 h-4 text-emerald-400" />}
                      {(usernameStatus === 'taken' || usernameStatus === 'invalid') && <X className="w-4 h-4 text-rose-400" />}
                    </div>
                  </div>
                </motion.div>

                <motion.div variants={itemVariants}>
                  <label className="block text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-2 font-bold ml-1">
                    Display Name
                  </label>
                  <div className="relative group">
                    <UserIcon className="absolute left-4 top-3.5 w-4 h-4 text-slate-500 group-focus-within:text-amber-400 transition-colors" />
                    <input
                      type="text" required value={displayName} onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="Jane Smith"
                      className="w-full bg-[#050608] border border-white/10 focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30 rounded-xl py-3.5 pl-11 pr-4 text-slate-200 placeholder-slate-600 text-sm font-sans transition-all shadow-inner"
                    />
                  </div>
                </motion.div>

                <motion.div variants={itemVariants}>
                  <label className="block text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-2 font-bold ml-1">
                    Creator Role
                  </label>
                  <select
                    value={role} onChange={(e) => setRole(e.target.value)}
                    className="w-full bg-[#050608] border border-white/10 focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30 rounded-xl py-3.5 px-4 text-slate-200 text-sm font-sans transition-all cursor-pointer shadow-inner appearance-none"
                  >
                    <option value="Author / Creator">Author / Creator</option>
                    <option value="Novelist & Storyteller">Novelist & Storyteller</option>
                    <option value="Linguistic Researcher">Linguistic Researcher</option>
                    <option value="Content Copywriter">Content Copywriter</option>
                    <option value="Brand Publisher">Brand Publisher</option>
                    <option value="Production Administrator">Production Administrator</option>
                  </select>
                </motion.div>

                <motion.div variants={itemVariants}>
                  <label className="block text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-2 font-bold ml-1">
                    Terminal Accent
                  </label>
                  <div className="flex gap-2 justify-between bg-[#050608] p-3 rounded-xl border border-white/10 shadow-inner">
                    {[
                      { name: 'amber', bg: 'bg-amber-500' },
                      { name: 'indigo', bg: 'bg-indigo-500' },
                      { name: 'emerald', bg: 'bg-emerald-500' },
                      { name: 'rose', bg: 'bg-rose-500' },
                      { name: 'violet', bg: 'bg-violet-500' },
                      { name: 'cyan', bg: 'bg-cyan-500' }
                    ].map((col) => (
                      <motion.button
                        whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }}
                        key={col.name} type="button" onClick={() => setAccentColor(col.name)}
                        className={`w-7 h-7 rounded-full cursor-pointer transition-all shadow-md ${col.bg} ${
                          accentColor === col.name ? 'scale-125 ring-2 ring-white border-2 border-[#0c0e12] shadow-lg z-10' : 'opacity-60 hover:opacity-100'
                        }`}
                      />
                    ))}
                  </div>
                </motion.div>

                <motion.button
                  variants={itemVariants} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  type="submit" disabled={loading || usernameStatus !== 'available'}
                  className="w-full bg-amber-500 hover:bg-amber-400 disabled:bg-white/5 disabled:text-slate-500 text-slate-950 font-mono text-xs font-black uppercase tracking-widest py-4 rounded-xl border border-amber-400/30 transition-all flex items-center justify-center gap-2 mt-8 shadow-[0_0_20px_rgba(245,158,11,0.2)] overflow-hidden relative group"
                >
                  <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out" />
                  {loading ? <Loader2 className="w-4 h-4 animate-spin text-slate-900" /> : (
                    <><span className="relative z-10">INITIALIZE TERMINAL</span><ShieldCheck className="w-4 h-4 relative z-10" /></>
                  )}
                </motion.button>
              </motion.form>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} className="mt-8 pt-5 border-t border-white/10 flex items-center justify-center gap-2 text-[10px] font-mono text-slate-500">
          <Fingerprint className="w-3.5 h-3.5 text-amber-500/50" />
          <span className="uppercase tracking-widest">AES-256 Metadata Integrity Secured</span>
        </motion.div>
      </motion.div>
    </div>
  );
}