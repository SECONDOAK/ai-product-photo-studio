
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
            {presets.map((preset) => {
            const isSelected = selectedStyle?.id === preset.id;
            return (
            <button
                key={preset.id}
                onClick={() => onSelect(isSelected ? null : preset)}
                className={`rounded-xl border transition-all duration-200 h-12 flex items-center justify-center p-2 text-center active:scale-95 ${
                isSelected
                    ? 'border-white bg-white text-black shadow-lg'
                    : 'border-gray-800 bg-gray-900 text-gray-400 hover:border-gray-600 hover:text-white'
                }`}
            >
                <span className="text-xs font-semibold leading-none">{preset.name}</span>
            </button>
            );
            })}
        </div>
    </div>
  );
};
