import type { Metadata } from 'next';
import { AvisInvitationClient } from '@/components/avis/AvisInvitationClient';

export const metadata: Metadata = {
  title: 'Donnez votre avis',
  description: 'Notez les articles de votre commande Marché 241.',
  robots: { index: false, follow: false },
  referrer: 'no-referrer',
};

export default async function AvisInvitationPage({ params }: { params: Promise<{ jeton: string }> }) {
  const { jeton } = await params;
  return <AvisInvitationClient jeton={jeton} />;
}
