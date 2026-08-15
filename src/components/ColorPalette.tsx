import React from 'react';
import { Trash2, RotateCcw, Paintbrush, Check } from 'lucide-react';
import { motion } from 'motion/react';

interface ColorPaletteProps {
  selectedColor: string;
  onSelectColor: (color: string) => void;
  onReset: () => void;
}

const PREMIUM_SWATCHES = [
  { label: 'Amber Gold', value: '#f59e0b' },
  { label: 'Crimson Red', value: '#ef4444' },
  { label: 'Royal Blue', value: '#3b82f6' },
  { label: 'Emerald Green', value: '#10b981' },
  { label: 'Neon Pink', value: '#ec4899' },
  { label: 'Electric Purple', value: '#8b5cf6' },
  { label: 'Sunset Orange', value: '#f97316' },
  { label: 'Cyan Glow', value: '#06b6d4' },
  { label: 'Deep Obsidian', value: '#000000' },
  { label: 'Pure Canvas', value: '#ffffff' },
  { label: 'Eraser Tool', value: 'none' },
];

export default function ColorPalette({ selectedColor, onSelectColor, onReset }: ColorPaletteProps) {
  // Framer Motion staggered animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.04 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.8, y: 10 },
    show: { opacity: 1, scale: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } }
  };

  return (
    <div className="p-5 border-b border-white/5 bg-[#0a0c10] space-y-5 relative overflow-hidden z-10 shadow-2xl">
      {/* Animated ambient glow */}
      <motion.div 
        animate={{ opacity: [0.2, 0.5, 0.2], scale: [1, 1.1, 1] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -top-16 -right-16 w-36 h-36 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" 
      />

      <div className="flex items-center justify-between relative z-20">
        <h3 className="text-[11px] font-mono text-slate-300 uppercase tracking-widest font-black flex items-center gap-2">
          <Paintbrush size={14} className="text-amber-400" /> Master Palette
        </h3>
        
        {/* Dynamic active state pill */}
        <motion.span 
          key={selectedColor}
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-[9px] font-mono px-2.5 py-1 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/30 shadow-[0_0_10px_rgba(245,158,11,0.1)] font-bold uppercase tracking-wider flex items-center gap-1.5"
        >
          {selectedColor === 'none' ? (
            'Eraser Active'
          ) : (
            <>
              <span 
                className="w-2.5 h-2.5 rounded-full inline-block border border-white/20 shadow-sm" 
                style={{ backgroundColor: selectedColor }} 
              /> 
              {selectedColor}
            </>
          )}
        </motion.span>
      </div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-4 gap-3 relative z-20"
      >
        {PREMIUM_SWATCHES.map((swatch) => {
          const isSelected = selectedColor === swatch.value;
          const isEraser = swatch.value === 'none';
          const isWhite = swatch.value === '#ffffff';

          return (
            <motion.button
              variants={itemVariants}
              whileHover={{ scale: 1.08, y: -2 }}
              whileTap={{ scale: 0.95 }}
              key={swatch.value}
              onClick={() => onSelectColor(swatch.value)}
              className={`group relative h-11 rounded-xl border-2 transition-colors duration-200 cursor-pointer flex items-center justify-center shadow-lg ${
                isSelected 
                  ? 'border-amber-400 ring-4 ring-amber-500/20 z-10' 
                  : 'border-white/10 hover:border-white/30'
              }`}
              style={{ backgroundColor: isEraser ? '#161a26' : swatch.value }}
            >
              {isEraser && <Trash2 size={16} className={`${isSelected ? 'text-amber-400' : 'text-slate-400 group-hover:text-rose-400'} transition-colors`} />}
              {isWhite && !isSelected && <div className="absolute inset-0 rounded-[10px] border border-black/20 pointer-events-none" />}
              
              {/* Checkmark overlay for selected colors */}
              {isSelected && !isEraser && (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute -top-1.5 -right-1.5 bg-amber-500 rounded-full p-0.5 shadow-md text-black">
                  <Check size={10} strokeWidth={4} />
                </motion.div>
              )}
              
              {/* Premium Floating Tooltip */}
              <div className="absolute -bottom-8 opacity-0 group-hover:opacity-100 transition-all duration-200 translate-y-2 group-hover:translate-y-0 bg-black/95 text-slate-200 text-[9px] font-mono px-2.5 py-1.5 rounded-md pointer-events-none whitespace-nowrap z-30 shadow-2xl border border-white/10 font-bold tracking-widest backdrop-blur-md">
                {swatch.label}
              </div>
            </motion.button>
          );
        })}
      </motion.div>
      
      {/* Reset Button */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="pt-3 relative z-20"
      >
        <button
          onClick={onReset}
          className="w-full py-3.5 bg-gradient-to-r from-black/60 to-[#12151c] hover:from-black/80 hover:to-[#181d29] text-slate-300 hover:text-amber-400 border border-white/10 hover:border-amber-500/40 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 text-[10px] font-mono font-black uppercase tracking-widest shadow-inner group overflow-hidden relative"
        >
          {/* Animated Light Sweep Effect */}
          <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out" />
          
          <RotateCcw size={14} className="text-amber-500/70 group-hover:-rotate-180 transition-transform duration-500 ease-out" />
          <span className="relative z-10">Reset Canvas State</span>
        </button>
      </motion.div>
    </div>
  );
}