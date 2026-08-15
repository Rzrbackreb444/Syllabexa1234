import React, { useState } from 'react';
import { BookOpen, BarChart2, CheckCircle2, AlertCircle, X, HelpCircle } from 'lucide-react';

interface ReadabilityScoreProps {
  manuscriptText: string;
}

export default function ReadabilityScore({ manuscriptText }: ReadabilityScoreProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Calculate stats
  const words = manuscriptText.trim() ? manuscriptText.trim().split(/\s+/) : [];
  const wordCount = words.length;
  
  // Sentences count (split by . ! ?)
  const sentences = manuscriptText.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const sentenceCount = Math.max(1, sentences.length);

  // Syllable counting approximation
  const countSyllables = (word: string) => {
    const cleaned = word.toLowerCase().replace(/[^a-z]/g, '');
    if (cleaned.length <= 3) return 1;
    const match = cleaned.match(/[aeiouy]{1,2}/g);
    return match ? Math.max(1, match.length) : 1;
  };

  const totalSyllables = words.reduce((acc, word) => acc + countSyllables(word), 0);

  // Flesch Reading Ease: 206.835 - 1.015 * (words/sentences) - 84.6 * (syllables/words)
  const wordsPerSentence = wordCount > 0 ? wordCount / sentenceCount : 0;
  const syllablesPerWord = wordCount > 0 ? totalSyllables / wordCount : 0;

  const readingEase = wordCount > 0 
    ? Math.max(0, Math.min(100, 206.835 - (1.015 * wordsPerSentence) - (84.6 * syllablesPerWord))) 
    : 100;

  // Flesch-Kincaid Grade Level: 0.39 * (words/sentences) + 11.8 * (syllables/words) - 15.59
  const gradeLevel = wordCount > 0 
    ? Math.max(0, (0.39 * wordsPerSentence) + (11.8 * syllablesPerWord) - 15.59) 
    : 0;

  const getReadingEaseLabel = (score: number) => {
    if (score >= 90) return 'Very Easy (5th Grade)';
    if (score >= 80) return 'Easy (6th Grade)';
    if (score >= 70) return 'Fairly Easy (7th Grade)';
    if (score >= 60) return 'Standard (8th-9th Grade)';
    if (score >= 50) return 'Fairly Difficult (High School)';
    if (score >= 30) return 'Difficult (College)';
    return 'Very Difficult (Academic / Professional)';
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-3 py-1.5 bg-slate-900 border border-slate-800 hover:border-indigo-500 text-slate-300 hover:text-indigo-400 rounded-lg text-xs font-mono flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
        title="Flesch-Kincaid Readability & Grade Level"
      >
        <BookOpen size={14} className="text-indigo-400" />
        <span>Readability: {readingEase.toFixed(0)}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-[#0c0e12] border border-slate-800 rounded-2xl shadow-2xl z-[100] p-4 font-sans animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
            <div className="flex items-center gap-2">
              <BookOpen size={16} className="text-indigo-400" />
              <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">Flesch-Kincaid Readability Audit</span>
            </div>
            <button onClick={() => setIsOpen(false)} className="p-1.5 text-slate-500 hover:text-white rounded-lg cursor-pointer">
              <X size={14} />
            </button>
          </div>

          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3">
                <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Reading Ease</div>
                <div className="text-2xl font-bold font-mono text-indigo-400 mt-0.5">{readingEase.toFixed(1)}</div>
                <div className="text-[10px] text-slate-400 mt-1">{getReadingEaseLabel(readingEase)}</div>
              </div>
              <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3">
                <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Grade Level</div>
                <div className="text-2xl font-bold font-mono text-cyan-400 mt-0.5">{gradeLevel.toFixed(1)}</div>
                <div className="text-[10px] text-slate-400 mt-1">U.S. School Grade Equivalent</div>
              </div>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3.5 space-y-2.5">
              <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Document Statistics</div>
              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <div className="flex justify-between bg-black/40 p-2 rounded border border-slate-800">
                  <span className="text-slate-400">Total Words:</span>
                  <span className="text-white font-bold">{wordCount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between bg-black/40 p-2 rounded border border-slate-800">
                  <span className="text-slate-400">Sentences:</span>
                  <span className="text-white font-bold">{sentenceCount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between bg-black/40 p-2 rounded border border-slate-800">
                  <span className="text-slate-400">Avg Words/Sent:</span>
                  <span className="text-white font-bold">{wordsPerSentence.toFixed(1)}</span>
                </div>
                <div className="flex justify-between bg-black/40 p-2 rounded border border-slate-800">
                  <span className="text-slate-400">Avg Syllables/Word:</span>
                  <span className="text-white font-bold">{syllablesPerWord.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="bg-indigo-500/10 border border-indigo-500/20 p-3 rounded-xl text-xs text-indigo-300 leading-relaxed">
              <div className="font-bold mb-1 flex items-center gap-1.5">
                <BarChart2 size={14} /> Stylistic Recommendation
              </div>
              {gradeLevel > 14 ? (
                <span>Your prose has a high academic/professional density. Consider shortening sentences to increase reader engagement.</span>
              ) : gradeLevel < 6 ? (
                <span>Your prose is exceptionally accessible and fast-paced, suitable for broad audiences or younger demographics.</span>
              ) : (
                <span>Your prose is exceptionally well-balanced, matching best-selling contemporary fiction and non-fiction standards.</span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
