
import React from 'react';
import { ImageModelId } from '../services/geminiService';
import { BoltIcon, GemIcon } from './IconComponents';

interface ModelOption {
  id: ImageModelId;
  label: string;
  tagline: string;
  Icon: React.FC<React.SVGProps<SVGSVGElement>>;
}

const MODELS: ModelOption[] = [
  { id: 'gemini-nano-banana-2.1', label: 'Fast', tagline: 'Latest · fastest', Icon: BoltIcon },
  { id: 'gemini-3-pro-image-preview', label: 'Pro', tagline: 'Max detail, text & logos', Icon: GemIcon },
];

interface ModelSelectorProps {
  selectedModel: ImageModelId;
  onSelect: (model: ImageModelId) => void;
}

export const ModelSelector: React.FC<ModelSelectorProps> = ({ selectedModel, onSelect }) => {
  return (
    <div className="mt-6">
      <h3 className="text-sm font-semibold text-gray-300 mb-3">Model</h3>
      <div className="flex flex-wrap gap-3">
        {MODELS.map((model) => {
          const isSelected = selectedModel === model.id;
          return (
            <button
              key={model.id}
              onClick={() => onSelect(model.id)}
              className={`flex items-center gap-2.5 px-4 py-2 rounded-xl border transition-all duration-200 min-w-[140px] active:scale-95 ${
                isSelected
                  ? 'border-white bg-white shadow-lg'
                  : 'border-gray-800 bg-gray-900 hover:border-gray-600'
              }`}
            >
              <model.Icon className={`w-4 h-4 flex-shrink-0 ${isSelected ? 'text-black' : 'text-gray-400'}`} strokeWidth={1.8} />
              <span className="flex flex-col items-start">
                <span className={`text-sm font-bold ${isSelected ? 'text-black' : 'text-gray-300'}`}>
                  {model.label}
                </span>
                <span className={`text-xs ${isSelected ? 'text-gray-600' : 'text-gray-500'}`}>
                  {model.tagline}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
