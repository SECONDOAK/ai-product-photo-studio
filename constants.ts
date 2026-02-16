import { StylePreset } from './types';

export const STYLE_PRESETS: StylePreset[] = [
  {
    id: 'minimalist',
    name: 'Minimalist',
    prompt: 'A professional product photo with a minimalist aesthetic, clean white background, soft, diffused lighting, and a focus on the product\'s texture and form.',
  },
  {
    id: 'vibrant',
    name: 'Vibrant',
    prompt: 'A vibrant and bold product shot with saturated colors, hard light, and a dynamic composition. The background should be a solid, contrasting color.',
  },
  {
    id: 'lifestyle',
    name: 'Lifestyle',
    prompt: 'An in-context lifestyle photo showing the product in a natural, realistic setting. The lighting should be bright and airy, suggesting everyday use.',
  },
  {
    id: 'dramatic',
    name: 'Dramatic',
    prompt: 'A dramatic, moody product photo using low-key lighting (chiaroscuro) to create strong contrasts and shadows. The background should be dark and indistinct.',
  },
  {
    id: 'luxe',
    name: 'Luxury',
    prompt: 'A luxurious and elegant product photo featuring rich textures like silk, marble, or dark wood. The lighting should be sophisticated, perhaps with a subtle warm glow.',
  },
  {
    id: 'studio',
    name: 'Studio',
    prompt: 'Object against a white background and professional lighting.',
  }
];
