'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import BoostPageShell, { BoostPageContexte } from '@/components/admin/boost/BoostPageShell';
import PubliciteWizard from '@/components/admin/boost/plateforme/PubliciteWizard';
import type { Publicite } from '@/lib/database-types';
import { messageErreur } from '@/lib/services/boosts';
import { getDetailPublicite, getParametresPublicite, ParametresPubliciteVendeur } from '@/lib/services/publicites';

function ChargementWizard({ ctx }: { ctx: BoostPageContexte }) {
  const searchParams = useSearchParams();
  const draftId = Number(searchParams.get('draftId')) || null;
  const [parametres, setParametres] = useState<ParametresPubliciteVendeur | null>(null);
  const [brouillon, setBrouillon] = useState<Publicite | null>(null);
  const [pret, setPret] = useState(false);
  const [echec, setEchec] = useState<string | null>(null);
  const { erreur, boutique } = ctx;

  useEffect(() => {
    let annule = false;
    (async () => {
      try {
        const [p, d] = await Promise.all([getParametresPublicite(boutique.id), draftId ? getDetailPublicite(draftId) : Promise.resolve(null)]);
        if (annule) return;
        setParametres(p);
        if (d && (d.publicite.statut === 'brouillon' || d.publicite.statut === 'en_attente_paiement')) setBrouillon(d.publicite);
        else if (d) erreur('Cette bannière a déjà été payée : elle ne peut plus être modifiée');
      } catch (err) {
        if (!annule) setEchec(messageErreur(err, 'Chargement impossible'));
      } finally {
        if (!annule) setPret(true);
      }
    })();
    return () => {
      annule = true;
    };
  }, [draftId, boutique.id, erreur]);

  if (!pret) {
    return (
      <div className="flex justify-center py-16">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-black"></div>
      </div>
    );
  }
  if (!parametres) return <p className="py-16 text-center text-sm text-red-600">{echec ?? 'Paramètres indisponibles'}</p>;

  // Offre fermée ou boutique non éligible : rien à réserver (un brouillon déjà payé reste consultable depuis la liste)
  if (!parametres.eligibilite?.eligible && !brouillon) {
    return (
      <div className="mx-auto max-w-xl rounded-xl border border-dashed border-gray-300 bg-white p-8 text-center">
        <p className="font-medium text-gray-900">Mise en avant indisponible</p>
        <p className="mt-1 text-sm text-gray-500">{parametres.eligibilite?.raison ?? 'Cette offre n’est pas encore ouverte.'}</p>
        <Link href={`/admin/${boutique.slug}/boost`} className="mt-5 inline-flex rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
          Retour à mes publicités
        </Link>
      </div>
    );
  }

  return <PubliciteWizard boutique={ctx.boutique} parametres={parametres} brouillon={brouillon} succes={ctx.succes} erreur={ctx.erreur} />;
}

export default function NouvelleBannierePage() {
  return (
    <BoostPageShell titre="Mise en avant sur Marché 241" sousTitre="Votre bannière sur la marketplace, à la semaine" sousChemin="/boost/plateforme/new">
      {(ctx) => (
        <Suspense fallback={null}>
          <ChargementWizard ctx={ctx} />
        </Suspense>
      )}
    </BoostPageShell>
  );
}
