'use client';

import { Suspense, useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Calendar, ChevronRight, MapPin, Menu, Plus, Search, Ticket } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { ToastContainer } from '@/components/ui/Toast';
import Sidebar from '@/components/admin/Sidebar';
import { EventProductForm } from '@/components/admin/products/EventProductForm';
import { BoutiqueData } from '@/lib/services/auth';
import { creerProduit, getProduitsParBoutique } from '@/lib/services/products';
import { getCategoriesParBoutique } from '@/lib/services/categories';
import { ProduitDB } from '@/lib/database-types';
import { toCardEvenementData } from '@/lib/utils/product-sales-kind';
import { buildEventProductApiPayload, EventFormPayload } from '@/lib/utils/event-product-payload';
import { ProductValidationError } from '@/lib/errors/product-validation-error';

const TAILLE_PAGE = 50;

const STATUT_LABELS: Record<string, { label: string; className: string }> = {
  actif: { label: 'Publié', className: 'bg-green-100 text-green-800' },
  inactif: { label: 'Dépublié', className: 'bg-gray-100 text-gray-700' },
  brouillon: { label: 'Brouillon', className: 'bg-yellow-100 text-yellow-800' },
  archive: { label: 'Archivé', className: 'bg-gray-100 text-gray-500' },
};

