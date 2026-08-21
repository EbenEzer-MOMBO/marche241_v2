'use client';

import { Skeleton } from '@/components/ui/Skeleton';

interface BoutiqueCardSkeletonProps {
  className?: string;
}

export const BoutiqueCardSkeleton: React.FC<BoutiqueCardSkeletonProps> = ({
  className = '',
}) => {
  return (
    <div
      className={`flex flex-col border border-gray-200 rounded-[14px] overflow-hidden bg-white ${className}`}
      aria-hidden
    >
      <Skeleton className="h-[150px] w-full rounded-none" />
      <div className="p-3.5 flex flex-col gap-2 flex-1">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-5/6" />
        <div className="flex items-center gap-2.5 pt-1 mt-auto">
          <Skeleton className="h-6 w-20 rounded-[7px]" />
          <Skeleton className="h-3 w-16" />
        </div>
        <Skeleton className="mt-1 h-[42px] w-full rounded-[10px]" />
      </div>
    </div>
  );
};

interface AfficheBoutiquesSkeletonProps {
  count?: number;
  showFilters?: boolean;
}

export const AfficheBoutiquesSkeleton: React.FC<AfficheBoutiquesSkeletonProps> = ({
  count = 8,
  showFilters = true,
}) => {
  return (
    <div aria-busy="true" aria-label="Chargement des boutiques">
      {showFilters && (
        <div className="border-b border-gray-200 bg-white px-4 lg:px-10 py-3.5">
          <div className="max-w-[1360px] mx-auto flex gap-2 overflow-hidden">
            <Skeleton className="h-9 w-24 rounded-full shrink-0" />
            <Skeleton className="h-9 w-28 rounded-full shrink-0" />
            <Skeleton className="h-9 w-24 rounded-full shrink-0" />
            <Skeleton className="h-9 w-32 rounded-full shrink-0" />
            <Skeleton className="h-9 w-20 rounded-full shrink-0 hidden sm:block" />
          </div>
        </div>
      )}

      <div className="px-4 lg:px-10 py-7 lg:py-9">
        <div className="max-w-[1360px] mx-auto grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5">
          {Array.from({ length: count }, (_, index) => (
            <BoutiqueCardSkeleton key={index} />
          ))}
        </div>
      </div>
    </div>
  );
};
