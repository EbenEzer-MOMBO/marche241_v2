'use client';

import { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ArrowLeft, CalendarDays, Eye, MousePointerClick, Percent, Users } from 'lucide-react';
import BoostPageShell, { BoostPageContexte } from '@/components/admin/boost/BoostPageShell';
import StatutPubliciteBadge from '@/components/admin/boost/plateforme/StatutPubliciteBadge';
import ApercuBanniere from '@/components/admin/boost/plateforme/ApercuBanniere';
import { formaterFcfa, formaterNombre, messageErreur } from '@/lib/services/boosts';
import { DetailPublicite, getDetailPublicite, libellePeriodePublicite, LIBELLES_FORMULE } from '@/lib/services/publicites';
import { verifierPaiementEnBoucle } from '@/lib/services/paiements';
import type { PagePublicite } from '@/lib/database-types';

const LIBELLES_EVENEMENTS: Record<string, string> = {
  creation: 'Brouillon créé',
  soumission: 'Semaines réservées',
  paiement_confirme: 'Paiement reçu',
  paiement_a_rembourser: 'Paiement à rembourser',
  validee: 'Validée par l’équipe Marché 241',
  refusee: 'Refusée par l’équipe Marché 241',
  debut_diffusion: 'Diffusion démarrée',
  terminee: 'Diffusion terminée',
  annulee: 'Annulée par l’équipe Marché 241',
  semaine_offerte: 'Semaine offerte par Marché 241',
  rembourse: 'Remboursement effectué',
  liberation_paiement_expire: 'Semaines libérées (paiement non finalisé)'
};

const LIBELLES_PAGES: Record<PagePublicite, string> = {
  accueil: 'Accueil',
  produits: 'Tous les produits',
  categorie: 'Page catégorie',
  evenements: 'Événements',
  boutiques: 'Boutiques',
  autre: 'Autres pages'
};

function formaterDateHeure(d: string | Date | null): string {
  if (!d) return '';
  return new Date(d).toLocaleString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
}

function Indicateur({ icone: Icone, libelle, valeur }: { icone: typeof Eye; libelle: string; valeur: string }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <div className="flex items-center gap-2 text-xs text-gray-500">
        <Icone className="h-4 w-4" /> {libelle}
      </div>
      <p className="mt-1 text-lg font-bold text-gray-900 sm:text-xl">{valeur}</p>
    </div>
  );
}

