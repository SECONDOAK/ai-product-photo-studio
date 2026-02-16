
import React from 'react';
import { CoinIcon } from './IconComponents';

const RESOLUTIONS = ['1K', '2K', '4K'];

// Exchange rate approx 1 USD = 11 SEK
const EXCHANGE_RATE = 11;
const PRICES_USD: Record<string, number> = {
    '1K': 0.134,
    '2K': 0.134,
    '4K': 0.24
};

interface ResolutionSelectorProps {
  selectedResolution: string;
  onSelect: (resolution: string) => void;
  locked4K?: boolean;
}

export const ResolutionSelector: React.FC<ResolutionSelectorProps> = ({ selectedResolution, onSelect, locked4K = false }) => {
  return (
    <div className="mt-6">
      <h3 className="text-sm font-semibold text-gray-300 mb-3">Resolution & Cost per image generation</h3>
      <div className="flex flex-wrap gap-3">
        {RESOLUTIONS.map((res) => {
            const priceSek = (PRICES_USD[res] * EXCHANGE_RATE).toFixed(2);
            const isSelected = selectedResolution === res;
            const isLocked = res === '4K' && locked4K;
            return (
              <button
                key={res}
                onClick={() => !isLocked && onSelect(res)}
                disabled={isLocked}
                className={`flex flex-col items-center justify-center px-4 py-2 rounded-xl border transition-all duration-200 min-w-[90px] active:scale-95 ${
                  isLocked
                    ? 'border-gray-800 bg-gray-900/50 opacity-40 cursor-not-allowed'
                    : isSelected
                    ? 'border-white bg-white shadow-lg'
                    : 'border-gray-800 bg-gray-900 hover:border-gray-600'
                }`}
              >
                <span className={`text-sm font-bold mb-1 ${isLocked ? 'text-gray-500' : isSelected ? 'text-black' : 'text-gray-300'}`}>
                  {res}{isLocked ? ' 🔒' : ''}
                </span>
                <div className={`flex items-center space-x-1 px-2 py-0.5 rounded-full ${isSelected && !isLocked ? 'bg-gray-200' : 'bg-black/40'}`}>
                    <CoinIcon className={`w-3 h-3 ${isSelected && !isLocked ? 'text-yellow-600' : 'text-yellow-500'}`} />
                    <span className={`text-xs font-medium ${isSelected && !isLocked ? 'text-gray-800' : 'text-gray-500'}`}>{priceSek} kr</span>
                </div>
              </button>
            );
        })}
      </div>
    </div>
  );
};
