'use client';

import { useCallback, useMemo } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
  parseProductSearchFromUrl,
  writeProductSearchToParams,
  type ProductSearchState,
} from '@/lib/product-search';

export const useProductListingUrl = () => {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const filters = useMemo(
    () => parseProductSearchFromUrl(new URLSearchParams(searchParams.toString())),
    [searchParams]
  );

  const replaceFilters = useCallback(
    (patch: Partial<ProductSearchState>) => {
      const next: ProductSearchState = { ...filters, ...patch };
      const qs = writeProductSearchToParams(next).toString();
      const currentQs = writeProductSearchToParams(filters).toString();
      if (qs === currentQs) return;
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [filters, pathname, router]
  );

  return { filters, replaceFilters };
};
