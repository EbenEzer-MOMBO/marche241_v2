import Link from 'next/link';
import Image from 'next/image';

export default function HeroSection() {
  return (
    <section className="relative pt-10 pb-10">
      {/* Stack avec fond vert */}
      <div className="relative">
        {/* Bloc vert */}
        <div className="bg-foreground h-70 sm:h-70 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-center">
            <div className="text-center text-white">
              {/* Titre principal */}
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
                Bienvenue sur{' '}
                <span className="text-accent">Marché241</span>
              </h1>
              
              {/* Sous-titre */}
              <p className="text-lg sm:text-xl text-white/90 max-w-2xl mx-auto leading-relaxed">
                Découvrez notre boutique en ligne minimaliste et moderne
              </p>
            </div>
          </div>
          
          {/* Logo rond centré sur la bordure inférieure */}
          <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2">
            <div className="w-28 h-28 bg-white rounded-full shadow-lg flex items-center justify-center border-4 border-accent">
              <Image
                src="/site-logo.png"
                alt="Marché241 Logo"
                width={100}
                height={100}
                className="rounded-full"
                priority
              />
            </div>
          </div>
        </div>

        {/* Section claire avec contenu */}
        <div className="bg-background pt-16 pb-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              {/* Description */}
              <p className="text-lg text-gray-dark max-w-3xl mx-auto mb-8 leading-relaxed">
                Une expérience d'achat simple, élégante et adaptée à tous vos appareils.
              </p>
              
              {/* Boutons d'action */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link
                  href="/produits"
                  className="bg-foreground text-white px-8 py-3 rounded-lg font-medium hover:bg-foreground/90 transition-colors duration-200 w-full sm:w-auto text-center"
                >
                  Découvrir nos produits
                </Link>
                <Link
                  href="/categories"
                  className="border-2 border-foreground text-foreground px-8 py-3 rounded-lg font-medium hover:bg-foreground hover:text-white transition-colors duration-200 w-full sm:w-auto text-center"
                >
                  Parcourir les catégories
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
