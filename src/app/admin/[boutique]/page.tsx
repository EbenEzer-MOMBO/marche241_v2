'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { BoutiqueData } from '@/lib/services/auth';
import { ToastContainer } from '@/components/ui/Toast';
import { useToast } from '@/hooks/useToast';
import Sidebar from '@/components/admin/Sidebar';
import { getProduitsParBoutique, ProduitsResponse } from '@/lib/services/products';
import { getCategoriesParBoutique } from '@/lib/services/categories';
import { getStatistiquesDashboard, StatistiquesDashboard } from '@/lib/services/statistiques';
import { ChartEvolutionCA } from '@/components/admin/ChartEvolutionCA';
import { ChartRepartitionCommandes } from '@/components/admin/ChartRepartitionCommandes';
import {
  Package,
  ShoppingCart,
  Users,
  TrendingUp,
  Plus,
  Eye,
  Store,
  Menu
} from 'lucide-react';

export default function BoutiqueDashboard() {
  const router = useRouter();
  const params = useParams();
  const boutiqueName = params.boutique as string;
  
  const { user, verifierBoutique } = useAuth();
  const { toasts, removeToast, success, error: showError } = useToast();
  
  const [boutique, setBoutique] = useState<BoutiqueData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [periode, setPeriode] = useState<number>(7);
  const [statistiques, setStatistiques] = useState<StatistiquesDashboard | null>(null);
  const [stats, setStats] = useState({
    totalProduits: 0,
    totalCommandes: 0,
    totalCategories: 0,
    produitsActifs: 0,
    produitsEnRupture: 0
  });
  const [recentProducts, setRecentProducts] = useState<any[]>([]);

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

        // Vérifier si le slug de la boutique dans l'URL correspond
        if (boutiqueName !== boutiqueData.slug) {
          router.replace(`/admin/${boutiqueData.slug}`);
          return;
        }

        setBoutique(boutiqueData);
        
        // Charger les statistiques
        await loadStats(boutiqueData.id);
      } catch (error) {
        console.error('Erreur lors du chargement de la boutique:', error);
        showError('Erreur lors du chargement de la boutique', 'Erreur');
      } finally {
        setIsLoading(false);
      }
    };

    const loadStats = async (boutiqueId: number) => {
      try {
        // Charger les produits
        const produitsData = await getProduitsParBoutique(boutiqueId, { limite: 5 });
        
        // Charger les catégories
        const categoriesData = await getCategoriesParBoutique(boutiqueId);
        
        // Charger les statistiques complètes
        const statsData = await getStatistiquesDashboard(boutiqueId, periode);
        setStatistiques(statsData);
        
        // Calculer les statistiques
        const produitsActifs = produitsData.donnees.filter(p => p.statut === 'actif').length;
        const produitsEnRupture = produitsData.donnees.filter(p => Number(p.en_stock) === 0).length;
        
        setStats({
          totalProduits: produitsData.total || 0,
          totalCommandes: statsData.total_commandes || 0,
          totalCategories: categoriesData.length || 0,
          produitsActifs,
          produitsEnRupture
        });
        
        // Garder les 5 produits les plus récents
        setRecentProducts(produitsData.donnees.slice(0, 5));
      } catch (error) {
        console.error('Erreur lors du chargement des statistiques:', error);
      }
    };

    // Délai pour s'assurer que user est bien chargé
    const timer = setTimeout(() => {
      loadBoutiqueData();
    }, 100);

    return () => clearTimeout(timer);
  }, [user, boutiqueName, router, verifierBoutique, showError]);

  // Recharger les statistiques quand la période change
  useEffect(() => {
    const reloadStatistiques = async () => {
      if (!boutique?.id) return;

      try {
        const statsData = await getStatistiquesDashboard(boutique.id, periode);
        setStatistiques(statsData);
        
        // Mettre à jour aussi le nombre total de commandes
        setStats(prev => ({
          ...prev,
          totalCommandes: statsData.total_commandes || 0
        }));
      } catch (error) {
        console.error('Erreur lors du rechargement des statistiques:', error);
      }
    };

    reloadStatistiques();
  }, [periode, boutique?.id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement de votre boutique...</p>
        </div>
      </div>
    );
  }

  if (!boutique) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Store className="h-16 w-16 text-gray-400 mx-auto mb-4" />
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
        <div className="bg-white shadow-sm border-b px-3 sm:px-4 lg:px-6 py-3 lg:py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center min-w-0 flex-1">
              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-1.5 rounded-lg hover:bg-gray-100 transition-colors mr-2 flex-shrink-0"
              >
                <Menu className="h-5 w-5 text-gray-600" />
              </button>
              
              <div className="min-w-0 flex-1">
                <h1 className="text-lg lg:text-2xl font-bold text-gray-900 truncate">Tableau de bord</h1>
                <p className="text-xs lg:text-sm text-gray-500 mt-0.5 lg:mt-1 truncate">
                  Vue d'ensemble de votre boutique {boutique.nom}
                </p>
              </div>
            </div>
            
            <button
              onClick={() => window.open(`/${boutique.slug}`, '_blank')}
              className="flex items-center px-2 lg:px-4 py-1.5 lg:py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors text-sm lg:text-base flex-shrink-0 ml-2"
            >
              <Eye className="h-3 w-3 lg:h-4 lg:w-4 mr-1 lg:mr-2" />
              <span className="hidden sm:inline">Voir ma boutique</span>
              <span className="sm:hidden">Voir</span>
            </button>
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-3 sm:p-4 lg:p-6">
          {/* Sélecteur de période */}
          <div className="mb-4 sm:mb-6 flex justify-end">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 inline-flex">
              <button
                onClick={() => setPeriode(7)}
                className={`px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium transition-colors ${
                  periode === 7
                    ? 'bg-black text-white'
                    : 'text-gray-700 hover:bg-gray-50'
                } rounded-l-lg`}
              >
                7 jours
              </button>
              <button
                onClick={() => setPeriode(30)}
                className={`px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium transition-colors border-x border-gray-200 ${
                  periode === 30
                    ? 'bg-black text-white'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                30 jours
              </button>
              <button
                onClick={() => setPeriode(90)}
                className={`px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium transition-colors ${
                  periode === 90
                    ? 'bg-black text-white'
                    : 'text-gray-700 hover:bg-gray-50'
                } rounded-r-lg`}
              >
                90 jours
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">
                  <Package className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                </div>
                <div className="ml-3 sm:ml-4 min-w-0">
                  <p className="text-sm font-medium text-gray-600 truncate">Produits</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.totalProduits}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{stats.produitsActifs} actifs</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg flex-shrink-0">
                  <ShoppingCart className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                </div>
                <div className="ml-3 sm:ml-4 min-w-0">
                  <p className="text-sm font-medium text-gray-600 truncate">Commandes</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.totalCommandes}</p>
                  <p className="text-xs text-gray-500 mt-0.5">En attente</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg flex-shrink-0">
                  <Users className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
                </div>
                <div className="ml-3 sm:ml-4 min-w-0">
                  <p className="text-sm font-medium text-gray-600 truncate">Catégories</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.totalCategories}</p>
                  <p className="text-xs text-gray-500 mt-0.5">Catégories actives</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex items-center">
                <div className="p-2 bg-orange-100 rounded-lg flex-shrink-0">
                  <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-orange-600" />
                </div>
                <div className="ml-3 sm:ml-4 min-w-0">
                  <p className="text-sm font-medium text-gray-600 truncate">Stock faible</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.produitsEnRupture}</p>
                  <p className="text-xs text-gray-500 mt-0.5">Produits en rupture</p>
                </div>
              </div>
            </div>
          </div>

          {/* Graphiques */}
          {statistiques && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
              {/* Graphique Évolution du CA */}
              <ChartEvolutionCA
                data={statistiques.ca_evolution}
                caTotal={statistiques.ca_total}
                variation={statistiques.variation_ca}
              />

              {/* Graphique Répartition des commandes */}
              {statistiques.commandes_par_statut.length > 0 && (
                <ChartRepartitionCommandes data={statistiques.commandes_par_statut} />
              )}
            </div>
          )}

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 mb-6 sm:mb-8">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 sm:mb-6">Actions rapides</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              <button
                onClick={() => router.push(`/admin/${boutique.slug}/products`)}
                className="flex items-center justify-center p-4 sm:p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all group"
              >
                <Plus className="h-5 w-5 sm:h-6 sm:w-6 text-gray-400 group-hover:text-blue-500 mr-2 sm:mr-3" />
                <span className="text-sm sm:text-base text-gray-600 group-hover:text-blue-600 font-medium">Gérer les produits</span>
              </button>
              
              <button
                onClick={() => router.push(`/admin/${boutique.slug}/orders`)}
                className="flex items-center justify-center p-4 sm:p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all group"
              >
                <ShoppingCart className="h-5 w-5 sm:h-6 sm:w-6 text-gray-400 group-hover:text-green-500 mr-2 sm:mr-3" />
                <span className="text-sm sm:text-base text-gray-600 group-hover:text-green-600 font-medium">Voir les commandes</span>
              </button>
              
              <button
                onClick={() => router.push(`/admin/${boutique.slug}/categories`)}
                className="flex items-center justify-center p-4 sm:p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-all group"
              >
                <Package className="h-5 w-5 sm:h-6 sm:w-6 text-gray-400 group-hover:text-purple-500 mr-2 sm:mr-3" />
                <span className="text-sm sm:text-base text-gray-600 group-hover:text-purple-600 font-medium">Gérer les catégories</span>
              </button>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900">Produits récents</h2>
              <button
                onClick={() => router.push(`/admin/${boutique.slug}/products`)}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Voir tout
              </button>
            </div>
            
            {recentProducts.length > 0 ? (
              <div className="space-y-3">
                {recentProducts.map((produit) => (
                  <div
                    key={produit.id}
                    className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => {}}
                  >
                    <div className="flex-shrink-0 h-12 w-12 sm:h-16 sm:w-16 bg-gray-100 rounded-lg overflow-hidden">
                      {produit.image_principale ? (
                        <img
                          src={produit.image_principale}
                          alt={produit.nom}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center">
                          <Package className="h-6 w-6 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="ml-3 flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{produit.nom}</p>
                      <p className="text-sm text-gray-500">{produit.prix.toLocaleString()} FCFA</p>
                    </div>
                    <div className="flex-shrink-0 ml-2">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        produit.statut === 'actif' 
                          ? 'bg-green-100 text-green-800' 
                          : produit.statut === 'inactif'
                          ? 'bg-gray-100 text-gray-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {produit.statut === 'actif' ? 'Actif' : produit.statut === 'inactif' ? 'Inactif' : 'Brouillon'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 sm:py-12">
                <div className="mx-auto h-12 w-12 sm:h-16 sm:w-16 bg-gray-100 rounded-full flex items-center justify-center mb-3 sm:mb-4">
                  <Package className="h-6 w-6 sm:h-8 sm:w-8 text-gray-400" />
                </div>
                <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">Aucun produit</h3>
                <p className="text-sm sm:text-base text-gray-500 mb-4 sm:mb-6">
                  Commencez par ajouter vos premiers produits à votre boutique
                </p>
                <button
                  onClick={() => router.push(`/admin/${boutique.slug}/products/new`)}
                  className="inline-flex items-center px-3 sm:px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors text-sm sm:text-base"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter mon premier produit v
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
