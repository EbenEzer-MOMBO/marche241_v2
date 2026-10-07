'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  CalendarDays,
  ChevronRight,
  CircleHelp,
  Eye,
  Megaphone,
  MessageCircle,
  MousePointerClick,
  Plus,
  Users
} from 'lucide-react';
import BoostPageShell, { BoostPageContexte } from '@/components/admin/boost/BoostPageShell';
import StatutBoostBadge from '@/components/admin/boost/StatutBoostBadge';
import ListeBannieres from '@/components/admin/boost/plateforme/ListeBannieres';
import VisiteGuidee, { EtapeVisite } from '@/components/admin/guide/VisiteGuidee';
import { useGuide } from '@/hooks/useGuide';
import type { ObjectifBoost, StatutBoost } from '@/lib/database-types';
import {
  BoostListe,
  formaterFcfa,
  formaterNombre,
  getBoostsBoutique,
  getParametresBoost,
  messageErreur,
  ParametresBoost
} from '@/lib/services/boosts';

const OBJECTIFS: Record<ObjectifBoost, { libelle: string; icone: typeof Eye }> = {
  trafic: { libelle: 'Visites', icone: MousePointerClick },
  whatsapp: { libelle: 'Messages WhatsApp', icone: MessageCircle },
  notoriete: { libelle: 'Visibilité', icone: Eye }
};

/** Statuts où le vendeur a payé (le budget est engagé). */
const STATUTS_PAYES: StatutBoost[] = ['en_attente_validation', 'erreur', 'actif', 'en_pause', 'termine'];

function formaterDate(d: Date | string | null | undefined): string {
  if (!d) return '';
  return new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
}

function resumeAudience(b: BoostListe, parametres: ParametresBoost | null): string {
  const c = b.ciblage;
  if (!c) return '';
  const nomVille = (cle: string) => parametres?.villes.find((v) => v.cle === cle)?.nom ?? cle;
  const nomPays = (code: string) => parametres?.pays.find((p) => p.code === code)?.nom ?? code;
  const lieux = c.villes?.length ? c.villes.map(nomVille) : (c.pays?.length ? c.pays : ['GA']).map(nomPays);
  const lieu = lieux.length > 2 ? `${lieux.slice(0, 2).join(', ')} +${lieux.length - 2}` : lieux.join(', ');
  const sexe = c.sexes?.length === 1 ? (c.sexes[0] === 'femme' ? ' · femmes' : ' · hommes') : '';
  return `${lieu} · ${c.age_min ?? 18}–${c.age_max ?? 65} ans${sexe}`;
}

/** Ce que le vendeur doit savoir ou faire ensuite, selon le statut. */
function prochaineEtape(b: BoostListe): { texte: string; ton: 'neutre' | 'action' | 'alerte' | 'ok' } | null {
  if (b.statut_remboursement === 'a_rembourser' && b.montant_a_rembourser_fcfa > 0) {
    return { texte: `Remboursement de ${formaterFcfa(b.montant_a_rembourser_fcfa)} en cours`, ton: 'action' };
  }
  if (b.statut_remboursement === 'rembourse' && b.montant_a_rembourser_fcfa > 0) {
    return { texte: `${formaterFcfa(b.montant_a_rembourser_fcfa)} remboursés`, ton: 'ok' };
  }
  switch (b.statut) {
    case 'brouillon': {
      const etape = Math.min(Math.max(b.ciblage?.etape_wizard ?? 1, 1), 3);
      return { texte: `À compléter · étape ${etape} sur 4`, ton: 'action' };
    }
    case 'en_attente_paiement':
      return { texte: 'Paiement à finaliser pour lancer la validation', ton: 'action' };
    case 'en_attente_validation':
    case 'erreur':
      return { texte: 'Payée · en cours de vérification par l’équipe Marché 241', ton: 'neutre' };
    case 'refuse':
      return { texte: b.note_revue ? `Motif : ${b.note_revue}` : 'Publicité refusée', ton: 'alerte' };
    case 'rejete_meta':
      return { texte: b.note_revue ? `Motif Meta : ${b.note_revue}` : 'Publicité refusée par Meta', ton: 'alerte' };
    case 'actif':
      return b.date_fin ? { texte: `En ligne jusqu’au ${formaterDate(b.date_fin)}`, ton: 'ok' } : null;
    case 'en_pause':
      return { texte: 'Diffusion en pause : reprenez-la depuis le détail', ton: 'action' };
    case 'termine':
      return b.date_cloture ? { texte: `Terminée le ${formaterDate(b.date_cloture)}`, ton: 'neutre' } : null;
    default:
      return null;
  }
}

