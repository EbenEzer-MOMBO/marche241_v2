'use client';

import { useEffect, useState } from 'react';
import { Check, Megaphone, Sparkles } from 'lucide-react';
import { getParametresPublicite } from '@/lib/services/publicites';

/**
 * Étape 0 du wizard : choix du type de publicité.
 * « Mise en avant sur Marché 241 » (bannières sponsorisées) est active quand l'équipe l'a ouverte
 * (paramètre API `types.plateforme`) et que la boutique est éligible (boutiques vérifiées au lancement) ;
 * sinon elle reste affichée, grisée, avec la raison.
 */
export default function TypePubSelector({
  plateformeDisponible,
  boutiqueId,
  onChoisirPlateforme,
  onChoisirMeta
}: {
  plateformeDisponible: boolean;
  boutiqueId: number;
  onChoisirPlateforme: () => void;
  onChoisirMeta: () => void;
}) {
  const [eligibilite, setEligibilite] = useState<{ eligible: boolean; raison: string | null } | null>(null);

  useEffect(() => {
    if (!plateformeDisponible) return;
    let annule = false;
    getParametresPublicite(boutiqueId)
      .then((p) => !annule && setEligibilite(p.eligibilite ?? { eligible: false, raison: null }))
      .catch(() => !annule && setEligibilite({ eligible: false, raison: 'Mise en avant momentanément indisponible' }));
    return () => {
      annule = true;
    };
  }, [plateformeDisponible, boutiqueId]);

  const active = plateformeDisponible && eligibilite?.eligible === true;
  const badge = !plateformeDisponible ? 'Bientôt disponible' : eligibilite === null ? 'Vérification…' : !eligibilite.eligible ? 'Non disponible' : null;

  return (
    <div className="mx-auto max-w-3xl">
      <h2 className="text-base lg:text-lg font-semibold text-gray-900">Quel type de publicité ?</h2>
      <p className="mt-1 text-sm text-gray-500">Choisissez où faire la promotion de votre boutique ou de vos produits.</p>

      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <button
          type="button"
          onClick={active ? onChoisirPlateforme : undefined}
          disabled={!active}
          aria-disabled={!active}
          tabIndex={active ? 0 : -1}
          className={
            active
              ? 'group relative flex flex-col items-start rounded-xl border border-gray-300 bg-white p-5 text-left shadow-sm transition hover:border-black hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2'
              : 'relative flex flex-col items-start rounded-xl border border-gray-200 bg-gray-50 p-5 text-left opacity-60 cursor-not-allowed'
          }
        >
          {badge && (
            <span className="absolute right-3 top-3 rounded-full bg-gray-200 px-2 py-0.5 text-xs font-medium text-gray-600">{badge}</span>
          )}
          <span className={`flex h-10 w-10 items-center justify-center rounded-lg ${active ? 'bg-green-50' : 'bg-gray-200'}`}>
            <Sparkles className={`h-5 w-5 ${active ? 'text-[#508e27]' : 'text-gray-500'}`} />
          </span>
          <span className={`mt-3 font-semibold ${active ? 'text-gray-900' : 'text-gray-700'}`}>Mise en avant sur Marché 241</span>
          <span className={`mt-1 text-sm ${active ? 'text-gray-600' : 'text-gray-500'}`}>
            Votre bannière sur la page d’accueil, une catégorie ou toutes les pages de la marketplace, à la semaine.
          </span>
          {plateformeDisponible && eligibilite && !eligibilite.eligible && eligibilite.raison && (
            <span className="mt-2 text-xs font-medium text-gray-600">{eligibilite.raison}</span>
          )}
          {active && <span className="mt-3 text-sm font-medium text-black underline-offset-2 group-hover:underline">Continuer →</span>}
        </button>

        <button
          type="button"
          onClick={onChoisirMeta}
          className={`group relative flex flex-col items-start rounded-xl bg-white p-5 text-left shadow-sm transition hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 ${
            active ? 'border border-gray-300 hover:border-black' : 'border-2 border-black'
          }`}
        >
          {/* Seul choix possible tant que la mise en avant est fermée : présenté comme sélectionné */}
          {!active && (
            <span className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-black">
              <Check className="h-4 w-4 text-white" />
            </span>
          )}
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
