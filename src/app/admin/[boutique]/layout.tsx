import { Metadata } from 'next';

export const metadata: Metadata = {
  manifest: '/admin/manifest.json',
  title: 'Ma Boutique',
  description: 'Gérez votre boutique en ligne',
  themeColor: '#000000',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Marché241 Admin',
  },
};

export default function AdminBoutiqueLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
