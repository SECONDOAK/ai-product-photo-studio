
import React, { useState, useCallback, useRef } from 'react';
import { Header } from './components/Header';
import { ImageUploader } from './components/ImageUploader';
import { StyleSelector } from './components/StyleSelector';
import { LoadingSpinner } from './components/LoadingSpinner';
import { PhotoIcon, SparklesIcon, XCircleIcon, DownloadIcon, UndoIcon, PencilIcon, CoinIcon, InfoIcon, PaperClipIcon } from './components/IconComponents';
import { generateProductPhoto, retouchImage } from './services/geminiService';
import { StylePreset } from './types';
import { STYLE_PRESETS } from './constants';
import { ImageModal } from './components/ImageModal';
import { ApiKeyModal } from './components/ApiKeyModal';
import { ReferenceAspectSelector } from './components/ReferenceAspectSelector';
import { BeforeAfterSlider } from './components/BeforeAfterSlider';
import { HistoryCarousel } from './components/HistoryCarousel';
import { AspectRatioSelector } from './components/AspectRatioSelector';
import { ResolutionSelector } from './components/ResolutionSelector';
import { DrawingCanvas, DrawingCanvasHandle } from './components/DrawingCanvas';
import heic2any from 'heic2any';

const FREE_GENERATIONS = 5;

// Cost constants matching ResolutionSelector
const EXCHANGE_RATE = 11;
const PRICES_USD: Record<string, number> = {
    '1K': 0.134,
    '2K': 0.134,
    '4K': 0.24
};

