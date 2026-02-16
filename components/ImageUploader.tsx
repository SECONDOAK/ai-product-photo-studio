
import React, { useState, useRef, useCallback } from 'react';
import { UploadIcon, XCircleIcon } from './IconComponents';
import heic2any from 'heic2any';

interface ImageUploaderProps {
  label: string;
  onImageUpload: (base64: string | null) => void;
  previewId: string;
  showPreview?: boolean;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ label, onImageUpload, previewId, showPreview = true }) => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback(async (file: File | null) => {
    if (!file) return;

    setIsProcessing(true);
    let fileToProcess: Blob = file;

    // Check if HEIC and convert
    if (file.type === 'image/heic' || file.name.toLowerCase().endsWith('.heic')) {
        try {
            const convertedBlob = await heic2any({
                blob: file,
                toType: 'image/jpeg',
                quality: 0.9
            });
            // heic2any can return a single blob or an array of blobs. Handle both.
            fileToProcess = Array.isArray(convertedBlob) ? convertedBlob[0] : convertedBlob;
        } catch (error) {
            console.error("Error converting HEIC:", error);
            setIsProcessing(false);
            return; // Exit if conversion fails
        }
    }

    // Process valid image types (including the converted JPEG)
    if (fileToProcess.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setImagePreview(base64String);
        onImageUpload(base64String);
        setIsProcessing(false);
         if (!showPreview && fileInputRef.current) {
            fileInputRef.current.value = "";
        }
      };
      reader.readAsDataURL(fileToProcess);
    } else {
        setIsProcessing(false);
    }
  }, [onImageUpload, showPreview]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };
  
  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDraggingOver(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDraggingOver(false);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDraggingOver(false);
    const file = event.dataTransfer.files?.[0];
    if (file) {
        processFile(file);
    }
  };

  const handlePaste = (event: React.ClipboardEvent<HTMLDivElement>) => {
    const items = event.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
            const file = items[i].getAsFile();
            processFile(file);
            event.preventDefault();
            break; 
        }
    }
  };


  const clearImage = () => {
    setImagePreview(null);
    onImageUpload(null);
    if (fileInputRef.current) {
        fileInputRef.current.value = "";
    }
  }

  return (
    <div>
      <label htmlFor={previewId} className="block text-sm font-semibold text-gray-300 mb-2">
        {label}
      </label>
      <div 
        className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-xl transition-all duration-200 outline-none ${
            isDraggingOver 
            ? 'border-white bg-gray-700' 
            : 'border-gray-600 bg-black/20 hover:border-gray-500 hover:bg-black/30 focus:border-white focus:bg-gray-700/50 focus:ring-2 focus:ring-white/20'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onPaste={handlePaste}
        tabIndex={0}
      >
        <div className="space-y-1 text-center w-full">
          {showPreview && imagePreview ? (
            <div className="relative group w-full max-w-xs mx-auto">
              <img src={imagePreview} alt="Preview" className="mx-auto h-40 w-auto rounded-lg shadow-lg border border-gray-700" id={previewId} />
              <button
                onClick={clearImage}
                className="absolute -top-2 -right-2 bg-white rounded-full p-1 text-black hover:text-red-500 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Remove image"
              >
                  <XCircleIcon className="w-5 h-5"/>
              </button>
            </div>
          ) : (
            <>
              {isProcessing ? (
                 <div className="flex flex-col items-center justify-center h-20">
                    <svg className="animate-spin h-8 w-8 text-white mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span className="text-xs text-gray-400">Processing image...</span>
                 </div>
              ) : (
                <>
                    <UploadIcon className="mx-auto h-10 w-10 text-gray-500" />
                    <div className="flex text-sm text-gray-400 justify-center mt-2 items-center gap-1">
                        <label
                        htmlFor={`file-upload-${previewId}`}
                        className="relative cursor-pointer font-medium text-white hover:underline focus-within:outline-none"
                        >
                        <span>Upload a file</span>
                        <input
                            id={`file-upload-${previewId}`}
                            name={`file-upload-${previewId}`}
                            type="file"
                            className="sr-only"
                            accept="image/*,.heic,.HEIC"
                            onChange={handleFileChange}
                            ref={fileInputRef}
                        />
                        </label>
                        <p className="">, drag & drop, or paste</p>
                    </div>
                    <p className="text-xs text-gray-600 mt-1">PNG, JPG, GIF, HEIC up to 10MB</p>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
