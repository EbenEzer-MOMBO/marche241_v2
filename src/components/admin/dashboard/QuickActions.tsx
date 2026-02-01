import { Plus, ShoppingCart, Package } from 'lucide-react';

interface QuickActionsProps {
  boutiqueSlug: string;
  onNavigate: (path: string) => void;
}

const actions = [
  {
    label: 'Gérer les produits',
    icon: Plus,
    path: 'products',
    hoverColor: 'hover:border-blue-500 hover:bg-blue-50',
    iconHoverColor: 'group-hover:text-blue-500',
    textHoverColor: 'group-hover:text-blue-600',
  },
  {
    label: 'Voir les commandes',
    icon: ShoppingCart,
    path: 'orders',
    hoverColor: 'hover:border-green-500 hover:bg-green-50',
    iconHoverColor: 'group-hover:text-green-500',
    textHoverColor: 'group-hover:text-green-600',
  },
  {
    label: 'Gérer les catégories',
    icon: Package,
    path: 'categories',
    hoverColor: 'hover:border-purple-500 hover:bg-purple-50',
    iconHoverColor: 'group-hover:text-purple-500',
    textHoverColor: 'group-hover:text-purple-600',
  },
];

export const QuickActions: React.FC<QuickActionsProps> = ({ boutiqueSlug, onNavigate }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
      <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 sm:mb-6">Actions rapides</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.path}
              onClick={() => onNavigate(`/admin/${boutiqueSlug}/${action.path}`)}
              className={`flex items-center justify-center p-4 sm:p-6 border-2 border-dashed border-gray-300 rounded-lg ${action.hoverColor} transition-all group`}
            >
              <Icon className={`h-5 w-5 sm:h-6 sm:w-6 text-gray-400 ${action.iconHoverColor} mr-2 sm:mr-3`} />
              <span className={`text-sm sm:text-base text-gray-600 ${action.textHoverColor} font-medium`}>
                {action.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
