'use client';

import Image from 'next/image';

export default function PromotionalPosterDark() {
  return (
    <div className="relative w-[1080px] h-[1920px] bg-gray-900 overflow-hidden">
      {/* Background avec effets superposés */}
      <div className="absolute inset-0">
        {/* Gradient de base sombre */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-emerald-950 to-blue-950" />
        
        {/* Effets de superposition - Cercles lumineux */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-emerald-500 rounded-full opacity-10 blur-3xl transform translate-x-1/3 -translate-y-1/3" />
        <div className="absolute bottom-0 left-0 w-[700px] h-[700px] bg-blue-600 rounded-full opacity-10 blur-3xl transform -translate-x-1/3 translate-y-1/3" />
        <div className="absolute top-1/2 left-1/2 w-[600px] h-[600px] bg-purple-500 rounded-full opacity-8 blur-3xl transform -translate-x-1/2 -translate-y-1/2" />
        
        {/* Lignes lumineuses */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-500 to-transparent opacity-30" />
        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-30" />
        
        {/* Images de produits en arrière-plan avec overlay */}
        <div className="absolute top-[200px] left-[50px] w-[300px] h-[300px] opacity-5 rotate-12">
          <Image
            src="/home1.png"
            alt=""
            fill
            className="object-cover rounded-3xl"
          />
        </div>
        <div className="absolute top-[600px] right-[50px] w-[350px] h-[350px] opacity-5 -rotate-12">
          <Image
            src="/home2.png"
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
          <div className="bg-gradient-to-r from-emerald-600 to-blue-600 rounded-3xl p-1 shadow-2xl">
            <div className="bg-gray-900 rounded-3xl p-6">
              <div className="flex items-center space-x-4">
                <Image
                  src="/marche241_Web_without_text-01-01.svg"
                  alt="Marché241"
                  width={80}
                  height={80}
                  className="rounded-xl"
                />
                <span className="text-5xl font-bold text-emerald-400" style={{
                  background: 'linear-gradient(to right, #34d399, #60a5fa)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}>
                  Marché241
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Titre principal */}
        <div className="text-center mb-12">
          <h1 className="text-7xl font-black text-white mb-6 leading-tight drop-shadow-2xl">
            Lancez Votre
            <span className="block text-8xl text-emerald-400 drop-shadow-lg" style={{
              background: 'linear-gradient(to right, #34d399, #60a5fa, #a78bfa)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              E-Commerce
            </span>
          </h1>
          <p className="text-4xl text-emerald-400 font-semibold drop-shadow-lg">
            🚀 Gratuit • Sans Frais • 100% Digital
          </p>
        </div>

        {/* Blocs d'information avec cadres et icônes - Style néon */}
        <div className="space-y-6 mb-12">
          {/* Bloc 1 */}
          <div className="bg-gradient-to-r from-emerald-600/20 to-emerald-500/20 backdrop-blur-sm rounded-3xl p-1 shadow-2xl">
            <div className="bg-gray-900/80 rounded-3xl p-8">
              <div className="flex items-center space-x-6">
                <div className="flex-shrink-0 w-24 h-24 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-2xl flex items-center justify-center shadow-xl shadow-emerald-500/50">
                  <span className="text-6xl">⚡</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-3xl font-bold text-white mb-2">
                    Setup Ultra-Rapide
                  </h3>
                  <p className="text-2xl text-gray-300">
                    Boutique prête en 5 minutes chrono
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Bloc 2 */}
          <div className="bg-gradient-to-r from-blue-600/20 to-blue-500/20 backdrop-blur-sm rounded-3xl p-1 shadow-2xl">
            <div className="bg-gray-900/80 rounded-3xl p-8">
              <div className="flex items-center space-x-6">
                <div className="flex-shrink-0 w-24 h-24 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center shadow-xl shadow-blue-500/50">
                  <span className="text-6xl">💰</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-3xl font-bold text-white mb-2">
                    Encaissez Facilement
                  </h3>
                  <div className="flex items-center space-x-4 mb-2">
                    <div className="bg-white rounded-lg p-2">
                      <Image src="/airtel_money.png" alt="Airtel Money" width={70} height={35} className="object-contain" />
                    </div>
                    <div className="bg-white rounded-lg p-2">
                      <Image src="/moov_money.png" alt="Moov Money" width={70} height={35} className="object-contain" />
                    </div>
                  </div>
                  <p className="text-2xl text-gray-300">
                    Paiements Mobile Money intégrés
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Bloc 3 */}
          <div className="bg-gradient-to-r from-purple-600/20 to-purple-500/20 backdrop-blur-sm rounded-3xl p-1 shadow-2xl">
            <div className="bg-gray-900/80 rounded-3xl p-8">
              <div className="flex items-center space-x-6">
                <div className="flex-shrink-0 w-24 h-24 bg-gradient-to-br from-purple-400 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl shadow-purple-500/50">
                  <span className="text-6xl">📊</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-3xl font-bold text-white mb-2">
                    Dashboard Pro
                  </h3>
                  <p className="text-2xl text-gray-300">
                    Statistiques et gestion en temps réel
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats impressionnantes */}
        <div className="bg-gradient-to-r from-yellow-600/20 to-orange-600/20 backdrop-blur-sm rounded-3xl p-1 shadow-2xl">
          <div className="bg-gray-900/80 rounded-3xl p-8">
            <div className="grid grid-cols-3 gap-6 text-center">
              <div>
                <div className="text-5xl font-black mb-2 text-yellow-400" style={{
                  background: 'linear-gradient(to right, #fbbf24, #fb923c)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}>
                  0 FCFA
                </div>
                <div className="text-xl text-gray-300 font-semibold">Frais de setup</div>
              </div>
              <div>
                <div className="text-5xl font-black mb-2 text-emerald-400" style={{
                  background: 'linear-gradient(to right, #34d399, #60a5fa)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}>
                  5min
                </div>
                <div className="text-xl text-gray-300 font-semibold">Pour démarrer</div>
              </div>
              <div>
                <div className="text-5xl font-black mb-2 text-blue-400" style={{
                  background: 'linear-gradient(to right, #60a5fa, #a78bfa)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}>
                  24/7
                </div>
                <div className="text-xl text-gray-300 font-semibold">Boutique ouverte</div>
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="mt-auto">
          <div className="bg-gradient-to-r from-emerald-600 via-blue-600 to-purple-600 rounded-3xl p-1 shadow-2xl ">
            <div className="bg-gray-900 rounded-3xl p-10 text-center">
              <h2 className="text-5xl font-black text-white mb-4">
                🎯 Rejoignez-Nous !
              </h2>
              <p className="text-3xl font-bold mb-6 text-emerald-400" style={{
                background: 'linear-gradient(to right, #34d399, #60a5fa)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>
                Créez votre boutique maintenant
              </p>
              <div className="inline-block bg-gradient-to-r from-emerald-500 to-blue-600 rounded-2xl p-1 shadow-xl">
                <div className="bg-white rounded-xl px-12 py-6">
                  <p className="text-4xl font-black text-gray-900">
                    marche241.com
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Badge "Gratuit" en coin */}
      <div className="absolute top-8 right-8">
        <div className="bg-gradient-to-r from-yellow-500 to-orange-600 text-white px-8 py-4 rounded-full shadow-2xl transform rotate-12 shadow-yellow-500/50">
          <span className="text-3xl font-black">✨ 100% GRATUIT</span>
        </div>
      </div>
    </div>
  );
}