const App: React.FC = () => {
  const [productImages, setProductImages] = useState<string[]>([]);
  const [referenceImage, setReferenceImage] = useState<string | null>(null);
  const [referenceAspects, setReferenceAspects] = useState<string[]>([]);
  const [textPrompt, setTextPrompt] = useState('');
  const [outputDescription, setOutputDescription] = useState('');
  const [aspectRatio, setAspectRatio] = useState<string>('1:1');
  const [resolution, setResolution] = useState<string>('1K');
  const [selectedStyle, setSelectedStyle] = useState<StylePreset | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [generationHistory, setGenerationHistory] = useState<string[]>([]);
  const [retouchBeforeImage, setRetouchBeforeImage] = useState<string | null>(null);
  const [retouchPrompt, setRetouchPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filenamePrefix, setFilenamePrefix] = useState('ai-product-photo');
  const [sessionCost, setSessionCost] = useState(0);

  // Retouch Reference State
  const [retouchRefImage, setRetouchRefImage] = useState<string | null>(null);
  const retouchFileInputRef = useRef<HTMLInputElement>(null);
  const [isRetouchRefProcessing, setIsRetouchRefProcessing] = useState(false);

  // API Key & Auth State
  const [apiKey, setApiKey] = useState<string>(localStorage.getItem('gemini-api-key') || '');
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState<boolean>(() => {
      return localStorage.getItem('gemini-app-unlocked') === 'true';
  });

  // Trial State
  const [trialRemaining, setTrialRemaining] = useState<number>(() => {
    const saved = localStorage.getItem('gemini-trial-remaining');
    return saved !== null ? parseInt(saved) : FREE_GENERATIONS;
  });

  // Masking State
  const [isMaskingMode, setIsMaskingMode] = useState(false);
  const [brushSize, setBrushSize] = useState(10);
  const canvasRef = useRef<DrawingCanvasHandle>(null);

  // Abort Controller
  const abortControllerRef = useRef<AbortController | null>(null);

  // User has full access if they have an API key or are unlocked via password
  const hasFullAccess = !!(apiKey || isUnlocked);
  // User is in free trial mode (no key, not unlocked)
  const isTrialMode = !hasFullAccess;
  const trialExhausted = isTrialMode && trialRemaining <= 0;

  const handleAddProductImage = useCallback((newImage: string | null) => {
    if (newImage && !productImages.includes(newImage)) {
        setProductImages(prev => [...prev, newImage]);
    }
  }, [productImages]);

  const handleRemoveProductImage = useCallback((indexToRemove: number) => {
    setProductImages(prev => prev.filter((_, index) => index !== indexToRemove));
  }, []);

  const handleSaveKey = (key: string) => {
    setApiKey(key);
    localStorage.setItem('gemini-api-key', key);
    setIsApiKeyModalOpen(false);
  };

  const handlePasswordSuccess = () => {
    setIsUnlocked(true);
    localStorage.setItem('gemini-app-unlocked', 'true');
    setIsApiKeyModalOpen(false);
  };

  const handleLogout = () => {
    setApiKey('');
    setIsUnlocked(false);
    localStorage.removeItem('gemini-api-key');
    localStorage.removeItem('gemini-app-unlocked');
  };

  const decrementTrial = () => {
    if (isTrialMode) {
      const newCount = Math.max(0, trialRemaining - 1);
      setTrialRemaining(newCount);
      localStorage.setItem('gemini-trial-remaining', newCount.toString());
    }
  };

  const calculateAndAddCost = (res: string) => {
      const usdCost = PRICES_USD[res] || 0;
      const sekCost = usdCost * EXCHANGE_RATE;
      setSessionCost(prev => prev + sekCost);
  };

  const handleAbort = useCallback(() => {
    if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
    }
    setIsLoading(false);
    setError('Generation canceled by user.');
  }, []);

  const handleGenerate = useCallback(async () => {
    const hasImages = productImages.length > 0;
    const hasDescription = outputDescription.trim().length > 0;

    if (!hasImages && !hasDescription) {
      setError('Please upload a product image OR describe the image you want to generate.');
      return;
    }

    // If trial exhausted, show modal
    if (trialExhausted) {
      setIsApiKeyModalOpen(true);
      return;
    }

    // Block 4K in trial mode
    if (isTrialMode && resolution === '4K') {
      setError('4K resolution requires your own API key or login. Please use 1K or 2K, or add your API key in settings.');
      return;
    }

    setRetouchBeforeImage(null);
    setIsMaskingMode(false);
    setRetouchRefImage(null);
    setIsLoading(true);
    setError(null);

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    try {
      if (abortController.signal.aborted) return;

      let combinedPrompt = '';

      if (hasImages) {
          if (productImages.length > 1) {
              combinedPrompt = `You are an AI photographer. You will be given ${productImages.length} images of the SAME product from different angles. Use these images to understand the product's complete form.`;
          } else {
              combinedPrompt = `You are an AI photographer. You will be given an image of a product.`;
          }

          if (referenceImage) {
            let aspectClause = `Your task is to generate a new image of the product from the FIRST set of images, rendered in the style (e.g., lighting, mood, background) of the LAST image provided.`;
            if (referenceAspects.length > 0) {
                aspectClause = `Your task is to generate a new image of the product from the FIRST set of images. Use the LAST image provided as a style reference, but ONLY for the following aspects: ${referenceAspects.join(', ')}.`;
            }
            combinedPrompt += ` ${aspectClause} It is crucial that you only use the product from the first set of images and not any product present in the last (style reference) image.`;
          } else {
            combinedPrompt += ' Your task is to create a professional product photo of the object from the provided image(s).';
          }
      } else {
          combinedPrompt = "You are an expert AI product photographer. Create a high-quality, professional product photo based on the following description.";
          if (referenceImage) {
             combinedPrompt += " Use the provided image as a style reference (lighting, mood, composition).";
          }
      }

      if (outputDescription) {
        combinedPrompt += ` Follow these composition instructions: ${outputDescription}.`;
      }

      let stylePrompt = '';
      if (selectedStyle) {
        stylePrompt += selectedStyle.prompt;
      }
      if (textPrompt) {
        if (stylePrompt) stylePrompt += ' ';
        stylePrompt += textPrompt;
      }

      if (stylePrompt.trim()) {
        combinedPrompt += ` Additional style guidance: ${stylePrompt.trim()}.`;
      }

      // If user has own API key, pass it directly. Otherwise proxy handles it.
      const result = await generateProductPhoto(
          productImages,
          referenceImage,
          combinedPrompt,
          aspectRatio,
          resolution,
          abortController.signal,
          apiKey || undefined
      );

      if (!abortController.signal.aborted) {
        setGeneratedImage(result);
        setGenerationHistory(prev => [result, ...prev]);

        if (isTrialMode) {
          decrementTrial();
        } else {
          calculateAndAddCost(resolution);
        }
      }

    } catch (e: any) {
      if (e.name === 'AbortError') {
          console.log('Generation aborted.');
          return;
      }
      console.error(e);
      setError(e instanceof Error ? e.message : 'An unknown error occurred.');
    } finally {
      if (abortControllerRef.current === abortController) {
          setIsLoading(false);
          abortControllerRef.current = null;
      }
    }
  }, [productImages, referenceImage, textPrompt, selectedStyle, outputDescription, referenceAspects, aspectRatio, resolution, apiKey, isTrialMode, trialExhausted, trialRemaining]);

  const handleRetouch = useCallback(async () => {
    if (!generatedImage || !retouchPrompt.trim()) {
        setError('Please provide a retouch instruction.');
        return;
    }

    if (trialExhausted) {
      setIsApiKeyModalOpen(true);
      return;
    }

    if (isTrialMode && resolution === '4K') {
      setError('4K resolution requires your own API key or login.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setRetouchBeforeImage(generatedImage);

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    try {
        if (abortController.signal.aborted) return;

        let maskBase64 = undefined;
        if (isMaskingMode && canvasRef.current && !canvasRef.current.isEmpty()) {
            maskBase64 = canvasRef.current.getMaskDataUrl();
        }

        const result = await retouchImage(
            generatedImage,
            retouchPrompt,
            aspectRatio,
            resolution,
            maskBase64,
            retouchRefImage || undefined,
            abortController.signal,
            apiKey || undefined
        );

        if (!abortController.signal.aborted) {
            setGeneratedImage(result);
            setGenerationHistory(prev => [result, ...prev]);
            setRetouchPrompt('');
            setIsMaskingMode(false);
            if (canvasRef.current) canvasRef.current.clear();

            if (isTrialMode) {
              decrementTrial();
            } else {
              calculateAndAddCost(resolution);
            }
        }

    } catch (e: any) {
        if (e.name === 'AbortError') {
            console.log('Retouch aborted.');
            return;
        }
        console.error(e);
        setError(e instanceof Error ? e.message : 'An unknown error occurred during retouch.');
    } finally {
      if (abortControllerRef.current === abortController) {
        setIsLoading(false);
        abortControllerRef.current = null;
      }
    }
  }, [generatedImage, retouchPrompt, aspectRatio, resolution, isMaskingMode, retouchRefImage, apiKey, isTrialMode, trialExhausted, trialRemaining]);

  const handleUndoRetouch = useCallback(() => {
    if (retouchBeforeImage) {
        setGeneratedImage(retouchBeforeImage);
        setRetouchBeforeImage(null);
        setRetouchPrompt('');
        setError(null);
        setGenerationHistory(prev => prev.slice(1));
        setIsMaskingMode(false);
    }
  }, [retouchBeforeImage]);

  const handleStyleSelect = (style: StylePreset | null) => {
    setSelectedStyle(style);
  }

  const handleSelectFromHistory = useCallback((image: string) => {
    if (image === generatedImage) {
        setIsModalOpen(true);
        return;
    }
    setGeneratedImage(image);
    setRetouchBeforeImage(null);
    setRetouchPrompt('');
    setRetouchRefImage(null);
    setError(null);
    setIsMaskingMode(false);
  }, [generatedImage]);

  const toggleMaskingMode = () => {
    if (!generatedImage) return;
    setIsMaskingMode(prev => !prev);
    if (!isMaskingMode && retouchBeforeImage) {
       setRetouchBeforeImage(null);
    }
  };

  const undoMask = () => {
    if (canvasRef.current) canvasRef.current.undo();
  };

  // Helper: Process potential HEIC file
  const processRetouchFile = async (file: File): Promise<string | null> => {
    try {
        let fileToProcess: Blob = file;
        if (file.type === 'image/heic' || file.name.toLowerCase().endsWith('.heic')) {
             const convertedBlob = await heic2any({ blob: file, toType: 'image/jpeg', quality: 0.9 });
            fileToProcess = Array.isArray(convertedBlob) ? convertedBlob[0] : convertedBlob;
        }
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(fileToProcess);
        });
    } catch (e) {
        console.error("Failed to process file", e);
        return null;
    }
  };

  const handleRetouchPaste = async (e: React.ClipboardEvent<HTMLInputElement>) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
            e.preventDefault();
            const file = items[i].getAsFile();
            if (file) {
                setIsRetouchRefProcessing(true);
                const base64 = await processRetouchFile(file);
                if (base64) setRetouchRefImage(base64);
                setIsRetouchRefProcessing(false);
            }
            break;
        }
    }
  };

  const handleRetouchRefFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
          setIsRetouchRefProcessing(true);
          const base64 = await processRetouchFile(file);
          if (base64) {
              setRetouchRefImage(base64);
              if (retouchFileInputRef.current) retouchFileInputRef.current.value = "";
          }
          setIsRetouchRefProcessing(false);
      }
  };

  return (
    <div className="min-h-screen bg-black text-gray-100 font-sans selection:bg-white selection:text-black overflow-x-hidden">
      <Header onOpenSettings={() => setIsApiKeyModalOpen(true)} onLogout={handleLogout} isLoggedIn={hasFullAccess} />
      <main className="max-w-7xl mx-auto p-4 md:p-8 pb-36 overflow-x-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column: Inputs */}
          <div className="bg-gray-800 border border-gray-700 rounded-3xl shadow-2xl p-6 space-y-8">
            <div>
              <h2 className="text-xl font-semibold text-white mb-4 tracking-tight">1. Upload Product <span className="text-gray-500 font-normal text-sm ml-2">(Optional)</span></h2>
              <p className="text-gray-400 text-sm mb-4">Add images to feature a specific product. Skip this to generate an image from scratch.</p>

              {productImages.length > 0 && (
                <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-4">
                  {productImages.map((img, index) => (
                    <div key={index} className="relative group aspect-square">
                      <img src={img} alt={`Product image ${index + 1}`} className="w-full h-full object-cover rounded-xl shadow-lg border border-gray-700" />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-all rounded-xl flex items-center justify-center">
                        <button onClick={() => handleRemoveProductImage(index)} className="bg-white text-black rounded-full p-1.5 hover:bg-gray-200 transition-colors" aria-label="Remove image">
                          <XCircleIcon className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <ImageUploader label={productImages.length > 0 ? "Add another" : "Product Image(s)"} onImageUpload={handleAddProductImage} previewId="product-preview" showPreview={false} />
            </div>

            <div className="border-t border-gray-700 pt-8">
              <h2 className="text-xl font-semibold text-white mb-4 tracking-tight">2. Describe Output</h2>
              <p className="text-gray-400 text-sm mb-4">Composition instructions (e.g., 'A single shoe, side view'). Required if no image is uploaded.</p>
              <textarea value={outputDescription} onChange={(e) => setOutputDescription(e.target.value)} placeholder="Describe the composition..." className="w-full h-24 p-3 bg-gray-900 border border-gray-700 rounded-xl focus:ring-2 focus:ring-white focus:border-transparent transition text-sm text-white placeholder-gray-600 resize-none" rows={3} />
              <AspectRatioSelector selectedAspectRatio={aspectRatio} onSelect={setAspectRatio} />
              <ResolutionSelector selectedResolution={resolution} onSelect={setResolution} locked4K={isTrialMode} />
            </div>

            <div className="border-t border-gray-700 pt-8">
              <h2 className="text-xl font-semibold text-white mb-4 tracking-tight">3. Define Style</h2>
              <p className="text-gray-400 text-sm mb-6">Choose a preset or upload a reference.</p>
              <div className="space-y-6">
                <StyleSelector presets={STYLE_PRESETS} selectedStyle={selectedStyle} onSelect={handleStyleSelect} />
                <div>
                  <ImageUploader label="Style Reference Image (Optional)" onImageUpload={setReferenceImage} previewId="reference-preview" />
                  {referenceImage && <ReferenceAspectSelector selectedAspects={referenceAspects} onSelectionChange={setReferenceAspects} />}
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-300 mb-2">Or Describe It</h3>
                  <textarea value={textPrompt} onChange={(e) => setTextPrompt(e.target.value)} placeholder="e.g., 'on a marble surface...'" className="w-full h-24 p-3 bg-gray-900 border border-gray-700 rounded-xl focus:ring-2 focus:ring-white focus:border-transparent transition text-sm text-white placeholder-gray-600 resize-none" rows={3} />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Output */}
          <div className="bg-gray-800 border border-gray-700 rounded-3xl shadow-2xl p-6 flex flex-col h-[calc(100vh-8rem)] lg:h-[calc(100vh-12rem)] sticky top-24">

              {/* Status: Trial or Cost Counter */}
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-gray-200 uppercase tracking-wider">
                        {isTrialMode ? "Free Trial" : "API Usage"}
                    </h3>
                    <div className="group relative">
                        <InfoIcon className="w-5 h-5 text-gray-500 cursor-help hover:text-white transition-colors" />
                        <div className="absolute left-0 top-full mt-2 w-64 sm:w-80 p-4 sm:p-5 bg-white text-sm text-gray-900 rounded-xl shadow-2xl border border-gray-200 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                            {isTrialMode ? (
                                <p className="mb-3 font-bold text-gray-900">You have {trialRemaining} free generations remaining. 4K is not available in free mode.</p>
                            ) : (
                                <>
                                    <p className="mb-3 font-bold text-gray-900">The cost is based on tokens to use the Gemini API.</p>
                                    <ul className="space-y-2 text-gray-700 mb-3 font-medium">
                                        <li>• 1K / 2K images ≈ 1.47 SEK</li>
                                        <li>• 4K images ≈ 2.64 SEK</li>
                                    </ul>
                                    <p className="text-gray-500 text-xs uppercase tracking-wide">per image generation</p>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {isTrialMode ? (
                    <div className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg border ${trialRemaining === 0 ? 'bg-red-900/40 border-red-700' : 'bg-green-900/30 border-green-800'}`}>
                        <SparklesIcon className={`w-4 h-4 ${trialRemaining === 0 ? 'text-red-400' : 'text-green-400'}`} />
                        <span className={`text-sm font-mono font-medium ${trialRemaining === 0 ? 'text-red-200' : 'text-green-100'}`}>
                            {trialRemaining} left
                        </span>
                    </div>
                ) : (
                    <div className="flex items-center space-x-2 bg-black/40 px-3 py-1.5 rounded-lg border border-gray-800">
                        <CoinIcon className="w-4 h-4 text-yellow-400" />
                        <span className="text-sm font-mono font-medium text-white">{sessionCost.toLocaleString('sv-SE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} kr</span>
                    </div>
                )}
              </div>

              <HistoryCarousel images={generationHistory} selectedImage={generatedImage} onSelectImage={handleSelectFromHistory} />

              <div className="flex-grow flex flex-col items-center justify-center bg-black/40 border-2 border-dashed border-gray-600 rounded-2xl p-4 relative min-h-[300px] overflow-hidden">
                {isLoading ? (
                  <div className="text-center">
                    <LoadingSpinner />
                    <p className="mt-4 text-md font-medium text-white animate-pulse">Generating...</p>
                  </div>
                ) : (
                  isMaskingMode && generatedImage ? (
                     <div className="w-full h-full relative">
                        <DrawingCanvas ref={canvasRef} imageUrl={generatedImage} brushSize={brushSize} />
                     </div>
                  ) : retouchBeforeImage && generatedImage ? (
                    <div className="w-full h-full relative">
                        <BeforeAfterSlider beforeImage={retouchBeforeImage} afterImage={generatedImage} />
                    </div>
                  ) : generatedImage ? (
                    <div className="w-full h-full flex items-center justify-center">
                      <img src={generatedImage} alt="Generated product" className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"/>
                    </div>
                  ) : (
                    <div className="text-center text-gray-600">
                      <PhotoIcon className="mx-auto h-16 w-16 mb-4 opacity-50" />
                      <p className="text-sm">Generated image will appear here</p>
                    </div>
                  )
                )}
              </div>
               {error && <p className="mt-4 text-center text-red-400 text-sm bg-red-950/30 border border-red-900 p-2 rounded-lg">{error}</p>}

               {generatedImage && !isLoading && (
                <div className="mt-4 space-y-3">
                    <div className="flex justify-center">
                        <button onClick={() => setIsModalOpen(true)} className="flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-semibold text-black bg-white rounded-full shadow-lg hover:bg-gray-200 transition-all transform active:scale-95">
                            <DownloadIcon className="w-4 h-4" />
                            <span>View & Download{retouchBeforeImage ? ' After Image' : ''}</span>
                        </button>
                    </div>

                    <div className="flex flex-col gap-2 p-2 bg-black/20 rounded-xl border border-gray-700 backdrop-blur-sm">
                        <div className="flex w-full gap-2 items-center">
                             <button onClick={toggleMaskingMode} className={`flex items-center justify-center p-2.5 rounded-lg border transition-all ${isMaskingMode ? 'bg-white border-white text-black' : 'bg-gray-800 border-gray-700 text-gray-400 hover:text-white hover:border-gray-600'}`} title="Draw mask">
                                <PencilIcon className="w-4 h-4" />
                            </button>

                             <div className="relative group">
                                {isRetouchRefProcessing ? (
                                    <div className="w-9 h-9 flex items-center justify-center bg-gray-800 rounded-md border border-gray-600">
                                         <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                    </div>
                                ) : retouchRefImage ? (
                                    <div className="relative w-9 h-9">
                                        <img src={retouchRefImage} alt="Ref" className="w-full h-full object-cover rounded-md border border-gray-500" />
                                        <button onClick={() => setRetouchRefImage(null)} className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600 shadow-sm"><XCircleIcon className="w-3 h-3" /></button>
                                    </div>
                                ) : (
                                    <button onClick={() => retouchFileInputRef.current?.click()} className="flex items-center justify-center p-2.5 rounded-lg border border-gray-700 bg-gray-800 text-gray-400 hover:text-white hover:border-gray-600 transition-all" title="Attach reference image">
                                        <PaperClipIcon className="w-4 h-4" />
                                    </button>
                                )}
                                <input type="file" ref={retouchFileInputRef} onChange={handleRetouchRefFileSelect} className="hidden" accept="image/*,.heic,.HEIC" />
                             </div>

                            <input type="text" value={retouchPrompt} onChange={(e) => setRetouchPrompt(e.target.value)} onPaste={handleRetouchPaste} placeholder={isMaskingMode ? "Edit selection..." : "Retouch (Ctrl+V to paste image)..."} className="flex-grow p-2.5 bg-gray-900 border border-gray-700 rounded-lg focus:ring-1 focus:ring-white focus:border-white transition text-sm text-white placeholder-gray-500 outline-none" onKeyDown={(e) => e.key === 'Enter' && !!retouchPrompt.trim() && handleRetouch()} />

                            <button onClick={handleRetouch} disabled={!retouchPrompt.trim() && !isLoading} className="flex items-center justify-center gap-2 px-4 py-2.5 font-semibold text-sm text-black bg-white rounded-lg shadow-md hover:bg-gray-200 disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed transition-all active:scale-95">
                                <SparklesIcon className="w-4 h-4" />
                                <span className="hidden sm:inline">Retouch</span>
                            </button>

                            {retouchBeforeImage && !isMaskingMode && (
                                <button onClick={handleUndoRetouch} className="p-2.5 text-gray-400 bg-gray-900 border border-gray-700 rounded-lg hover:text-white hover:border-gray-600 transition-all active:scale-95" aria-label="Undo">
                                    <UndoIcon className="w-4 h-4" />
                                </button>
                            )}
                        </div>

                        {isMaskingMode && (
                             <div className="flex items-center gap-4 px-2 py-1 animate-in fade-in slide-in-from-top-1">
                                <span className="text-xs text-gray-500 font-medium whitespace-nowrap">Brush Size</span>
                                <input type="range" min="1" max="50" value={brushSize} onChange={(e) => setBrushSize(parseInt(e.target.value))} className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-white" />
                                <button onClick={undoMask} className="flex items-center gap-1 text-xs text-gray-400 hover:text-white whitespace-nowrap transition-colors">
                                    <UndoIcon className="w-3 h-3"/> Undo
                                </button>
                             </div>
                        )}
                    </div>
                </div>
               )}
          </div>
        </div>

        {/* Sticky CTA Button */}
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-40">
            <div
              className={`glow-btn-wrapper ${
                isLoading ? 'loading' : ''
              }${!isLoading && productImages.length === 0 && !outputDescription.trim() ? ' disabled' : ''}`}
              style={{ boxShadow: isLoading
                ? '0 0 25px rgba(220,38,38,0.5)'
                : (!isLoading && productImages.length === 0 && !outputDescription.trim())
                  ? 'none'
                  : '0 0 25px rgba(139,92,246,0.4), 0 0 50px rgba(168,85,247,0.15)'
              }}
            >
             <button
                onClick={isLoading ? handleAbort : () => handleGenerate()}
                disabled={!isLoading && productImages.length === 0 && !outputDescription.trim()}
                className={`glow-btn-inner flex items-center justify-center gap-3 px-10 py-4 text-lg font-bold disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-100 transition-all duration-300 ${
                    isLoading
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'bg-white text-black hover:bg-gray-100 disabled:bg-gray-800 disabled:text-gray-500'
                }`}
            >
                {isLoading ? (
                    <><XCircleIcon className="w-6 h-6"/><span>Abort Generation</span></>
                ) : (
                    <><SparklesIcon className="w-6 h-6"/><span>Generate</span></>
                )}
            </button>
            </div>
        </div>
      </main>

      {isModalOpen && generatedImage && (
        <ImageModal isOpen={isModalOpen} imageUrl={generatedImage} onClose={() => setIsModalOpen(false)} filenamePrefix={filenamePrefix} onFilenameChange={setFilenamePrefix} />
      )}

      <ApiKeyModal
        isOpen={isApiKeyModalOpen}
        onClose={() => setIsApiKeyModalOpen(false)}
        onSave={handleSaveKey}
        onPasswordSuccess={handlePasswordSuccess}
        trialOver={trialExhausted}
      />
    </div>
  );
};

export default App;
