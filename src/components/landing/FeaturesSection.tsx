'use client';

import { Smartphone, MessageCircle, TrendingUp, Headphones } from 'lucide-react';

interface Feature {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const features: Feature[] = [
  {
    icon: <Smartphone className="h-5 w-5" />,
    title: 'Paiements mobiles',
    description: 'Airtel Money et Moov Money. Vos clients paient avec ce qu\'ils ont déjà.',
  },
  {
    icon: <MessageCircle className="h-5 w-5" />,
    title: 'Commandes sur WhatsApp',
    description:
      'Notification automatique à chaque commande, vous répondez comme d\'habitude.',
  },
  {
    icon: <TrendingUp className="h-5 w-5" />,
    title: 'Ventes en temps réel',
    description: 'Chiffre d\'affaires, produits vus, commandes du jour sur un seul écran.',
  },
  {
    icon: <Headphones className="h-5 w-5" />,
    title: 'Support par WhatsApp',
    description:
      'Une vraie personne vous répond, 7j/7, pour configurer votre boutique.',
  },
];

export const FeaturesSection: React.FC = () => {
  return (
    <section id="features" className="py-12 lg:py-[60px] bg-gray-50 border-t border-gray-200">
      <div className="container mx-auto px-4 lg:px-10">
        <div className="max-w-[1160px] mx-auto flex flex-col gap-6 lg:gap-7">
          <h2 className="text-[26px] lg:text-[28px] font-bold tracking-tight text-gray-900">
            Tout ce dont vous avez besoin, rien de plus
          </h2>

          <div className="hidden lg:grid grid-cols-4 gap-5">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="flex flex-col gap-2.5 p-6 bg-white border border-gray-200 rounded-[14px]"
              >
                <div className="w-[38px] h-[38px] rounded-[10px] bg-[#508e27]/12 text-[#508e27] flex items-center justify-center">
                  {feature.icon}
                </div>
                <h3 className="text-[17px] font-semibold text-gray-900">{feature.title}</h3>
                <p className="text-sm leading-relaxed text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>

          <div className="lg:hidden flex gap-2.5 overflow-x-auto snap-x snap-mandatory pb-2 -mx-4 px-4 scrollbar-none">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="snap-start shrink-0 w-[230px] flex flex-col gap-2 p-[18px] border border-gray-200 rounded-[13px] bg-white"
              >
                <div className="w-[34px] h-[34px] rounded-[9px] bg-[#508e27]/12 text-[#508e27] flex items-center justify-center">
                  {feature.icon}
                </div>
                <h3 className="text-base font-semibold text-gray-900">{feature.title}</h3>
                <p className="text-sm leading-relaxed text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
