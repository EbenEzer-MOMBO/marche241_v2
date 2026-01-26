'use client';

import { Check, X } from 'lucide-react';

interface PricingPlan {
  name: string;
  subtitle: string;
  price: string;
  period: string;
  features: { text: string; included: boolean }[];
  isPopular?: boolean;
  ctaText: string;
  ctaLink: string;
}

const plans: PricingPlan[] = [
  {
    name: "Starter",
    subtitle: "Pour débuter",
    price: "Gratuit",
    period: "pour toujours",
    features: [
      { text: "Jusqu'à 50 produits", included: true },
      { text: "1 boutique en ligne", included: true },
      { text: "Paiements mobiles", included: true },
      { text: "Support par email", included: true },
      { text: "Statistiques basiques", included: false },
      { text: "Domaine personnalisé", included: false }
    ],
    ctaText: "Commencer gratuitement",
    ctaLink: "/admin/register"
  },
  {
    name: "Business",
    subtitle: "Le plus populaire",
    price: "25 000",
    period: "FCFA / mois",
    features: [
      { text: "Produits illimités", included: true },
      { text: "Boutiques illimitées", included: true },
      { text: "Paiements mobiles", included: true },
      { text: "Support prioritaire", included: true },
      { text: "Statistiques avancées", included: true },
      { text: "Domaine personnalisé", included: false }
    ],
    isPopular: true,
    ctaText: "Démarrer l'essai gratuit",
    ctaLink: "/admin/register"
  },
  {
    name: "Enterprise",
    subtitle: "Pour grandes entreprises",
    price: "Sur mesure",
    period: "contactez-nous",
    features: [
      { text: "Tout du plan Business", included: true },
      { text: "Multi-boutiques", included: true },
      { text: "API personnalisée", included: true },
      { text: "Support 24/7", included: true },
      { text: "Domaine personnalisé", included: true },
      { text: "Formation sur site", included: true }
    ],
    ctaText: "Nous contacter",
    ctaLink: "/contact"
  }
];

export const PricingSection: React.FC = () => {
  return (
    <section id="pricing" className="py-20 lg:py-28 bg-white">
      <div className="container mx-auto px-4">
        {/* En-tête */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Tarifs simples et transparents
          </h2>
          <p className="text-lg text-gray-600">
            Choisissez le plan qui correspond à vos besoins. 
            Changez ou annulez à tout moment, sans engagement.
          </p>
        </div>

        {/* Grille de tarifs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative bg-white rounded-2xl shadow-lg border-2 transition-all hover:shadow-2xl ${
                plan.isPopular 
                  ? 'border-green-500 transform md:scale-105' 
                  : 'border-gray-200'
              }`}
            >
              {/* Badge populaire */}
              {plan.isPopular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-green-500 text-white px-4 py-1 rounded-full text-sm font-semibold shadow-lg">
                    Le plus populaire
                  </span>
                </div>
              )}

              <div className="p-8">
                {/* En-tête du plan */}
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-1">
                    {plan.name}
                  </h3>
                  <p className="text-gray-600 text-sm mb-6">{plan.subtitle}</p>
                  
                  <div className="mb-2">
                    <span className="text-4xl font-bold text-gray-900">
                      {plan.price}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm">{plan.period}</p>
                </div>

                {/* Liste des fonctionnalités */}
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <div className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center ${
                        feature.included 
                          ? 'bg-green-100 text-green-600' 
                          : 'bg-gray-100 text-gray-400'
                      }`}>
                        {feature.included ? (
                          <Check className="h-3 w-3" />
                        ) : (
                          <X className="h-3 w-3" />
                        )}
                      </div>
                      <span className={feature.included ? 'text-gray-700' : 'text-gray-400'}>
                        {feature.text}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <a
                  href={plan.ctaLink}
                  className={`block w-full py-3 px-6 rounded-lg text-center font-semibold transition-all ${
                    plan.isPopular
                      ? 'bg-green-600 text-white hover:bg-green-700 shadow-lg'
                      : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                  }`}
                >
                  {plan.ctaText}
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* Note en bas */}
        <p className="text-center text-gray-600 mt-12">
          Tous les plans incluent les mises à jour gratuites et la sécurité SSL. 
          <a href="#" className="text-green-600 hover:underline ml-1">
            Comparer les fonctionnalités détaillées
          </a>
        </p>
      </div>
    </section>
  );
};
