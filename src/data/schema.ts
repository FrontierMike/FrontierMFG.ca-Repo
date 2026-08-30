// JSON-LD structured data.
//
// Search engines read this to understand *what* the business is, *where* it
// operates, and *what* it sells. For a service-area business the important
// pieces are the `ProfessionalService` node (a LocalBusiness subtype) and its
// `areaServed` list — that pairing is what makes the site eligible to rank for
// "<service> near me" and "<service> <city>" searches across the region without
// needing a separate landing page per city.
//
// Every node is given a stable `@id` so the graph can cross-reference itself
// instead of repeating the business details on each page.

import { SITE_URL, abs, business, serviceArea, serviceNames, knowsAbout } from './site';

export const ORG_ID = `${SITE_URL}/#organization`;
export const SITE_ID = `${SITE_URL}/#website`;

/** Drops keys whose value is '', null, undefined, or an empty array. */
const compact = <T extends Record<string, unknown>>(obj: T) =>
  Object.fromEntries(
    Object.entries(obj).filter(
      ([, v]) => v !== '' && v !== null && v !== undefined && !(Array.isArray(v) && v.length === 0)
    )
  );

const people = {
  mike: {
    '@type': 'Person',
    '@id': `${SITE_URL}/#mike-wait`,
    name: 'Mike Wait',
    jobTitle: 'Founder & Principal Consultant',
    description:
      'Mechanical engineer (EIT) with a B.Eng from BCIT and 20 years of hands-on manufacturing experience in automated machinery design, robotics, production commissioning, and CNC machining.',
    alumniOf: { '@type': 'CollegeOrUniversity', name: 'British Columbia Institute of Technology' },
    worksFor: { '@id': ORG_ID },
  },
  gord: {
    '@type': 'Person',
    '@id': `${SITE_URL}/#gord-wait`,
    name: 'Gord Wait',
    jobTitle: 'Advisor & Product Design Expert',
    description:
      'Senior software and hardware engineer with four decades of experience in industrial systems, embedded development, and technology leadership.',
    worksFor: { '@id': ORG_ID },
  },
};

/**
 * The business itself. `ProfessionalService` is a LocalBusiness subtype, which
 * is what makes the local signals (address, geo, areaServed) count.
 *
 * There is deliberately no `streetAddress`: this is a service-area business
 * that visits client sites rather than receiving walk-ins, and publishing a
 * street address it doesn't operate from would be a worse signal than none.
 */
export const organizationNode = () =>
  compact({
    '@type': ['ProfessionalService', 'Organization'],
    '@id': ORG_ID,
    name: business.name,
    legalName: business.legalName,
    url: SITE_URL,
    email: business.email,
    telephone: business.phone,
    foundingDate: business.foundingYear,
    priceRange: business.priceRange,
    logo: { '@type': 'ImageObject', url: abs('/favicon.svg') },
    image: abs('/og-image.png'),
    description:
      `Automation and manufacturing consulting for small and mid-size manufacturers in ${business.locality} and across the Lower Mainland of British Columbia — process automation, PLC/SCADA programming, controls design, and real-time KPI tracking.`,

    // Where the business is based. One city, deliberately: local search ranks a
    // business against a specific municipality.
    address: {
      '@type': 'PostalAddress',
      addressLocality: business.locality,
      addressRegion: business.region,
      addressCountry: business.country,
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: business.latitude,
      longitude: business.longitude,
    },

    // Where it will travel to. This is the list that earns regional coverage.
    areaServed: serviceArea.map((city) => ({
      '@type': 'City',
      name: city,
      containedInPlace: {
        '@type': 'AdministrativeArea',
        name: business.regionName,
        containedInPlace: { '@type': 'Country', name: 'Canada' },
      },
    })),
    // A radius around the base, for engines that prefer a geometric definition.
    serviceArea: {
      '@type': 'GeoCircle',
      geoMidpoint: {
        '@type': 'GeoCoordinates',
        latitude: business.latitude,
        longitude: business.longitude,
      },
      geoRadius: '100000', // metres — covers Metro Vancouver and the Fraser Valley
    },

    knowsAbout: [...knowsAbout],
    founder: { '@id': people.mike['@id'] },
    employee: [{ '@id': people.mike['@id'] }, { '@id': people.gord['@id'] }],
    contactPoint: compact({
      '@type': 'ContactPoint',
      contactType: 'sales',
      email: business.email,
      telephone: business.phone,
      areaServed: 'CA',
      availableLanguage: 'English',
    }),

    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Manufacturing consulting services',
      itemListElement: serviceNames.map((name) => ({
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name,
          provider: { '@id': ORG_ID },
          areaServed: serviceArea.map((city) => ({ '@type': 'City', name: city })),
        },
      })),
    },
  });

export const peopleNodes = () => [people.mike, people.gord];

export const websiteNode = () => ({
  '@type': 'WebSite',
  '@id': SITE_ID,
  url: SITE_URL,
  name: business.name,
  publisher: { '@id': ORG_ID },
  inLanguage: 'en-CA',
});

export const webPageNode = (url: string, title: string, description: string) => ({
  '@type': 'WebPage',
  '@id': `${url}#webpage`,
  url,
  name: title,
  description,
  isPartOf: { '@id': SITE_ID },
  about: { '@id': ORG_ID },
  inLanguage: 'en-CA',
});

/** Breadcrumb trail. Pass [['Home', '/'], ['Services', '/services']]. */
export const breadcrumbNode = (trail: [string, string][]) => ({
  '@type': 'BreadcrumbList',
  itemListElement: trail.map(([name, path], i) => ({
    '@type': 'ListItem',
    position: i + 1,
    name,
    item: abs(path),
  })),
});

/**
 * FAQ rich-result markup. Only ever call this with questions and answers that
 * are actually rendered on the page — Google treats hidden FAQ markup as a
 * structured-data violation.
 */
export const faqNode = (faqs: readonly { q: string; a: string }[]) => ({
  '@type': 'FAQPage',
  mainEntity: faqs.map((f) => ({
    '@type': 'Question',
    name: f.q,
    acceptedAnswer: { '@type': 'Answer', text: f.a },
  })),
});

/**
 * Serializes a graph for a <script type="application/ld+json"> tag. The `<`
 * escape stops any future copy containing "</script>" from closing the tag
 * early.
 */
export const ldJson = (nodes: unknown[]) =>
  JSON.stringify({ '@context': 'https://schema.org', '@graph': nodes }).replace(/</g, '\\u003c');
