
import React from 'react';
import { ImageModelId } from '../services/geminiService';
import { BoltIcon, GemIcon } from './IconComponents';

interface ModelOption {
  id: ImageModelId;
  label: string;
  tagline: string;
  Icon: React.FC<React.SVGProps<SVGSVGElement>>;
  chipGradient: string;
  chipGlow: string;
}

const MODELS: ModelOption[] = [
  {
    id: 'gemini-nano-banana-2.1',
    label: 'Fast',
    tagline: 'Latest · fastest',
    Icon: BoltIcon,
    chipGradient: 'bg-gradient-to-br from-amber-300 via-orange-400 to-rose-400',
    chipGlow: 'shadow-[0_4px_14px_rgba(251,146,60,0.45)]',
  },
  {
    id: 'gemini-3-pro-image-preview',
    label: 'Pro',
    tagline: 'Max detail, text & logos',
    Icon: GemIcon,
    chipGradient: 'bg-gradient-to-br from-sky-400 via-violet-500 to-fuchsia-500',
    chipGlow: 'shadow-[0_4px_14px_rgba(139,92,246,0.45)]',
  },
];

interface ModelSelectorProps {
  selectedModel: ImageModelId;
  onSelect: (model: ImageModelId) => void;
}

export const ModelSelector: React.FC<ModelSelectorProps> = ({ selectedModel, onSelect }) => {
  return (
    <div className="mt-6">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2.5">Model</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {MODELS.map((model) => {
          const isSelected = selectedModel === model.id;
          return (
            <button
              key={model.id}
              onClick={() => onSelect(model.id)}
              className={`group flex items-center gap-3 px-4 py-3 rounded-2xl border transition-all duration-200 active:scale-[0.98] ${
                isSelected
                  ? 'border-white bg-white shadow-lg'
                  : 'border-gray-800 bg-gray-900 hover:border-gray-600'
              }`}
            >
              <span
                className={`relative flex items-center justify-center w-10 h-10 flex-shrink-0 rounded-xl text-white ${model.chipGradient} ${model.chipGlow} transition-transform duration-200 group-hover:scale-105`}
              >
                {/* glass highlight on the chip */}
                <span className="absolute inset-0 rounded-xl bg-gradient-to-b from-white/40 to-transparent opacity-60" style={{ height: '50%' }} />
                <model.Icon className="relative w-5 h-5 drop-shadow-sm" strokeWidth={2} />
              </span>
              <span className="flex flex-col items-start min-w-0">
                <span className={`text-sm font-bold ${isSelected ? 'text-black' : 'text-gray-200'}`}>
                  {model.label}
                </span>
                <span className={`text-xs truncate ${isSelected ? 'text-gray-500' : 'text-gray-500'}`}>
                  {model.tagline}
                </span>
              </span>
              <span
                className={`ml-auto flex-shrink-0 w-4 h-4 rounded-full border-2 transition-all ${
                  isSelected ? 'border-black bg-black' : 'border-gray-700 bg-transparent'
                }`}
              >
                {isSelected && (
                  <svg viewBox="0 0 16 16" className="w-3 h-3 m-auto mt-[1px] text-white" fill="none" stroke="currentColor" strokeWidth="3">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.5 8.5l3 3 6-7" />
                  </svg>
                )}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
