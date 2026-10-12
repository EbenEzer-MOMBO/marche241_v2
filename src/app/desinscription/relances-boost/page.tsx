import type { Metadata } from 'next';
import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import { DesinscriptionRelances } from './DesinscriptionRelances';

export const metadata: Metadata = {
  title: 'Rappels de boosts',
  description: 'Gérer les rappels WhatsApp et e-mail des boosts non finalisés.',
  robots: { index: false, follow: false },
};

export default function PageDesinscriptionRelances() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-[#f6f5f2] px-4 py-12">
          <p className="mx-auto flex max-w-xl items-center gap-3 text-sm text-[#5f6369]">
            <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
            Vérification du lien…
          </p>
        </main>
      }
    >
      <DesinscriptionRelances />
    </Suspense>
  );
}
