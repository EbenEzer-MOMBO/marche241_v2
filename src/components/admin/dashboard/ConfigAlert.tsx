import { AlertCircle, Plus, Truck, LucideIcon } from 'lucide-react';

interface ConfigAlertProps {
  type: 'products' | 'shipping';
  onAction: () => void;
}

const alertConfig = {
  products: {
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    iconColor: 'text-amber-600',
    titleColor: 'text-amber-900',
    textColor: 'text-amber-700',
    buttonColor: 'bg-amber-600 hover:bg-amber-700',
    icon: Plus,
    title: 'Aucun produit dans votre boutique',
    description: 'Commencez par ajouter des produits pour que vos clients puissent passer des commandes.',
    buttonText: 'Ajouter un produit',
  },
  shipping: {
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    iconColor: 'text-blue-600',
    titleColor: 'text-blue-900',
    textColor: 'text-blue-700',
    buttonColor: 'bg-blue-600 hover:bg-blue-700',
    icon: Truck,
    title: 'Aucune zone de livraison configurée',
    description: 'Ajoutez des communes et leurs frais de livraison pour permettre à vos clients de commander.',
    buttonText: 'Configurer la livraison',
  },
};

export const ConfigAlert: React.FC<ConfigAlertProps> = ({ type, onAction }) => {
  const config = alertConfig[type];
  const ButtonIcon = config.icon;

  return (
    <div className={`${config.bgColor} border ${config.borderColor} rounded-lg p-4`}>
      <div className="flex items-start">
        <AlertCircle className={`h-5 w-5 ${config.iconColor} mt-0.5 flex-shrink-0`} />
        <div className="ml-3 flex-1">
          <h3 className={`text-sm font-semibold ${config.titleColor}`}>
            {config.title}
          </h3>
          <p className={`mt-1 text-sm ${config.textColor}`}>
            {config.description}
          </p>
          <button
            onClick={onAction}
            className={`mt-3 inline-flex items-center px-3 py-1.5 ${config.buttonColor} text-white text-sm font-medium rounded-lg transition-colors`}
          >
            <ButtonIcon className="h-4 w-4 mr-1.5" />
            {config.buttonText}
          </button>
        </div>
      </div>
    </div>
  );
};
