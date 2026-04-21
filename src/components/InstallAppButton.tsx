'use client';

import { useState, useEffect } from 'react';
import { Download, X, Share, Plus } from 'lucide-react';

export const InstallAppButton: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isInStandaloneMode, setIsInStandaloneMode] = useState(false);

  useEffect(() => {
    // Détecter si on est sur iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const iOS = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(iOS);

    // Vérifier si l'app est déjà installée (mode standalone)
    const standalone = window.matchMedia('(display-mode: standalone)').matches;
    setIsInStandaloneMode(standalone);
  }, []);

  // Ne pas afficher le bouton si l'app est déjà installée
  if (isInStandaloneMode) {
    return null;
  }

  return (
    <>
      {/* Bouton flottant */}
      <button
        onClick={() => setShowModal(true)}
        className="fixed bottom-6 right-6 z-50 group"
        aria-label="Installer l'application"
      >
        <div className="relative">
          {/* Badge pulsant */}
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
          
          {/* Bouton principal */}
          <div className="bg-gradient-to-r from-[#508e27] to-[#74adaf] text-white p-4 rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-110">
            <Download className="h-6 w-6" />
          </div>
        </div>
        
        {/* Tooltip */}
        <div className="absolute bottom-full right-0 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          <div className="bg-gray-900 text-white text-sm px-3 py-2 rounded-lg whitespace-nowrap">
            Installer l'app
            <div className="absolute top-full right-4 -mt-1 border-4 border-transparent border-t-gray-900"></div>
          </div>
        </div>
      </button>

      {/* Modal avec instructions */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between rounded-t-2xl">
              <div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-[#508e27] to-[#74adaf] bg-clip-text text-transparent">
                  Installer Marché241
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Accédez rapidement à l'application
                </p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="h-5 w-5 text-gray-600" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {isIOS ? (
                // Instructions pour iOS
                <>
                  <div className="bg-gradient-to-br from-gray-50 to-white p-4 rounded-xl border-2 border-gray-200">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-gradient-to-r from-[#508e27] to-[#74adaf] rounded-lg">
                        <Share className="h-5 w-5 text-white" />
                      </div>
                      <h3 className="font-semibold text-gray-900">
                        Instructions pour iOS
                      </h3>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">
                      Suivez ces étapes pour installer l'application sur votre iPhone ou iPad :
                    </p>
                  </div>

                  <div className="space-y-4">
                    {/* Étape 1 */}
                    <div className="flex gap-4">
                      <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-[#508e27] to-[#74adaf] text-white rounded-full flex items-center justify-center font-bold text-sm">
                        1
                      </div>
                      <div className="flex-1">
                        <p className="text-gray-900 font-medium mb-2">
                          Appuyez sur le bouton Partager
                        </p>
                        <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                          <Share className="h-5 w-5 text-blue-600" />
                          <span className="text-sm text-gray-700">
                            En bas de Safari (icône de partage)
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Étape 2 */}
                    <div className="flex gap-4">
                      <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-[#508e27] to-[#74adaf] text-white rounded-full flex items-center justify-center font-bold text-sm">
                        2
                      </div>
                      <div className="flex-1">
                        <p className="text-gray-900 font-medium mb-2">
                          Faites défiler et sélectionnez
                        </p>
                        <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg border border-green-200">
                          <Plus className="h-5 w-5 text-green-600" />
                          <span className="text-sm text-gray-700">
                            "Sur l'écran d'accueil"
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Étape 3 */}
                    <div className="flex gap-4">
                      <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-[#508e27] to-[#74adaf] text-white rounded-full flex items-center justify-center font-bold text-sm">
                        3
                      </div>
                      <div className="flex-1">
                        <p className="text-gray-900 font-medium mb-2">
                          Confirmez l'installation
                        </p>
                        <p className="text-sm text-gray-600">
                          Appuyez sur "Ajouter" en haut à droite
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Note importante */}
                  <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-4">
                    <p className="text-sm text-amber-900">
                      <span className="font-semibold">Important :</span> Cette fonctionnalité n'est disponible que sur Safari. Si vous utilisez un autre navigateur, ouvrez d'abord cette page dans Safari.
                    </p>
                  </div>
                </>
              ) : (
                // Instructions pour Android/autres
                <>
                  <div className="bg-gradient-to-br from-gray-50 to-white p-4 rounded-xl border-2 border-gray-200">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-gradient-to-r from-[#508e27] to-[#74adaf] rounded-lg">
                        <Download className="h-5 w-5 text-white" />
                      </div>
                      <h3 className="font-semibold text-gray-900">
                        Instructions pour Android
                      </h3>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">
                      Installez l'application sur votre appareil Android :
                    </p>
                  </div>

                  <div className="space-y-4">
                    {/* Étape 1 */}
                    <div className="flex gap-4">
                      <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-[#508e27] to-[#74adaf] text-white rounded-full flex items-center justify-center font-bold text-sm">
                        1
                      </div>
                      <div className="flex-1">
                        <p className="text-gray-900 font-medium mb-2">
                          Appuyez sur le menu (⋮)
                        </p>
                        <p className="text-sm text-gray-600">
                          En haut à droite de votre navigateur
                        </p>
                      </div>
                    </div>

                    {/* Étape 2 */}
                    <div className="flex gap-4">
                      <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-[#508e27] to-[#74adaf] text-white rounded-full flex items-center justify-center font-bold text-sm">
                        2
                      </div>
                      <div className="flex-1">
                        <p className="text-gray-900 font-medium mb-2">
                          Sélectionnez "Installer l'application"
                        </p>
                        <p className="text-sm text-gray-600">
                          Ou "Ajouter à l'écran d'accueil"
                        </p>
                      </div>
                    </div>

                    {/* Étape 3 */}
                    <div className="flex gap-4">
                      <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-[#508e27] to-[#74adaf] text-white rounded-full flex items-center justify-center font-bold text-sm">
                        3
                      </div>
                      <div className="flex-1">
                        <p className="text-gray-900 font-medium mb-2">
                          Confirmez l'installation
                        </p>
                        <p className="text-sm text-gray-600">
                          L'icône apparaîtra sur votre écran d'accueil
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Avantages */}
              <div className="bg-gradient-to-r from-[#508e27]/5 to-[#74adaf]/5 rounded-xl p-4 border border-[#74adaf]/20">
                <h4 className="font-semibold text-gray-900 mb-3">
                  Avantages de l'application :
                </h4>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-[#508e27] mt-0.5">✓</span>
                    <span>Accès rapide depuis votre écran d'accueil</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#508e27] mt-0.5">✓</span>
                    <span>Expérience optimisée et plus rapide</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#508e27] mt-0.5">✓</span>
                    <span>Notifications pour vos commandes</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 rounded-b-2xl">
              <button
                onClick={() => setShowModal(false)}
                className="w-full py-3 bg-gradient-to-r from-[#508e27] to-[#74adaf] text-white rounded-lg hover:opacity-90 transition-all font-semibold"
              >
                Compris !
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
