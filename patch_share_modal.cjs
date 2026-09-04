const fs = require('fs');
const file = './src/components/ManuscriptEditor.tsx';
let content = fs.readFileSync(file, 'utf8');

const shareModalHtml = `
      {/* Share / Review Portal Modal */}
      <AnimatePresence>
        {isShareModalOpen && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }} 
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#0e1117] border border-indigo-500/30 rounded-2xl max-w-xl w-full p-6 shadow-2xl relative"
            >
              <button 
                onClick={() => setIsShareModalOpen(false)}
                className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-indigo-500/10 border border-indigo-500/30 rounded-xl text-indigo-400">
                  <Share2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white font-serif tracking-wide">Client Review & Approval Portal</h3>
                  <p className="text-xs text-slate-400">Generate secure, trackable links for external stakeholders.</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-300">Access Level</label>
                    <select className="bg-black border border-slate-700 text-slate-300 text-xs rounded-lg px-2 py-1 outline-none">
                      <option>Comment & Approve</option>
                      <option>Read Only</option>
                    </select>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <input 
                      type="text" 
                      readOnly 
                      value="https://syllabexa.com/r/ch4-a9f2b1c" 
                      className="flex-1 bg-black border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-400 font-mono"
                    />
                    <button 
                      onClick={() => showToast('Review link copied to clipboard!', 'success')}
                      className="p-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors cursor-pointer"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-xl">
                  <h4 className="text-sm font-bold text-emerald-400 mb-1">Optimistic Locking & Approval Workflow</h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    When the client clicks "Approve Chapter", Syllabexa validates the AST against commit hash <span className="font-mono text-emerald-300">[{commitHash}]</span> to prevent race conditions. Upon verification, the Director Agent is unlocked for the next chapter.
                  </p>
                </div>
                
                {/* Agency Branding Preview */}
                <div className="pt-4 border-t border-slate-800">
                  <h4 className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest mb-3">Agency White-Label Preview</h4>
                  <div className="flex items-center justify-between p-3 rounded-lg border shadow-sm" style={{ 
                    backgroundColor: useManuscriptStore.getState().agencyBranding?.isEnabled ? '#12151c' : '#0f172a',
                    borderColor: useManuscriptStore.getState().agencyBranding?.isEnabled ? useManuscriptStore.getState().agencyBranding?.primaryColor : '#334155'
                  }}>
                    <div className="flex items-center gap-2">
                      {useManuscriptStore.getState().agencyBranding?.isEnabled && useManuscriptStore.getState().agencyBranding?.logoUrl ? (
                        <img src={useManuscriptStore.getState().agencyBranding?.logoUrl} alt="Agency Logo" className="h-5 object-contain" />
                      ) : (
                        <div className="w-5 h-5 rounded flex items-center justify-center text-white font-bold text-[10px]" style={{ backgroundColor: useManuscriptStore.getState().agencyBranding?.isEnabled ? useManuscriptStore.getState().agencyBranding?.primaryColor : '#64748b' }}>
                          A
                        </div>
                      )}
                      <span className="text-xs font-bold text-white">Client Review: Chapter 4</span>
                    </div>
                    <button className="px-3 py-1 rounded text-[10px] font-bold text-white shadow" style={{ backgroundColor: useManuscriptStore.getState().agencyBranding?.isEnabled ? useManuscriptStore.getState().agencyBranding?.primaryColor : '#64748b' }}>
                      Approve
                    </button>
                  </div>
                </div>

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
`;

content = content.replace(`    </div>\n  );\n}`, shareModalHtml);

// Make sure X and Copy are imported
if (!content.includes('import { X }')) {
  // We can just rely on the existing lucide-react import
}

fs.writeFileSync(file, content);
console.log('Patched ManuscriptEditor.tsx for Share Modal');
