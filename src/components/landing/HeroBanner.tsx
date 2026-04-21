'use client';

import { useState, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';
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
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Image de fond */}
      <div className="absolute inset-0 z-0">
        <Image
          src={imageSrc}
          alt="Marché241"
          fill
          className="object-cover"
          priority
        />
      </div>

      {/* Overlay sombre */}
      <div className="absolute inset-0 bg-black/60 z-10"></div>

      {/* Motif de fond décoratif */}
      <div className="absolute inset-0 z-20 opacity-10">
        <div className="absolute top-0 left-0 w-96 h-96 bg-[#508e27] rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#74adaf] rounded-full blur-3xl"></div>
      </div>

      {/* Contenu */}
      <div className="container mx-auto px-4 relative z-30 py-20">
        <div className={`max-w-4xl mx-auto text-center space-y-8 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <h1 className="text-3xl md:text-4xl lg:text-6xl font-bold text-white leading-tight">
            {title}
            <br />
            <span className="bg-gradient-to-r from-[#508e27] to-[#74adaf] bg-clip-text text-transparent">{subtitle}</span>
          </h1>
          
          <p className="text-lg md:text-xl lg:text-2xl text-gray-200 max-w-3xl mx-auto">
            {description}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            <a
              href={ctaLink}
              className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-[#508e27] to-[#74adaf] text-white rounded-lg hover:opacity-90 transition-all transform hover:scale-105 shadow-lg group text-lg font-semibold"
            >
              {ctaText}
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </a>
            
            <a
              href="/affiche_boutiques"
              className="inline-flex items-center justify-center px-8 py-4 bg-white/10 backdrop-blur-sm text-white rounded-lg hover:bg-white/20 transition-all border-2 border-white/30 text-lg font-semibold"
            >
              Rechercher une boutique
            </a>
          </div>

          {/* Statistiques rapides */}
          <div className="grid grid-cols-3 gap-8 pt-12 max-w-2xl mx-auto">
            <div className="backdrop-blur-sm bg-white/10 p-6 rounded-xl border border-white/20">
              <p className="text-2xl font-bold text-white">50+</p>
              <p className="text-sm text-gray-200 mt-2">Boutiques</p>
            </div>
            <div className="backdrop-blur-sm bg-white/10 p-6 rounded-xl border border-white/20">
              <p className="text-2xl font-bold text-white">200+</p>
              <p className="text-sm text-gray-200 mt-2">Produits</p>
            </div>
            <div className="backdrop-blur-sm bg-white/10 p-6 rounded-xl border border-white/20">
              <p className="text-2xl font-bold text-white">24/7</p>
              <p className="text-sm text-gray-200 mt-2">Support</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
