import { createClient } from '@sanity/client';
import imageUrlBuilder from '@sanity/image-url';
import type { SanityImage } from './types';

export const client = createClient({
  projectId: import.meta.env.VITE_SANITY_PROJECT_ID || '29vr82eu',
  dataset: import.meta.env.VITE_SANITY_DATASET || 'production',
  useCdn: import.meta.env.PROD, // CDN cho production, false cho dev để thấy thay đổi ngay
  apiVersion: '2025-06-03',
});

const builder = imageUrlBuilder(client);

export function urlFor(source: SanityImage) {
  return builder.image(source);
}
