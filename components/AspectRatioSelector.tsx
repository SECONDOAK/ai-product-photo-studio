
import React from 'react';

const ASPECT_RATIOS = ['1:1', '4:3', '3:4', '16:9', '9:16'];

// Miniature outline per ratio, scaled so the longest edge is 18px
const MINIATURE_SIZES: Record<string, { w: number; h: number }> = {
  '1:1': { w: 14, h: 14 },
  '4:3': { w: 18, h: 13.5 },
  '3:4': { w: 13.5, h: 18 },
  '16:9': { w: 18, h: 10 },
  '9:16': { w: 10, h: 18 },
};

interface AspectRatioSelectorProps {
  selectedAspectRatio: string;
  onSelect: (aspectRatio: string) => void;
}

export const AspectRatioSelector: React.FC<AspectRatioSelectorProps> = ({ selectedAspectRatio, onSelect }) => {
  return (
    <div className="mt-6">
      <h3 className="text-sm font-semibold text-gray-300 mb-3">Aspect Ratio</h3>
      <div className="flex flex-wrap gap-3">
        {ASPECT_RATIOS.map((ratio) => {
          const isSelected = selectedAspectRatio === ratio;
          const size = MINIATURE_SIZES[ratio];
          return (
            <button
              key={ratio}
              onClick={() => onSelect(ratio)}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl border transition-all duration-200 active:scale-95 ${
                isSelected
                  ? 'border-white bg-white text-black shadow-lg'
                  : 'border-gray-800 bg-gray-900 text-gray-400 hover:border-gray-600 hover:text-white'
              }`}
            >
              <span
                aria-hidden="true"
                className={`block flex-shrink-0 rounded-[3px] border-[1.5px] ${
                  isSelected ? 'border-black/70' : 'border-current opacity-70'
                }`}
                style={{ width: size.w, height: size.h }}
              />
              {ratio}
            </button>
          );
        })}
      </div>
    </div>
  );
};
