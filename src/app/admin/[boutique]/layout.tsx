import { Metadata, Viewport } from 'next';

export const viewport: Viewport = {
  themeColor: '#ffffff',
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  manifest: '/admin/manifest.json',
  title: 'Ma Boutique',
  description: 'Gérez votre boutique en ligne',
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
