import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import StructuredData from "@/components/StructuredData";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import { AssetsMarqueProvider } from "@/components/AssetsMarqueProvider";
import { getAssetsMarque } from "@/lib/services/assets-marque";
import { PARTAGE_SITE } from "@/lib/seo";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: '#ffffff',
  width: 'device-width',
  initialScale: 1,
};

export async function generateMetadata(): Promise<Metadata> {
  const assets = await getAssetsMarque();
  return {
  metadataBase: new URL('https://marche241.ga'),
  title: {
    default: "Marché241 - Votre boutique en ligne au Gabon",
    template: "%s | Marché241"
  },
  icons: {
    icon: assets.favicon,
    apple: [
      { url: assets.icone_app, sizes: '180x180', type: 'image/png' },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Marché241',
  },
  description: "Marché241 est la plateforme de commerce en ligne pour les commerçants gabonais. Créez votre boutique, vendez vos produits et recevez vos paiements via Mobile Money. Simple, rapide et efficace.",
  keywords: [
    "boutique en ligne Gabon",
    "e-commerce Gabon",
    "vente en ligne Libreville",
    "commerce électronique Gabon",
    "marketplace Gabon",
    "Marché241",
    "boutique gabonaise",
    "mobile money Gabon",
    "Airtel Money",
    "Moov Money",
    "vendeur en ligne",
    "créer boutique en ligne",
    "plateforme e-commerce Afrique"
  ],
  authors: [{ name: "Marché241" }],
  creator: "Marché241",
  publisher: "Marché241",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "fr_GA",
    url: "https://marche241.ga",
    siteName: PARTAGE_SITE.siteName,
    title: PARTAGE_SITE.title,
    description: PARTAGE_SITE.description,
    images: [
      {
        url: assets.image_partage,
        width: 1200,
        height: 630,
        alt: PARTAGE_SITE.imageAlt,
      }
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: PARTAGE_SITE.title,
    description: PARTAGE_SITE.description,
    images: [assets.image_partage],
    creator: "@marche241",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: "yZvhvdtxhMYsvL0wzq875n2A6JRylIAtBwf9YP9seJU",
    // yandex: "votre-code-yandex",
    // bing: "votre-code-bing",
  },
  // Canonical défini par page (accueil, boutique, produit…) — pas de valeur globale héritée
  category: "E-commerce",
  classification: "Business",
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const assets = await getAssetsMarque();
  return (
    <html lang="fr">
      <head>
        <StructuredData logo={assets.logo_icone} />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <GoogleAnalytics />
        <AssetsMarqueProvider assets={assets}>{children}</AssetsMarqueProvider>
      </body>
    </html>
  );
}
