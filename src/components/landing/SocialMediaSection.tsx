'use client';

import { Instagram, Facebook, MessageCircle } from 'lucide-react';

interface SocialLink {
  name: string;
  url: string;
  icon: React.ReactNode;
  color: string;
  hoverColor: string;
}

const socialLinks: SocialLink[] = [
  {
    name: 'Instagram',
    url: 'https://www.instagram.com/marche.241',
    icon: <Instagram className="h-6 w-6" />,
    color: 'from-purple-600 to-pink-600',
    hoverColor: 'hover:from-purple-700 hover:to-pink-700'
  },
  {
    name: 'Facebook',
    url: 'https://www.facebook.com/share/1aWtaTFYQQ/?mibextid=wwXIfr',
    icon: <Facebook className="h-6 w-6" />,
    color: 'from-blue-600 to-blue-700',
    hoverColor: 'hover:from-blue-700 hover:to-blue-800'
  },
  {
    name: 'TikTok',
    url: 'https://www.tiktok.com/@marche_241',
    icon: (
      <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
      </svg>
    ),
    color: 'from-gray-900 to-gray-800',
    hoverColor: 'hover:from-black hover:to-gray-900'
  },
  {
    name: 'WhatsApp',
    url: 'https://whatsapp.com/channel/0029VbBzgLjAzNbrcnABaa3M',
    icon: <MessageCircle className="h-6 w-6" />,
    color: 'from-green-600 to-green-700',
    hoverColor: 'hover:from-green-700 hover:to-green-800'
  }
];

export const SocialMediaSection: React.FC = () => {
  return (
    <section id="social" className="py-16 bg-white border-t border-gray-200">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          {/* En-tête */}
          <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
            Suivez-nous sur nos réseaux
          </h3>
          <p className="text-lg text-gray-600 mb-10">
            Restez connectés pour les dernières actualités, conseils et nouveautés
          </p>

          {/* Grille des réseaux sociaux */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {socialLinks.map((social, index) => (
              <a
                key={index}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group"
              >
                <div className="relative bg-white border-2 border-gray-200 rounded-2xl p-8 hover:border-[#74adaf] transition-all duration-300 hover:shadow-xl transform hover:-translate-y-1">
                  {/* Icône */}
                  <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r ${social.color} ${social.hoverColor} text-white rounded-xl mb-4 transition-all duration-300 group-hover:scale-110`}>
                    {social.icon}
                  </div>
                  
                  {/* Nom du réseau */}
                  <h4 className="text-lg font-semibold text-gray-900 group-hover:bg-gradient-to-r group-hover:from-[#508e27] group-hover:to-[#74adaf] group-hover:bg-clip-text group-hover:text-transparent transition-all">
                    {social.name}
                  </h4>
                </div>
              </a>
            ))}
          </div>

          {/* Message additionnel */}
          <p className="text-gray-500 text-sm mt-8">
            Rejoignez notre communauté et ne manquez aucune mise à jour !
          </p>
        </div>
      </div>
    </section>
  );
};
