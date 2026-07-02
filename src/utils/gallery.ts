import { urlFor } from '../sanityClient';
import type { Project, SanityImage } from '../types';

/**
 * Hash function for pseudo-random grouping
 */
export const hashString = (str: string) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = Math.imul(31, hash) + str.charCodeAt(i) | 0;
  return Math.abs(hash);
};

export interface GalleryGroup {
  images: SanityImage[];
  layout: 'col' | 'row' | 'mixed' | 'full';
}

/**
 * Groups gallery images into pages based on configuration or pseudo-random distribution
 */
export const groupGalleryImages = (project: Partial<Project>): GalleryGroup[] => {
  const groups: GalleryGroup[] = [];

  if (project.magazinePages && project.magazinePages.length > 0) {
    project.magazinePages.forEach((page) => {
      groups.push({
        images: (page.images || []) as SanityImage[],
        layout: (page.layout as GalleryGroup['layout']) || 'col'
      });
    });
  } else {
    const gallery = (project.gallery || []) as SanityImage[];
    if (gallery && gallery.length > 0) {
       let i = 0;
       const seed = hashString(project._id || project.name || "default");
       while (i < gallery.length) {
          const randomVal = (seed + i * 17) % 100;
          let chunkSize = 1;
          if (randomVal > 70 && i + 2 < gallery.length) chunkSize = 3;
          else if (randomVal > 30 && i + 1 < gallery.length) chunkSize = 2;
          
          const images = gallery.slice(i, i + chunkSize);
          const configVal = (seed + i * 23) % 3;
          const layout: GalleryGroup['layout'] = configVal === 0 ? 'col' : (configVal === 1 ? 'row' : 'mixed');
          
          groups.push({ images, layout });
          i += chunkSize;
       }
    }
  }

  return groups;
};

/**
 * Helper to safely get the full image URL from Sanity
 */
export const getGalleryImageUrl = (img: SanityImage): string => {
  try {
    return urlFor(img).quality(85).auto('format').url();
  } catch (error) {
    console.error("Error generating image URL:", error);
    return "";
  }
};
