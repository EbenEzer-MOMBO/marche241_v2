'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
}

const faqData: FAQItem[] = [
  {
    question: "Comment fonctionnent les paiements ?",
    answer: "Les clients peuvent payer facilement via Airtel Money et Moov Money. Le paiement se fait directement sur la plateforme en suivant des instructions simples, sans manipulation complexe."
  },
  {
    question: "Quand est-ce que je reçois mon argent ?",
    answer: "Les paiements sont regroupés puis reversés mensuellement. Vous recevez le montant total qui vous revient."
  },
  {
    question: "Pourquoi les paiements sont centralisés ? Est-ce sécurisé ?",
    answer: "Les paiements passent par une solution sécurisée (EBilling) utilisée pour gérer les transactions Mobile Money. L'argent transite par un portefeuille sécurisé avant d'être reversé au vendeur. Ce système permet d'assurer un suivi fiable des transactions et de limiter les erreurs ou arnaques."
  },
  {
    question: "Comment puis-je suivre mes ventes ?",
    answer: "Depuis votre tableau de bord, vous avez accès à l'historique des commandes, au détail des paiements et au suivi en temps réel. Chaque commande validée est également confirmée par notification."
  },
  {
    question: "Le client doit-il faire des manipulations compliquées ?",
    answer: "Non. Le client suit simplement les étapes indiquées pour payer et valider sa commande. Aucun envoi de capture d'écran n'est nécessaire."
  },
  {
    question: "Que se passe-t-il en cas de fausses commandes ?",
    answer: "Vous pouvez activer une option où le client paie uniquement les frais de livraison en ligne, puis règle le reste à la réception. Cela permet de filtrer les clients non sérieux."
  },
  {
    question: "Puis-je continuer à vendre en dehors de la plateforme ?",
    answer: "Oui. Marché 241 est un outil complémentaire. Vous pouvez continuer à vendre via vos canaux habituels (mais avec nous c'est mieux 😉)."
  },
  {
    question: "Y a-t-il des frais cachés ?",
    answer: "Non. Notre commission est récupérée sur les achats clients."
  },
  {
    question: "Qu'est-ce qui garantit votre fiabilité ?",
    answer: "Toutes les transactions sont enregistrées et traçables. Vous avez accès à un historique complet et recevez des notifications à chaque commande. L'objectif est de garantir transparence et confiance."
  },
  {
    question: "Puis-je tester la plateforme avant de m'engager ?",
    answer: "Oui. L'inscription est gratuite, sans engagement. Vous pouvez tester la plateforme librement."
  }
];

export const FAQSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="py-10 lg:py-5 bg-gray-50">
      <div className="container mx-auto px-4">
        {/* En-tête de section */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Questions fréquentes
          </h2>
          <p className="text-lg text-gray-600">
            Vous avez des questions ? Nous avons les réponses. 
            Si vous ne trouvez pas ce que vous cherchez, n'hésitez pas à nous contacter.
          </p>
        </div>

        {/* Liste des FAQ */}
        <div className="max-w-4xl mx-auto space-y-4">
          {faqData.map((faq, index) => (
            <div
              key={index}
              className="bg-white rounded-xl border-2 border-gray-200 hover:border-[#74adaf] transition-all duration-300 overflow-hidden"
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full flex items-center justify-between p-6 text-left focus:outline-none group"
              >
                <span className="text-lg font-semibold text-gray-900 pr-8 group-hover:bg-gradient-to-r group-hover:from-[#508e27] group-hover:to-[#74adaf] group-hover:bg-clip-text group-hover:text-transparent transition-all">
                  {faq.question}
                </span>
                <ChevronDown
                  className={`flex-shrink-0 h-5 w-5 text-[#508e27] transition-transform duration-300 ${
                    openIndex === index ? 'rotate-180' : ''
                  }`}
                />
              </button>
              
              <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  openIndex === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                }`}
              >
                <div className="px-6 pb-6 text-gray-600 leading-relaxed border-t border-gray-100 pt-4">
                  {faq.answer}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA en bas */}
        <div className="text-center mt-12">
          <p className="text-gray-600 mb-4">
            Vous avez d'autres questions ?
          </p>
          <a
            href="https://api.whatsapp.com/send/?phone=24104694721&text&type=phone_number&app_absent=0" target="_blank"
            className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-[#508e27] to-[#74adaf] text-white rounded-lg hover:opacity-90 transition-all font-medium"
          >
            Contactez-nous
          </a>
        </div>
      </div>
    </section>
  );
};
