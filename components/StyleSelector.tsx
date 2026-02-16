
import React from 'react';
import { StylePreset } from '../types';

interface StyleSelectorProps {
  presets: StylePreset[];
  selectedStyle: StylePreset | null;
  onSelect: (style: StylePreset | null) => void;
}

export const StyleSelector: React.FC<StyleSelectorProps> = ({ presets, selectedStyle, onSelect }) => {
  return (
    <div>
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2">
            {presets.map((preset) => (
            <button
                key={preset.id}
                onClick={() => onSelect(selectedStyle?.id === preset.id ? null : preset)}
                className={`rounded-lg border transition-all duration-200 h-16 flex items-center justify-center p-2 text-center text-xs sm:text-sm font-semibold active:scale-95 ${
                selectedStyle?.id === preset.id
                    ? 'border-white bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.2)]'
                    : 'border-gray-800 bg-gray-900/50 text-gray-400 hover:border-gray-600 hover:text-white'
                }`}
            >
                {preset.name}
            </button>
            ))}
        </div>
    </div>
  );
};
