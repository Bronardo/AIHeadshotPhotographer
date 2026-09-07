import React from 'react';
import { X, Sun, Camera, UserCheck, ShieldAlert, Sparkles } from 'lucide-react';

interface TipsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TipsModal: React.FC<TipsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div
        id="tips-modal-container"
        className="relative w-full max-w-lg rounded-2xl bg-zinc-900 border border-zinc-800 shadow-2xl p-6 text-zinc-200"
      >
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-400" />
            <h3 className="font-bold text-lg text-white">Studio Photography Tips</h3>
          </div>
          <button
            id="btn-close-tips"
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="py-4 flex flex-col gap-4 text-xs leading-relaxed">
          <div className="flex items-start gap-3 p-3 rounded-xl bg-zinc-950/60 border border-zinc-800">
            <Sun className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <h5 className="font-semibold text-zinc-100 text-sm mb-0.5">Even Front Lighting</h5>
              <p className="text-zinc-400">
                Facing a window or soft lamp yields the best facial likeness. Avoid heavy harsh backlighting, strong shadows, or colored neon casts.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-xl bg-zinc-950/60 border border-zinc-800">
            <Camera className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
            <div>
              <h5 className="font-semibold text-zinc-100 text-sm mb-0.5">Eye-Level Camera Angle</h5>
              <p className="text-zinc-400">
                Hold your camera or phone directly at eye level, roughly an arm&apos;s length away. Avoid extreme low or high angles for standard commercial headshots.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-xl bg-zinc-950/60 border border-zinc-800">
            <UserCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <h5 className="font-semibold text-zinc-100 text-sm mb-0.5">Clear Facial Exposure</h5>
              <p className="text-zinc-400">
                Ensure your eyes, eyebrows, and jawline are clearly visible. Regular prescription glasses work well, but avoid dark sunglasses, hats, or hands covering the face.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-xl bg-zinc-950/60 border border-zinc-800">
            <ShieldAlert className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
            <div>
              <h5 className="font-semibold text-zinc-100 text-sm mb-0.5">Casual Clothing Is Fine!</h5>
              <p className="text-zinc-400">
                Don&apos;t worry about your clothes in the selfie — our studio AI replaces t-shirts or casual hoodies with tailored suits, blazers, and professional knitwear automatically.
              </p>
            </div>
          </div>
        </div>

        <div className="pt-2 border-t border-zinc-800 flex justify-end">
          <button
            id="btn-tips-got-it"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-colors"
          >
            Got it, Let&apos;s Shoot!
          </button>
        </div>
      </div>
    </div>
  );
};
