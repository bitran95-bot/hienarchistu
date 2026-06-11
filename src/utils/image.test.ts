import { describe, it, expect, vi } from 'vitest';
import { getResponsiveImageProps } from './image';

// Mock sanityClient since urlFor uses it
vi.mock('../sanityClient', () => {
  return {
    urlFor: vi.fn((source) => {
      // Return a dummy builder chain
      return {
        auto: vi.fn().mockReturnThis(),
        quality: vi.fn().mockReturnThis(),
        width: vi.fn((w) => ({
          height: vi.fn((h) => ({
            url: () => `https://cdn.sanity.io/images/mock/${w}x${h}.jpg`
          })),
          url: () => `https://cdn.sanity.io/images/mock/${w}.jpg`
        })),
      };
    })
  };
});

describe('getResponsiveImageProps', () => {
  it('returns null if source is undefined', () => {
    expect(getResponsiveImageProps({ source: undefined })).toBeNull();
  });

  it('generates correct src and srcSet without aspectRatio', () => {
    const mockSource = { _type: 'image', asset: { _ref: 'image-123' } };
    const props = getResponsiveImageProps({ source: mockSource, baseWidth: 500 });
    
    expect(props).not.toBeNull();
    if (props) {
      expect(props.src).toBe('https://cdn.sanity.io/images/mock/500.jpg');
      expect(props.srcSet).toContain('320w');
      expect(props.srcSet).toContain('https://cdn.sanity.io/images/mock/320.jpg');
    }
  });

  it('generates correct src and srcSet with aspectRatio', () => {
    const mockSource = { _type: 'image', asset: { _ref: 'image-123' } };
    const props = getResponsiveImageProps({ source: mockSource, baseWidth: 500, aspectRatio: 2 });
    
    expect(props).not.toBeNull();
    if (props) {
      // 500 / 2 = 250
      expect(props.src).toBe('https://cdn.sanity.io/images/mock/500x250.jpg');
      // 320 / 2 = 160
      expect(props.srcSet).toContain('https://cdn.sanity.io/images/mock/320x160.jpg 320w');
    }
  });

  it('returns style object if lqip is present', () => {
    const mockSource = { _type: 'image', asset: { _ref: 'image-123' }, lqip: 'data:image/png;base64,mock' };
    const props = getResponsiveImageProps({ source: mockSource });
    
    expect(props).not.toBeNull();
    if (props) {
      expect(props.style).toBeDefined();
      expect(props.style?.backgroundImage).toBe('url(data:image/png;base64,mock)');
    }
  });
});
