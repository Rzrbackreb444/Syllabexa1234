import React, { useState } from 'react';
import { Sparkles, Calendar, BookOpen, Layers, RefreshCw, CheckCircle, Flame } from 'lucide-react';
import { VoiceProfile } from './SyllabexaVoiceTrainer';

interface SeriesPlannerProps {
  voiceProfile: VoiceProfile | null;
}

interface SeriesBook {
  title: string;
  focus: string;
  notes: string;
}

export default function SyllabexaSeriesPlanner({ voiceProfile }: SeriesPlannerProps) {
  const [seriesTopic, setSeriesTopic] = useState("");
  const [bookCount, setBookCount] = useState(3);
  const [isGenerating, setIsGenerating] = useState(false);
  const [seriesPlan, setSeriesPlan] = useState<SeriesBook[]>([]);

  const handlePlanSeries = async () => {
    if (!seriesTopic.trim()) {
      alert("Please enter a core topic for the series.");
      return;
    }

    setIsGenerating(true);
    setSeriesPlan([]);

    try {
      const response = await fetch('/api/syllabexa/plan-series', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          voiceProfile,
          seriesTopic,
          bookCount
        })
      });

      if (!response.ok) {
        throw new Error("Failed to plan series sequences.");
      }

      const result = await response.json();
      setSeriesPlan(result.series_plan || []);
    } catch (err) {
      console.error(err);
      alert("Error planning book series.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <aside aria-label="Syllabexa Series and Batch Planner" className="p-6 max-w-4xl mx-auto space-y-8 animate-fade-in text-slate-800 custom-scrollbar">
      <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
        <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
          <Calendar size={24} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900">Syllabexa Series & Batch Planner</h2>
          <p className="text-sm text-slate-500">Plan serialized sequencings, design book trilogies, and maintain cohesive brand voice across sequels.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Settings */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white p-5 border border-slate-200 rounded-2xl shadow-sm space-y-4">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-500">Series Configuration</h3>

            {/* Topic Input */}
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Core Theme / Topic</label>
              <input
                type="text"
                placeholder="e.g. Master Class in Prompt Engineering"
                value={seriesTopic}
                onChange={(e) => setSeriesTopic(e.target.value)}
                className="w-full p-2.5 text-xs border border-slate-200 rounded-xl outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            {/* Book count dropdown */}
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Number of Volumes</label>
              <select
                value={bookCount}
                onChange={(e) => setBookCount(Number(e.target.value))}
                className="w-full p-2 text-xs border border-slate-200 rounded-lg outline-none bg-white font-semibold cursor-pointer"
              >
                {[2, 3, 4, 5].map(n => (
                  <option key={n} value={n}>{n} Volumes / Sequels</option>
                ))}
              </select>
            </div>

            {voiceProfile && (
              <div className="p-3 bg-indigo-50/50 border border-indigo-100 rounded-xl flex gap-2 items-center text-[10px] text-indigo-800">
                <Flame size={12} className="text-indigo-600 shrink-0 animate-pulse" />
                <span>Applying voice profile: "{voiceProfile.tone}"</span>
              </div>
            )}

            <button
              onClick={handlePlanSeries}
              disabled={isGenerating || !seriesTopic.trim()}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold rounded-xl text-xs transition-all shadow flex items-center justify-center gap-1.5 cursor-pointer"
            >
              {isGenerating ? (
                <>
                  <RefreshCw size={13} className="animate-spin" />
                  Generating Sequels...
                </>
              ) : (
                <>
                  <Sparkles size={13} />
                  Synthesize Series Blueprint
                </>
              )}
            </button>
          </div>
        </div>

        {/* Output */}
        <section aria-label="Series Output" className="lg:col-span-8">
          {seriesPlan.length > 0 ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <BookOpen size={13} />
                  Planned Volumes Sequencings
                </span>
                <span className="text-[10px] bg-indigo-50 text-indigo-700 border border-indigo-100 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <CheckCircle size={10} />
                  Structure Generated
                </span>
              </div>

              <div className="space-y-4">
                {seriesPlan.map((book, idx) => (
                  <div key={idx} className="bg-white p-5 border border-slate-200 rounded-2xl hover:border-indigo-100 hover:shadow-sm transition-all space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="bg-slate-900 text-white font-bold text-[10px] px-2 py-0.5 rounded-full">
                        Book {idx + 1}
                      </span>
                      <h4 className="font-extrabold text-sm text-slate-900">{book.title}</h4>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed font-medium"><strong className="text-slate-800">Target Focus:</strong> {book.focus}</p>
                    <p className="text-[11px] text-indigo-950 bg-indigo-50/40 p-2.5 border border-indigo-100/30 rounded-xl italic leading-relaxed"><strong className="text-indigo-900 font-semibold block not-italic mb-0.5">Author Voice Strategy:</strong> {book.notes}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-400 space-y-4 flex flex-col items-center justify-center h-full min-h-[350px]">
              <div className="p-3 bg-slate-50 border border-slate-100 rounded-full">
                <Layers size={32} className="text-slate-300" />
              </div>
              <div>
                <p className="font-bold text-sm text-slate-600">No series plan drafted yet</p>
                <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
                  Input a core series topic on the left and hit "Synthesize Series Blueprint" to map out a sequence of sequel titles and brand voices.
                </p>
              </div>
            </div>
          )}
        </section>
      </div>
    </aside>
  );
}