'use client';

import type { Commune } from '@/lib/services/communes';

interface ProductAdvancedFiltersProps {
  prixMin: string;
  prixMax: string;
  communeId: string;
  communes: Commune[];
  communesLoading?: boolean;
  onPrixMinChange: (value: string) => void;
  onPrixMaxChange: (value: string) => void;
  onCommuneChange: (value: string) => void;
  compact?: boolean;
}

const inputClass =
  'h-10 w-full rounded-[9px] border border-[#e0ded9] bg-white px-3 text-[13px] text-[#17181a] placeholder:text-[#9a9892] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#17181a]/20';

export const ProductAdvancedFilters = ({
  prixMin,
  prixMax,
  communeId,
  communes,
  communesLoading = false,
  onPrixMinChange,
  onPrixMaxChange,
  onCommuneChange,
  compact = false,
}: ProductAdvancedFiltersProps) => {
  const handlePrixMinChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onPrixMinChange(event.target.value);
  };

  const handlePrixMaxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onPrixMaxChange(event.target.value);
  };

  const handleCommuneChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    onCommuneChange(event.target.value);
  };

  return (
    <div className={compact ? 'flex flex-col gap-3' : 'flex flex-wrap items-end gap-3'}>
      <label className="flex min-w-[120px] flex-1 flex-col gap-1 text-[11px] font-medium uppercase tracking-[.06em] text-[#8b8f95]">
        Prix min (FCFA)
        <input
          type="number"
          inputMode="numeric"
          min={0}
          value={prixMin}
          onChange={handlePrixMinChange}
          placeholder="0"
          aria-label="Prix minimum"
          className={inputClass}
        />
      </label>
      <label className="flex min-w-[120px] flex-1 flex-col gap-1 text-[11px] font-medium uppercase tracking-[.06em] text-[#8b8f95]">
        Prix max (FCFA)
        <input
          type="number"
          inputMode="numeric"
          min={0}
          value={prixMax}
          onChange={handlePrixMaxChange}
          placeholder="Sans max"
          aria-label="Prix maximum"
          className={inputClass}
        />
      </label>
      <label className="flex min-w-[160px] flex-1 flex-col gap-1 text-[11px] font-medium uppercase tracking-[.06em] text-[#8b8f95]">
        Localisation
        <select
          value={communeId}
          onChange={handleCommuneChange}
          disabled={communesLoading}
          aria-label="Filtrer par commune"
          className={inputClass}
        >
          <option value="">
            {communesLoading ? 'Chargement…' : 'Toutes les communes'}
          </option>
          {communes.map((commune) => (
            <option key={commune.id} value={String(commune.id)}>
              {commune.nom_commune}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
};
