import { createClient } from '@sanity/client';
import imageUrlBuilder from '@sanity/image-url';

export const client = createClient({
  projectId: '29vr82eu',
  dataset: 'production',
  useCdn: false, // Set to false to see updates immediately
  apiVersion: '2023-05-03', 
});

const builder = imageUrlBuilder(client);

export function urlFor(source: any) {
  return builder.image(source);
}
