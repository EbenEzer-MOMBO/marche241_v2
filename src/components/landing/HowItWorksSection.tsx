'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

const steps = [
  {
    number: '1',
    duration: '≈ 2 min',
    title: 'Créez votre compte',
    description:
      'Nom de la boutique, ville, numéro whatsapp valide. Votre lien est actif immédiatement.',
    mobileDescription: 'Nom, ville, numéro whatsapp valide.',
  },
  {
    number: '2',
    duration: '≈ 3 min',
    title: 'Ajoutez 3 produits',
    description:
      'Photo depuis le téléphone, prix en FCFA, description. Modifiable à tout moment.',
    mobileDescription: 'Photos prises depuis le téléphone.',
  },
  {
    number: '3',
    duration: 'immédiat',
    title: 'Partagez votre lien',
    description:
      'WhatsApp, statut, Facebook. Chaque commande vous arrive par notification.',
    mobileDescription: 'Sur WhatsApp, statut, Facebook.',
  },
];

interface HowItWorksSectionProps {
  boutiqueCount?: number;
}

export const HowItWorksSection: React.FC<HowItWorksSectionProps> = ({
  boutiqueCount = 0,
}) => {
  return (
    <section id="how-it-works" className="py-14 lg:py-16 bg-white">
      <div className="container mx-auto px-4 lg:px-10">
        <div className="max-w-[1160px] mx-auto flex flex-col gap-8 lg:gap-9">
          <div className="text-left lg:text-center flex flex-col gap-2">
            <h2 className="text-[23px] lg:text-[34px] font-bold tracking-tight text-gray-900">
              <span className="lg:hidden">3 étapes, 5 minutes</span>
              <span className="hidden lg:inline">
                De l&apos;inscription à votre première commande, 3 étapes
              </span>
            </h2>
            <p className="hidden lg:block text-base text-gray-600">
              Aucun paiement, aucune installation. Il vous faut juste un numéro de téléphone.
            </p>
          </div>

          <div className="hidden lg:grid grid-cols-3 gap-6">
            {steps.map((step) => (
              <div
                key={step.number}
                className="flex flex-col gap-3 p-[26px] border border-gray-200 rounded-[14px]"
              >
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center justify-center w-9 h-9 rounded-[11px] bg-gradient-to-br from-[#508e27] to-[#74adaf] text-white text-base font-bold">
                    {step.number}
                  </span>
                  <span className="text-xs font-mono text-gray-500">{step.duration}</span>
                </div>
                <h3 className="text-[19px] font-semibold text-gray-900">{step.title}</h3>
                <p className="text-[15px] leading-relaxed text-gray-600">{step.description}</p>
              </div>
            ))}
          </div>

          <div className="lg:hidden flex flex-col gap-4">
            {steps.map((step) => (
              <div key={step.number} className="flex gap-3 items-start">
                <span className="inline-flex items-center justify-center w-[30px] h-[30px] shrink-0 rounded-[9px] bg-gradient-to-br from-[#508e27] to-[#74adaf] text-white text-sm font-bold">
                  {step.number}
                </span>
                <div className="flex flex-col gap-0.5">
                  <h3 className="text-base font-semibold text-gray-900">{step.title}</h3>
                  <p className="text-sm leading-relaxed text-gray-600">
                    {step.mobileDescription}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="hidden lg:flex items-center justify-center gap-4">
            <Link
              href="/admin/register"
              className="inline-flex items-center gap-2 px-[26px] py-[15px] rounded-xl bg-gradient-to-r from-[#508e27] to-[#74adaf] text-white font-semibold text-base shadow-[0_10px_26px_rgba(80,142,39,0.3)] hover:opacity-95 transition-all group"
            >
              Commencer l&apos;étape 1
              <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            {boutiqueCount > 0 && (
              <span className="text-sm text-gray-500">
                Déjà {boutiqueCount} commerçants l&apos;ont fait ce mois-ci
              </span>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
