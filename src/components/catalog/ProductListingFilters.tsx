'use client';

import { Search, SlidersHorizontal, X } from 'lucide-react';
import {
  SEARCH_DEBOUNCE_MS,
  SORT_OPTIONS,
  STOCK_OPTIONS,
  TYPE_OPTIONS,
  labelForFilterStock,
  labelForFilterType,
  type FilterStock,
  type FilterType,
  type ProductSearchState,
  type SortKey,
} from '@/lib/product-search';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { useEffect, useMemo, useState } from 'react';

export type ListingCommuneOption = {
  id: number;
  label: string;
};

export type ListingCategorieOption = {
  id: number;
  slug: string;
  nom: string;
  count?: number;
};

type FiltreActif = {
  id: string;
  label: string;
  onRemove: () => void;
};

interface ProductListingFiltersProps {
  filters: ProductSearchState;
  onPatch: (patch: Partial<ProductSearchState>) => void;
  onClearAll: () => void;
  categories: ListingCategorieOption[];
  communes: ListingCommuneOption[];
  filtresOuverts: boolean;
  onOpenFiltres: () => void;
  onCloseFiltres: () => void;
  resultCount: number;
  variant?: 'shop' | 'market';
}

const filtreChipStyle = {
  borderColor: 'var(--color-shop-primary, #508e27)',
  backgroundColor: 'var(--shop-primary-tint, #eef6e8)',
  color: 'var(--shop-primary-dark, #3d6c1d)',
};

