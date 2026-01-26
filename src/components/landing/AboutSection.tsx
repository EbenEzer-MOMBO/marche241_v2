'use client';

import { Check, Zap, HeadphonesIcon } from 'lucide-react';
import Image from 'next/image';

export const AboutSection: React.FC = () => {
  return (
    <section id="about" className="py-20 lg:py-28 bg-gray-50">
      <div className="container mx-auto px-4">
        {/* Première partie - Image à gauche */}
        <div className="flex flex-col lg:flex-row items-center gap-12 mb-32">
          <div className="flex-1">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-blue-500 rounded-2xl blur-2xl opacity-20"></div>
              <Image
                src="/home2.png"
                alt="Interface Marché241"
                width={500}
                height={400}
                className="relative rounded-2xl shadow-2xl"
              />
            </div>
          </div>

          <div className="flex-1 space-y-6">
            <h3 className="text-3xl md:text-4xl font-bold text-gray-900">
              Une plateforme pensée pour les commerçants gabonais
            </h3>
            <p className="text-lg text-gray-600">
              Nous avons créé Marché241 pour répondre aux besoins spécifiques du marché gabonais. 
              Paiements mobiles locaux, livraison adaptée et interface en français.
            </p>

            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Check className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h4 className="text-xl font-semibold text-gray-900 mb-2">
                    Design moderne et responsive
                  </h4>
                  <p className="text-gray-600">
                    Votre boutique s'adapte parfaitement aux smartphones, tablettes et ordinateurs. 
                    Une expérience optimale pour vos clients.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <HeadphonesIcon className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h4 className="text-xl font-semibold text-gray-900 mb-2">
                    Support 24/7
                  </h4>
                  <p className="text-gray-600">
                    Notre équipe est disponible pour vous accompagner à tout moment. 
                    WhatsApp, email ou téléphone - nous sommes là pour vous.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Deuxième partie - Image à droite */}
        <div className="flex flex-col lg:flex-row-reverse items-center gap-12">
          <div className="flex-1">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-500 rounded-2xl blur-2xl opacity-20"></div>
              <Image
                src="/home3.jpg"
                alt="Dashboard Analytics"
                width={500}
                height={400}
                className="relative rounded-2xl shadow-2xl"
              />
            </div>
          </div>

          <div className="flex-1 space-y-6">
            <h3 className="text-3xl md:text-4xl font-bold text-gray-900">
              Optimisez vos ventes facilement
            </h3>
            <p className="text-lg text-gray-600">
              Suivez vos performances en temps réel avec des tableaux de bord intuitifs. 
              Prenez les bonnes décisions pour développer votre activité.
            </p>

            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Zap className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <h4 className="text-xl font-semibold text-gray-900 mb-2">
                    Performance optimale
                  </h4>
                  <p className="text-gray-600">
                    Pages ultra-rapides, images optimisées et expérience fluide. 
                    Vos clients apprécieront la vitesse de navigation.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Check className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <h4 className="text-xl font-semibold text-gray-900 mb-2">
                    Mises à jour régulières
                  </h4>
                  <p className="text-gray-600">
                    Nouvelles fonctionnalités ajoutées régulièrement. 
                    Profitez toujours des dernières innovations.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
