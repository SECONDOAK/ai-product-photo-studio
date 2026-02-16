
import React, { useEffect, useState, useRef } from 'react';
import { XCircleIcon, DownloadIcon } from './IconComponents';

interface ImageModalProps {
  isOpen: boolean;
  imageUrl: string;
  onClose: () => void;
  filenamePrefix: string;
  onFilenameChange: (name: string) => void;
}

export const ImageModal: React.FC<ImageModalProps> = ({ isOpen, imageUrl, onClose, filenamePrefix, onFilenameChange }) => {
  // Initialize state from localStorage if available
  const [selectedFormat, setSelectedFormat] = useState<'png' | 'jpeg'>(
    (localStorage.getItem('export_format') as 'png' | 'jpeg') || 'jpeg'
  );
  const [quality, setQuality] = useState<number>(
    parseInt(localStorage.getItem('export_quality') || '90')
  );
  
  const [width, setWidth] = useState<number>(0);
  const [height, setHeight] = useState<number>(0);
  const [aspectRatio, setAspectRatio] = useState<number>(1);
  const [originalImage, setOriginalImage] = useState<HTMLImageElement | null>(null);
  
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  // Load image dimensions when modal opens or url changes
  useEffect(() => {
    if (!isOpen || !imageUrl) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = imageUrl;
    img.onload = () => {
        setOriginalImage(img);
        const currentAspect = img.naturalWidth / img.naturalHeight;
        setAspectRatio(currentAspect);

        // Check for saved width setting
        const savedWidth = localStorage.getItem('export_width');
        
        if (savedWidth) {
            const w = parseInt(savedWidth);
            setWidth(w);
            // Calculate height based on the saved width and the CURRENT image's aspect ratio
            // This ensures we maintain the correct proportions for the new image
            setHeight(Math.round(w / currentAspect));
        } else {
            // Default to original size if no setting exists
            setWidth(img.naturalWidth);
            setHeight(img.naturalHeight);
        }
    };
  }, [isOpen, imageUrl]);

  const handleWidthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = parseInt(e.target.value) || 0;
      setWidth(val);
      if (val > 0) {
          setHeight(Math.round(val / aspectRatio));
      }
  };

  const handleHeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = parseInt(e.target.value) || 0;
      setHeight(val);
      if (val > 0) {
          setWidth(Math.round(val * aspectRatio));
      }
  };

  const handleDownload = () => {
    if (!originalImage || width <= 0 || height <= 0) return;

    // Save current settings to localStorage
    localStorage.setItem('export_format', selectedFormat);
    localStorage.setItem('export_quality', quality.toString());
    localStorage.setItem('export_width', width.toString());

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
        // High quality scaling
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(originalImage, 0, 0, width, height);

        const mimeType = selectedFormat === 'png' ? 'image/png' : 'image/jpeg';
        const qualityParam = selectedFormat === 'jpeg' ? quality / 100 : undefined;
        
        const dataUrl = canvas.toDataURL(mimeType, qualityParam);
        
        const link = document.createElement('a');
        link.href = dataUrl;
        const finalName = filenamePrefix.trim() || 'ai-product-photo';
        link.download = `${finalName}.${selectedFormat}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="bg-gray-800 border border-gray-700 rounded-lg shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col md:flex-row"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Left Side: Image Preview */}
        <div className="relative flex-grow bg-black/50 flex items-center justify-center p-8 overflow-auto min-h-[300px]">
             <img 
                src={imageUrl} 
                alt="Preview" 
                className="max-w-full max-h-full object-contain shadow-2xl rounded-sm" 
                style={{ maxHeight: '70vh' }}
             />
        </div>

        {/* Right Side: Settings Panel */}
        <div className="w-full md:w-80 bg-gray-800 border-l border-gray-700 flex flex-col flex-shrink-0">
            <div className="p-5 border-b border-gray-700 flex justify-between items-center">
                <h2 className="text-lg font-semibold text-white">Export Settings</h2>
                <button
                    onClick={onClose}
                    className="text-gray-500 hover:text-white transition-colors"
                    aria-label="Close"
                >
                    <XCircleIcon className="w-6 h-6" />
                </button>
            </div>
            
            <div className="p-5 space-y-6 flex-grow overflow-y-auto">
                
                {/* Filename */}
                <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Filename</label>
                    <input 
                        type="text" 
                        value={filenamePrefix}
                        onChange={(e) => onFilenameChange(e.target.value)}
                        className="w-full p-2 bg-gray-900 border border-gray-600 rounded text-sm text-white focus:border-white focus:ring-0 outline-none transition"
                    />
                </div>

                <hr className="border-gray-700" />

                {/* File Settings Group */}
                <div className="space-y-4">
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">File Settings</label>
                    
                    <div className="grid grid-cols-3 items-center gap-2">
                        <span className="text-sm text-gray-300 col-span-1">Format:</span>
                        <div className="col-span-2 relative">
                            <select 
                                value={selectedFormat}
                                onChange={(e) => setSelectedFormat(e.target.value as 'jpeg' | 'png')}
                                className="w-full p-2 bg-gray-900 border border-gray-600 rounded text-sm text-white appearance-none cursor-pointer focus:border-white outline-none"
                            >
                                <option value="jpeg">JPG</option>
                                <option value="png">PNG</option>
                            </select>
                            {/* Custom arrow for select */}
                            <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-gray-400">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                            </div>
                        </div>
                    </div>

                    {selectedFormat === 'jpeg' && (
                        <div className="space-y-2">
                             <div className="flex justify-between text-sm text-gray-300">
                                <span>Quality:</span>
                                <span>{quality}</span>
                             </div>
                             <input 
                                type="range" 
                                min="10" 
                                max="100" 
                                value={quality} 
                                onChange={(e) => setQuality(parseInt(e.target.value))}
                                className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-white"
                             />
                             <div className="flex justify-between text-xs text-gray-500 px-1">
                                <span>Low</span>
                                <span>High</span>
                             </div>
                        </div>
                    )}
                </div>

                <hr className="border-gray-700" />

                {/* Image Size Group */}
                <div className="space-y-4">
                     <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">Image Size</label>
                     
                     <div className="grid grid-cols-3 items-center gap-2">
                        <span className="text-sm text-gray-300 col-span-1">Width:</span>
                        <div className="col-span-2 relative">
                             <input 
                                type="number" 
                                value={width}
                                onChange={handleWidthChange}
                                className="w-full p-2 bg-gray-900 border border-gray-600 rounded text-sm text-white focus:border-white focus:ring-0 outline-none"
                            />
                            <span className="absolute right-8 top-1/2 -translate-y-1/2 text-xs text-gray-500 pointer-events-none">px</span>
                        </div>
                     </div>

                     <div className="grid grid-cols-3 items-center gap-2">
                        <span className="text-sm text-gray-300 col-span-1">Height:</span>
                        <div className="col-span-2 relative">
                             <input 
                                type="number" 
                                value={height}
                                onChange={handleHeightChange}
                                className="w-full p-2 bg-gray-900 border border-gray-600 rounded text-sm text-white focus:border-white focus:ring-0 outline-none"
                            />
                            <span className="absolute right-8 top-1/2 -translate-y-1/2 text-xs text-gray-500 pointer-events-none">px</span>
                        </div>
                     </div>
                </div>

            </div>

            <div className="p-5 border-t border-gray-700 bg-gray-800">
                <button
                    onClick={handleDownload}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 text-sm font-bold text-black bg-white rounded shadow hover:bg-gray-200 transition-all active:scale-[0.98]"
                >
                    <DownloadIcon className="w-4 h-4" />
                    <span>Download</span>
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};
