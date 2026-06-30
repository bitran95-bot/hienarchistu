import { memo } from 'react';

interface SkeletonProps {
  className?: string;
  variant?: 'rect' | 'circle' | 'text';
}

/**
 * Reusable animated shimmer skeleton for loading states across mobile and desktop.
 */
export const Skeleton = memo(function Skeleton({
  className = '',
  variant = 'rect',
}: SkeletonProps) {
  const shapeClass =
    variant === 'circle'
      ? 'rounded-full'
      : variant === 'text'
      ? 'rounded-md h-4'
      : 'rounded-xl';

  return (
    <div
      className={`bg-stone-200/80 animate-pulse ${shapeClass} ${className}`}
      aria-hidden="true"
    />
  );
});

export const ProjectCardSkeleton = memo(function ProjectCardSkeleton() {
  return (
    <div className="flex flex-col space-y-3">
      <Skeleton className="w-full aspect-[4/3] rounded-2xl" />
      <Skeleton variant="text" className="w-3/4 h-6" />
      <Skeleton variant="text" className="w-1/2 h-4" />
    </div>
  );
});
