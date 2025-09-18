'use client';

import { useState, useEffect } from 'react';

interface PaymentCountdownProps {
  duration: number; // Durée en secondes
  onComplete: () => void;
  onCancel?: () => void;
  paymentMethod: string;
  phoneNumber: string;
}

export default function PaymentCountdown({ 
  duration, 
  onComplete, 
  onCancel,
  paymentMethod,
  phoneNumber
}: PaymentCountdownProps) {
  const [timeLeft, setTimeLeft] = useState(duration);
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        const newTime = prev - 1;
        if (newTime <= 0) {
          clearInterval(interval);
          onComplete();
          return 0;
        }
        return newTime;
      });

      setProgress(prev => {
        const newProgress = ((timeLeft - 1) / duration) * 100;
        return Math.max(0, newProgress);
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [duration, onComplete, timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getPaymentIcon = () => {
    if (paymentMethod === 'moov') {
      return '📱'; // Icône Moov Money
    } else if (paymentMethod === 'airtel') {
      return '💳'; // Icône Airtel Money
    }
    return '💰';
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-green-500/20 via-emerald-500/20 to-teal-500/20 backdrop-blur-md flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 shadow-2xl">
        <div className="text-center">
          {/* Icône du mode de paiement */}
          <div className="mx-auto mb-6 w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-4xl">
            {getPaymentIcon()}
          </div>

          {/* Titre */}
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Confirmation du paiement
          </h3>

          {/* Instructions */}
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800 font-medium mb-2">
              ⚠️ Ne fermez pas cet écran
            </p>
            <p className="text-sm text-gray-700">
              Vérifiez votre téléphone <strong>{phoneNumber}</strong> et suivez les instructions {paymentMethod.toUpperCase()} pour confirmer le paiement.
            </p>
          </div>

          {/* Décompte visuel */}
          <div className="mb-6">
            <div className="relative w-32 h-32 mx-auto mb-4">
              {/* Cercle de fond */}
              <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
                <circle
                  cx="60"
                  cy="60"
                  r="54"
                  stroke="#e5e7eb"
                  strokeWidth="8"
                  fill="none"
                />
                <circle
                  cx="60"
                  cy="60"
                  r="54"
                  stroke="#10b981"
                  strokeWidth="8"
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray={339.292}
                  strokeDashoffset={339.292 * (1 - progress / 100)}
                  className="transition-all duration-1000 ease-linear"
                />
              </svg>
              
              {/* Temps restant au centre */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">
                    {formatTime(timeLeft)}
                  </div>
                  <div className="text-xs text-gray-500">
                    restantes
                  </div>
                </div>
              </div>
            </div>

            {/* Barre de progression linéaire */}
            <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
              <div 
                className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full transition-all duration-1000 ease-linear"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            
            <p className="text-sm text-gray-600">
              Vérification automatique en cours...
            </p>
          </div>

          {/* Messages d'état */}
          <div className="space-y-2 mb-6">
            <div className="flex items-center justify-center text-sm text-gray-600">
              <div className="animate-pulse w-2 h-2 bg-green-500 rounded-full mr-2"></div>
              En attente de confirmation
            </div>
          </div>

          {/* Bouton d'annulation (optionnel) */}
          {onCancel && (
            <button
              onClick={onCancel}
              className="w-full px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Annuler le paiement
            </button>
          )}

          {/* Note importante */}
          <p className="text-xs text-gray-500 mt-4">
            Le paiement sera automatiquement vérifié. Gardez cet écran ouvert jusqu'à confirmation.
          </p>
        </div>
      </div>
    </div>
  );
}
