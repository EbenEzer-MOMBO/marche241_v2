'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { 
  getCommandesParBoutique, 
  modifierCommande,
  type Commande,
  type CommandesParams 
} from '@/lib/services/commandes';
import { ToastContainer } from '@/components/ui/Toast';
import { useToast } from '@/hooks/useToast';
import Sidebar from '@/components/admin/Sidebar';
import OrderDetailsSidebar from '@/components/admin/OrderDetailsSidebar';
import { BoutiqueData } from '@/lib/services/auth';
import {
  Package,
  Search,
  Menu,
  Clock,
  CheckCircle,
  XCircle,
  Truck,
  Eye,
  AlertCircle,
  Filter
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

  // États pour la pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [sortBy, setSortBy] = useState('date_commande');
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('DESC');

  // Fonction pour charger les commandes
  const loadOrders = async (boutiqueId: number) => {
    try {
      setIsLoading(true);

      const params: CommandesParams = {
        page: currentPage,
        limite: pageSize,
        tri_par: sortBy,
        ordre: sortOrder
      };

      if (filterStatus !== 'all') {
        params.statut = filterStatus;
      }

      if (searchTerm) {
        params.recherche = searchTerm;
      }

      const response = await getCommandesParBoutique(boutiqueId, params);
      
      console.log('📦 Réponse API commandes:', response);
      console.log('📋 Données commandes:', response.commandes);
      console.log('🔢 Total commandes:', response.total);
      
      setOrders(response.commandes || []);
      setTotalOrders(response.total || 0);
      setTotalPages(response.total_pages || 1);
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

  // Recharger les commandes quand les paramètres changent
  useEffect(() => {
    if (boutique) {
      loadOrders(boutique.id);
    }
  }, [boutique, currentPage, pageSize, sortBy, sortOrder, filterStatus, searchTerm]);

  const getStatusColor = (statut: string) => {
    switch (statut.toLowerCase()) {
      case 'en_attente':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'confirmee':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'en_preparation':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'expediee':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'livree':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'annulee':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (statut: string) => {
    switch (statut.toLowerCase()) {
      case 'en_attente':
        return <Clock className="h-4 w-4" />;
      case 'confirmee':
        return <CheckCircle className="h-4 w-4" />;
      case 'en_preparation':
        return <Package className="h-4 w-4" />;
      case 'expediee':
        return <Truck className="h-4 w-4" />;
      case 'livree':
        return <CheckCircle className="h-4 w-4" />;
      case 'annulee':
        return <XCircle className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getStatusLabel = (statut: string) => {
    switch (statut.toLowerCase()) {
      case 'en_attente':
        return 'En attente';
      case 'confirmee':
        return 'Confirmée';
      case 'en_preparation':
        return 'En préparation';
      case 'expediee':
        return 'Expédiée';
      case 'livree':
        return 'Livrée';
      case 'annulee':
        return 'Annulée';
      default:
        return statut;
    }
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
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
              />
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
              {/* Status Filter */}
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setFilterStatus('all')}
                  className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                    filterStatus === 'all'
                      ? 'bg-black text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Toutes
                </button>
                <button
                  onClick={() => setFilterStatus('en_attente')}
                  className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                    filterStatus === 'en_attente'
                      ? 'bg-yellow-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  En attente
                </button>
                <button
                  onClick={() => setFilterStatus('confirmee')}
                  className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                    filterStatus === 'confirmee'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Confirmées
                </button>
                <button
                  onClick={() => setFilterStatus('expediee')}
                  className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                    filterStatus === 'expediee'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Expédiées
                </button>
                <button
                  onClick={() => setFilterStatus('livree')}
                  className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                    filterStatus === 'livree'
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Livrées
                </button>
              </div>
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
                {orders && orders.map((order) => (
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
                        <span className="ml-1">{getStatusLabel(order.statut)}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleViewDetails(order.id)}
                        className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors"
                        title="Voir détails"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Orders Cards - Mobile */}
          <div className="lg:hidden space-y-3">
            {orders && orders.map((order) => (
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

                <button
                  onClick={() => handleViewDetails(order.id)}
                  className="w-full flex items-center justify-center px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors text-sm"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Voir détails
                </button>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {orders && orders.length === 0 && !isLoading && (
            <div className="text-center py-12">
              <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune commande trouvée</h3>
              <p className="text-gray-500">
                {searchTerm || filterStatus !== 'all'
                  ? 'Aucune commande ne correspond à vos critères de recherche.'
                  : 'Les commandes apparaîtront ici une fois reçues.'}
              </p>
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

      {/* Sidebar des détails de commande */}
      <OrderDetailsSidebar
        commandeId={selectedOrderId}
        isOpen={isSidebarOpen}
        onClose={handleCloseSidebar}
      />
    </div>
  );
}

