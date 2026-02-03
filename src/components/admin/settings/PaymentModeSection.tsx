'use client';

import React from 'react';
import { CreditCard, ShoppingBag, Info } from 'lucide-react';

interface PaymentModeSectionProps {
  isFullPaymentActivated: boolean;
  onChange: (value: boolean) => void;
}

export const PaymentModeSection: React.FC<PaymentModeSectionProps> = ({
  isFullPaymentActivated,
  onChange,
}) => {
  return (
    <div className="bg-white ">
      <div className="flex items-center mb-4">
        <CreditCard className="h-5 w-5 text-gray-700 mr-2" />
        <h3 className="text-lg font-semibold text-gray-900">
          Mode de Paiement
        </h3>
      </div>

      <p className="text-sm text-gray-600 mb-6">
        Configurez les options de paiement disponibles pour vos clients lors de la commande.
      </p>

      <div className="space-y-4">
        {/* Mode Libre */}
        <div
          onClick={() => onChange(true)}
          className={`relative border-2 rounded-lg p-4 cursor-pointer transition-all ${
            isFullPaymentActivated
              ? 'border-green-500 bg-green-50'
              : 'border-gray-200 hover:border-gray-300 bg-white'
          }`}
        >
          <div className="flex items-start">
            <input
              type="radio"
              checked={isFullPaymentActivated}
              onChange={() => onChange(true)}
              className="mt-1 h-4 w-4 text-green-600 focus:ring-green-500"
            />
            <div className="ml-3 flex-1">
              <div className="flex items-center">
                <ShoppingBag className="h-5 w-5 text-green-600 mr-2" />
                <label className="font-medium text-gray-900 cursor-pointer">
                  Mode Libre (Recommandé)
                </label>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                Le client peut choisir librement entre :
              </p>
              <ul className="text-sm text-gray-600 mt-2 ml-4 space-y-1">
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span><strong>Paiement complet :</strong> Payer le montant total immédiatement</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span><strong>Paiement à la livraison :</strong> Payer uniquement les frais maintenant, le reste à la réception</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Mode Restreint */}
        <div
          onClick={() => onChange(false)}
          className={`relative border-2 rounded-lg p-4 cursor-pointer transition-all ${
            !isFullPaymentActivated
              ? 'border-amber-500 bg-amber-50'
              : 'border-gray-200 hover:border-gray-300 bg-white'
          }`}
        >
          <div className="flex items-start">
            <input
              type="radio"
              checked={!isFullPaymentActivated}
              onChange={() => onChange(false)}
              className="mt-1 h-4 w-4 text-amber-600 focus:ring-amber-500"
            />
            <div className="ml-3 flex-1">
              <div className="flex items-center">
                <CreditCard className="h-5 w-5 text-amber-600 mr-2" />
                <label className="font-medium text-gray-900 cursor-pointer">
                  Mode Restreint
                </label>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                Seul le paiement des frais de livraison est disponible.
              </p>
              <ul className="text-sm text-gray-600 mt-2 ml-4 space-y-1">
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Le client paie uniquement : Frais de livraison + Frais de transaction</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Le reste du montant est payé à la livraison</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Informations supplémentaires */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start">
          <Info className="h-5 w-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-900">
            <p className="font-medium mb-1">💡 Conseil</p>
            <p>
              Le <strong>Mode Libre</strong> offre plus de flexibilité à vos clients et peut augmenter 
              vos ventes. Le <strong>Mode Restreint</strong> est utile si vous préférez recevoir 
              le paiement des produits en espèces lors de la livraison.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
