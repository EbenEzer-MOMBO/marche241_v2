/* eslint-disable @next/next/no-img-element */
import { Globe, ImageIcon, MessageCircle, MoreHorizontal, Share2, ThumbsUp } from 'lucide-react';
import type { ObjectifBoost } from '@/lib/database-types';

const LIBELLES_CTA: Record<ObjectifBoost, string> = {
  trafic: 'Acheter',
  whatsapp: 'Envoyer un message WhatsApp',
  notoriete: 'En savoir plus'
};

/** Aperçu d'une publicité Facebook diffusée par la Page Marché 241 (port de AdPreview de boost_meta). */
export default function AdPreview({
  titre,
  texte,
  description,
  imageUrl,
  objectif,
  domaine = 'marche241.ga'
}: {
  titre: string;
  texte: string;
  description?: string | null;
  imageUrl: string | null;
  objectif: ObjectifBoost;
  domaine?: string;
}) {
  return (
    <div className="w-full max-w-sm overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="flex items-center gap-2.5 px-3 pt-3">
        <img src="/site-logo.png" alt="" className="h-9 w-9 rounded-full border border-gray-100 object-cover" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold leading-tight text-gray-900">Marché 241</p>
          <p className="flex items-center gap-1 text-xs text-gray-500">
            Sponsorisé · <Globe className="h-3 w-3" />
          </p>
        </div>
        <MoreHorizontal className="h-5 w-5 text-gray-400" />
      </div>

      <p className={`px-3 py-2 text-sm whitespace-pre-wrap break-words ${texte ? 'text-gray-800' : 'text-gray-400'}`}>
        {texte || 'Le texte de votre publicité apparaîtra ici.'}
      </p>

      {imageUrl ? (
        <img src={imageUrl} alt="Visuel de la publicité" className="aspect-[1.91/1] w-full bg-gray-100 object-cover" />
      ) : (
        <div className="flex aspect-[1.91/1] w-full flex-col items-center justify-center bg-gray-100 text-gray-400">
          <ImageIcon className="h-8 w-8" />
          <span className="mt-1 text-xs">Visuel</span>
        </div>
      )}

      <div className="flex items-center gap-3 bg-gray-50 px-3 py-2.5">
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs uppercase text-gray-500">{domaine}</p>
          <p className="truncate text-sm font-semibold text-gray-900">{titre || 'Titre de la publicité'}</p>
          {description && <p className="truncate text-xs text-gray-500">{description}</p>}
        </div>
        <span className="flex-shrink-0 rounded-md bg-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-800">
          {LIBELLES_CTA[objectif]}
        </span>
      </div>

      <div className="flex justify-around border-t border-gray-100 py-2 text-xs text-gray-500">
        <span className="flex items-center gap-1"><ThumbsUp className="h-3.5 w-3.5" /> J’aime</span>
        <span className="flex items-center gap-1"><MessageCircle className="h-3.5 w-3.5" /> Commenter</span>
        <span className="flex items-center gap-1"><Share2 className="h-3.5 w-3.5" /> Partager</span>
      </div>
    </div>
  );
}
