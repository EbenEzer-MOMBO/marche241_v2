'use client';

import { useEffect, useState } from 'react';
import { X, Package, User, MapPin, Phone, Calendar, CreditCard, Truck, Receipt, CheckCircle2, XCircle } from 'lucide-react';
import Image from 'next/image';
import {
  getCommandeAvecArticles,
  getCommandeById,
  type CommandeDetailsResponse,
  type Commande,
  type Transaction
} from '@/lib/services/commandes';

interface OrderDetailsSidebarProps {
  commandeId: number | null;
  isOpen: boolean;
  onClose: () => void;
}

const OrderDetailsSidebar = ({ commandeId, isOpen, onClose }: OrderDetailsSidebarProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [details, setDetails] = useState<CommandeDetailsResponse | null>(null);
  const [commandeInfo, setCommandeInfo] = useState<Commande | null>(null);
  const [error, setError] = useState<string | null>(null);

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
                    {getStatusLabel(commandeInfo.statut)}
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
                            {Object.entries(article.variants_selectionnes).map(([key, value]) => (
                              <span
                                key={key}
                                className="text-xs bg-white px-2 py-1 rounded border border-gray-200"
                              >
                                {key}: {value}
                              </span>
                            ))}
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
    </>
  );
};

export default OrderDetailsSidebar;