export const ProductListingFilters = ({
  filters,
  onPatch,
  onClearAll,
  categories,
  communes,
  filtresOuverts,
  onOpenFiltres,
  onCloseFiltres,
  resultCount,
  variant = 'shop',
}: ProductListingFiltersProps) => {
  const [searchDraft, setSearchDraft] = useState(filters.q);
  const [prixMinDraft, setPrixMinDraft] = useState(
    filters.prixMin != null ? String(filters.prixMin) : ''
  );
  const [prixMaxDraft, setPrixMaxDraft] = useState(
    filters.prixMax != null ? String(filters.prixMax) : ''
  );

  useEffect(() => {
    setSearchDraft(filters.q);
  }, [filters.q]);

  useEffect(() => {
    setPrixMinDraft(filters.prixMin != null ? String(filters.prixMin) : '');
  }, [filters.prixMin]);

  useEffect(() => {
    setPrixMaxDraft(filters.prixMax != null ? String(filters.prixMax) : '');
  }, [filters.prixMax]);

  const debouncedSearch = useDebouncedValue(searchDraft, SEARCH_DEBOUNCE_MS);
  const debouncedPrixMin = useDebouncedValue(prixMinDraft, SEARCH_DEBOUNCE_MS);
  const debouncedPrixMax = useDebouncedValue(prixMaxDraft, SEARCH_DEBOUNCE_MS);

  useEffect(() => {
    if (searchDraft !== debouncedSearch) return;
    const next = debouncedSearch.trim();
    if (next !== filters.q) {
      onPatch({ q: next, page: 1 });
    }
  }, [debouncedSearch, searchDraft, filters.q, onPatch]);

  useEffect(() => {
    if (prixMinDraft !== debouncedPrixMin) return;
    const parsed = debouncedPrixMin.trim() === '' ? null : Number(debouncedPrixMin);
    const next = parsed != null && Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
    if (next !== filters.prixMin) {
      onPatch({ prixMin: next, page: 1 });
    }
  }, [debouncedPrixMin, prixMinDraft, filters.prixMin, onPatch]);

  useEffect(() => {
    if (prixMaxDraft !== debouncedPrixMax) return;
    const parsed = debouncedPrixMax.trim() === '' ? null : Number(debouncedPrixMax);
    const next = parsed != null && Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
    if (next !== filters.prixMax) {
      onPatch({ prixMax: next, page: 1 });
    }
  }, [debouncedPrixMax, prixMaxDraft, filters.prixMax, onPatch]);

  const handleCategorieSelect = (slug: string | null, id: number | null) => {
    onPatch({ categorieSlug: slug, categorieId: id, page: 1 });
  };

  const handleSortChange = (value: SortKey) => {
    onPatch({ sort: value, page: 1 });
  };

  const handleFilterStockChange = (value: FilterStock) => {
    onPatch({ stock: value, page: 1 });
  };

  const handleFilterTypeChange = (value: FilterType) => {
    onPatch({ type: value, page: 1 });
  };

  const handleCommuneChange = (value: string) => {
    const id = value ? Number.parseInt(value, 10) : NaN;
    onPatch({
      communeId: Number.isFinite(id) && id > 0 ? id : null,
      page: 1,
    });
  };

  const handleClearSearch = () => {
    setSearchDraft('');
    onPatch({ q: '', page: 1 });
  };

  const activeCategoryId = filters.categorieSlug || (filters.categorieId ? String(filters.categorieId) : 'all');

  const activeFilterChips = useMemo(() => {
    const chips: FiltreActif[] = [];

    if (filters.categorieSlug || filters.categorieId) {
      const categorie = categories.find(
        (c) =>
          c.slug === filters.categorieSlug ||
          (filters.categorieId != null && c.id === filters.categorieId)
      );
      chips.push({
        id: 'categorie',
        label: categorie?.nom ?? filters.categorieSlug ?? `Catégorie ${filters.categorieId}`,
        onRemove: () => handleCategorieSelect(null, null),
      });
    }

    if (filters.q.trim()) {
      chips.push({
        id: 'recherche',
        label: `« ${filters.q.trim()} »`,
        onRemove: handleClearSearch,
      });
    }

    if (filters.prixMin != null || filters.prixMax != null) {
      const min = filters.prixMin != null ? `${filters.prixMin}` : '…';
      const max = filters.prixMax != null ? `${filters.prixMax}` : '…';
      chips.push({
        id: 'prix',
        label: `${min} – ${max} FCFA`,
        onRemove: () => {
          setPrixMinDraft('');
          setPrixMaxDraft('');
          onPatch({ prixMin: null, prixMax: null, page: 1 });
        },
      });
    }

    if (filters.communeId != null) {
      const commune = communes.find((c) => c.id === filters.communeId);
      chips.push({
        id: 'commune',
        label: commune?.label ?? `Localisation #${filters.communeId}`,
        onRemove: () => onPatch({ communeId: null, page: 1 }),
      });
    }

    if (filters.stock !== 'all') {
      chips.push({
        id: 'stock',
        label: labelForFilterStock(filters.stock),
        onRemove: () => handleFilterStockChange('all'),
      });
    }

    if (filters.type !== 'all') {
      chips.push({
        id: 'type',
        label: labelForFilterType(filters.type),
        onRemove: () => handleFilterTypeChange('all'),
      });
    }

    return chips;
  }, [categories, communes, filters, onPatch]);

  const mobileFilterCount =
    (filters.stock !== 'all' ? 1 : 0) +
    (filters.type !== 'all' ? 1 : 0) +
    (filters.sort !== 'recent' ? 1 : 0) +
    (filters.prixMin != null || filters.prixMax != null ? 1 : 0) +
    (filters.communeId != null ? 1 : 0);

  const inputClass =
    variant === 'market'
      ? 'h-10 w-full rounded-[9px] border border-gray-200 bg-white pl-9 pr-8 text-[13.5px] text-gray-900 placeholder:text-gray-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#508e27]/30'
      : 'h-10 w-full rounded-[9px] border border-[#e0ded9] bg-white pl-9 pr-8 text-[13.5px] text-[#17181a] placeholder:text-[#9a9892] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#17181a]/20';

  const selectClass =
    variant === 'market'
      ? 'rounded-[9px] border border-gray-200 bg-white px-2.5 py-1.5 text-[13px] text-gray-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#508e27]/30'
      : 'rounded-[9px] border border-[#e0ded9] bg-white px-2.5 py-1.5 text-[13px] text-[#17181a] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#17181a]/20';

  const priceInputClass =
    variant === 'market'
      ? 'h-10 w-28 rounded-[9px] border border-gray-200 bg-white px-2.5 text-[13px] text-gray-900 placeholder:text-gray-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#508e27]/30'
      : 'h-10 w-28 rounded-[9px] border border-[#e0ded9] bg-white px-2.5 text-[13px] text-[#17181a] placeholder:text-[#9a9892] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#17181a]/20';

  const renderSearchInput = (id: string) => (
    <div className="relative w-full max-w-[300px]">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9a9892]" />
      <input
        id={id}
        type="search"
        value={searchDraft}
        onChange={(e) => setSearchDraft(e.target.value)}
        placeholder="Rechercher un produit..."
        aria-label="Rechercher un produit"
        className={inputClass}
      />
      {searchDraft && (
        <button
          type="button"
          onClick={handleClearSearch}
          aria-label="Effacer la recherche"
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#9a9892] hover:text-[#17181a]"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );

  const renderCategoryChips = () => (
    <div
      className="flex flex-1 gap-2 overflow-x-auto scrollbar-none"
      role="tablist"
      aria-label="Catégories"
    >
      <button
        type="button"
        role="tab"
        aria-selected={activeCategoryId === 'all'}
        tabIndex={0}
        onClick={() => handleCategorieSelect(null, null)}
        className={`shrink-0 whitespace-nowrap rounded-full px-3.5 py-1.5 text-[12.5px] font-medium ${
          activeCategoryId === 'all'
            ? 'bg-[#17181a] text-white'
            : 'border border-[#e6e4df] text-[#3c4045] hover:bg-[#f6f5f3]'
        }`}
      >
        Tout
      </button>
      {categories.map((categorie) => {
        const isActive =
          categorie.slug === filters.categorieSlug ||
          (filters.categorieId != null && categorie.id === filters.categorieId);
        return (
          <button
            key={categorie.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            tabIndex={0}
            onClick={() => handleCategorieSelect(categorie.slug, categorie.id)}
            className={`shrink-0 whitespace-nowrap rounded-full px-3.5 py-1.5 text-[12.5px] font-medium ${
              isActive
                ? 'bg-[#17181a] text-white'
                : 'border border-[#e6e4df] text-[#3c4045] hover:bg-[#f6f5f3]'
            }`}
          >
            {categorie.nom}
            {typeof categorie.count === 'number' && (
              <span className={`ml-1.5 ${isActive ? 'opacity-70' : 'text-[#9a9892]'}`}>
                {categorie.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );

  const renderAdvancedFields = (compact = false) => (
    <div className={`flex flex-wrap items-end gap-3 ${compact ? '' : ''}`}>
      <label className="flex flex-col gap-1 text-[12px] text-[#5f6369]">
        <span>Prix min (FCFA)</span>
        <input
          type="number"
          min={0}
          inputMode="numeric"
          value={prixMinDraft}
          onChange={(e) => setPrixMinDraft(e.target.value)}
          placeholder="Min"
          aria-label="Prix minimum"
          className={priceInputClass}
        />
      </label>
      <label className="flex flex-col gap-1 text-[12px] text-[#5f6369]">
        <span>Prix max (FCFA)</span>
        <input
          type="number"
          min={0}
          inputMode="numeric"
          value={prixMaxDraft}
          onChange={(e) => setPrixMaxDraft(e.target.value)}
          placeholder="Max"
          aria-label="Prix maximum"
          className={priceInputClass}
        />
      </label>
      <label className="flex flex-col gap-1 text-[12px] text-[#5f6369]">
        <span>Localisation</span>
        <select
          value={filters.communeId != null ? String(filters.communeId) : ''}
          onChange={(e) => handleCommuneChange(e.target.value)}
          aria-label="Filtrer par commune"
          className={selectClass}
        >
          <option value="">Toutes les communes</option>
          {filters.communeId != null &&
            !communes.some((c) => c.id === filters.communeId) && (
              <option value={String(filters.communeId)}>
                Commune #{filters.communeId}
              </option>
            )}
          {communes.map((commune) => (
            <option key={commune.id} value={String(commune.id)}>
              {commune.label}
            </option>
          ))}
        </select>
      </label>
    </div>
  );

  return (
    <>
      <div className="hidden flex-col gap-3 border-b border-[#ececea] pb-4 sm:flex">
        <div className="flex items-center gap-4">
          {renderSearchInput('search-desktop')}
          {renderCategoryChips()}
          <label className="flex shrink-0 items-center gap-1.5 text-[13px] text-[#5f6369]">
            <span>Trier :</span>
            <select
              value={filters.sort}
              onChange={(e) => handleSortChange(e.target.value as SortKey)}
              aria-label="Trier les produits"
              className={selectClass}
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </label>
        </div>
        {renderAdvancedFields()}
      </div>

      <div className="flex flex-col gap-3 pb-4 sm:hidden">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">{renderSearchInput('search-mobile')}</div>
          <button
            type="button"
            onClick={onOpenFiltres}
            aria-label="Ouvrir les filtres"
            className="relative flex h-10 shrink-0 items-center gap-1.5 rounded-[9px] border border-[#e0ded9] bg-white px-3 text-[13px] font-medium text-[#17181a]"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filtres
            {mobileFilterCount > 0 && (
              <span
                className="flex h-4 min-w-4 items-center justify-center rounded-full px-1 font-mono text-[10px] text-white"
                style={{ backgroundColor: 'var(--color-shop-primary, #508e27)' }}
              >
                {mobileFilterCount}
              </span>
            )}
          </button>
        </div>
        {renderCategoryChips()}
      </div>

      {activeFilterChips.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 pb-4 pt-4">
          <span className="font-mono text-[11px] uppercase tracking-[.07em] text-[#8b8f95]">
            Filtres actifs
          </span>
          {activeFilterChips.map((chip) => (
            <button
              key={chip.id}
              type="button"
              onClick={chip.onRemove}
              className="flex items-center gap-1.5 rounded-full border px-3 py-1 text-[12.5px] font-medium"
              style={filtreChipStyle}
            >
              {chip.label}
              <X className="h-3 w-3" />
            </button>
          ))}
          <button
            type="button"
            onClick={onClearAll}
            className="text-[12.5px] font-medium text-[#5f6369] underline underline-offset-2 hover:text-[#17181a]"
          >
            Tout effacer
          </button>
        </div>
      )}

      {filtresOuverts && (
        <div className="fixed inset-0 z-50 sm:hidden">
          <div
            className="absolute inset-0 bg-[rgba(23,24,26,.42)]"
            onClick={onCloseFiltres}
            aria-hidden="true"
          />
          <div className="absolute inset-x-0 bottom-0 max-h-[85vh] overflow-y-auto rounded-t-[20px] bg-white p-5 pb-8">
            <div className="mx-auto mb-5 h-1 w-[38px] rounded-full bg-[#e0ded9]" />
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-base font-semibold text-[#17181a]">Filtres</h2>
              <button
                type="button"
                onClick={onCloseFiltres}
                aria-label="Fermer les filtres"
                className="text-[#8b8f95] hover:text-[#17181a]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mb-5">{renderAdvancedFields(true)}</div>

            <div className="mb-5">
              <h3 className="mb-2 font-mono text-[11px] uppercase tracking-[.07em] text-[#8b8f95]">
                Disponibilité
              </h3>
              <div className="flex flex-wrap gap-2">
                {STOCK_OPTIONS.map((opt) => {
                  const active = filters.stock === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => handleFilterStockChange(opt.value)}
                      className="rounded-full px-3.5 py-1.5 text-[13px] font-medium"
                      style={
                        active
                          ? { ...filtreChipStyle, border: '1.5px solid var(--color-shop-primary, #508e27)' }
                          : { border: '1px solid #e6e4df', color: '#3c4045' }
                      }
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mb-5">
              <h3 className="mb-2 font-mono text-[11px] uppercase tracking-[.07em] text-[#8b8f95]">
                Type
              </h3>
              <div className="flex flex-wrap gap-2">
                {TYPE_OPTIONS.map((opt) => {
                  const active = filters.type === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => handleFilterTypeChange(opt.value)}
                      className="rounded-full px-3.5 py-1.5 text-[13px] font-medium"
                      style={
                        active
                          ? { ...filtreChipStyle, border: '1.5px solid var(--color-shop-primary, #508e27)' }
                          : { border: '1px solid #e6e4df', color: '#3c4045' }
                      }
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mb-6">
              <h3 className="mb-2 font-mono text-[11px] uppercase tracking-[.07em] text-[#8b8f95]">
                Trier par
              </h3>
              <div className="flex flex-wrap gap-2">
                {SORT_OPTIONS.map((opt) => {
                  const active = filters.sort === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => handleSortChange(opt.value)}
                      className="rounded-full px-3.5 py-1.5 text-[13px] font-medium"
                      style={
                        active
                          ? { ...filtreChipStyle, border: '1.5px solid var(--color-shop-primary, #508e27)' }
                          : { border: '1px solid #e6e4df', color: '#3c4045' }
                      }
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              type="button"
              onClick={onCloseFiltres}
              className="h-11 w-full rounded-[11px] bg-[#17181a] text-sm font-medium text-white"
            >
              Voir les {resultCount} article{resultCount > 1 ? 's' : ''}
            </button>
          </div>
        </div>
      )}
    </>
  );
};
