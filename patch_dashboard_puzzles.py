import re

with open('src/components/QuickStartDashboard.tsx', 'r') as f:
    content = f.read()

# Make it active
content = content.replace(
    'bg-[#0c0e12]/50 border border-slate-800/50 rounded-3xl p-6 md:p-8 flex flex-col justify-between shadow-xl relative overflow-hidden opacity-75',
    'bg-[#0c0e12] hover:bg-[#12151c] border border-slate-800 hover:border-cyan-500/50 rounded-3xl p-6 md:p-8 flex flex-col justify-between shadow-xl relative overflow-hidden transition-all group cursor-pointer'
)
content = content.replace(
    'bg-slate-800/50 border border-slate-700 flex items-center justify-center text-slate-500 shadow-inner',
    'bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shadow-inner group-hover:scale-110 transition-transform'
)
content = content.replace(
    '<h3 className="text-xl font-bold font-serif text-slate-400">Puzzle Generation</h3>',
    '<h3 className="text-xl font-bold font-serif text-slate-200 group-hover:text-cyan-300 transition-colors">Procedural Puzzles</h3>'
)

# Add the onClick handler
content = content.replace(
    '            {/* 3. Puzzle Generation Card (Quarantined) */}\n            <motion.div',
    '            {/* 3. Puzzle Generation Card */}\n            <motion.div\n              onClick={() => onOpenStudio(\'syllabexa-puzzle\')}'
)

with open('src/components/QuickStartDashboard.tsx', 'w') as f:
    f.write(content)
