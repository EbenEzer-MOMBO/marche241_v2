'use client';

import { Check, Megaphone, Sparkles } from 'lucide-react';

/**
 * Étape 0 du wizard : choix du type de publicité.
 * « Mise en avant sur Marché 241 » est affichée mais désactivée tant qu'elle n'est pas ouverte
 * (paramètre API `types.plateforme`).
 */
export default function TypePubSelector({
  plateformeDisponible,
  onChoisirMeta
}: {
  plateformeDisponible: boolean;
  onChoisirMeta: () => void;
}) {
  return (
    <div className="mx-auto max-w-3xl">
      <h2 className="text-base lg:text-lg font-semibold text-gray-900">Quel type de publicité ?</h2>
      <p className="mt-1 text-sm text-gray-500">Choisissez où faire la promotion de votre boutique ou de vos produits.</p>

      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <button
          type="button"
          disabled={!plateformeDisponible}
          aria-disabled={!plateformeDisponible}
          tabIndex={plateformeDisponible ? 0 : -1}
          className="relative flex flex-col items-start rounded-xl border border-gray-200 bg-gray-50 p-5 text-left opacity-60 cursor-not-allowed"
        >
          <span className="absolute right-3 top-3 rounded-full bg-gray-200 px-2 py-0.5 text-xs font-medium text-gray-600">
            Bientôt disponible
          </span>
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-200">
            <Sparkles className="h-5 w-5 text-gray-500" />
          </span>
          <span className="mt-3 font-semibold text-gray-700">Mise en avant sur Marché 241</span>
          <span className="mt-1 text-sm text-gray-500">
            Apparaissez en tête des résultats et sur la page d’accueil de la marketplace.
          </span>
        </button>

        <button
          type="button"
          onClick={onChoisirMeta}
          className="group relative flex flex-col items-start rounded-xl border-2 border-black bg-white p-5 text-left shadow-sm transition hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2"
        >
          <span className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-black">
            <Check className="h-4 w-4 text-white" />
          </span>
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
            <Megaphone className="h-5 w-5 text-blue-600" />
          </span>
          <span className="mt-3 font-semibold text-gray-900">Publicité Facebook & Instagram</span>
          <span className="mt-1 text-sm text-gray-600">
            Marché 241 diffuse votre publicité sur Meta, sans compte publicitaire de votre côté.
          </span>
          <span className="mt-3 text-sm font-medium text-black underline-offset-2 group-hover:underline">Continuer →</span>
        </button>
      </div>
    </div>
  );
}
