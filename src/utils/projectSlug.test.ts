import { describe, expect, it } from 'vitest';
import { projectPath, projectSlug, slugifyProjectName } from './projectSlug';

describe('project URLs', () => {
  it('turns Vietnamese names into readable paths', () => {
    expect(slugifyProjectName('Nhà Trên Đồi')).toBe('nha-tren-doi');
    expect(slugifyProjectName('  Đà Lạt House – Nhà của Bé  ')).toBe('da-lat-house-nha-cua-be');
  });

  it('keeps the CMS slug stable when the display name changes', () => {
    const project = { _id: 'one', name: 'Tên mới', slug: { current: 'nha-ban-dau' } };
    expect(projectSlug(project)).toBe('nha-ban-dau');
    expect(projectPath(project)).toBe('/projects/nha-ban-dau');
  });
});
