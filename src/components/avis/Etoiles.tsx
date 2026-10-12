'use client';

import { useState } from 'react';

const CHEMIN_ETOILE =
  'M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z';

const COULEUR_PLEINE = '#f5a524';
const COULEUR_VIDE = '#e4e2dd';

interface EtoilesProps {
  note: number; // 0 à 5, décimales acceptées
  taille?: number; // en px
  className?: string;
}

/** Affichage en lecture seule (remplissage partiel pour les moyennes). */
export function Etoiles({ note, taille = 16, className = '' }: EtoilesProps) {
  const valeur = Math.max(0, Math.min(5, note));
  return (
    <span
      className={`inline-flex items-center gap-[2px] ${className}`}
      role="img"
      aria-label={`${valeur.toLocaleString('fr-FR', { maximumFractionDigits: 1 })} sur 5`}
    >
      {[0, 1, 2, 3, 4].map((i) => {
        const remplissage = Math.max(0, Math.min(1, valeur - i)) * 100;
        return (
          <span key={i} className="relative inline-block" style={{ width: taille, height: taille }} aria-hidden="true">
            <svg viewBox="0 0 20 20" width={taille} height={taille} className="absolute inset-0" fill={COULEUR_VIDE}>
              <path d={CHEMIN_ETOILE} />
            </svg>
            <span className="absolute inset-0 overflow-hidden" style={{ width: `${remplissage}%` }}>
              <svg viewBox="0 0 20 20" width={taille} height={taille} fill={COULEUR_PLEINE}>
                <path d={CHEMIN_ETOILE} />
              </svg>
            </span>
          </span>
        );
      })}
    </span>
  );
}

const LIBELLES = ['', 'Très décevant', 'Décevant', 'Correct', 'Bien', 'Excellent'];

interface SelecteurEtoilesProps {
  valeur: number; // 0 = aucune note
  onChange: (note: number) => void;
  nom: string; // libellé accessible (nom du produit)
  desactive?: boolean;
}

/** Saisie d'une note de 1 à 5 (boutons radio accessibles, cibles tactiles de 44 px). */
export function SelecteurEtoiles({ valeur, onChange, nom, desactive = false }: SelecteurEtoilesProps) {
  const [survol, setSurvol] = useState(0);
  const affichee = survol || valeur;
  return (
    <div>
      <div
        role="radiogroup"
        aria-label={`Note pour ${nom}`}
        className="flex items-center"
        onMouseLeave={() => setSurvol(0)}
      >
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={valeur === n}
            aria-label={`${n} étoile${n > 1 ? 's' : ''} — ${LIBELLES[n]}`}
            disabled={desactive}
            onClick={() => onChange(n)}
            onMouseEnter={() => setSurvol(n)}
            className="flex h-11 w-11 items-center justify-center rounded-lg transition-transform focus:outline-none focus-visible:ring-2 focus-visible:ring-[#508e27] active:scale-90 disabled:opacity-60"
          >
            <svg viewBox="0 0 20 20" width={30} height={30} fill={n <= affichee ? COULEUR_PLEINE : COULEUR_VIDE} aria-hidden="true">
              <path d={CHEMIN_ETOILE} />
            </svg>
          </button>
        ))}
      </div>
      <p className="mt-0.5 h-5 pl-2 text-[13px] font-medium text-[#5f6369]" aria-live="polite">
        {affichee ? LIBELLES[affichee] : ''}
      </p>
    </div>
  );
}
