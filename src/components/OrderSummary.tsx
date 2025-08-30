'use client';

import { useState } from 'react';
import Image from 'next/image';
import { formatPrice } from '@/lib/utils';
import { BoutiqueConfig } from '@/app/[boutique]/layout';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  variant?: string;
}

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
  const [deliveryAddress, setDeliveryAddress] = useState<DeliveryAddress>({
    fullName: '',
    phone: '',
    address: '',
    city: '',
    district: '',
    additionalInfo: ''
  });

  // Données de test pour le panier
  const cartItems: CartItem[] = [
    {
      id: '1',
      name: 'Initial Armandèse',
      price: 12500,
      quantity: 2,
      image: '/article2.webp',
      variant: 'Initial : D, Couleur : Or'
    },
    {
      id: '2',
      name: 'Robe Élégante',
      price: 45000,
      quantity: 1,
      image: '/article1.webp'
    }
  ];

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const deliveryFee = 2500;
  const total = subtotal + deliveryFee;

  const handleAddressChange = (field: keyof DeliveryAddress, value: string) => {
    setDeliveryAddress(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmitOrder = () => {
    if (!selectedPayment) {
      alert('Veuillez sélectionner un mode de paiement');
      return;
    }
    
    if (!deliveryAddress.fullName || !deliveryAddress.phone || !deliveryAddress.address || !deliveryAddress.city) {
      alert('Veuillez remplir tous les champs obligatoires de l\'adresse');
      return;
    }

    // Logique de soumission de commande
    console.log('Commande soumise:', {
      items: cartItems,
      payment: selectedPayment,
      address: deliveryAddress,
      total
    });
    
    alert('Commande confirmée ! Vous allez être redirigé vers le paiement.');
  };

  return (
    <div className="row">
      {/* Colonne gauche - Résumé du panier */}
      <div className="col-lg-8 mb-4">
        <div className="card shadow-sm">
          <div className="card-header" style={{ backgroundColor: boutiqueConfig.theme.primary, color: 'white' }}>
            <h5 className="mb-0">Votre commande ({cartItems.length} articles)</h5>
          </div>
          <div className="card-body">
            {cartItems.map((item) => (
              <div key={item.id} className="d-flex align-items-center border-bottom py-3">
                <div className="position-relative" style={{ width: '80px', height: '80px' }}>
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="rounded object-cover"
                  />
                </div>
                <div className="flex-grow-1 ms-3">
                  <h6 className="mb-1">{item.name}</h6>
                  {item.variant && (
                    <small className="text-muted">{item.variant}</small>
                  )}
                  <div className="d-flex justify-content-between align-items-center mt-2">
                    <span className="text-muted">Quantité: {item.quantity}</span>
                    <strong style={{ color: boutiqueConfig.theme.primary }}>
                      {formatPrice(item.price * item.quantity)}
                    </strong>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Adresse de livraison */}
        <div className="card shadow-sm mt-4">
          <div className="card-header" style={{ backgroundColor: boutiqueConfig.theme.secondary, color: 'white' }}>
            <h5 className="mb-0">Adresse de livraison</h5>
          </div>
          <div className="card-body">
            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label">Nom complet *</label>
                <input
                  type="text"
                  className="form-control"
                  value={deliveryAddress.fullName}
                  onChange={(e) => handleAddressChange('fullName', e.target.value)}
                  placeholder="Votre nom complet"
                  required
                />
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label">Téléphone *</label>
                <input
                  type="tel"
                  className="form-control"
                  value={deliveryAddress.phone}
                  onChange={(e) => handleAddressChange('phone', e.target.value)}
                  placeholder="Ex: +241 01 23 45 67"
                  required
                />
              </div>
              <div className="col-12 mb-3">
                <label className="form-label">Adresse complète *</label>
                <input
                  type="text"
                  className="form-control"
                  value={deliveryAddress.address}
                  onChange={(e) => handleAddressChange('address', e.target.value)}
                  placeholder="Numéro, rue, quartier"
                  required
                />
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label">Ville *</label>
                <select
                  className="form-select"
                  value={deliveryAddress.city}
                  onChange={(e) => handleAddressChange('city', e.target.value)}
                  required
                >
                  <option value="">Sélectionner une ville</option>
                  <option value="Libreville">Libreville</option>
                  <option value="Port-Gentil">Port-Gentil</option>
                  <option value="Franceville">Franceville</option>
                  <option value="Oyem">Oyem</option>
                  <option value="Moanda">Moanda</option>
                  <option value="Lambaréné">Lambaréné</option>
                </select>
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label">Arrondissement/Quartier</label>
                <input
                  type="text"
                  className="form-control"
                  value={deliveryAddress.district}
                  onChange={(e) => handleAddressChange('district', e.target.value)}
                  placeholder="Ex: 1er arrondissement"
                />
              </div>
              <div className="col-12 mb-3">
                <label className="form-label">Informations supplémentaires</label>
                <textarea
                  className="form-control"
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
      <div className="col-lg-4">
        {/* Modes de paiement */}
        <div className="card shadow-sm mb-4">
          <div className="card-header" style={{ backgroundColor: boutiqueConfig.theme.accent, color: 'white' }}>
            <h5 className="mb-0">Mode de paiement</h5>
          </div>
          <div className="card-body">
            <div className="mb-3">
              <div 
                className={`border rounded p-3 cursor-pointer transition-all ${
                  selectedPayment === 'moov' ? 'border-primary bg-light' : 'border-secondary'
                }`}
                onClick={() => setSelectedPayment('moov')}
                style={{ cursor: 'pointer' }}
              >
                <div className="d-flex align-items-center">
                  <input
                    type="radio"
                    name="payment"
                    checked={selectedPayment === 'moov'}
                    onChange={() => setSelectedPayment('moov')}
                    className="me-3"
                  />
                  <Image
                    src="/moov_money.png"
                    alt="Moov Money"
                    width={40}
                    height={40}
                    className="me-3"
                  />
                  <div>
                    <strong>Moov Money</strong>
                    <div className="small text-muted">Paiement mobile sécurisé</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-3">
              <div 
                className={`border rounded p-3 cursor-pointer transition-all ${
                  selectedPayment === 'airtel' ? 'border-primary bg-light' : 'border-secondary'
                }`}
                onClick={() => setSelectedPayment('airtel')}
                style={{ cursor: 'pointer' }}
              >
                <div className="d-flex align-items-center">
                  <input
                    type="radio"
                    name="payment"
                    checked={selectedPayment === 'airtel'}
                    onChange={() => setSelectedPayment('airtel')}
                    className="me-3"
                  />
                  <Image
                    src="/airtel_money.png"
                    alt="Airtel Money"
                    width={40}
                    height={40}
                    className="me-3"
                  />
                  <div>
                    <strong>Airtel Money</strong>
                    <div className="small text-muted">Paiement mobile sécurisé</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Récapitulatif des prix */}
        <div className="card shadow-sm">
          <div className="card-header" style={{ backgroundColor: boutiqueConfig.theme.primary, color: 'white' }}>
            <h5 className="mb-0">Récapitulatif</h5>
          </div>
          <div className="card-body">
            <div className="d-flex justify-content-between mb-2">
              <span>Sous-total</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div className="d-flex justify-content-between mb-2">
              <span>Livraison</span>
              <span>{formatPrice(deliveryFee)}</span>
            </div>
            <hr />
            <div className="d-flex justify-content-between mb-4">
              <strong>Total</strong>
              <strong style={{ color: boutiqueConfig.theme.primary, fontSize: '1.2em' }}>
                {formatPrice(total)}
              </strong>
            </div>
            
            <button
              onClick={handleSubmitOrder}
              className="btn btn-lg w-100"
              style={{ 
                backgroundColor: boutiqueConfig.theme.primary, 
                borderColor: boutiqueConfig.theme.primary,
                color: 'white'
              }}
            >
              Confirmer la commande
            </button>
            
            <div className="text-center mt-3">
              <small className="text-muted">
                En confirmant, vous acceptez nos conditions de vente
              </small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}