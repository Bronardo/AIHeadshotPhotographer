import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Columns, SplitSquareVertical, Sparkles, Maximize2, Minimize2 } from 'lucide-react';

interface BeforeAfterSliderProps {
  beforeImage: string;
  afterImage: string;
  beforeLabel?: string;
  afterLabel?: string;
  aspectRatio?: '1:1' | '3:4';
}

export const BeforeAfterSlider: React.FC<BeforeAfterSliderProps> = ({
  beforeImage,
  afterImage,
  beforeLabel = 'Original Selfie',
  afterLabel = 'Studio Headshot',
  aspectRatio = '1:1',
}) => {
  const [sliderPosition, setSliderPosition] = useState(50); // percentage 0 to 100
  const [isDragging, setIsDragging] = useState(false);
  const [viewMode, setViewMode] = useState<'slider' | 'side-by-side' | 'headshot-only'>('slider');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const handleMove = useCallback(
    (clientX: number) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = clientX - rect.left;
      const width = rect.width;
      const newPos = Math.max(0, Math.min(100, (x / width) * 100));
      setSliderPosition(newPos);
    },
    []
  );

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (!isDragging) return;
      handleMove(e.touches[0].clientX);
    },
    [isDragging, handleMove]
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging) return;
      handleMove(e.clientX);
    },
    [isDragging, handleMove]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleTouchMove);
      window.addEventListener('touchend', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp, handleTouchMove]);

  const aspectClass = aspectRatio === '3:4' ? 'aspect-[3/4]' : 'aspect-square';

  return (
    <div className={`flex flex-col gap-3 w-full ${isFullscreen ? 'fixed inset-0 z-50 bg-black/95 p-6 flex items-center justify-center' : ''}`}>
      {/* View Mode Controls Bar */}
      <div className="flex items-center justify-between px-1">
        <div className="inline-flex rounded-xl bg-zinc-800/80 p-1 border border-zinc-700/60 shadow-inner">
          <button
            id="btn-mode-slider"
            onClick={() => setViewMode('slider')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              viewMode === 'slider'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <SplitSquareVertical className="w-3.5 h-3.5" />
            <span>Comparison Slider</span>
          </button>
          <button
            id="btn-mode-side"
            onClick={() => setViewMode('side-by-side')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              viewMode === 'side-by-side'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Columns className="w-3.5 h-3.5" />
            <span>Side-by-Side</span>
          </button>
          <button
            id="btn-mode-headshot"
            onClick={() => setViewMode('headshot-only')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              viewMode === 'headshot-only'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Headshot Only</span>
          </button>
        </div>

        <button
          id="btn-toggle-fullscreen"
          onClick={() => setIsFullscreen(!isFullscreen)}
          className="p-2 rounded-xl text-zinc-400 hover:text-white bg-zinc-800/80 hover:bg-zinc-700 border border-zinc-700/60 transition-colors"
          title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen View'}
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>
      </div>

      {/* Main Image Container */}
      {viewMode === 'slider' && (
        <div
          ref={containerRef}
          onMouseDown={() => setIsDragging(true)}
          onTouchStart={() => setIsDragging(true)}
          className={`relative ${aspectClass} w-full max-w-2xl mx-auto overflow-hidden rounded-2xl select-none cursor-ew-resize border border-zinc-800 shadow-2xl bg-zinc-950`}
        >
          {/* After image (background layer - Studio Headshot) */}
          <img
            src={afterImage}
            alt={afterLabel}
            className="absolute inset-0 w-full h-full object-cover pointer-events-none"
            referrerPolicy="no-referrer"
          />

          {/* Before image (clipped overlay layer - Casual Selfie) */}
          <div
            className="absolute inset-y-0 left-0 overflow-hidden pointer-events-none"
            style={{ width: `${sliderPosition}%` }}
          >
            <div
              className={`relative ${aspectClass} h-full`}
              style={{ width: containerRef.current ? `${containerRef.current.clientWidth}px` : '100%' }}
            >
              <img
                src={beforeImage}
                alt={beforeLabel}
                className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>

          {/* Slider Line Divider */}
          <div
            className="absolute inset-y-0 pointer-events-none flex items-center justify-center"
            style={{ left: `${sliderPosition}%`, transform: 'translateX(-50%)' }}
          >
            <div className="w-0.5 h-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.7)]" />
            <div className="absolute w-8 h-8 rounded-full bg-white shadow-xl flex items-center justify-center text-zinc-900 border border-zinc-300">
              <SplitSquareVertical className="w-4 h-4" />
            </div>
          </div>

          {/* Floating Badges */}
          <div className="absolute top-3 left-3 pointer-events-none">
            <span className="px-2.5 py-1 text-[11px] font-semibold tracking-wide uppercase bg-black/60 backdrop-blur-md text-zinc-300 rounded-lg border border-white/10 shadow-sm">
              {beforeLabel}
            </span>
          </div>
          <div className="absolute top-3 right-3 pointer-events-none">
            <span className="px-2.5 py-1 text-[11px] font-semibold tracking-wide uppercase bg-indigo-600/90 backdrop-blur-md text-white rounded-lg border border-indigo-400/30 shadow-sm flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              {afterLabel}
            </span>
          </div>

          {/* Bottom Hint */}
          <div className="absolute bottom-3 inset-x-0 flex justify-center pointer-events-none">
            <span className="text-[11px] font-medium text-white/80 bg-black/50 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
              Drag slider left or right to compare
            </span>
          </div>
        </div>
      )}

      {viewMode === 'side-by-side' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-4xl mx-auto">
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between px-1 text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              <span>{beforeLabel}</span>
              <span className="text-zinc-500">Original</span>
            </div>
            <div className={`relative ${aspectClass} w-full overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 shadow-lg`}>
              <img
                src={beforeImage}
                alt={beforeLabel}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between px-1 text-xs font-semibold text-indigo-400 uppercase tracking-wider">
              <span className="flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                {afterLabel}
              </span>
              <span className="text-indigo-400/80 font-mono">Studio AI</span>
            </div>
            <div className={`relative ${aspectClass} w-full overflow-hidden rounded-2xl border border-indigo-500/30 bg-zinc-950 shadow-xl shadow-indigo-950/20`}>
              <img
                src={afterImage}
                alt={afterLabel}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        </div>
      )}

      {viewMode === 'headshot-only' && (
        <div className={`relative ${aspectClass} w-full max-w-2xl mx-auto overflow-hidden rounded-2xl border border-indigo-500/30 bg-zinc-950 shadow-2xl`}>
          <img
            src={afterImage}
            alt={afterLabel}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute top-3 right-3 pointer-events-none">
            <span className="px-2.5 py-1 text-[11px] font-semibold tracking-wide uppercase bg-indigo-600/90 backdrop-blur-md text-white rounded-lg border border-indigo-400/30 shadow-sm flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              {afterLabel}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
