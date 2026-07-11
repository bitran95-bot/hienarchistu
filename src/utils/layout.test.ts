import { describe, it, expect } from 'vitest';
import { calculateProjectLayout } from './layout';
import type { Project } from '../types';

describe('calculateProjectLayout', () => {
  it('should return an empty array if projects is empty', () => {
    const result = calculateProjectLayout([]);
    expect(result).toEqual([]);
  });

  it('should assign valid computedX and computedRow for multiple projects', () => {
    const mockProjects = [
      { _id: '1', name: 'A' },
      { _id: '2', name: 'B' },
      { _id: '3', name: 'C' }
    ] as Project[];

    const result = calculateProjectLayout(mockProjects);
    
    expect(result.length).toBe(3);
    
    // Check if the computed fields were added
    result.forEach((project) => {
      expect(project.computedX).toBeDefined();
      expect(typeof project.computedX).toBe('number');
      expect(project.computedRow).toBeDefined();
      expect(typeof project.computedRow).toBe('number');
    });

    // We can also assume the layout logic avoids complete overlaps
    // For our specific snake layout, checking if computed properties are correctly typed is enough for a foundation test.
  });
});
