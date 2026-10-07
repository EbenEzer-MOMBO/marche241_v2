'use client';

import { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ArrowLeft, Eye, Loader2, MessageCircle, MousePointerClick, Pause, Play, Users, Wallet } from 'lucide-react';
import BoostPageShell, { BoostPageContexte } from '@/components/admin/boost/BoostPageShell';
import StatutBoostBadge from '@/components/admin/boost/StatutBoostBadge';
import AdPreview from '@/components/admin/boost/AdPreview';
import {
  DetailBoost,
  formaterFcfa,
  formaterNombre,
  getDetailBoost,
  mettreEnPauseBoost,
  messageErreur,
  reprendreBoost
} from '@/lib/services/boosts';
import { verifierPaiementEnBoucle } from '@/lib/services/paiements';

const LIBELLES_EVENEMENTS: Record<string, string> = {
  creation: 'Brouillon créé',
  soumission: 'Publicité finalisée',
  paiement_confirme: 'Paiement reçu',
  publie: 'Validée et publiée sur Facebook & Instagram',
  refuse: 'Refusée par l’équipe Marché 241',
  rejete_meta: 'Refusée par Meta',
  pause: 'Mise en pause',
  reprise: 'Diffusion reprise',
  termine: 'Diffusion terminée',
  rembourse: 'Remboursement effectué'
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
      <p className="mt-1 text-lg sm:text-xl font-bold text-gray-900">{valeur}</p>
    </div>
  );
}

