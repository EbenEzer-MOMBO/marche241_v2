interface PeriodSelectorProps {
  periode: number;
  onChange: (periode: number) => void;
}

export const PeriodSelector: React.FC<PeriodSelectorProps> = ({ periode, onChange }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 inline-flex">
      <button
        onClick={() => onChange(7)}
        className={`px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium transition-colors ${
          periode === 7
            ? 'bg-black text-white'
            : 'text-gray-700 hover:bg-gray-50'
        } rounded-l-lg`}
      >
        7 jours
      </button>
      <button
        onClick={() => onChange(30)}
        className={`px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium transition-colors border-x border-gray-200 ${
          periode === 30
            ? 'bg-black text-white'
            : 'text-gray-700 hover:bg-gray-50'
        }`}
      >
        30 jours
      </button>
      <button
        onClick={() => onChange(90)}
        className={`px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium transition-colors ${
          periode === 90
            ? 'bg-black text-white'
            : 'text-gray-700 hover:bg-gray-50'
        } rounded-r-lg`}
      >
        90 jours
      </button>
    </div>
  );
};
