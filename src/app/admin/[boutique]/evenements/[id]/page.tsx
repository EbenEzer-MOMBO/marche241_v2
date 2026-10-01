'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  ChevronDown,
  Clock,
  Download,
  Eye,
  Loader2,
  Mail,
  Menu,
  PiggyBank,
  ScanLine,
  Search,
  Send,
  Ticket,
  Undo2,
  X,
  XCircle,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { ToastContainer } from '@/components/ui/Toast';
import ConfirmationModal from '@/components/ui/ConfirmationModal';
import Sidebar from '@/components/admin/Sidebar';
import { EventProductForm } from '@/components/admin/products/EventProductForm';
import { EvenementShareBar } from '@/components/admin/EvenementShareBar';
import { BoutiqueData } from '@/lib/services/auth';
import { getProduitById, modifierProduit } from '@/lib/services/products';
import { getCategoriesParBoutique } from '@/lib/services/categories';
import { getStatistiquesVuesProduit } from '@/lib/services/vues';
import {
  getParticipantsEvenement,
  marquerBilletScanne,
  ParticipantBillet,
  renvoyerEmailBillets,
  StatsEvenement,
} from '@/lib/services/billets';
import { ProduitDB } from '@/lib/database-types';
import { isEvenementProduct } from '@/lib/utils/product-sales-kind';
import {
  buildEventProductApiPayload,
  EventFormPayload,
  eventProductToFormValue,
} from '@/lib/utils/event-product-payload';
import { ProductValidationError } from '@/lib/errors/product-validation-error';

type Onglet = 'details' | 'participants';

/** Billets d'un même acheteur (regroupés par téléphone, à défaut email ou nom). */
interface GroupeAcheteur {
  cle: string;
  nom: string;
  telephone: string;
  email: string | null;
  billets: ParticipantBillet[];
  commandes: Array<{ id: number; numero: string; jeton: string; date: string; billets: ParticipantBillet[] }>;
  nbScannes: number;
  statutPaiement: string;
}

const formatFcfa = (montant: number) =>
  `${new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(montant)} FCFA`;

const formatDateHeure = (iso: string) =>
  new Date(iso).toLocaleString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

const LIBELLES_PAIEMENT: Record<string, string> = {
  paye: 'Payé',
  partiellement_paye: 'Partiellement payé',
  en_attente: 'En attente',
  echec: 'Échec',
  rembourse: 'Remboursé',
};

