'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { getProduitsParBoutique, creerProduit, modifierProduit, supprimerProduit, genererSlugProduit, ProduitsResponse, ProduitsParams } from '@/lib/services/products';
import { getCategoriesParBoutique } from '@/lib/services/categories';
import { ToastContainer } from '@/components/ui/Toast';
import { useToast } from '@/hooks/useToast';
import Sidebar from '@/components/admin/Sidebar';
import { ProduitDB, Boutique } from '@/lib/database-types';
import { BoutiqueData } from '@/lib/services/auth';
import {
    Plus,
    Search,
    Edit,
    Trash2,
    Package,
    Menu,
    Eye,
    EyeOff,
    Star,
    TrendingUp,
    Grid3X3,
    List
} from 'lucide-react';
import ConfirmationModal from '@/components/ui/ConfirmationModal';
import ProduitModal from '@/components/admin/ProduitModal';

// Interface locale pour l'affichage des produits
interface ProduitAffichage {
    id: number;
    nom: string;
    slug: string;
    description?: string;
    prix: number;
    prix_original?: number;
    image_principale?: string;
    images?: string[];
    variants?: any;
    en_stock: boolean;
    quantite_stock: number;
    actif: boolean;
    est_nouveau: boolean;
    est_en_promotion: boolean;
    est_featured: boolean;
    note_moyenne: number;
    nombre_avis: number;
    nombre_ventes: number;
    date_creation: string;
    categorie_nom?: string;
    // Ajout des propriétés manquantes
    categorie?: {
        id: number;
        nom: string;
        slug: string;
    };
    boutique?: {
        id: number;
        nom: string;
        logo?: string;
        slug: string;
    };
}

