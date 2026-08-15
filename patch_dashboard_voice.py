import re

with open('src/components/QuickStartDashboard.tsx', 'r') as f:
    content = f.read()

# Make it active
content = content.replace(
    'bg-[#0c0e12]/50 border border-slate-800/50 rounded-3xl p-6 md:p-8 flex flex-col justify-between shadow-xl relative overflow-hidden opacity-75',
    'bg-[#0c0e12] hover:bg-[#12151c] border border-slate-800 hover:border-amber-500/50 rounded-3xl p-6 md:p-8 flex flex-col justify-between shadow-xl relative overflow-hidden transition-all group cursor-pointer'
)
# Make sure it's linked
content = content.replace(
    '            {/* 4. Voice Studio Card (Quarantined) */}\n            <motion.div\n              className="bg-[#0c0e12] hover:bg-[#12151c] border border-slate-800 hover:border-cyan-500/50',
    '            {/* 4. Voice Studio Card */}\n            <motion.div\n              onClick={() => onOpenStudio(\'syllabexa-voice\')}\n              className="bg-[#0c0e12] hover:bg-[#12151c] border border-slate-800 hover:border-amber-500/50'
)

with open('src/components/QuickStartDashboard.tsx', 'w') as f:
    f.write(content)
