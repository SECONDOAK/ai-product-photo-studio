
import React from 'react';
import { ImageModelId } from '../services/geminiService';

interface ModelOption {
  id: ImageModelId;
  label: string;
  tagline: string;
}

const MODELS: ModelOption[] = [
  { id: 'gemini-nano-banana-2.1', label: 'Nano Banana 2.1', tagline: 'Latest · fast' },
  { id: 'gemini-3-pro-image-preview', label: 'Nano Banana Pro', tagline: 'Gemini 3 Pro' },
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
              className={`flex flex-col items-start justify-center px-4 py-2 rounded-xl border transition-all duration-200 min-w-[140px] active:scale-95 ${
                isSelected
                  ? 'border-white bg-white shadow-lg'
                  : 'border-gray-800 bg-gray-900 hover:border-gray-600'
              }`}
            >
              <span className={`text-sm font-bold ${isSelected ? 'text-black' : 'text-gray-300'}`}>
                {model.label}
              </span>
              <span className={`text-xs ${isSelected ? 'text-gray-600' : 'text-gray-500'}`}>
                {model.tagline}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
