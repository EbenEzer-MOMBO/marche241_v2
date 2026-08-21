import type { Metadata } from 'next';
import Link from 'next/link';
import { Marche241Logo } from '@/components/Marche241Logo';
import Footer from '@/components/Footer';
import config from '@/lib/config';
import { absoluteUrl } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Politique de confidentialité',
  description:
    'Politique de confidentialité de Marché241 : collecte, utilisation et protection de vos données personnelles.',
  alternates: {
    canonical: absoluteUrl('/politique-de-confidentialite'),
  },
};

export const revalidate = 3600;

async function fetchPolitique() {
  try {
    const response = await fetch(
      `${config.apiBaseUrl}/politique-confidentialite`,
      {
        next: { revalidate: 3600 },
        headers: { Accept: 'application/json' },
      }
    );

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    if (!data?.success || !data?.politique) {
      return null;
    }

    return data.politique as {
      id: number;
      contenu: string;
      date_creation?: string;
      date_modification?: string;
    };
  } catch (error) {
    console.error('Erreur chargement politique:', error);
    return null;
  }
}

export default async function PolitiqueConfidentialitePage() {
  const politique = await fetchPolitique();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex h-[68px] max-w-4xl items-center justify-between px-4">
          <Marche241Logo iconHeight={34} textHeight={24} />
          <Link
            href="/"
            className="text-sm font-semibold text-[#508e27] hover:text-[#3f7020] transition-colors"
          >
            Retour à l&apos;accueil
          </Link>
        </div>
      </header>

      <main className="flex-1 mx-auto w-full max-w-4xl px-4 py-10 md:py-12">
        <article className="rounded-2xl border border-gray-200 bg-white p-6 md:p-12 shadow-sm">
          {politique ? (
            <>
              <div
                dangerouslySetInnerHTML={{ __html: politique.contenu }}
                className="space-y-4 leading-relaxed text-gray-700 [&_h1]:text-3xl [&_h1]:font-extrabold [&_h1]:text-gray-900 [&_h1]:mb-6 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-gray-800 [&_h2]:mb-3 [&_p]:text-gray-600 [&_p]:mb-4 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:text-gray-600 [&_ul]:mb-4 [&_ul]:space-y-2 [&_strong]:font-semibold"
              />
              {politique.date_modification && (
                <div className="mt-12 border-t border-gray-100 pt-6 text-right text-xs text-gray-400">
                  Dernière mise à jour :{' '}
                  {new Date(politique.date_modification).toLocaleDateString('fr-FR')}
                </div>
              )}
            </>
          ) : (
            <div className="py-12 text-center text-gray-500">
              La politique de confidentialité est en cours de mise à jour. Veuillez
              revenir plus tard.
            </div>
          )}
        </article>
      </main>

      <Footer />
    </div>
  );
}
