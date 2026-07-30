import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Confirmation de commande',
  description: 'Votre commande a été confirmée',
  robots: {
    index: false,
    follow: false,
  },
};

export default function ConfirmationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
