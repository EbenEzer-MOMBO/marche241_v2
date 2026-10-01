import SafeImage from '@/components/SafeImage';
import { getProduitImageUrl } from '@/lib/services/produits';
import type { EvenementPublic } from '@/lib/services/evenements';

/** Bloc date blanc « 10 / OCT » posé sur l'affiche. */
export const EvenementDateBlock = ({
  evenement,
  size = 'md',
}: {
  evenement: EvenementPublic;
  size?: 'sm' | 'md';
}) => (
  <div
    className={`absolute flex flex-col items-center rounded-[10px] bg-white shadow-[0_4px_12px_rgba(0,0,0,0.1)] ${
      size === 'sm' ? 'left-2.5 top-2.5 w-[46px] py-1.5' : 'left-3 top-3 w-[52px] py-[7px]'
    }`}
  >
    <span
      className={`font-extrabold leading-none text-gray-900 ${size === 'sm' ? 'text-lg' : 'text-xl'}`}
    >
      {evenement.jour}
    </span>
    <span
      className={`font-bold uppercase tracking-[0.06em] text-[#508e27] ${
        size === 'sm' ? 'text-[10px]' : 'text-[11px]'
      }`}
    >
      {evenement.mois}
    </span>
  </div>
);

/** Affiche de l'événement, ou fond hachuré si aucune image. */
export const EvenementAffiche = ({
  evenement,
  tone = 'light',
}: {
  evenement: EvenementPublic;
  tone?: 'light' | 'dark';
}) => {
  if (evenement.image) {
    return (
      <SafeImage
        src={getProduitImageUrl(evenement.image)}
        alt={evenement.nom}
        fill
        className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
      />
    );
  }

  return (
    <div
      aria-hidden
      className="absolute inset-0"
      style={{
        background:
          tone === 'dark'
            ? 'repeating-linear-gradient(45deg,#1c221e 0 12px,#171c19 12px 24px)'
            : 'repeating-linear-gradient(45deg,#f3f4f6 0 10px,#e9eaec 10px 20px)',
      }}
    />
  );
};
