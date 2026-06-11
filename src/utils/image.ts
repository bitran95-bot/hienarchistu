import { urlFor } from '../sanityClient';
// Removed broken import

interface ResponsiveImageProps {
  source: any | undefined | null;
  /** Aspect ratio string like '3/2' or just a number like 1.5. If not provided, height is automatic based on original. */
  aspectRatio?: number;
  /** Comma separated sizes attribute for the img tag. e.g., "(max-width: 768px) 100vw, 50vw" */
  sizes?: string;
  /** Base width for the 'src' fallback */
  baseWidth?: number;
  className?: string;
  alt?: string;
  loading?: 'lazy' | 'eager';
}

/**
 * Returns an object with src and srcSet for a given Sanity image source,
 * generating multiple resolutions for responsive design.
 */
export function getResponsiveImageProps({
  source,
  aspectRatio,
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  baseWidth = 800,
  className = '',
  alt = '',
  loading = 'lazy'
}: ResponsiveImageProps) {
  if (!source) return null;

  try {
    const builder = urlFor(source).auto('format').quality(80);

    // Common screen widths to generate srcSet for
    const widths = [320, 640, 768, 1024, 1280, 1536];

    const srcSet = widths
      .map((w) => {
        let u = builder.width(w);
        if (aspectRatio) {
          u = u.height(Math.round(w / aspectRatio));
        }
        return `${u.url()} ${w}w`;
      })
      .join(', ');

    let srcBuilder = builder.width(baseWidth);
    if (aspectRatio) {
      srcBuilder = srcBuilder.height(Math.round(baseWidth / aspectRatio));
    }

    return {
      src: srcBuilder.url(),
      srcSet,
      sizes,
      className,
      alt,
      loading,
      style: source.lqip ? { backgroundImage: `url(${source.lqip})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined
    };
  } catch (error) {
    console.error('Failed to generate responsive image:', error);
    return null;
  }
}
