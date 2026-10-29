import { site, formatAddress } from '../data/site';

const TITLE_SUFFIX = `${site.name} | Loja de Tecidos em Ribeirão Preto`;

/** Monta o título da página: "Título da página | Rosolen Textil". */
export function pageTitle(title?: string): string {
  if (!title) return TITLE_SUFFIX;
  if (title.endsWith(site.name)) return title;
  return `${title} | ${site.name}`;
}

/** URL absoluta a partir de um caminho relativo. */
export function absUrl(path: string): string {
  return new URL(path, site.url).toString();
}

/** Garante barra final nas URLs internas (coerente com trailingSlash: 'always'). */
export function withSlash(path: string): string {
  if (path.endsWith('/')) return path;
  if (/\.[a-z0-9]+$/i.test(path)) return path; // arquivos (.xml, .jpg)
  return `${path}/`;
}

export interface BreadcrumbItem {
  name: string;
  href?: string;
}

/* ------------------------------------------------------------------ */
/* schema.org                                                          */
/* ------------------------------------------------------------------ */

export function organizationId(): string {
  return `${site.url}/#organization`;
}

/** LocalBusiness/Store com NAP, horário, geolocalização e redes sociais. */
export function localBusinessSchema() {
  const a = site.address;
  return {
    '@context': 'https://schema.org',
    '@type': ['Store', 'LocalBusiness'],
    '@id': organizationId(),
    name: site.name,
    legalName: site.legalName,
    description: site.description,
    url: site.url,
    telephone: site.phone,
    email: site.email,
    image: absUrl(site.defaultOgImage),
    logo: absUrl('/logo.svg'),
    priceRange: site.priceRange,
    foundingDate: String(site.foundingYear),
    currenciesAccepted: 'BRL',
    paymentAccepted: 'Dinheiro, Cartão de crédito, Cartão de débito, Pix',
    address: {
      '@type': 'PostalAddress',
      streetAddress: `${a.street}, ${a.number}${a.complement ? ` ${a.complement}` : ''}`,
      addressLocality: a.city,
      addressRegion: a.state,
      postalCode: a.postalCode,
      addressCountry: a.country,
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: site.geo.latitude,
      longitude: site.geo.longitude,
    },
    hasMap: site.mapsUrl,
    areaServed: [
      { '@type': 'City', name: 'Ribeirão Preto' },
      { '@type': 'State', name: 'São Paulo' },
    ],
    openingHoursSpecification: site.openingHours.map((h) => ({
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: h.days,
      opens: h.opens,
      closes: h.closes,
    })),
    sameAs: Object.values(site.social),
  };
}

export function websiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${site.url}/#website`,
    url: site.url,
    name: site.name,
    inLanguage: 'pt-BR',
    publisher: { '@id': organizationId() },
  };
}

export function breadcrumbSchema(items: BreadcrumbItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      ...(item.href ? { item: absUrl(withSlash(item.href)) } : {}),
    })),
  };
}

export function faqSchema(items: { question: string; answer: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((q) => ({
      '@type': 'Question',
      name: q.question,
      acceptedAnswer: { '@type': 'Answer', text: q.answer },
    })),
  };
}

export interface ProductSchemaInput {
  name: string;
  description: string;
  url: string;
  image?: string;
  category?: string;
  material?: string;
  width?: string;
  weight?: string;
}

/** Product sem preço: a loja vende por metro, com orçamento pelo WhatsApp. */
export function productSchema(p: ProductSchemaInput) {
  const additionalProperty = [
    p.width ? { '@type': 'PropertyValue', name: 'Largura', value: p.width } : null,
    p.weight ? { '@type': 'PropertyValue', name: 'Gramatura', value: p.weight } : null,
  ].filter(Boolean);
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: p.name,
    description: p.description,
    url: absUrl(withSlash(p.url)),
    ...(p.image ? { image: absUrl(p.image) } : {}),
    ...(p.category ? { category: p.category } : {}),
    ...(p.material ? { material: p.material } : {}),
    brand: { '@type': 'Brand', name: site.name },
    additionalProperty,
    offers: {
      '@type': 'Offer',
      availability: 'https://schema.org/InStoreOnly',
      priceCurrency: 'BRL',
      areaServed: 'Ribeirão Preto, SP',
      seller: { '@id': organizationId() },
    },
  };
}

export interface ArticleSchemaInput {
  headline: string;
  description: string;
  url: string;
  image?: string;
  datePublished: Date;
  dateModified?: Date;
}

export function articleSchema(a: ArticleSchemaInput) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: a.headline,
    description: a.description,
    url: absUrl(withSlash(a.url)),
    mainEntityOfPage: absUrl(withSlash(a.url)),
    ...(a.image ? { image: absUrl(a.image) } : {}),
    datePublished: a.datePublished.toISOString(),
    dateModified: (a.dateModified ?? a.datePublished).toISOString(),
    inLanguage: 'pt-BR',
    author: { '@id': organizationId() },
    publisher: { '@id': organizationId() },
  };
}

export function itemListSchema(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.name,
      url: absUrl(withSlash(it.url)),
    })),
  };
}

/** Formata data em português (ex.: 28 de outubro de 2026). */
export function formatDate(d: Date): string {
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'long', timeZone: 'UTC' }).format(d);
}

export { formatAddress };
