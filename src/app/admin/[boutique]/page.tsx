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
import { getCommunesParBoutique } from '@/lib/services/communes';
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
  Menu,
  AlertCircle,
  Truck,
  Download,
  X,
  Share,
  Square
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
  const [totalCommunes, setTotalCommunes] = useState(0);
  const [recentProducts, setRecentProducts] = useState<any[]>([]);

  // États pour le bouton PWA
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPWAButton, setShowPWAButton] = useState(false);
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  // Détecter PWA et système d'exploitation
  useEffect(() => {
    // Enregistrer le Service Worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('Service Worker enregistré:', registration);
        })
        .catch((error) => {
          console.log('Erreur enregistrement Service Worker:', error);
        });
    }

    // Vérifier si l'app est déjà installée
    const isInStandaloneMode = window.matchMedia('(display-mode: standalone)').matches 
      || (window.navigator as any).standalone 
      || document.referrer.includes('android-app://');
    
    setIsStandalone(isInStandaloneMode);

    // Détecter iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(iOS);

    // Si déjà installé, ne pas afficher le bouton
    if (isInStandaloneMode) {
      setShowPWAButton(false);
      return;
    }

    // Pour iOS, toujours afficher le bouton (sauf si déjà installé)
    if (iOS) {
      setShowPWAButton(true);
      return;
    }

    // Pour Android/Desktop, écouter l'événement beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPWAButton(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Masquer le bouton après installation et rediriger vers l'admin
    window.addEventListener('appinstalled', () => {
      setShowPWAButton(false);
      setDeferredPrompt(null);
      success('Application installée avec succès !', 'Installation réussie');
      
      // Rediriger vers la page admin après installation
      setTimeout(() => {
        if (boutique?.slug) {
          window.location.href = `${window.location.origin}/admin/${boutique.slug}`;
        }
      }, 1000);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, [success, boutique?.slug]);

  const handleInstallPWA = async () => {
    if (isIOS) {
      // Afficher les instructions pour iOS
      setShowIOSInstructions(true);
      return;
    }

    if (!deferredPrompt) {
      // Si pas de prompt, simplement ouvrir l'URL admin dans un nouvel onglet
      // pour que l'utilisateur puisse l'ajouter manuellement
      const adminUrl = `${window.location.origin}/admin/${boutique?.slug}`;
      window.open(adminUrl, '_blank');
      success('Ouvrez ce lien dans un nouvel onglet pour installer l\'application', 'Installation');
      return;
    }

    // Afficher la boîte de dialogue d'installation
    deferredPrompt.prompt();

    // Attendre le choix de l'utilisateur
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      success('Installation en cours...', 'PWA');
    }

    setDeferredPrompt(null);
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
        
        // Charger les communes
        const communesData = await getCommunesParBoutique(boutiqueId);
        setTotalCommunes(communesData.length || 0);
        
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

          {/* Alertes de configuration */}
          {(stats.totalProduits === 0 || totalCommunes === 0) && (
            <div className="mb-6 space-y-3">
              {stats.totalProduits === 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                    <div className="ml-3 flex-1">
                      <h3 className="text-sm font-semibold text-amber-900">
                        Aucun produit dans votre boutique
                      </h3>
                      <p className="mt-1 text-sm text-amber-700">
                        Commencez par ajouter des produits pour que vos clients puissent passer des commandes.
                      </p>
                      <button
                        onClick={() => router.push(`/admin/${boutique?.slug}/products`)}
                        className="mt-3 inline-flex items-center px-3 py-1.5 bg-amber-600 text-white text-sm font-medium rounded-lg hover:bg-amber-700 transition-colors"
                      >
                        <Plus className="h-4 w-4 mr-1.5" />
                        Ajouter un produit
                      </button>
                    </div>
                  </div>
                </div>
              )}
              
              {totalCommunes === 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="ml-3 flex-1">
                      <h3 className="text-sm font-semibold text-blue-900">
                        Aucune zone de livraison configurée
                      </h3>
                      <p className="mt-1 text-sm text-blue-700">
                        Ajoutez des communes et leurs frais de livraison pour permettre à vos clients de commander.
                      </p>
                      <button
                        onClick={() => router.push(`/admin/${boutique?.slug}/shipping`)}
                        className="mt-3 inline-flex items-center px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <Truck className="h-4 w-4 mr-1.5" />
                        Configurer la livraison
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-6 sm:mb-8">
            <div className="bg-white p-3 sm:p-4 md:p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex items-center">
                <div className="p-1.5 sm:p-2 bg-blue-100 rounded-lg flex-shrink-0">
                  <Package className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-blue-600" />
                </div>
                <div className="ml-2 sm:ml-3 md:ml-4 min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Produits</p>
                  <p className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">{stats.totalProduits}</p>
                  <p className="text-xs text-gray-500 mt-0.5 hidden sm:block">{stats.produitsActifs} actifs</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-3 sm:p-4 md:p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex items-center">
                <div className="p-1.5 sm:p-2 bg-green-100 rounded-lg flex-shrink-0">
                  <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-green-600" />
                </div>
                <div className="ml-2 sm:ml-3 md:ml-4 min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Commandes</p>
                  <p className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">{stats.totalCommandes}</p>
                  <p className="text-xs text-gray-500 mt-0.5 hidden sm:block">En attente</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-3 sm:p-4 md:p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex items-center">
                <div className="p-1.5 sm:p-2 bg-purple-100 rounded-lg flex-shrink-0">
                  <Users className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-purple-600" />
                </div>
                <div className="ml-2 sm:ml-3 md:ml-4 min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Catégories</p>
                  <p className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">{stats.totalCategories}</p>
                  <p className="text-xs text-gray-500 mt-0.5 hidden sm:block">Catégories actives</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-3 sm:p-4 md:p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex items-center">
                <div className="p-1.5 sm:p-2 bg-orange-100 rounded-lg flex-shrink-0">
                  <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-orange-600" />
                </div>
                <div className="ml-2 sm:ml-3 md:ml-4 min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Stock faible</p>
                  <p className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">{stats.produitsEnRupture}</p>
                  <p className="text-xs text-gray-500 mt-0.5 hidden sm:block">Produits en rupture</p>
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
                  Ajouter mon premier produit
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bouton flottant PWA */}
      {showPWAButton && !isStandalone && (
        <button
          onClick={handleInstallPWA}
          className="fixed bottom-6 right-6 bg-black text-white px-4 py-3 rounded-full shadow-lg hover:bg-gray-800 transition-all hover:scale-105 z-50 flex items-center justify-center gap-2 group"
          aria-label="Installer l'application"
        >
          <Download className="h-5 w-5 flex-shrink-0" />
          <span className="text-sm font-medium whitespace-nowrap">
            Installer
          </span>
        </button>
      )}

      {/* Modal des instructions iOS */}
      {showIOSInstructions && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[80vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900">
                Installer {boutique.nom}
              </h3>
              <button
                onClick={() => setShowIOSInstructions(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Fermer"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                  <Download className="h-8 w-8 text-blue-600" />
                </div>
                <p className="text-gray-600">
                  Pour installer cette application sur votre iPhone ou iPad, suivez ces étapes :
                </p>
              </div>

              <div className="space-y-4">
                
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-8 h-8 bg-black text-white rounded-full flex items-center justify-center font-bold text-sm">
                    1
                  </div>
                  <div className="ml-4 flex-1">
                    <p className="text-gray-900 font-medium mb-1">
                      Appuyez sur le bouton Partager
                    </p>
                    <div className="flex items-center space-x-2 mt-2">
                      <div className="p-2 bg-blue-50 rounded-lg">
                        <Share className="h-5 w-5 text-blue-600" />
                      </div>
                      <p className="text-sm text-gray-600">
                        (icône en bas de l'écran)
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0 w-8 h-8 bg-black text-white rounded-full flex items-center justify-center font-bold text-sm">
                    2
                  </div>
                  <div className="ml-4 flex-1">
                    <p className="text-gray-900 font-medium mb-1">
                      Sélectionnez "Sur l'écran d'accueil"
                    </p>
                    <div className="flex items-center space-x-2 mt-2">
                      <div className="p-2 bg-green-50 rounded-lg">
                        <Square className="h-5 w-5 text-green-600" />
                      </div>
                      <p className="text-sm text-gray-600">
                        Dans le menu qui s'affiche
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0 w-8 h-8 bg-black text-white rounded-full flex items-center justify-center font-bold text-sm">
                    3
                  </div>
                  <div className="ml-4 flex-1">
                    <p className="text-gray-900 font-medium mb-1">
                      Confirmez l'installation
                    </p>
                    <p className="text-sm text-gray-600">
                      Appuyez sur "Ajouter" en haut à droite
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-900">
                  <span className="font-semibold">💡 Astuce :</span> Une fois installée, l'application apparaîtra comme Ma Boutique sur votre écran d'accueil et fonctionnera comme une application .
                </p>
              </div>

              <button
                onClick={() => setShowIOSInstructions(false)}
                className="w-full bg-black text-white py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors"
              >
                J'ai compris
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}