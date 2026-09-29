import { describe, expect, it } from 'vitest';
import { projectPath, projectSlug, slugifyProjectName } from './projectSlug';

describe('project URLs', () => {
  it('preserves an existing published URL even before its CMS slug is filled', () => {
    expect(projectSlug({ _id: '615666b6-2655-49b7-a8bc-af12998e4405', name: 'A renamed house' })).toBe('nha-tren-doi');
  });
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
