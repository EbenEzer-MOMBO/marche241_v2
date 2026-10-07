'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { CalendarDays, ChevronRight, Eye, MousePointerClick, Sparkles } from 'lucide-react';
import type { BoutiqueData } from '@/lib/services/auth';
import { formaterFcfa, formaterNombre, messageErreur } from '@/lib/services/boosts';
import { getPublicitesBoutique, libellePeriodePublicite, LIBELLES_FORMULE, PubliciteListe } from '@/lib/services/publicites';
import StatutPubliciteBadge from './StatutPubliciteBadge';

/** Ce que le vendeur doit savoir ou faire ensuite, selon le statut de la bannière. */
function prochaineEtape(p: PubliciteListe): { texte: string; classe: string } | null {
  if (p.statut_remboursement === 'a_rembourser' && p.montant_a_rembourser_fcfa > 0) {
    return { texte: `Remboursement de ${formaterFcfa(p.montant_a_rembourser_fcfa)} en cours`, classe: 'text-amber-700' };
  }
  switch (p.statut) {
    case 'brouillon':
      return { texte: 'À compléter', classe: 'text-amber-700' };
    case 'en_attente_paiement':
      return { texte: 'Paiement à finaliser : vos semaines sont bloquées pour un temps limité', classe: 'text-amber-700' };
    case 'en_attente_validation':
      return { texte: 'Payée · en cours de vérification par l’équipe Marché 241', classe: 'text-gray-600' };
    case 'refusee':
      return { texte: p.note_revue ? `Motif : ${p.note_revue}` : 'Bannière refusée', classe: 'text-red-700' };
    case 'programmee':
      return { texte: 'Validée · la diffusion démarre le lundi de la première semaine', classe: 'text-green-700' };
    case 'active':
      return { texte: 'En ligne sur Marché 241', classe: 'text-green-700' };
    default:
      return null;
  }
}

/** Bannières sponsorisées de la boutique (section de la page « Publicité »). Rien si aucune bannière. */
export default function ListeBannieres({ boutique, erreur }: { boutique: BoutiqueData; erreur: (message: string) => void }) {
  const [publicites, setPublicites] = useState<PubliciteListe[] | null>(null);

  useEffect(() => {
    getPublicitesBoutique(boutique.id)
      .then(setPublicites)
      .catch((err) => {
        erreur(messageErreur(err, 'Impossible de charger vos bannières'));
        setPublicites([]);
      });
  }, [boutique.id, erreur]);

  if (!publicites || publicites.length === 0) return null;

  return (
    <section className="space-y-3" aria-labelledby="titre-bannieres">
      <h2 id="titre-bannieres" className="flex items-center gap-2 pt-2 text-sm font-semibold text-gray-900">
        <Sparkles className="h-4 w-4 text-[#508e27]" /> Bannières sur Marché 241
      </h2>
      {publicites.map((p) => {
        const lien =
          p.statut === 'brouillon' || p.statut === 'en_attente_paiement'
            ? `/admin/${boutique.slug}/boost/plateforme/new?draftId=${p.id}`
            : `/admin/${boutique.slug}/boost/plateforme/${p.id}`;
        const etape = prochaineEtape(p);
        const diffusee = p.statut === 'active' || p.statut === 'terminee';
        return (
          <Link key={p.id} href={lien} className="group flex items-start gap-3 rounded-xl border border-gray-200 bg-white p-3 shadow-sm transition hover:shadow-md sm:p-4">
            <div className="h-12 w-24 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100 sm:h-14 sm:w-36">
              {p.image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={p.image_url} alt="" className="h-full w-full object-cover" />
              ) : (
                <Sparkles className="m-auto mt-4 h-5 w-5 text-gray-300" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <p className="truncate font-semibold text-gray-900">
                  Bannière {LIBELLES_FORMULE[p.formule]}
                  {p.categorie ? ` — ${p.categorie.nom}` : ''}
                </p>
                <StatutPubliciteBadge statut={p.statut} />
              </div>
              <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-gray-500">
                {p.total_fcfa > 0 && <span className="font-medium text-gray-800">{formaterFcfa(p.total_fcfa)}</span>}
                {p.semaine_debut && (
                  <span className="inline-flex items-center gap-1">
                    <CalendarDays className="h-3.5 w-3.5 text-gray-400" /> {libellePeriodePublicite(p.semaine_debut, p.nb_semaines)}
                  </span>
                )}
                <span className="truncate">{p.cible_type === 'produit' ? `Produit : ${p.produit_nom ?? 'produit supprimé'}` : 'Vers la boutique'}</span>
              </p>
              {diffusee && (
                <p className="mt-1 flex items-center gap-3 text-xs text-gray-600">
                  <span className="inline-flex items-center gap-1">
                    <Eye className="h-3.5 w-3.5 text-gray-400" /> <strong className="text-gray-900">{formaterNombre(p.totaux.affichages)}</strong> affichages
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <MousePointerClick className="h-3.5 w-3.5 text-gray-400" /> <strong className="text-gray-900">{formaterNombre(p.totaux.clics)}</strong> clics
                  </span>
                </p>
              )}
              {etape && <p className={`mt-1.5 text-xs font-medium ${etape.classe}`}>{etape.texte}</p>}
            </div>
            <ChevronRight className="mt-1 h-5 w-5 flex-shrink-0 text-gray-400 group-hover:text-gray-700" />
          </Link>
        );
      })}
    </section>
  );
}
