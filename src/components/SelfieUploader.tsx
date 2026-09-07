import React, { useRef, useState } from 'react';
import { Upload, Camera, Image as ImageIcon, CheckCircle, RefreshCw, Sparkles } from 'lucide-react';
import { SAMPLE_SELFIES } from '../data/styles';
import { SampleSelfie } from '../types';
import { fileToBase64, urlToBase64 } from '../utils/imageUtils';

interface SelfieUploaderProps {
  currentSelfie: string | null;
  onSelfieSelected: (base64Image: string) => void;
  onOpenLiveCamera: () => void;
  isLoading: boolean;
}

export const SelfieUploader: React.FC<SelfieUploaderProps> = ({
  currentSelfie,
  onSelfieSelected,
  onOpenLiveCamera,
  isLoading,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [loadingSampleId, setLoadingSampleId] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const base64 = await fileToBase64(file);
      onSelfieSelected(base64);
    } catch (err) {
      console.error('Failed to read image file:', err);
    }
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    try {
      const base64 = await fileToBase64(file);
      onSelfieSelected(base64);
    } catch (err) {
      console.error('Failed to read dropped file:', err);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleSelectSample = async (sample: SampleSelfie) => {
    setLoadingSampleId(sample.id);
    try {
      const base64 = await urlToBase64(sample.url);
      onSelfieSelected(base64);
    } catch (err) {
      console.error('Failed to load sample image:', err);
      // Fallback: use direct URL
      onSelfieSelected(sample.url);
    } finally {
      setLoadingSampleId(null);
    }
  };

  return (
    <div className="flex flex-col gap-4 w-full">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/jpg"
        className="hidden"
        onChange={handleFileChange}
      />

      {currentSelfie ? (
        /* Image Loaded State */
        <div className="relative rounded-2xl bg-zinc-900 border border-zinc-800 p-4 flex flex-col sm:flex-row items-center gap-5 shadow-lg">
          {/* Thumbnail with portrait oval framing guide */}
          <div className="relative w-36 h-36 rounded-2xl overflow-hidden border-2 border-indigo-500/60 shadow-xl bg-zinc-950 shrink-0">
            <img
              src={currentSelfie}
              alt="Source casual selfie"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 border border-white/20 rounded-2xl pointer-events-none" />
            <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow">
              <CheckCircle className="w-3.5 h-3.5" />
            </div>
          </div>

          <div className="flex-1 flex flex-col gap-2 text-center sm:text-left">
            <div className="flex items-center gap-2 justify-center sm:justify-start">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Selfie Ready
              </span>
              <span className="text-xs text-zinc-400">Casual Reference Image</span>
            </div>
            <h4 className="font-semibold text-base text-zinc-100">
              Reference Subject Loaded
            </h4>
            <p className="text-xs text-zinc-400 max-w-md">
              Facial features and likeness will be preserved while transforming lighting, attire, and background.
            </p>

            {/* Quick Action Buttons */}
            <div className="flex items-center gap-2.5 mt-1 justify-center sm:justify-start flex-wrap">
              <button
                id="btn-replace-photo"
                disabled={isLoading}
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-zinc-700 bg-zinc-800 hover:bg-zinc-700 text-xs font-medium text-zinc-200 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Upload Different Photo
              </button>
              <button
                id="btn-open-camera-again"
                disabled={isLoading}
                onClick={onOpenLiveCamera}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-zinc-700 bg-zinc-800 hover:bg-zinc-700 text-xs font-medium text-zinc-200 transition-colors"
              >
                <Camera className="w-3.5 h-3.5 text-indigo-400" />
                Take with Camera
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Empty Upload Zone */
        <div
          id="dropzone-selfie"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`relative rounded-2xl border-2 border-dashed p-8 transition-all flex flex-col items-center justify-center text-center cursor-pointer ${
            isDragOver
              ? 'border-indigo-500 bg-indigo-500/10 scale-[1.01]'
              : 'border-zinc-700/80 bg-zinc-900/50 hover:bg-zinc-900/80 hover:border-zinc-600'
          }`}
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="w-14 h-14 rounded-2xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center mb-3.5 shadow-inner">
            <Upload className="w-7 h-7 stroke-[1.75]" />
          </div>

          <h3 className="font-semibold text-base text-zinc-100 mb-1">
            Upload a Casual Selfie
          </h3>
          <p className="text-xs text-zinc-400 max-w-sm mb-4">
            Drag & drop your photo here, or browse from your device. Even a simple phone photo or webcam snapshot works great!
          </p>

          <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
            <button
              id="btn-browse-file"
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs shadow-md shadow-indigo-600/30 transition-all"
            >
              <ImageIcon className="w-3.5 h-3.5" />
              Browse Files
            </button>
            <button
              id="btn-open-camera"
              type="button"
              onClick={onOpenLiveCamera}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-zinc-700 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-medium text-xs transition-all"
            >
              <Camera className="w-3.5 h-3.5 text-indigo-400" />
              Use Webcam
            </button>
          </div>
        </div>
      )}

      {/* Instant 1-Click Sample Selfies */}
      <div className="flex flex-col gap-2 pt-1">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-400" />
            Or Try Instantly with Sample Photos:
          </span>
          <span className="text-[11px] text-zinc-400">1-click test load</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {SAMPLE_SELFIES.map((sample) => (
            <button
              key={sample.id}
              id={`btn-sample-${sample.id}`}
              type="button"
              disabled={isLoading || loadingSampleId === sample.id}
              onClick={() => handleSelectSample(sample)}
              className="group flex items-center gap-2.5 p-2 rounded-xl border border-zinc-800 bg-zinc-900/60 hover:bg-zinc-900 hover:border-indigo-500/50 transition-all text-left"
            >
              <div className="w-9 h-9 rounded-lg overflow-hidden shrink-0 border border-zinc-700 group-hover:border-indigo-400">
                <img
                  src={sample.url}
                  alt={sample.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="truncate">
                <div className="text-xs font-semibold text-zinc-200 group-hover:text-white">
                  {sample.name}
                </div>
                <div className="text-[10px] text-zinc-400 truncate">
                  {loadingSampleId === sample.id ? 'Loading...' : sample.description}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
