'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import {
  getCommandesParBoutique,
  modifierStatutCommande,
  type Commande,
  type CommandesParams
} from '@/lib/services/commandes';
import { ToastContainer } from '@/components/ui/Toast';
import { useToast } from '@/hooks/useToast';
import Sidebar from '@/components/admin/Sidebar';
import OrderDetailsSidebar from '@/components/admin/OrderDetailsSidebar';
import { BoutiqueData } from '@/lib/services/auth';
import { ORDER_STATUS_CONFIG, getStatusBadgeClasses, getStatusLabel } from '@/lib/constants/order-status';
import {
  Package,
  Search,
  Menu,
  Clock,
  CheckCircle,
  XCircle,
  Truck,
  Eye,
  AlertCircle
} from 'lucide-react';

export default function OrdersPage() {
  const router = useRouter();
  const params = useParams();
  const boutiqueName = params.boutique as string;

  const { user, verifierBoutique } = useAuth();
  const { toasts, removeToast, success, error: showError } = useToast();

  const [boutique, setBoutique] = useState<BoutiqueData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [orders, setOrders] = useState<Commande[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // États pour le sidebar de détails
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // États pour le modal de confirmation
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [pendingStatusUpdate, setPendingStatusUpdate] = useState<{
    orderId: number;
    currentStatus: string;
    newStatus: string;
    statusLabel: string;
  } | null>(null);

  // États pour la pagination côté client
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Fonction pour charger toutes les commandes depuis l'API
  const loadOrders = async (boutiqueId: number) => {
    try {
      setIsLoading(true);

      // Charger toutes les commandes sans pagination côté serveur
      const response = await getCommandesParBoutique(boutiqueId, {
        page: 1,
        limite: 100, // Charger jusqu'à 100 commandes
        tri_par: 'date_commande',
        ordre: 'DESC'
      });

      console.log('📦 Réponse API commandes:', response);
      console.log('📋 Données commandes:', response.commandes);
      console.log('🔢 Total commandes:', response.total);

      setOrders(response.commandes || []);
    } catch (error) {
      console.error('Erreur lors du chargement des commandes:', error);
      showError('Erreur lors du chargement des commandes');
      setOrders([]);
    } finally {
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
          router.replace(`/admin/${boutiqueData.slug}/orders`);
          return;
        }

        setBoutique(boutiqueData);
        await loadOrders(boutiqueData.id);
      } catch (error) {
        console.error('Erreur lors du chargement de la boutique:', error);
        showError('Erreur lors du chargement de la boutique');
      } finally {
        setIsLoading(false);
      }
    };

    const timer = setTimeout(() => {
      loadBoutiqueData();
    }, 100);

    return () => clearTimeout(timer);
  }, [user, boutiqueName, router]);

  // Filtrer et paginer les commandes côté client
  const filteredOrders = orders.filter(order => {
    // Filtre par statut
    const matchStatus = filterStatus === 'all' || order.statut.toLowerCase() === filterStatus.toLowerCase();
    
    // Filtre par recherche
    const searchLower = searchTerm.toLowerCase();
    const matchSearch = !searchTerm || 
      order.numero_commande.toLowerCase().includes(searchLower) ||
      order.client_nom.toLowerCase().includes(searchLower) ||
      order.client_telephone.toLowerCase().includes(searchLower);
    
    return matchStatus && matchSearch;
  });

  // Calcul de la pagination
  const totalOrders = filteredOrders.length;
  const totalPages = Math.ceil(totalOrders / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedOrders = filteredOrders.slice(startIndex, endIndex);

  const getStatusColor = (statut: string) => {
    return getStatusBadgeClasses(statut);
  };

  const getStatusIcon = (statut: string) => {
    switch (statut.toLowerCase()) {
      case 'en_attente':
        return <Clock className="h-4 w-4" />;
      case 'confirmee':
        return <CheckCircle className="h-4 w-4" />;
      case 'en_preparation':
        return <Package className="h-4 w-4" />;
      case 'expedie':
        return <Truck className="h-4 w-4" />;
      case 'livree':
        return <CheckCircle className="h-4 w-4" />;
      case 'annulee':
        return <XCircle className="h-4 w-4" />;
      case 'remboursee':
        return <XCircle className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getStatusLabelLocal = (statut: string) => {
    return getStatusLabel(statut);
  };

  const getFilterButtonClasses = (status: string) => {
    if (filterStatus === status) {
      const config = ORDER_STATUS_CONFIG[status as keyof typeof ORDER_STATUS_CONFIG];
      if (config) {
        // Utiliser la couleur primaire pour le bouton actif
        const colorMap: Record<string, string> = {
          en_attente: 'bg-amber-500 hover:bg-amber-600',
          confirmee: 'bg-blue-500 hover:bg-blue-600',
          en_preparation: 'bg-violet-500 hover:bg-violet-600',
          expedie: 'bg-indigo-500 hover:bg-indigo-600',
          livree: 'bg-emerald-500 hover:bg-emerald-600',
          annulee: 'bg-red-500 hover:bg-red-600',
          remboursee: 'bg-orange-500 hover:bg-orange-600'
        };
        return `${colorMap[status]} text-white`;
      }
      return 'bg-black text-white';
    }
    return 'bg-gray-100 text-gray-700 hover:bg-gray-200';
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 0
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(dateString));
  };

  const handleViewDetails = (orderId: number) => {
    setSelectedOrderId(orderId);
    setIsSidebarOpen(true);
  };

  const handleCloseSidebar = () => {
    setIsSidebarOpen(false);
    setSelectedOrderId(null);
  };

  const handleStatusUpdateFromSidebar = (commandeId: number, newStatus: string) => {
    // Mettre à jour l'état local
    setOrders(prevOrders =>
      prevOrders.map(order =>
        order.id === commandeId ? { ...order, statut: newStatus } : order
      )
    );
    success('Commande mise à jour avec succès');
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1); // Réinitialiser à la page 1 lors d'une recherche
  };

  const handleFilterChange = (status: string) => {
    setFilterStatus(status);
    setCurrentPage(1); // Réinitialiser à la page 1 lors d'un changement de filtre
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    // Scroll vers le haut lors du changement de page
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleUpdateStatus = async (orderId: number, currentStatus: string, newStatus: string, statusLabel: string) => {
    try {
      await modifierStatutCommande(orderId, newStatus);
      
      // Mettre à jour l'état local
      setOrders(prevOrders =>
        prevOrders.map(order =>
          order.id === orderId ? { ...order, statut: newStatus } : order
        )
      );
      
      success(`Commande ${statusLabel} avec succès`);
      setIsConfirmModalOpen(false);
      setPendingStatusUpdate(null);
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error);
      showError('Erreur lors de la mise à jour du statut');
    }
  };

  const openConfirmModal = (orderId: number, currentStatus: string, newStatus: string, statusLabel: string) => {
    setPendingStatusUpdate({ orderId, currentStatus, newStatus, statusLabel });
    setIsConfirmModalOpen(true);
  };

  const closeConfirmModal = () => {
    setIsConfirmModalOpen(false);
    setPendingStatusUpdate(null);
  };

  const confirmStatusUpdate = () => {
    if (pendingStatusUpdate) {
      handleUpdateStatus(
        pendingStatusUpdate.orderId,
        pendingStatusUpdate.currentStatus,
        pendingStatusUpdate.newStatus,
        pendingStatusUpdate.statusLabel
      );
    }
  };

  const getActionButton = (order: Commande, isMobile: boolean = false) => {
    const baseClasses = isMobile 
      ? "w-full flex items-center justify-center px-4 py-2 text-white text-sm font-medium rounded-lg transition-colors"
      : "inline-flex items-center px-3 py-1.5 text-white text-xs font-medium rounded-lg transition-colors";
    
    if (order.statut.toLowerCase() === 'confirmee') {
      return (
        <button
          onClick={(e) => {
            e.stopPropagation();
            openConfirmModal(order.id, order.statut, 'expedie', 'expédiée');
          }}
          className={`${baseClasses} bg-indigo-600 hover:bg-indigo-700`}
          title="Marquer comme expédiée"
        >
          <Truck className={`${isMobile ? 'h-4 w-4' : 'h-3.5 w-3.5'} mr-${isMobile ? '2' : '1.5'}`} />
          Expédier
        </button>
      );
    }
    
    if (order.statut.toLowerCase() === 'expedie') {
      return (
        <button
          onClick={(e) => {
            e.stopPropagation();
            openConfirmModal(order.id, order.statut, 'livree', 'livrée');
          }}
          className={`${baseClasses} bg-emerald-600 hover:bg-emerald-700`}
          title="Marquer comme livrée"
        >
          <CheckCircle className={`${isMobile ? 'h-4 w-4' : 'h-3.5 w-3.5'} mr-${isMobile ? '2' : '1.5'}`} />
          Livrer
        </button>
      );
    }
    
    return null;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des commandes...</p>
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
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-1.5 rounded-lg hover:bg-gray-100 transition-colors mr-3 flex-shrink-0"
              >
                <Menu className="h-5 w-5 text-gray-600" />
              </button>

              <div className="min-w-0 flex-1">
                <h1 className="text-lg lg:text-2xl font-bold text-gray-900 truncate">Commandes</h1>
                <p className="text-xs lg:text-sm text-gray-500 mt-0.5 lg:mt-1 truncate">
                  Gérez les commandes de votre boutique {boutique.nom}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-3 sm:p-4 lg:p-6">
          {/* Search and Filters */}
          <div className="mb-6 space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher par numéro de commande, client..."
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
              />
            </div>

            {/* Filters et compteur de résultats */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
              {/* Status Filter */}
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleFilterChange('all')}
                  className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${getFilterButtonClasses('all')}`}
                >
                  Toutes
                </button>
                <button
                  onClick={() => handleFilterChange('en_attente')}
                  className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${getFilterButtonClasses('en_attente')}`}
                >
                  En attente
                </button>
                <button
                  onClick={() => handleFilterChange('confirmee')}
                  className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${getFilterButtonClasses('confirmee')}`}
                >
                  Confirmées
                </button>
                <button
                  onClick={() => handleFilterChange('expedie')}
                  className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${getFilterButtonClasses('expedie')}`}
                >
                  Expédiées
                </button>
                <button
                  onClick={() => handleFilterChange('livree')}
                  className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${getFilterButtonClasses('livree')}`}
                >
                  Livrées
                </button>
              </div>

              {/* Compteur de résultats */}
              {!isLoading && totalOrders > 0 && (
                <div className="text-sm text-gray-600">
                  <span className="font-medium">{totalOrders}</span> commande{totalOrders > 1 ? 's' : ''} trouvée{totalOrders > 1 ? 's' : ''}
                </div>
              )}
            </div>
          </div>

          {/* Orders Table - Desktop */}
          <div className="hidden lg:block bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    N° Commande
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Client
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Montant
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {order.numero_commande}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{order.client_nom}</div>
                      <div className="text-sm text-gray-500">{order.client_telephone}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatDate(order.date_commande)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {formatPrice(order.total)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(
                          order.statut
                        )}`}
                      >
                        {getStatusIcon(order.statut)}
                        <span className="ml-1">{getStatusLabelLocal(order.statut)}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        {getActionButton(order)}
                        <button
                          onClick={() => handleViewDetails(order.id)}
                          className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors"
                          title="Voir détails"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Orders Cards - Mobile */}
          <div className="lg:hidden space-y-3">
            {paginatedOrders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-4"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {order.numero_commande}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {formatDate(order.date_commande)}
                    </div>
                  </div>
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                      order.statut
                    )}`}
                  >
                    {getStatusIcon(order.statut)}
                    <span className="ml-1">{getStatusLabel(order.statut)}</span>
                  </span>
                </div>

                <div className="space-y-2 mb-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Client:</span>
                    <span className="font-medium">{order.client_nom}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Téléphone:</span>
                    <span className="font-medium">{order.client_telephone}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Montant:</span>
                    <span className="font-bold text-gray-900">{formatPrice(order.total)}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  {getActionButton(order, true)}
                  <button
                    onClick={() => handleViewDetails(order.id)}
                    className="w-full flex items-center justify-center px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors text-sm"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Voir détails
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {filteredOrders.length === 0 && !isLoading && (
            <div className="text-center py-12">
              <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm || filterStatus !== 'all' ? 'Aucune commande trouvée' : 'Aucune commande'}
              </h3>
              <p className="text-gray-500">
                {searchTerm || filterStatus !== 'all'
                  ? 'Aucune commande ne correspond à vos critères de recherche.'
                  : 'Les commandes apparaîtront ici une fois reçues.'}
              </p>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-between border-t border-gray-200 pt-6 gap-4">
              <div className="flex items-center">
                <p className="text-sm text-gray-700">
                  Affichage de{' '}
                  <span className="font-medium">
                    {Math.min((currentPage - 1) * pageSize + 1, totalOrders)}
                  </span>{' '}
                  à{' '}
                  <span className="font-medium">
                    {Math.min(currentPage * pageSize, totalOrders)}
                  </span>{' '}
                  sur <span className="font-medium">{totalOrders}</span> commande{totalOrders > 1 ? 's' : ''}
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Précédent
                </button>

                <div className="hidden sm:flex items-center space-x-1">
                  {currentPage > 2 && (
                    <>
                      <button
                        onClick={() => handlePageChange(1)}
                        className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                      >
                        1
                      </button>
                      {currentPage > 3 && (
                        <span className="px-2 text-gray-500">...</span>
                      )}
                    </>
                  )}

                  {currentPage > 1 && (
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                    >
                      {currentPage - 1}
                    </button>
                  )}

                  <button
                    disabled
                    className="px-3 py-2 text-sm font-medium text-white bg-black border border-black rounded-md cursor-default"
                  >
                    {currentPage}
                  </button>

                  {currentPage < totalPages && (
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                    >
                      {currentPage + 1}
                    </button>
                  )}

                  {currentPage < totalPages - 1 && (
                    <>
                      {currentPage < totalPages - 2 && (
                        <span className="px-2 text-gray-500">...</span>
                      )}
                      <button
                        onClick={() => handlePageChange(totalPages)}
                        className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                      >
                        {totalPages}
                      </button>
                    </>
                  )}
                </div>

                <button
                  onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Suivant
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Sidebar des détails de commande */}
      <OrderDetailsSidebar
        commandeId={selectedOrderId}
        isOpen={isSidebarOpen}
        onClose={handleCloseSidebar}
        onStatusUpdate={handleStatusUpdateFromSidebar}
      />

      {/* Modal de confirmation de mise à jour de statut */}
      {isConfirmModalOpen && pendingStatusUpdate && (
        <div 
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          style={{ animation: 'fadeIn 0.2s ease-out' }}
        >
          <div 
            className="bg-white rounded-lg shadow-xl max-w-md w-full p-6"
            style={{ animation: 'slideUp 0.3s ease-out' }}
          >
            {/* En-tête du modal */}
            <div className="flex items-start mb-4">
              <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${
                pendingStatusUpdate.newStatus === 'expedie' 
                  ? 'bg-indigo-100' 
                  : 'bg-green-100'
              }`}>
                {pendingStatusUpdate.newStatus === 'expedie' ? (
                  <Truck className={`h-6 w-6 text-indigo-600`} />
                ) : (
                  <CheckCircle className={`h-6 w-6 text-green-600`} />
                )}
              </div>
              <div className="ml-4 flex-1">
                <h3 className="text-lg font-semibold text-gray-900">
                  Confirmer le changement de statut
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  {pendingStatusUpdate.newStatus === 'expedie' 
                    ? 'La commande sera marquée comme expédiée'
                    : 'La commande sera marquée comme livrée'}
                </p>
              </div>
            </div>

            {/* Contenu du modal */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-700">Statut actuel</p>
                  <p className="text-base font-semibold text-gray-900 mt-1">
                    {getStatusLabel(pendingStatusUpdate.currentStatus)}
                  </p>
                </div>
                <div className="mx-4">
                  <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Nouveau statut</p>
                  <p className={`text-base font-semibold mt-1 ${
                    pendingStatusUpdate.newStatus === 'expedie' 
                      ? 'text-indigo-600' 
                      : 'text-green-600'
                  }`}>
                    {getStatusLabel(pendingStatusUpdate.newStatus)}
                  </p>
                </div>
              </div>
            </div>

            {/* Message d'information */}
            <div className="flex items-start mb-6">
              <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-gray-600 ml-2">
                {pendingStatusUpdate.newStatus === 'expedie' 
                  ? 'Le client sera informé que sa commande a été expédiée.'
                  : 'Cette action marquera la commande comme terminée.'}
              </p>
            </div>

            {/* Boutons d'action */}
            <div className="flex space-x-3">
              <button
                onClick={closeConfirmModal}
                className="flex-1 px-4 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm"
              >
                Annuler
              </button>
              <button
                onClick={confirmStatusUpdate}
                className={`flex-1 px-4 py-2.5 text-white rounded-lg transition-colors font-medium text-sm ${
                  pendingStatusUpdate.newStatus === 'expedie'
                    ? 'bg-indigo-600 hover:bg-indigo-700'
                    : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                {pendingStatusUpdate.newStatus === 'expedie' ? 'Expédier' : 'Livrer'}
              </button>
            </div>
          </div>

          <style jsx>{`
            @keyframes fadeIn {
              from {
                opacity: 0;
              }
              to {
                opacity: 1;
              }
            }
            @keyframes slideUp {
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
        </div>
      )}
    </div>
  );
}

