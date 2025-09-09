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
