import { useMemo } from 'react';
import type { Project, SanityImage } from '../types';

/**
 * Extracts all displayable images from a project, combining the hero image,
 * magazine pages, and gallery into a single flat array.
 */
export function useProjectImages(project: Project | null): SanityImage[] {
  return useMemo(() => {
    if (!project) return [];

    const images: SanityImage[] = [];

    // Hero image first
    if (project.image?.asset) {
      images.push(project.image);
    }

    // Magazine pages take priority over gallery
    const hasMagazinePages = project.magazinePages && project.magazinePages.length > 0;
    const hasGallery = project.gallery && project.gallery.length > 0;

    if (hasMagazinePages) {
      project.magazinePages?.forEach(page => {
        if (page.images) {
          images.push(...page.images);
        }
      });
    } else if (hasGallery) {
      images.push(...(project.gallery || []));
    }

    return images;
  }, [project]);
}
