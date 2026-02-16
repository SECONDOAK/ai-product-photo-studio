
import React, { useRef, useEffect, useState, useImperativeHandle, forwardRef } from 'react';

export interface DrawingCanvasHandle {
  getMaskDataUrl: () => string;
  clear: () => void;
  undo: () => void;
  isEmpty: () => boolean;
}

interface DrawingCanvasProps {
  imageUrl: string;
  brushSize: number;
}

export const DrawingCanvas = forwardRef<DrawingCanvasHandle, DrawingCanvasProps>(({ imageUrl, brushSize }, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const historyRef = useRef<ImageData[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);

  // Initialize canvas size to match image
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = imageUrl;
    img.onload = () => {
        const rect = container.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;
        
        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.strokeStyle = 'rgba(255, 0, 0, 0.5)'; // Visual feedback color (red overlay)
        }
        setImageLoaded(true);
        // Clear history on image load/reset
        historyRef.current = [];
    };
  }, [imageUrl]);

  // Handle resizing
  useEffect(() => {
     const handleResize = () => {
        const canvas = canvasRef.current;
        const container = containerRef.current;
        if (!canvas || !container || !imageLoaded) return;
        
        // Save current content
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = canvas.width;
        tempCanvas.height = canvas.height;
        const tempCtx = tempCanvas.getContext('2d');
        tempCtx?.drawImage(canvas, 0, 0);

        // Resize
        const rect = container.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;

        // Restore content (scaled)
        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.drawImage(tempCanvas, 0, 0, tempCanvas.width, tempCanvas.height, 0, 0, canvas.width, canvas.height);
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.strokeStyle = 'rgba(255, 0, 0, 0.5)';
        }
        // Note: Resizing clears the undo history to avoid state mismatch
        historyRef.current = [];
     };

     window.addEventListener('resize', handleResize);
     return () => window.removeEventListener('resize', handleResize);
  }, [imageLoaded]);

  useImperativeHandle(ref, () => ({
    getMaskDataUrl: () => {
        const canvas = canvasRef.current;
        if (!canvas) return '';

        const maskCanvas = document.createElement('canvas');
        maskCanvas.width = canvas.width;
        maskCanvas.height = canvas.height;
        const ctx = maskCanvas.getContext('2d');
        
        if (!ctx) return '';

        // Fill background with black (unselected)
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, maskCanvas.width, maskCanvas.height);

        // Draw the strokes
        ctx.globalCompositeOperation = 'source-over';
        ctx.drawImage(canvas, 0, 0); 
        
        // Convert non-black pixels to white
        const imageData = ctx.getImageData(0, 0, maskCanvas.width, maskCanvas.height);
        const data = imageData.data;
        for (let i = 0; i < data.length; i += 4) {
            if (data[i] > 0 || data[i+1] > 0 || data[i+2] > 0) {
                data[i] = 255;     // R
                data[i+1] = 255;   // G
                data[i+2] = 255;   // B
                data[i+3] = 255;   // Alpha
            }
        }
        ctx.putImageData(imageData, 0, 0);
        
        return maskCanvas.toDataURL('image/png');
    },
    clear: () => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (canvas && ctx) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            setHasDrawn(false);
            historyRef.current = [];
        }
    },
    undo: () => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (canvas && ctx && historyRef.current.length > 0) {
            const previousState = historyRef.current.pop();
            if (previousState) {
                ctx.putImageData(previousState, 0, 0);
                // If history is empty after undo, we are effectively back to start (empty)
                if (historyRef.current.length === 0) {
                    setHasDrawn(false);
                }
            }
        }
    },
    isEmpty: () => !hasDrawn
  }));

  const getCoordinates = (event: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    
    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;

    if ('touches' in event) {
        clientX = event.touches[0].clientX;
        clientY = event.touches[0].clientY;
    } else {
        clientX = (event as React.MouseEvent).clientX;
        clientY = (event as React.MouseEvent).clientY;
    }

    return {
        x: clientX - rect.left,
        y: clientY - rect.top
    };
  };

  const startDrawing = (event: React.MouseEvent | React.TouchEvent) => {
    // Save current state to history before new stroke
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (canvas && ctx) {
        if (historyRef.current.length > 20) {
            historyRef.current.shift(); // Limit history stack size
        }
        historyRef.current.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
    }

    setIsDrawing(true);
    const { x, y } = getCoordinates(event);
    
    if (ctx) {
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineWidth = brushSize;
    }
    event.preventDefault(); 
  };

  const draw = (event: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const { x, y } = getCoordinates(event);
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) {
        ctx.lineTo(x, y);
        ctx.stroke();
        if (!hasDrawn) setHasDrawn(true);
    }
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) {
        ctx.closePath();
    }
  };

  return (
    <div ref={containerRef} className="relative w-full h-full cursor-crosshair">
       <img 
         src={imageUrl} 
         alt="Target" 
         className="w-full h-full object-contain pointer-events-none select-none" 
       />
       <canvas
         ref={canvasRef}
         className="absolute inset-0 z-10 touch-none"
         onMouseDown={startDrawing}
         onMouseMove={draw}
         onMouseUp={stopDrawing}
         onMouseLeave={stopDrawing}
         onTouchStart={startDrawing}
         onTouchMove={draw}
         onTouchEnd={stopDrawing}
       />
    </div>
  );
});

DrawingCanvas.displayName = 'DrawingCanvas';
