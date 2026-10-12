'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import SafeImage from '@/components/SafeImage';
import { useParams, useRouter } from 'next/navigation';
import { Flag, Info, Menu, MessageSquareReply, MessageSquareText, Star } from 'lucide-react';
import Sidebar from '@/components/admin/Sidebar';
import { ToastContainer } from '@/components/ui/Toast';
import { useToast } from '@/hooks/useToast';
import { useAuth } from '@/hooks/useAuth';
import { BoutiqueData } from '@/lib/services/auth';
import { Etoiles } from '@/components/avis/Etoiles';
import { getProduitImageUrl } from '@/lib/services/produits';
import { AvisErreur, getAvisVendeur, repondreAvis, signalerAvis, type FiltresAvisVendeur, type Pagination } from '@/lib/services/avis';
import type { AvisDetaille, StatutAvis } from '@/lib/database-types';

type Onglet = 'publies' | 'sans_reponse' | 'en_attente' | 'rejetes';

const ONGLETS: Array<{ code: Onglet; libelle: string; filtres: FiltresAvisVendeur }> = [
  { code: 'publies', libelle: 'Publiés', filtres: { statut: 'approuve' } },
  { code: 'sans_reponse', libelle: 'Sans réponse', filtres: { sans_reponse: true } },
  { code: 'en_attente', libelle: 'En vérification', filtres: { statut: 'en_attente' } },
  { code: 'rejetes', libelle: 'Non publiés', filtres: { statut: 'rejete' } },
];

const BADGES_STATUT: Record<StatutAvis, { libelle: string; classe: string }> = {
  approuve: { libelle: 'Publié', classe: 'bg-green-50 text-green-700' },
  en_attente: { libelle: 'En vérification', classe: 'bg-amber-50 text-amber-700' },
  rejete: { libelle: 'Non publié', classe: 'bg-gray-100 text-gray-600' },
};

const DELAI_MODIFICATION_H = 48;

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });

function reponseModifiable(avis: AvisDetaille): boolean {
  if (!avis.date_reponse_vendeur) return true;
  return Date.now() - new Date(avis.date_reponse_vendeur).getTime() < DELAI_MODIFICATION_H * 3600_000;
}

