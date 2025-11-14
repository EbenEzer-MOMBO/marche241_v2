'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import {
  getTransactionsParBoutique,
  type Transaction,
  type TransactionsParams
} from '@/lib/services/transactions';
import { ToastContainer } from '@/components/ui/Toast';
import { useToast } from '@/hooks/useToast';
import Sidebar from '@/components/admin/Sidebar';
import { BoutiqueData } from '@/lib/services/auth';
import {
  CreditCard,
  Search,
  Menu,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Phone,
  Hash,
  TrendingUp,
  DollarSign,
  Calendar,
  Wallet
} from 'lucide-react';

export default function PaymentsPage() {
  const router = useRouter();
  const params = useParams();
  const boutiqueName = params.boutique as string;

  const { user, verifierBoutique } = useAuth();
  const { toasts, removeToast, success, error: showError } = useToast();

  const [boutique, setBoutique] = useState<BoutiqueData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');

  // États pour la pagination côté client
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Fonction pour charger toutes les transactions depuis l'API
  const loadTransactions = async (boutiqueId: number) => {
    try {
      setIsLoading(true);

      // Charger toutes les transactions sans pagination côté serveur
      const response = await getTransactionsParBoutique(boutiqueId, {
        page: 1,
        limite: 100 // Charger jusqu'à 100 transactions
      });

      console.log('💳 Réponse API transactions:', response);
      console.log('📋 Données transactions:', response.transactions);
      console.log('🔢 Total transactions:', response.total);

      setTransactions(response.transactions || []);
    } catch (error) {
      console.error('Erreur lors du chargement des transactions:', error);
      showError('Erreur lors du chargement des transactions');
      setTransactions([]);
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
          router.replace(`/admin/${boutiqueData.slug}/payments`);
          return;
        }

        setBoutique(boutiqueData);
        await loadTransactions(boutiqueData.id);
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

  // Calculer les statistiques
  const calculateStats = () => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // Filtrer uniquement les transactions payées/confirmées
    const paidTransactions = transactions.filter(t => 
      t.statut.toLowerCase() === 'paye' || t.statut.toLowerCase() === 'confirme'
    );

    // Revenu total
    const totalRevenue = paidTransactions.reduce((sum, t) => sum + t.montant, 0);

    // Revenu mensuel (mois en cours)
    const monthlyRevenue = paidTransactions
      .filter(t => {
        const date = new Date(t.date_creation);
        return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
      })
      .reduce((sum, t) => sum + t.montant, 0);

    // Revenu annuel (année en cours)
    const yearlyRevenue = paidTransactions
      .filter(t => {
        const date = new Date(t.date_creation);
        return date.getFullYear() === currentYear;
      })
      .reduce((sum, t) => sum + t.montant, 0);

    // Nombre de transactions payées
    const totalPaidTransactions = paidTransactions.length;

    // Revenu moyen par transaction
    const averageRevenue = totalPaidTransactions > 0 
      ? totalRevenue / totalPaidTransactions 
      : 0;

    return {
      totalRevenue,
      monthlyRevenue,
      yearlyRevenue,
      totalPaidTransactions,
      averageRevenue
    };
  };

  const stats = calculateStats();

  // Filtrer et paginer les transactions côté client
  const filteredTransactions = transactions.filter(transaction => {
    // Filtre par statut
    const matchStatus = filterStatus === 'all' || transaction.statut.toLowerCase() === filterStatus.toLowerCase();
    
    // Filtre par type
    const matchType = filterType === 'all' || transaction.type_paiement.toLowerCase() === filterType.toLowerCase();
    
    // Filtre par recherche
    const searchLower = searchTerm.toLowerCase();
    const matchSearch = !searchTerm || 
      transaction.reference_transaction.toLowerCase().includes(searchLower) ||
      transaction.numero_telephone?.toLowerCase().includes(searchLower) ||
      transaction.reference_operateur?.toLowerCase().includes(searchLower);
    
    return matchStatus && matchType && matchSearch;
  });

  // Calcul de la pagination
  const totalTransactions = filteredTransactions.length;
  const totalPages = Math.ceil(totalTransactions / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedTransactions = filteredTransactions.slice(startIndex, endIndex);

  const getStatusColor = (statut: string) => {
    switch (statut.toLowerCase()) {
      case 'en_attente':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'paye':
      case 'confirme':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'echec':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'rembourse':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'annule':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const getStatusIcon = (statut: string) => {
    switch (statut.toLowerCase()) {
      case 'en_attente':
        return <Clock className="h-4 w-4" />;
      case 'paye':
      case 'confirme':
        return <CheckCircle className="h-4 w-4" />;
      case 'echec':
      case 'annule':
        return <XCircle className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getStatusLabel = (statut: string) => {
    switch (statut.toLowerCase()) {
      case 'en_attente':
        return 'En attente';
      case 'paye':
        return 'Payé';
      case 'confirme':
        return 'Confirmé';
      case 'echec':
        return 'Échoué';
      case 'rembourse':
        return 'Remboursé';
      case 'annule':
        return 'Annulé';
      default:
        return statut;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type.toLowerCase()) {
      case 'paiement_complet':
        return 'Paiement complet';
      case 'frais_livraison':
        return 'Frais de livraison';
      case 'acompte':
        return 'Acompte';
      case 'solde_apres_livraison':
        return 'Solde après livraison';
      case 'complement':
        return 'Complément';
      default:
        return type;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'paiement_complet':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'frais_livraison':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'acompte':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'solde_apres_livraison':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'complement':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getMethodeLabel = (methode: string) => {
    switch (methode.toLowerCase()) {
      case 'moov_money':
        return 'Moov Money';
      case 'airtel_money':
        return 'Airtel Money';
      case 'mobile_money':
        return 'Mobile Money';
      case 'especes':
        return 'Espèces';
      case 'virement':
        return 'Virement';
      default:
        return methode;
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

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1); // Réinitialiser à la page 1 lors d'une recherche
  };

  const handleFilterStatusChange = (status: string) => {
    setFilterStatus(status);
    setCurrentPage(1); // Réinitialiser à la page 1 lors d'un changement de filtre
  };

  const handleFilterTypeChange = (type: string) => {
    setFilterType(type);
    setCurrentPage(1); // Réinitialiser à la page 1 lors d'un changement de filtre
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    // Scroll vers le haut lors du changement de page
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des transactions...</p>
        </div>
      </div>
    );
  }

  if (!boutique) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <CreditCard className="h-16 w-16 text-gray-400 mx-auto mb-4" />
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
                <h1 className="text-lg lg:text-2xl font-bold text-gray-900 truncate">Paiements</h1>
                <p className="text-xs lg:text-sm text-gray-500 mt-0.5 lg:mt-1 truncate">
                  Gérez les transactions de votre boutique {boutique.nom}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-3 sm:p-4 lg:p-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
            {/* Revenu Mensuel */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4 lg:p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <div className="p-1.5 sm:p-2 bg-green-100 rounded-lg">
                    <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                  </div>
                </div>
                <span className="text-[10px] sm:text-xs font-medium text-green-600 bg-green-50 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded">
                  Ce mois
                </span>
              </div>
              <h3 className="text-xs sm:text-sm font-medium text-gray-600 mb-1">Revenu Mensuel</h3>
              <p className="text-base sm:text-xl lg:text-2xl font-bold text-gray-900 break-words">{formatPrice(stats.monthlyRevenue)}</p>
            </div>

            {/* Revenu Annuel */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4 lg:p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <div className="p-1.5 sm:p-2 bg-blue-100 rounded-lg">
                    <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                  </div>
                </div>
                <span className="text-[10px] sm:text-xs font-medium text-blue-600 bg-blue-50 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded">
                  Année
                </span>
              </div>
              <h3 className="text-xs sm:text-sm font-medium text-gray-600 mb-1">Revenu Annuel</h3>
              <p className="text-base sm:text-xl lg:text-2xl font-bold text-gray-900 break-words">{formatPrice(stats.yearlyRevenue)}</p>
            </div>

            {/* Revenu Total */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4 lg:p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <div className="p-1.5 sm:p-2 bg-purple-100 rounded-lg">
                    <Wallet className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600" />
                  </div>
                </div>
                <span className="text-[10px] sm:text-xs font-medium text-purple-600 bg-purple-50 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded">
                  Total
                </span>
              </div>
              <h3 className="text-xs sm:text-sm font-medium text-gray-600 mb-1">Revenu Total</h3>
              <p className="text-base sm:text-xl lg:text-2xl font-bold text-gray-900 break-words">{formatPrice(stats.totalRevenue)}</p>
            </div>

            {/* Revenu Moyen */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4 lg:p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <div className="p-1.5 sm:p-2 bg-orange-100 rounded-lg">
                    <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 text-orange-600" />
                  </div>
                </div>
                <span className="text-[10px] sm:text-xs font-medium text-orange-600 bg-orange-50 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded whitespace-nowrap">
                  {stats.totalPaidTransactions} tr.
                </span>
              </div>
              <h3 className="text-xs sm:text-sm font-medium text-gray-600 mb-1">Revenu Moyen</h3>
              <p className="text-base sm:text-xl lg:text-2xl font-bold text-gray-900 break-words">{formatPrice(stats.averageRevenue)}</p>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="mb-6 space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher par référence, téléphone..."
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
              />
            </div>

            {/* Filters et compteur de résultats */}
            <div className="space-y-3">
              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Statut</label>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleFilterStatusChange('all')}
                    className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${filterStatus === 'all'
                        ? 'bg-black text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                  >
                    Tous
                  </button>
                  <button
                    onClick={() => handleFilterStatusChange('en_attente')}
                    className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${filterStatus === 'en_attente'
                        ? 'bg-yellow-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                  >
                    En attente
                  </button>
                  <button
                    onClick={() => handleFilterStatusChange('paye')}
                    className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${filterStatus === 'paye'
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                  >
                    Payés
                  </button>
                  <button
                    onClick={() => handleFilterStatusChange('echec')}
                    className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${filterStatus === 'echec'
                        ? 'bg-red-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                  >
                    Échoués
                  </button>
                </div>
              </div>

              {/* Type Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Type de paiement</label>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleFilterTypeChange('all')}
                    className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${filterType === 'all'
                        ? 'bg-black text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                  >
                    Tous
                  </button>
                  <button
                    onClick={() => handleFilterTypeChange('paiement_complet')}
                    className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${filterType === 'paiement_complet'
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                  >
                    Paiement complet
                  </button>
                  <button
                    onClick={() => handleFilterTypeChange('frais_livraison')}
                    className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${filterType === 'frais_livraison'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                  >
                    Frais de livraison
                  </button>
                </div>
              </div>

              {/* Compteur de résultats */}
              {!isLoading && totalTransactions > 0 && (
                <div className="text-sm text-gray-600">
                  <span className="font-medium">{totalTransactions}</span> transaction{totalTransactions > 1 ? 's' : ''} trouvée{totalTransactions > 1 ? 's' : ''}
                </div>
              )}
            </div>
          </div>

          {/* Transactions Table - Desktop */}
          <div className="hidden lg:block bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Référence
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Téléphone
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Montant
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Méthode
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedTransactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Hash className="h-4 w-4 text-gray-400 mr-1" />
                        <div className="text-sm font-medium text-gray-900">
                          {transaction.reference_transaction}
                        </div>
                      </div>
                      {transaction.reference_operateur && (
                        <div className="text-xs text-gray-500 mt-1">
                          Op: {transaction.reference_operateur}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {transaction.numero_telephone && (
                        <div className="flex items-center text-sm text-gray-900">
                          <Phone className="h-4 w-4 text-gray-400 mr-1" />
                          {transaction.numero_telephone}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatDate(transaction.date_creation)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-gray-900">
                        {formatPrice(transaction.montant)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getTypeColor(
                          transaction.type_paiement
                        )}`}
                      >
                        {getTypeLabel(transaction.type_paiement)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {getMethodeLabel(transaction.methode_paiement)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(
                          transaction.statut
                        )}`}
                      >
                        {getStatusIcon(transaction.statut)}
                        <span className="ml-1">{getStatusLabel(transaction.statut)}</span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Transactions Cards - Mobile */}
          <div className="lg:hidden space-y-3">
            {paginatedTransactions.map((transaction) => (
              <div
                key={transaction.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-4"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center text-sm font-medium text-gray-900 mb-1">
                      <Hash className="h-4 w-4 text-gray-400 mr-1 flex-shrink-0" />
                      <span className="truncate">{transaction.reference_transaction}</span>
                    </div>
                    <div className="text-xs text-gray-500">
                      {formatDate(transaction.date_creation)}
                    </div>
                  </div>
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border flex-shrink-0 ml-2 ${getStatusColor(
                      transaction.statut
                    )}`}
                  >
                    {getStatusIcon(transaction.statut)}
                    <span className="ml-1">{getStatusLabel(transaction.statut)}</span>
                  </span>
                </div>

                <div className="space-y-2 mb-3">
                  {transaction.numero_telephone && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Téléphone:</span>
                      <span className="font-medium flex items-center">
                        <Phone className="h-3 w-3 text-gray-400 mr-1" />
                        {transaction.numero_telephone}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Montant:</span>
                    <span className="font-bold text-gray-900">{formatPrice(transaction.montant)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Type:</span>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${getTypeColor(
                        transaction.type_paiement
                      )}`}
                    >
                      {getTypeLabel(transaction.type_paiement)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Méthode:</span>
                    <span className="font-medium">{getMethodeLabel(transaction.methode_paiement)}</span>
                  </div>
                  {transaction.reference_operateur && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Ref. opérateur:</span>
                      <span className="font-medium text-xs">{transaction.reference_operateur}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {filteredTransactions.length === 0 && !isLoading && (
            <div className="text-center py-12">
              <CreditCard className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm || filterStatus !== 'all' || filterType !== 'all' ? 'Aucune transaction trouvée' : 'Aucune transaction'}
              </h3>
              <p className="text-gray-500">
                {searchTerm || filterStatus !== 'all' || filterType !== 'all'
                  ? 'Aucune transaction ne correspond à vos critères de recherche.'
                  : 'Les transactions apparaîtront ici une fois effectuées.'}
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
                    {Math.min((currentPage - 1) * pageSize + 1, totalTransactions)}
                  </span>{' '}
                  à{' '}
                  <span className="font-medium">
                    {Math.min(currentPage * pageSize, totalTransactions)}
                  </span>{' '}
                  sur <span className="font-medium">{totalTransactions}</span> transaction{totalTransactions > 1 ? 's' : ''}
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
    </div>
  );
}

