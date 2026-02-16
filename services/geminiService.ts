
const PROXY_URL = process.env.GEMINI_PROXY_URL || 'https://gemini-proxy.ekdahl-simon.workers.dev';

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

interface GeminiPart {
  text?: string;
  inlineData?: { data: string; mimeType: string };
}

interface GeminiResponse {
  candidates?: Array<{
    content?: { parts?: GeminiPart[] };
    finishReason?: string;
  }>;
  error?: { message: string; code: number };
}

const generateWithRetry = async (
  model: string,
  contents: unknown,
  config?: unknown,
  signal?: AbortSignal
): Promise<GeminiResponse> => {
  let retries = 0;
  const maxRetries = 5;
  const initialDelay = 3000;

  while (true) {
    if (signal?.aborted) {
      throw new DOMException('Aborted', 'AbortError');
    }

    const response = await fetch(PROXY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model, contents, config }),
      signal,
    });

    const data: GeminiResponse = await response.json();

    if (response.ok) return data;

    if (retries >= maxRetries) {
      throw new Error(data.error?.message || `API error: ${response.status}`);
    }

    const isOverloaded = response.status === 503 || response.status === 429;

    if (isOverloaded) {
      retries++;
      const delay = initialDelay * Math.pow(2, retries - 1);
      console.warn(`Model overloaded (${response.status}). Retrying in ${delay}ms... (${retries}/${maxRetries})`);
      await wait(delay);
      continue;
    }

    throw new Error(data.error?.message || `API error: ${response.status}`);
  }
};

// Utility to convert base64 data URL to a Part object
const fileToGenerativePart = (base64: string): GeminiPart => {
  const mimeType = base64.substring(5, base64.indexOf(';'));
  const data = base64.substring(base64.indexOf(',') + 1);
  return {
    inlineData: {
      data,
      mimeType,
    },
  };
};

export const generateProductPhoto = async (
  productImagesBase64: string[],
  referenceImageBase64: string | null,
  textPrompt: string,
  aspectRatio: string,
  resolution: string,
  signal?: AbortSignal
): Promise<string> => {

    const parts: GeminiPart[] = [];

    // Add product images
    productImagesBase64.forEach(imgBase64 => {
      parts.push(fileToGenerativePart(imgBase64));
    });

    // Add reference image if it exists
    if (referenceImageBase64) {
        parts.push(fileToGenerativePart(referenceImageBase64));
    }

    // Add the text prompt
    parts.push({ text: textPrompt });

    const isHighRes = resolution === '2K' || resolution === '4K';
    const model = isHighRes ? 'gemini-3-pro-image-preview' : 'gemini-2.5-flash-image';

    const config: any = {
        imageConfig: {
            aspectRatio: aspectRatio,
        }
    };

    if (isHighRes) {
        config.imageConfig.imageSize = resolution;
    }

    try {
        const response = await generateWithRetry(
          model,
          { parts },
          config,
          signal
        );

        const candidate = response.candidates?.[0];
        if (candidate?.content?.parts) {
            for (const part of candidate.content.parts) {
                if (part.inlineData) {
                    const base64ImageBytes: string = part.inlineData.data;
                    const mimeType = part.inlineData.mimeType;
                    return `data:${mimeType};base64,${base64ImageBytes}`;
                }
            }
        }

        let errorMessage = 'No image was generated.';
        if (candidate?.finishReason) {
             errorMessage += ` Finish reason: ${candidate.finishReason}`;
        } else if (!response.candidates || response.candidates.length === 0) {
             errorMessage += ' No candidates returned.';
        }

        console.error("Gemini response missing image data:", response);
        throw new Error(errorMessage);

    } catch (error: any) {
        if (error.name === 'AbortError') {
            throw error;
        }

        console.error("Error generating image with Gemini:", error);

        const errorString = error?.message || String(error);

        if (errorString.includes('503') || errorString.includes('overloaded') || errorString.includes('UNAVAILABLE')) {
          throw new Error('The AI model is currently overloaded due to high demand. Please try again in a few minutes.');
        }

        if (errorString.includes('No image was generated') || errorString.includes('Finish reason')) {
          throw error;
        }

        throw new Error("Failed to generate product photo. The service might be temporarily unavailable.");
    }
};

export const retouchImage = async (
    imageBase64: string,
    retouchPrompt: string,
    aspectRatio: string,
    resolution: string,
    maskImageBase64?: string,
    referenceImageBase64?: string,
    signal?: AbortSignal
  ): Promise<string> => {

    let finalPrompt = `Apply this edit to the FIRST image provided: ${retouchPrompt}. Do not change the product itself, only apply the requested stylistic adjustment. Maintain the original aspect ratio.`;

    const parts: GeminiPart[] = [
      fileToGenerativePart(imageBase64),
    ];

    if (maskImageBase64) {
        parts.push(fileToGenerativePart(maskImageBase64));
        finalPrompt += " The second image provided is a black and white mask. The white areas in the mask indicate exactly where you should apply the edit. Do not edit the black areas.";
    }

    if (referenceImageBase64) {
        parts.push(fileToGenerativePart(referenceImageBase64));
        finalPrompt += " The LAST image provided is a visual reference. You MUST use the content or style of this reference image to guide the edit requested.";
    }

    parts.push({ text: finalPrompt });

    const isHighRes = resolution === '2K' || resolution === '4K';
    const model = isHighRes ? 'gemini-3-pro-image-preview' : 'gemini-2.5-flash-image';

    const config: any = {
        imageConfig: {
            aspectRatio: aspectRatio,
        }
    };

    if (isHighRes) {
        config.imageConfig.imageSize = resolution;
    }

    try {
      const response = await generateWithRetry(
        model,
        { parts },
        config,
        signal
      );

      const candidate = response.candidates?.[0];
      if (candidate?.content?.parts) {
          for (const part of candidate.content.parts) {
              if (part.inlineData) {
                  const base64ImageBytes: string = part.inlineData.data;
                  const mimeType = part.inlineData.mimeType;
                  return `data:${mimeType};base64,${base64ImageBytes}`;
              }
          }
      }

      let errorMessage = 'No image was generated during retouch.';
      if (candidate?.finishReason) {
           errorMessage += ` Finish reason: ${candidate.finishReason}`;
      } else if (!response.candidates || response.candidates.length === 0) {
           errorMessage += ' No candidates returned.';
      }

      console.error("Gemini retouch response missing image data:", response);
      throw new Error(errorMessage);

    } catch (error: any) {
      if (error.name === 'AbortError') {
          throw error;
      }

      console.error("Error retouching image with Gemini:", error);

      const errorString = error?.message || String(error);

      if (errorString.includes('503') || errorString.includes('overloaded') || errorString.includes('UNAVAILABLE')) {
        throw new Error('The AI model is busy. Please try your retouch again in a moment.');
      }

      if (errorString.includes('No image was generated') || errorString.includes('Finish reason')) {
        throw error;
      }

      throw new Error("Failed to retouch photo. Please try again later.");
    }
  };
