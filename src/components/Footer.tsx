import Link from 'next/link';
import Image from 'next/image';

export default function Footer() {
  return (
    <footer className="bg-primary text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo et description */}
          <div className="md:col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <Image
                src="/site-logo.png"
                alt="Marché241 Logo"
                width={32}
                height={32}
                className="rounded-lg bg-white/10 p-1"
              />
              <span className="text-xl font-bold">Marché241</span>
            </div>
            <p className="text-white/80 text-sm leading-relaxed">
              Votre boutique en ligne minimaliste et moderne. 
              Une expérience d'achat simple et élégante.
            </p>
            
            {/* Réseaux sociaux */}
            <div className="flex space-x-4 mt-6">
              <a href="#" className="text-white/60 hover:text-white transition-colors duration-200">
                <span className="text-xl">📘</span>
              </a>
              <a href="#" className="text-white/60 hover:text-white transition-colors duration-200">
                <span className="text-xl">📷</span>
              </a>
              <a href="#" className="text-white/60 hover:text-white transition-colors duration-200">
                <span className="text-xl">🐦</span>
              </a>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Navigation</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-white/80 hover:text-white transition-colors duration-200 text-sm">
                  Accueil
                </Link>
              </li>
              <li>
                <Link href="/produits" className="text-white/80 hover:text-white transition-colors duration-200 text-sm">
                  Produits
                </Link>
              </li>
              <li>
                <Link href="/categories" className="text-white/80 hover:text-white transition-colors duration-200 text-sm">
                  Catégories
                </Link>
              </li>
              <li>
                <Link href="/promotions" className="text-white/80 hover:text-white transition-colors duration-200 text-sm">
                  Promotions
                </Link>
              </li>
            </ul>
          </div>

          {/* Support client */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Support Client</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/contact" className="text-white/80 hover:text-white transition-colors duration-200 text-sm">
                  Nous Contacter
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-white/80 hover:text-white transition-colors duration-200 text-sm">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/livraison" className="text-white/80 hover:text-white transition-colors duration-200 text-sm">
                  Livraison
                </Link>
              </li>
              <li>
                <Link href="/retours" className="text-white/80 hover:text-white transition-colors duration-200 text-sm">
                  Retours
                </Link>
              </li>
            </ul>
          </div>

          {/* Informations légales */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Informations</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="text-white/80 hover:text-white transition-colors duration-200 text-sm">
                  À Propos
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-white/80 hover:text-white transition-colors duration-200 text-sm">
                  Confidentialité
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-white/80 hover:text-white transition-colors duration-200 text-sm">
                  Conditions
                </Link>
              </li>
              <li>
                <Link href="/admin" className="text-white/80 hover:text-white transition-colors duration-200 text-sm">
                  Admin
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Ligne de séparation */}
        <div className="border-t border-white/20 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-white/60 text-sm">
              © 2024 Marché241. Tous droits réservés.
            </p>
            
            {/* Moyens de paiement */}
            <div className="flex items-center space-x-4 mt-4 md:mt-0">
              <span className="text-white/60 text-sm">Paiements acceptés:</span>
              <div className="flex space-x-2">
                <span className="text-lg">💳</span>
                <span className="text-lg">📱</span>
                <span className="text-lg">💰</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
