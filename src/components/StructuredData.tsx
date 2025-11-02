export default function StructuredData() {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Marché241',
    description: 'Plateforme de commerce en ligne pour les commerçants gabonais',
    url: 'https://marche241.ga',
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://marche241.ga/marche_241?q={search_term_string}',
      'query-input': 'required name=search_term_string',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Marché241',
      logo: {
        '@type': 'ImageObject',
        url: 'https://marche241.ga/marche241_Web_without_text-01-01.svg',
      },
    },
  };

  const organizationData = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Marché241',
    description: 'Plateforme de commerce en ligne pour les commerçants gabonais',
    url: 'https://marche241.ga',
    logo: 'https://marche241.ga/marche241_Web_without_text-01-01.svg',
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Customer Service',
      availableLanguage: ['French'],
    },
    areaServed: {
      '@type': 'Country',
      name: 'Gabon',
    },
    sameAs: [
      // Ajoutez vos réseaux sociaux ici
      // 'https://www.facebook.com/marche241',
      // 'https://twitter.com/marche241',
      // 'https://www.instagram.com/marche241',
    ],
  };

  const breadcrumbData = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Accueil',
        item: 'https://marche241.ga',
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

