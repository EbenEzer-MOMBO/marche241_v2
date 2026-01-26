'use client';

import { ArrowRight, Smartphone } from 'lucide-react';

export const CTASection: React.FC = () => {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          <div className="bg-gradient-to-br from-gray-50 to-white rounded-3xl p-8 md:p-12 lg:p-16 shadow-xl border-2 border-gray-200">
            <div className="flex flex-col lg:flex-row items-center gap-8">
              {/* Icône */}
              <div className="flex-shrink-0">
                <div className="w-24 h-24 bg-green-100 rounded-2xl flex items-center justify-center shadow-lg">
                  <Smartphone className="h-12 w-12 text-green-600" />
                </div>
              </div>

              {/* Contenu */}
              <div className="flex-1 text-center lg:text-left">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                  Prêt à lancer votre boutique en ligne ?
                </h2>
                <p className="text-xl text-gray-600 mb-6">
                  Rejoignez des centaines de commerçants gabonais qui font confiance à Marché241. 
                  Créez votre boutique gratuitement en moins de 5 minutes.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <a
                    href="/admin/register"
                    className="inline-flex items-center justify-center px-8 py-4 bg-black text-white rounded-lg hover:bg-black/80 transition-all transform hover:scale-105 shadow-lg group"
                  >
                    Créer ma boutique maintenant
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </a>
                  
                  <a
                    href="/affiche_boutiques"
                    className="inline-flex items-center justify-center px-8 py-4 bg-white text-gray-900 rounded-lg hover:bg-gray-50 transition-all border-2 border-gray-300"
                  >
                    Rechercher une boutique
                  </a>
                </div>
              </div>
            </div>

            {/* Statistiques en bas */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12 pt-12 border-t border-gray-200">
              <div className="text-center">
                <p className="text-4xl font-bold text-gray-900 mb-2">10+</p>
                <p className="text-gray-600">Boutiques actives</p>
              </div>
              <div className="text-center">
                <p className="text-4xl font-bold text-gray-900 mb-2">50+</p>
                <p className="text-gray-600">Produits vendus</p>
              </div>
              <div className="text-center">
                <p className="text-4xl font-bold text-gray-900 mb-2">80%</p>
                <p className="text-gray-600">Satisfaction client</p>
              </div>
              <div className="text-center">
                <p className="text-4xl font-bold text-gray-900 mb-2">24/7</p>
                <p className="text-gray-600">Support disponible</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
