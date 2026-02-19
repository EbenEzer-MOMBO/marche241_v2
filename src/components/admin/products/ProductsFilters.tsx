import { Search, Grid3X3, List } from 'lucide-react';

interface ProductsFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  filterStatus: 'all' | 'active' | 'inactive';
  onFilterStatusChange: (status: 'all' | 'active' | 'inactive') => void;
  groupByCategory: boolean;
  onToggleGrouping: () => void;
  sortBy: string;
  onSortChange: (value: string) => void;
  sortOrder: 'ASC' | 'DESC';
  onSortOrderChange: (order: 'ASC' | 'DESC') => void;
}

export function ProductsFilters({
  searchTerm,
  onSearchChange,
  filterStatus,
  onFilterStatusChange,
  groupByCategory,
  onToggleGrouping,
  sortBy,
  onSortChange,
  sortOrder,
  onSortOrderChange
}: ProductsFiltersProps) {
  return (
    <div className="space-y-4">
      {/* Barre de recherche */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Rechercher un produit..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
        />
      </div>

      {/* Filtres et options */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        {/* Filtres par statut */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => onFilterStatusChange('all')}
            className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
              filterStatus === 'all'
                ? 'bg-black text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Tous
          </button>
          <button
            onClick={() => onFilterStatusChange('active')}
            className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
              filterStatus === 'active'
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Actifs
          </button>
          <button
            onClick={() => onFilterStatusChange('inactive')}
            className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
              filterStatus === 'inactive'
                ? 'bg-red-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Inactifs
          </button>
        </div>

        {/* Options de tri et affichage */}
        <div className="flex flex-wrap gap-2">
          {/* Tri */}
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
          >
            <option value="date_creation">Date de création</option>
            <option value="nom">Nom</option>
            <option value="prix">Prix</option>
            <option value="nombre_ventes">Ventes</option>
            <option value="nombre_vues">Vues</option>
          </select>

          {/* Ordre */}
          <select
            value={sortOrder}
            onChange={(e) => onSortOrderChange(e.target.value as 'ASC' | 'DESC')}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
          >
            <option value="DESC">Décroissant</option>
            <option value="ASC">Croissant</option>
          </select>

          {/* Grouper par catégorie */}
          <button
            onClick={onToggleGrouping}
            className={`flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg transition-colors ${
              groupByCategory
                ? 'bg-black text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            title={groupByCategory ? 'Affichage groupé' : 'Affichage liste'}
          >
            {groupByCategory ? <Grid3X3 className="h-4 w-4" /> : <List className="h-4 w-4" />}
            <span className="hidden sm:inline">
              {groupByCategory ? 'Par catégorie' : 'Liste'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
