import { Metadata, Viewport } from 'next';

export const viewport: Viewport = {
  themeColor: '#ffffff',
  width: 'device-width',
  initialScale: 1,
};

export async function generateMetadata(): Promise<Metadata> {
  const { getAssetsMarque } = await import('@/lib/services/assets-marque');
  const assets = await getAssetsMarque();
  return {
  manifest: '/admin/manifest.json',
  title: 'Ma Boutique',
  description: 'Gérez votre boutique en ligne',
  robots: {
    index: false,
    follow: false,
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Marché241 Admin',
  },
  icons: {
    apple: [
      { url: assets.icone_app, sizes: '180x180', type: 'image/png' },
    ],
  },
  };
}

export default function AdminBoutiqueLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
