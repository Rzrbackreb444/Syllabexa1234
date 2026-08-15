import React, { useState, useRef, useEffect, useCallback } from 'react';

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  delay?: number;
  position?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
}

export default function Tooltip({ 
  content, 
  children, 
  delay = 400, 
  position = 'top',
  className = ''
}: TooltipProps) {
  const [visible, setVisible] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // OPTIMIZATION: Prevent memory leaks on component unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  // OPTIMIZATION: useCallback prevents handler recreation on parent re-renders
  const showTooltip = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setVisible(true), delay);
  }, [delay]);

  const hideTooltip = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setVisible(false);
  }, []);

  // Configuration mapping for both the container and the dynamic caret pointer
  const positionConfig = {
    top: {
      container: 'bottom-full left-1/2 -translate-x-1/2 mb-2.5',
      arrow: 'top-full left-1/2 -translate-x-1/2 border-t-[#0c0e12] border-l-transparent border-r-transparent border-b-transparent'
    },
    bottom: {
      container: 'top-full left-1/2 -translate-x-1/2 mt-2.5',
      arrow: 'bottom-full left-1/2 -translate-x-1/2 border-b-[#0c0e12] border-l-transparent border-r-transparent border-t-transparent'
    },
    left: {
      container: 'right-full top-1/2 -translate-y-1/2 mr-2.5',
      arrow: 'left-full top-1/2 -translate-y-1/2 border-l-[#0c0e12] border-t-transparent border-b-transparent border-r-transparent'
    },
    right: {
      container: 'left-full top-1/2 -translate-y-1/2 ml-2.5',
      arrow: 'right-full top-1/2 -translate-y-1/2 border-r-[#0c0e12] border-t-transparent border-b-transparent border-l-transparent'
    },
  };

  return (
    <aside aria-label="Tooltip Container" className="relative inline-flex items-center justify-center">
      <div 
        className="inline-flex items-center justify-center"
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
        onFocus={showTooltip} // OPTIMIZATION: Keyboard Accessibility
        onBlur={hideTooltip}
      >
        {children}
        
        {visible && (
          <div 
            role="tooltip"
            className={`absolute z-[9999] px-3 py-1.5 text-[10px] font-mono uppercase tracking-widest font-bold text-slate-200 bg-[#0c0e12] border border-white/5 rounded-lg shadow-[0_10px_30px_rgba(0,0,0,0.5)] whitespace-nowrap pointer-events-none transition-all duration-200 animate-in fade-in zoom-in-95 ${positionConfig[position].container} ${className}`}
          >
            {content}
            
            {/* Premium UI Detail: The directional caret pointer */}
            <div 
              className={`absolute w-0 h-0 border-[5px] ${positionConfig[position].arrow}`}
              aria-hidden="true"
            />
          </div>
        )}
      </div>
    </aside>
  );
}