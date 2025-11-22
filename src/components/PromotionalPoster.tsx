'use client';

import Image from 'next/image';

export default function PromotionalPoster() {
  return (
    <div className="relative w-[1080px] h-[1920px] bg-white overflow-hidden">
      {/* Background avec effets superposés */}
      <div className="absolute inset-0">
        {/* Gradient de base */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 via-emerald-600 to-blue-600" />
        
        {/* Effets de superposition - Cercles */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-emerald-400 rounded-full opacity-20 blur-3xl transform translate-x-1/3 -translate-y-1/3" />
        <div className="absolute bottom-0 left-0 w-[700px] h-[700px] bg-blue-500 rounded-full opacity-20 blur-3xl transform -translate-x-1/3 translate-y-1/3" />
        <div className="absolute top-1/2 left-1/2 w-[600px] h-[600px] bg-emerald-300 rounded-full opacity-15 blur-3xl transform -translate-x-1/2 -translate-y-1/2" />
        
        {/* Pattern de grille subtil */}
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: 'linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)',
          backgroundSize: '50px 50px'
        }} />
        
        {/* Images de produits en arrière-plan avec overlay */}
        <div className="absolute top-[200px] left-[50px] w-[300px] h-[300px] opacity-10 rotate-12">
          <Image
            src="/home1.png"
            alt=""
            fill
            className="object-cover rounded-3xl"
          />
        </div>
        <div className="absolute top-[600px] right-[50px] w-[350px] h-[350px] opacity-10 -rotate-12">
          <Image
            src="/home2.png"
            alt=""
            fill
            className="object-cover rounded-3xl"
          />
        </div>
        <div className="absolute bottom-[300px] left-[80px] w-[320px] h-[320px] opacity-10 rotate-6">
          <Image
            src="/home3.jpg"
            alt=""
            fill
            className="object-cover rounded-3xl"
          />
        </div>
      </div>

      {/* Contenu principal */}
      <div className="relative z-10 h-full flex flex-col p-16">
        {/* Header avec logo */}
        <div className="flex items-center justify-center mb-12">
          <div className="bg-white rounded-3xl p-6 shadow-2xl">
            <div className="flex items-center space-x-4">
              <Image
                src="/marche241_Web_without_text-01-01.svg"
                alt="Marché241"
                width={80}
                height={80}
                className="rounded-xl"
              />
              <span className="text-5xl font-bold text-emerald-600">Marché241</span>
            </div>
          </div>
        </div>

        {/* Titre principal */}
        <div className="text-center mb-12">
          <h1 className="text-7xl font-black text-white mb-6 leading-tight drop-shadow-2xl">
            Votre Boutique
            <span className="block text-8xl text-yellow-400 drop-shadow-lg" style={{
              background: 'linear-gradient(to right, #fcd34d, #fb923c)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              En Ligne
            </span>
          </h1>
          <p className="text-4xl text-white font-semibold drop-shadow-lg">
            Simple • Rapide • Efficace
          </p>
        </div>

        {/* Blocs d'information avec cadres et icônes */}
        <div className="space-y-6 mb-12">
          {/* Bloc 1 - Création rapide */}
          <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-8 shadow-2xl transform hover:scale-105 transition-transform">
            <div className="flex items-center space-x-6">
              <div className="flex-shrink-0 w-24 h-24 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-2xl flex items-center justify-center shadow-xl">
                <span className="text-6xl">⚡</span>
              </div>
              <div className="flex-1">
                <h3 className="text-3xl font-bold text-gray-900 mb-2">
                  Créez en 5 minutes
                </h3>
                <p className="text-2xl text-gray-600">
                  Interface intuitive, aucune compétence technique requise
                </p>
              </div>
            </div>
          </div>

          {/* Bloc 2 - Paiements Mobile Money */}
          <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-8 shadow-2xl transform hover:scale-105 transition-transform">
            <div className="flex items-center space-x-6">
              <div className="flex-shrink-0 w-24 h-24 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center shadow-xl">
                <span className="text-6xl">💳</span>
              </div>
              <div className="flex-1">
                <h3 className="text-3xl font-bold text-gray-900 mb-2">
                  Paiements intégrés
                </h3>
                <div className="flex items-center space-x-4 mb-2">
                  <Image src="/airtel_money.png" alt="Airtel Money" width={80} height={40} className="object-contain" />
                  <Image src="/moov_money.png" alt="Moov Money" width={80} height={40} className="object-contain" />
                </div>
                <p className="text-2xl text-gray-600">
                  Recevez vos paiements directement
                </p>
              </div>
            </div>
          </div>

          {/* Bloc 3 - Gestion complète */}
          <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-8 shadow-2xl transform hover:scale-105 transition-transform">
            <div className="flex items-center space-x-6">
              <div className="flex-shrink-0 w-24 h-24 bg-gradient-to-br from-purple-400 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl">
                <span className="text-6xl">📊</span>
              </div>
              <div className="flex-1">
                <h3 className="text-3xl font-bold text-gray-900 mb-2">
                  Gérez tout simplement
                </h3>
                <p className="text-2xl text-gray-600">
                  Produits, commandes, statistiques en un seul endroit
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Avantages supplémentaires */}
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-2xl mb-12">
          <div className="grid grid-cols-2 gap-6">
            <div className="flex items-center space-x-3">
              <span className="text-4xl">✅</span>
              <span className="text-2xl font-semibold text-gray-800">100% Gratuit</span>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-4xl">📱</span>
              <span className="text-2xl font-semibold text-gray-800">Responsive</span>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-4xl">🛒</span>
              <span className="text-2xl font-semibold text-gray-800">Gestion facile</span>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-4xl">🇬🇦</span>
              <span className="text-2xl font-semibold text-gray-800">Made in Gabon</span>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="mt-auto">
          <div className="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 rounded-3xl p-2 shadow-2xl">
            <div className="bg-white rounded-2xl p-10 text-center">
              <h2 className="text-5xl font-black text-gray-900 mb-4">
                Commencez Aujourd'hui !
              </h2>
              <p className="text-3xl font-bold mb-6" style={{
                background: 'linear-gradient(to right, #059669, #2563eb)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                color: '#059669'
              }}>
                Créez votre boutique gratuitement
              </p>
              <div className="inline-block bg-gradient-to-r from-emerald-500 to-blue-600 rounded-2xl p-1 shadow-xl">
                <div className="bg-white rounded-xl px-12 py-6">
                  <p className="text-4xl font-black text-gray-900">
                    www.marche241.com
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Badge "Nouveau" en coin */}
      <div className="absolute top-8 right-8 bg-gradient-to-r from-red-500 to-pink-600 text-white px-8 py-4 rounded-full shadow-2xl transform rotate-12">
        <span className="text-3xl font-black">🎉 NOUVEAU</span>
      </div>
    </div>
  );
}

