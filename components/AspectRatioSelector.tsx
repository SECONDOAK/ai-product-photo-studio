
import React from 'react';

const ASPECT_RATIOS = ['1:1', '4:3', '3:4', '16:9', '9:16'];

// Miniature outline per ratio, scaled so the longest edge is 18px
const MINIATURE_SIZES: Record<string, { w: number; h: number }> = {
  '1:1': { w: 15, h: 15 },
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
      <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2.5">Aspect Ratio</h3>
      <div className="grid grid-cols-5 gap-2">
        {ASPECT_RATIOS.map((ratio) => {
          const isSelected = selectedAspectRatio === ratio;
          const size = MINIATURE_SIZES[ratio];
          return (
            <button
              key={ratio}
              onClick={() => onSelect(ratio)}
              className={`flex flex-col items-center justify-end gap-1.5 pt-2.5 pb-2 rounded-xl border transition-all duration-200 active:scale-95 ${
                isSelected
                  ? 'border-white bg-white text-black shadow-lg'
                  : 'border-gray-800 bg-gray-900 text-gray-400 hover:border-gray-600 hover:text-white'
              }`}
            >
              <span className="flex items-end justify-center h-[18px]">
                <span
                  aria-hidden="true"
                  className={`block rounded-[3px] border-[1.5px] ${
                    isSelected ? 'border-black/70' : 'border-current opacity-70'
                  }`}
                  style={{ width: size.w, height: size.h }}
                />
              </span>
              <span className="text-xs font-semibold">{ratio}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
