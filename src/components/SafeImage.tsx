/**
 * Composant Image sécurisé avec fallback automatique
 */

'use client';

import Image from 'next/image';
import { useState } from 'react';

interface SafeImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  fill?: boolean;
  className?: string;
  fallbackSrc?: string;
  priority?: boolean;
}

export default function SafeImage({ 
  src, 
  alt, 
  width, 
  height, 
  fill,
  className = '', 
  fallbackSrc = '/default-shop.png',
  priority = false 
}: SafeImageProps) {
  const [imgSrc, setImgSrc] = useState(src);
  const [isError, setIsError] = useState(false);

  const handleError = () => {
    if (!isError && imgSrc !== fallbackSrc) {
      console.warn('Échec de chargement de l\'image:', imgSrc);
      setImgSrc(fallbackSrc);
      setIsError(true);
    }
  };

  // Props communes
  const commonProps = {
    src: imgSrc,
    alt,
    className,
    priority,
    onError: handleError,
    placeholder: "blur" as const,
    blurDataURL: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkrHB0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
  };

  // Si fill est true, utiliser le mode fill
  if (fill) {
    return <Image {...commonProps} fill />;
  }

  // Sinon, utiliser width et height
  return (
    <Image
      {...commonProps}
      width={width || 100}
      height={height || 100}
    />
  );
}
