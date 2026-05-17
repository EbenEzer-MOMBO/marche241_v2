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
    <div className="border-t border-gray-200 pt-6 mt-6">
      <h3 className="text-sm font-medium text-gray-900 mb-3">Personnalisation</h3>
      <div className="space-y-5">
        {definitions.map((definition) => {
          const row = state[definition.id] ?? {
            active: Boolean(definition.obligatoire),
            value: '',
          };
          const supplement = definition.prix_supplementaire;
          const hasSupplement =
            supplement !== undefined && supplement !== null && Number(supplement) > 0;
          const isOptionalNonObligatory = !definition.obligatoire;
          const fieldDisabled =
            definition.obligatoire ? false : !row.active;
          const inputId = `personnalisation-input-${definition.id}`;
          const errId = `personnalisation-error-${definition.id}`;
          const errorMessage = validationErrors?.[definition.id];
          const errDescribedById = errorMessage ? errId : undefined;

          return (
            <div
              key={definition.id}
              className="rounded-lg border border-gray-200 bg-gray-50/60 p-3 sm:p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                <label
                  htmlFor={inputId}
                  className="text-sm font-medium text-gray-900"
                >
                  {definition.libelle}
                  {definition.obligatoire && (
                    <span className="text-red-500 ml-1" aria-hidden="true">
                      *
                    </span>
                  )}
                </label>
                {hasSupplement && (
                  <span className="text-sm font-semibold text-gray-800 tabular-nums">
                    +{formatPrice(Number(supplement))}
                  </span>
                )}
              </div>

              {definition.obligatoire && (
                <p id={`hint-ob-${definition.id}`} className="text-xs text-gray-600 mb-2">
                  Cette option est incluse avec la commande.
                </p>
              )}

              {isOptionalNonObligatory && (
                <div className="flex items-start gap-2 mb-2">
                  <input
                    type="checkbox"
                    id={`personnalisation-enable-${definition.id}`}
                    checked={row.active}
                    onChange={(e) =>
                      onToggle(definition.id, e.target.checked)
                    }
                    className="mt-1 h-4 w-4 rounded border-gray-300 text-gray-900 focus:ring-gray-900"
                    aria-labelledby={`personnalisation-enable-label-${definition.id}`}
                  />
                  <label
                    id={`personnalisation-enable-label-${definition.id}`}
                    htmlFor={`personnalisation-enable-${definition.id}`}
                    className="text-sm text-gray-700 cursor-pointer select-none"
                  >
                    Inclure : {definition.libelle}
                  </label>
                </div>
              )}

              <div className="relative">
                {definition.type === 'number' ? (
                  <input
                    id={inputId}
                    type="number"
                    inputMode="decimal"
                    value={fieldDisabled ? '' : row.value}
                    placeholder={
                      fieldDisabled
                        ? 'Activez l’option pour saisir'
                        : 'Saisissez une valeur…'
                    }
                    onChange={(e) =>
                      onValueChange(definition.id, e.target.value)
                    }
                    disabled={fieldDisabled}
                    aria-required={
                      definition.obligatoire || row.active ? true : false
                    }
                    aria-invalid={errorMessage ? true : undefined}
                    aria-describedby={errDescribedById ?? undefined}
                    className={`w-full px-3 py-2 rounded-lg border text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-0 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed ${errorMessage ? 'border-red-500 focus:ring-red-500/40' : 'border-gray-300 focus:ring-gray-900/25'}`}
                  />
                ) : (
                  <input
                    id={inputId}
                    type="text"
                    inputMode="text"
                    autoComplete="off"
                    value={fieldDisabled ? '' : row.value}
                    placeholder={
                      fieldDisabled
                        ? 'Activez l’option pour saisir'
                        : `Ex. ${definition.libelle.toLowerCase()}`
                    }
                    onChange={(e) =>
                      onValueChange(definition.id, e.target.value)
                    }
                    disabled={fieldDisabled}
                    aria-required={
                      definition.obligatoire || row.active ? true : false
                    }
                    aria-invalid={errorMessage ? true : undefined}
                    aria-describedby={errDescribedById ?? undefined}
                    className={`w-full px-3 py-2 rounded-lg border text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-0 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed ${errorMessage ? 'border-red-500 focus:ring-red-500/40' : 'border-gray-300 focus:ring-gray-900/25'}`}
                  />
                )}
              </div>

              {errorMessage && (
                <p id={errId} className="mt-2 text-xs text-red-600" role="alert">
                  {errorMessage}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
