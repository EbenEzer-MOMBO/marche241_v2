import type { Metadata } from 'next';
import { absoluteUrl, OG_LOCALE, SITE_URL } from '@/lib/seo';
import LandingHomeClient from '@/components/landing/LandingHomeClient';

export const metadata: Metadata = {
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    url: absoluteUrl('/'),
    locale: OG_LOCALE,
  },
};

export default function HomePage() {
  return <LandingHomeClient />;
}
