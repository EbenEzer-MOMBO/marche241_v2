import { SITE_URL, SOCIAL_PROFILES } from '@/lib/seo';

export default function StructuredData() {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Marché241',
    description: 'Plateforme de commerce en ligne pour les commerçants gabonais',
    url: SITE_URL,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${SITE_URL}/affiche_boutiques?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Marché241',
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/marche241_Web_without_text-01-01.svg`,
      },
    },
  };

  const organizationData = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Marché241',
    description: 'Plateforme de commerce en ligne pour les commerçants gabonais',
    url: SITE_URL,
    logo: `${SITE_URL}/marche241_Web_without_text-01-01.svg`,
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Customer Service',
      availableLanguage: ['French'],
    },
    areaServed: {
      '@type': 'Country',
      name: 'Gabon',
    },
    sameAs: [...SOCIAL_PROFILES],
  };

  const breadcrumbData = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Accueil',
        item: SITE_URL,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbData) }}
      />
    </>
  );
}
