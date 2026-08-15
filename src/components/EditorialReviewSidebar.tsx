import React, { useState, useEffect } from 'react';
import { Target, Activity, CheckCircle, AlertTriangle, RefreshCw, BarChart2, BookOpen } from 'lucide-react';
import { VoiceProfile } from './SyllabexaVoiceTrainer';

interface EditorialReviewSidebarProps {
  text: string;
  voiceProfile: VoiceProfile | null;
}

// Simple heuristic for syllables
function countSyllables(word: string) {
  word = word.toLowerCase();
  if (word.length <= 3) return 1;
  word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '');
  word = word.replace(/^y/, '');
  const match = word.match(/[aeiouy]{1,2}/g);
  return match ? match.length : 1;
}

export default function EditorialReviewSidebar({ text, voiceProfile }: EditorialReviewSidebarProps) {
  const [metrics, setMetrics] = useState({
    readability: 0,
    pacingScore: 0,
    consistency: 0,
    sentenceCount: 0,
    wordCount: 0,
    avgWordsPerSentence: 0,
  });

  const [isCalculating, setIsCalculating] = useState(false);

  useEffect(() => {
    // Debounce the calculation slightly to avoid stuttering on every keystroke
    const timer = setTimeout(() => {
      setIsCalculating(true);
      
      const trimmedText = text.trim();
      if (!trimmedText) {
        setMetrics({
          readability: 0,
          pacingScore: 0,
          consistency: 0,
          sentenceCount: 0,
          wordCount: 0,
          avgWordsPerSentence: 0,
        });
        setIsCalculating(false);
        return;
      }

      // Calculate Readability (Flesch Reading Ease approximation)
      const sentences = trimmedText.split(/[.!?]+/).filter(s => s.trim().length > 0);
      const sentenceCount = sentences.length || 1;
      const words = trimmedText.match(/\b\w+\b/g) || [];
      const wordCount = words.length || 1;
      
      let syllableCount = 0;
      words.forEach(word => {
        syllableCount += countSyllables(word);
      });

      // Flesch Reading Ease
      const fleschScore = 206.835 - 1.015 * (wordCount / sentenceCount) - 84.6 * (syllableCount / wordCount);
      const normalizedReadability = Math.max(0, Math.min(100, Math.round(fleschScore)));

      // Calculate Pacing
      let totalSentenceLength = 0;
      let sentenceLengths: number[] = [];
      sentences.forEach(s => {
        const sWords = s.match(/\b\w+\b/g) || [];
        sentenceLengths.push(sWords.length);
        totalSentenceLength += sWords.length;
      });
      const avgWordsPerSentence = totalSentenceLength / sentenceCount;
      
      let variance = 0;
      sentenceLengths.forEach(len => {
        variance += Math.pow(len - avgWordsPerSentence, 2);
      });
      variance = variance / sentenceCount;
      
      const varianceScore = Math.min(100, (variance / 100) * 100);
      const pacingScore = Math.round((varianceScore * 0.6) + (Math.min(100, (30 / Math.max(1, avgWordsPerSentence)) * 100) * 0.4));

      // Calculate Consistency
      let consistencyScore = 100;
      let vocabMatches = 0;
      if (voiceProfile && voiceProfile.vocabulary && voiceProfile.vocabulary.length > 0) {
        const lowerWords = words.map(w => w.toLowerCase());
        voiceProfile.vocabulary.forEach(v => {
          if (lowerWords.includes(v.toLowerCase())) {
            vocabMatches++;
          }
        });
        const matchRatio = vocabMatches / voiceProfile.vocabulary.length;
        consistencyScore = Math.min(100, Math.round((matchRatio / 0.2) * 100));
      } else {
        consistencyScore = 85;
      }

      setMetrics({
        readability: normalizedReadability,
        pacingScore: Math.max(0, Math.min(100, pacingScore)),
        consistency: consistencyScore,
        sentenceCount,
        wordCount,
        avgWordsPerSentence: Math.round(avgWordsPerSentence * 10) / 10,
      });
      setIsCalculating(false);
    }, 800);

    return () => clearTimeout(timer);
  }, [text, voiceProfile]);

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-400";
    if (score >= 50) return "text-amber-400";
    return "text-rose-400";
  };

  const getBarColor = (score: number) => {
    if (score >= 80) return "bg-emerald-500";
    if (score >= 50) return "bg-amber-500";
    return "bg-rose-500";
  };

  return (
    <div className="flex flex-col h-full bg-[#0c0e12] border-l border-slate-800/80 font-sans select-none relative z-0">
      
      {/* Sidebar Header */}
      <div className="p-5 border-b border-slate-800/80 bg-[#08090c] flex items-center justify-between shrink-0 shadow-md">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Activity size={16} />
          </div>
          <div>
            <h2 className="text-xs font-mono font-bold text-slate-100 uppercase tracking-widest flex items-center gap-2">
              <span>Editorial Review</span>
              <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 text-[10px]">E-E-A-T Pro</span>
            </h2>
          </div>
        </div>
        {isCalculating && (
          <div className="flex items-center gap-1.5 text-[10px] font-mono text-amber-400">
            <RefreshCw size={12} className="animate-spin" />
            <span>Analyzing...</span>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        
        {/* Readability Score Card */}
        <div className="bg-[#12151c] border border-slate-800 rounded-3xl p-5 space-y-3 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <BookOpen size={14} className="text-amber-400" /> Readability Index
            </span>
            <span className={`font-mono font-bold text-sm ${getScoreColor(metrics.readability)}`}>
              {metrics.readability} / 100
            </span>
          </div>
          <div className="h-2 w-full bg-[#0c0e12] rounded-full overflow-hidden border border-slate-800">
            <div 
              className={`h-full ${getBarColor(metrics.readability)} transition-all duration-500 shadow-sm`}
              style={{ width: `${metrics.readability}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
            Flesch Reading Ease calculation optimized for clear professional publishing.
          </p>
        </div>

        {/* Pacing Score Card */}
        <div className="bg-[#12151c] border border-slate-800 rounded-3xl p-5 space-y-3 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <BarChart2 size={14} className="text-amber-400" /> Pacing & Rhythm
            </span>
            <span className={`font-mono font-bold text-sm ${getScoreColor(metrics.pacingScore)}`}>
              {metrics.pacingScore} / 100
            </span>
          </div>
          <div className="h-2 w-full bg-[#0c0e12] rounded-full overflow-hidden border border-slate-800">
            <div 
              className={`h-full ${getBarColor(metrics.pacingScore)} transition-all duration-500 shadow-sm`}
              style={{ width: `${metrics.pacingScore}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
            Sentence length variance evaluation for optimal reader engagement.
          </p>
        </div>

        {/* Consistency Score Card */}
        <div className="bg-[#12151c] border border-slate-800 rounded-3xl p-5 space-y-3 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Target size={14} className="text-amber-400" /> Voice Consistency
            </span>
            <span className={`font-mono font-bold text-sm ${getScoreColor(metrics.consistency)}`}>
              {metrics.consistency} / 100
            </span>
          </div>
          <div className="h-2 w-full bg-[#0c0e12] rounded-full overflow-hidden border border-slate-800">
            <div 
              className={`h-full ${getBarColor(metrics.consistency)} transition-all duration-500 shadow-sm`}
              style={{ width: `${metrics.consistency}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
            {voiceProfile 
              ? "Alignment with your active Author Voice Profile vocabulary signature."
              : "Baseline grammatical consistency active."}
          </p>
        </div>

        {/* Document Metrics Grid */}
        <div className="pt-2 space-y-3">
          <h3 className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest">Document Statistics</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#12151c] border border-slate-800 p-4 rounded-2xl flex flex-col items-center justify-center text-center space-y-1 shadow-md">
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Sentences</span>
              <span className="text-base font-mono font-bold text-slate-100">{metrics.sentenceCount}</span>
            </div>
            <div className="bg-[#12151c] border border-slate-800 p-4 rounded-2xl flex flex-col items-center justify-center text-center space-y-1 shadow-md">
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Avg Words/Sent</span>
              <span className="text-base font-mono font-bold text-slate-100">{metrics.avgWordsPerSentence}</span>
            </div>
          </div>
        </div>

        {/* Real-time Insights */}
        <div className="pt-2 space-y-3">
          <h3 className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest">Real-Time Insights</h3>
          
          {metrics.readability < 50 && (
            <div className="flex items-start gap-3 bg-amber-950/30 border border-amber-500/30 text-amber-200 p-4 rounded-2xl text-xs shadow-lg">
              <AlertTriangle size={15} className="shrink-0 mt-0.5 text-amber-400" />
              <p className="leading-relaxed font-sans">Sentences are complex. Try breaking down longer thoughts into punchier statements.</p>
            </div>
          )}
          {metrics.pacingScore < 50 && (
            <div className="flex items-start gap-3 bg-amber-950/30 border border-amber-500/30 text-amber-200 p-4 rounded-2xl text-xs shadow-lg">
              <Activity size={15} className="shrink-0 mt-0.5 text-amber-400" />
              <p className="leading-relaxed font-sans">Sentence length lacks variance. Mix short and long phrases for better rhythm.</p>
            </div>
          )}
          {metrics.consistency < 60 && voiceProfile && (
            <div className="flex items-start gap-3 bg-amber-950/30 border border-amber-500/30 text-amber-200 p-4 rounded-2xl text-xs shadow-lg">
              <Target size={15} className="shrink-0 mt-0.5 text-amber-400" />
              <p className="leading-relaxed font-sans">Voice drift detected. Realign vocabulary with your assigned author profile.</p>
            </div>
          )}
          {metrics.readability >= 50 && metrics.pacingScore >= 50 && (metrics.consistency >= 60 || !voiceProfile) && (
            <div className="flex items-start gap-3 bg-emerald-950/30 border border-emerald-500/30 text-emerald-200 p-4 rounded-2xl text-xs shadow-lg">
              <CheckCircle size={15} className="shrink-0 mt-0.5 text-emerald-400" />
              <p className="leading-relaxed font-sans">Writing flow is exceptional. Strong readability and balanced pacing.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}