const fs = require('fs');
const file = './src/components/SettingsHub.tsx';
let content = fs.readFileSync(file, 'utf8');

// Add agency tab
content = content.replace(
  `'account' | 'appearance' | 'security' | 'notifications' | 'api'`,
  `'account' | 'appearance' | 'security' | 'notifications' | 'api' | 'agency'`
);

content = content.replace(
  `const [notificationsEnabled, setNotificationsEnabled] = useState(true);`,
  `const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const agencyBranding = useManuscriptStore((state) => state.agencyBranding);
  const updateAgencyBranding = useManuscriptStore((state) => state.updateAgencyBranding);
  const subscriptionTier = useManuscriptStore((state) => state.subscriptionTier);`
);

content = content.replace(
  `<button 
                onClick={() => setActiveTab('api')}`,
  `<button 
                onClick={() => setActiveTab('agency')}
                className={\`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl font-mono text-xs font-bold uppercase tracking-widest transition-all text-left cursor-pointer \${activeTab === 'agency' ? 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/30 shadow-md' : 'hover:bg-[#12151c] text-slate-400 hover:text-slate-200 border border-transparent'}\`}
              >
                <div className="flex items-center gap-3"><Users size={16} /> Agency Portal</div>
                {subscriptionTier === 'agency' && <span className="text-[9px] bg-indigo-500/20 text-indigo-400 px-1.5 py-0.5 rounded border border-indigo-500/40">PRO</span>}
              </button>
              <button 
                onClick={() => setActiveTab('api')}`
);

// We need to import Users
content = content.replace(
  `Key, Cpu`,
  `Key, Cpu, Users, Hexagon`
);

const agencyContent = `
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
                      
                      <div className={\`space-y-6 \${subscriptionTier !== 'agency' ? 'opacity-50 pointer-events-none grayscale' : ''}\`}>
                        <div className="flex items-center justify-between p-5 bg-[#12151c] border border-slate-800 rounded-2xl">
                          <div>
                            <div className="text-sm font-bold text-slate-200">Enable White-Label Portal</div>
                            <div className="text-xs text-slate-500 mt-1">Replace Syllabexa branding with your own on shared links.</div>
                          </div>
                          <button 
                            onClick={() => updateAgencyBranding({ isEnabled: !agencyBranding?.isEnabled })}
                            className={\`w-12 h-6 rounded-full transition-colors relative \${agencyBranding?.isEnabled ? 'bg-indigo-500' : 'bg-slate-700'}\`}
                          >
                            <div className={\`w-4 h-4 bg-white rounded-full absolute top-1 transition-all \${agencyBranding?.isEnabled ? 'left-7' : 'left-1'}\`} />
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
`;

content = content.replace(
  `{activeTab === 'api' && (`,
  agencyContent + `\n                {activeTab === 'api' && (`
);

fs.writeFileSync(file, content);
console.log('Patched SettingsHub.tsx');
