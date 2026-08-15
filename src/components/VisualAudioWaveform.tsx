import React, { useEffect, useState } from 'react';
import { Activity, Radio, Clock, Plus, Sliders, Zap } from 'lucide-react';
import { useToast } from '../lib/ToastContext';

interface ProsodyMarker {
  id: string;
  positionPercent: number;
  type: 'pause' | 'speed_change';
  label: string;
  value: string;
}

interface VisualAudioWaveformProps {
  status: 'idle' | 'synthesizing' | 'playing';
  progress: number;
  voiceName: string;
}

export default function VisualAudioWaveform({ status, progress, voiceName }: VisualAudioWaveformProps) {
  const [bars, setBars] = useState<number[]>(Array.from({ length: 64 }, () => 20));
  const [markers, setMarkers] = useState<ProsodyMarker[]>([
    { id: 'm1', positionPercent: 25, type: 'pause', label: 'Dramatic Pause (1.2s)', value: '+1.2s' },
    { id: 'm2', positionPercent: 65, type: 'speed_change', label: 'Tempo Acceleration (0.9x)', value: '0.9x' }
  ]);
  const [selectedMarkerId, setSelectedMarkerId] = useState<string | null>(null);
  const { showToast } = useToast();

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (status === 'playing' || status === 'synthesizing') {
      interval = setInterval(() => {
        setBars(Array.from({ length: 64 }, () => Math.floor(15 + Math.random() * 75)));
      }, 100);
    } else {
      setBars(Array.from({ length: 64 }, () => 15));
    }
    return () => clearInterval(interval);
  }, [status]);

  const handleAddMarker = (type: 'pause' | 'speed_change') => {
    const newPos = Math.round(progress > 0 ? progress : 45);
    const newMarker: ProsodyMarker = {
      id: `m-${Date.now()}`,
      positionPercent: newPos,
      type,
      label: type === 'pause' ? 'Dramatic Pause (0.8s)' : 'Tempo Shift (1.1x)',
      value: type === 'pause' ? '+0.8s' : '1.1x'
    };
    setMarkers([...markers, newMarker]);
    showToast(`Added Gemini prosody marker: ${newMarker.label} at ${newPos}% timeline.`, 'success');
  };

  const handleRemoveMarker = (id: string) => {
    setMarkers(markers.filter(m => m.id !== id));
    showToast('Removed prosody marker.', 'info');
  };

  return (
    <div className="bg-[#0a0a0d] border border-white/5 p-5 rounded-2xl space-y-4 font-sans">
      <div className="flex items-center justify-between">
        <span className="text-xs font-mono font-bold text-white uppercase flex items-center gap-2">
          <Activity size={14} className="text-indigo-400" /> Real-Time Neural Audio Waveform & Prosody
        </span>
        <span className={`text-[10px] font-mono px-2.5 py-0.5 rounded flex items-center gap-1.5 ${
          status === 'playing' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 animate-pulse' :
          status === 'synthesizing' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30 animate-pulse' :
          'bg-white/5 text-slate-400'
        }`}>
          <Radio size={10} />
          {status.toUpperCase()} ({progress.toFixed(0)}%)
        </span>
      </div>

      {/* Dynamic Animated Waveform Bars with Prosody Marker Pins */}
      <div className="relative pt-6 pb-2">
        {/* Marker Badges on Timeline */}
        <div className="absolute top-0 left-0 right-0 h-6 flex items-center px-3 pointer-events-none">
          {markers.map(m => (
            <div
              key={m.id}
              className="absolute transform -translate-x-1/2 pointer-events-auto cursor-pointer group"
              style={{ left: `${m.positionPercent}%` }}
              onClick={() => setSelectedMarkerId(selectedMarkerId === m.id ? null : m.id)}
            >
              <div className={`px-1.5 py-0.5 rounded text-[9px] font-mono border shadow-md flex items-center gap-1 transition-all ${
                m.type === 'pause' ? 'bg-amber-500/20 border-amber-500/40 text-amber-300' : 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300'
              }`}>
                <Clock size={9} />
                <span>{m.value}</span>
              </div>
              <div className="w-0.5 h-4 bg-white/40 mx-auto" />
            </div>
          ))}
        </div>

        {/* Waveform Container */}
        <div className="h-20 bg-black/70 rounded-xl border border-white/5 flex items-center justify-between px-3 overflow-hidden shadow-inner relative">
          {bars.map((height, i) => {
            const isActive = (i / bars.length) * 100 <= progress;
            return (
              <div
                key={i}
                className={`w-1 rounded-full transition-all duration-100 ${
                  isActive 
                    ? 'bg-indigo-400 shadow-[0_0_10px_rgba(99,102,241,0.7)]' 
                    : status === 'synthesizing' 
                    ? 'bg-amber-500/50' 
                    : 'bg-slate-700/50'
                }`}
                style={{ height: `${status === 'idle' ? 15 : height}%` }}
              />
            );
          })}
        </div>
      </div>

      {/* Prosody Marker Action Toolbar */}
      <div className="flex items-center justify-between pt-2 border-t border-white/5 text-xs">
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleAddMarker('pause')}
            className="px-2.5 py-1 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 rounded-lg text-[10px] font-mono flex items-center gap-1 transition-all cursor-pointer"
          >
            <Plus size={12} /> + Dramatic Pause
          </button>
          <button
            onClick={() => handleAddMarker('speed_change')}
            className="px-2.5 py-1 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 rounded-lg text-[10px] font-mono flex items-center gap-1 transition-all cursor-pointer"
          >
            <Zap size={12} /> + Speed Shift
          </button>
        </div>

        <div className="text-[11px] font-mono text-slate-400 flex items-center gap-2">
          <span>Voice: <strong className="text-white">{voiceName}</strong></span>
          {markers.length > 0 && (
            <button
              onClick={() => handleRemoveMarker(markers[markers.length - 1].id)}
              className="text-[10px] text-red-400 hover:text-red-300 underline cursor-pointer ml-2"
            >
              Clear Last Marker
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

