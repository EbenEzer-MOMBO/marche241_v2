'use client';

import { useState } from 'react';
import {
  Check,
  FacebookLogo,
  LinkSimple,
  ShareNetwork,
  WhatsappLogo,
  XLogo,
} from '@phosphor-icons/react';

interface EvenementShareBarProps {
  boutiqueSlug: string;
  produitId: number;
  nom: string;
  /** Date de début brute (meta.date_debut), formatée dans le texte de partage. */
  dateDebut?: string;
  lieu?: string;
  /** Un événement non publié n'est pas consultable : partage désactivé. */
  estPublie: boolean;
}

const formatDateCourte = (iso?: string) => {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleString('fr-FR', {
    weekday: 'short',
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Barre de partage d'un événement depuis l'espace vendeur (lien vers sa page publique).
 */
export function EvenementShareBar({
  boutiqueSlug,
  produitId,
  nom,
  dateDebut,
  lieu,
  estPublie,
}: EvenementShareBarProps) {
  const [copied, setCopied] = useState(false);

  const url =
    typeof window !== 'undefined'
      ? `${window.location.origin}/${boutiqueSlug}/produit/${produitId}`
      : `/${boutiqueSlug}/produit/${produitId}`;
  const details = [formatDateCourte(dateDebut), lieu].filter(Boolean).join(', ');
  const texte = `🎟️ ${nom}${details ? ` — ${details}` : ''}. Réservez votre billet :`;
  const encodedUrl = encodeURIComponent(url);
  const encodedText = encodeURIComponent(texte);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      console.error('Impossible de copier le lien');
    }
  };

  const handleNativeShare = async () => {
    if (!navigator.share) return;
    try {
      await navigator.share({ title: nom, text: texte, url });
    } catch {
      // partage annulé
    }
  };

  const btnClass =
    'inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50';
  const liens = [
    {
      label: 'WhatsApp',
      href: `https://wa.me/?text=${encodedText}%20${encodedUrl}`,
      icon: <WhatsappLogo className="h-4 w-4 text-green-600" weight="fill" />,
    },
    {
      label: 'Facebook',
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      icon: <FacebookLogo className="h-4 w-4 text-blue-600" weight="fill" />,
    },
    {
      label: 'X',
      href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedText}`,
      icon: <XLogo className="h-4 w-4" />,
    },
  ];

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-sm font-semibold text-gray-900">Partager l’événement</p>
        <p className="text-xs text-gray-500">
          {estPublie ? 'Diffusez le lien de la billetterie sur vos réseaux' : 'Publiez l’événement pour pouvoir le partager'}
        </p>
      </div>
      <div className={`flex flex-wrap gap-2 ${estPublie ? '' : 'pointer-events-none opacity-40'}`} aria-disabled={!estPublie}>
        {liens.map((lien) => (
          <a
            key={lien.label}
            href={lien.href}
            target="_blank"
            rel="noopener noreferrer"
            className={btnClass}
            aria-label={`Partager sur ${lien.label}`}
            tabIndex={estPublie ? undefined : -1}
          >
            {lien.icon}
            <span className="hidden sm:inline">{lien.label}</span>
          </a>
        ))}
        <button type="button" onClick={handleCopy} className={btnClass} disabled={!estPublie}>
          {copied ? <Check className="h-4 w-4 text-green-600" /> : <LinkSimple className="h-4 w-4" />}
          {copied ? 'Copié' : 'Copier le lien'}
        </button>
        <button
          type="button"
          onClick={handleNativeShare}
          className={`${btnClass} sm:hidden`}
          disabled={!estPublie}
          aria-label="Plus d'options de partage"
        >
          <ShareNetwork className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
