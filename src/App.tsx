import React, { useState, useEffect } from 'react';
import {
  Camera,
  Sparkles,
  Download,
  Copy,
  Check,
  RefreshCw,
  AlertTriangle,
  Info,
  Sliders,
  Share2,
  Wand2,
  ArrowRight,
  HelpCircle,
  Clock,
  Layers,
} from 'lucide-react';
import { HEADSHOT_STYLES, SAMPLE_SELFIES } from './data/styles';
import { HeadshotStyle, GenerationSettings, HeadshotResult } from './types';
import { SelfieUploader } from './components/SelfieUploader';
import { StyleSelector } from './components/StyleSelector';
import { BeforeAfterSlider } from './components/BeforeAfterSlider';
import { GalleryStrip } from './components/GalleryStrip';
import { CameraCaptureModal } from './components/CameraCaptureModal';
import { TipsModal } from './components/TipsModal';
import { downloadImage, copyImageToClipboard, urlToBase64 } from './utils/imageUtils';

export default function App() {
  // Pre-loaded sample selfie so user has immediate visual context
  const [currentSelfie, setCurrentSelfie] = useState<string | null>(SAMPLE_SELFIES[0].url);
  const [selectedStyle, setSelectedStyle] = useState<HeadshotStyle>(HEADSHOT_STYLES[0]);
  const [settings, setSettings] = useState<GenerationSettings>({
    styleId: HEADSHOT_STYLES[0].id,
    attire: 'style-default',
    expression: 'style-default',
    aspectRatio: '1:1',
    customNotes: '',
  });

  // Pre-seed with a sample demonstration result for instantaneous interactivity
  const [activeResult, setActiveResult] = useState<HeadshotResult | null>({
    id: 'demo-sample-1',
    createdAt: Date.now(),
    originalImage: SAMPLE_SELFIES[0].url,
    generatedImage: HEADSHOT_STYLES[0].previewUrl,
    styleTitle: HEADSHOT_STYLES[0].title,
    styleId: HEADSHOT_STYLES[0].id,
    aspectRatio: '1:1',
    attire: 'Tailored dark navy blazer with crisp white shirt',
    expression: 'Confident, poised smile with steady eye contact',
  });

  const [history, setHistory] = useState<HeadshotResult[]>([
    {
      id: 'demo-sample-1',
      createdAt: Date.now(),
      originalImage: SAMPLE_SELFIES[0].url,
      generatedImage: HEADSHOT_STYLES[0].previewUrl,
      styleTitle: HEADSHOT_STYLES[0].title,
      styleId: HEADSHOT_STYLES[0].id,
      aspectRatio: '1:1',
      attire: 'Tailored dark navy blazer with crisp white shirt',
      expression: 'Confident, poised smile with steady eye contact',
    },
  ]);

  const [isLoading, setIsLoading] = useState(false);
  const [progressIndex, setProgressIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  // Modals
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isTipsOpen, setIsTipsOpen] = useState(false);

  const studioSteps = [
    'Analyzing facial geometry and natural lighting...',
    'Calibrating virtual 85mm f/1.4 portrait optics...',
    `Setting up ${selectedStyle.title} backdrop...`,
    'Applying tailored executive wardrobe & studio lighting...',
    'Refining skin texture and developing final portrait...',
  ];

  const handleUpdateSettings = (newSettings: Partial<GenerationSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  const handleSelectStyle = (style: HeadshotStyle) => {
    setSelectedStyle(style);
    setSettings((prev) => ({
      ...prev,
      styleId: style.id,
      // reset to style defaults if user was using style default
      attire: 'style-default',
      expression: 'style-default',
    }));
  };

  const handleGenerate = async () => {
    if (!currentSelfie) {
      setError('Please upload a selfie or choose one of the sample photos first.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setProgressIndex(0);

    const stepInterval = setInterval(() => {
      setProgressIndex((prev) => (prev < studioSteps.length - 1 ? prev + 1 : prev));
    }, 4000);

    try {
      let base64Data = currentSelfie;
      if (currentSelfie.startsWith('http')) {
        try {
          base64Data = await urlToBase64(currentSelfie);
        } catch (fetchErr) {
          console.warn('Direct URL conversion failed, attempting raw fetch:', fetchErr);
        }
      }

      const response = await fetch('/api/generate-headshot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: base64Data,
          mimeType: 'image/jpeg',
          styleTitle: selectedStyle.title,
          backdrop: selectedStyle.backdrop,
          attire:
            settings.attire === 'style-default'
              ? selectedStyle.attire
              : settings.attire,
          lighting: selectedStyle.lighting,
          expression:
            settings.expression === 'style-default'
              ? selectedStyle.recommendedExpression
              : settings.expression,
          aspectRatio: settings.aspectRatio,
          customNotes: settings.customNotes,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Studio headshot generation failed.');
      }

      const newResult: HeadshotResult = {
        id: `headshot-${Date.now()}`,
        createdAt: Date.now(),
        originalImage: currentSelfie,
        generatedImage: data.image,
        styleTitle: selectedStyle.title,
        styleId: selectedStyle.id,
        aspectRatio: settings.aspectRatio,
        attire: settings.attire,
        expression: settings.expression,
        promptUsed: data.promptUsed,
      };

      setActiveResult(newResult);
      setHistory((prev) => [newResult, ...prev]);
      setSuccessToast(`Studio headshot developed in "${selectedStyle.title}" style!`);
      setTimeout(() => setSuccessToast(null), 4000);
    } catch (err: any) {
      console.error('Headshot generation error:', err);
      setError(
        err?.message ||
          'Headshot generation encountered an issue. Please verify your photo or try a different style.'
      );
    } finally {
      clearInterval(stepInterval);
      setIsLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!activeResult) return;
    const ok = await copyImageToClipboard(activeResult.generatedImage);
    if (ok) {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    if (!activeResult) return;
    const filename = `headshot-${activeResult.styleId}-${Date.now()}.png`;
    downloadImage(activeResult.generatedImage, filename);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Studio Navigation Bar */}
      <header className="sticky top-0 z-40 w-full border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30">
              <Camera className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-base tracking-tight text-white">
                  AI Headshot Photographer
                </h1>
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  <Sparkles className="w-2.5 h-2.5" />
                  Studio Edition
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 hidden sm:block">
                Turn casual selfies into commercial executive portraits
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              id="btn-open-tips"
              onClick={() => setIsTipsOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-zinc-800 bg-zinc-900/80 hover:bg-zinc-800 text-xs font-medium text-zinc-300 hover:text-white transition-colors"
            >
              <HelpCircle className="w-3.5 h-3.5 text-indigo-400" />
              <span>Photography Tips</span>
            </button>

            <div className="h-4 w-px bg-zinc-800 hidden sm:block" />

            <div className="hidden sm:flex items-center gap-2 text-xs text-zinc-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Studio Engine Ready</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Studio Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 flex flex-col gap-6">
        {/* Success Toast */}
        {successToast && (
          <div className="rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-200 px-4 py-3 text-xs flex items-center justify-between shadow-lg animate-in slide-in-from-top duration-200">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400" />
              <span>{successToast}</span>
            </div>
            <button
              onClick={() => setSuccessToast(null)}
              className="text-emerald-400 hover:text-white text-xs font-semibold"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="rounded-xl bg-rose-950/80 border border-rose-500/40 text-rose-200 px-4 py-3 text-xs flex items-start gap-3 shadow-lg animate-in slide-in-from-top duration-200">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold mb-0.5">Generation Notice</p>
              <p className="text-rose-300/90">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-rose-400 hover:text-white font-semibold"
            >
              Close
            </button>
          </div>
        )}

        {/* Studio Grid: Controls on Left, Studio Result on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Photo Setup & Style Selection (7 Cols) */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            {/* Step 1: Upload / Pick Casual Selfie */}
            <section className="rounded-2xl bg-zinc-900/60 border border-zinc-800 p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">
                    1
                  </div>
                  <h3 className="font-bold text-sm text-zinc-100">
                    Upload Your Casual Selfie
                  </h3>
                </div>
                <span className="text-xs text-zinc-400">
                  Any phone photo, snap, or webcam shot
                </span>
              </div>

              <SelfieUploader
                currentSelfie={currentSelfie}
                onSelfieSelected={(img) => {
                  setCurrentSelfie(img);
                  setError(null);
                }}
                onOpenLiveCamera={() => setIsCameraOpen(true)}
                isLoading={isLoading}
              />
            </section>

            {/* Step 2: Choose Desired Style */}
            <section className="rounded-2xl bg-zinc-900/60 border border-zinc-800 p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">
                    2
                  </div>
                  <h3 className="font-bold text-sm text-zinc-100">
                    Select Studio Style
                  </h3>
                </div>
                <span className="text-xs text-zinc-400">
                  Corporate, Tech, Outdoor, & Editorial
                </span>
              </div>

              <StyleSelector
                selectedStyleId={selectedStyle.id}
                onSelectStyle={handleSelectStyle}
                settings={settings}
                onUpdateSettings={handleUpdateSettings}
              />
            </section>

            {/* Generate Headshot Primary Action */}
            <div className="flex flex-col gap-3">
              <button
                id="btn-generate-headshot"
                disabled={isLoading || !currentSelfie}
                onClick={handleGenerate}
                className="group relative w-full overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 p-4 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 active:scale-[0.99] transition-all disabled:opacity-50 disabled:pointer-events-none"
              >
                <div className="relative z-10 flex items-center justify-center gap-2.5">
                  {isLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-indigo-200" />
                      <span>Developing Studio Headshot...</span>
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-4 h-4 text-indigo-200 group-hover:rotate-12 transition-transform" />
                      <span>
                        Develop Professional Headshot &bull; {selectedStyle.title}
                      </span>
                      <ArrowRight className="w-4 h-4 text-indigo-200 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </div>
              </button>

              {/* In-Progress Studio Live Status */}
              {isLoading && (
                <div className="rounded-2xl bg-zinc-900 border border-indigo-500/30 p-4 flex flex-col gap-2.5 shadow-lg animate-in fade-in">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-indigo-400 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                      Studio AI In Session
                    </span>
                    <span className="text-zinc-500 font-mono">
                      Step {progressIndex + 1} of {studioSteps.length}
                    </span>
                  </div>

                  <p className="text-xs text-zinc-300 font-medium">
                    {studioSteps[progressIndex]}
                  </p>

                  <div className="w-full h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-700 rounded-full"
                      style={{
                        width: `${((progressIndex + 1) / studioSteps.length) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Studio Showcase & Before/After Comparison (5 Cols) */}
          <div className="lg:col-span-5 flex flex-col gap-5 sticky top-22">
            <div className="rounded-2xl bg-zinc-900/80 border border-zinc-800 p-5 shadow-xl flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                  <h3 className="font-bold text-sm text-zinc-100">
                    Studio Proof & Comparison
                  </h3>
                </div>

                {activeResult && (
                  <span className="text-xs font-medium text-zinc-400">
                    {activeResult.styleTitle}
                  </span>
                )}
              </div>

              {/* Comparison Slider / Proof Stage */}
              {activeResult ? (
                <div className="flex flex-col gap-4">
                  <BeforeAfterSlider
                    beforeImage={activeResult.originalImage}
                    afterImage={activeResult.generatedImage}
                    beforeLabel="Casual Selfie"
                    afterLabel={activeResult.styleTitle}
                    aspectRatio={activeResult.aspectRatio}
                  />

                  {/* Actions Bar */}
                  <div className="grid grid-cols-2 gap-2.5 pt-1">
                    <button
                      id="btn-download-headshot"
                      onClick={handleDownload}
                      className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-semibold text-xs border border-zinc-700 transition-all shadow-sm"
                    >
                      <Download className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Download PNG</span>
                    </button>

                    <button
                      id="btn-copy-clipboard"
                      onClick={handleCopy}
                      className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold text-xs border border-zinc-700 transition-all shadow-sm"
                    >
                      {isCopied ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-300">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-zinc-400" />
                          <span>Copy Image</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Portrait Metadata Summary */}
                  <div className="rounded-xl bg-zinc-950 p-3 border border-zinc-800/80 flex flex-col gap-1.5 text-[11px] text-zinc-400">
                    <div className="flex justify-between items-center text-zinc-300">
                      <span className="font-semibold text-zinc-400">Style Preset:</span>
                      <span>{activeResult.styleTitle}</span>
                    </div>
                    <div className="flex justify-between items-center text-zinc-300">
                      <span className="font-semibold text-zinc-400">Aspect Ratio:</span>
                      <span>
                        {activeResult.aspectRatio === '1:1'
                          ? '1:1 Square (LinkedIn / Profile)'
                          : '3:4 Portrait (Resume / Press)'}
                      </span>
                    </div>
                    {activeResult.attire && (
                      <div className="flex justify-between items-center text-zinc-300">
                        <span className="font-semibold text-zinc-400">Wardrobe:</span>
                        <span className="truncate max-w-[200px]">{activeResult.attire}</span>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="aspect-square w-full rounded-xl bg-zinc-950 border border-dashed border-zinc-800 flex flex-col items-center justify-center p-6 text-center text-zinc-500">
                  <Camera className="w-10 h-10 stroke-[1.5] mb-2 text-zinc-600" />
                  <p className="text-xs font-medium text-zinc-400">No headshot generated yet</p>
                  <p className="text-[11px] text-zinc-600 max-w-xs mt-1">
                    Upload a selfie and pick a style to generate your first professional portrait.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Session Gallery History Strip */}
        <div className="mt-2">
          <GalleryStrip
            history={history}
            activeResultId={activeResult?.id || null}
            onSelectResult={(item) => setActiveResult(item)}
            onClearHistory={() => setHistory([])}
          />
        </div>
      </main>

      {/* Live Webcam Modal */}
      <CameraCaptureModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCapture={(img) => {
          setCurrentSelfie(img);
          setError(null);
        }}
      />

      {/* Photography Tips Modal */}
      <TipsModal isOpen={isTipsOpen} onClose={() => setIsTipsOpen(false)} />
    </div>
  );
}
