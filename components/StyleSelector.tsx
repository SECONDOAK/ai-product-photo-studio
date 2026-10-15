
import React from 'react';
import { StylePreset } from '../types';

// Small gradient swatch hinting at each style's mood
const STYLE_SWATCHES: Record<string, string> = {
  minimalist: 'bg-gradient-to-br from-white to-gray-300',
  vibrant: 'bg-gradient-to-br from-pink-500 via-amber-400 to-cyan-400',
  lifestyle: 'bg-gradient-to-br from-amber-200 via-orange-300 to-emerald-300',
  dramatic: 'bg-gradient-to-br from-gray-500 via-gray-800 to-black',
  luxe: 'bg-gradient-to-br from-yellow-200 via-amber-400 to-yellow-700',
  studio: 'bg-gradient-to-br from-gray-100 via-gray-300 to-gray-500',
};

interface StyleSelectorProps {
  presets: StylePreset[];
  selectedStyle: StylePreset | null;
  onSelect: (style: StylePreset | null) => void;
}

export const StyleSelector: React.FC<StyleSelectorProps> = ({ presets, selectedStyle, onSelect }) => {
  return (
    <div>
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2">
            {presets.map((preset) => {
            const isSelected = selectedStyle?.id === preset.id;
            return (
            <button
                key={preset.id}
                onClick={() => onSelect(isSelected ? null : preset)}
                className={`rounded-xl border transition-all duration-200 h-16 flex flex-col items-center justify-center gap-1.5 p-2 text-center active:scale-95 ${
                isSelected
                    ? 'border-white bg-white text-black shadow-lg'
                    : 'border-gray-800 bg-gray-900 text-gray-400 hover:border-gray-600 hover:text-white'
                }`}
            >
                <span
                  aria-hidden="true"
                  className={`w-5 h-5 rounded-full flex-shrink-0 ring-1 ${STYLE_SWATCHES[preset.id] || 'bg-gray-600'} ${
                    isSelected ? 'ring-black/20' : 'ring-white/15'
                  }`}
                />
                <span className="text-xs font-semibold leading-none">{preset.name}</span>
            </button>
            );
            })}
        </div>
    </div>
  );
};
