'use client';

import { formatPrice } from '@/lib/utils';
import type {
  PersonnalisationEtatFormulaire,
  PersonnalisationProduitDef,
} from '@/lib/types/personnalisations';

export interface ProductPersonnalisationsFieldsProps {
  definitions: PersonnalisationProduitDef[];
  state: Record<string, PersonnalisationEtatFormulaire>;
  onToggle: (id: string, nextActive: boolean) => void;
  onValueChange: (id: string, value: string) => void;
  validationErrors?: Record<string, string>;
}

const pillClass = (active: boolean, hasError: boolean) => {
  if (hasError) {
    return 'border-[#b3261e] bg-[#fdecea] text-[#b3261e]';
  }
  if (active) {
    return 'border-[var(--color-shop-primary,var(--primary-color))] bg-[color-mix(in_srgb,var(--color-shop-primary,var(--primary-color))_10%,white)] text-[var(--color-shop-primary,var(--primary-color))]';
  }
  return 'border-[#e0ded9] bg-white text-[#3c4045] hover:border-[#cfcbc3]';
};

export const ProductPersonnalisationsFields = ({
  definitions,
  state,
  onToggle,
  onValueChange,
  validationErrors,
}: ProductPersonnalisationsFieldsProps) => {
  if (!definitions.length) {
    return null;
  }

  return (
    <div className="space-y-3">
      <div className="font-medium text-[13px] text-[#3c4045]">Personnalisation</div>
      <div className="flex flex-wrap gap-2">
        {definitions.map((definition) => {
          const row = state[definition.id] ?? {
            active: Boolean(definition.obligatoire),
            value: '',
          };
          const supplement = definition.prix_supplementaire;
          const hasSupplement =
            supplement !== undefined && supplement !== null && Number(supplement) > 0;
          const isActive = definition.obligatoire || row.active;
          const errorMessage = validationErrors?.[definition.id];

          return (
            <button
              key={definition.id}
              type="button"
              onClick={() => {
                if (definition.obligatoire) return;
                onToggle(definition.id, !row.active);
              }}
              aria-pressed={isActive}
              aria-label={definition.libelle}
              className={`inline-flex items-center gap-1.5 rounded-full border-[1.5px] px-3 py-1.5 text-[12.5px] font-medium transition-colors ${pillClass(isActive, Boolean(errorMessage))} ${
                definition.obligatoire ? 'cursor-default' : ''
              }`}
            >
              <span
                className={`h-2 w-2 rounded-full ${isActive ? 'bg-current' : 'bg-[#cfcbc3]'}`}
                aria-hidden
              />
              {definition.libelle}
              {definition.obligatoire && <span className="text-[11px] opacity-70">inclus</span>}
              {hasSupplement && (
                <span className="font-mono text-[11px] opacity-80">
                  +{formatPrice(Number(supplement))}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {definitions.map((definition) => {
        const row = state[definition.id] ?? {
          active: Boolean(definition.obligatoire),
          value: '',
        };
        const fieldDisabled = definition.obligatoire ? false : !row.active;
        if (fieldDisabled) return null;

        const inputId = `personnalisation-input-${definition.id}`;
        const errId = `personnalisation-error-${definition.id}`;
        const errorMessage = validationErrors?.[definition.id];

        return (
          <div key={`${definition.id}-field`} className="space-y-1.5">
            <label htmlFor={inputId} className="block text-[12.5px] text-[#5f6369]">
              {definition.libelle}
              {(definition.obligatoire || row.active) && (
                <span className="ml-0.5 text-[#b3261e]" aria-hidden>
                  *
                </span>
              )}
            </label>
            {definition.type === 'number' ? (
              <input
                id={inputId}
                type="number"
                inputMode="decimal"
                value={row.value}
                placeholder="Saisissez une valeur…"
                onChange={(e) => onValueChange(definition.id, e.target.value)}
                aria-required={true}
                aria-invalid={errorMessage ? true : undefined}
                aria-describedby={errorMessage ? errId : undefined}
                className={`w-full rounded-[9px] border px-3 py-2 text-sm placeholder:text-[#9a9892] focus:outline-none focus:ring-2 focus:ring-[#17181a]/15 ${
                  errorMessage ? 'border-[#b3261e]' : 'border-[#e0ded9]'
                }`}
              />
            ) : (
              <input
                id={inputId}
                type="text"
                autoComplete="off"
                value={row.value}
                placeholder={`Ex. ${definition.libelle.toLowerCase()}`}
                onChange={(e) => onValueChange(definition.id, e.target.value)}
                aria-required={true}
                aria-invalid={errorMessage ? true : undefined}
                aria-describedby={errorMessage ? errId : undefined}
                className={`w-full rounded-[9px] border px-3 py-2 text-sm placeholder:text-[#9a9892] focus:outline-none focus:ring-2 focus:ring-[#17181a]/15 ${
                  errorMessage ? 'border-[#b3261e]' : 'border-[#e0ded9]'
                }`}
              />
            )}
            {errorMessage && (
              <p id={errId} className="text-xs text-[#b3261e]" role="alert">
                {errorMessage}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
};
