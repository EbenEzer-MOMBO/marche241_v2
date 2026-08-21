/**
 * Composants de squelette pour les états de chargement
 */

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = '' }: SkeletonProps) {
  return (
    <div 
      className={`animate-pulse bg-gray-200 rounded ${className}`}
      aria-label="Chargement..."
    />
  );
}

export function SkeletonText({ lines = 1, className = '' }: { lines?: number; className?: string }) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }, (_, i) => (
        <Skeleton 
          key={i} 
          className={`h-4 ${i === lines - 1 ? 'w-3/4' : 'w-full'}`} 
        />
      ))}
    </div>
  );
}

export function SkeletonCircle({ size = 'w-10 h-10', className = '' }: { size?: string; className?: string }) {
  return (
    <Skeleton className={`${size} rounded-full ${className}`} />
  );
}

export function SkeletonButton({ className = '' }: SkeletonProps) {
  return (
    <Skeleton className={`h-10 w-32 rounded-lg ${className}`} />
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="flex flex-col gap-2.5">
      <Skeleton className="aspect-square w-full rounded-[10px]" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/3" />
      <Skeleton className="h-[38px] w-full rounded-[9px]" />
    </div>
  );
}

export function CategoryChipsSkeleton({ count = 5 }: { count?: number }) {
  const widths = ['w-14', 'w-20', 'w-16', 'w-24', 'w-[4.5rem]'];
  return (
    <div className="flex gap-2 overflow-hidden" aria-hidden>
      {Array.from({ length: count }, (_, i) => (
        <Skeleton
          key={i}
          className={`h-[30px] shrink-0 rounded-full ${widths[i % widths.length]}`}
        />
      ))}
    </div>
  );
}

export function ProductCardGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 lg:grid-cols-4 lg:gap-5">
      {Array.from({ length: count }, (_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}
