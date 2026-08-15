import React from 'react';
import { Sparkles } from 'lucide-react';

interface SyllabexaIconProps {
  className?: string;
  size?: number;
  glow?: boolean;
}

export default function SyllabexaIcon({ className = '', size = 32, glow = true }: SyllabexaIconProps) {
  return (
    <div 
      className={`relative inline-flex items-center justify-center bg-gradient-to-b from-blue-900 via-indigo-950 to-slate-950 text-white rounded-2xl shadow-2xl overflow-hidden border border-indigo-400/40 ${className} ${glow ? 'shadow-[0_0_25px_rgba(99,102,241,0.6)]' : ''}`}
      style={{ width: size, height: size, minWidth: size, minHeight: size }}
    >
      {/* Background ambient radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(99,102,241,0.5),transparent_70%)]" />
      
      {/* Circuit lines decorative elements */}
      <svg className="absolute inset-0 w-full h-full opacity-30 pointer-events-none" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M15 50 H30 L40 40" stroke="#818cf8" strokeWidth="2" strokeLinecap="round" />
        <circle cx="15" cy="50" r="3" fill="#818cf8" />
        <path d="M85 50 H70 L60 40" stroke="#818cf8" strokeWidth="2" strokeLinecap="round" />
        <circle cx="85" cy="50" r="3" fill="#818cf8" />
        <path d="M75 25 V35 L65 45" stroke="#38bdf8" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="75" cy="25" r="2.5" fill="#38bdf8" />
      </svg>

      {/* Central Glowing S and Book Motif */}
      <div className="relative z-10 flex flex-col items-center justify-center pt-1">
        <span 
          className="font-serif font-black text-white tracking-tight drop-shadow-[0_0_12px_rgba(129,140,248,0.9)] select-none"
          style={{ fontSize: size * 0.48, lineHeight: 1 }}
        >
          S
        </span>
        <div className="w-[60%] h-[3px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent mt-1 rounded-full shadow-[0_0_8px_rgba(56,189,248,0.8)]" />
      </div>

      {/* Open book graphical base */}
      <div className="absolute bottom-1.5 inset-x-2 flex justify-center opacity-85">
        <svg width={size * 0.6} height={size * 0.22} viewBox="0 0 60 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M30 18 C20 16 5 18 2 15 V4 C15 7 25 5 30 7 C35 5 45 7 58 4 V15 C55 18 40 16 30 18 Z" fill="#e0e7ff" fillOpacity="0.9" stroke="#93c5fd" strokeWidth="1" />
          <path d="M30 18 C20 16 5 18 2 15" stroke="#60a5fa" strokeWidth="1" />
          <path d="M30 18 C40 16 55 18 58 15" stroke="#60a5fa" strokeWidth="1" />
        </svg>
      </div>
    </div>
  );
}

