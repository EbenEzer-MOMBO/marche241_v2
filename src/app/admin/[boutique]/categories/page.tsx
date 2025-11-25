'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { BoutiqueData } from '@/lib/services/auth';
import { ToastContainer } from '@/components/ui/Toast';
import { useToast } from '@/hooks/useToast';
import Sidebar from '@/components/admin/Sidebar';
import { getCategoriesParBoutique, creerCategorie, modifierCategorie, supprimerCategorie } from '@/lib/services/categories';
import { Categorie } from '@/lib/database-types';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Tags,
  Menu,
  Eye,
  EyeOff
} from 'lucide-react';
import CategorieModal from '@/components/admin/CategorieModal';
import ConfirmationModal from '@/components/ui/ConfirmationModal';

// Interface locale pour l'affichage (adaptée depuis database-types)
interface CategorieAffichage {
  id: number;
  nom: string;
  slug: string;
  description?: string;
  actif: boolean;
  nombre_produits: number;
  date_creation: string;
  boutique_id?: number; // undefined = catégorie globale
}

export default function CategoriesPage() {
  const router = useRouter();
  const params = useParams();
  const boutiqueName = params.boutique as string;

  const { user, verifierBoutique } = useAuth();
  const { toasts, removeToast, success, error: showError } = useToast();

  const [boutique, setBoutique] = useState<BoutiqueData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [categories, setCategories] = useState<CategorieAffichage[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingCategorie, setEditingCategorie] = useState<CategorieAffichage | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [categorieToDelete, setCategorieToDelete] = useState<CategorieAffichage | null>(null);

  // Fonction pour charger les catégories depuis l'API
  const loadCategories = async (boutiqueId: number) => {
    try {
      const categoriesData = await getCategoriesParBoutique(boutiqueId);

      // Adapter les données de l'API vers le format d'affichage
      const categoriesAffichage: CategorieAffichage[] = categoriesData.map(cat => ({
        id: cat.id,
        nom: cat.nom,
        slug: cat.slug,
        description: cat.description,
        actif: cat.statut === 'active',
        nombre_produits: cat.nombre_produits || 0,
        date_creation: cat.date_creation.toString().split('T')[0],
        boutique_id: cat.boutique_id // Préserver le boutique_id pour identifier les catégories globales
      }));

      setCategories(categoriesAffichage);
    } catch (error) {
      console.error('Erreur lors du chargement des catégories:', error);
      showError('Erreur lors du chargement des catégories', 'Erreur');
      // En cas d'erreur, utiliser des données vides
      setCategories([]);
    }
  };

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
          router.replace(`/admin/${boutiqueData.slug}/categories`);
          return;
        }

        setBoutique(boutiqueData);
        await loadCategories(boutiqueData.id);
      } catch (error) {
        console.error('Erreur lors du chargement de la boutique:', error);
        showError('Erreur lors du chargement de la boutique', 'Erreur');
      } finally {
        setIsLoading(false);
      }
    };

    const timer = setTimeout(() => {
      loadBoutiqueData();
    }, 100);

    return () => clearTimeout(timer);
  }, [user, boutiqueName, router, verifierBoutique, showError]);

  // Séparer les catégories globales des catégories personnalisées
  const categoriesGlobales = categories.filter(cat => !cat.boutique_id);
  const categoriesPerso = categories.filter(cat => cat.boutique_id);

  // Fonction pour vérifier si une catégorie est globale
  const isGlobalCategory = (categorie: CategorieAffichage) => !categorie.boutique_id;

  const filteredCategoriesGlobales = categoriesGlobales.filter(categorie =>
    categorie.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    categorie.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredCategoriesPerso = categoriesPerso.filter(categorie =>
    categorie.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    categorie.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleCategorieStatus = async (id: number) => {
    const categorie = categories.find(cat => cat.id === id);
    if (!categorie || !boutique) return;

    // Empêcher la modification des catégories globales
    if (isGlobalCategory(categorie)) {
      showError('Les catégories globales ne peuvent pas être modifiées', 'Action non autorisée');
      return;
    }

    try {
      // Optimistic update - mettre à jour l'UI immédiatement
      setCategories(prev => prev.map(cat =>
        cat.id === id ? { ...cat, actif: !cat.actif } : cat
      ));

      const nouveauStatut = categorie.actif ? 'inactive' : 'active';
      await modifierCategorie(id, {
        nom: categorie.nom,
        slug: categorie.slug,
        description: categorie.description,
        ordre_affichage: 1, // TODO: gérer l'ordre d'affichage
        statut: nouveauStatut
      });

      success(`Catégorie ${nouveauStatut === 'active' ? 'activée' : 'désactivée'}`, 'Succès');
    } catch (error: any) {
      // Rollback en cas d'erreur
      setCategories(prev => prev.map(cat =>
        cat.id === id ? { ...cat, actif: !cat.actif } : cat
      ));
      showError(error.message || 'Erreur lors de la mise à jour', 'Erreur');
    }
  };

  const handleDeleteClick = (categorie: CategorieAffichage) => {
    // Empêcher la suppression des catégories globales
    if (isGlobalCategory(categorie)) {
      showError('Les catégories globales ne peuvent pas être supprimées', 'Action non autorisée');
      return;
    }

    setCategorieToDelete(categorie);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!categorieToDelete) return;

    try {
      await supprimerCategorie(categorieToDelete.id);
      setCategories(prev => prev.filter(cat => cat.id !== categorieToDelete.id));
      success('Catégorie supprimée avec succès', 'Succès');
    } catch (error: any) {
      showError(error.message || 'Erreur lors de la suppression', 'Erreur');
    } finally {
      setCategorieToDelete(null);
      setShowDeleteModal(false);
    }
  };

  const handleSaveCategorie = async (categorieData: any) => {
    if (!boutique) return;

    try {
      if (editingCategorie) {
        // Modification
        const categorieModifiee = await modifierCategorie(editingCategorie.id, {
          nom: categorieData.nom,
          slug: categorieData.slug,
          description: categorieData.description,
          ordre_affichage: 1 // TODO: gérer l'ordre d'affichage
        });

        // Adapter la réponse API vers le format d'affichage
        const categorieAffichage: CategorieAffichage = {
          id: categorieModifiee.id,
          nom: categorieModifiee.nom,
          slug: categorieModifiee.slug,
          description: categorieModifiee.description,
          actif: categorieModifiee.statut === 'active',
          nombre_produits: editingCategorie.nombre_produits, // Conserver le nombre existant
          date_creation: editingCategorie.date_creation // Conserver la date existante
        };

        setCategories(prev => prev.map(cat =>
          cat.id === editingCategorie.id ? categorieAffichage : cat
        ));
        success('Catégorie modifiée avec succès', 'Succès');
        setEditingCategorie(null);
      } else {
        // Création
        const nouvelleCategorie = await creerCategorie({
          nom: categorieData.nom,
          slug: categorieData.slug,
          description: categorieData.description,
          ordre_affichage: 1, // TODO: gérer l'ordre d'affichage
          boutique_id: boutique.id
        });

        // Adapter la réponse API vers le format d'affichage
        const categorieAffichage: CategorieAffichage = {
          id: nouvelleCategorie.id,
          nom: nouvelleCategorie.nom,
          slug: nouvelleCategorie.slug,
          description: nouvelleCategorie.description,
          actif: nouvelleCategorie.statut === 'active',
          nombre_produits: 0,
          date_creation: nouvelleCategorie.date_creation.toString().split('T')[0]
        };

        setCategories(prev => [...prev, categorieAffichage]);
        success('Catégorie créée avec succès', 'Succès');
      }
      setShowCreateModal(false);
    } catch (error: any) {
      showError(error.message || 'Erreur lors de la sauvegarde', 'Erreur');
    }
  };

  const handleEditCategorie = (categorie: CategorieAffichage) => {
    // Empêcher la modification des catégories globales
    if (isGlobalCategory(categorie)) {
      showError('Les catégories globales ne peuvent pas être modifiées', 'Action non autorisée');
      return;
    }

    setEditingCategorie(categorie);
    setShowCreateModal(true);
  };

  const handleCloseModal = () => {
    setShowCreateModal(false);
    setEditingCategorie(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des catégories...</p>
        </div>
      </div>
    );
  }

  if (!boutique) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Tags className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Boutique non trouvée</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-50 flex overflow-hidden max-w-[100vw]">
      <ToastContainer toasts={toasts} onClose={removeToast} />

      {/* Sidebar */}
      <Sidebar
        boutique={boutique}
        isMobileMenuOpen={isMobileMenuOpen}
        onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-0 w-full">
        {/* Header */}
        <div className="bg-white shadow-sm border-b px-4 lg:px-6 py-3 lg:py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center min-w-0 flex-1">
              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-1.5 rounded-lg hover:bg-gray-100 transition-colors mr-3 flex-shrink-0"
              >
                <Menu className="h-5 w-5 text-gray-600" />
              </button>

              <div className="min-w-0 flex-1">
                <h1 className="text-lg lg:text-2xl font-bold text-gray-900 truncate">Catégories</h1>
                <p className="text-xs lg:text-sm text-gray-500 mt-0.5 lg:mt-1 truncate">
                  Gérez les catégories de votre boutique {boutique.nom}
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center px-3 lg:px-4 py-1.5 lg:py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors text-sm lg:text-base flex-shrink-0 ml-2"
            >
              <Plus className="h-3 w-3 lg:h-4 lg:w-4 mr-1 lg:mr-2" />
              <span className="hidden sm:inline">Nouvelle catégorie</span>
              <span className="sm:hidden">Créer</span>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-3 sm:p-4 lg:p-6">
          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher une catégorie..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
              />
            </div>
          </div>

          {/* Categories List - Desktop Table */}
          <div className="hidden lg:block space-y-6">
            {/* Catégories Personnalisées */}
            {filteredCategoriesPerso.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                  <Tags className="h-5 w-5 mr-2 text-purple-600" />
                  Mes Catégories
                  <span className="ml-2 text-sm font-normal text-gray-500">
                    ({filteredCategoriesPerso.length})
                  </span>
                </h2>
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Catégorie
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Slug
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Produits
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Statut
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Date création
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {filteredCategoriesPerso.map((categorie) => (
                          <tr key={categorie.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div>
                                <div className="text-sm font-medium text-gray-900">{categorie.nom}</div>
                                {categorie.description && (
                                  <div className="text-sm text-gray-500 truncate max-w-xs">{categorie.description}</div>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-500 font-mono">{categorie.slug}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{categorie.nombre_produits}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${categorie.actif
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                                }`}>
                                {categorie.actif ? 'Active' : 'Inactive'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(categorie.date_creation).toLocaleDateString('fr-FR')}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <div className="flex items-center justify-end space-x-2">
                                <button
                                  onClick={() => toggleCategorieStatus(categorie.id)}
                                  className={`p-1.5 rounded-lg transition-colors ${categorie.actif
                                    ? 'text-green-600 hover:bg-green-50'
                                    : 'text-gray-400 hover:bg-gray-50'
                                    }`}
                                  title={categorie.actif ? 'Désactiver' : 'Activer'}
                                >
                                  {categorie.actif ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                                </button>
                                <button
                                  onClick={() => handleEditCategorie(categorie)}
                                  className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors"
                                  title="Modifier"
                                >
                                  <Edit className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteClick(categorie)}
                                  className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                                  title="Supprimer"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Catégories Globales */}
            {filteredCategoriesGlobales.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                  <Tags className="h-5 w-5 mr-2 text-blue-600" />
                  Catégories Globales
                  <span className="ml-2 text-sm font-normal text-gray-500">
                    ({filteredCategoriesGlobales.length})
                  </span>
                </h2>
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-blue-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Catégorie
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Slug
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Produits
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Statut
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Type
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {filteredCategoriesGlobales.map((categorie) => (
                          <tr key={categorie.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div>
                                <div className="text-sm font-medium text-gray-900">{categorie.nom}</div>
                                {categorie.description && (
                                  <div className="text-sm text-gray-500 truncate max-w-xs">{categorie.description}</div>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-500 font-mono">{categorie.slug}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{categorie.nombre_produits}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${categorie.actif
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                                }`}>
                                {categorie.actif ? 'Active' : 'Inactive'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                Globale
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* Categories Cards - Mobile */}
          <div className="lg:hidden space-y-6">
            {/* Catégories Personnalisées - Mobile */}
            {filteredCategoriesPerso.length > 0 && (
              <div>
                <h2 className="text-base font-semibold text-gray-900 mb-2 flex items-center">
                  <Tags className="h-4 w-4 mr-2 text-purple-600" />
                  Mes Catégories
                  <span className="ml-2 text-xs font-normal text-gray-500">
                    ({filteredCategoriesPerso.length})
                  </span>
                </h2>
                <div className="space-y-3">
                  {filteredCategoriesPerso.map((categorie) => (
                    <div
                      key={categorie.id}
                      className="bg-white rounded-lg shadow-sm border border-gray-200 p-3"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1 min-w-0 pr-2">
                          <h3 className="text-sm font-medium text-gray-900 truncate">{categorie.nom}</h3>
                          <p className="text-xs text-gray-500 font-mono mt-1 truncate">{categorie.slug}</p>
                          {categorie.description && (
                            <p className="text-xs text-gray-600 mt-1 line-clamp-2">{categorie.description}</p>
                          )}
                        </div>
                        <div className="flex items-center space-x-1 flex-shrink-0">
                          <button
                            onClick={() => toggleCategorieStatus(categorie.id)}
                            className={`p-1 rounded-lg transition-colors ${categorie.actif
                              ? 'text-green-600 hover:bg-green-50'
                              : 'text-gray-400 hover:bg-gray-50'
                              }`}
                            title={categorie.actif ? 'Désactiver' : 'Activer'}
                          >
                            {categorie.actif ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                          </button>
                          <button
                            onClick={() => handleEditCategorie(categorie)}
                            className="p-1 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors"
                            title="Modifier"
                          >
                            <Edit className="h-3 w-3" />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(categorie)}
                            className="p-1 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                            title="Supprimer"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center space-x-2 min-w-0">
                          <span className="text-gray-600 flex-shrink-0">{categorie.nombre_produits} produit(s)</span>
                          <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium flex-shrink-0 ${categorie.actif
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                            }`}>
                            {categorie.actif ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        <span className="text-gray-400 flex-shrink-0 ml-2">
                          {new Date(categorie.date_creation).toLocaleDateString('fr-FR', {
                            day: '2-digit',
                            month: '2-digit'
                          })}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Catégories Globales - Mobile */}
            {filteredCategoriesGlobales.length > 0 && (
              <div>
                <h2 className="text-base font-semibold text-gray-900 mb-2 flex items-center">
                  <Tags className="h-4 w-4 mr-2 text-blue-600" />
                  Catégories Globales
                  <span className="ml-2 text-xs font-normal text-gray-500">
                    ({filteredCategoriesGlobales.length})
                  </span>
                </h2>
                <div className="space-y-3">
                  {filteredCategoriesGlobales.map((categorie) => (
                    <div
                      key={categorie.id}
                      className="bg-white rounded-lg shadow-sm border-2 border-blue-100 p-3"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1 min-w-0 pr-2">
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-medium text-gray-900 truncate">{categorie.nom}</h3>
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 flex-shrink-0">
                              Globale
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 font-mono mt-1 truncate">{categorie.slug}</p>
                          {categorie.description && (
                            <p className="text-xs text-gray-600 mt-1 line-clamp-2">{categorie.description}</p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center space-x-2 min-w-0">
                          <span className="text-gray-600 flex-shrink-0">{categorie.nombre_produits} produit(s)</span>
                          <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium flex-shrink-0 ${categorie.actif
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                            }`}>
                            {categorie.actif ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* Empty State */}
          {filteredCategoriesGlobales.length === 0 && filteredCategoriesPerso.length === 0 && (
            <div className="text-center py-12">
              <Tags className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm ? 'Aucune catégorie trouvée' : 'Aucune catégorie'}
              </h3>
              <p className="text-gray-500 mb-6">
                {searchTerm
                  ? 'Essayez avec d\'autres mots-clés'
                  : 'Commencez par créer votre première catégorie'
                }
              </p>
              {!searchTerm && (
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="inline-flex items-center px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Créer ma première catégorie
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <CategorieModal
        isOpen={showCreateModal}
        onClose={handleCloseModal}
        onSave={handleSaveCategorie}
        categorie={editingCategorie}
      />

      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setCategorieToDelete(null);
        }}
        onConfirm={confirmDelete}
        title="Supprimer la catégorie"
        message={`Êtes-vous sûr de vouloir supprimer la catégorie "${categorieToDelete?.nom}" ? Cette action est irréversible et tous les produits associés perdront leur catégorie.`}
        confirmText="Supprimer"
        cancelText="Annuler"
        type="danger"
      />
    </div>
  );
}
