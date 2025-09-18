'use client';

import { useState, useEffect } from 'react';

interface PaymentProgressBarProps {
  duration: number; // Durée en secondes
  onComplete: () => void;
  title: string;
  description: string;
}

export default function PaymentProgressBar({ 
  duration, 
  onComplete, 
  title, 
  description 
}: PaymentProgressBarProps) {
  const [progress, setProgress] = useState(0);
  const [timeLeft, setTimeLeft] = useState(duration);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + (100 / duration);
        if (newProgress >= 100) {
          clearInterval(interval);
          onComplete();
          return 100;
        }
        return newProgress;
      });

      setTimeLeft(prev => {
        const newTime = prev - 1;
        if (newTime <= 0) {
          return 0;
        }
        return newTime;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [duration, onComplete]);

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-pink-500/20 backdrop-blur-md flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 shadow-2xl">
        <div className="text-center">
          {/* Icône de chargement */}
          <div className="mx-auto mb-6 w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>

          {/* Titre */}
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {title}
          </h3>

          {/* Description */}
          <p className="text-gray-600 mb-6">
            {description}
          </p>

          {/* Barre de progression */}
          <div className="mb-4">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Progression</span>
              <span>{timeLeft}s restantes</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>

          {/* Pourcentage */}
          <div className="text-2xl font-bold text-blue-600 mb-2">
            {Math.round(progress)}%
          </div>

          {/* Message d'attente */}
          <p className="text-sm text-gray-500">
            Veuillez patienter pendant l'initialisation...
          </p>
        </div>
      </div>
    </div>
  );
}
