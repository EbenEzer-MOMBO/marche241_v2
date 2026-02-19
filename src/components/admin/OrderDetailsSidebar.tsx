'use client';

import { useEffect, useState } from 'react';
import { X, Package, User, MapPin, Phone, Calendar, CreditCard, Truck, Receipt, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import Image from 'next/image';
import {
  getCommandeAvecArticles,
  getCommandeById,
  modifierStatutCommande,
  type CommandeDetailsResponse,
  type Commande,
  type Transaction
} from '@/lib/services/commandes';
import { getStatusBadgeClasses, getStatusLabel } from '@/lib/constants/order-status';

interface OrderDetailsSidebarProps {
  commandeId: number | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusUpdate?: (commandeId: number, newStatus: string) => void;
}

const OrderDetailsSidebar = ({ commandeId, isOpen, onClose, onStatusUpdate }: OrderDetailsSidebarProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [details, setDetails] = useState<CommandeDetailsResponse | null>(null);
  const [commandeInfo, setCommandeInfo] = useState<Commande | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingStatusUpdate, setPendingStatusUpdate] = useState<{
    newStatus: string;
    statusLabel: string;
  } | null>(null);

  useEffect(() => {
    const loadOrderDetails = async () => {
      if (!commandeId) return;

      setIsLoading(true);
      setError(null);

      try {
        // Récupérer les informations de la commande et les articles en parallèle
        const [commandeData, articlesData] = await Promise.all([
          getCommandeById(commandeId),
          getCommandeAvecArticles(commandeId)
        ]);

        setCommandeInfo(commandeData);
        setDetails(articlesData);
      } catch (err) {
        console.error('Erreur chargement détails commande:', err);
        setError('Impossible de charger les détails de la commande');
      } finally {
        setIsLoading(false);
      }
    };

    if (isOpen && commandeId) {
      loadOrderDetails();
    }
  }, [commandeId, isOpen]);

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
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(dateString));
  };

  const getStatusColor = (statut: string) => {
    return getStatusBadgeClasses(statut);
  };

  const getStatusLabelLocal = (statut: string) => {
    return getStatusLabel(statut);
  };

  const getPaymentStatusLabel = (statut: string) => {
    switch (statut.toLowerCase()) {
      case 'en_attente':
        return 'En attente';
      case 'paye':
        return 'Payé';
      case 'echoue':
        return 'Échoué';
      case 'rembourse':
        return 'Remboursé';
      default:
        return statut;
    }
  };

  const handleUpdateStatus = async (newStatus: string, statusLabel: string) => {
    if (!commandeId || !commandeInfo) return;

    setIsUpdatingStatus(true);
    try {
      await modifierStatutCommande(commandeId, newStatus);
      
      // Mettre à jour l'état local
      setCommandeInfo(prev => prev ? { ...prev, statut: newStatus } : null);
      
      // Notifier le parent
      if (onStatusUpdate) {
        onStatusUpdate(commandeId, newStatus);
      }
      
      setShowConfirmModal(false);
      setPendingStatusUpdate(null);
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const openConfirmModal = (newStatus: string, statusLabel: string) => {
    setPendingStatusUpdate({ newStatus, statusLabel });
    setShowConfirmModal(true);
  };

  const closeConfirmModal = () => {
    setShowConfirmModal(false);
    setPendingStatusUpdate(null);
  };

  const getActionButton = () => {
    if (!commandeInfo) return null;

    if (commandeInfo.statut.toLowerCase() === 'confirmee') {
      return (
        <button
          onClick={() => openConfirmModal('expedie', 'expédiée')}
          disabled={isUpdatingStatus}
          className="w-full flex items-center justify-center px-4 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Truck className="h-4 w-4 mr-2" />
          {isUpdatingStatus ? 'Mise à jour...' : 'Marquer comme expédiée'}
        </button>
      );
    }
    
    if (commandeInfo.statut.toLowerCase() === 'expedie') {
      return (
        <button
          onClick={() => openConfirmModal('livree', 'livrée')}
          disabled={isUpdatingStatus}
          className="w-full flex items-center justify-center px-4 py-2.5 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <CheckCircle2 className="h-4 w-4 mr-2" />
          {isUpdatingStatus ? 'Mise à jour...' : 'Marquer comme livrée'}
        </button>
      );
    }
    
    return null;
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 bg-opacity-50 z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Sidebar */}
      <div className="fixed right-0 top-0 h-full sm:w-[500px] lg:w-[600px] bg-white shadow-2xl z-50 overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-xl font-bold text-gray-900">Détails de la commande</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Fermer"
          >
            <X className="h-5 w-5 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
              {error}
            </div>
          )}

          {!isLoading && !error && details && commandeInfo && (
            <div className="space-y-6">
              {/* Informations générales */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {commandeInfo.numero_commande}
                  </h3>
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                      commandeInfo.statut
                    )}`}
                  >
                    {getStatusLabelLocal(commandeInfo.statut)}
                  </span>
                </div>

                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span>{formatDate(commandeInfo.date_commande)}</span>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                  <span className="text-sm text-gray-600">Statut paiement</span>
                  <span className="text-sm font-medium text-gray-900">
                    {getPaymentStatusLabel(commandeInfo.statut_paiement)}
                  </span>
                </div>

                {commandeInfo.methode_paiement && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Méthode de paiement</span>
                    <div className="flex items-center gap-2">
                      {commandeInfo.methode_paiement === 'airtel_money' ? (
                        <Image
                          className="rounded-md"
                          src="/airtel_money.png"
                          alt="Airtel Money"
                          width={40}
                          height={40}
                        />
                      ) : commandeInfo.methode_paiement === 'moov_money' ? (
                        <Image
                          className="rounded-md"
                          src="/moov_money.png"
                          alt="Moov Money"
                          width={40}
                          height={40}
                        />
                      ) : (
                        <span className="text-sm font-medium text-gray-900">
                          {commandeInfo.methode_paiement}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Bouton d'action pour changer le statut */}
                {getActionButton() && (
                  <div className="pt-3 border-t border-gray-200">
                    {getActionButton()}
                  </div>
                )}
              </div>

              {/* Informations client */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Informations client
                </h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <div>
                    <span className="text-sm text-gray-600">Nom</span>
                    <p className="text-sm font-medium text-gray-900">
                      {commandeInfo.client_nom || 'Non renseigné'}
                    </p>
                  </div>
                  {commandeInfo.client_telephone && (
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 mr-2 text-gray-500" />
                      <span className="text-sm font-medium text-gray-900">
                        {commandeInfo.client_telephone}
                      </span>
                    </div>
                  )}
                  {(commandeInfo.client_adresse || commandeInfo.client_ville || commandeInfo.client_commune) && (
                    <div className="flex items-start">
                      <MapPin className="h-4 w-4 mr-2 text-gray-500 mt-0.5" />
                      <div>
                        {commandeInfo.client_adresse && (
                          <p className="text-sm font-medium text-gray-900">{commandeInfo.client_adresse}</p>
                        )}
                        {commandeInfo.client_commune && (
                          <p className="text-sm text-gray-600">
                            {commandeInfo.client_commune}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                  {commandeInfo.client_instructions && (
                    <div className="pt-2 border-t border-gray-200">
                      <span className="text-sm text-gray-600">Instructions</span>
                      <p className="text-sm text-gray-900 mt-1">
                        {commandeInfo.client_instructions}
                      </p>
                    </div>
                  )}
                  {!commandeInfo.client_nom && !commandeInfo.client_telephone && !commandeInfo.client_adresse && (
                    <div className="text-center py-4">
                      <p className="text-sm text-gray-500">Aucune information client disponible</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Articles */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                  <Package className="h-5 w-5 mr-2" />
                  Articles ({details.nombre_articles})
                </h3>
                <div className="space-y-3">
                  {details.articles.map((article, index) => (
                    <div
                      key={index}
                      className="bg-gray-50 rounded-lg p-4 flex items-start space-x-4"
                    >
                      {article.image_url && (
                        <img
                          src={article.image_url}
                          alt={article.nom_produit}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-gray-900 truncate">
                          {article.nom_produit}
                        </h4>
                        {article.description && (
                          <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                            {article.description}
                          </p>
                        )}
                        {article.variants_selectionnes && (
                          <div className="mt-2 flex flex-wrap gap-2">
                            {Object.entries(article.variants_selectionnes).map(([key, value]) => {
                              // Si value est un objet avec un nom, afficher le nom
                              const displayValue = typeof value === 'object' && value !== null
                                ? (value.nom || JSON.stringify(value))
                                : String(value);
                              
                              return (
                                <span
                                  key={key}
                                  className="text-xs bg-white px-2 py-1 rounded border border-gray-200"
                                >
                                  {key}: {displayValue}
                                </span>
                              );
                            })}
                          </div>
                        )}
                        <div className="mt-2 flex items-center justify-between">
                          <span className="text-sm text-gray-600">
                            Qté: {article.quantite} × {formatPrice(article.prix_unitaire)}
                          </span>
                          <span className="text-sm font-semibold text-gray-900">
                            {formatPrice(article.quantite * article.prix_unitaire)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Récapitulatif des montants */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                  <CreditCard className="h-5 w-5 mr-2" />
                  Récapitulatif
                </h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Sous-total</span>
                    <span className="font-medium text-gray-900">
                      {formatPrice(commandeInfo.sous_total)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 flex items-center">
                      <Truck className="h-4 w-4 mr-1" />
                      Frais de livraison
                    </span>
                    <span className="font-medium text-gray-900">
                      {formatPrice(commandeInfo.frais_livraison)}
                    </span>
                  </div>

                  {commandeInfo.taxes > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Taxes</span>
                      <span className="font-medium text-gray-900">
                        {formatPrice(commandeInfo.taxes)}
                      </span>
                    </div>
                  )}

                  {commandeInfo.remise > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Remise</span>
                      <span className="font-medium text-green-600">
                        -{formatPrice(commandeInfo.remise)}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-3 border-t-2 border-gray-300">
                    <span className="text-base font-semibold text-gray-900">Total</span>
                    <span className="text-xl font-bold text-gray-900">
                      {formatPrice(commandeInfo.total)}
                    </span>
                  </div>

                  {/* Montants payé et restant */}
                  {(commandeInfo.montant_paye !== undefined || commandeInfo.montant_restant !== undefined) && (
                    <>
                      {commandeInfo.montant_paye !== undefined && commandeInfo.montant_paye > 0 && (
                        <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                          <span className="text-sm text-gray-600 flex items-center">
                            <CheckCircle2 className="h-4 w-4 mr-1 text-green-600" />
                            Montant payé
                          </span>
                          <span className="text-sm font-semibold text-green-600">
                            {formatPrice(commandeInfo.montant_paye)}
                          </span>
                        </div>
                      )}
                      {commandeInfo.montant_restant !== undefined && commandeInfo.montant_restant > 0 && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600 flex items-center">
                            <XCircle className="h-4 w-4 mr-1 text-orange-600" />
                            Montant restant
                          </span>
                          <span className="text-sm font-semibold text-orange-600">
                            {formatPrice(commandeInfo.montant_restant)}
                          </span>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Transactions */}
              {commandeInfo.transactions && commandeInfo.transactions.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                    <Receipt className="h-5 w-5 mr-2" />
                    Transactions ({commandeInfo.transactions.length})
                  </h3>
                  <div className="space-y-3">
                    {commandeInfo.transactions.map((transaction, index) => (
                      <div
                        key={transaction.id}
                        className="bg-gray-50 rounded-lg p-4"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-mono text-gray-500">
                            {transaction.reference_transaction}
                          </span>
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${transaction.statut.toLowerCase() === 'paye'
                                ? 'bg-green-100 text-green-800'
                                : transaction.statut.toLowerCase() === 'en_attente'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : transaction.statut.toLowerCase() === 'echoue'
                                    ? 'bg-red-100 text-red-800'
                                    : 'bg-gray-100 text-gray-800'
                              }`}
                          >
                            {getPaymentStatusLabel(transaction.statut)}
                          </span>
                        </div>
                        <div className="space-y-1 text-sm">
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600">Montant</span>
                            <span className="font-semibold text-gray-900">
                              {formatPrice(transaction.montant)}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600">Méthode</span>
                            <span className="font-medium text-gray-900">
                              {transaction.methode_paiement}
                            </span>
                          </div>
                          {transaction.numero_telephone && (
                            <div className="flex items-center justify-between">
                              <span className="text-gray-600">Téléphone</span>
                              <span className="font-medium text-gray-900">
                                {transaction.numero_telephone}
                              </span>
                            </div>
                          )}
                          {transaction.reference_operateur && (
                            <div className="flex items-center justify-between">
                              <span className="text-gray-600">Réf. opérateur</span>
                              <span className="font-mono text-xs text-gray-900">
                                {transaction.reference_operateur}
                              </span>
                            </div>
                          )}
                          <div className="flex items-center justify-between pt-1 border-t border-gray-200 mt-1">
                            <span className="text-gray-600">Date</span>
                            <span className="text-gray-900">
                              {formatDate(transaction.date_creation)}
                            </span>
                          </div>
                          {transaction.date_confirmation && (
                            <div className="flex items-center justify-between">
                              <span className="text-gray-600">Confirmé le</span>
                              <span className="text-gray-900">
                                {formatDate(transaction.date_confirmation)}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Dates importantes */}
              {(commandeInfo.date_confirmation ||
                commandeInfo.date_expedition ||
                commandeInfo.date_livraison) && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Historique</h3>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                      {commandeInfo.date_confirmation && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Date de confirmation</span>
                          <span className="font-medium text-gray-900">
                            {formatDate(commandeInfo.date_confirmation)}
                          </span>
                        </div>
                      )}
                      {commandeInfo.date_expedition && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Date d'expédition</span>
                          <span className="font-medium text-gray-900">
                            {formatDate(commandeInfo.date_expedition)}
                          </span>
                        </div>
                      )}
                      {commandeInfo.date_livraison && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Date de livraison</span>
                          <span className="font-medium text-gray-900">
                            {formatDate(commandeInfo.date_livraison)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
            </div>
          )}
        </div>
      </div>

      {/* Modal de confirmation */}
      {showConfirmModal && pendingStatusUpdate && commandeInfo && (
        <div 
          className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4"
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
                  : 'bg-emerald-100'
              }`}>
                {pendingStatusUpdate.newStatus === 'expedie' ? (
                  <Truck className={`h-6 w-6 text-indigo-600`} />
                ) : (
                  <CheckCircle2 className={`h-6 w-6 text-emerald-600`} />
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
                    {getStatusLabelLocal(commandeInfo.statut)}
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
                      : 'text-emerald-600'
                  }`}>
                    {getStatusLabelLocal(pendingStatusUpdate.newStatus)}
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
                disabled={isUpdatingStatus}
                className="flex-1 px-4 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm disabled:opacity-50"
              >
                Annuler
              </button>
              <button
                onClick={() => handleUpdateStatus(pendingStatusUpdate.newStatus, pendingStatusUpdate.statusLabel)}
                disabled={isUpdatingStatus}
                className={`flex-1 px-4 py-2.5 text-white rounded-lg transition-colors font-medium text-sm disabled:opacity-50 ${
                  pendingStatusUpdate.newStatus === 'expedie'
                    ? 'bg-indigo-600 hover:bg-indigo-700'
                    : 'bg-emerald-600 hover:bg-emerald-700'
                }`}
              >
                {isUpdatingStatus ? 'Mise à jour...' : (pendingStatusUpdate.newStatus === 'expedie' ? 'Expédier' : 'Livrer')}
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
    </>
  );
};

export default OrderDetailsSidebar;

