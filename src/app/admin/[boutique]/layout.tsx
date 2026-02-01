import { Metadata } from 'next';

export const metadata: Metadata = {
  manifest: '/admin/manifest.json',
  title: 'Ma Boutique',
  description: 'Gérez votre boutique en ligne',
  themeColor: '#ffffff',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Marché241 Admin',
  },
  icons: {
    apple: [
      { url: '/site-logo.png', sizes: '180x180', type: 'image/png' },
    ],
  },
};

export default function AdminBoutiqueLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
