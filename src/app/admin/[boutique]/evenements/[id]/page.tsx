'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Download,
  Eye,
  Loader2,
  Mail,
  Menu,
  PiggyBank,
  ScanLine,
  Search,
  Ticket,
  Undo2,
  X,
  XCircle,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { ToastContainer } from '@/components/ui/Toast';
import Sidebar from '@/components/admin/Sidebar';
import { EventProductForm } from '@/components/admin/products/EventProductForm';
import { BoutiqueData } from '@/lib/services/auth';
import { getProduitById, modifierProduit } from '@/lib/services/products';
import { getCategoriesParBoutique } from '@/lib/services/categories';
import { getStatistiquesVuesProduit } from '@/lib/services/vues';
import {
  getParticipantsEvenement,
  marquerBilletScanne,
  ParticipantBillet,
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
  const [stats, setStats] = useState<StatsEvenement>({ billets_vendus: 0, billets_scannes: 0, revenus: 0 });
  const [vues, setVues] = useState(0);
  const [recherche, setRecherche] = useState('');
  const [billetEnCours, setBilletEnCours] = useState<number | null>(null);

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
        // Le statut se pilote via le bouton Publier / Dépublier.
        statut: produit.statut === 'actif' || produit.statut === 'brouillon' ? produit.statut : 'inactif',
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

  const toggleStatut = async () => {
    if (!produit) return;
    setIsTogglingStatut(true);
    try {
      const misAJour = await modifierProduit(produit.id, { statut: estPublie ? 'inactif' : 'actif' });
      setProduit(misAJour);
      success(estPublie ? 'Événement dépublié' : 'Événement publié', 'Succès');
    } catch (error: unknown) {
      showError(error instanceof Error ? error.message : 'Erreur lors de la mise à jour', 'Erreur');
    } finally {
      setIsTogglingStatut(false);
    }
  };

  const toggleScan = async (participant: ParticipantBillet) => {
    const ancienScan = participant.scanne_le;
    const definirScan = (scanneLe: string | null) =>
      setParticipants((prev) => prev.map((p) => (p.id === participant.id ? { ...p, scanne_le: scanneLe } : p)));
    const delta = ancienScan ? -1 : 1;

    // Mise à jour optimiste : l'affichage bascule immédiatement, on revient en arrière en cas d'erreur.
    setBilletEnCours(participant.id);
    definirScan(ancienScan ? null : new Date().toISOString());
    setStats((prev) => ({ ...prev, billets_scannes: prev.billets_scannes + delta }));
    try {
      const billet = await marquerBilletScanne(participant.id, !ancienScan);
      definirScan(billet.scanne_le);
    } catch (error: unknown) {
      definirScan(ancienScan);
      setStats((prev) => ({ ...prev, billets_scannes: prev.billets_scannes - delta }));
      showError(error instanceof Error ? error.message : 'Erreur lors de la mise à jour du billet', 'Erreur');
    } finally {
      setBilletEnCours(null);
    }
  };

  const participantsFiltres = useMemo(() => {
    const terme = recherche.trim().toLowerCase();
    if (!terme) return participants;
    return participants.filter((p) =>
      [p.client_nom, p.client_email, p.client_telephone, p.numero_commande, `#${p.numero}`, String(p.numero)]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(terme))
    );
  }, [participants, recherche]);

  const nbScannes = participants.filter((p) => p.scanne_le).length;
  const nbPayes = participants.filter((p) => p.statut_paiement === 'paye').length;

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

  const renderBadgePaiement = (p: ParticipantBillet) => (
    <span
      className={`whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium ${
        p.statut_paiement === 'paye' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
      }`}
    >
      {LIBELLES_PAIEMENT[p.statut_paiement] || p.statut_paiement}
    </span>
  );

  const renderActions = (p: ParticipantBillet) => (
    <div className="flex flex-shrink-0 justify-end gap-2">
      <a
        href={`/billets/${p.jeton}`}
        target="_blank"
        rel="noopener noreferrer"
        className="rounded-full bg-gray-100 p-2 text-gray-700 hover:bg-gray-200"
        title="Voir le billet"
      >
        <Eye className="h-4 w-4" />
      </a>
      {p.client_email && (
        <a
          href={`mailto:${p.client_email}`}
          className="rounded-full bg-emerald-500 p-2 text-white hover:bg-emerald-600"
          title="Envoyer un email"
        >
          <Mail className="h-4 w-4" />
        </a>
      )}
      <button
        onClick={() => toggleScan(p)}
        disabled={billetEnCours === p.id}
        className={`rounded-full p-2 text-white disabled:cursor-wait ${
          p.scanne_le ? 'bg-gray-500 hover:bg-gray-600' : 'bg-black hover:bg-gray-800'
        }`}
        title={p.scanne_le ? 'Annuler le scan' : 'Marquer comme scanné'}
      >
        {billetEnCours === p.id ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : p.scanne_le ? (
          <Undo2 className="h-4 w-4" />
        ) : (
          <ScanLine className="h-4 w-4" />
        )}
      </button>
    </div>
  );

  const cartesStats = [
    { label: 'Billets vendus', valeur: String(stats.billets_vendus), icon: Ticket },
    { label: 'Revenus (commandes payées)', valeur: formatFcfa(stats.revenus), icon: PiggyBank },
    { label: 'Visites sur la page', valeur: String(vues), icon: Eye },
  ];

  return (
    <div className="h-screen bg-gray-50 flex overflow-hidden max-w-[100vw]">
      <ToastContainer toasts={toasts} onClose={removeToast} />

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
            <button
              onClick={toggleStatut}
              disabled={isTogglingStatut}
              aria-label={estPublie ? 'Dépublier l’événement' : 'Publier l’événement'}
              title={estPublie ? 'Dépublier l’événement' : 'Publier l’événement'}
              className={`inline-flex flex-shrink-0 items-center gap-2 rounded-lg p-2 sm:px-4 text-sm font-semibold text-white transition-colors disabled:opacity-50 ${
                estPublie ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'
              }`}
            >
              {estPublie ? <XCircle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
              <span className="hidden sm:inline">{estPublie ? 'Dépublier l’événement' : 'Publier l’événement'}</span>
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-6">
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
              />
            </div>
          )}

          {onglet === 'participants' && (
            <div className="rounded-xl border border-gray-200 bg-white p-4 lg:p-6 shadow-sm space-y-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="space-y-1.5">
                  <h2 className="font-semibold text-gray-900">Liste des participants enregistrés</h2>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-600">
                    <span className="inline-flex items-center gap-1">
                      <XCircle className="h-4 w-4 text-gray-400" /> Non scanné ({participants.length - nbScannes})
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <CheckCircle2 className="h-4 w-4 text-green-600" /> Scanné ({nbScannes})
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <CheckCircle2 className="h-4 w-4 text-green-600" /> Payé ({nbPayes})
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Clock className="h-4 w-4 text-amber-500" /> Autre statut ({participants.length - nbPayes})
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
                  placeholder="Rechercher par nom, email, téléphone, commande ou n° billet..."
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

              {participantsFiltres.length === 0 ? (
                <p className="py-10 text-center text-sm text-gray-500">
                  {participants.length === 0 ? 'Aucun billet vendu pour le moment.' : 'Aucun participant ne correspond à la recherche.'}
                </p>
              ) : (
                <div className="hidden overflow-x-auto md:block">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                        <th className="py-3 pr-4">Billet</th>
                        <th className="py-3 pr-4">Acheteur</th>
                        <th className="py-3 pr-4">Adresse électronique</th>
                        <th className="py-3 pr-4 text-center">Scan</th>
                        <th className="py-3 pr-4">Paiement</th>
                        <th className="py-3 pr-4">Enregistré le</th>
                        <th className="py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {participantsFiltres.map((p) => (
                        <tr key={p.id} className="align-middle">
                          <td className="py-3 pr-4 whitespace-nowrap">
                            <span className="font-medium text-gray-900">#{p.numero}</span>
                            <span className="block text-xs text-gray-500">{p.type_billet}</span>
                          </td>
                          <td className="py-3 pr-4">
                            <span className="text-gray-900">{p.client_nom}</span>
                            <span className="block text-xs text-gray-500">{p.client_telephone}</span>
                          </td>
                          <td className="py-3 pr-4 text-gray-700">{p.client_email || '—'}</td>
                          <td className="py-3 pr-4 text-center">
                            {p.scanne_le ? (
                              <CheckCircle2
                                className="mx-auto h-5 w-5 text-green-600"
                                aria-label={`Scanné le ${formatDateHeure(p.scanne_le)}`}
                              />
                            ) : (
                              <XCircle className="mx-auto h-5 w-5 text-gray-300" aria-label="Non scanné" />
                            )}
                          </td>
                          <td className="py-3 pr-4 whitespace-nowrap">{renderBadgePaiement(p)}</td>
                          <td className="py-3 pr-4 whitespace-nowrap text-gray-700">{formatDateHeure(p.date_creation)}</td>
                          <td className="py-3">{renderActions(p)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {participantsFiltres.length > 0 && (
                <ul className="divide-y divide-gray-100 md:hidden">
                  {participantsFiltres.map((p) => (
                    <li key={p.id} className="py-3 space-y-2">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="font-medium text-gray-900">
                            #{p.numero} <span className="font-normal text-gray-500">· {p.type_billet}</span>
                          </p>
                          <p className="truncate text-sm text-gray-900">{p.client_nom}</p>
                          <p className="truncate text-xs text-gray-500">{p.client_telephone}</p>
                        </div>
                        {renderBadgePaiement(p)}
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <p
                          className={`inline-flex items-center gap-1 text-xs ${
                            p.scanne_le ? 'text-green-700' : 'text-gray-500'
                          }`}
                        >
                          {p.scanne_le ? (
                            <>
                              <CheckCircle2 className="h-4 w-4" /> Scanné le {formatDateHeure(p.scanne_le)}
                            </>
                          ) : (
                            <>
                              <XCircle className="h-4 w-4 text-gray-300" /> Non scanné
                            </>
                          )}
                        </p>
                        {renderActions(p)}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
