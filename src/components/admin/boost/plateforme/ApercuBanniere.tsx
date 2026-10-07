'use client';

import { ImageIcon } from 'lucide-react';
import type { FormulePublicite } from '@/lib/database-types';

/**
 * Aperçu de la bannière dans une maquette simplifiée de la page publique (desktop et mobile).
 * Purement visuel : reproduit le format 4:1 (desktop) et 2:1 (mobile, si un visuel mobile est fourni).
 */
export default function ApercuBanniere({
  imageUrl,
  imageMobileUrl,
  formule,
  categorieNom
}: {
  imageUrl: string | null;
  imageMobileUrl: string | null;
  formule: FormulePublicite;
  categorieNom?: string | null;
}) {
  const page = formule === 'categorie' ? `Produits · ${categorieNom || 'catégorie'}` : 'Accueil';

  const visuel = (url: string | null, ratio: string) => (
    <div className={`relative w-full overflow-hidden rounded-lg border border-gray-200 bg-gray-100 ${ratio}`}>
      {url ? (
        // eslint-disable-next-line @next/next/no-img-element -- aperçu d'un fichier téléversé
        <img src={url} alt="" className="h-full w-full object-cover" />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-gray-400">
          <ImageIcon className="h-5 w-5" />
        </div>
      )}
      <span className="absolute left-1.5 top-1.5 rounded bg-white/90 px-1.5 py-px text-[9px] font-medium text-gray-700">Sponsorisé</span>
    </div>
  );

  return (
    <div className="space-y-4">
      <div>
        <p className="mb-1.5 text-xs font-medium text-gray-500">Ordinateur — {page}</p>
        <div className="rounded-xl border border-gray-200 bg-white p-2.5 shadow-sm">
          <div className="mb-2 flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-gray-300" />
            <span className="h-2 w-2 rounded-full bg-gray-300" />
            <span className="h-2 w-2 rounded-full bg-gray-300" />
            <span className="ml-2 h-2 flex-1 rounded bg-gray-100" />
          </div>
          <div className="mb-2 h-6 rounded bg-gray-50" />
          {visuel(imageUrl, 'aspect-[4/1]')}
          <div className="mt-2 grid grid-cols-4 gap-1.5">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="h-8 rounded bg-gray-50" />
            ))}
          </div>
        </div>
      </div>
      <div>
        <p className="mb-1.5 text-xs font-medium text-gray-500">Téléphone</p>
        <div className="mx-auto w-40 rounded-2xl border border-gray-200 bg-white p-2 shadow-sm">
          <div className="mb-1.5 h-4 rounded bg-gray-50" />
          {visuel(imageMobileUrl || imageUrl, imageMobileUrl ? 'aspect-[2/1]' : 'aspect-[4/1]')}
          <div className="mt-1.5 grid grid-cols-2 gap-1">
            {[0, 1].map((i) => (
              <div key={i} className="h-10 rounded bg-gray-50" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
