import React, { useState } from 'react';
import { HeadshotStyle, StyleCategory, GenerationSettings, AspectRatioType } from '../types';
import { HEADSHOT_STYLES, ATTIRE_OPTIONS, EXPRESSION_OPTIONS } from '../data/styles';
import { Check, SlidersHorizontal, ChevronDown, ChevronUp, Sparkles, Layers } from 'lucide-react';

interface StyleSelectorProps {
  selectedStyleId: string;
  onSelectStyle: (style: HeadshotStyle) => void;
  settings: GenerationSettings;
  onUpdateSettings: (newSettings: Partial<GenerationSettings>) => void;
}

export const StyleSelector: React.FC<StyleSelectorProps> = ({
  selectedStyleId,
  onSelectStyle,
  settings,
  onUpdateSettings,
}) => {
  const [activeCategory, setActiveCategory] = useState<StyleCategory>('all');
  const [showAdvanced, setShowAdvanced] = useState(false);

  const filteredStyles =
    activeCategory === 'all'
      ? HEADSHOT_STYLES
      : HEADSHOT_STYLES.filter((s) => s.category === activeCategory);

  const selectedStyle = HEADSHOT_STYLES.find((s) => s.id === selectedStyleId) || HEADSHOT_STYLES[0];

  return (
    <div className="flex flex-col gap-5 w-full">
      {/* Category Tabs */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="inline-flex rounded-xl bg-zinc-900 p-1 border border-zinc-800 shadow-inner overflow-x-auto max-w-full">
          {(
            [
              { id: 'all', label: 'All Styles' },
              { id: 'corporate', label: 'Corporate' },
              { id: 'tech', label: 'Tech & Startup' },
              { id: 'outdoor', label: 'Outdoor Natural' },
              { id: 'editorial', label: 'Creative & Editorial' },
            ] as const
          ).map((cat) => (
            <button
              key={cat.id}
              id={`tab-cat-${cat.id}`}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                activeCategory === cat.id
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Aspect Ratio Quick Toggle */}
        <div className="inline-flex items-center gap-1 rounded-xl bg-zinc-900 p-1 border border-zinc-800 text-xs font-semibold">
          <span className="text-zinc-500 px-2 text-[11px] uppercase tracking-wider">Format:</span>
          {(
            [
              { id: '1:1', label: '1:1 Square' },
              { id: '3:4', label: '3:4 Portrait' },
            ] as const
          ).map((ratio) => (
            <button
              key={ratio.id}
              id={`btn-aspect-${ratio.id.replace(':', '-')}`}
              onClick={() => onUpdateSettings({ aspectRatio: ratio.id as AspectRatioType })}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                settings.aspectRatio === ratio.id
                  ? 'bg-zinc-700 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {ratio.label}
            </button>
          ))}
        </div>
      </div>

      {/* Styles Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {filteredStyles.map((style) => {
          const isSelected = style.id === selectedStyleId;
          return (
            <div
              key={style.id}
              id={`card-style-${style.id}`}
              onClick={() => onSelectStyle(style)}
              className={`group relative flex flex-col rounded-2xl overflow-hidden cursor-pointer transition-all duration-200 border ${
                isSelected
                  ? 'border-indigo-500 bg-zinc-900 ring-2 ring-indigo-500/40 shadow-xl shadow-indigo-950/30 -translate-y-0.5'
                  : 'border-zinc-800/80 bg-zinc-900/60 hover:bg-zinc-900 hover:border-zinc-700'
              }`}
            >
              {/* Image Banner */}
              <div className="relative aspect-[16/10] w-full overflow-hidden bg-zinc-950">
                <img
                  src={style.previewUrl}
                  alt={style.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/40 to-transparent" />

                {/* Selection Checkmark Badge */}
                {isSelected && (
                  <div className="absolute top-2.5 right-2.5 w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-lg border border-indigo-400">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                )}

                {/* Tags */}
                <div className="absolute bottom-2 left-2.5 flex items-center gap-1.5 flex-wrap">
                  {style.tags.slice(0, 2).map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 rounded-md text-[10px] font-semibold tracking-wide bg-black/60 backdrop-blur-md text-zinc-300 border border-white/10"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Card Body */}
              <div className="p-3.5 flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-sm text-zinc-100 group-hover:text-white">
                    {style.title}
                  </h4>
                </div>
                <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                  {style.description}
                </p>

                {/* Subtle Specs */}
                <div className="mt-2 pt-2 border-t border-zinc-800/60 flex flex-col gap-1 text-[11px] text-zinc-400">
                  <div className="truncate">
                    <span className="text-zinc-500 font-medium">Backdrop:</span>{' '}
                    <span className="text-zinc-300">{style.backdrop.split(',')[0]}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Style Detail & Customization Toggle */}
      <div className="mt-2 rounded-2xl bg-zinc-900/80 border border-zinc-800 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl overflow-hidden border border-zinc-700 bg-zinc-800 shrink-0">
              <img
                src={selectedStyle.previewUrl}
                alt={selectedStyle.title}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-indigo-400 font-medium">Active Style Selection</span>
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
              </div>
              <h4 className="font-bold text-base text-white">{selectedStyle.title}</h4>
            </div>
          </div>

          <button
            id="btn-toggle-customization"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-zinc-700 bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-200 transition-colors"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Customize Attire & Details</span>
            {showAdvanced ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Collapsible Customization Options */}
        {showAdvanced && (
          <div className="mt-4 pt-4 border-t border-zinc-800 grid grid-cols-1 md:grid-cols-3 gap-4 animate-in fade-in duration-200">
            {/* Wardrobe / Attire Selector */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-zinc-300">
                Wardrobe / Attire
              </label>
              <select
                id="select-attire"
                value={settings.attire}
                onChange={(e) => onUpdateSettings({ attire: e.target.value })}
                className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-indigo-500"
              >
                {ATTIRE_OPTIONS.map((att) => (
                  <option key={att.id} value={att.id === 'style-default' ? selectedStyle.attire : att.label}>
                    {att.label}
                  </option>
                ))}
              </select>
              <span className="text-[11px] text-zinc-400 leading-tight">
                Current: {settings.attire === 'style-default' ? selectedStyle.attire : settings.attire}
              </span>
            </div>

            {/* Expression Selector */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-zinc-300">
                Facial Expression
              </label>
              <select
                id="select-expression"
                value={settings.expression}
                onChange={(e) => onUpdateSettings({ expression: e.target.value })}
                className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-indigo-500"
              >
                {EXPRESSION_OPTIONS.map((exp) => (
                  <option key={exp.id} value={exp.id === 'style-default' ? selectedStyle.recommendedExpression : exp.label}>
                    {exp.label}
                  </option>
                ))}
              </select>
              <span className="text-[11px] text-zinc-400 leading-tight">
                Current: {settings.expression === 'style-default' ? selectedStyle.recommendedExpression : settings.expression}
              </span>
            </div>

            {/* Custom Photographer Notes */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-zinc-300">
                Photographer Notes / Specific Tweaks
              </label>
              <input
                id="input-photographer-notes"
                type="text"
                value={settings.customNotes}
                onChange={(e) => onUpdateSettings({ customNotes: e.target.value })}
                placeholder="e.g. Keep my glasses, subtle warm rim light"
                className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-indigo-500 placeholder:text-zinc-600"
              />
              <span className="text-[11px] text-zinc-400 leading-tight">
                Optional styling notes passed to the portrait generator
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
