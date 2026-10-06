'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import BoostPageShell, { BoostPageContexte } from '@/components/admin/boost/BoostPageShell';
import BoostWizard from '@/components/admin/boost/BoostWizard';
import type { Boost } from '@/lib/database-types';
import { getDetailBoost, getParametresBoost, messageErreur, ParametresBoost } from '@/lib/services/boosts';

function ChargementWizard({ ctx }: { ctx: BoostPageContexte }) {
  const searchParams = useSearchParams();
  const draftId = Number(searchParams.get('draftId')) || null;
  const produitId = Number(searchParams.get('produit')) || null;
  const [parametres, setParametres] = useState<ParametresBoost | null>(null);
  const [brouillon, setBrouillon] = useState<Boost | null>(null);
  const [pret, setPret] = useState(false);
  const [echec, setEchec] = useState<string | null>(null);
  const { erreur } = ctx;

  useEffect(() => {
    let annule = false;
    (async () => {
      try {
        const [p, d] = await Promise.all([getParametresBoost(), draftId ? getDetailBoost(draftId) : Promise.resolve(null)]);
        if (annule) return;
        setParametres(p);
        if (d && (d.boost.statut === 'brouillon' || d.boost.statut === 'en_attente_paiement')) setBrouillon(d.boost);
        else if (d) erreur('Ce boost a déjà été payé : il ne peut plus être modifié');
      } catch (err) {
        if (!annule) setEchec(messageErreur(err, 'Chargement impossible'));
      } finally {
        if (!annule) setPret(true);
      }
    })();
    return () => {
      annule = true;
    };
  }, [draftId, erreur]);

  if (!pret) {
    return (
      <div className="flex justify-center py-16">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-black"></div>
      </div>
    );
  }
  if (!parametres) return <p className="py-16 text-center text-sm text-red-600">{echec ?? 'Paramètres indisponibles'}</p>;

  return (
    <BoostWizard
      boutique={ctx.boutique}
      parametres={parametres}
      brouillon={brouillon}
      produitInitialId={produitId}
      succes={ctx.succes}
      erreur={ctx.erreur}
    />
  );
}

export default function NouveauBoostPage() {
  return (
    <BoostPageShell titre="Nouvelle publicité" sousTitre="Faites la promotion de votre boutique sur Facebook et Instagram" sousChemin="/boost/new">
      {(ctx) => (
        <Suspense fallback={null}>
          <ChargementWizard ctx={ctx} />
        </Suspense>
      )}
    </BoostPageShell>
  );
}
