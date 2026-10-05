'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ChevronRight, Megaphone, Plus } from 'lucide-react';
import BoostPageShell, { BoostPageContexte } from '@/components/admin/boost/BoostPageShell';
import StatutBoostBadge from '@/components/admin/boost/StatutBoostBadge';
import type { Boost } from '@/lib/database-types';
import { formaterFcfa, getBoostsBoutique, messageErreur } from '@/lib/services/boosts';

function formaterDate(d: Date | string | null): string {
  if (!d) return '';
  return new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
}

function ListeBoosts({ ctx }: { ctx: BoostPageContexte }) {
  const { boutique, erreur } = ctx;
  const [boosts, setBoosts] = useState<Boost[] | null>(null);

  useEffect(() => {
    getBoostsBoutique(boutique.id)
      .then(setBoosts)
      .catch((err) => {
        erreur(messageErreur(err, 'Impossible de charger vos publicités'));
        setBoosts([]);
      });
  }, [boutique.id, erreur]);

  if (boosts === null) {
    return (
      <div className="flex justify-center py-16">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-black"></div>
      </div>
    );
  }

  if (boosts.length === 0) {
    return (
      <div className="mx-auto max-w-xl rounded-xl border border-dashed border-gray-300 bg-white p-8 sm:p-10 text-center">
        <Megaphone className="mx-auto mb-3 h-12 w-12 text-gray-300" />
        <p className="font-medium text-gray-900">Aucune publicité pour le moment</p>
        <p className="mt-1 text-sm text-gray-500">
          Faites connaître votre boutique sur Facebook et Instagram à partir de 3 000 FCFA. Marché 241 s’occupe de tout.
        </p>
        <Link
          href={`/admin/${boutique.slug}/boost/new`}
          className="mt-5 inline-flex items-center gap-2 rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
        >
          <Plus className="h-4 w-4" /> Créer ma première publicité
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {boosts.map((b) => {
        const lien =
          b.statut === 'brouillon' || b.statut === 'en_attente_paiement'
            ? `/admin/${boutique.slug}/boost/new?draftId=${b.id}`
            : `/admin/${boutique.slug}/boost/${b.id}`;
        const enDiffusion = b.statut === 'actif' || b.statut === 'en_pause' || b.statut === 'termine';
        const pourcentage = b.budget_media_fcfa > 0 ? Math.min(100, Math.round((b.depense_fcfa / b.budget_media_fcfa) * 100)) : 0;
        return (
          <Link
            key={b.id}
            href={lien}
            className="group flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-3 sm:p-4 shadow-sm transition hover:shadow-md"
          >
            <div className="h-14 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
              {b.image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={b.image_url} alt="" className="h-full w-full object-cover" />
              ) : (
                <Megaphone className="m-auto mt-4 h-6 w-6 text-gray-300" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="truncate font-semibold text-gray-900">{b.titre || b.nom}</p>
                <StatutBoostBadge statut={b.statut} />
              </div>
              <p className="mt-0.5 text-xs text-gray-500">
                {formaterFcfa(b.total_fcfa)} · {b.duree_jours} jours
                {b.date_debut ? ` · du ${formaterDate(b.date_debut)} au ${formaterDate(b.date_fin)}` : ''}
              </p>
              {enDiffusion && (
                <div className="mt-2 flex items-center gap-2">
                  <div className="h-1.5 w-full max-w-[200px] overflow-hidden rounded-full bg-gray-100">
                    <div className="h-full rounded-full bg-black" style={{ width: `${pourcentage}%` }} />
                  </div>
                  <span className="text-xs text-gray-500">{formaterFcfa(b.depense_fcfa)} dépensés</span>
                </div>
              )}
            </div>
            <ChevronRight className="h-5 w-5 flex-shrink-0 text-gray-400 group-hover:text-gray-700" />
          </Link>
        );
      })}
    </div>
  );
}

export default function BoostsPage() {
  return (
    <BoostPageShell
      titre="Publicité"
      sousTitre="Vos publicités Facebook et Instagram"
      sousChemin="/boost"
      actions={({ boutique }) => (
        <Link
          href={`/admin/${boutique.slug}/boost/new`}
          className="inline-flex items-center gap-2 rounded-lg bg-black px-3 py-2 lg:px-4 text-sm font-medium text-white hover:bg-gray-800 flex-shrink-0"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Nouvelle publicité</span>
        </Link>
      )}
    >
      {(ctx) => <ListeBoosts ctx={ctx} />}
    </BoostPageShell>
  );
}
