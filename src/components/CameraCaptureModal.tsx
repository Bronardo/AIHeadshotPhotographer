import React, { useEffect, useRef, useState } from 'react';
import { Camera, X, RefreshCw, Check, AlertCircle } from 'lucide-react';

interface CameraCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (base64Image: string) => void;
}

export const CameraCaptureModal: React.FC<CameraCaptureModalProps> = ({
  isOpen,
  onClose,
  onCapture,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isFlashing, setIsFlashing] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      setCapturedPhoto(null);
      setCountdown(null);
      setErrorMsg(null);
      return;
    }

    startCamera();

    return () => {
      stopCamera();
    };
  }, [isOpen]);

  const startCamera = async () => {
    setErrorMsg(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 1280 },
          facingMode: 'user',
        },
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err: any) {
      console.error('Camera access error:', err);
      setErrorMsg(
        'Unable to access your camera. Please check your browser permissions or upload a photo file instead.'
      );
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  const handleStartCountdown = () => {
    if (countdown !== null) return;
    setCountdown(3);

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(timer);
          takeSnapshot();
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const takeSnapshot = () => {
    if (!videoRef.current) return;
    setIsFlashing(true);
    setTimeout(() => setIsFlashing(false), 200);

    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    const size = Math.min(video.videoWidth, video.videoHeight);
    canvas.width = size;
    canvas.height = size;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Center crop square
    const startX = (video.videoWidth - size) / 2;
    const startY = (video.videoHeight - size) / 2;

    // Mirror for natural selfie feel
    ctx.translate(size, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, startX, startY, size, size, 0, 0, size, size);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
    setCapturedPhoto(dataUrl);
    stopCamera();
  };

  const handleRetake = () => {
    setCapturedPhoto(null);
    startCamera();
  };

  const handleAccept = () => {
    if (capturedPhoto) {
      onCapture(capturedPhoto);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div
        id="camera-modal-container"
        className="relative w-full max-w-lg overflow-hidden rounded-2xl bg-zinc-900 border border-zinc-800 shadow-2xl flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800 text-white">
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-indigo-400" />
            <h3 className="font-semibold text-lg">Take a Studio Selfie</h3>
          </div>
          <button
            id="btn-close-camera"
            onClick={onClose}
            className="rounded-full p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Viewfinder Area */}
        <div className="relative aspect-square w-full bg-zinc-950 flex items-center justify-center overflow-hidden">
          {errorMsg ? (
            <div className="p-6 text-center text-zinc-300 max-w-sm">
              <AlertCircle className="w-10 h-10 text-amber-400 mx-auto mb-3" />
              <p className="text-sm font-medium mb-4">{errorMsg}</p>
              <button
                onClick={startCamera}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white transition-colors"
              >
                Retry Camera
              </button>
            </div>
          ) : capturedPhoto ? (
            <img
              src={capturedPhoto}
              alt="Captured selfie"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          ) : (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover -scale-x-100"
              />

              {/* Portrait framing oval guide */}
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <div className="w-56 h-72 rounded-[50%] border-2 border-dashed border-white/40 shadow-inner flex items-center justify-center">
                  <span className="text-xs text-white/70 bg-black/40 px-2 py-0.5 rounded backdrop-blur-xs">
                    Align face here
                  </span>
                </div>
              </div>

              {/* Countdown overlay */}
              {countdown !== null && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-xs">
                  <span className="text-7xl font-extrabold text-white animate-ping">
                    {countdown}
                  </span>
                </div>
              )}

              {/* Shutter flash overlay */}
              {isFlashing && (
                <div className="absolute inset-0 bg-white transition-opacity duration-150" />
              )}
            </>
          )}
        </div>

        {/* Controls Footer */}
        <div className="p-5 bg-zinc-900 border-t border-zinc-800 flex items-center justify-center gap-4">
          {capturedPhoto ? (
            <>
              <button
                id="btn-retake-photo"
                onClick={handleRetake}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-zinc-700 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-medium text-sm transition-all"
              >
                <RefreshCw className="w-4 h-4" />
                Retake
              </button>
              <button
                id="btn-use-photo"
                onClick={handleAccept}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 transition-all"
              >
                <Check className="w-4 h-4" />
                Use Photo
              </button>
            </>
          ) : (
            <button
              id="btn-trigger-shutter"
              disabled={Boolean(errorMsg) || countdown !== null}
              onClick={handleStartCountdown}
              className="flex items-center justify-center w-16 h-16 rounded-full bg-white text-zinc-900 hover:scale-105 active:scale-95 shadow-xl transition-all disabled:opacity-50 disabled:hover:scale-100"
              title="Take Photo"
            >
              <div className="w-13 h-13 rounded-full border-2 border-zinc-900 flex items-center justify-center">
                <div className="w-10 h-10 rounded-full bg-red-600" />
              </div>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