const TONS = {
  neutre: 'text-gray-600',
  action: 'text-amber-700',
  alerte: 'text-red-700',
  ok: 'text-green-700'
} as const;

function Tuile({ libelle, valeur, aide }: { libelle: string; valeur: string; aide?: string }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-3 sm:p-4">
      <p className="text-xs text-gray-500">{libelle}</p>
      <p className="mt-1 text-lg sm:text-xl font-bold text-gray-900">{valeur}</p>
      {aide && <p className="mt-0.5 text-xs text-gray-400">{aide}</p>}
    </div>
  );
}

/** Visite guidée de la page : les étapes sans cible présente (liste vide…) sont sautées. */
const ETAPES_VISITE: EtapeVisite[] = [
  {
    titre: 'Nouveau : vos publicités Facebook & Instagram',
    texte: (
      <>
        Faites connaître votre boutique ou un produit auprès de milliers de personnes au Gabon, sans compte publicitaire :
        Marché 241 crée et diffuse la publicité pour vous.
      </>
    )
  },
  {
    cible: 'boost-nouvelle',
    titre: 'Créez une publicité en quelques minutes',
    texte: 'Choisissez quoi promouvoir, votre audience et votre budget, à partir de 3 000 FCFA. Le brouillon est enregistré automatiquement.'
  },
  {
    cible: 'boost-vide',
    titre: 'Lancez votre première publicité',
    texte: 'Ce bouton ouvre le même parcours guidé, étape par étape.'
  },
  {
    cible: 'boost-resume',
    titre: 'Vos résultats en un coup d’œil',
    texte: 'Publicités en ligne, brouillons à finaliser, budget investi et vues obtenues, toutes publicités confondues.'
  },
  {
    cible: 'boost-carte',
    titre: 'Le suivi de chaque publicité',
    texte: 'Objectif, audience, budget dépensé, vues et clics. La ligne en couleur indique la prochaine étape : finaliser, payer, attendre la validation…'
  },
  {
    titre: 'Comment ça marche',
    texte: (
      <ol className="list-decimal space-y-1 pl-4">
        <li>Vous payez par mobile money ou carte.</li>
        <li>L’équipe Marché 241 vérifie la publicité.</li>
        <li>Elle est diffusée sur Facebook et Instagram ; vous suivez vues et clics ici.</li>
        <li>En cas de refus ou de budget non dépensé, la différence vous est remboursée (hors frais d’encaissement).</li>
      </ol>
    )
  }
];

