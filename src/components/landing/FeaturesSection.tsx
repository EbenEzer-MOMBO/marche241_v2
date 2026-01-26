'use client';

import { ShoppingCart, Smartphone, TrendingUp, Shield, Clock, Users } from 'lucide-react';

interface Feature {
  icon: React.ReactNode;
  number: string;
  title: string;
  description: string;
}

const features: Feature[] = [
  {
    icon: <ShoppingCart className="h-8 w-8" />,
    number: "01",
    title: "Gestion des commandes simplifiée",
    description: "Recevez et gérez vos commandes en temps réel. Notifications WhatsApp automatiques pour chaque nouvelle commande."
  },
  {
    icon: <Smartphone className="h-8 w-8" />,
    number: "02",
    title: "Paiements mobiles intégrés",
    description: "Acceptez Airtel Money et Moov Money directement. Vos clients paient en toute sécurité avec leurs moyens préférés."
  },
  {
    icon: <TrendingUp className="h-8 w-8" />,
    number: "03",
    title: "Statistiques en temps réel",
    description: "Suivez vos ventes, votre chiffre d'affaires et l'évolution de votre boutique avec des graphiques détaillés."
  },
  {
    icon: <Shield className="h-8 w-8" />,
    number: "04",
    title: "Sécurisé et fiable",
    description: "Vos données et celles de vos clients sont protégées. Infrastructure sécurisée et conforme aux standards."
  },
  {
    icon: <Clock className="h-8 w-8" />,
    number: "05",
    title: "Déploiement rapide",
    description: "Créez votre boutique en moins de 5 minutes. Ajoutez vos produits et commencez à vendre immédiatement."
  },
  {
    icon: <Users className="h-8 w-8" />,
    number: "06",
    title: "Support dédié",
    description: "Notre équipe vous accompagne à chaque étape. Support via WhatsApp, email et téléphone disponible."
  }
];

export const FeaturesSection: React.FC = () => {
  return (
    <section id="features" className="py-20 lg:py-28 bg-white">
      <div className="container mx-auto px-4">
        {/* En-tête de section */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Tout ce dont vous avez besoin
          </h2>
          <p className="text-lg text-gray-600">
            Une plateforme complète pour gérer votre commerce en ligne au Gabon. 
            Concentrez-vous sur vos produits, nous nous occupons du reste.
          </p>
        </div>

        {/* Grille de fonctionnalités */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group relative bg-gradient-to-br from-gray-50 to-white p-8 rounded-2xl border border-gray-200 hover:border-green-400 hover:shadow-xl transition-all duration-300"
            >
              {/* Numéro en arrière-plan */}
              <span className="absolute top-4 right-4 text-6xl font-bold text-gray-100 group-hover:text-green-100 transition-colors">
                {feature.number}
              </span>

              {/* Icône */}
              <div className="relative z-10 inline-flex items-center justify-center w-16 h-16 bg-green-100 text-green-600 rounded-xl mb-6 group-hover:bg-green-600 group-hover:text-white transition-all duration-300">
                {feature.icon}
              </div>

              {/* Contenu */}
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {feature.description}
              </p>

              {/* Flèche hover */}
              <div className="mt-6 flex items-center text-green-600 opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-sm font-medium">En savoir plus</span>
                <svg className="ml-2 h-4 w-4 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
