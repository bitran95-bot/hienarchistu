import type { Project } from '../types';

export function slugifyProjectName(name: string): string {
  return name
    .replace(/[đĐ]/g, char => char === 'đ' ? 'd' : 'D')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'project';
}

export function projectSlug(project: Project): string {
  return slugifyProjectName(project.slug?.current?.trim() || project.name);
}

export function projectPath(project: Project): string {
  return `/projects/${encodeURIComponent(projectSlug(project))}`;
}
