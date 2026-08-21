'use client';

interface TrustItem {
  title: string;
  subtitle: string;
}

interface BoutiqueTrustSignalsProps {
  items: TrustItem[];
  variant?: 'row' | 'pills';
  className?: string;
}

export const BoutiqueTrustSignals = ({
  items,
  variant = 'row',
  className = '',
}: BoutiqueTrustSignalsProps) => {
  if (items.length === 0) return null;

  if (variant === 'pills') {
    return (
      <div
        className={`flex gap-2 overflow-x-auto scrollbar-none ${className}`}
        aria-label="Informations boutique"
      >
        {items.map((item) => (
          <div
            key={item.title}
            className="shrink-0 whitespace-nowrap rounded-[7px] bg-[#f6f5f3] px-2.5 py-1.5 text-xs font-medium text-[#3c4045]"
          >
            {item.title}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div
      className={`flex flex-wrap gap-x-6 gap-y-3 ${className}`}
      aria-label="Informations boutique"
    >
      {items.map((item, index) => (
        <div key={item.title} className="flex items-start gap-6">
          {index > 0 && (
            <div className="hidden h-full min-h-[36px] w-px bg-[#ececea] sm:block" />
          )}
          <div className="text-[13px] leading-[1.5] text-[#3c4045]">
            <div className="font-semibold">{item.title}</div>
            <div className="text-[#8b8f95]">{item.subtitle}</div>
          </div>
        </div>
      ))}
    </div>
  );
};