export default function ProductsPage() {
    const router = useRouter();
    const params = useParams();
    const boutiqueName = params.boutique as string;

    const { user, verifierBoutique } = useAuth();
    const { toasts, removeToast, success, error: showError } = useToast();

    const [boutique, setBoutique] = useState<BoutiqueData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [products, setProducts] = useState<ProduitAffichage[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [productToDelete, setProductToDelete] = useState<ProduitAffichage | null>(null);
    const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
    const [groupByCategory, setGroupByCategory] = useState(true);
    const [showProductModal, setShowProductModal] = useState(false);
    const [productToEdit, setProductToEdit] = useState<ProduitDB | null>(null);
    const [categories, setCategories] = useState<any[]>([]);

    // États pour la pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalProducts, setTotalProducts] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [sortBy, setSortBy] = useState('date_creation');
    const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('DESC');

    // Fonction pour charger les produits depuis l'API
    const loadProducts = async (boutiqueId: number) => {
        try {
            console.log('🔄 Début du chargement des produits pour la boutique:', boutiqueId);
            setIsLoading(true);

            const params: ProduitsParams = {
                page: currentPage,
                limite: pageSize,
                tri_par: sortBy,
                ordre: sortOrder
            };

            console.log('📋 Paramètres de la requête:', params);
            const response: ProduitsResponse = await getProduitsParBoutique(boutiqueId, params);
            console.log('📦 Réponse API reçue:', response);

            // Convertir les données de l'API vers le format d'affichage
            const produits: ProduitAffichage[] = response.donnees.map((produit: ProduitDB) => ({
                id: produit.id,
                nom: produit.nom,
                slug: produit.slug,
                description: produit.description,
                prix: produit.prix,
                prix_original: produit.prix_original,
                image_principale: produit.image_principale,
                images: produit.images || [],
                variants: produit.variants || [],
                en_stock: produit.en_stock,
                quantite_stock: produit.quantite_stock || produit.stock || 0,
                actif: produit.actif || produit.statut === 'actif',
                est_nouveau: produit.est_nouveau,
                est_en_promotion: produit.est_en_promotion,
                est_featured: produit.est_featured,
                note_moyenne: produit.note_moyenne,
                nombre_avis: produit.nombre_avis,
                nombre_ventes: produit.nombre_ventes,
                date_creation: produit.date_creation.toString(),
                categorie_nom: produit.categorie?.nom,
                // Ajouter l'objet categorie conforme à l'interface ProduitAffichage
                categorie: produit.categorie ? {
                    id: produit.categorie.id,
                    nom: produit.categorie.nom,
                    slug: produit.categorie.slug
                } : {
                    id: 0,
                    nom: 'Non catégorisé',
                    slug: 'non-categorise'
                },
                // Ajouter l'objet boutique conforme à l'interface ProduitAffichage
                boutique: produit.boutique ? {
                    id: produit.boutique.id,
                    nom: produit.boutique.nom,
                    logo: produit.boutique.logo,
                    slug: produit.boutique.slug
                } : {
                    id: boutique?.id || 0,
                    nom: boutique?.nom || '',
                    logo: boutique?.logo,
                    slug: boutique?.slug || ''
                }
            }));

            console.log('🔢 Nombre de produits convertis:', produits.length);
            console.log('📊 Produits convertis:', produits);

            setProducts(produits);
            setTotalProducts(response.total);
            setTotalPages(response.total_pages);

            console.log('✅ État mis à jour - Total produits:', response.total, 'Pages:', response.total_pages);

            // Charger les catégories depuis l'API
            try {
                const categoriesData = await getCategoriesParBoutique(boutiqueId);
                setCategories(categoriesData);
            } catch (error) {
                console.error('Erreur lors du chargement des catégories:', error);
                // Fallback vers catégories par défaut en cas d'erreur
                const defaultCategories = [
                    { id: 1, nom: 'Électronique', actif: true },
                    { id: 2, nom: 'Mode & Vêtements', actif: true },
                    { id: 3, nom: 'Maison & Décoration', actif: true },
                    { id: 4, nom: 'Beauté & Cosmétiques', actif: true },
                    { id: 5, nom: 'Alimentation', actif: true }
                ];
                setCategories(defaultCategories);
            }
        } catch (error) {
            console.error('❌ Erreur lors du chargement des produits:', error);
            showError('Erreur lors du chargement des produits');
            setProducts([]);
        } finally {
            console.log('🏁 Fin du chargement des produits - isLoading: false');
            setIsLoading(false);
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
                    router.replace(`/admin/${boutiqueData.slug}/products`);
                    return;
                }

                setBoutique(boutiqueData);

                // Charger les produits après avoir défini la boutique
                console.log('🏪 Boutique chargée, chargement des produits...');
                await loadProducts(boutiqueData.id);
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

    // Recharger les produits quand les paramètres de pagination changent
    useEffect(() => {
        if (boutique) {
            console.log('🔄 Rechargement des produits suite au changement de paramètres');
            loadProducts(boutique.id);
        }
    }, [boutique, currentPage, pageSize, sortBy, sortOrder]);

    const filteredProducts = products.filter(product => {
        const matchesSearch = product.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.categorie_nom?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = filterStatus === 'all' ||
            (filterStatus === 'active' && product.actif) ||
            (filterStatus === 'inactive' && !product.actif);

        return matchesSearch && matchesStatus;
    });

    // Grouper les produits par catégorie
    const groupedProducts = groupByCategory
        ? filteredProducts.reduce((groups, product) => {
            const category = product.categorie_nom || 'Sans catégorie';
            if (!groups[category]) {
                groups[category] = [];
            }
            groups[category].push(product);
            return groups;
        }, {} as Record<string, ProduitAffichage[]>)
        : { 'Tous les produits': filteredProducts };

    // Fonction pour obtenir l'icône de catégorie
    const getCategoryIcon = (categoryName: string) => {
        const name = categoryName.toLowerCase();
        if (name.includes('électronique')) return '📱';
        if (name.includes('mode') || name.includes('vêtement')) return '👕';
        if (name.includes('maison') || name.includes('décoration')) return '🏠';
        if (name.includes('beauté') || name.includes('cosmétique')) return '💄';
        if (name.includes('alimentation')) return '🍎';
        return '📦';
    };

    // Fonction pour obtenir la couleur de catégorie
    const getCategoryColor = (categoryName: string) => {
        const name = categoryName.toLowerCase();
        if (name.includes('électronique')) return 'bg-blue-50 border-blue-200 text-blue-800';
        if (name.includes('mode') || name.includes('vêtement')) return 'bg-purple-50 border-purple-200 text-purple-800';
        if (name.includes('maison') || name.includes('décoration')) return 'bg-green-50 border-green-200 text-green-800';
        if (name.includes('beauté') || name.includes('cosmétique')) return 'bg-pink-50 border-pink-200 text-pink-800';
        if (name.includes('alimentation')) return 'bg-orange-50 border-orange-200 text-orange-800';
        return 'bg-gray-50 border-gray-200 text-gray-800';
    };

    const toggleProductStatus = async (id: number) => {
        const product = products.find(p => p.id === id);
        if (!product || !boutique) return;

        try {
            // Optimistic update
            setProducts(prev => prev.map(p =>
                p.id === id ? { ...p, actif: !p.actif } : p
            ));

            // Appel API réel
            await modifierProduit(id, { 
                statut: product.actif ? 'inactif' : 'actif' 
            });

            success(`Produit ${!product.actif ? 'activé' : 'désactivé'}`, 'Succès');
        } catch (error: any) {
            // Rollback en cas d'erreur
            setProducts(prev => prev.map(p =>
                p.id === id ? { ...p, actif: !p.actif } : p
            ));
            showError(error.message || 'Erreur lors de la mise à jour', 'Erreur');
        }
    };

    const handleDeleteClick = (product: ProduitAffichage) => {
        setProductToDelete(product);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (!productToDelete) return;

        try {
            // Appel API réel
            await supprimerProduit(productToDelete.id);
            setProducts(prev => prev.filter(p => p.id !== productToDelete.id));
            success('Produit supprimé avec succès', 'Succès');
        } catch (error: any) {
            showError(error.message || 'Erreur lors de la suppression', 'Erreur');
        } finally {
            setProductToDelete(null);
            setShowDeleteModal(false);
        }
    };

    const handleCreateProduct = () => {
        setProductToEdit(null);
        setShowProductModal(true);
    };

    const handleEditProduct = (product: ProduitAffichage) => {
        // Convertir ProduitAffichage en ProduitDB pour le modal
        const produitDB: ProduitDB = {
            id: product.id,
            nom: product.nom,
            slug: product.slug,
            description: product.description,
            prix: product.prix,
            prix_original: product.prix_original,
            image_principale: product.image_principale,
            images: product.images || [],
            variants: product.variants || [],
            en_stock: product.en_stock,
            quantite_stock: product.quantite_stock || 0,
            actif: product.actif,
            boutique_id: boutique?.id || 0,
            categorie_id: product.categorie?.id || 0,
            statut: product.actif ? 'actif' : 'inactif',
            est_nouveau: product.est_nouveau,
            est_en_promotion: product.est_en_promotion,
            est_featured: product.est_featured,
            note_moyenne: product.note_moyenne,
            nombre_avis: product.nombre_avis,
            nombre_ventes: product.nombre_ventes,
            nombre_vues: 0,
            date_creation: new Date(product.date_creation),
            date_modification: new Date()
        };

        setProductToEdit(produitDB);
        setShowProductModal(true);
    };

    const handleSaveProduct = async (produitData: any) => {
        try {
            if (productToEdit) {
                // Modification
                const produitModifie = await modifierProduit(productToEdit.id, {
                    nom: produitData.nom,
                    slug: produitData.slug || genererSlugProduit(produitData.nom),
                    description: produitData.description,
                    prix: produitData.prix,
                    prix_promo: produitData.prix_original,
                    en_stock: produitData.en_stock,
                    categorie_id: produitData.categorie_id,
                    images: produitData.images,
                    image_principale: produitData.image_principale,
                    variants: produitData.variants,
                    statut: produitData.statut
                });
                
                // Mettre à jour l'interface utilisateur
                const produitAffichage: ProduitAffichage = {
                    ...products.find(p => p.id === productToEdit.id)!,
                    nom: produitModifie.nom,
                    slug: produitModifie.slug,
                    description: produitModifie.description,
                    prix: produitModifie.prix,
                    prix_original: produitModifie.prix_promo,
                    image_principale: produitModifie.image_principale,
                    images: produitModifie.images || [],
                    variants: produitModifie.variants || [],
                    en_stock: produitModifie.en_stock,
                    quantite_stock: produitModifie.quantite_stock || produitModifie.stock || 0,
                    actif: produitModifie.actif || produitModifie.statut === 'actif',
                    est_nouveau: produitModifie.est_nouveau,
                    est_en_promotion: produitModifie.est_en_promotion,
                    est_featured: produitModifie.est_featured,
                    categorie_nom: categories.find(c => c.id === produitModifie.categorie_id)?.nom || 'Sans catégorie',
                    categorie: {
                        id: produitModifie.categorie_id,
                        nom: categories.find(c => c.id === produitModifie.categorie_id)?.nom || 'Sans catégorie',
                        slug: categories.find(c => c.id === produitModifie.categorie_id)?.slug || 'sans-categorie'
                    }
                };
                
                console.log('Produit modifié:', produitAffichage);
                
                setProducts(prev => prev.map(p => p.id === productToEdit.id ? produitAffichage : p));
                success('Produit modifié avec succès', 'Succès');
            } else {
                // Création
                const nouveauProduitDB = await creerProduit({
                    nom: produitData.nom,
                    slug: produitData.slug || genererSlugProduit(produitData.nom),
                    description: produitData.description,
                    prix: produitData.prix,
                    prix_promo: produitData.prix_original,
                    en_stock: produitData.quantite_stock,
                    boutique_id: boutique!.id,
                    categorie_id: produitData.categorie_id,
                    images: produitData.images,
                    image_principale: produitData.image_principale,
                    variants: produitData.variants,
                    statut: produitData.statut
                });
                
                // Convertir en ProduitAffichage pour l'interface
                const nouveauProduit: ProduitAffichage = {
                    id: nouveauProduitDB.id,
                    nom: nouveauProduitDB.nom,
                    slug: nouveauProduitDB.slug,
                    description: nouveauProduitDB.description,
                    prix: nouveauProduitDB.prix,
                    prix_original: nouveauProduitDB.prix_promo,
                    image_principale: nouveauProduitDB.image_principale,
                    images: nouveauProduitDB.images || [],
                    variants: nouveauProduitDB.variants || [],
                    en_stock: nouveauProduitDB.en_stock,
                    quantite_stock: nouveauProduitDB.quantite_stock || nouveauProduitDB.stock || 0,
                    actif: nouveauProduitDB.actif || nouveauProduitDB.statut === 'actif',
                    est_nouveau: nouveauProduitDB.est_nouveau,
                    est_en_promotion: nouveauProduitDB.est_en_promotion,
                    est_featured: nouveauProduitDB.est_featured,
                    note_moyenne: 0,
                    nombre_avis: 0,
                    nombre_ventes: 0,
                    date_creation: nouveauProduitDB.date_creation.toString(),
                    categorie_nom: categories.find(c => c.id === nouveauProduitDB.categorie_id)?.nom || 'Sans catégorie',
                    boutique: {
                        id: boutique!.id,
                        nom: boutique!.nom,
                        logo: boutique!.logo,
                        slug: boutique!.slug
                    },
                    categorie: {
                        id: nouveauProduitDB.categorie_id,
                        nom: categories.find(c => c.id === nouveauProduitDB.categorie_id)?.nom || 'Sans catégorie',
                        slug: categories.find(c => c.id === nouveauProduitDB.categorie_id)?.slug || 'sans-categorie'
                    }
                };

                console.log(nouveauProduit);
                
                setProducts(prev => [...prev, nouveauProduit]);
                success('Produit créé avec succès', 'Succès');
            }
        } catch (error: any) {
            showError(error.message || 'Erreur lors de la sauvegarde', 'Erreur');
        }
    };

    const formatPrice = (priceInCentimes: number) => {
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'XAF',
            minimumFractionDigits: 0
        }).format(priceInCentimes); // Suppression de la division par 100
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
                    <p className="text-gray-600">Chargement des produits...</p>
                </div>
            </div>
        );
    }

    if (!boutique) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Boutique non trouvée</p>
                </div>
            </div>
        );
    }

    return (
        <div className="h-screen bg-gray-50 flex overflow-hidden">
            <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
            <ToastContainer toasts={toasts} onClose={removeToast} />

            {/* Sidebar */}
            <Sidebar
                boutique={boutique}
                isMobileMenuOpen={isMobileMenuOpen}
                onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            />

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-h-0">
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
                                <h1 className="text-lg lg:text-2xl font-bold text-gray-900 truncate">Produits</h1>
                                <p className="text-xs lg:text-sm text-gray-500 mt-0.5 lg:mt-1 truncate">
                                    Gérez les produits de votre boutique {boutique.nom}
                                </p>
                            </div>
                        </div>

                        <button
                            onClick={handleCreateProduct}
                            className="flex items-center px-3 lg:px-4 py-1.5 lg:py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors text-sm lg:text-base flex-shrink-0 ml-2"
                        >
                            <Plus className="h-3 w-3 lg:h-4 lg:w-4 mr-1 lg:mr-2" />
                            <span className="hidden sm:inline">Nouveau produit</span>
                            <span className="sm:hidden">Créer</span>
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4 lg:p-6">
                    {/* Search and Filters */}
                    <div className="mb-6 space-y-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Rechercher un produit..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                            />
                        </div>

                        {/* Contrôles de pagination et tri */}
                        <div className="mb-6 pt-6 flex flex-col hidden sm:inline flex-row gap-4 items-start sm:items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                    <label className="text-sm text-gray-600">Trier par:</label>
                                    <select
                                        value={sortBy}
                                        onChange={(e) => setSortBy(e.target.value)}
                                        className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                                    >
                                        <option value="date_creation">Date de création</option>
                                        <option value="nom">Nom</option>
                                        <option value="prix">Prix</option>
                                        <option value="nombre_ventes">Ventes</option>
                                        <option value="note_moyenne">Note</option>
                                    </select>
                                </div>

                                <div className="flex items-center gap-2">
                                    <label className="text-sm text-gray-600">Ordre:</label>
                                    <select
                                        value={sortOrder}
                                        onChange={(e) => setSortOrder(e.target.value as 'ASC' | 'DESC')}
                                        className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                                    >
                                        <option value="DESC">Décroissant</option>
                                        <option value="ASC">Croissant</option>
                                    </select>
                                </div>

                                <div className="flex items-center gap-2">
                                    <label className="text-sm text-gray-600">Par page:</label>
                                    <select
                                        value={pageSize}
                                        onChange={(e) => {
                                            setPageSize(Number(e.target.value));
                                            setCurrentPage(1);
                                        }}
                                        className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                                    >
                                        <option value={5}>5</option>
                                        <option value={10}>10</option>
                                        <option value={20}>20</option>
                                        <option value={50}>50</option>
                                    </select>
                                </div>
                            </div>

                            <div className="text-sm text-gray-600">
                                {totalProducts > 0 && (
                                    <>
                                        Affichage de {((currentPage - 1) * pageSize) + 1} à {Math.min(currentPage * pageSize, totalProducts)} sur {totalProducts} produits
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Filters and View Toggle */}
                        <div className="flex flex-col pt-3 sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                            {/* Status Filter */}
                            <div className="flex space-x-2">
                                <button
                                    onClick={() => setFilterStatus('all')}
                                    className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${filterStatus === 'all'
                                        ? 'bg-black text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                >
                                    Tous ({products.length})
                                </button>
                                <button
                                    onClick={() => setFilterStatus('active')}
                                    className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${filterStatus === 'active'
                                        ? 'bg-green-600 text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                >
                                    Actifs ({products.filter(p => p.actif).length})
                                </button>
                                <button
                                    onClick={() => setFilterStatus('inactive')}
                                    className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${filterStatus === 'inactive'
                                        ? 'bg-red-600 text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                >
                                    Inactifs ({products.filter(p => !p.actif).length})
                                </button>
                            </div>

                            {/* View Toggle */}
                            <div className="flex items-center space-x-2">
                                <span className="text-sm text-gray-600">Affichage :</span>
                                <div className="flex rounded-lg border border-gray-300 overflow-hidden">
                                    <button
                                        onClick={() => setGroupByCategory(true)}
                                        className={`px-3 py-1.5 text-sm transition-colors flex items-center ${groupByCategory
                                            ? 'bg-black text-white'
                                            : 'bg-white text-gray-700 hover:bg-gray-50'
                                            }`}
                                    >
                                        <Grid3X3 className="h-4 w-4 mr-1" />
                                        Par catégories
                                    </button>
                                    <button
                                        onClick={() => setGroupByCategory(false)}
                                        className={`px-3 py-1.5 text-sm transition-colors flex items-center border-l border-gray-300 ${!groupByCategory
                                            ? 'bg-black text-white'
                                            : 'bg-white text-gray-700 hover:bg-gray-50'
                                            }`}
                                    >
                                        <List className="h-4 w-4 mr-1" />
                                        Liste simple
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Products List - Desktop Table with Category Grouping */}
                    <div className="hidden lg:block space-y-6">
                        {Object.entries(groupedProducts).map(([categoryName, categoryProducts], index) => (
                            <div
                                key={categoryName}
                                className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden transform transition-all duration-300 hover:shadow-md"
                                style={{
                                    animationDelay: `${index * 100}ms`,
                                    animation: 'fadeInUp 0.5s ease-out forwards'
                                }}
                            >
                                {/* Category Header */}
                                <div className={`px-6 py-4 border-b border-gray-200 ${getCategoryColor(categoryName)} transition-all duration-200 hover:opacity-90`}>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center">
                                            <span className="text-2xl mr-3">{getCategoryIcon(categoryName)}</span>
                                            <div>
                                                <h3 className="text-lg font-semibold">{categoryName}</h3>
                                                <div className="flex items-center space-x-4 text-sm opacity-75 mt-1">
                                                    <span>{categoryProducts.length} produit{categoryProducts.length > 1 ? 's' : ''}</span>
                                                    <span>•</span>
                                                    <span>{categoryProducts.filter(p => p.actif).length} actif{categoryProducts.filter(p => p.actif).length > 1 ? 's' : ''}</span>
                                                    <span>•</span>
                                                    <span>{categoryProducts.filter(p => p.en_stock).length} en stock</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-sm font-medium">
                                                {categoryProducts.reduce((sum, p) => sum + p.nombre_ventes, 0)} ventes
                                            </div>
                                            <div className="text-xs opacity-75 mt-1">
                                                Note moy. {(categoryProducts.reduce((sum, p) => sum + p.note_moyenne, 0) / categoryProducts.length).toFixed(1)}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Products Table */}
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Produit
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Prix
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Stock
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Statut
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Performance
                                                </th>
                                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {categoryProducts.map((product) => (
                                                <tr key={product.id} className="hover:bg-gray-50">
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center">
                                                            <div className="h-12 w-12 flex-shrink-0">
                                                                {product.image_principale ? (
                                                                    <img
                                                                        className="h-12 w-12 rounded-lg object-cover"
                                                                        src={product.image_principale}
                                                                        alt={product.nom}
                                                                    />
                                                                ) : (
                                                                    <div className="h-12 w-12 rounded-lg bg-gray-200 flex items-center justify-center">
                                                                        <Package className="h-6 w-6 text-gray-400" />
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div className="ml-4">
                                                                <div className="flex items-center">
                                                                    <div className="text-sm font-medium text-gray-900">{product.nom}</div>
                                                                    <div className="flex ml-2 space-x-1">
                                                                        {product.est_nouveau && (
                                                                            <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                                                Nouveau
                                                                            </span>
                                                                        )}
                                                                        {product.est_en_promotion && (
                                                                            <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                                                                Promo
                                                                            </span>
                                                                        )}
                                                                        {product.est_featured && (
                                                                            <Star className="h-4 w-4 text-yellow-500 fill-current" />
                                                                        )}
                                                                    </div>
                                                                </div>
                                                                <div className="text-sm text-gray-500">{product.description}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm text-gray-900">{formatPrice(product.prix)}</div>
                                                        {product.prix_original && (
                                                            <div className="text-sm text-gray-500 line-through">{formatPrice(product.prix_original)}</div>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className={`text-sm ${product.en_stock ? 'text-green-600' : 'text-red-600'}`}>
                                                            {product.en_stock ? `${product.quantite_stock} en stock` : 'Rupture'}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${product.actif
                                                            ? 'bg-green-100 text-green-800'
                                                            : 'bg-gray-100 text-gray-800'
                                                            }`}>
                                                            {product.actif ? 'Actif' : 'Inactif'}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center text-sm text-gray-900">
                                                            <Star className="h-4 w-4 text-yellow-400 mr-1" />
                                                            {product.note_moyenne} ({product.nombre_avis})
                                                        </div>
                                                        <div className="text-sm text-gray-500">
                                                            {product.nombre_ventes} ventes
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                        <div className="flex items-center justify-end space-x-2">
                                                            <button
                                                                onClick={() => toggleProductStatus(product.id)}
                                                                className={`p-1.5 rounded-lg transition-colors ${product.actif
                                                                    ? 'text-green-600 hover:bg-green-50'
                                                                    : 'text-gray-400 hover:bg-gray-50'
                                                                    }`}
                                                                title={product.actif ? 'Désactiver' : 'Activer'}
                                                            >
                                                                {product.actif ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                                                            </button>
                                                            <button
                                                                onClick={() => handleEditProduct(product)}
                                                                className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors"
                                                                title="Modifier"
                                                            >
                                                                <Edit className="h-4 w-4" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteClick(product)}
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
                        ))}
                    </div>

                    {/* Products Cards - Mobile with Category Grouping */}
                    <div className="lg:hidden space-y-6">
                        {Object.entries(groupedProducts).map(([categoryName, categoryProducts]) => (
                            <div key={categoryName} className="space-y-3">
                                {/* Category Header - Mobile */}
                                <div className={`rounded-lg p-4 ${getCategoryColor(categoryName)}`}>
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center">
                                            <span className="text-xl mr-2">{getCategoryIcon(categoryName)}</span>
                                            <div>
                                                <h3 className="font-semibold">{categoryName}</h3>
                                                <div className="flex items-center space-x-2 text-xs opacity-75 mt-1">
                                                    <span>{categoryProducts.length} produit{categoryProducts.length > 1 ? 's' : ''}</span>
                                                    <span>•</span>
                                                    <span>{categoryProducts.filter(p => p.actif).length} actif{categoryProducts.filter(p => p.actif).length > 1 ? 's' : ''}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right text-xs">
                                            <div className="font-medium">
                                                {categoryProducts.reduce((sum, p) => sum + p.nombre_ventes, 0)} ventes
                                            </div>
                                            <div className="opacity-75 mt-1">
                                                ★ {(categoryProducts.reduce((sum, p) => sum + p.note_moyenne, 0) / categoryProducts.length).toFixed(1)}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Progress bar for active products */}
                                    <div className="w-full bg-white bg-opacity-30 rounded-full h-1.5">
                                        <div
                                            className="bg-white bg-opacity-80 h-1.5 rounded-full transition-all duration-300"
                                            style={{
                                                width: `${(categoryProducts.filter(p => p.actif).length / categoryProducts.length) * 100}%`
                                            }}
                                        ></div>
                                    </div>
                                </div>

                                {/* Products Cards */}
                                <div className="space-y-3">
                                    {categoryProducts.map((product) => (
                                        <div
                                            key={product.id}
                                            className="bg-white rounded-lg shadow-sm border border-gray-200 p-3"
                                        >
                                            <div className="flex items-start space-x-3 mb-3">
                                                <div className="h-16 w-16 flex-shrink-0">
                                                    {product.image_principale ? (
                                                        <img
                                                            className="h-16 w-16 rounded-lg object-cover"
                                                            src={product.image_principale}
                                                            alt={product.nom}
                                                        />
                                                    ) : (
                                                        <div className="h-16 w-16 rounded-lg bg-gray-200 flex items-center justify-center">
                                                            <Package className="h-8 w-8 text-gray-400" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-start justify-between">
                                                        <div>
                                                            <h3 className="text-sm font-medium text-gray-900 truncate">{product.nom}</h3>
                                                            <p className="text-xs text-gray-500 mt-1 line-clamp-2">{product.description}</p>
                                                            <div className="flex items-center mt-1 space-x-2">
                                                                <span className="text-sm font-semibold text-gray-900">{formatPrice(product.prix)}</span>
                                                                {product.prix_original && (
                                                                    <span className="text-xs text-gray-500 line-through">{formatPrice(product.prix_original)}</span>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center space-x-1 flex-shrink-0">
                                                            <button
                                                                onClick={() => toggleProductStatus(product.id)}
                                                                className={`p-1 rounded-lg transition-colors ${product.actif
                                                                    ? 'text-green-600 hover:bg-green-50'
                                                                    : 'text-gray-400 hover:bg-gray-50'
                                                                    }`}
                                                            >
                                                                {product.actif ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                                                            </button>
                                                            <button
                                                                onClick={() => handleEditProduct(product)}
                                                                className="p-1 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors"
                                                            >
                                                                <Edit className="h-3 w-3" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteClick(product)}
                                                                className="p-1 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                                                            >
                                                                <Trash2 className="h-3 w-3" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between text-xs">
                                                <div className="flex items-center space-x-2">
                                                    <span className={`${product.en_stock ? 'text-green-600' : 'text-red-600'}`}>
                                                        {product.en_stock ? `${product.quantite_stock} en stock` : 'Rupture'}
                                                    </span>
                                                    <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium ${product.actif
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-gray-100 text-gray-800'
                                                        }`}>
                                                        {product.actif ? 'Actif' : 'Inactif'}
                                                    </span>
                                                </div>
                                                <div className="flex items-center space-x-2 text-gray-500">
                                                    <div className="flex items-center">
                                                        <Star className="h-3 w-3 text-yellow-400 mr-1" />
                                                        {product.note_moyenne}
                                                    </div>
                                                    <span>{product.nombre_ventes} ventes</span>
                                                </div>
                                            </div>

                                            {/* Badges */}
                                            {(product.est_nouveau || product.est_en_promotion || product.est_featured) && (
                                                <div className="flex space-x-1 mt-2">
                                                    {product.est_nouveau && (
                                                        <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                            Nouveau
                                                        </span>
                                                    )}
                                                    {product.est_en_promotion && (
                                                        <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                                            Promo
                                                        </span>
                                                    )}
                                                    {product.est_featured && (
                                                        <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                                            <Star className="h-3 w-3 mr-1" />
                                                            Vedette
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Empty State */}
                    {filteredProducts.length === 0 && !isLoading && (
                        <div className="text-center py-12">
                            <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun produit trouvé</h3>
                            <p className="text-gray-500 mb-6">
                                {searchTerm || filterStatus !== 'all'
                                    ? 'Aucun produit ne correspond à vos critères de recherche.'
                                    : 'Commencez par ajouter votre premier produit.'
                                }
                            </p>
                            <button
                                onClick={handleCreateProduct}
                                className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Ajouter un produit
                            </button>
                        </div>
                    )}

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="mt-8 flex items-center justify-between border-t border-gray-200 pt-6">
                            <div className="flex items-center">
                                <p className="text-sm text-gray-700">
                                    Page <span className="font-medium">{currentPage}</span> sur{' '}
                                    <span className="font-medium">{totalPages}</span>
                                </p>
                            </div>

                            <div className="flex items-center space-x-2">
                                <button
                                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                    disabled={currentPage === 1}
                                    className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Précédent
                                </button>

                                {/* Numéros de page */}
                                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                    let pageNum;
                                    if (totalPages <= 5) {
                                        pageNum = i + 1;
                                    } else if (currentPage <= 3) {
                                        pageNum = i + 1;
                                    } else if (currentPage >= totalPages - 2) {
                                        pageNum = totalPages - 4 + i;
                                    } else {
                                        pageNum = currentPage - 2 + i;
                                    }

                                    return (
                                        <button
                                            key={pageNum}
                                            onClick={() => setCurrentPage(pageNum)}
                                            className={`px-3 py-2 text-sm font-medium rounded-md ${pageNum === currentPage
                                                ? 'bg-green-600 text-white'
                                                : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                                                }`}
                                        >
                                            {pageNum}
                                        </button>
                                    );
                                })}

                                <button
                                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                                    disabled={currentPage === totalPages}
                                    className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Suivant
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal de confirmation */}
            <ConfirmationModal
                isOpen={showDeleteModal}
                onClose={() => {
                    setShowDeleteModal(false);
                    setProductToDelete(null);
                }}
                onConfirm={confirmDelete}
                title="Supprimer le produit"
                message={`Êtes-vous sûr de vouloir supprimer le produit "${productToDelete?.nom}" ? Cette action est irréversible.`}
                confirmText="Supprimer"
                cancelText="Annuler"
                type="danger"
            />

            {/* Modal de produit */}
            <ProduitModal
                isOpen={showProductModal}
                onClose={() => {
                    setShowProductModal(false);
                    setProductToEdit(null);
                }}
                onSave={handleSaveProduct}
                produit={productToEdit}
                categories={categories}
                boutiqueId={boutique?.id || 0}
                boutiqueSlug={boutique?.slug || ''}
            />
        </div>
    );
}
