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
import { getProduitsLesPlusVus, ProduitPopulaire } from '@/lib/services/vues';
import { ChartEvolutionCA } from '@/components/admin/ChartEvolutionCA';
import { ChartRepartitionCommandes } from '@/components/admin/ChartRepartitionCommandes';
import { StatsCard } from '@/components/admin/dashboard/StatsCard';
import { PeriodSelector } from '@/components/admin/dashboard/PeriodSelector';
import { ConfigAlert } from '@/components/admin/dashboard/ConfigAlert';
import { QuickActions } from '@/components/admin/dashboard/QuickActions';
import { RecentProducts } from '@/components/admin/dashboard/RecentProducts';
import { TopViewedProducts } from '@/components/admin/dashboard/TopViewedProducts';
import {
  Package,
  ShoppingCart,
  Users,
  TrendingUp,
  Eye,
  Store,
  Menu,
  Download,
  X,
  Share,
  Square,
  BarChart3
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
  const [topViewedProducts, setTopViewedProducts] = useState<ProduitPopulaire[]>([]);

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
      // Si pas de prompt, ouvrir l'URL racine pour installer depuis là
      const rootUrl = window.location.origin;
      window.open(rootUrl, '_blank');
      success('Ouvrez la page d\'accueil pour installer l\'application', 'Installation');
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
      // Vérifier d'abord si un token existe
      const token = localStorage.getItem('admin_token');
      if (!token) {
        console.log('❌ Aucun token trouvé, redirection vers login');
        router.push('/admin/login?session=expired');
        return;
      }

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
      } catch (error: any) {
        console.error('Erreur lors du chargement de la boutique:', error);
        
        // Si c'est une erreur 401, rediriger vers login
        if (error?.status === 401 || error?.message?.includes('Token invalide')) {
          router.push('/admin/login?session=expired');
          return;
        }
        
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
        
        // Charger les produits les plus vus
        const topProducts = await getProduitsLesPlusVus(boutiqueId, 5);
        setTopViewedProducts(topProducts);
      } catch (error: any) {
        console.error('Erreur lors du chargement des statistiques:', error);
        
        // Si c'est une erreur 401, rediriger vers login
        if (error?.status === 401 || error?.message?.includes('Token invalide')) {
          router.push('/admin/login?session=expired');
          return;
        }
        
        // Pour les autres erreurs, afficher un message
        showError('Erreur lors du chargement des statistiques', 'Erreur');
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
            <PeriodSelector periode={periode} onChange={setPeriode} />
          </div>

          {/* Alertes de configuration */}
          {(stats.totalProduits === 0 || totalCommunes === 0) && (
            <div className="mb-6 space-y-3">
              {stats.totalProduits === 0 && (
                <ConfigAlert 
                  type="products" 
                  onAction={() => router.push(`/admin/${boutique?.slug}/products`)} 
                />
              )}
              
              {totalCommunes === 0 && (
                <ConfigAlert 
                  type="shipping" 
                  onAction={() => router.push(`/admin/${boutique?.slug}/shipping`)} 
                />
              )}
            </div>
          )}

          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6 mb-6 sm:mb-8">
            <StatsCard
              icon={Package}
              iconColor="blue"
              label="Produits"
              value={stats.totalProduits}
              subtitle={`${stats.produitsActifs} actifs`}
            />
            
            <StatsCard
              icon={ShoppingCart}
              iconColor="green"
              label="Commandes"
              value={stats.totalCommandes}
              subtitle="Total"
            />
            
            <StatsCard
              icon={Users}
              iconColor="purple"
              label="Catégories"
              value={stats.totalCategories}
              subtitle="Catégories actives"
            />
            
            <StatsCard
              icon={TrendingUp}
              iconColor="orange"
              label="Stock faible"
              value={stats.produitsEnRupture}
              subtitle="Produits en rupture"
            />

            <StatsCard
              icon={Eye}
              iconColor="indigo"
              label="Vues (mois)"
              value={statistiques?.vues_mois || 0}
              subtitle="Ce mois-ci"
            />

            <StatsCard
              icon={BarChart3}
              iconColor="amber"
              label="Vues (total)"
              value={statistiques?.vues_total || 0}
              subtitle="Depuis création"
            />
          </div>

          {/* Graphiques */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
            {/* Graphique Évolution du CA */}
            {statistiques && (
              <ChartEvolutionCA
                data={statistiques.ca_evolution}
                caTotal={statistiques.ca_total}
                variation={statistiques.variation_ca}
              />
            )}

            {/* Graphique Répartition des commandes - Toujours afficher */}
            {statistiques && (
              <ChartRepartitionCommandes 
                data={statistiques.commandes_par_statut.length > 0 
                  ? statistiques.commandes_par_statut 
                  : [{ statut: 'En attente', nombre: 0, pourcentage: 0 }]
                } 
              />
            )}
          </div>

          {/* Quick Actions */}
          <div className="mb-6 sm:mb-8">
            <QuickActions 
              boutiqueSlug={boutique.slug} 
              onNavigate={(path) => router.push(path)} 
            />
          </div>

          {/* Recent Activity & Top Viewed Products */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            <RecentProducts
              products={recentProducts}
              boutiqueSlug={boutique.slug}
              onNavigate={(path) => router.push(path)}
            />
            
            <TopViewedProducts
              products={topViewedProducts}
              boutiqueSlug={boutique.slug}
              onNavigate={(path) => router.push(path)}
            />
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