function echapperCsv(valeur: string | number | null | undefined): string {
  const texte = valeur === null || valeur === undefined ? '' : String(valeur);
  return /[";\n]/.test(texte) ? `"${texte.replace(/"/g, '""')}"` : texte;
}

/** Clé d'acheteur : téléphone sans indicatif ni zéro initial, sinon email, sinon nom. */
function cleAcheteur(p: ParticipantBillet): string {
  const chiffres = (p.client_telephone || '').replace(/\D/g, '').replace(/^241/, '').replace(/^0/, '');
  if (chiffres) return `tel:${chiffres}`;
  if (p.client_email) return `email:${p.client_email.trim().toLowerCase()}`;
  return `nom:${(p.client_nom || '').trim().toLowerCase()}`;
}

function grouperParAcheteur(participants: ParticipantBillet[]): GroupeAcheteur[] {
  const groupes = new Map<string, GroupeAcheteur>();
  // Les participants arrivent du plus récent au plus ancien : le 1er billet d'un
  // acheteur porte ses coordonnées les plus récentes.
  for (const p of participants) {
    const cle = cleAcheteur(p);
    let groupe = groupes.get(cle);
    if (!groupe) {
      groupe = {
        cle,
        nom: p.client_nom,
        telephone: p.client_telephone,
        email: p.client_email,
        billets: [],
        commandes: [],
        nbScannes: 0,
        statutPaiement: 'paye',
      };
      groupes.set(cle, groupe);
    }
    groupe.email = groupe.email || p.client_email;
    groupe.billets.push(p);
    if (p.scanne_le) groupe.nbScannes += 1;
    if (p.statut_paiement !== 'paye') groupe.statutPaiement = p.statut_paiement;

    let commande = groupe.commandes.find((c) => c.id === p.commande_id);
    if (!commande) {
      commande = { id: p.commande_id, numero: p.numero_commande, jeton: p.jeton, date: p.date_commande, billets: [] };
      groupe.commandes.push(commande);
    }
    commande.billets.push(p);
  }
  return Array.from(groupes.values());
}

function resumeTypes(billets: ParticipantBillet[]): string {
  const parType = new Map<string, number>();
  billets.forEach((b) => parType.set(b.type_billet, (parType.get(b.type_billet) || 0) + 1));
  return Array.from(parType.entries())
    .map(([type, n]) => `${n}× ${type}`)
    .join(' · ');
}

export default function EvenementDetailPage() {
  const router = useRouter();
  const params = useParams();
  const boutiqueName = params.boutique as string;
  const produitId = Number(params.id);

  const { user, verifierBoutique } = useAuth();
  const { toasts, removeToast, success, error: showError } = useToast();

  const [boutique, setBoutique] = useState<BoutiqueData | null>(null);
  const [produit, setProduit] = useState<ProduitDB | null>(null);
  const [categories, setCategories] = useState<Array<{ id: number; nom: string; slug: string }>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [onglet, setOnglet] = useState<Onglet>('details');
  const [isSaving, setIsSaving] = useState(false);
  const [isTogglingStatut, setIsTogglingStatut] = useState(false);

  const [participants, setParticipants] = useState<ParticipantBillet[]>([]);
  const [stats, setStats] = useState<StatsEvenement>({
    billets_vendus: 0,
    billets_scannes: 0,
    revenus: 0,
    ventes_par_type: {},
  });
  const [vues, setVues] = useState(0);
  const [recherche, setRecherche] = useState('');
  const [billetsEnCours, setBilletsEnCours] = useState<Set<number>>(new Set());
  const [groupesOuverts, setGroupesOuverts] = useState<Set<string>>(new Set());
  const [emailEnCours, setEmailEnCours] = useState<string | null>(null);
  const [emailAConfirmer, setEmailAConfirmer] = useState<GroupeAcheteur | null>(null);

  const chargerParticipants = useCallback(async () => {
    try {
      const data = await getParticipantsEvenement(produitId);
      setParticipants(data.participants);
      setStats(data.stats);
    } catch (error) {
      console.error('Erreur lors du chargement des participants:', error);
      showError('Impossible de charger les participants');
    }
  }, [produitId, showError]);

  useEffect(() => {
    const charger = async () => {
      if (!user) {
        router.push('/admin/login');
        return;
      }

      try {
        const boutiqueData = await verifierBoutique();
        if (!boutiqueData) {
          router.push('/admin/boutique/create');
          return;
        }
        if (boutiqueName !== boutiqueData.slug) {
          router.replace(`/admin/${boutiqueData.slug}/evenements/${produitId}`);
          return;
        }
        setBoutique(boutiqueData);

        if (Number.isNaN(produitId)) {
          router.replace(`/admin/${boutiqueData.slug}/evenements`);
          return;
        }

        const produitData = await getProduitById(produitId);
        if (produitData.boutique_id !== boutiqueData.id || !isEvenementProduct(produitData)) {
          router.replace(`/admin/${boutiqueData.slug}/evenements`);
          return;
        }
        setProduit(produitData);

        const [categoriesData] = await Promise.all([
          getCategoriesParBoutique(boutiqueData.id).catch(() => []),
          chargerParticipants(),
          getStatistiquesVuesProduit(produitId)
            .then((res) => setVues(res.statistiques?.nombre_vues_total ?? 0))
            .catch(() => setVues(produitData.nombre_vues || 0)),
        ]);
        setCategories(categoriesData);
      } catch (error) {
        console.error("Erreur lors du chargement de l'événement:", error);
        showError("Erreur lors du chargement de l'événement", 'Erreur');
      } finally {
        setIsLoading(false);
      }
    };

    const timer = setTimeout(charger, 100);
    return () => clearTimeout(timer);
  }, [user, boutiqueName, produitId, router, verifierBoutique, showError, chargerParticipants]);

  const productToEdit = useMemo(() => (produit ? eventProductToFormValue(produit) : null), [produit]);
  const estPublie = produit?.statut === 'actif';
  const estEnAttente = produit?.statut === 'en_attente_validation';
  const estBrouillon = produit?.statut === 'brouillon';

  const handleSave = async (data: EventFormPayload) => {
    if (!produit) return;
    setIsSaving(true);
    try {
      const payload = buildEventProductApiPayload(data);
      const misAJour = await modifierProduit(produit.id, {
        nom: payload.nom,
        slug: payload.slug,
        description: payload.description,
        prix: payload.prix,
        prix_promo: payload.prix_original ? payload.prix : null,
        en_stock: payload.en_stock,
        categorie_id: payload.categorie_id,
        images: payload.images,
        image_principale: payload.image_principale,
        variants: payload.variants,
        // Le statut ne change pas à l'enregistrement : la publication est validée par l'équipe Marché 241.
        statut: produit.statut === 'archive' ? undefined : produit.statut,
      });
      setProduit(misAJour);
      success('Événement enregistré', 'Succès');
    } catch (error: unknown) {
      if (error instanceof ProductValidationError) {
        showError(error.message, 'Erreur de validation', 12000);
        return;
      }
      showError(error instanceof Error ? error.message : "Erreur lors de l'enregistrement", 'Erreur');
    } finally {
      setIsSaving(false);
    }
  };

  /** Demande (ou annule la demande) de publication : la mise en ligne est validée par l'équipe. */
  const changerDemandePublication = async () => {
    if (!produit) return;
    setIsTogglingStatut(true);
    try {
      const misAJour = await modifierProduit(produit.id, {
        statut: estEnAttente ? 'brouillon' : 'en_attente_validation',
      });
      setProduit(misAJour);
      success(
        estEnAttente
          ? 'Demande de publication annulée'
          : 'Demande envoyée : l’équipe Marché 241 vérifie votre événement avant sa mise en ligne',
        'Succès'
      );
    } catch (error: unknown) {
      showError(error instanceof Error ? error.message : 'Erreur lors de la mise à jour', 'Erreur');
    } finally {
      setIsTogglingStatut(false);
    }
  };

  /**
   * Marque (ou démarque) des billets comme scannés. Mise à jour optimiste :
   * l'affichage bascule immédiatement, chaque billet en échec revient à son état.
   */
  const changerScan = async (billets: ParticipantBillet[], scanne: boolean) => {
    const cibles = billets.filter((b) => !!b.scanne_le !== scanne && !billetsEnCours.has(b.id));
    if (cibles.length === 0) return;

    const ids = new Set(cibles.map((b) => b.id));
    const anciens = new Map(cibles.map((b) => [b.id, b.scanne_le]));
    const maintenant = new Date().toISOString();

    setBilletsEnCours((prev) => new Set([...prev, ...ids]));
    setParticipants((prev) => prev.map((p) => (ids.has(p.id) ? { ...p, scanne_le: scanne ? maintenant : null } : p)));

    const resultats = await Promise.allSettled(cibles.map((b) => marquerBilletScanne(b.id, scanne)));
    const retenus = new Map<number, string | null>();
    let echecs = 0;
    resultats.forEach((r, i) => {
      const id = cibles[i].id;
      if (r.status === 'fulfilled') {
        retenus.set(id, r.value.scanne_le);
      } else {
        retenus.set(id, anciens.get(id) ?? null);
        echecs += 1;
      }
    });

    setParticipants((prev) => prev.map((p) => (retenus.has(p.id) ? { ...p, scanne_le: retenus.get(p.id) ?? null } : p)));
    setBilletsEnCours((prev) => new Set([...prev].filter((id) => !ids.has(id))));
    if (echecs > 0) {
      showError(`${echecs} billet(s) n'ont pas pu être mis à jour`, 'Erreur');
    }
  };

  // Confirmation via modale (window.confirm est bloqué dans certains navigateurs intégrés).
  const renvoyerEmail = async (groupe: GroupeAcheteur) => {
    if (!groupe.email) return;
    setEmailEnCours(groupe.cle);
    try {
      await Promise.all(groupe.commandes.map((c) => renvoyerEmailBillets(c.id)));
      success(`Billets renvoyés à ${groupe.email}`, 'Email envoyé');
    } catch (error: unknown) {
      showError(error instanceof Error ? error.message : "Erreur lors de l'envoi de l'email", 'Erreur');
    } finally {
      setEmailEnCours(null);
    }
  };

  const basculerGroupe = (cle: string) =>
    setGroupesOuverts((prev) => {
      const suivant = new Set(prev);
      if (suivant.has(cle)) suivant.delete(cle);
      else suivant.add(cle);
      return suivant;
    });

  const groupes = useMemo(() => grouperParAcheteur(participants), [participants]);

  // Un acheteur apparaît s'il correspond, ou si l'un de ses billets correspond : il est alors
  // déplié et seuls les billets correspondants sont listés.
  const groupesFiltres = useMemo(() => {
    type Resultat = { groupe: GroupeAcheteur; billetsVisibles: Set<number> | null };
    const terme = recherche.trim().toLowerCase();
    if (!terme) return groupes.map((g): Resultat => ({ groupe: g, billetsVisibles: null }));
    const correspond = (valeurs: Array<string | null | undefined>) =>
      valeurs.some((v) => !!v && v.toLowerCase().includes(terme));
    return groupes.flatMap((g): Resultat[] => {
      if (correspond([g.nom, g.email, g.telephone])) return [{ groupe: g, billetsVisibles: null }];
      const billets = g.billets.filter((b) => correspond([b.numero_commande, `#${b.numero}`, b.type_billet]));
      return billets.length > 0 ? [{ groupe: g, billetsVisibles: new Set(billets.map((b) => b.id)) }] : [];
    });
  }, [groupes, recherche]);

  const nbScannes = participants.filter((p) => p.scanne_le).length;

  const exporterCsv = () => {
    if (!produit) return;
    const entetes = [
      'N° billet',
      'Type de billet',
      'Acheteur',
      'Email',
      'Téléphone',
      'Commande',
      'Paiement',
      'Scanné le',
      'Enregistré le',
      'Lien billet',
    ];
    const lignes = participants.map((p) =>
      [
        p.numero,
        p.type_billet,
        p.client_nom,
        p.client_email,
        p.client_telephone,
        p.numero_commande,
        LIBELLES_PAIEMENT[p.statut_paiement] || p.statut_paiement,
        p.scanne_le ? formatDateHeure(p.scanne_le) : '',
        formatDateHeure(p.date_creation),
        `${window.location.origin}/billets/${p.jeton}`,
      ]
        .map(echapperCsv)
        .join(';')
    );
    const contenu = '﻿' + [entetes.join(';'), ...lignes].join('\n');
    const blob = new Blob([contenu], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const lien = document.createElement('a');
    lien.href = url;
    lien.download = `participants-${produit.slug || produit.id}.csv`;
    document.body.appendChild(lien);
    lien.click();
    document.body.removeChild(lien);
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement de l’événement...</p>
        </div>
      </div>
    );
  }

  if (!boutique || !produit) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Ticket className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Événement introuvable</p>
        </div>
      </div>
    );
  }

  const renderBadgePaiement = (statut: string) => (
    <span
      className={`whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium ${
        statut === 'paye' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
      }`}
    >
      {LIBELLES_PAIEMENT[statut] || statut}
    </span>
  );

  const renderBoutonScan = (p: ParticipantBillet) => {
    const enCours = billetsEnCours.has(p.id);
    return (
      <button
        onClick={() => changerScan([p], !p.scanne_le)}
        disabled={enCours}
        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium disabled:cursor-wait ${
          p.scanne_le
            ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            : 'bg-black text-white hover:bg-gray-800'
        }`}
      >
        {enCours ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : p.scanne_le ? (
          <Undo2 className="h-3.5 w-3.5" />
        ) : (
          <ScanLine className="h-3.5 w-3.5" />
        )}
        {p.scanne_le ? 'Annuler' : 'Scanner'}
      </button>
    );
  };

  const renderGroupe = (groupe: GroupeAcheteur, billetsVisibles: Set<number> | null) => {
    const ouvert = billetsVisibles !== null || groupesOuverts.has(groupe.cle);
    const commandesVisibles = groupe.commandes
      .map((c) => ({ ...c, billets: billetsVisibles ? c.billets.filter((b) => billetsVisibles.has(b.id)) : c.billets }))
      .filter((c) => c.billets.length > 0);
    const total = groupe.billets.length;
    const complet = groupe.nbScannes === total;
    const nonScannes = groupe.billets.filter((b) => !b.scanne_le);

    return (
      <li key={groupe.cle}>
        <div className="flex flex-col gap-3 py-3 md:grid md:grid-cols-[minmax(0,1.5fr)_minmax(0,1.4fr)_minmax(0,1fr)_auto] md:items-center md:gap-4">
          <button
            type="button"
            onClick={() => basculerGroupe(groupe.cle)}
            className="flex min-w-0 items-start gap-2 text-left"
            aria-expanded={ouvert}
          >
            <ChevronDown
              className={`mt-0.5 h-4 w-4 flex-shrink-0 text-gray-400 transition-transform ${ouvert ? 'rotate-180' : ''}`}
            />
            <span className="min-w-0">
              <span className="block truncate font-medium text-gray-900">{groupe.nom}</span>
              <span className="block truncate text-xs text-gray-500">
                {groupe.telephone}
                {groupe.email ? ` · ${groupe.email}` : ''}
              </span>
            </span>
          </button>

          <div className="min-w-0 pl-6 md:pl-0">
            <p className="text-sm text-gray-900">
              {total} billet{total > 1 ? 's' : ''}
              {groupe.commandes.length > 1 && (
                <span className="text-gray-500"> · {groupe.commandes.length} commandes</span>
              )}
            </p>
            <p className="truncate text-xs text-gray-500">{resumeTypes(groupe.billets)}</p>
          </div>

          <div className="flex items-center gap-3 pl-6 md:pl-0">
            <div className="min-w-0 flex-1">
              <p className={`text-xs font-medium ${complet ? 'text-green-700' : 'text-gray-600'}`}>
                {complet ? 'Tous scannés' : `Scannés ${groupe.nbScannes}/${total}`}
              </p>
              <div className="mt-1 h-1.5 w-full max-w-[140px] overflow-hidden rounded-full bg-gray-100">
                <div
                  className={`h-full rounded-full ${complet ? 'bg-green-500' : 'bg-black'}`}
                  style={{ width: `${(groupe.nbScannes / total) * 100}%` }}
                />
              </div>
            </div>
            {renderBadgePaiement(groupe.statutPaiement)}
          </div>

          <div className="flex items-center justify-end gap-2 pl-6 md:pl-0">
            {groupe.email && (
              <button
                onClick={() => setEmailAConfirmer(groupe)}
                disabled={emailEnCours === groupe.cle}
                className="rounded-full bg-emerald-500 p-2 text-white hover:bg-emerald-600 disabled:cursor-wait disabled:opacity-60"
                title="Renvoyer l’email des billets"
                aria-label="Renvoyer l’email des billets"
              >
                {emailEnCours === groupe.cle ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
              </button>
            )}
            <button
              onClick={() => changerScan(complet ? groupe.billets : nonScannes, !complet)}
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-medium ${
                complet ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' : 'bg-black text-white hover:bg-gray-800'
              }`}
            >
              {complet ? <Undo2 className="h-3.5 w-3.5" /> : <ScanLine className="h-3.5 w-3.5" />}
              {complet ? 'Annuler les scans' : total > 1 ? 'Tout scanner' : 'Scanner'}
            </button>
          </div>
        </div>

        {ouvert && (
          <div className="mb-3 space-y-3 rounded-lg bg-gray-50 p-3 md:ml-6">
            {commandesVisibles.map((commande) => (
              <div key={commande.id} className="space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-gray-500">
                  <span>
                    Commande <span className="font-medium text-gray-700">{commande.numero}</span> ·{' '}
                    {formatDateHeure(commande.date)}
                  </span>
                  <a
                    href={`/billets/${commande.jeton}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 font-medium text-gray-700 hover:text-black"
                  >
                    <Eye className="h-3.5 w-3.5" /> Voir les billets
                  </a>
                </div>
                <ul className="divide-y divide-gray-200 rounded-lg border border-gray-200 bg-white">
                  {commande.billets.map((b) => (
                    <li key={b.id} className="flex items-center justify-between gap-3 px-3 py-2">
                      <div className="min-w-0">
                        <p className="text-sm text-gray-900">
                          <span className="font-medium">#{b.numero}</span>{' '}
                          <span className="text-gray-500">· {b.type_billet}</span>
                        </p>
                        <p
                          className={`inline-flex items-center gap-1 text-xs ${
                            b.scanne_le ? 'text-green-700' : 'text-gray-500'
                          }`}
                        >
                          {b.scanne_le ? (
                            <>
                              <CheckCircle2 className="h-3.5 w-3.5" /> Scanné le {formatDateHeure(b.scanne_le)}
                            </>
                          ) : (
                            <>
                              <XCircle className="h-3.5 w-3.5 text-gray-300" /> Non scanné
                            </>
                          )}
                        </p>
                      </div>
                      {renderBoutonScan(b)}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </li>
    );
  };

  const cartesStats = [
    { label: 'Billets vendus', valeur: String(stats.billets_vendus), icon: Ticket },
    { label: 'Revenus (commandes payées)', valeur: formatFcfa(stats.revenus), icon: PiggyBank },
    { label: 'Visites sur la page', valeur: String(vues), icon: Eye },
  ];

  const meta = (productToEdit?.meta || {}) as { date_debut?: string; lieu?: string };

  return (
    <div className="h-screen bg-gray-50 flex overflow-hidden max-w-[100vw]">
      <ToastContainer toasts={toasts} onClose={removeToast} />
      <ConfirmationModal
        isOpen={emailAConfirmer !== null}
        onClose={() => setEmailAConfirmer(null)}
        onConfirm={() => (emailAConfirmer ? renvoyerEmail(emailAConfirmer) : undefined)}
        title="Renvoyer les billets"
        message={
          emailAConfirmer
            ? `Renvoyer à ${emailAConfirmer.email} l’email contenant ${
                emailAConfirmer.commandes.length > 1
                  ? `les billets de ses ${emailAConfirmer.commandes.length} commandes (${emailAConfirmer.commandes.length} emails)`
                  : 'ses billets'
              } ?`
            : ''
        }
        confirmText="Renvoyer"
        type="info"
      />

      <Sidebar
        boutique={boutique}
        isMobileMenuOpen={isMobileMenuOpen}
        onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      />

      <div className="flex-1 flex flex-col min-h-0 w-full">
        <div className="bg-white shadow-sm border-b px-4 lg:px-6 py-3 lg:py-4">
          <div className="flex justify-between items-center gap-3">
            <div className="flex items-center min-w-0 flex-1">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-1.5 rounded-lg hover:bg-gray-100 transition-colors mr-3 flex-shrink-0"
              >
                <Menu className="h-5 w-5 text-gray-600" />
              </button>
              <Link
                href={`/admin/${boutique.slug}/evenements`}
                className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors mr-2 flex-shrink-0"
                aria-label="Retour aux événements"
              >
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </Link>
              <h1 className="min-w-0 truncate text-lg lg:text-2xl font-bold text-gray-900">
                <span className="hidden sm:inline">À propos de : </span>
                {produit.nom}
              </h1>
            </div>
            {estBrouillon ? (
              <button
                onClick={changerDemandePublication}
                disabled={isTogglingStatut}
                aria-label="Demander la publication"
                title="Demander la publication"
                className="inline-flex flex-shrink-0 items-center gap-2 rounded-lg bg-green-600 p-2 sm:px-4 text-sm font-semibold text-white transition-colors hover:bg-green-700 disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
                <span className="hidden sm:inline">Demander la publication</span>
              </button>
            ) : (
              <span
                className={`inline-flex flex-shrink-0 items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
                  estPublie
                    ? 'bg-green-100 text-green-800'
                    : estEnAttente
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-gray-100 text-gray-700'
                }`}
              >
                {estPublie ? (
                  <CheckCircle2 className="h-3.5 w-3.5" />
                ) : estEnAttente ? (
                  <Clock className="h-3.5 w-3.5" />
                ) : (
                  <XCircle className="h-3.5 w-3.5" />
                )}
                {estPublie ? 'Publié' : estEnAttente ? 'En attente de validation' : 'Dépublié'}
              </span>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-6">
          {estBrouillon && (
            <div className="flex flex-col gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex gap-3">
                <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600" />
                <div>
                  <p className="text-sm font-semibold text-amber-900">Événement non publié</p>
                  <p className="text-sm text-amber-800">
                    Il n’est pas encore visible. Vérifiez les informations puis demandez sa publication : l’équipe
                    Marché 241 vérifie chaque événement avant d’ouvrir la billetterie.
                  </p>
                </div>
              </div>
              <button
                onClick={changerDemandePublication}
                disabled={isTogglingStatut}
                className="inline-flex flex-shrink-0 items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50"
              >
                <Send className="h-4 w-4" /> Demander la publication
              </button>
            </div>
          )}

          {estEnAttente && (
            <div className="flex flex-col gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex gap-3">
                <Clock className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600" />
                <div>
                  <p className="text-sm font-semibold text-amber-900">En attente de validation</p>
                  <p className="text-sm text-amber-800">
                    L’équipe Marché 241 vérifie votre événement. Vous recevrez un email dès sa mise en ligne. Vous
                    pouvez encore le modifier en attendant.
                  </p>
                </div>
              </div>
              <button
                onClick={changerDemandePublication}
                disabled={isTogglingStatut}
                className="inline-flex flex-shrink-0 items-center justify-center gap-2 rounded-lg border border-amber-300 bg-white px-4 py-2 text-sm font-semibold text-amber-900 hover:bg-amber-100 disabled:opacity-50"
              >
                <Undo2 className="h-4 w-4" /> Annuler la demande
              </button>
            </div>
          )}

          {produit.statut === 'inactif' && (
            <div className="flex gap-3 rounded-xl border border-gray-200 bg-gray-50 p-4">
              <XCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-gray-500" />
              <div>
                <p className="text-sm font-semibold text-gray-900">Dépublié par l’équipe Marché 241</p>
                <p className="text-sm text-gray-600">
                  L’événement n’est plus visible ni en vente. Contactez-nous sur WhatsApp pour le remettre en ligne.
                </p>
              </div>
            </div>
          )}

          {estPublie && (
            <p className="text-xs text-gray-500">
              Événement en ligne. Vos modifications sont appliquées immédiatement. Pour le retirer de la vente,
              contactez l’équipe Marché 241.
            </p>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {cartesStats.map(({ label, valeur, icon: Icon }) => (
              <div key={label} className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl bg-gray-100">
                  <Icon className="h-6 w-6 text-gray-700" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-2xl font-bold text-gray-900">{valeur}</p>
                  <p className="text-sm text-gray-500">{label}</p>
                </div>
              </div>
            ))}
          </div>

          <EvenementShareBar
            boutiqueSlug={boutique.slug}
            produitId={produit.id}
            nom={produit.nom}
            dateDebut={meta.date_debut}
            lieu={meta.lieu}
            estPublie={estPublie}
          />

          <div className="grid grid-cols-2 gap-2 rounded-xl bg-gray-100 p-1">
            {(
              [
                { id: 'details', label: 'Détails' },
                { id: 'participants', label: `Participants (${participants.length})` },
              ] as const
            ).map((o) => (
              <button
                key={o.id}
                onClick={() => setOnglet(o.id)}
                className={`rounded-lg py-2 text-sm font-medium transition-colors ${
                  onglet === o.id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {o.label}
              </button>
            ))}
          </div>

          {onglet === 'details' && (
            <div className="rounded-xl border border-gray-200 bg-white p-4 lg:p-6 shadow-sm">
              <EventProductForm
                variant="inline"
                isOpen
                onClose={() => undefined}
                onBack={() => undefined}
                category="evenement"
                onSave={handleSave}
                isSaving={isSaving}
                categories={categories}
                boutiqueId={boutique.id}
                boutiqueSlug={boutique.slug}
                productToEdit={productToEdit}
                ventesParType={stats.ventes_par_type}
              />
            </div>
          )}

          {onglet === 'participants' && (
            <div className="rounded-xl border border-gray-200 bg-white p-4 lg:p-6 shadow-sm space-y-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="space-y-1.5">
                  <h2 className="font-semibold text-gray-900">Participants</h2>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-600">
                    <span>
                      {groupes.length} acheteur{groupes.length > 1 ? 's' : ''} · {participants.length} billet
                      {participants.length > 1 ? 's' : ''}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <CheckCircle2 className="h-4 w-4 text-green-600" /> Scannés ({nbScannes})
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <XCircle className="h-4 w-4 text-gray-400" /> Non scannés ({participants.length - nbScannes})
                    </span>
                  </div>
                </div>
                <button
                  onClick={exporterCsv}
                  disabled={participants.length === 0}
                  className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium hover:bg-gray-50 disabled:opacity-40"
                >
                  <Download className="h-4 w-4" /> Exporter en CSV
                </button>
              </div>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  value={recherche}
                  onChange={(e) => setRecherche(e.target.value)}
                  placeholder="Rechercher un nom, email, téléphone, commande ou n° de billet..."
                  className="w-full rounded-lg border border-gray-300 py-2 pl-9 pr-9 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
                />
                {recherche && (
                  <button
                    onClick={() => setRecherche('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-gray-400 hover:text-gray-700"
                    aria-label="Effacer la recherche"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              {groupesFiltres.length === 0 ? (
                <p className="py-10 text-center text-sm text-gray-500">
                  {participants.length === 0 ? 'Aucun billet vendu pour le moment.' : 'Aucun participant ne correspond à la recherche.'}
                </p>
              ) : (
                <div>
                  <div className="hidden border-b border-gray-200 pb-2 text-xs font-semibold uppercase tracking-wide text-gray-500 md:grid md:grid-cols-[minmax(0,1.5fr)_minmax(0,1.4fr)_minmax(0,1fr)_auto] md:gap-4">
                    <span className="pl-6">Acheteur</span>
                    <span>Billets</span>
                    <span>Contrôle · paiement</span>
                    <span className="text-right">Actions</span>
                  </div>
                  <ul className="divide-y divide-gray-100">
                    {groupesFiltres.map(({ groupe, billetsVisibles }) => renderGroupe(groupe, billetsVisibles))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
