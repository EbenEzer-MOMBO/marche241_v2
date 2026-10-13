'use client';

import { useEffect, useRef } from 'react';
import {
  ChampParticipant,
  LIBELLES_CHAMP_PARTICIPANT,
  ParticipantBilletSaisie,
} from '@/lib/utils/infos-participants';

export interface FicheParticipantASaisir {
  cle: string;
  produitId: number;
  titre: string;
  champs: ChampParticipant[];
}

interface ParticipantInfosModalProps {
  fiches: FicheParticipantASaisir[];
  valeurs: Record<string, ParticipantBilletSaisie>;
  erreurs: Record<string, string>;
  onChange: (cle: string, champ: ChampParticipant, valeur: string) => void;
  onConfirm: () => void;
  onClose: () => void;
}

export function ParticipantInfosModal({
  fiches,
  valeurs,
  erreurs,
  onChange,
  onConfirm,
  onClose,
}: ParticipantInfosModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  // onClose change à chaque rendu du parent : le lire via une ref évite de relancer l'effet (et de voler le focus)
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    const precedent = document.activeElement as HTMLElement | null;
    const overflowInitial = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    dialogRef.current?.querySelector<HTMLElement>('input')?.focus();

    const surTouche = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCloseRef.current();
        return;
      }
      if (e.key !== 'Tab' || !dialogRef.current) return;
      const focusables = dialogRef.current.querySelectorAll<HTMLElement>('input, button');
      if (focusables.length === 0) return;
      const premier = focusables[0];
      const dernier = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === premier) {
        e.preventDefault();
        dernier.focus();
      } else if (!e.shiftKey && document.activeElement === dernier) {
        e.preventDefault();
        premier.focus();
      }
    };
    document.addEventListener('keydown', surTouche);
    return () => {
      document.removeEventListener('keydown', surTouche);
      document.body.style.overflow = overflowInitial;
      precedent?.focus();
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4">
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="participants-titre"
        className="flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-t-2xl bg-white shadow-xl sm:rounded-2xl"
      >
        <div className="border-b border-gray-100 px-5 py-4">
          <h2 id="participants-titre" className="text-lg font-semibold text-gray-900">
            Informations des participants
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Renseignez une fiche par billet. Ces informations seront transmises à l’organisateur.
          </p>
        </div>
        <div className="flex-1 space-y-5 overflow-y-auto px-5 py-4">
          {fiches.map((fiche, index) => (
            <fieldset key={fiche.cle} className="space-y-3 rounded-xl border border-gray-200 p-4">
              <legend className="px-1 text-sm font-medium text-gray-900">{fiche.titre}</legend>
              {fiche.champs.map((champ) => {
                const erreurCle = `${fiche.cle}.${champ}`;
                const type = champ === 'email' ? 'email' : champ === 'telephone' ? 'tel' : 'text';
                return (
                  <div key={champ}>
                    <label className="mb-1 block text-sm text-gray-700" htmlFor={`${fiche.cle}-${champ}`}>
                      {LIBELLES_CHAMP_PARTICIPANT[champ]} *
                    </label>
                    <input
                      id={`${fiche.cle}-${champ}`}
                      type={type}
                      autoComplete={champ === 'email' ? 'email' : champ === 'nom_complet' ? 'name' : 'off'}
                      className="h-11 w-full rounded-[9px] border border-[#e0ded9] px-3 text-sm focus:border-[var(--color-shop-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-shop-primary)]"
                      value={valeurs[fiche.cle]?.[champ] || ''}
                      onChange={(e) => onChange(fiche.cle, champ, e.target.value)}
                      aria-invalid={Boolean(erreurs[erreurCle])}
                    />
                    {erreurs[erreurCle] && (
                      <p className="mt-1 text-xs text-red-600">{erreurs[erreurCle]}</p>
                    )}
                  </div>
                );
              })}
              {index === 0 && fiches.length > 1 && (
                <p className="text-xs text-gray-400">Les autres fiches peuvent être différentes.</p>
              )}
            </fieldset>
          ))}
        </div>
        <div className="flex gap-3 border-t border-gray-100 px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl border border-gray-200 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Retour
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 rounded-xl bg-[var(--color-shop-primary)] px-4 py-3 text-sm font-medium text-white hover:opacity-90"
          >
            Continuer
          </button>
        </div>
      </div>
    </div>
  );
}
