'use client';

import { useEffect, useState } from 'react';
import QRCode from 'qrcode';

interface TicketQrProps {
  payload: string;
  size?: number;
}

export const TicketQr = ({ payload, size = 112 }: TicketQrProps) => {
  const [src, setSrc] = useState('');

  useEffect(() => {
    let cancelled = false;
    QRCode.toDataURL(payload, {
      margin: 0,
      width: size * 2,
      color: { dark: '#111827', light: '#ffffff' },
    })
      .then((url) => {
        if (!cancelled) setSrc(url);
      })
      .catch(() => {
        if (!cancelled) setSrc('');
      });
    return () => {
      cancelled = true;
    };
  }, [payload, size]);

  if (!src) {
    return (
      <div
        className="shrink-0 bg-[#f3f4f6]"
        style={{ width: size, height: size }}
        aria-hidden="true"
      />
    );
  }

  return (
    <img
      src={src}
      alt="QR code du billet"
      width={size}
      height={size}
      className="block shrink-0 bg-white"
    />
  );
};
