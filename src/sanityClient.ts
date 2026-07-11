import { createClient } from '@sanity/client';
import imageUrlBuilder from '@sanity/image-url';

export const client = createClient({
  projectId: import.meta.env.VITE_SANITY_PROJECT_ID || '29vr82eu',
  dataset: import.meta.env.VITE_SANITY_DATASET || 'production',
  useCdn: import.meta.env.PROD, // CDN cho production, false cho dev để thấy thay đổi ngay
  apiVersion: '2025-06-03',
});

const builder = imageUrlBuilder(client);

export type SanityImageSource = Parameters<typeof builder.image>[0];

export function urlFor(source: SanityImageSource) {
  return builder.image(source);
}