function DetailContenu({ ctx }: { ctx: BoostPageContexte }) {
  const { boutique, succes, erreur } = ctx;
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const boostId = Number(params.id);
  const [detail, setDetail] = useState<DetailBoost | null>(null);
  const [action, setAction] = useState(false);
  const [verificationCarte, setVerificationCarte] = useState(false);
  const verificationLancee = useRef(false);

  const charger = useCallback(async () => {
    try {
      setDetail(await getDetailBoost(boostId));
    } catch (err) {
      erreur(messageErreur(err, 'Publicité introuvable'));
      router.push(`/admin/${boutique.slug}/boost`);
    }
  }, [boostId, boutique.slug, erreur, router]);

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
        if (r.status === 'paye' || r.status === 'paid' || r.status === 'processed') succes('Paiement reçu : votre publicité est en cours de validation', 'Paiement confirmé');
        else erreur(r.message || 'Paiement par carte non confirmé');
      })
      .catch(() => erreur('Vérification du paiement impossible'))
      .finally(() => {
        setVerificationCarte(false);
        router.replace(`/admin/${boutique.slug}/boost/${boostId}`);
        void charger();
      });
  }, [searchParams, boostId, boutique.slug, router, charger, succes, erreur]);

  const basculerPause = async () => {
    if (!detail) return;
    setAction(true);
    try {
      const b = detail.boost.statut === 'actif' ? await mettreEnPauseBoost(boostId) : await reprendreBoost(boostId);
      succes(b.statut === 'en_pause' ? 'Publicité mise en pause' : 'Diffusion reprise');
      await charger();
    } catch (err) {
      erreur(messageErreur(err, 'Action impossible'));
    } finally {
      setAction(false);
    }
  };

  if (!detail) {
    return (
      <div className="flex justify-center py-16">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-black"></div>
      </div>
    );
  }

  const { boost, totaux, insights, evenements } = detail;
  const pourcentage = boost.budget_media_fcfa > 0 ? Math.min(100, Math.round((boost.depense_fcfa / boost.budget_media_fcfa) * 100)) : 0;
  const donneesGraphe = insights.map((i) => ({
    date: new Date(i.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }),
    impressions: i.impressions,
    clics: i.clics
  }));

  let bandeau: { classe: string; texte: string } | null = null;
  if (verificationCarte) bandeau = { classe: 'bg-blue-50 text-blue-800', texte: 'Vérification de votre paiement par carte…' };
  else if (boost.statut === 'en_attente_validation' || boost.statut === 'erreur')
    bandeau = { classe: 'bg-amber-50 text-amber-800', texte: 'Paiement reçu. L’équipe Marché 241 vérifie votre publicité avant sa diffusion (généralement sous 24 h).' };
  else if (boost.statut === 'refuse' || boost.statut === 'rejete_meta')
    bandeau = { classe: 'bg-red-50 text-red-800', texte: `Publicité refusée${boost.note_revue ? ` : ${boost.note_revue}` : '.'}` };
  else if (boost.statut === 'en_attente_paiement')
    bandeau = { classe: 'bg-yellow-50 text-yellow-800', texte: 'Paiement non finalisé.' };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link href={`/admin/${boutique.slug}/boost`} className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-black">
          <ArrowLeft className="h-4 w-4" /> Mes publicités
        </Link>
        {(boost.statut === 'actif' || boost.statut === 'en_pause') && (
          <button
            type="button"
            onClick={() => void basculerPause()}
            disabled={action}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-800 hover:bg-gray-50 disabled:opacity-50"
          >
            {action ? <Loader2 className="h-4 w-4 animate-spin" /> : boost.statut === 'actif' ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            {boost.statut === 'actif' ? 'Mettre en pause' : 'Reprendre'}
          </button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <h2 className="text-lg font-semibold text-gray-900">{boost.titre || boost.nom}</h2>
        <StatutBoostBadge statut={boost.statut} />
      </div>

      {bandeau && (
        <div className={`flex items-center gap-2 rounded-lg px-4 py-3 text-sm ${bandeau.classe}`}>
          {verificationCarte && <Loader2 className="h-4 w-4 animate-spin" />}
          {bandeau.texte}
        </div>
      )}
      {boost.statut_remboursement === 'a_rembourser' && (
        <div className="rounded-lg bg-blue-50 px-4 py-3 text-sm text-blue-800">
          Remboursement de <strong>{formaterFcfa(boost.montant_a_rembourser_fcfa)}</strong> en cours : il vous sera versé sur votre compte mobile money.
        </div>
      )}
      {boost.statut_remboursement === 'rembourse' && (
        <div className="rounded-lg bg-green-50 px-4 py-3 text-sm text-green-800">
          {formaterFcfa(boost.montant_a_rembourser_fcfa)} vous ont été remboursés.
        </div>
      )}

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="min-w-0 space-y-5">
          <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
            <Indicateur icone={Eye} libelle="Vues" valeur={formaterNombre(totaux.impressions)} />
            <Indicateur icone={Users} libelle="Personnes touchées" valeur={formaterNombre(totaux.portee)} />
            {boost.objectif === 'whatsapp' ? (
              <Indicateur icone={MessageCircle} libelle="Messages" valeur={formaterNombre(totaux.messages)} />
            ) : (
              <Indicateur icone={MousePointerClick} libelle="Clics" valeur={formaterNombre(totaux.clics)} />
            )}
            <Indicateur icone={Wallet} libelle="Budget dépensé" valeur={formaterFcfa(boost.depense_fcfa)} />
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Budget publicitaire</span>
              <span className="font-medium text-gray-900">{formaterFcfa(boost.depense_fcfa)} / {formaterFcfa(boost.budget_media_fcfa)}</span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-gray-100">
              <div className="h-full rounded-full bg-black" style={{ width: `${pourcentage}%` }} />
            </div>
            <p className="mt-2 text-xs text-gray-500">
              {boost.date_debut
                ? `Diffusion du ${formaterDateHeure(boost.date_debut)} au ${formaterDateHeure(boost.date_fin)}`
                : `${boost.duree_jours} jours de diffusion après validation`}
              {boost.date_derniere_synchro ? ` · statistiques mises à jour le ${formaterDateHeure(boost.date_derniere_synchro)}` : ''}
            </p>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-4">
            <p className="mb-3 text-sm font-semibold text-gray-900">Vues par jour</p>
            {donneesGraphe.length ? (
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={donneesGraphe}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                    <XAxis dataKey="date" stroke="#9ca3af" tick={{ fill: '#6b7280', fontSize: 12 }} />
                    <YAxis stroke="#9ca3af" tick={{ fill: '#6b7280', fontSize: 12 }} width={48} />
                    <Tooltip formatter={(v: number) => formaterNombre(v)} />
                    <Bar dataKey="impressions" name="Vues" fill="#111827" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="py-8 text-center text-sm text-gray-500">
                {boost.date_debut ? 'Aucune statistique disponible pour le moment.' : 'Les statistiques apparaîtront après le début de la diffusion.'}
              </p>
            )}
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-4">
            <p className="mb-3 text-sm font-semibold text-gray-900">Historique</p>
            <ol className="space-y-3">
              {evenements.map((e) => (
                <li key={e.id} className="flex items-start gap-3 text-sm">
                  <span className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-gray-400" />
                  <div>
                    <p className="text-gray-900">{LIBELLES_EVENEMENTS[e.type_evenement] ?? e.type_evenement}</p>
                    <p className="text-xs text-gray-500">{formaterDateHeure(e.date_creation)}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>

        <aside className="space-y-3">
          <AdPreview titre={boost.titre ?? ''} texte={boost.texte_principal ?? ''} description={boost.description} imageUrl={boost.image_url} objectif={boost.objectif} />
          <div className="rounded-xl border border-gray-200 bg-white p-4 text-sm">
            <dl className="space-y-1.5">
              <div className="flex justify-between"><dt className="text-gray-600">Payé</dt><dd className="font-medium">{formaterFcfa(boost.total_fcfa)}</dd></div>
              <div className="flex justify-between"><dt className="text-gray-600">dont budget Meta</dt><dd>{formaterFcfa(boost.budget_media_fcfa)}</dd></div>
              <div className="flex justify-between"><dt className="text-gray-600">dont frais de gestion</dt><dd>{formaterFcfa(boost.commission_fcfa)}</dd></div>
            </dl>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default function DetailBoostPage() {
  const params = useParams();
  return (
    <BoostPageShell titre="Publicité" sousTitre="Suivi de votre publicité Facebook & Instagram" sousChemin={`/boost/${params.id}`}>
      {(ctx) => (
        <Suspense fallback={null}>
          <DetailContenu ctx={ctx} />
        </Suspense>
      )}
    </BoostPageShell>
  );
}
