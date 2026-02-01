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
            href="/"
            className="inline-block bg-foreground text-white px-6 py-3 rounded-lg font-medium hover:bg-foreground/90 transition-colors duration-200"
          >
            Retour à la page d'accueil
          </Link>
          <br />
        </div>
      </div>
    </div>
  );
}