function DetailContenu({ ctx }: { ctx: BoostPageContexte }) {
  const { boutique, succes, erreur } = ctx;
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = Number(params.id);
  const [detail, setDetail] = useState<DetailPublicite | null>(null);
  const [verificationCarte, setVerificationCarte] = useState(false);
  const verificationLancee = useRef(false);

  const charger = useCallback(async () => {
    try {
      setDetail(await getDetailPublicite(id));
    } catch (err) {
      erreur(messageErreur(err, 'Bannière introuvable'));
      router.push(`/admin/${boutique.slug}/boost`);
    }
  }, [id, boutique.slug, erreur, router]);

  useEffect(() => {
    void charger();
  }, [charger]);

  // Retour de la page de paiement carte : ?paiement=carte&bill_id=…
  useEffect(() => {
    const billId = searchParams.get('bill_id');
    if (searchParams.get('paiement') !== 'carte' || !billId || verificationLancee.current) return;
    verificationLancee.current = true;
    setVerificationCarte(true);
    verifierPaiementEnBoucle(billId, 60000, 5000)
      .then((r) => {
        if (r.status === 'paye' || r.status === 'paid' || r.status === 'processed') succes('Paiement reçu : votre bannière est en cours de validation', 'Paiement confirmé');
        else erreur(r.message || 'Paiement par carte non confirmé');
      })
      .catch(() => erreur('Vérification du paiement impossible'))
      .finally(() => {
        setVerificationCarte(false);
        router.replace(`/admin/${boutique.slug}/boost/plateforme/${id}`);
        void charger();
      });
  }, [searchParams, id, boutique.slug, router, charger, succes, erreur]);

  if (!detail) {
    return (
      <div className="flex justify-center py-16">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-black"></div>
      </div>
    );
  }

  const { publicite: p, stats, garantie, evenements } = detail;
  const donneesGraphe = stats.par_jour.map((j) => ({
    date: new Date(`${j.date}T12:00:00Z`).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', timeZone: 'UTC' }),
    affichages: j.affichages,
    clics: j.clics
  }));

  let bandeau: { classe: string; texte: string } | null = null;
  if (verificationCarte) bandeau = { classe: 'bg-blue-50 text-blue-800', texte: 'Vérification de votre paiement par carte…' };
  else if (p.statut === 'en_attente_validation')
    bandeau = { classe: 'bg-amber-50 text-amber-800', texte: 'Paiement reçu. L’équipe Marché 241 vérifie votre bannière avant sa diffusion (généralement sous 24 h).' };
  else if (p.statut === 'programmee') bandeau = { classe: 'bg-blue-50 text-blue-800', texte: 'Bannière validée : elle sera en ligne dès le lundi de la première semaine.' };
  else if (p.statut === 'refusee') bandeau = { classe: 'bg-red-50 text-red-800', texte: `Bannière refusée${p.note_revue ? ` : ${p.note_revue}` : '.'}` };
  else if (p.statut === 'annulee') bandeau = { classe: 'bg-red-50 text-red-800', texte: `Bannière annulée${p.note_revue ? ` : ${p.note_revue}` : '.'}` };
  else if (p.statut === 'en_attente_paiement') bandeau = { classe: 'bg-yellow-50 text-yellow-800', texte: 'Paiement non finalisé : vos semaines sont bloquées pour un temps limité.' };

  const remboursement =
    p.statut_remboursement !== 'aucun' && p.montant_a_rembourser_fcfa > 0
      ? p.statut_remboursement === 'rembourse'
        ? `${formaterFcfa(p.montant_a_rembourser_fcfa)} remboursés`
        : `Remboursement de ${formaterFcfa(p.montant_a_rembourser_fcfa)} en cours`
      : null;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link href={`/admin/${boutique.slug}/boost`} className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-black">
          <ArrowLeft className="h-4 w-4" /> Mes publicités
        </Link>
        {p.statut === 'en_attente_paiement' && (
          <Link href={`/admin/${boutique.slug}/boost/plateforme/new?draftId=${p.id}`} className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800">
            Finaliser le paiement
          </Link>
        )}
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-4 sm:p-5">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-lg font-semibold text-gray-900">
            Bannière {LIBELLES_FORMULE[p.formule]}
            {p.categorie ? ` — ${p.categorie.nom}` : ''}
          </h2>
          <StatutPubliciteBadge statut={p.statut} />
        </div>
        <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-gray-600">
          {p.semaine_debut && (
            <span className="inline-flex items-center gap-1">
              <CalendarDays className="h-4 w-4 text-gray-400" /> {libellePeriodePublicite(p.semaine_debut, p.nb_semaines)}
            </span>
          )}
          {p.total_fcfa > 0 && <span className="font-medium text-gray-900">{formaterFcfa(p.total_fcfa)}</span>}
          {p.semaines_offertes > 0 && (
            <span className="rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">
              {p.semaines_offertes} semaine{p.semaines_offertes > 1 ? 's' : ''} offerte{p.semaines_offertes > 1 ? 's' : ''}
            </span>
          )}
        </p>
        {bandeau && <p className={`mt-3 rounded-lg px-3 py-2 text-sm ${bandeau.classe}`}>{bandeau.texte}</p>}
        {remboursement && <p className="mt-2 text-sm font-medium text-amber-700">{remboursement}</p>}
      </div>

      <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-4">
        <Indicateur icone={Eye} libelle="Affichages" valeur={formaterNombre(stats.affichages)} />
        <Indicateur icone={Users} libelle="Visiteurs uniques" valeur={formaterNombre(stats.visiteurs_uniques)} />
        <Indicateur icone={MousePointerClick} libelle="Clics" valeur={formaterNombre(stats.clics)} />
        <Indicateur icone={Percent} libelle="Taux de clic" valeur={`${stats.taux_clic.toLocaleString('fr-FR')} %`} />
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-5">
          <div className="rounded-xl border border-gray-200 bg-white p-4 sm:p-5">
            <h3 className="text-sm font-semibold text-gray-900">Affichages et clics par jour</h3>
            {donneesGraphe.length === 0 ? (
              <p className="mt-3 text-sm text-gray-500">
                {p.statut === 'active' || p.statut === 'terminee' ? 'Pas encore d’affichage mesuré.' : 'Les statistiques apparaîtront dès le début de la diffusion.'}
              </p>
            ) : (
              <div className="mt-3 h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={donneesGraphe}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="date" fontSize={11} />
                    <YAxis allowDecimals={false} fontSize={11} width={32} />
                    <Tooltip />
                    <Bar dataKey="affichages" name="Affichages" fill="#111827" radius={[3, 3, 0, 0]} />
                    <Bar dataKey="clics" name="Clics" fill="#508e27" radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
            {stats.par_page.length > 0 && (
              <ul className="mt-4 divide-y divide-gray-100 text-sm">
                {stats.par_page.map((l) => (
                  <li key={l.page} className="flex justify-between py-1.5">
                    <span className="text-gray-600">{LIBELLES_PAGES[l.page] ?? l.page}</span>
                    <span className="text-gray-900">
                      {formaterNombre(l.affichages)} affichages · {formaterNombre(l.clics)} clics
                    </span>
                  </li>
                ))}
              </ul>
            )}
            {garantie.seuil_total > 0 && (p.statut === 'active' || p.statut === 'terminee') && (
              <p className="mt-3 text-xs text-gray-500">
                Objectif de diffusion : {formaterNombre(garantie.seuil_total)} affichages sur la période.{' '}
                {garantie.atteint ? 'Objectif atteint.' : 'Si l’objectif n’est pas atteint, Marché 241 peut vous offrir une semaine supplémentaire.'}
              </p>
            )}
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-4 sm:p-5">
            <h3 className="text-sm font-semibold text-gray-900">Historique</h3>
            {evenements.length === 0 ? (
              <p className="mt-2 text-sm text-gray-500">Aucun événement.</p>
            ) : (
              <ul className="mt-2 space-y-1.5 text-sm">
                {evenements.map((e) => (
                  <li key={e.id} className="flex justify-between gap-3">
                    <span className="text-gray-700">{LIBELLES_EVENEMENTS[e.type_evenement] ?? e.type_evenement}</span>
                    <span className="flex-shrink-0 text-gray-400">{formaterDateHeure(e.date_creation)}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <aside>
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-500">Votre bannière</p>
          <ApercuBanniere imageUrl={p.image_url} imageMobileUrl={p.image_mobile_url} formule={p.formule} categorieNom={p.categorie?.nom} />
          <p className="mt-3 text-xs text-gray-500">
            Lien : {p.cible_type === 'produit' ? `produit « ${p.produit_nom ?? 'supprimé'} »` : 'votre boutique'}
          </p>
        </aside>
      </div>
    </div>
  );
}

export default function DetailBannierePage() {
  const params = useParams();
  return (
    <BoostPageShell titre="Bannière sur Marché 241" sousTitre="Suivi de votre mise en avant" sousChemin={`/boost/plateforme/${params.id}`}>
      {(ctx) => (
        <Suspense fallback={null}>
          <DetailContenu ctx={ctx} />
        </Suspense>
      )}
    </BoostPageShell>
  );
}
