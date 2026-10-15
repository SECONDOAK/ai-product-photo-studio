
import React from 'react';
import { ImageModelId } from '../services/geminiService';

interface ModelOption {
  id: ImageModelId;
  label: string;
  tagline: string;
}

const MODELS: ModelOption[] = [
  {
    id: 'gemini-nano-banana-2.1',
    label: 'Fast',
    tagline: 'Latest · fastest',
  },
  {
    id: 'gemini-3-pro-image-preview',
    label: 'Pro',
    tagline: 'Max detail, text & logos',
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
              className={`flex items-center px-4 py-2.5 rounded-xl border transition-all duration-200 active:scale-[0.98] ${
                isSelected
                  ? 'border-white bg-white shadow-lg'
                  : 'border-gray-800 bg-gray-900 hover:border-gray-600'
              }`}
            >
              <span className="flex flex-col items-start min-w-0">
                <span className={`text-sm font-bold ${isSelected ? 'text-black' : 'text-gray-200'}`}>
                  {model.label}
                </span>
                <span className="text-xs truncate text-gray-500">
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
