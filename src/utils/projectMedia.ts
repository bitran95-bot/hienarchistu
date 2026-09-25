import type { Project } from '../types';
import { projectPath } from './projectSlug';

export const imageMediaKey = (index: number) => `image-${index + 1}`;
export const pdfMediaKey = (page: number) => `pdf-${page}`;

export function projectMediaKeys(project: Project, imageCount: number, pdfPageCount: number): string[] {
  return [
    ...(project.modelFileUrl ? ['model'] : []),
    ...Array.from({ length: imageCount }, (_, index) => imageMediaKey(index)),
    ...(project.pdfFileUrl ? Array.from({ length: pdfPageCount }, (_, index) => pdfMediaKey(index + 1)) : []),
  ];
}

export function projectMediaPath(project: Pick<Project, 'name' | 'slug'>, mediaKey: string): string {
  return `${projectPath(project)}?media=${encodeURIComponent(mediaKey)}`;
}
