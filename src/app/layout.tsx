import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import StructuredData from "@/components/StructuredData";
import GoogleAnalytics from "@/components/GoogleAnalytics";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://marche241.ga'),
  title: {
    default: "Marché241 - Votre boutique en ligne au Gabon",
    template: "%s | Marché241"
  },
  icons: {
    icon: "/marche241_Web_without_text-01-01.svg",
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
    siteName: "Marché241",
    title: "Marché241 - Créez votre boutique en ligne au Gabon",
    description: "Plateforme de commerce en ligne pour les commerçants gabonais. Créez, gérez et développez votre boutique facilement.",
    images: [
      {
        url: "/marche241_Web_without_text-01-01.svg",
        width: 1200,
        height: 630,
        alt: "Marché241 - Boutique en ligne",
      }
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Marché241 - Créez votre boutique en ligne au Gabon",
    description: "Plateforme de commerce en ligne pour les commerçants gabonais. Créez, gérez et développez votre boutique facilement.",
    images: ["/marche241_Web_without_text-01-01.svg"],
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
  alternates: {
    canonical: "https://marche241.ga",
  },
  category: "E-commerce",
  classification: "Business",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <head>
        <StructuredData />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <GoogleAnalytics />
        {children}
      </body>
    </html>
  );
}
