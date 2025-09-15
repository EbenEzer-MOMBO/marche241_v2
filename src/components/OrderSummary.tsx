'use client';

import { useState } from 'react';
import Image from 'next/image';
import { formatPrice } from '@/lib/utils';
import { BoutiqueConfig } from '@/lib/boutiques';
import { usePanier } from '@/hooks/usePanier';


interface OrderSummaryProps {
  boutiqueConfig: BoutiqueConfig;
}

type PaymentMethod = 'moov' | 'airtel' | null;

interface DeliveryAddress {
  fullName: string;
  phone: string;
  address: string;
  city: string;
  district: string;
  additionalInfo: string;
}

export function OrderSummary({ boutiqueConfig }: OrderSummaryProps) {
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod>(null);
  const [paymentPhone, setPaymentPhone] = useState('');
  const [paymentPhoneError, setPaymentPhoneError] = useState('');
  const [payOnDelivery, setPayOnDelivery] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState<DeliveryAddress>({
    fullName: '',
    phone: '',
    address: '',
    city: '',
    district: '',
    additionalInfo: ''
  });

  // Utilisation du hook panier pour récupérer les vraies données
  const { panier, totalItems, totalPrix, loading } = usePanier();

  const subtotal = totalPrix;
  
  // Calcul des frais de livraison basé sur la commune sélectionnée
  const getDeliveryFee = () => {
    if (!deliveryAddress.city) return 0;
    
    // Frais de livraison par commune
    const deliveryFees: Record<string, number> = {
      'Libreville': 2000,
      'Akanda': 2500,
      'Owendo': 2500,
    };
    
    return deliveryFees[deliveryAddress.city] || 0;
  };
  
  const deliveryFee = getDeliveryFee();
  
  // Calcul des frais de transaction (2,5%)
  const getTransactionFee = () => {
    const transactionRate = 0.025; // 2,5%
    
    if (payOnDelivery) {
      // Pour paiement à la livraison : 2,5% seulement sur les frais de livraison
      return Math.round(deliveryFee * transactionRate);
    } else {
      // Pour paiement normal : 2,5% sur le total (sous-total + livraison)
      const baseAmount = subtotal + deliveryFee;
      return Math.round(baseAmount * transactionRate);
    }
  };
  
  // Les frais de transaction sont calculés dynamiquement
  
  // Calcul du total selon le mode de paiement
  const getTotalToPay = () => {
    if (payOnDelivery) {
      return deliveryFee + getTransactionFee(); // Frais de livraison + frais de transaction
    }
    return subtotal + deliveryFee + getTransactionFee(); // Total complet
  };
  
  const totalToPay = getTotalToPay();
  const remainingAmount = payOnDelivery ? subtotal : 0;

  // Vérification si toutes les conditions sont remplies pour activer le bouton
  const isFormValid = () => {
    // Vérifier que tous les champs obligatoires de l'adresse sont remplis
    const isAddressComplete = deliveryAddress.fullName.trim() !== '' &&
                             deliveryAddress.phone.trim() !== '' &&
                             deliveryAddress.address.trim() !== '' &&
                             deliveryAddress.city.trim() !== '';
    
    // Vérifier qu'un mode de paiement est sélectionné (ou paiement à la livraison)
    const isPaymentSelected = selectedPayment !== null || payOnDelivery;
    
    // Vérifier que le numéro de paiement est valide (sauf si paiement à la livraison)
    const isPaymentPhoneValid = payOnDelivery || 
                               (paymentPhone.length === 9 && 
                                paymentPhoneError === '' && 
                                selectedPayment !== null);
    
    // Vérifier que les frais de livraison sont calculés (commune sélectionnée)
    const isDeliveryFeeSet = deliveryFee > 0;
    
    return isAddressComplete && isPaymentSelected && isPaymentPhoneValid && isDeliveryFeeSet;
  };

  // Génère le message approprié pour le bouton selon l'état de validation
  const getButtonMessage = () => {
    if (!deliveryAddress.fullName || !deliveryAddress.phone || !deliveryAddress.address) {
      return 'Complétez votre adresse de livraison';
    }
    if (!deliveryAddress.city) {
      return 'Sélectionnez une commune pour continuer';
    }
    if (!selectedPayment && !payOnDelivery) {
      return 'Sélectionnez un mode de paiement';
    }
    if (selectedPayment && !payOnDelivery && (!paymentPhone || paymentPhoneError)) {
      return 'Saisissez un numéro de paiement valide';
    }
    
    if (payOnDelivery) {
      return `Confirmer la commande (${formatPrice(totalToPay)})`;
    }
    return `Confirmer et payer ${formatPrice(totalToPay)}`;
  };

  const handleAddressChange = (field: keyof DeliveryAddress, value: string) => {
    setDeliveryAddress(prev => ({ ...prev, [field]: value }));
  };

  const handlePaymentChange = (payment: PaymentMethod) => {
    setSelectedPayment(payment);
    // Réinitialiser le numéro de téléphone et l'erreur quand on change de mode de paiement
    setPaymentPhone('');
    setPaymentPhoneError('');
  };

  const getPhonePlaceholder = () => {
    if (selectedPayment === 'moov') return '06XXXXXXX';
    if (selectedPayment === 'airtel') return '07XXXXXXX';
    return '';
  };

  const validatePaymentPhone = (phone: string, paymentType: PaymentMethod): string => {
    if (!phone) return '';
    
    // Supprimer tous les espaces et caractères non numériques sauf le +
    const cleanPhone = phone.replace(/[^\d+]/g, '');
    
    if (paymentType === 'moov') {
      // Format Moov: doit commencer par 06 et avoir 9 chiffres au total
      if (!/^06\d{7}$/.test(cleanPhone)) {
        return 'Le numéro Moov Money doit respecter le format 06XXXXXXX (9 chiffres)';
      }
    } else if (paymentType === 'airtel') {
      // Format Airtel: doit commencer par 07 et avoir 9 chiffres au total
      if (!/^07\d{7}$/.test(cleanPhone)) {
        return 'Le numéro Airtel Money doit respecter le format 07XXXXXXX (9 chiffres)';
      }
    }
    
    return '';
  };

  const handlePaymentPhoneChange = (value: string) => {
    // Limiter à 9 caractères et permettre seulement les chiffres
    const cleanValue = value.replace(/[^\d]/g, '').slice(0, 9);
    setPaymentPhone(cleanValue);
    
    // Validation en temps réel
    if (selectedPayment) {
      const error = validatePaymentPhone(cleanValue, selectedPayment);
      setPaymentPhoneError(error);
    }
  };

  const handleSubmitOrder = () => {
    // Double vérification de sécurité (normalement le bouton est déjà désactivé)
    if (!isFormValid()) {
      alert('Veuillez compléter toutes les informations requises');
      return;
    }

    // Logique de soumission de commande
    console.log('Commande soumise:', {
      items: panier,
      payment: payOnDelivery ? 'cash_on_delivery' : selectedPayment,
      paymentPhone: payOnDelivery ? null : paymentPhone,
      payOnDelivery,
      address: deliveryAddress,
      subtotal,
      deliveryFee,
      transactionFee: getTransactionFee(),
      totalToPay,
      remainingAmount
    });
    
    alert('Commande confirmée ! Vous allez être redirigé vers le paiement.');
  };

  return (
    <div className="w-full">
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Colonne gauche - Résumé du panier et adresse */}
        <div className="lg:col-span-2">
        {/* Articles du panier */}
        <div className="bg-white rounded-lg shadow-md mb-6 border border-gray-100">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-black">
              Votre commande ({totalItems} articles)
            </h3>
          </div>
          <div className="p-6">
            {loading ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                <span className="ml-2 text-gray-600">Chargement du panier...</span>
              </div>
            ) : panier.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">Votre panier est vide</p>
              </div>
            ) : (
              panier.map((item, index) => {
                // Construire la chaîne de variants
                const variantText = item.variants_selectionnes 
                  ? Object.entries(item.variants_selectionnes)
                      .map(([key, value]) => `${key}: ${value}`)
                      .join(', ')
                  : null;
                
                // Utiliser l'image principale du produit ou une image par défaut
                const imageUrl = item.produit.image_principale || '/article1.webp';
                
                return (
                  <div key={item.id} className={`flex items-center py-4 ${index < panier.length - 1 ? 'border-b border-gray-200' : ''}`}>
                    <div className="w-20 h-20 relative flex-shrink-0">
                      <Image
                        src={imageUrl}
                        alt={item.produit.nom}
                        fill
                        className="rounded-lg object-cover"
                      />
                    </div>
                    <div className="flex-1 ml-4">
                      <h4 className="font-medium text-gray-900 mb-1">{item.produit.nom}</h4>
                      {variantText && (
                        <p className="text-sm text-gray-500 mb-2">{variantText}</p>
                      )}
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Quantité: {item.quantite}</span>
                        <span className="font-semibold text-lg text-black">
                          {formatPrice(item.produit.prix * item.quantite)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Adresse de livraison */}
        <div className="bg-white rounded-lg shadow-md border border-gray-100">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-black">
              Adresse de livraison
            </h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Nom complet *</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50"

                  value={deliveryAddress.fullName}
                  onChange={(e) => handleAddressChange('fullName', e.target.value)}
                  placeholder="Votre nom complet"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Téléphone (WhatsApp si possible) *</label>
                <input
                  type="tel"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50"

                  value={deliveryAddress.phone}
                  onChange={(e) => handleAddressChange('phone', e.target.value)}
                  placeholder="+2416XXXXXXX"
                  required
                />
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="block text-sm font-medium text-gray-700">Adresse complète *</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50"

                  value={deliveryAddress.address}
                  onChange={(e) => handleAddressChange('address', e.target.value)}
                  placeholder="Numéro, rue, quartier"
                  required
                />
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="block text-sm font-medium text-gray-700">Commune *</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50"

                  value={deliveryAddress.city}
                  onChange={(e) => handleAddressChange('city', e.target.value)}
                  required
                >
                  <option value="">Sélectionner une commune</option>
                  <option value="Libreville">Libreville (2000 FCFA)</option>
                  <option value="Akanda">Akanda (2500 FCFA)</option>
                  <option value="Owendo">Owendo (2500 FCFA)</option>
                </select>
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="block text-sm font-medium text-gray-700">Informations supplémentaires</label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50"

                  rows={3}
                  value={deliveryAddress.additionalInfo}
                  onChange={(e) => handleAddressChange('additionalInfo', e.target.value)}
                  placeholder="Instructions de livraison, points de repère..."
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Colonne droite - Modes de paiement et total */}
      <div className="space-y-6">
        {/* Modes de paiement */}
        <div className="bg-white rounded-lg shadow-md border border-gray-100">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-black">
              Mode de paiement
            </h3>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <div 
                className={`border rounded-lg p-4 cursor-pointer transition-all duration-200 ${
                  selectedPayment === 'moov' 
                    ? 'border-2 bg-blue-50' 
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                style={{ 
                  borderColor: selectedPayment === 'moov' ? boutiqueConfig.theme.primary : undefined,
                  backgroundColor: selectedPayment === 'moov' ? `${boutiqueConfig.theme.primary}10` : undefined
                }}
                onClick={() => handlePaymentChange('moov')}
              >
                <div className="flex items-center">
                  <input
                    type="radio"
                    name="payment"
                    checked={selectedPayment === 'moov'}
                    onChange={() => handlePaymentChange('moov')}
                    className="mr-3 w-4 h-4"
                    style={{ accentColor: boutiqueConfig.theme.primary }}
                  />
                  <Image
                    src="/moov_money.png"
                    alt="Moov Money"
                    width={40}
                    height={40}
                    className="mr-3 rounded"
                  />
                  <div>
                    <div className="font-semibold text-gray-900">Moov Money</div>
                    <div className="text-sm text-gray-600">Paiement mobile sécurisé</div>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <div 
                className={`border rounded-lg p-4 cursor-pointer transition-all duration-200 ${
                  selectedPayment === 'airtel' 
                    ? 'border-2 bg-blue-50' 
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                style={{ 
                  borderColor: selectedPayment === 'airtel' ? boutiqueConfig.theme.primary : undefined,
                  backgroundColor: selectedPayment === 'airtel' ? `${boutiqueConfig.theme.primary}10` : undefined
                }}
                onClick={() => handlePaymentChange('airtel')}
              >
                <div className="flex items-center">
                  <input
                    type="radio"
                    name="payment"
                    checked={selectedPayment === 'airtel'}
                    onChange={() => handlePaymentChange('airtel')}
                    className="mr-3 w-4 h-4"
                    style={{ accentColor: boutiqueConfig.theme.primary }}
                  />
                  <Image
                    src="/airtel_money.png"
                    alt="Airtel Money"
                    width={40}
                    height={40}
                    className="mr-3 rounded"
                  />
                  <div>
                    <div className="font-semibold text-gray-900">Airtel Money</div>
                    <div className="text-sm text-gray-600">Paiement mobile sécurisé</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Champ numéro de téléphone qui apparaît après sélection */}
            {selectedPayment && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Numéro {selectedPayment === 'moov' ? 'Moov Money' : 'Airtel Money'} *
                </label>
                <input
                  type="tel"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50 ${
                    paymentPhoneError 
                      ? 'border-red-500 focus:ring-red-500' 
                      : paymentPhone.length === 9 && !paymentPhoneError
                        ? 'border-green-500 focus:ring-green-500'
                        : 'border-gray-300 focus:ring-blue-500'
                  }`}

                  value={paymentPhone}
                  onChange={(e) => handlePaymentPhoneChange(e.target.value)}
                  placeholder={getPhonePlaceholder()}
                  maxLength={9}
                  required
                />
                {paymentPhoneError ? (
                  <p className="text-xs text-red-600 mt-1 flex items-center">
                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {paymentPhoneError}
                  </p>
                ) : paymentPhone.length === 9 && !paymentPhoneError ? (
                  <p className="text-xs text-green-600 mt-1 flex items-center">
                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Numéro valide
                  </p>
                ) : (
                  <p className="text-xs text-gray-500 mt-1">
                    Saisissez le numéro de téléphone associé à votre compte {selectedPayment === 'moov' ? 'Moov Money' : 'Airtel Money'}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Récapitulatif des prix */}
        <div className="bg-white rounded-lg shadow-md sticky top-24 border border-gray-100">
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-6 text-black">
              Récapitulatif de la commande
            </h3>
            
            <div className="space-y-3 mb-4">
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-600">Sous-total ({totalItems} articles)</span>
                <span className="font-medium">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-600">
                  Frais de livraison
                  {deliveryAddress.city && (
                    <span className="text-xs text-gray-500 block">({deliveryAddress.city})</span>
                  )}
                </span>
                <span className="font-medium">
                  {deliveryFee > 0 ? formatPrice(deliveryFee) : 'Sélectionnez une commune'}
                </span>
              </div>
              {getTransactionFee() > 0 && (
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-600">
                    Frais de transaction
                    <span className="text-xs text-gray-500 block">
                      {payOnDelivery 
                        ? '(2,5% sur frais de livraison)' 
                        : '(2,5% sur total commande)'
                      }
                    </span>
                  </span>
                  <span className="font-medium">{formatPrice(getTransactionFee())}</span>
                </div>
              )}
            </div>

            {/* Option paiement à la livraison */}
            <div className="border-t border-b py-4 border-gray-200">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={payOnDelivery}
                  onChange={(e) => setPayOnDelivery(e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="ml-3 text-sm font-medium text-gray-700">
                  Je paie à la livraison
                </span>
              </label>
              {payOnDelivery && (
                <p className="text-xs text-gray-500 mt-2 ml-7">
                  Vous payez les frais de livraison + frais de transaction maintenant. Le reste sera payé à la réception.
                </p>
              )}
            </div>
            
            <div className="pt-4 mb-6">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold">
                  {payOnDelivery ? 'À payer maintenant' : 'Total à payer'}
                </span>
                <span className="text-2xl font-bold" style={{ color: boutiqueConfig.theme.primary }}>
                  {formatPrice(totalToPay)}
                </span>
              </div>
              {payOnDelivery && remainingAmount > 0 && (
                <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-200">
                  <span className="text-sm text-gray-600">Reste à payer à la livraison</span>
                  <span className="text-lg font-semibold text-gray-700">
                    {formatPrice(remainingAmount)}
              </span>
                </div>
              )}
            </div>
            
            <button
              onClick={handleSubmitOrder}
              disabled={!isFormValid()}
              className={`w-full py-4 px-6 font-semibold rounded-lg transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-opacity-50 ${
                !isFormValid() 
                  ? 'bg-gray-400 text-gray-600 cursor-not-allowed' 
                  : 'text-white hover:opacity-90'
              }`}
              style={{ 
                backgroundColor: !isFormValid() ? undefined : boutiqueConfig.theme.primary
              }}
            >
              {getButtonMessage()}
            </button>
            
            <div className="text-center mt-4">
              <p className="text-sm text-gray-500">
                🔒 Paiement sécurisé • En confirmant, vous acceptez nos conditions
              </p>
            </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}