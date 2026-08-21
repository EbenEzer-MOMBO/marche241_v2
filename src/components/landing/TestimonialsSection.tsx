'use client';

import Image from 'next/image';
import { Boutique } from '@/lib/database-types';

interface TestimonialsSectionProps {
  boutiques: Boutique[];
}

const fallbackQuotes = [
  {
    quote:
      '« En quelques minutes j’avais mon lien boutique. Mes clients commandent toujours via WhatsApp, mais maintenant avec un vrai catalogue. »',
    city: 'Libreville',
  },
  {
    quote:
      '« Pas besoin d’être technique. J’ai ajouté mes produits depuis mon téléphone et j’ai commencé à vendre le jour même. »',
    city: 'Akanda',
  },
  {
    quote:
      '« Les paiements Airtel et Moov sont intégrés. Je suis mes commandes et mes reversements depuis le tableau de bord. »',
    city: 'Owendo',
  },
];

export const TestimonialsSection: React.FC<TestimonialsSectionProps> = ({ boutiques }) => {
  const featured = fallbackQuotes.map((item, index) => {
    const boutique = boutiques[index];
    return {
      ...item,
      name: boutique?.nom ?? 'Commerçant Marché241',
      logo: boutique?.logo,
      city: boutique?.ville || boutique?.adresse || item.city,
    };
  });

  return (
    <section className="py-14 bg-gray-50 border-t border-gray-200">
      <div className="container mx-auto px-4 lg:px-10">
        <div className="max-w-[1160px] mx-auto flex flex-col gap-6">
          <h2 className="text-[26px] font-bold tracking-tight text-gray-900">
            Ce que disent les commerçants déjà en ligne
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {featured.map((item) => (
              <article
                key={`${item.name}-${item.city}`}
                className="flex flex-col gap-3.5 p-6 bg-white border border-gray-200 rounded-[14px]"
              >
                <p className="text-base leading-relaxed text-gray-900">{item.quote}</p>
                <div className="flex items-center gap-2.5 mt-auto">
                  <div className="relative w-[34px] h-[34px] rounded-full overflow-hidden bg-gray-100 shrink-0">
                    {item.logo ? (
                      <Image src={item.logo} alt={item.name} fill className="object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-[#508e27]/20 to-[#74adaf]/20" />
                    )}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[13px] font-semibold text-gray-900 line-clamp-1">
                      {item.name}
                    </span>
                    <span className="text-xs text-gray-500">{item.city}</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
