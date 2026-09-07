import React from 'react';
import { HeadshotResult } from '../types';
import { Download, Sparkles, Trash2, Eye } from 'lucide-react';
import { downloadImage } from '../utils/imageUtils';

interface GalleryStripProps {
  history: HeadshotResult[];
  activeResultId: string | null;
  onSelectResult: (result: HeadshotResult) => void;
  onClearHistory: () => void;
}

export const GalleryStrip: React.FC<GalleryStripProps> = ({
  history,
  activeResultId,
  onSelectResult,
  onClearHistory,
}) => {
  if (history.length === 0) return null;

  return (
    <div className="flex flex-col gap-3 rounded-2xl bg-zinc-900/90 border border-zinc-800 p-4 w-full shadow-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-indigo-400" />
          <h4 className="font-semibold text-sm text-zinc-100">
            Session Headshot Portfolio
          </h4>
          <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-zinc-800 text-zinc-300">
            {history.length}
          </span>
        </div>

        <button
          id="btn-clear-history"
          onClick={onClearHistory}
          className="flex items-center gap-1 text-xs text-zinc-500 hover:text-red-400 transition-colors"
          title="Clear session gallery"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Clear</span>
        </button>
      </div>

      <div className="flex items-center gap-3 overflow-x-auto pb-2 pt-1">
        {history.map((item) => {
          const isActive = item.id === activeResultId;
          return (
            <div
              key={item.id}
              id={`history-item-${item.id}`}
              onClick={() => onSelectResult(item)}
              className={`group relative shrink-0 w-28 flex flex-col rounded-xl overflow-hidden border cursor-pointer transition-all ${
                isActive
                  ? 'border-indigo-500 ring-2 ring-indigo-500/40 bg-zinc-800 shadow-lg'
                  : 'border-zinc-800 bg-zinc-950/70 hover:border-zinc-700 hover:bg-zinc-800'
              }`}
            >
              {/* Thumbnail */}
              <div className="relative aspect-square w-full bg-zinc-950 overflow-hidden">
                <img
                  src={item.generatedImage}
                  alt={item.styleTitle}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                  <span className="p-1 rounded-md bg-white/20 text-white backdrop-blur-xs">
                    <Eye className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>

              {/* Caption */}
              <div className="p-2 flex flex-col gap-1">
                <div className="text-[11px] font-semibold text-zinc-200 truncate" title={item.styleTitle}>
                  {item.styleTitle}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-zinc-400">
                    {item.aspectRatio}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      downloadImage(item.generatedImage, `headshot-${item.styleId}-${Date.now()}.png`);
                    }}
                    className="p-1 rounded text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors"
                    title="Download"
                  >
                    <Download className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
