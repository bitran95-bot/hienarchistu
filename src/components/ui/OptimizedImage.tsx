import { useState, memo } from 'react';
import { Skeleton } from './Skeleton';

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  wrapperClassName?: string;
}

/**
 * Image component with skeleton loading placeholder and smooth fade-in transition.
 */
export const OptimizedImage = memo(function OptimizedImage({
  src,
  srcSet,
  sizes,
  alt = '',
  className = '',
  wrapperClassName = '',
  loading = 'lazy',
  style,
  ...rest
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  return (
    <div className={`relative overflow-hidden ${wrapperClassName}`}>
      {!isLoaded && !hasError && (
        <Skeleton className="absolute inset-0 w-full h-full rounded-none" />
      )}
      <img
        src={src}
        srcSet={srcSet}
        sizes={sizes}
        alt={alt}
        loading={loading}
        onLoad={() => setIsLoaded(true)}
        onError={() => {
          setIsLoaded(true);
          setHasError(true);
        }}
        className={`transition-opacity duration-500 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        } ${className}`}
        style={style}
        {...rest}
      />
    </div>
  );
});
