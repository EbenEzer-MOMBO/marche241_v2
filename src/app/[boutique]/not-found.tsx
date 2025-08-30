import Link from 'next/link';

export default function BoutiqueNotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center px-4">
        <h1 className="text-6xl font-bold text-foreground mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-dark mb-4">
          Boutique non trouvée
        </h2>
        <p className="text-gray-600 mb-8 max-w-md mx-auto">
          La boutique que vous recherchez n'existe pas ou a été déplacée.
        </p>
        <div className="space-y-4">
          <Link
            href="/marche_241"
            className="inline-block bg-foreground text-white px-6 py-3 rounded-lg font-medium hover:bg-foreground/90 transition-colors duration-200"
          >
            Visiter Marché241
          </Link>
          <br />
          <Link
            href="/boutique_de_joline"
            className="inline-block border-2 border-foreground text-foreground px-6 py-3 rounded-lg font-medium hover:bg-foreground hover:text-white transition-colors duration-200"
          >
            Visiter Boutique de Joline
          </Link>
        </div>
      </div>
    </div>
  );
}