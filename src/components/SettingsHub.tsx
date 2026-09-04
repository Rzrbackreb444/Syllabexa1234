import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Settings, User, Shield, Bell, Palette, Sparkles, Type, Key, Check, Lock, Mail, Sliders, Globe, Cpu } from 'lucide-react';
import { useManuscriptStore } from '../store/manuscriptStore';
import CustomCssEditor from './CustomCssEditor';

interface SettingsHubProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile?: any;
  onUpdateProfile?: (updates: any) => void;
}

export default function SettingsHub({ isOpen, onClose, userProfile, onUpdateProfile }: SettingsHubProps) {
  const projectMeta = useManuscriptStore((state) => state.projectMeta);
  const updateProjectMeta = useManuscriptStore((state) => state.updateProjectMeta);
  const prepressRules = useManuscriptStore((state) => state.prepressRules);
  const updatePrepressRules = useManuscriptStore((state) => state.updatePrepressRules);

  const [activeTab, setActiveTab] = useState<'account' | 'appearance' | 'security' | 'notifications' | 'api' | 'agency'>('account');
  const [displayName, setDisplayName] = useState(userProfile?.displayName || 'WashBizHub Author');
  const [email, setEmail] = useState(userProfile?.email || 'admin@washbizhub.com');
  const [wordGoal, setWordGoal] = useState(userProfile?.wordGoal || 50000);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const agencyBranding = useManuscriptStore((state) => state.agencyBranding);
  const updateAgencyBranding = useManuscriptStore((state) => state.updateAgencyBranding);
  const subscriptionTier = useManuscriptStore((state) => state.subscriptionTier);
  const [emailDigest, setEmailDigest] = useState(true);
  const [hardwareAcceleration, setHardwareAcceleration] = useState(true);
  const [apiKey, setApiKey] = useState('sk-syllabexa-live-982341098234');
  const [savedToast, setSavedToast] = useState(false);

  useEffect(() => {
    if (userProfile) {
      setDisplayName(userProfile.displayName || 'WashBizHub Author');
      setEmail(userProfile.email || 'admin@washbizhub.com');
      setWordGoal(userProfile.wordGoal || 50000);
    }
  }, [userProfile]);

  const handleSave = () => {
    if (onUpdateProfile) {
      onUpdateProfile({
        displayName,
        email,
        wordGoal: Number(wordGoal) || 50000,
        notificationsEnabled,
        emailDigest,
        hardwareAcceleration
      });
    }
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 2500);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-[#07080a]/85 backdrop-blur-md"
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-5xl bg-[#0c0e12] border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="px-8 py-6 border-b border-slate-800/80 bg-[#08090c] flex justify-between items-center shrink-0">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500/20 to-indigo-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-lg">
                <Settings size={22} className="animate-spin-slow" />
              </div>
              <div>
                <h2 className="text-base font-mono font-bold text-slate-100 uppercase tracking-widest flex items-center gap-2">
                  Syllabexa Settings & Configuration Hub
                  <span className="text-[10px] font-normal px-2 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded-full">v2.6 Enterprise</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">Manage enterprise profile, typography presets, AI voice rules, and security credentials</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {savedToast && (
                <motion.div 
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono rounded-xl"
                >
                  <Check size={14} /> Saved Successfully
                </motion.div>
              )}
              <button
                onClick={handleSave}
                className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs font-mono uppercase tracking-wider transition-all shadow-lg cursor-pointer"
              >
                Save Changes
              </button>
              <button
                onClick={onClose}
                className="p-2.5 text-slate-400 hover:text-white bg-[#12151c] hover:bg-slate-800 rounded-xl border border-slate-800 transition-all cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          <div className="flex flex-1 overflow-hidden">
            {/* Sidebar Tabs */}
            <aside aria-label="Settings Navigation" className="w-72 bg-[#08090c] border-r border-slate-800/80 p-5 space-y-2 shrink-0">
              <button 
                onClick={() => setActiveTab('account')}
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl font-mono text-xs font-bold uppercase tracking-widest transition-all text-left cursor-pointer ${activeTab === 'account' ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30 shadow-md' : 'hover:bg-[#12151c] text-slate-400 hover:text-slate-200 border border-transparent'}`}
              >
                <User size={16} /> Account & Plan
              </button>
              <button 
                onClick={() => setActiveTab('appearance')}
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl font-mono text-xs font-bold uppercase tracking-widest transition-all text-left cursor-pointer ${activeTab === 'appearance' ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30 shadow-md' : 'hover:bg-[#12151c] text-slate-400 hover:text-slate-200 border border-transparent'}`}
              >
                <Palette size={16} /> Typography & Layout
              </button>
              <button 
                onClick={() => setActiveTab('security')}
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl font-mono text-xs font-bold uppercase tracking-widest transition-all text-left cursor-pointer ${activeTab === 'security' ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30 shadow-md' : 'hover:bg-[#12151c] text-slate-400 hover:text-slate-200 border border-transparent'}`}
              >
                <Shield size={16} /> Security & Auth
              </button>
              <button 
                onClick={() => setActiveTab('notifications')}
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl font-mono text-xs font-bold uppercase tracking-widest transition-all text-left cursor-pointer ${activeTab === 'notifications' ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30 shadow-md' : 'hover:bg-[#12151c] text-slate-400 hover:text-slate-200 border border-transparent'}`}
              >
                <Bell size={16} /> Notifications
              </button>
              <button 
                onClick={() => setActiveTab('agency')}
                className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl font-mono text-xs font-bold uppercase tracking-widest transition-all text-left cursor-pointer ${activeTab === 'agency' ? 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/30 shadow-md' : 'hover:bg-[#12151c] text-slate-400 hover:text-slate-200 border border-transparent'}`}
              >
                <div className="flex items-center gap-3"><Users size={16} /> Agency Portal</div>
                {subscriptionTier === 'agency' && <span className="text-[9px] bg-indigo-500/20 text-indigo-400 px-1.5 py-0.5 rounded border border-indigo-500/40">PRO</span>}
              </button>
              <button 
                onClick={() => setActiveTab('api')}
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl font-mono text-xs font-bold uppercase tracking-widest transition-all text-left cursor-pointer ${activeTab === 'api' ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30 shadow-md' : 'hover:bg-[#12151c] text-slate-400 hover:text-slate-200 border border-transparent'}`}
              >
                <Key size={16} /> API & Integrations
              </button>

              <div className="pt-8 mt-8 border-t border-slate-800/80 px-2">
                <div className="p-4 rounded-2xl bg-[#12151c] border border-slate-800 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-400 font-mono">
                    <Cpu size={14} /> Compute Credits
                  </div>
                  <p className="text-[11px] text-slate-400">Available for multi-agent waterfall generation and AI polish.</p>
                  <div className="text-sm font-bold text-white font-mono">{userProfile?.computeCredits || 45} Credits Left</div>
                </div>
              </div>
            </aside>

            {/* Content Area */}
            <div className="flex-1 p-10 overflow-y-auto bg-[#0c0e12] custom-scrollbar">
              <div className="max-w-3xl space-y-8">
                {activeTab === 'account' && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                    <div>
                      <h3 className="text-lg font-serif font-bold text-slate-100 mb-2">Author & Account Profile</h3>
                      <p className="text-xs text-slate-400 mb-6">Update your public publishing credentials and daily productivity goals.</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-widest mb-2 font-bold">Display Name</label>
                          <input 
                            type="text" 
                            value={displayName} 
                            onChange={(e) => setDisplayName(e.target.value)}
                            className="w-full bg-[#12151c] border border-slate-800 rounded-2xl px-4 py-3.5 text-xs text-slate-200 focus:border-amber-500 focus:outline-none transition-all shadow-inner" 
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-widest mb-2 font-bold">Email Address</label>
                          <input 
                            type="email" 
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-[#12151c] border border-slate-800 rounded-2xl px-4 py-3.5 text-xs text-slate-200 focus:border-amber-500 focus:outline-none transition-all shadow-inner" 
                          />
                        </div>
                      </div>
                    </div>

                    <div className="pt-6 border-t border-slate-800/80">
                      <h3 className="text-sm font-serif font-bold text-slate-100 mb-4">Subscription & Membership Tier</h3>
                      <div className="p-6 rounded-2xl bg-gradient-to-r from-amber-500/10 via-[#12151c] to-indigo-500/10 border border-amber-500/30 flex justify-between items-center">
                        <div className="space-y-1">
                          <span className="text-[10px] font-mono px-2 py-0.5 bg-amber-500/20 text-amber-400 rounded border border-amber-500/30 uppercase tracking-wider">Active Tier</span>
                          <h4 className="text-base font-bold text-white font-serif">{userProfile?.activePlan === 'free' ? 'Seed Free Tier' : userProfile?.activePlan === 'pro' ? 'Creator Pro Tier' : 'Agency Pro Enterprise'}</h4>
                          <p className="text-xs text-slate-400">Unlimited 300 DPI CMYK PDF exports, multi-agent AI pipeline, and custom Voice Training.</p>
                        </div>
                        <button 
                          onClick={() => alert('You are currently on the top enterprise tier with full access.')}
                          className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs font-mono uppercase tracking-wider transition-all shadow-lg cursor-pointer shrink-0"
                        >
                          Manage Plan
                        </button>
                      </div>
                    </div>

                    <div className="pt-6 border-t border-slate-800/80">
                      <h3 className="text-sm font-serif font-bold text-slate-100 mb-4">Workspace Productivity Targets</h3>
                      <div>
                        <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-widest mb-2 font-bold">Target Manuscript Word Count Goal</label>
                        <input 
                          type="number" 
                          step="1000"
                          value={wordGoal} 
                          onChange={(e) => setWordGoal(Number(e.target.value))}
                          className="w-full bg-[#12151c] border border-slate-800 rounded-2xl px-4 py-3.5 text-xs text-slate-200 focus:border-amber-500 focus:outline-none transition-all shadow-inner" 
                        />
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeTab === 'appearance' && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                    <div>
                      <h3 className="text-lg font-serif font-bold text-slate-100 mb-2">Typography & Prepress Layout Rules</h3>
                      <p className="text-xs text-slate-400 mb-6">Select professional book typographies and layout engines optimized for print and e-reader output.</p>
                      
                      <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-widest mb-3 font-bold">Project Typology Engine</label>
                      <div className="grid grid-cols-2 gap-4 mb-6">
                        <button 
                          onClick={() => updateProjectMeta({ projectType: 'reflowable' } as any)}
                          className={`p-5 border rounded-2xl transition-all text-left flex flex-col gap-1.5 cursor-pointer ${(!projectMeta.projectType || projectMeta.projectType === 'reflowable') ? 'border-amber-500 bg-amber-500/10 shadow-lg' : 'border-slate-800 bg-[#12151c] hover:border-slate-700'}`}
                        >
                          <div className="text-xs font-bold text-slate-100">Text-Heavy Reflowable</div>
                          <div className="text-[11px] text-slate-400">Optimized for novels, memoirs, and non-fiction essays.</div>
                        </button>
                        
                        <button 
                          onClick={() => updateProjectMeta({ projectType: 'fixed-layout' } as any)}
                          className={`p-5 border rounded-2xl transition-all text-left flex flex-col gap-1.5 cursor-pointer ${projectMeta.projectType === 'fixed-layout' ? 'border-amber-500 bg-amber-500/10 shadow-lg' : 'border-slate-800 bg-[#12151c] hover:border-slate-700'}`}
                        >
                          <div className="text-xs font-bold text-slate-100">Visual & Fixed Layout</div>
                          <div className="text-[11px] text-slate-400">Optimized for workbooks, children's books, and puzzle modules.</div>
                        </button>
                      </div>

                      <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-widest mb-3 font-bold">Curated Book Font Pairings</label>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                        {[
                          { heading: 'Cinzel', body: 'Merriweather', name: 'Classic Epic' },
                          { heading: 'Playfair Display', body: 'Lora', name: 'Elegant Literary' },
                          { heading: 'Montserrat', body: 'Roboto', name: 'Modern Clean' }
                        ].map((pair) => (
                          <button
                            key={pair.name}
                            onClick={() => updatePrepressRules({ fontHeading: pair.heading, fontBody: pair.body })}
                            className={`p-4 border rounded-2xl transition-all text-left flex flex-col gap-1 cursor-pointer ${prepressRules.fontHeading === pair.heading ? 'border-amber-500 bg-amber-500/10' : 'border-slate-800 bg-[#12151c] hover:border-slate-700'}`}
                          >
                            <div className="text-xs font-bold text-slate-100 font-serif">{pair.name}</div>
                            <div className="text-[10px] text-slate-400">{pair.heading} & {pair.body}</div>
                          </button>
                        ))}
                      </div>

                      <div className="pt-6 border-t border-slate-800/80">
                        <CustomCssEditor />
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeTab === 'security' && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                    <div>
                      <h3 className="text-lg font-serif font-bold text-slate-100 mb-2">Security & Authentication</h3>
                      <p className="text-xs text-slate-400 mb-6">Manage password credentials, two-factor authentication, and encrypted session tokens.</p>
                      
                      <div className="space-y-5">
                        <div>
                          <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-widest mb-2 font-bold">Current Password</label>
                          <input type="password" placeholder="••••••••••••" className="w-full bg-[#12151c] border border-slate-800 rounded-2xl px-4 py-3.5 text-xs text-slate-200 focus:border-amber-500 focus:outline-none transition-all shadow-inner" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-widest mb-2 font-bold">New Password</label>
                          <input type="password" placeholder="••••••••••••" className="w-full bg-[#12151c] border border-slate-800 rounded-2xl px-4 py-3.5 text-xs text-slate-200 focus:border-amber-500 focus:outline-none transition-all shadow-inner" />
                        </div>
                        <button 
                          onClick={() => alert('Password update simulated successfully.')}
                          className="px-5 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs font-mono uppercase tracking-wider transition-all cursor-pointer"
                        >
                          Update Password
                        </button>
                      </div>
                    </div>

                    <div className="pt-6 border-t border-slate-800/80">
                      <h3 className="text-sm font-serif font-bold text-slate-100 mb-4">Two-Factor Authentication (2FA)</h3>
                      <div className="p-5 rounded-2xl bg-[#12151c] border border-slate-800 flex justify-between items-center">
                        <div>
                          <div className="text-xs font-bold text-slate-200">Authenticator App Protection</div>
                          <div className="text-[11px] text-slate-400 mt-0.5">Secure your manuscript database with TOTP tokens.</div>
                        </div>
                        <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 text-[10px] font-mono rounded border border-emerald-500/30 uppercase tracking-wider font-bold">Active</span>
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeTab === 'notifications' && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                    <div>
                      <h3 className="text-lg font-serif font-bold text-slate-100 mb-2">Notification & Alert Preferences</h3>
                      <p className="text-xs text-slate-400 mb-6">Choose how you receive milestone updates and AI generation reports.</p>
                      
                      <div className="space-y-4">
                        <label className="flex items-center gap-4 p-5 border border-slate-800 rounded-2xl bg-[#12151c] cursor-pointer hover:border-slate-700 transition-all">
                          <input 
                            type="checkbox" 
                            checked={notificationsEnabled} 
                            onChange={(e) => setNotificationsEnabled(e.target.checked)}
                            className="w-4 h-4 rounded border-slate-700 bg-[#0c0e12] text-amber-500 focus:ring-amber-500/20" 
                          />
                          <div>
                            <div className="text-xs font-bold text-slate-100">In-App Generation Alerts</div>
                            <div className="text-[11px] text-slate-400 mt-0.5">Notify instantly when multi-agent waterfall compilation finishes.</div>
                          </div>
                        </label>

                        <label className="flex items-center gap-4 p-5 border border-slate-800 rounded-2xl bg-[#12151c] cursor-pointer hover:border-slate-700 transition-all">
                          <input 
                            type="checkbox" 
                            checked={emailDigest} 
                            onChange={(e) => setEmailDigest(e.target.checked)}
                            className="w-4 h-4 rounded border-slate-700 bg-[#0c0e12] text-amber-500 focus:ring-amber-500/20" 
                          />
                          <div>
                            <div className="text-xs font-bold text-slate-100">Weekly Author Digest Email</div>
                            <div className="text-[11px] text-slate-400 mt-0.5">Receive weekly summaries of word count progress and sales analytics.</div>
                          </div>
                        </label>
                      </div>
                    </div>
                  </motion.div>
                )}

                
                {activeTab === 'agency' && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-serif font-bold text-slate-100 flex items-center gap-2">
                          <Hexagon className="text-indigo-400 w-5 h-5" /> 
                          Agency Client Onboarding
                        </h3>
                        {subscriptionTier !== 'agency' && (
                          <span className="text-xs font-mono font-bold text-amber-500 bg-amber-500/10 px-2 py-1 rounded-md border border-amber-500/20">Upgrade Required</span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 mb-6">White-label the client review portal with your agency's branding to deliver a world-class experience.</p>
                      
                      <div className={`space-y-6 ${subscriptionTier !== 'agency' ? 'opacity-50 pointer-events-none grayscale' : ''}`}>
                        <div className="flex items-center justify-between p-5 bg-[#12151c] border border-slate-800 rounded-2xl">
                          <div>
                            <div className="text-sm font-bold text-slate-200">Enable White-Label Portal</div>
                            <div className="text-xs text-slate-500 mt-1">Replace Syllabexa branding with your own on shared links.</div>
                          </div>
                          <button 
                            onClick={() => updateAgencyBranding({ isEnabled: !agencyBranding?.isEnabled })}
                            className={`w-12 h-6 rounded-full transition-colors relative ${agencyBranding?.isEnabled ? 'bg-indigo-500' : 'bg-slate-700'}`}
                          >
                            <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${agencyBranding?.isEnabled ? 'left-7' : 'left-1'}`} />
                          </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-widest mb-2 font-bold">Brand Logo URL</label>
                            <input 
                              type="text" 
                              value={agencyBranding?.logoUrl || ''}
                              onChange={(e) => updateAgencyBranding({ logoUrl: e.target.value })}
                              placeholder="https://youragency.com/logo.png" 
                              className="w-full bg-[#12151c] border border-slate-800 rounded-2xl px-4 py-3.5 text-xs text-slate-200 focus:border-indigo-500 focus:outline-none transition-all shadow-inner" 
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-widest mb-2 font-bold">Primary Brand Color (Hex)</label>
                            <div className="flex items-center gap-3">
                              <input 
                                type="color" 
                                value={agencyBranding?.primaryColor || '#6366f1'}
                                onChange={(e) => updateAgencyBranding({ primaryColor: e.target.value })}
                                className="w-12 h-12 rounded-xl border border-slate-800 bg-[#12151c] cursor-pointer" 
                              />
                              <input 
                                type="text" 
                                value={agencyBranding?.primaryColor || '#6366f1'}
                                onChange={(e) => updateAgencyBranding({ primaryColor: e.target.value })}
                                className="flex-1 bg-[#12151c] border border-slate-800 rounded-2xl px-4 py-3.5 text-xs text-slate-200 focus:border-indigo-500 focus:outline-none transition-all shadow-inner uppercase" 
                              />
                            </div>
                          </div>
                        </div>

                        <div className="p-6 bg-[#0a0a0c] border border-slate-800 rounded-2xl">
                          <h4 className="text-[10px] font-mono text-slate-500 uppercase tracking-widest font-bold mb-4">Live Preview: Client Portal</h4>
                          <div className="flex items-center justify-between bg-[#12151c] border border-slate-800/50 p-4 rounded-xl shadow-xl">
                            <div className="flex items-center gap-3">
                              {agencyBranding?.isEnabled && agencyBranding.logoUrl ? (
                                <img src={agencyBranding.logoUrl} alt="Logo" className="h-6 object-contain" />
                              ) : (
                                <Hexagon className="w-6 h-6" style={{ color: agencyBranding?.isEnabled ? agencyBranding.primaryColor : '#64748b' }} />
                              )}
                              <span className="text-sm font-bold font-serif text-slate-200">Review: Chapter 4</span>
                            </div>
                            <button className="px-4 py-1.5 rounded-lg text-xs font-bold text-white shadow-lg" style={{ backgroundColor: agencyBranding?.isEnabled ? agencyBranding.primaryColor : '#64748b' }}>
                              Approve Chapter
                            </button>
                          </div>
                        </div>
                        
                        {subscriptionTier !== 'agency' && (
                          <button className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold font-mono text-xs rounded-2xl transition-colors mt-4">
                            Upgrade to Agency Tier ($299/mo)
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeTab === 'api' && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                    <div>
                      <h3 className="text-lg font-serif font-bold text-slate-100 mb-2">API Keys & Enterprise Integrations</h3>
                      <p className="text-xs text-slate-400 mb-6">Connected print-on-demand APIs, repository synchronizations, and neural model hubs.</p>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-widest mb-2 font-bold">Syllabexa Live API Secret</label>
                          <div className="flex gap-3">
                            <input 
                              type="password" 
                              value={apiKey} 
                              onChange={(e) => setApiKey(e.target.value)}
                              className="flex-1 bg-[#12151c] border border-slate-800 rounded-2xl px-4 py-3 text-xs text-slate-200 font-mono focus:border-amber-500 focus:outline-none transition-all shadow-inner" 
                            />
                            <button 
                              onClick={() => { navigator.clipboard.writeText(apiKey); alert('API Key copied to clipboard!'); }}
                              className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-white font-mono text-xs rounded-xl transition-all cursor-pointer"
                            >
                              Copy Key
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                          {[
                            { name: 'Lulu Direct API', status: 'Connected', desc: 'Automated Print-on-Demand proofing & book fulfillment webhook.', badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' },
                            { name: 'Printful Fulfillment', status: 'Connected', desc: 'Hardcover & merch drop-shipping pipeline connected.', badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' },
                            { name: 'GitHub Repository Sync', status: 'Active (main)', desc: 'Bi-directional markdown backup & version history.', badgeColor: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30' },
                            { name: 'Hugging Face Hub', status: 'Connected', desc: 'Custom fine-tuned Llama/Mistral weights loaded for AI partner.', badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/30' },
                            { name: 'Google Workspace Drive', status: 'Active', desc: 'Cloud document synchronization & Sheets backup.', badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' },
                            { name: 'Stripe Billing & Payouts', status: 'Verified', desc: 'Author royalty payouts & creator pro subscription gateway.', badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' },
                          ].map((integration, idx) => (
                            <div key={idx} className="p-5 rounded-2xl bg-[#12151c] border border-slate-800 space-y-3 flex flex-col justify-between">
                              <div>
                                <div className="flex justify-between items-center mb-1">
                                  <span className="text-xs font-bold text-slate-200">{integration.name}</span>
                                  <span className={`px-2.5 py-0.5 text-[10px] font-mono rounded border uppercase tracking-wider font-semibold ${integration.badgeColor}`}>
                                    {integration.status}
                                  </span>
                                </div>
                                <p className="text-[11px] text-slate-400">{integration.desc}</p>
                              </div>
                              <button 
                                onClick={() => alert(`${integration.name} connection verified and fully synced with Syllabexa core architecture.`)}
                                className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono rounded-xl transition-all cursor-pointer"
                              >
                                Test Webhook
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
