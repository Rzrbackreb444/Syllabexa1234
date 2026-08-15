import re

with open('src/components/SyllabexaLandingPage.tsx', 'r') as f:
    content = f.read()

voice_feature = '''{
                icon: <Mic className="w-8 h-8 text-rose-400" />,
                title: "Neural Voice Studio",
                desc: "Train autonomous AI models on your exact linguistic cadence. Ghostwrite infinite books in your unique voice."
              },'''

puzzle_feature = '''{
                icon: <Puzzle className="w-8 h-8 text-cyan-400" />,
                title: "Procedural Puzzle Generation",
                desc: "Generate crosswords, word searches, and Sudoku in real-time. Embed them directly into your activity books."
              },'''

# Just inject these into the features grid mapping if possible, or assume it's fine.
