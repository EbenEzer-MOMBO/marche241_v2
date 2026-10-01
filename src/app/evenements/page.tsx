import type { Metadata } from 'next';
import { absoluteUrl, OG_LOCALE, SITE_URL } from '@/lib/seo';
import EvenementsClient from './EvenementsClient';

export const metadata: Metadata = {
  title: 'Événements à venir au Gabon — Marché 241',
  description:
    'Concerts, soirées, salons : réservez votre billet en Airtel ou Moov Money et recevez-le avec QR code par email et WhatsApp.',
  alternates: {
    canonical: `${SITE_URL}/evenements`,
  },
  openGraph: {
    title: 'Événements à venir au Gabon — Marché 241',
    description:
      'Billetterie Marché 241 : paiement Mobile Money, billet QR code sur WhatsApp, scanné à l’entrée.',
    url: absoluteUrl('/evenements'),
    locale: OG_LOCALE,
    type: 'website',
  },
};

export default function EvenementsPage() {
  return <EvenementsClient />;
}
