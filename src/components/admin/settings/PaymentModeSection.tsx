'use client';

import React from 'react';
import { CreditCard, ShoppingBag, Truck, Info } from 'lucide-react';

export type PaymentRestrictionMode = 'complet_uniquement' | 'livraison_uniquement' | 'les_deux';

interface PaymentModeSectionProps {
  paymentRestrictionMode: PaymentRestrictionMode;
  onChange: (value: PaymentRestrictionMode) => void;
}

export const PaymentModeSection: React.FC<PaymentModeSectionProps> = ({
  paymentRestrictionMode,
  onChange,
}) => {
  return (
    <div className="bg-white">
      <div className="flex items-center mb-4">
        <CreditCard className="h-5 w-5 text-gray-700 mr-2" />
        <h3 className="text-lg font-semibold text-gray-900">
          Restriction des Modes de Paiement
        </h3>
      </div>

      <p className="text-sm text-gray-600 mb-6">
        Configurez les options de paiement disponibles pour vos clients lors de la validation de leur commande.
      </p>

      <div className="space-y-4">
        {/* Les deux options */}
        <div
          onClick={() => onChange('les_deux')}
          className={`relative border-2 rounded-lg p-4 cursor-pointer transition-all ${
            paymentRestrictionMode === 'les_deux'
              ? 'border-green-500 bg-green-50'
              : 'border-gray-200 hover:border-gray-300 bg-white'
          }`}
        >
          <div className="flex items-start">
            <input
              type="radio"
              checked={paymentRestrictionMode === 'les_deux'}
              onChange={() => onChange('les_deux')}
              className="mt-1 h-4 w-4 text-green-600 focus:ring-green-500"
            />
            <div className="ml-3 flex-1">
              <div className="flex items-center">
                <ShoppingBag className="h-5 w-5 text-green-600 mr-2" />
                <label className="font-medium text-gray-900 cursor-pointer">
                  Les deux options (Recommandé)
                </label>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                Le client peut choisir librement lors de sa commande :
              </p>
              <ul className="text-sm text-gray-600 mt-2 ml-4 space-y-1">
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span><strong>Paiement complet :</strong> Payer le montant total (produits + livraison) immédiatement en ligne.</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span><strong>Paiement à la livraison :</strong> Payer uniquement les frais de livraison en ligne, et le montant des produits à la réception.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Frais de livraison uniquement */}
        <div
          onClick={() => onChange('livraison_uniquement')}
          className={`relative border-2 rounded-lg p-4 cursor-pointer transition-all ${
            paymentRestrictionMode === 'livraison_uniquement'
              ? 'border-amber-500 bg-amber-50'
              : 'border-gray-200 hover:border-gray-300 bg-white'
          }`}
        >
          <div className="flex items-start">
            <input
              type="radio"
              checked={paymentRestrictionMode === 'livraison_uniquement'}
              onChange={() => onChange('livraison_uniquement')}
              className="mt-1 h-4 w-4 text-amber-600 focus:ring-amber-500"
            />
            <div className="ml-3 flex-1">
              <div className="flex items-center">
                <Truck className="h-5 w-5 text-amber-600 mr-2" />
                <label className="font-medium text-gray-900 cursor-pointer">
                  Paiement des frais de livraison uniquement
                </label>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                Seul le paiement des frais de livraison est requis en ligne pour valider la commande :
              </p>
              <ul className="text-sm text-gray-600 mt-2 ml-4 space-y-1">
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Le client paie uniquement les frais de livraison (et frais de transaction) en ligne.</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Le montant total des produits est réglé directement au livreur à la réception.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Paiement complet uniquement */}
        <div
          onClick={() => onChange('complet_uniquement')}
          className={`relative border-2 rounded-lg p-4 cursor-pointer transition-all ${
            paymentRestrictionMode === 'complet_uniquement'
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-200 hover:border-gray-300 bg-white'
          }`}
        >
          <div className="flex items-start">
            <input
              type="radio"
              checked={paymentRestrictionMode === 'complet_uniquement'}
              onChange={() => onChange('complet_uniquement')}
              className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500"
            />
            <div className="ml-3 flex-1">
              <div className="flex items-center">
                <CreditCard className="h-5 w-5 text-blue-600 mr-2" />
                <label className="font-medium text-gray-900 cursor-pointer">
                  Paiement complet uniquement
                </label>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                Le paiement en ligne de l'intégralité de la commande est obligatoire :
              </p>
              <ul className="text-sm text-gray-600 mt-2 ml-4 space-y-1">
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Le client doit régler la totalité de la commande (produits + livraison) en ligne.</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Aucun paiement à la livraison n'est autorisé pour cette boutique.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Informations supplémentaires */}
      <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <div className="flex items-start">
          <Info className="h-5 w-5 text-gray-600 mr-3 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-gray-700">
            <p className="font-medium mb-1">💡 Conseil pour votre choix</p>
            <p>
              Le mode <strong>Les deux options</strong> offre le plus de flexibilité à vos clients et peut maximiser vos ventes.
              Choisissez <strong>Frais de livraison uniquement</strong> si vous souhaitez sécuriser l'envoi de la commande tout en permettant aux clients de payer leurs articles à réception.
              Choisissez <strong>Paiement complet uniquement</strong> si vous ne souhaitez pas gérer de transactions en espèces lors de la livraison.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
