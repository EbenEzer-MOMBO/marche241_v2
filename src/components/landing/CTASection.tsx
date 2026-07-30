'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

interface CTASectionProps {
  boutiqueCount?: number;
}

export const CTASection: React.FC<CTASectionProps> = ({ boutiqueCount = 0 }) => {
  const stats = [
    {
      value: boutiqueCount > 0 ? String(boutiqueCount) : '27',
      label: 'boutiques actives',
    },
    { value: '200+', label: 'produits en ligne' },
    { value: '80%', label: 'satisfaction client' },
    { value: '24/7', label: 'support WhatsApp' },
  ];

  return (
    <section className="py-14 lg:py-[60px] bg-gradient-to-br from-[#508e27] to-[#74adaf]">
      <div className="container mx-auto px-4 lg:px-10">
        <div className="max-w-[1000px] mx-auto flex flex-col items-center gap-[22px] text-center">
          <h2 className="text-[28px] lg:text-[36px] font-extrabold tracking-tight text-white">
            Votre boutique peut être en ligne avant ce soir
          </h2>
          <p className="text-[17px] text-white/90 max-w-[600px]">
            Inscription gratuite, sans carte bancaire. Vous gardez vos clients WhatsApp.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-3.5">
            <Link
              href="/admin/register"
              className="inline-flex items-center gap-2.5 px-8 py-[18px] rounded-[13px] bg-white text-[#3f7020] text-lg font-bold shadow-[0_14px_34px_rgba(0,0,0,0.2)] hover:bg-gray-50 transition-colors group"
            >
              Créer ma boutique maintenant
              <ArrowRight className="h-5 w-5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <Link
              href="/affiche_boutiques"
              className="inline-flex items-center px-6 py-[17px] rounded-[13px] border border-white/55 text-white text-base font-medium hover:bg-white/10 transition-colors"
            >
              Rechercher une boutique
            </Link>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 pt-3.5 w-full max-w-[860px]">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="p-4 rounded-xl bg-white/14 flex flex-col items-center"
              >
                <span className="text-2xl font-bold text-white">{stat.value}</span>
                <span className="text-xs text-white/85">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