function CarteAvis({
  avis,
  onMaj,
  notifierSucces,
  notifierErreur,
}: {
  avis: AvisDetaille;
  onMaj: (avis: AvisDetaille) => void;
  notifierSucces: (m: string) => void;
  notifierErreur: (m: string) => void;
}) {
  const [mode, setMode] = useState<'aucun' | 'reponse' | 'signalement'>('aucun');
  const [texte, setTexte] = useState('');
  const [envoi, setEnvoi] = useState(false);
  const badge = BADGES_STATUT[avis.statut];
  const peutRepondre = avis.statut === 'approuve' && reponseModifiable(avis);
  const peutSignaler = avis.statut !== 'rejete' && !avis.signale_par_vendeur;

  const ouvrir = (m: 'reponse' | 'signalement') => {
    setMode(m);
    setTexte(m === 'reponse' ? avis.reponse_vendeur ?? '' : '');
  };

  const valider = async () => {
    const valeur = texte.trim();
    if (mode === 'reponse' && valeur.length < 2) return notifierErreur('Écrivez votre réponse (2 caractères minimum).');
    if (mode === 'signalement' && valeur.length < 5) return notifierErreur('Expliquez le problème (5 caractères minimum).');
    setEnvoi(true);
    try {
      const maj = mode === 'reponse' ? await repondreAvis(avis.id, valeur) : await signalerAvis(avis.id, valeur);
      onMaj(maj);
      setMode('aucun');
      notifierSucces(mode === 'reponse' ? 'Réponse publiée' : "Avis signalé à l'équipe Marché 241");
    } catch (err) {
      notifierErreur(err instanceof AvisErreur ? err.message : 'Une erreur est survenue');
    } finally {
      setEnvoi(false);
    }
  };

  return (
    <li className="rounded-xl border border-gray-200 bg-white p-4 sm:p-5">
      <div className="flex items-start gap-3">
        <div className="h-11 w-11 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
          {avis.produit_image ? (
            <SafeImage src={getProduitImageUrl(avis.produit_image)} alt="" width={44} height={44} className="h-full w-full object-cover" />
          ) : null}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <p className="truncate text-sm font-semibold text-gray-900">{avis.produit_nom}</p>
            <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${badge.classe}`}>{badge.libelle}</span>
            {avis.signale_par_vendeur && (
              <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-[11px] font-medium text-red-700">
                <Flag className="h-3 w-3" aria-hidden="true" /> Signalé
              </span>
            )}
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-gray-500">
            <Etoiles note={avis.note} taille={14} />
            <span className="font-medium text-gray-700">{avis.auteur}</span>
            <span>· {formatDate(avis.date_creation)}</span>
            {avis.numero_commande && <span className="font-mono">· {avis.numero_commande}</span>}
          </div>
        </div>
      </div>

      {avis.commentaire ? (
        <p className="mt-3 whitespace-pre-line break-words text-sm leading-relaxed text-gray-800">{avis.commentaire}</p>
      ) : (
        <p className="mt-3 text-sm italic text-gray-400">Note sans commentaire</p>
      )}

      {avis.statut === 'en_attente' && (
        <p className="mt-3 text-xs text-gray-500">L&apos;équipe Marché 241 vérifie cet avis avant publication.</p>
      )}

      {avis.reponse_vendeur && mode !== 'reponse' && (
        <div className="mt-3 rounded-lg border-l-2 border-gray-300 bg-gray-50 px-3 py-2">
          <p className="text-xs font-semibold text-gray-700">Votre réponse</p>
          <p className="mt-0.5 whitespace-pre-line break-words text-sm text-gray-700">{avis.reponse_vendeur}</p>
        </div>
      )}

      {avis.signale_par_vendeur && avis.motif_signalement && (
        <p className="mt-2 text-xs text-gray-500">Motif du signalement : {avis.motif_signalement}</p>
      )}

      {mode !== 'aucun' ? (
        <div className="mt-3">
          <label htmlFor={`texte-${avis.id}`} className="text-xs font-medium text-gray-700">
            {mode === 'reponse' ? 'Votre réponse publique' : 'Pourquoi signalez-vous cet avis ?'}
          </label>
          <textarea
            id={`texte-${avis.id}`}
            value={texte}
            onChange={(e) => setTexte(e.target.value.slice(0, mode === 'reponse' ? 1000 : 500))}
            rows={3}
            disabled={envoi}
            placeholder={
              mode === 'reponse'
                ? 'Remerciez le client ou apportez une précision, avec courtoisie.'
                : 'Ex. : ce client parle d’un autre produit, propos injurieux…'
            }
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
          />
          {mode === 'reponse' && (
            <p className="mt-1 text-[11px] text-gray-500">
              Visible par tous sur la fiche produit. Modifiable pendant {DELAI_MODIFICATION_H} h.
            </p>
          )}
          <div className="mt-2 flex gap-2">
            <button
              type="button"
              onClick={valider}
              disabled={envoi}
              className="h-9 rounded-lg bg-gray-900 px-4 text-sm font-medium text-white disabled:opacity-60"
            >
              {envoi ? 'Envoi…' : mode === 'reponse' ? 'Publier la réponse' : 'Envoyer le signalement'}
            </button>
            <button type="button" onClick={() => setMode('aucun')} disabled={envoi} className="h-9 rounded-lg px-3 text-sm text-gray-600 hover:bg-gray-100">
              Annuler
            </button>
          </div>
        </div>
      ) : (
        (peutRepondre || peutSignaler) && (
          <div className="mt-3 flex flex-wrap gap-2 border-t border-gray-100 pt-3">
            {peutRepondre && (
              <button
                type="button"
                onClick={() => ouvrir('reponse')}
                className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-gray-300 px-3 text-sm font-medium text-gray-800 hover:bg-gray-50"
              >
                <MessageSquareReply className="h-4 w-4" aria-hidden="true" />
                {avis.reponse_vendeur ? 'Modifier la réponse' : 'Répondre'}
              </button>
            )}
            {peutSignaler && (
              <button
                type="button"
                onClick={() => ouvrir('signalement')}
                className="inline-flex h-9 items-center gap-1.5 rounded-lg px-3 text-sm text-gray-600 hover:bg-gray-100"
              >
                <Flag className="h-4 w-4" aria-hidden="true" />
                Signaler
              </button>
            )}
          </div>
        )
      )}
    </li>
  );
}

export default function AvisVendeurPage() {
  const router = useRouter();
  const params = useParams();
  const boutiqueSlug = params.boutique as string;
  const { user, verifierBoutique } = useAuth();
  const { toasts, removeToast, success, error: showError } = useToast();

  const [boutique, setBoutique] = useState<BoutiqueData | null>(null);
  const [chargementBoutique, setChargementBoutique] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [onglet, setOnglet] = useState<Onglet>('publies');
  const [avis, setAvis] = useState<AvisDetaille[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [sansReponse, setSansReponse] = useState(0);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState(false);
  // Numéro de la dernière requête : une réponse plus ancienne (changement d'onglet rapide) est ignorée
  const requeteRef = useRef(0);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (!user) {
        router.push('/admin/login');
        return;
      }
      try {
        const data = await verifierBoutique();
        if (!data) {
          router.push('/admin/boutique/create');
          return;
        }
        if (boutiqueSlug !== data.slug) {
          router.replace(`/admin/${data.slug}/avis`);
          return;
        }
        setBoutique(data);
      } catch {
        showError('Erreur lors du chargement de la boutique');
      } finally {
        setChargementBoutique(false);
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [user, boutiqueSlug, router]); // eslint-disable-line react-hooks/exhaustive-deps

  const charger = useCallback(
    async (page = 1) => {
      if (!boutique) return;
      const numero = ++requeteRef.current;
      setChargement(true);
      setErreur(false);
      if (page === 1) setAvis([]);
      try {
        const filtres = ONGLETS.find((o) => o.code === onglet)!.filtres;
        const r = await getAvisVendeur({ ...filtres, boutique_id: boutique.id, page });
        if (numero !== requeteRef.current) return;
        setAvis((prev) => (page === 1 ? r.avis : [...prev, ...r.avis]));
        setPagination(r.pagination);
        setSansReponse(r.sansReponse);
      } catch {
        if (numero === requeteRef.current) setErreur(true);
      } finally {
        if (numero === requeteRef.current) setChargement(false);
      }
    },
    [boutique, onglet]
  );

  useEffect(() => {
    void charger(1);
  }, [charger]);

  const majAvis = (maj: AvisDetaille) => {
    setAvis((prev) => prev.map((a) => (a.id === maj.id ? maj : a)));
    if (maj.reponse_vendeur && onglet === 'sans_reponse') {
      setAvis((prev) => prev.filter((a) => a.id !== maj.id));
      setSansReponse((n) => Math.max(0, n - 1));
    }
  };

  if (chargementBoutique) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-black" />
          <p className="text-gray-600">Chargement…</p>
        </div>
      </div>
    );
  }

  if (!boutique) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-gray-600">Boutique non trouvée</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen max-w-[100vw] overflow-hidden bg-gray-50">
      <ToastContainer toasts={toasts} onClose={removeToast} />
      <Sidebar boutique={boutique} isMobileMenuOpen={isMobileMenuOpen} onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)} />

      <div className="flex min-h-0 w-full flex-1 flex-col">
        <div className="border-b bg-white px-4 py-3 shadow-sm lg:px-6 lg:py-4">
          <div className="flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="mr-3 flex-shrink-0 rounded-lg p-1.5 transition-colors hover:bg-gray-100 lg:hidden"
              aria-label="Ouvrir le menu"
            >
              <Menu className="h-5 w-5 text-gray-600" />
            </button>
            <div className="min-w-0 flex-1">
              <h1 className="truncate text-lg font-bold text-gray-900 lg:text-2xl">Avis clients</h1>
              <p className="mt-0.5 truncate text-xs text-gray-500 lg:mt-1 lg:text-sm">
                Ce que vos acheteurs pensent de vos produits
              </p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto overflow-x-hidden p-3 sm:p-4 lg:p-6">
          <div className="mx-auto max-w-3xl">
            <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
              <div className="rounded-lg border border-gray-200 bg-white p-3 sm:p-4">
                <p className="text-xs font-medium text-gray-500">Note de la boutique</p>
                <div className="mt-1 flex items-center gap-2">
                  <Star className="h-5 w-5 fill-amber-400 text-amber-400" aria-hidden="true" />
                  <span className="text-xl font-bold text-gray-900">
                    {boutique.note_moyenne ? Number(boutique.note_moyenne).toLocaleString('fr-FR', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) : '—'}
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-gray-500">{boutique.nombre_avis ?? 0} avis publiés</p>
              </div>
              <div className="rounded-lg border border-gray-200 bg-white p-3 sm:p-4">
                <p className="text-xs font-medium text-gray-500">Sans réponse</p>
                <p className="mt-1 text-xl font-bold text-gray-900">{sansReponse}</p>
                <p className="mt-0.5 text-xs text-gray-500">avis publiés</p>
              </div>
              <div className="col-span-2 flex gap-2 rounded-lg border border-blue-100 bg-blue-50 p-3 text-xs leading-relaxed text-blue-900 sm:col-span-1">
                <Info className="mt-0.5 h-4 w-4 flex-shrink-0" aria-hidden="true" />
                <p>Seuls vos acheteurs livrés peuvent noter. Vous pouvez répondre ou signaler un avis, pas le supprimer.</p>
              </div>
            </div>

            <div role="tablist" aria-label="Filtrer les avis" className="mb-4 flex gap-1 overflow-x-auto rounded-lg bg-gray-100 p-1">
              {ONGLETS.map((o) => (
                <button
                  key={o.code}
                  role="tab"
                  aria-selected={onglet === o.code}
                  onClick={() => setOnglet(o.code)}
                  className={`h-9 flex-shrink-0 rounded-md px-3 text-sm font-medium transition-colors ${
                    onglet === o.code ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {o.libelle}
                  {o.code === 'sans_reponse' && sansReponse > 0 && (
                    <span className="ml-1.5 rounded-full bg-gray-900 px-1.5 py-0.5 text-[10px] font-semibold text-white">{sansReponse}</span>
                  )}
                </button>
              ))}
            </div>

            {chargement && avis.length === 0 ? (
              <ul className="space-y-3" aria-busy="true">
                {[0, 1, 2].map((i) => (
                  <li key={i} className="h-32 animate-pulse rounded-xl border border-gray-200 bg-white" />
                ))}
              </ul>
            ) : erreur ? (
              <div className="rounded-xl border border-gray-200 bg-white px-4 py-10 text-center">
                <p className="text-sm text-gray-600">Impossible de charger les avis.</p>
                <button type="button" onClick={() => charger(1)} className="mt-3 h-9 rounded-lg bg-gray-900 px-4 text-sm font-medium text-white">
                  Réessayer
                </button>
              </div>
            ) : avis.length === 0 ? (
              <div className="rounded-xl border border-gray-200 bg-white px-4 py-12 text-center">
                <MessageSquareText className="mx-auto h-8 w-8 text-gray-300" aria-hidden="true" />
                <p className="mt-2 text-sm font-medium text-gray-900">
                  {onglet === 'sans_reponse' ? 'Vous avez répondu à tous les avis' : 'Aucun avis ici pour le moment'}
                </p>
                <p className="mx-auto mt-1 max-w-sm text-xs text-gray-500">
                  Vos acheteurs reçoivent une invitation WhatsApp quelques jours après la livraison de leur commande.
                </p>
              </div>
            ) : (
              <>
                <ul className="space-y-3">
                  {avis.map((a) => (
                    <CarteAvis key={a.id} avis={a} onMaj={majAvis} notifierSucces={(m) => success(m)} notifierErreur={(m) => showError(m)} />
                  ))}
                </ul>
                {pagination && pagination.page < pagination.pages && (
                  <button
                    type="button"
                    onClick={() => charger(pagination.page + 1)}
                    disabled={chargement}
                    className="mt-3 h-10 w-full rounded-lg border border-gray-300 bg-white text-sm font-medium text-gray-800 hover:bg-gray-50 disabled:opacity-60"
                  >
                    {chargement ? 'Chargement…' : 'Voir plus'}
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