function EvenementsContent() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const boutiqueName = params.boutique as string;

  const { user, verifierBoutique } = useAuth();
  const { toasts, removeToast, success, error: showError } = useToast();

  const [boutique, setBoutique] = useState<BoutiqueData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [evenements, setEvenements] = useState<ProduitDB[]>([]);
  const [categories, setCategories] = useState<Array<{ id: number; nom: string; slug: string }>>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const loadEvenements = useCallback(
    async (boutiqueId: number, page: number) => {
      try {
        const response = await getProduitsParBoutique(boutiqueId, {
          page,
          limite: TAILLE_PAGE,
          tri_par: 'date_creation',
          ordre: 'DESC',
          type_vente: 'evenement',
        });
        setEvenements(response.donnees);
        setTotalPages(response.total_pages || 1);
      } catch (error) {
        console.error('Erreur lors du chargement des événements:', error);
        showError('Erreur lors du chargement des événements');
        setEvenements([]);
      }
    },
    [showError]
  );

  useEffect(() => {
    const loadBoutiqueData = async () => {
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
          router.replace(`/admin/${boutiqueData.slug}/evenements`);
          return;
        }
        setBoutique(boutiqueData);

        try {
          setCategories(await getCategoriesParBoutique(boutiqueData.id));
        } catch (error) {
          console.error('Erreur lors du chargement des catégories:', error);
        }
      } catch (error) {
        console.error('Erreur lors du chargement de la boutique:', error);
        showError('Erreur lors du chargement de la boutique', 'Erreur');
      } finally {
        setIsLoading(false);
      }
    };

    const timer = setTimeout(loadBoutiqueData, 100);
    return () => clearTimeout(timer);
  }, [user, boutiqueName, router, verifierBoutique, showError]);

  useEffect(() => {
    if (boutique) {
      loadEvenements(boutique.id, currentPage);
    }
  }, [boutique, currentPage, loadEvenements]);

  useEffect(() => {
    if (searchParams.get('nouveau') === '1') {
      setShowCreateForm(true);
    }
  }, [searchParams]);

  const handleCreate = async (data: EventFormPayload) => {
    if (!boutique) return;
    try {
      // Un nouvel événement n'est jamais publié directement : le vendeur le publie depuis sa page.
      const payload = buildEventProductApiPayload({ ...data, statut: 'brouillon' });
      const cree = await creerProduit({ ...payload, boutique_id: boutique.id });
      success('Événement créé en brouillon : publiez-le quand il est prêt', 'Succès');
      setShowCreateForm(false);
      router.push(`/admin/${boutique.slug}/evenements/${cree.id}`);
    } catch (error: unknown) {
      if (error instanceof ProductValidationError) {
        showError(error.message, 'Erreur de validation', 12000);
        return;
      }
      showError(error instanceof Error ? error.message : "Erreur lors de la création de l'événement", 'Erreur');
    }
  };

  const closeCreateForm = () => {
    setShowCreateForm(false);
    if (searchParams.get('nouveau') && boutique) {
      router.replace(`/admin/${boutique.slug}/evenements`);
    }
  };

  const filtered = evenements.filter((e) => e.nom.toLowerCase().includes(searchTerm.trim().toLowerCase()));

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des événements...</p>
        </div>
      </div>
    );
  }

  if (!boutique) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Ticket className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Boutique non trouvée</p>
        </div>
      </div>
    );
  }

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
              <div className="min-w-0 flex-1">
                <h1 className="text-lg lg:text-2xl font-bold text-gray-900 truncate">Événements</h1>
                <p className="text-xs lg:text-sm text-gray-500 mt-0.5 lg:mt-1 truncate">
                  Gérez vos événements, billets et participants
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowCreateForm(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-black px-3 py-2 lg:px-4 text-sm font-medium text-white hover:bg-gray-800 flex-shrink-0"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Créer un événement</span>
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 lg:p-6">
          <div className="relative mb-4 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Rechercher un événement..."
              className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-9 pr-3 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
            />
          </div>

          {filtered.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-300 bg-white p-10 text-center">
              <Ticket className="mx-auto mb-3 h-12 w-12 text-gray-300" />
              <p className="font-medium text-gray-900">Aucun événement</p>
              <p className="mt-1 text-sm text-gray-500">
                Créez votre premier événement pour commencer à vendre des billets.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {filtered.map((produit) => {
                const card = toCardEvenementData(produit);
                const statut = STATUT_LABELS[produit.statut] || STATUT_LABELS.inactif;
                return (
                  <Link
                    key={produit.id}
                    href={`/admin/${boutique.slug}/evenements/${produit.id}`}
                    className="group flex overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition hover:shadow-md"
                  >
                    <div className="relative h-auto w-28 flex-shrink-0 bg-gray-100">
                      {produit.image_principale ? (
                        <Image src={produit.image_principale} alt={produit.nom} fill className="object-cover" />
                      ) : (
                        <Ticket className="absolute left-1/2 top-1/2 h-8 w-8 -translate-x-1/2 -translate-y-1/2 text-gray-300" />
                      )}
                    </div>
                    <div className="flex min-w-0 flex-1 flex-col gap-1.5 p-4">
                      <div className="flex items-start justify-between gap-2">
                        <h2 className="line-clamp-2 font-semibold text-gray-900">{produit.nom}</h2>
                        <ChevronRight className="h-5 w-5 flex-shrink-0 text-gray-400 group-hover:text-gray-700" />
                      </div>
                      {card.dateLine && (
                        <p className="flex items-center gap-1.5 text-xs text-gray-600">
                          <Calendar className="h-3.5 w-3.5" /> {card.dateLine}
                        </p>
                      )}
                      {card.lieu && (
                        <p className="flex items-center gap-1.5 truncate text-xs text-gray-600">
                          <MapPin className="h-3.5 w-3.5 flex-shrink-0" /> <span className="truncate">{card.lieu}</span>
                        </p>
                      )}
                      <div className="mt-auto flex items-center gap-2 pt-1">
                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statut.className}`}>
                          {statut.label}
                        </span>
                        <span className="text-xs text-gray-500">{card.placesLine}</span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}

          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-center gap-3 text-sm">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 disabled:opacity-40"
              >
                Précédent
              </button>
              <span className="text-gray-600">
                Page {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 disabled:opacity-40"
              >
                Suivant
              </button>
            </div>
          )}
        </div>
      </div>

      <EventProductForm
        isOpen={showCreateForm}
        onClose={closeCreateForm}
        onBack={closeCreateForm}
        category="evenement"
        onSave={handleCreate}
        categories={categories}
        boutiqueId={boutique.id}
        boutiqueSlug={boutique.slug}
      />
    </div>
  );
}

export default function EvenementsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
        </div>
      }
    >
      <EvenementsContent />
    </Suspense>
  );
}
