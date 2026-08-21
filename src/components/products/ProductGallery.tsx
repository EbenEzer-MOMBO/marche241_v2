'use client';

import Image from 'next/image';

interface ProductGalleryProps {
  images: string[];
  productName: string;
  selectedIndex: number;
  onSelect: (index: number) => void;
  onOpenFullscreen: (index: number) => void;
  /** 1:1 pour un produit, 3:2 pour une affiche événement ou une photo de prestation */
  aspect?: 'square' | 'poster';
  /** Légende sous l'image principale (ex. variante suivie par les vignettes) */
  caption?: string;
}

export function ProductGallery({
  images,
  productName,
  selectedIndex,
  onSelect,
  onOpenFullscreen,
  aspect = 'square',
  caption,
}: ProductGalleryProps) {
  if (images.length === 0) return null;

  const safeIndex = Math.min(selectedIndex, images.length - 1);
  const aspectClass = aspect === 'poster' ? 'aspect-[3/2]' : 'aspect-square';

  return (
    <div className="flex gap-3.5">
      {images.length > 1 && (
        <div className="hidden w-[72px] flex-none flex-col gap-2.5 sm:flex">
          {images.map((image, index) => (
            <button
              key={`${image}-${index}`}
              type="button"
              onClick={() => onSelect(index)}
              className={`overflow-hidden rounded-lg bg-[#f4f3f0] transition-colors ${aspectClass} ${
                index === safeIndex
                  ? 'border-[1.5px] border-[#17181a]'
                  : 'border-[1.5px] border-[#e6e4df] hover:border-[#cfcbc3]'
              }`}
              aria-label={`Voir l'image ${index + 1} sur ${images.length}`}
              aria-current={index === safeIndex}
            >
              <Image
                src={image}
                alt={`${productName} — vignette ${index + 1}`}
                width={144}
                height={144}
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col gap-2.5">
        <button
          type="button"
          onClick={() => onOpenFullscreen(safeIndex)}
          className={`group relative w-full cursor-zoom-in overflow-hidden rounded-xl bg-[#f4f3f0] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#17181a]/40 ${aspectClass}`}
          aria-label={`Agrandir l'image de ${productName}`}
        >
          <Image
            src={images[safeIndex]}
            alt={productName}
            width={900}
            height={900}
            priority
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
          {images.length > 1 && (
            <span className="absolute inset-x-0 bottom-3 flex justify-center gap-1.5 sm:hidden">
              {images.map((image, index) => (
                <span
                  key={`dot-${image}-${index}`}
                  className={`h-1 rounded-full transition-all ${
                    index === safeIndex
                      ? 'w-4 bg-[#17181a]'
                      : 'w-1 bg-[#17181a]/30'
                  }`}
                />
              ))}
            </span>
          )}
        </button>

        {images.length > 1 && (
          <p className="text-center font-mono text-[12.5px] text-[#9a9892]">
            {safeIndex + 1} / {images.length}
            {caption ? ` · ${caption}` : ''}
          </p>
        )}
      </div>
    </div>
  );
}
