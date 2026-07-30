'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
}

const primaryFaqs: FAQItem[] = [
  {
    question: 'Y a-t-il des frais cachés ?',
    answer:
      "Non. L'ouverture et la gestion de la boutique sont gratuites ; seule une commission connue s'applique sur les ventes encaissées.",
  },
  {
    question: 'Quand est-ce que je reçois mon argent ?',
    answer:
      'Les paiements sont regroupés puis reversés sur votre compte Airtel Money ou Moov Money. Vous suivez chaque versement depuis votre tableau de bord.',
  },
  {
    question: "Puis-je tester la plateforme avant de m'engager ?",
    answer:
      "Oui. L'inscription est gratuite, sans engagement. Vous pouvez tester la plateforme librement.",
  },
  {
    question: 'Est-ce que je peux continuer à vendre sur WhatsApp ?',
    answer:
      'Oui. Marché241 complète WhatsApp : vos clients gardent le même canal, avec un catalogue et des paiements structurés.',
  },
  {
    question: 'Que se passe-t-il en cas de fausse commande ?',
    answer:
      'Vous pouvez activer une option où le client paie uniquement les frais de livraison en ligne, puis règle le reste à la réception.',
  },
];

const extraFaqs: FAQItem[] = [
  {
    question: 'Comment fonctionnent les paiements ?',
    answer:
      'Les clients paient via Airtel Money et Moov Money directement sur la plateforme, sans manipulation complexe.',
  },
  {
    question: 'Pourquoi les paiements sont centralisés ? Est-ce sécurisé ?',
    answer:
      "Les paiements passent par une solution sécurisée (EBilling). L'argent transite par un portefeuille sécurisé avant d'être reversé au vendeur.",
  },
  {
    question: 'Comment puis-je suivre mes ventes ?',
    answer:
      "Depuis votre tableau de bord : historique des commandes, détail des paiements et suivi en temps réel, avec notification à chaque commande.",
  },
  {
    question: 'Le client doit-il faire des manipulations compliquées ?',
    answer:
      'Non. Le client suit les étapes indiquées pour payer et valider sa commande. Aucun envoi de capture d\'écran n\'est nécessaire.',
  },
  {
    question: 'Qu\'est-ce qui garantit votre fiabilité ?',
    answer:
      'Toutes les transactions sont enregistrées et traçables. Vous avez un historique complet et une notification à chaque commande.',
  },
];

export const FAQSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [showAll, setShowAll] = useState(false);

  const faqs = showAll ? [...primaryFaqs, ...extraFaqs] : primaryFaqs;

  const handleToggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="py-14 bg-white">
      <div className="container mx-auto px-4 lg:px-10">
        <div className="max-w-[760px] mx-auto flex flex-col gap-[18px]">
          <h2 className="text-[26px] font-bold tracking-tight text-gray-900 text-center">
            Les 5 questions qui bloquent avant l&apos;inscription
          </h2>

          <div className="flex flex-col gap-2.5">
            {faqs.map((faq, index) => {
              const isOpen = openIndex === index;
              return (
                <div
                  key={faq.question}
                  className={`rounded-xl border overflow-hidden transition-colors ${
                    isOpen
                      ? 'border-gray-300 bg-gray-50'
                      : 'border-gray-200 bg-white'
                  }`}
                >
                  <button
                    onClick={() => handleToggle(index)}
                    className="w-full flex items-center justify-between px-5 py-[18px] text-left"
                    aria-expanded={isOpen}
                  >
                    <span
                      className={`text-base pr-4 ${
                        isOpen ? 'font-semibold text-gray-900' : 'font-medium text-gray-900'
                      }`}
                    >
                      {faq.question}
                    </span>
                    <ChevronDown
                      className={`h-4 w-4 shrink-0 text-gray-500 transition-transform ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-[18px] text-[15px] leading-relaxed text-gray-600">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center justify-center gap-x-[18px] gap-y-2 pt-1.5">
            {!showAll && (
              <>
                <button
                  onClick={() => setShowAll(true)}
                  className="text-sm font-medium text-[#508e27] hover:text-[#3f7020] transition-colors"
                >
                  Voir les 10 questions
                </button>
                <span className="text-sm text-gray-500">·</span>
              </>
            )}
            <a
              href="https://api.whatsapp.com/send/?phone=24104694721&text&type=phone_number&app_absent=0"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-[#508e27] hover:text-[#3f7020] transition-colors"
            >
              Poser ma question sur WhatsApp
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};
