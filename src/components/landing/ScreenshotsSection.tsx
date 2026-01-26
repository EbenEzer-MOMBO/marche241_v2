'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const screenshots = [
  {
    title: "Tableau de bord",
    description: "Vue d'ensemble de votre activité",
    image: "/home1.png"
  },
  {
    title: "Gestion des produits",
    description: "Ajoutez et modifiez vos produits facilement",
    image: "/home2.png"
  },
  {
    title: "Commandes",
    description: "Suivez toutes vos commandes en temps réel",
    image: "/home3.jpg"
  },
  {
    title: "Statistiques",
    description: "Analysez vos performances",
    image: "/home1.png"
  },
  {
    title: "Vue boutique",
    description: "L'expérience de vos clients",
    image: "/home2.png"
  }
];

export const ScreenshotsSection: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? screenshots.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === screenshots.length - 1 ? 0 : prev + 1));
  };

  return (
    <section className="py-20 lg:py-28 bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      <div className="container mx-auto px-4">
        {/* En-tête */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            Captures d'écran de l'application
          </h2>
          <p className="text-lg text-gray-300">
            Découvrez l'interface intuitive de Marché241 et toutes ses fonctionnalités
          </p>
        </div>

        {/* Carrousel */}
        <div className="relative max-w-6xl mx-auto">
          {/* Navigation */}
          <button
            onClick={handlePrevious}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white text-gray-900 p-3 rounded-full shadow-lg hover:bg-gray-100 transition-all transform hover:scale-110"
            aria-label="Précédent"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>

          <button
            onClick={handleNext}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white text-gray-900 p-3 rounded-full shadow-lg hover:bg-gray-100 transition-all transform hover:scale-110"
            aria-label="Suivant"
          >
            <ChevronRight className="h-6 w-6" />
          </button>

          {/* Images */}
          <div className="flex items-center justify-center gap-4 px-16">
            {/* Image précédente (floue) */}
            <div className="hidden lg:block flex-1 opacity-50 blur-sm transform scale-90 transition-all">
              <Image
                src={screenshots[(currentIndex - 1 + screenshots.length) % screenshots.length].image}
                alt="Capture précédente"
                width={300}
                height={600}
                className="rounded-xl shadow-2xl"
              />
            </div>

            {/* Image centrale */}
            <div className="flex-1 max-w-md transition-all duration-500">
              <div className="relative">
                <Image
                  src={screenshots[currentIndex].image}
                  alt={screenshots[currentIndex].title}
                  width={400}
                  height={800}
                  className="rounded-xl shadow-2xl mx-auto"
                />
                
                {/* Info overlay */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 rounded-b-xl">
                  <h3 className="text-xl font-bold mb-1">
                    {screenshots[currentIndex].title}
                  </h3>
                  <p className="text-gray-300 text-sm">
                    {screenshots[currentIndex].description}
                  </p>
                </div>
              </div>
            </div>

            {/* Image suivante (floue) */}
            <div className="hidden lg:block flex-1 opacity-50 blur-sm transform scale-90 transition-all">
              <Image
                src={screenshots[(currentIndex + 1) % screenshots.length].image}
                alt="Capture suivante"
                width={300}
                height={600}
                className="rounded-xl shadow-2xl"
              />
            </div>
          </div>

          {/* Indicateurs */}
          <div className="flex justify-center gap-2 mt-8">
            {screenshots.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`h-2 rounded-full transition-all ${
                  index === currentIndex 
                    ? 'bg-white w-8' 
                    : 'bg-gray-600 w-2 hover:bg-gray-500'
                }`}
                aria-label={`Aller à l'image ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
