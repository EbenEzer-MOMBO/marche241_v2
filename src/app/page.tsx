'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function LandingPage() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <Image
                src="\marche241_Web_without_text-01-01.svg"
                alt="Marché241"
                width={60}
                height={60}
                className="rounded-lg"
              />
              <span className="text-2xl font-bold text-black-600">Marché241</span>
            </div>
            <nav className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-600 hover:text-emerald-600 transition-colors">
                Fonctionnalités
              </a>
              <a href="#how-it-works" className="text-gray-600 hover:text-emerald-600 transition-colors">
                Comment ça marche
              </a>
              <Link
                href="/admin/login"
                className="text-gray-600 hover:text-emerald-600 transition-colors"
              >
                Connexion
              </Link>
              <Link
                href="/admin/register"
                className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
              >
                Créer une boutique
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className={`text-center transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6">
              Votre boutique en ligne
              <span className="block text-emerald-600 mt-2">Simple et Efficace</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto">
              Créez, gérez et développez votre commerce en ligne avec Marché241. 
              Une plateforme minimaliste conçue pour les commerçants gabonais.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/admin/register"
                className="w-full sm:w-auto px-8 py-4 bg-emerald-600 text-white text-lg font-semibold rounded-lg hover:bg-emerald-700 transform hover:scale-105 transition-all shadow-lg"
              >
                Commencer gratuitement
              </Link>
              <Link
                href="/marche_241"
                className="w-full sm:w-auto px-8 py-4 bg-white text-emerald-600 text-lg font-semibold rounded-lg hover:bg-gray-50 border-2 border-emerald-600 transform hover:scale-105 transition-all"
              >
                Découvrir les boutiques
              </Link>
            </div>
          </div>

          {/* Hero Image / Illustration */}
          <div className={`mt-20 transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-white p-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="relative h-64 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-xl flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-6xl mb-4">🏪</div>
                    <p className="text-emerald-800 font-semibold">Créez votre boutique</p>
                  </div>
                </div>
                <div className="relative h-64 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-6xl mb-4">📦</div>
                    <p className="text-blue-800 font-semibold">Gérez vos produits</p>
                  </div>
                </div>
                <div className="relative h-64 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-6xl mb-4">💰</div>
                    <p className="text-purple-800 font-semibold">Recevez vos paiements</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Tout ce dont vous avez besoin
            </h2>
            <p className="text-xl text-gray-600">
              Une solution complète pour votre commerce en ligne
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: '⚡',
                title: 'Rapide et Simple',
                description: 'Interface intuitive pour créer votre boutique en quelques minutes'
              },
              {
                icon: '🛒',
                title: 'Gestion des Commandes',
                description: 'Suivez et gérez vos commandes en temps réel avec facilité'
              },
              {
                icon: '💳',
                title: 'Paiements Mobile Money',
                description: 'Airtel Money et Moov Money intégrés pour vos clients'
              },
              {
                icon: '📱',
                title: 'Responsive Design',
                description: 'Votre boutique s\'adapte à tous les écrans et appareils'
              },
              {
                icon: '📊',
                title: 'Tableau de Bord',
                description: 'Visualisez vos ventes et statistiques en un coup d\'œil'
              },
              {
                icon: '🎨',
                title: 'Personnalisable',
                description: 'Personnalisez l\'apparence de votre boutique à votre image'
              }
            ].map((feature, index) => (
              <div
                key={index}
                className="p-8 bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-2"
              >
                <div className="text-5xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-gradient-to-br from-emerald-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Comment ça marche ?
            </h2>
            <p className="text-xl text-gray-600">
              Démarrez votre commerce en ligne en 3 étapes simples
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: '1',
                title: 'Créez votre compte',
                description: 'Inscrivez-vous gratuitement et créez votre boutique en quelques clics'
              },
              {
                step: '2',
                title: 'Ajoutez vos produits',
                description: 'Téléchargez vos produits avec photos, descriptions et prix'
              },
              {
                step: '3',
                title: 'Commencez à vendre',
                description: 'Partagez le lien de votre boutique et recevez vos premières commandes'
              }
            ].map((item, index) => (
              <div key={index} className="relative">
                <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300">
                  <div className="absolute -top-6 left-8 w-12 h-12 bg-emerald-600 text-white rounded-full flex items-center justify-center text-2xl font-bold">
                    {item.step}
                  </div>
                  <div className="pt-8">
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">{item.title}</h3>
                    <p className="text-gray-600 text-lg">{item.description}</p>
                  </div>
                </div>
                {index < 2 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2 text-emerald-600 text-4xl">
                    →
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-emerald-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Prêt à lancer votre boutique ?
          </h2>
          <p className="text-xl text-emerald-100 mb-8">
            Rejoignez les commerçants qui font confiance à Marché241
          </p>
          <Link
            href="/admin/register"
            className="inline-block px-8 py-4 bg-white text-emerald-600 text-lg font-semibold rounded-lg hover:bg-gray-100 transform hover:scale-105 transition-all shadow-xl"
          >
            Créer ma boutique gratuitement
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <Image
                  src="/site-logo.png"
                  alt="Marché241"
                  width={32}
                  height={32}
                  className="rounded-lg"
                />
                <span className="text-xl font-bold text-white">Marché241</span>
              </div>
              <p className="text-gray-400">
                La plateforme de commerce en ligne conçue pour les commerçants gabonais.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Liens rapides</h4>
              <ul className="space-y-2">
                <li>
                  <Link href="/marche_241" className="hover:text-emerald-400 transition-colors">
                    Boutiques
                  </Link>
                </li>
                <li>
                  <Link href="/admin/register" className="hover:text-emerald-400 transition-colors">
                    Créer une boutique
                  </Link>
                </li>
                <li>
                  <Link href="/admin/login" className="hover:text-emerald-400 transition-colors">
                    Connexion
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Support</h4>
              <ul className="space-y-2">
                <li>
                  <a href="#features" className="hover:text-emerald-400 transition-colors">
                    Fonctionnalités
                  </a>
                </li>
                <li>
                  <a href="#how-it-works" className="hover:text-emerald-400 transition-colors">
                    Comment ça marche
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center">
            <p>&copy; {new Date().getFullYear()} Marché241. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

