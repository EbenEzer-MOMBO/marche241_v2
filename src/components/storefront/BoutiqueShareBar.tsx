'use client';

import { useState } from 'react';

interface BoutiqueShareBarProps {
  boutiqueName: string;
  boutiqueTitle: string;
  boutiqueDescription: string;
}

export const BoutiqueShareBar = ({
  boutiqueName,
  boutiqueTitle,
  boutiqueDescription,
}: BoutiqueShareBarProps) => {
  const [copied, setCopied] = useState(false);

  const boutiqueUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/${boutiqueName}`
      : `/${boutiqueName}`;
  const shareText = `Découvrez ${boutiqueTitle} — ${boutiqueDescription}`;
  const encodedUrl = encodeURIComponent(boutiqueUrl);
  const encodedText = encodeURIComponent(shareText);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(boutiqueUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      console.error('Impossible de copier le lien');
    }
  };

  const handleNativeShare = async () => {
    if (!navigator.share) return;
    try {
      await navigator.share({
        title: boutiqueTitle,
        text: boutiqueDescription,
        url: boutiqueUrl,
      });
    } catch {
      // annulé
    }
  };

  const btnClass =
    'rounded-lg border border-[#e6e4df] px-3 py-[7px] text-[12.5px] font-medium text-[#3c4045] hover:bg-[#f6f5f3] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#17181a]/30';

  return (
    <section className="border-t border-[#ececea] px-4 py-5 sm:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-[13px] text-[#8b8f95] sm:text-[13.5px] sm:text-[#5f6369]">
          Partager la boutique
        </div>
        <div className="flex gap-2">
          <a
            href={`https://wa.me/?text=${encodedText}%20${encodedUrl}`}
            target="_blank"
            rel="noopener noreferrer"
            className={`${btnClass} flex-1 text-center sm:flex-none`}
            aria-label="Partager sur WhatsApp"
          >
            WhatsApp
          </a>
          <a
            href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
            target="_blank"
            rel="noopener noreferrer"
            className={`${btnClass} hidden sm:inline-flex`}
            aria-label="Partager sur Facebook"
          >
            Facebook
          </a>
          <a
            href="https://www.instagram.com/"
            target="_blank"
            rel="noopener noreferrer"
            className={`${btnClass} hidden sm:inline-flex`}
            aria-label="Ouvrir Instagram"
          >
            Instagram
          </a>
          <button
            type="button"
            onClick={handleCopy}
            className={`${btnClass} flex-1 sm:flex-none`}
            aria-label="Copier le lien"
          >
            {copied ? 'Copié' : 'Copier le lien'}
          </button>
          <button
            type="button"
            onClick={handleNativeShare}
            className={`${btnClass} flex-1 sm:hidden`}
            aria-label="Plus d'options de partage"
          >
            Plus
          </button>
        </div>
      </div>
    </section>
  );
};
