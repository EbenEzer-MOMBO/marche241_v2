'use client';

import Image from 'next/image';
import Link from 'next/link';

interface Marche241LogoProps {
  href?: string;
  className?: string;
  iconHeight?: number;
  textHeight?: number;
  priority?: boolean;
}

export const Marche241Logo: React.FC<Marche241LogoProps> = ({
  href = '/',
  className = '',
  iconHeight = 36,
  textHeight = 28,
  priority = false,
}) => {
  const iconWidth = Math.round(iconHeight * (469.31 / 374.31));
  const textWidth = Math.round(textHeight * (220 / 43.07));

  const content = (
    <span
      className={`inline-flex items-center gap-2 ${className}`}
      aria-label="Marché241"
    >
      <Image
        src="/marche241_Web_without_text-01-01.svg"
        alt=""
        width={iconWidth}
        height={iconHeight}
        className="h-auto w-auto shrink-0"
        style={{ height: iconHeight, width: 'auto' }}
        priority={priority}
        unoptimized
        aria-hidden
      />
      <Image
        src="/Logo_vector_text-02.svg"
        alt="Marché241"
        width={textWidth}
        height={textHeight}
        className="h-auto w-auto shrink-0"
        style={{ height: textHeight, width: 'auto' }}
        priority={priority}
        unoptimized
      />
    </span>
  );

  if (!href) {
    return content;
  }

  return (
    <Link href={href} className="inline-flex items-center" aria-label="Marché241 — Accueil">
      {content}
    </Link>
  );
};
