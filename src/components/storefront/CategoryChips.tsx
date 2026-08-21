'use client';

interface CategoryChip {
  id: string;
  label: string;
  count?: number;
}

interface CategoryChipsProps {
  items: CategoryChip[];
  activeId: string;
  onSelect: (id: string) => void;
  className?: string;
}

export const CategoryChips = ({
  items,
  activeId,
  onSelect,
  className = '',
}: CategoryChipsProps) => {
  return (
    <div
      className={`flex gap-2 overflow-x-auto scrollbar-none ${className}`}
      role="tablist"
      aria-label="Catégories"
    >
      {items.map((item) => {
        const isActive = item.id === activeId;
        return (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            tabIndex={0}
            onClick={() => onSelect(item.id)}
            className={`shrink-0 whitespace-nowrap rounded-full px-3.5 py-1.5 text-[12.5px] font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-shop-primary,#17181a)]/30 sm:text-[13px] sm:px-3.5 sm:py-[7px] ${
              isActive
                ? 'text-[var(--shop-cta-fg,#fff)]'
                : 'border border-[#e6e4df] text-[#3c4045] hover:bg-[#f6f5f3]'
            }`}
            style={
              isActive
                ? {
                    backgroundColor:
                      'var(--color-shop-primary, var(--primary-color))',
                    color: 'var(--shop-cta-fg, #fff)',
                  }
                : undefined
            }
          >
            {item.label}
            {typeof item.count === 'number' && (
              <span
                className={`ml-1.5 ${
                  isActive ? 'opacity-70' : 'text-[#9a9892]'
                }`}
              >
                {item.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
