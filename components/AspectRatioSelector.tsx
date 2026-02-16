
import React from 'react';

const ASPECT_RATIOS = ['1:1', '4:3', '3:4', '16:9', '9:16'];

interface AspectRatioSelectorProps {
  selectedAspectRatio: string;
  onSelect: (aspectRatio: string) => void;
}

export const AspectRatioSelector: React.FC<AspectRatioSelectorProps> = ({ selectedAspectRatio, onSelect }) => {
  return (
    <div className="mt-6">
      <h3 className="text-sm font-semibold text-gray-300 mb-3">Aspect Ratio</h3>
      <div className="flex flex-wrap gap-3">
        {ASPECT_RATIOS.map((ratio) => (
          <button
            key={ratio}
            onClick={() => onSelect(ratio)}
            className={`px-4 py-2 text-sm font-semibold rounded-xl border transition-all duration-200 active:scale-95 ${
              selectedAspectRatio === ratio
                ? 'border-white bg-white text-black shadow-lg'
                : 'border-gray-800 bg-gray-900 text-gray-400 hover:border-gray-600 hover:text-white'
            }`}
          >
            {ratio}
          </button>
        ))}
      </div>
    </div>
  );
};