function ListeBoosts({ ctx, rejouer }: { ctx: BoostPageContexte; rejouer: number }) {
  const { boutique, erreur } = ctx;
  const router = useRouter();
  const [boosts, setBoosts] = useState<BoostListe[] | null>(null);
  const [parametres, setParametres] = useState<ParametresBoost | null>(null);
  const guide = useGuide('publicite');
  const [visite, setVisite] = useState(false);

  // Premier passage : la visite démarre seule une fois la liste affichée (cibles présentes)
  useEffect(() => {
    if (guide.pret && !guide.vue && boosts !== null) setVisite(true);
  }, [guide.pret, guide.vue, boosts]);

  useEffect(() => {
    if (rejouer > 0) setVisite(true);
  }, [rejouer]);

  const passer = () => {
    setVisite(false);
    void guide.enregistrer('ignore');
  };
  const terminer = () => {
    setVisite(false);
    void guide.enregistrer('termine');
    router.push(`/admin/${boutique.slug}/boost/new`);
  };
  const fenetreVisite = (
    <VisiteGuidee ouverte={visite} etapes={ETAPES_VISITE} libelleFin="Créer ma publicité" onPasser={passer} onTerminer={terminer} />
  );

  useEffect(() => {
    getBoostsBoutique(boutique.id)
      .then(setBoosts)
      .catch((err) => {
        erreur(messageErreur(err, 'Impossible de charger vos publicités'));
        setBoosts([]);
      });
    // Uniquement pour afficher les noms de pays et de villes : sans eux, les codes restent lisibles
    getParametresBoost().then(setParametres).catch(() => setParametres(null));
  }, [boutique.id, erreur]);

  const resume = useMemo(() => {
    const liste = boosts ?? [];
    return {
      enLigne: liste.filter((b) => b.statut === 'actif').length,
      aFinaliser: liste.filter((b) => b.statut === 'brouillon' || b.statut === 'en_attente_paiement').length,
      investi: liste.filter((b) => STATUTS_PAYES.includes(b.statut)).reduce((s, b) => s + b.total_fcfa, 0),
      vues: liste.reduce((s, b) => s + (b.totaux?.impressions ?? 0), 0),
      clics: liste.reduce((s, b) => s + (b.totaux?.clics ?? 0) + (b.totaux?.messages ?? 0), 0)
    };
  }, [boosts]);

  if (boosts === null) {
    return (
      <div className="flex justify-center py-16">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-black"></div>
      </div>
    );
  }

  if (boosts.length === 0) {
    return (
      <>
      {fenetreVisite}
      <div className="mx-auto max-w-xl rounded-xl border border-dashed border-gray-300 bg-white p-8 sm:p-10 text-center">
        <Megaphone className="mx-auto mb-3 h-12 w-12 text-gray-300" />
        <p className="font-medium text-gray-900">Aucune publicité Facebook ou Instagram pour le moment</p>
        <p className="mt-1 text-sm text-gray-500">
          Faites connaître votre boutique sur Facebook et Instagram à partir de 3 000 FCFA. Marché 241 s’occupe de tout.
        </p>
        <Link
          href={`/admin/${boutique.slug}/boost/new`}
          data-guide="boost-vide"
          className="mt-5 inline-flex items-center gap-2 rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
        >
          <Plus className="h-4 w-4" /> Créer ma première publicité
        </Link>
      </div>
      <div className="mt-6">
        <ListeBannieres boutique={boutique} erreur={erreur} />
      </div>
      </>
    );
  }

  return (
    <div className="space-y-4">
      {fenetreVisite}
      <div data-guide="boost-resume" className="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-4">
        <Tuile libelle="En ligne" valeur={String(resume.enLigne)} aide={`${boosts.length} publicité${boosts.length > 1 ? 's' : ''} au total`} />
        <Tuile libelle="À finaliser" valeur={String(resume.aFinaliser)} aide="Brouillons et paiements en attente" />
        <Tuile libelle="Budget investi" valeur={formaterFcfa(resume.investi)} aide="Publicités payées" />
        <Tuile libelle="Vues" valeur={formaterNombre(resume.vues)} aide={`${formaterNombre(resume.clics)} clics et messages`} />
      </div>

      <div className="space-y-3">
        {boosts.map((b, i) => {
          const lien =
            b.statut === 'brouillon' || b.statut === 'en_attente_paiement'
              ? `/admin/${boutique.slug}/boost/new?draftId=${b.id}`
              : `/admin/${boutique.slug}/boost/${b.id}`;
          const diffusee = b.statut === 'actif' || b.statut === 'en_pause' || b.statut === 'termine';
          const pourcentage = b.budget_media_fcfa > 0 ? Math.min(100, Math.round((b.depense_fcfa / b.budget_media_fcfa) * 100)) : 0;
          const objectif = OBJECTIFS[b.objectif] ?? OBJECTIFS.trafic;
          const IconeObjectif = objectif.icone;
          const etape = prochaineEtape(b);
          const audience = resumeAudience(b, parametres);
          const reaction = b.objectif === 'whatsapp' ? b.totaux?.messages ?? 0 : b.totaux?.clics ?? 0;
          return (
            <Link
              key={b.id}
              href={lien}
              data-guide={i === 0 ? 'boost-carte' : undefined}
              className="group flex items-start gap-3 rounded-xl border border-gray-200 bg-white p-3 sm:p-4 shadow-sm transition hover:shadow-md"
            >
              <div className="h-16 w-16 sm:h-20 sm:w-28 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                {b.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={b.image_url} alt="" className="h-full w-full object-cover" />
                ) : (
                  <Megaphone className="m-auto mt-5 h-6 w-6 text-gray-300" />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <p className="truncate font-semibold text-gray-900">{b.titre || b.nom}</p>
                  <StatutBoostBadge statut={b.statut} />
                </div>

                <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-gray-600">
                  <span className="inline-flex items-center gap-1">
                    <IconeObjectif className="h-3.5 w-3.5 text-gray-400" /> {objectif.libelle}
                  </span>
                  <span className="truncate">{b.type_cible === 'produit' ? `Produit : ${b.produit_nom ?? 'produit supprimé'}` : 'Toute la boutique'}</span>
                  {audience && (
                    <span className="inline-flex items-center gap-1">
                      <Users className="h-3.5 w-3.5 text-gray-400" /> {audience}
                    </span>
                  )}
                </p>

                <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-gray-500">
                  <span className="font-medium text-gray-800">{formaterFcfa(b.total_fcfa)}</span>
                  <span>{b.duree_jours} jours</span>
                  {b.date_debut ? (
                    <span className="inline-flex items-center gap-1">
                      <CalendarDays className="h-3.5 w-3.5 text-gray-400" /> du {formaterDate(b.date_debut)} au {formaterDate(b.date_fin)}
                    </span>
                  ) : (
                    <span>Modifiée le {formaterDate(b.date_modification)}</span>
                  )}
                </p>

                {diffusee && (
                  <div className="mt-2 space-y-1">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-full max-w-[220px] overflow-hidden rounded-full bg-gray-100">
                        <div className="h-full rounded-full bg-black" style={{ width: `${pourcentage}%` }} />
                      </div>
                      <span className="text-xs text-gray-500">
                        {formaterFcfa(b.depense_fcfa)} sur {formaterFcfa(b.budget_media_fcfa)} dépensés
                      </span>
                    </div>
                    <p className="text-xs text-gray-600">
                      <strong className="text-gray-900">{formaterNombre(b.totaux?.impressions ?? 0)}</strong> vues ·{' '}
                      <strong className="text-gray-900">{formaterNombre(reaction)}</strong>{' '}
                      {b.objectif === 'whatsapp' ? 'messages' : 'clics'}
                    </p>
                  </div>
                )}

                {etape && <p className={`mt-1.5 text-xs font-medium ${TONS[etape.ton]}`}>{etape.texte}</p>}
              </div>

              <ChevronRight className="mt-1 h-5 w-5 flex-shrink-0 text-gray-400 group-hover:text-gray-700" />
            </Link>
          );
        })}
      </div>

      <ListeBannieres boutique={boutique} erreur={erreur} />
    </div>
  );
}

export default function BoostsPage() {
  const [rejouer, setRejouer] = useState(0);
  return (
    <BoostPageShell
      titre="Publicité"
      sousTitre="Vos publicités Facebook, Instagram et sur Marché 241"
      sousChemin="/boost"
      actions={({ boutique }) => (
        <div className="flex flex-shrink-0 items-center gap-1 sm:gap-2">
          <button
            type="button"
            onClick={() => setRejouer((n) => n + 1)}
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900"
            aria-label="Revoir la présentation"
            title="Revoir la présentation"
          >
            <CircleHelp className="h-5 w-5" />
          </button>
          <Link
            href={`/admin/${boutique.slug}/boost/new`}
            data-guide="boost-nouvelle"
            className="inline-flex items-center gap-2 rounded-lg bg-black px-3 py-2 lg:px-4 text-sm font-medium text-white hover:bg-gray-800"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Nouvelle publicité</span>
          </Link>
        </div>
      )}
    >
      {(ctx) => <ListeBoosts ctx={ctx} rejouer={rejouer} />}
    </BoostPageShell>
  );
}
