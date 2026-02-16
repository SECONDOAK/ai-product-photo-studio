
import React from 'react';

const AVAILABLE_ASPECTS = ['Lighting', 'Background', 'Color Palette', 'Composition', 'Mood'];

interface ReferenceAspectSelectorProps {
  selectedAspects: string[];
  onSelectionChange: (aspects: string[]) => void;
}

export const ReferenceAspectSelector: React.FC<ReferenceAspectSelectorProps> = ({ selectedAspects, onSelectionChange }) => {

  const handleToggleAspect = (aspect: string) => {
    const newSelection = selectedAspects.includes(aspect)
      ? selectedAspects.filter(a => a !== aspect)
      : [...selectedAspects, aspect];
    onSelectionChange(newSelection);
  };

  return (
    <div className="mt-4 p-4 bg-gray-900/50 border border-gray-800 rounded-xl">
      <h4 className="text-sm font-semibold text-gray-300 mb-3">What to take from the reference?</h4>
      <div className="flex flex-wrap gap-2">
        {AVAILABLE_ASPECTS.map((aspect) => {
            const isSelected = selectedAspects.includes(aspect);
            return (
              <button
                key={aspect}
                onClick={() => handleToggleAspect(aspect)}
                className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wide rounded-full border transition-all duration-200 active:scale-95 ${
                  isSelected
                    ? 'bg-white text-black border-white'
                    : 'bg-black text-gray-500 border-gray-800 hover:border-gray-600 hover:text-gray-300'
                }`}
              >
                {aspect}
              </button>
            );
        })}
      </div>
    </div>
  );
};
