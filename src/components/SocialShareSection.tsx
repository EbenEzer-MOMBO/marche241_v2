'use client';

import { useState } from 'react';
import { 
  FacebookLogo, 
  TwitterLogo, 
  WhatsappLogo, 
  InstagramLogo,
  ShareNetwork,
  Check,
  Link as LinkIcon
} from '@phosphor-icons/react';

interface SocialShareSectionProps {
  boutiqueName: string;
  boutiqueTitle: string;
  boutiqueDescription: string;
}

export default function SocialShareSection({ 
  boutiqueName, 
  boutiqueTitle,
  boutiqueDescription 
}: SocialShareSectionProps) {
  const [copied, setCopied] = useState(false);

  // Construire l'URL de la boutique
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const boutiqueUrl = `${baseUrl}/${boutiqueName}`;
  
  // Préparer le texte de partage
  const shareText = `Découvrez ${boutiqueTitle} - ${boutiqueDescription}`;
  const encodedUrl = encodeURIComponent(boutiqueUrl);
  const encodedText = encodeURIComponent(shareText);

  // URLs de partage pour chaque réseau social
  const shareLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedText}`,
    whatsapp: `https://wa.me/?text=${encodedText}%20${encodedUrl}`,
    instagram: `https://www.instagram.com/`, // Instagram ne supporte pas le partage direct via URL
  };

  // Fonction pour copier le lien
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(boutiqueUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Erreur lors de la copie du lien:', err);
    }
  };

  // Fonction pour partager via l'API Web Share (mobile)
  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: boutiqueTitle,
          text: boutiqueDescription,
          url: boutiqueUrl,
        });
      } catch (err) {
        console.error('Erreur lors du partage:', err);
      }
    }
  };

  return (
    <section className="py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
            <ShareNetwork size={32} weight="duotone" className="text-primary" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-3">
            Partagez cette boutique
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Faites découvrir {boutiqueTitle} à vos amis et votre famille sur les réseaux sociaux
          </p>
        </div>

        {/* Boutons de partage */}
        <div className="flex flex-wrap justify-center gap-4 mb-6">
          {/* Facebook */}
          <a
            href={shareLinks.facebook}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-3 px-6 py-3 bg-[#1877F2] hover:bg-[#1565C0] text-white rounded-lg transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
          >
            <FacebookLogo size={24} weight="fill" />
            <span className="font-medium">Facebook</span>
          </a>

          {/* WhatsApp */}
          <a
            href={shareLinks.whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-3 px-6 py-3 bg-[#25D366] hover:bg-[#20BA5A] text-white rounded-lg transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
          >
            <WhatsappLogo size={24} weight="fill" />
            <span className="font-medium">WhatsApp</span>
          </a>

          {/* Instagram */}
          <button
            onClick={handleNativeShare}
            className="group flex items-center gap-3 px-6 py-3 bg-gradient-to-br from-[#833AB4] via-[#FD1D1D] to-[#FCAF45] hover:opacity-90 text-white rounded-lg transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
          >
            <InstagramLogo size={24} weight="fill" />
            <span className="font-medium">Instagram</span>
          </button>

          {/* X (Twitter) */}
          <a
            href={shareLinks.twitter}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-3 px-6 py-3 bg-black hover:bg-gray-800 text-white rounded-lg transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
          >
            <TwitterLogo size={24} weight="fill" />
            <span className="font-medium">X</span>
          </a>
        </div>

        {/* Copier le lien + Partage natif mobile */}
        <div className="flex flex-col sm:flex-row justify-center gap-3">
          {/* Bouton Copier le lien */}
          <button
            onClick={handleCopyLink}
            className="flex items-center justify-center gap-3 px-6 py-3 bg-gray-800 hover:bg-gray-900 text-white rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
          >
            {copied ? (
              <>
                <Check size={24} weight="bold" />
                <span className="font-medium">Lien copié !</span>
              </>
            ) : (
              <>
                <LinkIcon size={24} />
                <span className="font-medium">Copier le lien</span>
              </>
            )}
          </button>

          {/* Bouton Partager (natif mobile) */}
          {typeof window !== 'undefined' && 'share' in navigator && (
            <button
              onClick={handleNativeShare}
              className="flex items-center justify-center gap-3 px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
            >
              <ShareNetwork size={24} weight="fill" />
              <span className="font-medium">Partager</span>
            </button>
          )}
        </div>

        
      </div>
    </section>
  );
}
