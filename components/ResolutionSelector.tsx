
import React from 'react';
import { CoinIcon } from './IconComponents';
import { ImageModelId, MODEL_PRICES_USD, USD_TO_SEK, DEFAULT_IMAGE_MODEL } from '../services/geminiService';

const RESOLUTIONS = ['1K', '2K', '4K'];

interface ResolutionSelectorProps {
  selectedResolution: string;
  onSelect: (resolution: string) => void;
  selectedModel: ImageModelId;
  locked4K?: boolean;
}

export const ResolutionSelector: React.FC<ResolutionSelectorProps> = ({ selectedResolution, onSelect, selectedModel, locked4K = false }) => {
  const prices = MODEL_PRICES_USD[selectedModel] || MODEL_PRICES_USD[DEFAULT_IMAGE_MODEL];
  return (
    <div className="mt-6">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2.5">Resolution <span className="normal-case tracking-normal text-gray-600">· cost per image</span></h3>
      <div className="grid grid-cols-3 gap-2">
        {RESOLUTIONS.map((res) => {
            const priceSek = (prices[res] * USD_TO_SEK).toFixed(2);
            const isSelected = selectedResolution === res;
            const isLocked = res === '4K' && locked4K;
            return (
              <div key={res} className="relative group">
              <button
                onClick={() => !isLocked && onSelect(res)}
                disabled={isLocked}
                className={`w-full flex flex-col items-center justify-center px-3 py-2.5 rounded-xl border transition-all duration-200 active:scale-95 ${
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
              {isLocked && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-white text-gray-900 text-xs rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 text-center">
                  Available with your own API key. Click the <span className="inline-block align-middle">&#9881;</span> icon to add it.
                </div>
              )}
              </div>
            );
        })}
      </div>
    </div>
  );
};
