
import React from 'react';
import { ZoomInIcon } from './IconComponents';

interface HistoryCarouselProps {
  images: string[];
  selectedImage: string | null;
  onSelectImage: (image: string) => void;
}

export const HistoryCarousel: React.FC<HistoryCarouselProps> = ({ images, selectedImage, onSelectImage }) => {
  if (images.length === 0) {
    return null;
  }

  return (
    <div className="mb-4">
      <h3 className="text-lg font-semibold text-gray-300 mb-3">History</h3>
      <div className="flex overflow-x-auto space-x-3 p-2 -mx-6 px-6">
        {images.map((image, index) => (
          <button
            key={index}
            onClick={() => onSelectImage(image)}
            className={`relative group flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-primary-500 ${
              selectedImage === image
                ? 'border-primary-500'
                : 'border-gray-600 hover:border-primary-400'
            }`}
          >
            <img src={image} alt={`Generated image ${index + 1}`} className="w-full h-full object-cover" />
            {selectedImage === image && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                     <ZoomInIcon className="w-8 h-8 text-white drop-shadow-md" />
                </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};
