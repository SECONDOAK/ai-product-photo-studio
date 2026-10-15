
import React, { useEffect, useState, useMemo } from 'react';
import { XCircleIcon, DownloadIcon } from './IconComponents';

type ExportFormat = 'png' | 'jpeg' | 'webp';

const FORMAT_LABELS: Record<ExportFormat, string> = {
  png: 'PNG',
  jpeg: 'JPG',
  webp: 'WEBP',
};

const FORMAT_EXT: Record<ExportFormat, string> = {
  png: 'png',
  jpeg: 'jpg',
  webp: 'webp',
};

const SIZE_PRESETS = [2048, 1600, 1080, 800];

interface ImageModalProps {
  isOpen: boolean;
  imageUrl: string;
  onClose: () => void;
  filenamePrefix: string;
  onFilenameChange: (name: string) => void;
}

export const ImageModal: React.FC<ImageModalProps> = ({ isOpen, imageUrl, onClose, filenamePrefix, onFilenameChange }) => {
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>(() => {
    const saved = localStorage.getItem('export_format');
    return saved === 'png' || saved === 'jpeg' || saved === 'webp' ? saved : 'jpeg';
  });
  const [quality, setQuality] = useState<number>(
    parseInt(localStorage.getItem('export_quality') || '90')
  );

  const [width, setWidth] = useState<number>(0);
  const [height, setHeight] = useState<number>(0);
  const [lockAspect, setLockAspect] = useState<boolean>(true);
  const [aspectRatio, setAspectRatio] = useState<number>(1);
  const [originalImage, setOriginalImage] = useState<HTMLImageElement | null>(null);

  // WebP encoding support varies by browser — hide the option when unsupported
  const webpSupported = useMemo(() => {
    const c = document.createElement('canvas');
    c.width = 1; c.height = 1;
    return c.toDataURL('image/webp').startsWith('data:image/webp');
  }, []);

  const formats: ExportFormat[] = webpSupported ? ['png', 'jpeg', 'webp'] : ['png', 'jpeg'];

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
        setWidth(img.naturalWidth);
        setHeight(img.naturalHeight);
    };
  }, [isOpen, imageUrl]);

  const handleWidthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = parseInt(e.target.value) || 0;
      setWidth(val);
      if (lockAspect && val > 0) {
          setHeight(Math.round(val / aspectRatio));
      }
  };

  const handleHeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = parseInt(e.target.value) || 0;
      setHeight(val);
      if (lockAspect && val > 0) {
          setWidth(Math.round(val * aspectRatio));
      }
  };

  const applyPreset = (preset: number | 'original') => {
      if (!originalImage) return;
      if (preset === 'original') {
          setWidth(originalImage.naturalWidth);
          setHeight(originalImage.naturalHeight);
          return;
      }
      // Preset sets the longest edge; the other side follows the aspect ratio
      if (aspectRatio >= 1) {
          setWidth(preset);
          setHeight(Math.round(preset / aspectRatio));
      } else {
          setHeight(preset);
          setWidth(Math.round(preset * aspectRatio));
      }
  };

  const isOriginalSize = originalImage
    ? width === originalImage.naturalWidth && height === originalImage.naturalHeight
    : false;

  const isPresetActive = (preset: number) => {
      if (!originalImage || isOriginalSize) return false;
      return aspectRatio >= 1 ? width === preset : height === preset;
  };

  const showQuality = selectedFormat === 'jpeg' || selectedFormat === 'webp';
  const finalName = (filenamePrefix.trim() || 'ai-product-photo');
  const finalExt = FORMAT_EXT[selectedFormat];

  const handleDownload = () => {
    if (!originalImage || width <= 0 || height <= 0) return;

    localStorage.setItem('export_format', selectedFormat);
    localStorage.setItem('export_quality', quality.toString());

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    if (ctx) {
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(originalImage, 0, 0, width, height);

        const mimeType = selectedFormat === 'png' ? 'image/png' : selectedFormat === 'webp' ? 'image/webp' : 'image/jpeg';
        const qualityParam = showQuality ? quality / 100 : undefined;

        const dataUrl = canvas.toDataURL(mimeType, qualityParam);

        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = `${finalName}.${finalExt}`;
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
        <div className="w-full md:w-96 bg-gray-800 border-l border-gray-700 flex flex-col flex-shrink-0">
            <div className="p-5 border-b border-gray-700 flex justify-between items-start">
                <div>
                    <h2 className="text-lg font-bold text-white uppercase tracking-wider">Download</h2>
                    {originalImage && (
                        <p className="text-sm text-gray-500 mt-0.5">Original {originalImage.naturalWidth} × {originalImage.naturalHeight} px</p>
                    )}
                </div>
                <button
                    onClick={onClose}
                    className="text-gray-500 hover:text-white transition-colors"
                    aria-label="Close"
                >
                    <XCircleIcon className="w-6 h-6" />
                </button>
            </div>

            <div className="p-5 space-y-6 flex-grow overflow-y-auto">

                {/* Name */}
                <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Name</label>
                    <input
                        type="text"
                        value={filenamePrefix}
                        onChange={(e) => onFilenameChange(e.target.value)}
                        className="w-full p-2.5 bg-gray-900 border border-gray-600 rounded-lg text-sm text-white focus:border-white focus:ring-0 outline-none transition"
                    />
                    <p className="text-xs text-gray-500 mt-1.5">Saves as <span className="font-mono text-gray-400">{finalName}.{finalExt}</span></p>
                </div>

                {/* Format */}
                <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Format</label>
                    <div className="grid grid-cols-3 gap-1 p-1 bg-gray-900 border border-gray-700 rounded-lg">
                        {formats.map((fmt) => (
                            <button
                                key={fmt}
                                onClick={() => setSelectedFormat(fmt)}
                                className={`py-2 text-sm font-bold rounded-md transition-all ${
                                    selectedFormat === fmt
                                        ? 'bg-white text-black shadow'
                                        : 'text-gray-400 hover:text-white'
                                }`}
                            >
                                {FORMAT_LABELS[fmt]}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Size */}
                <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Size (px)</label>
                    <div className="flex items-center gap-2">
                        <input
                            type="number"
                            value={width || ''}
                            onChange={handleWidthChange}
                            className="w-full p-2.5 bg-gray-900 border border-gray-600 rounded-lg text-sm text-white focus:border-white focus:ring-0 outline-none"
                            aria-label="Width"
                        />
                        <button
                            onClick={() => setLockAspect(prev => !prev)}
                            className={`flex-shrink-0 p-2.5 rounded-lg border transition-all ${
                                lockAspect
                                    ? 'bg-gray-700 border-gray-500 text-white'
                                    : 'bg-gray-900 border-gray-700 text-gray-500 hover:text-white'
                            }`}
                            title={lockAspect ? 'Aspect ratio locked' : 'Aspect ratio unlocked'}
                            aria-label="Toggle aspect ratio lock"
                        >
                            {lockAspect ? (
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" /></svg>
                            ) : (
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5V6.75a4.5 4.5 0 119 0v3.75M3.75 21.75h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H3.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" /></svg>
                            )}
                        </button>
                        <input
                            type="number"
                            value={height || ''}
                            onChange={handleHeightChange}
                            className="w-full p-2.5 bg-gray-900 border border-gray-600 rounded-lg text-sm text-white focus:border-white focus:ring-0 outline-none"
                            aria-label="Height"
                        />
                    </div>
                    <div className="flex flex-wrap gap-2 mt-3">
                        <button
                            onClick={() => applyPreset('original')}
                            className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                                isOriginalSize
                                    ? 'bg-white text-black border-white'
                                    : 'bg-gray-900 text-gray-400 border-gray-700 hover:text-white hover:border-gray-500'
                            }`}
                        >
                            Original
                        </button>
                        {SIZE_PRESETS.map((preset) => (
                            <button
                                key={preset}
                                onClick={() => applyPreset(preset)}
                                className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                                    isPresetActive(preset)
                                        ? 'bg-white text-black border-white'
                                        : 'bg-gray-900 text-gray-400 border-gray-700 hover:text-white hover:border-gray-500'
                                }`}
                            >
                                {preset}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Quality */}
                {showQuality && (
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Quality</label>
                            <span className="text-sm font-mono text-white">{quality}</span>
                        </div>
                        <input
                            type="range"
                            min="10"
                            max="100"
                            value={quality}
                            onChange={(e) => setQuality(parseInt(e.target.value))}
                            className="w-full h-1.5 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-white"
                        />
                    </div>
                )}

            </div>

            <div className="p-5 border-t border-gray-700 bg-gray-800">
                <button
                    onClick={handleDownload}
                    disabled={!originalImage || width <= 0 || height <= 0}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-bold uppercase tracking-wide text-black bg-white rounded-lg shadow hover:bg-gray-200 disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
                >
                    <DownloadIcon className="w-4 h-4" />
                    <span>Download {FORMAT_LABELS[selectedFormat]} · {width}×{height}</span>
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};
