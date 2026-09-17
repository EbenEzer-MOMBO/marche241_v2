import { LucideIcon, ChevronRight } from 'lucide-react';

interface StatsCardProps {
  icon: LucideIcon;
  iconColor: 'blue' | 'green' | 'purple' | 'orange' | 'amber' | 'indigo';
  label: string;
  value: number | string;
  subtitle?: string;
  onClick?: () => void;
}

const colorClasses = {
  blue: 'bg-blue-100 text-blue-600',
  green: 'bg-green-100 text-green-600',
  purple: 'bg-purple-100 text-purple-600',
  orange: 'bg-orange-100 text-orange-600',
  amber: 'bg-amber-100 text-amber-600',
  indigo: 'bg-indigo-100 text-indigo-600',
};

export const StatsCard: React.FC<StatsCardProps> = ({
  icon: Icon,
  iconColor,
  label,
  value,
  subtitle,
  onClick,
}) => {
  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (!onClick) {
      return;
    }
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onClick();
    }
  };

  return (
    <div
      className={`bg-white p-3 sm:p-4 md:p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow ${
        onClick ? 'cursor-pointer hover:border-gray-300 group' : ''
      }`}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      role={onClick ? 'link' : undefined}
      tabIndex={onClick ? 0 : undefined}
      aria-label={onClick ? `Ouvrir ${label}` : undefined}
    >
      <div className="flex items-center">
        <div className={`p-1.5 sm:p-2 ${colorClasses[iconColor]} rounded-lg flex-shrink-0`}>
          <Icon className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" />
        </div>
        <div className="ml-2 sm:ml-3 md:ml-4 min-w-0 flex-1">
          <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">{label}</p>
          <p className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">{value}</p>
          {subtitle && (
            <p className="text-xs text-gray-500 mt-0.5 hidden sm:block">{subtitle}</p>
          )}
        </div>
        {onClick && (
          <ChevronRight
            className="h-4 w-4 sm:h-5 sm:w-5 text-gray-300 group-hover:text-gray-500 flex-shrink-0 ml-1"
            aria-hidden="true"
          />
        )}
      </div>
    </div>
  );
};
