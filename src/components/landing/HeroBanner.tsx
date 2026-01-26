'use client';

import { useState, useEffect } from 'react';
import { ArrowRight, Download } from 'lucide-react';
import Image from 'next/image';

interface HeroBannerProps {
  title?: string;
  subtitle?: string;
  description?: string;
  ctaText?: string;
  ctaLink?: string;
  imageSrc?: string;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  title = "Créez votre boutique en ligne",
  subtitle = "au Gabon en quelques minutes",
  description = "Marché241 est la plateforme qui permet aux commerçants gabonais de vendre leurs produits en ligne facilement. Gestion des commandes, paiements mobiles, livraison - tout est inclus.",
  ctaText = "Créer ma boutique gratuitement",
  ctaLink = "/admin/register",
  imageSrc = "/home1.png"
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <section className="relative bg-gradient-to-br from-gray-50 to-gray-100 py-20 lg:py-10 overflow-hidden">
      {/* Motif de fond décoratif */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-96 h-96 bg-green-500 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          {/* Contenu texte */}
          <div className={`flex-1 space-y-6 text-center lg:text-left transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
              {title}
              <br />
              <span className="text-green-600">{subtitle}</span>
            </h1>
            
            <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto lg:mx-0">
              {description}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <a
                href={ctaLink}
                className="inline-flex items-center justify-center px-8 py-4 bg-black text-white rounded-lg hover:bg-gray-800 transition-all transform hover:scale-105 shadow-lg group"
              >
                {ctaText}
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </a>
              
              <a
                href="/affiche_boutiques"
                className="inline-flex items-center justify-center px-8 py-4 bg-white text-gray-900 rounded-lg hover:bg-gray-50 transition-all border-2 border-gray-200"
              >
                Rechercher une boutique
              </a>
            </div>

            {/* Statistiques rapides */}
            <div className="grid grid-cols-3 gap-6 pt-8 border-t border-gray-200 max-w-md mx-auto lg:mx-0">
              <div>
                <p className="text-3xl font-bold text-gray-900">10+</p>
                <p className="text-sm text-gray-600">Boutiques</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-900">50+</p>
                <p className="text-sm text-gray-600">Produits</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-900">24/7</p>
                <p className="text-sm text-gray-600">Support</p>
              </div>
            </div>
          </div>

          {/* Image/Illustration */}
          <div className={`flex-1 transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'}`}>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-blue-500 rounded-2xl blur-2xl opacity-20 animate-pulse"></div>
              <div className="relative bg-white p-4 rounded-2xl shadow-2xl">
                <Image
                  src={imageSrc}
                  alt="Marché241 Dashboard"
                  width={600}
                  height={400}
                  className="rounded-lg w-full h-auto"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
