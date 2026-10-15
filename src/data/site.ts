// Single source of truth for the business's identity, contact details, and
// service area.
//
// Page copy, the header/footer, and the JSON-LD structured data all read from
// here so the NAP (name / address / phone) that Google sees is byte-identical
// everywhere on the site. Inconsistent NAP across a site is one of the most
// common reasons a local business under-ranks for its own region.

/** Canonical origin. No trailing slash — helpers below append the path. */
export const SITE_URL = 'https://frontiermfg.ca';

/** Absolute URL for a site-root-relative path, for canonicals and JSON-LD @ids. */
export const abs = (path: string) => new URL(path, SITE_URL).href;

export const business = {
  name: 'Frontier MFG',
  legalName: 'Frontier Manufacturing Services',
  email: 'info@frontiermfg.ca',

  // Publish a phone number by filling this in — it then appears automatically in
  // the contact section, the footer, and the LocalBusiness structured data.
  // Leave it as '' and every one of those places simply omits it.
  // Use the public display format, e.g. '(604) 555-0142'.
  phone: '(778) 839-3358',

  // Where the business is based. Local search ranks a service business against a
  // specific city, not a region, so this stays a single municipality; the wider
  // area it covers is `serviceArea` below.
  locality: 'Surrey',
  region: 'BC',
  regionName: 'British Columbia',
  country: 'CA',

  // Rough centroid of the service area (Surrey, BC). Used by the `geo` property
  // of the LocalBusiness schema to place the business on the map.
  latitude: 49.1913,
  longitude: -122.8490,

  // Optional extras. Each is omitted from the structured data while it is ''.
  // Fill them in only with real values — a wrong hours or price signal in
  // schema is worse than no signal at all.
  priceRange: '',   // e.g. '$$'
  foundingYear: '', // e.g. '2019'
} as const;

/** `tel:` href for the phone number above, digits only. Empty when unset. */
export const telHref = business.phone ? `tel:+1${business.phone.replace(/\D/g, '')}` : '';

/**
 * Municipalities the business serves, grouped the way people in the region
 * actually refer to them.
 *
 * This one list feeds two things: the `areaServed` array in the LocalBusiness
 * schema, and the visible service-area section on the home page. A crawler and
 * a human reading the same list is exactly the point — it earns regional
 * coverage without a thin landing page per city.
 */
export const serviceAreaGroups = [
  { label: 'South of the Fraser', cities: ['Surrey', 'Delta', 'Langley', 'White Rock'] },
  { label: 'Fraser Valley', cities: ['Abbotsford', 'Mission', 'Chilliwack'] },
  { label: 'Tri-Cities & Ridge Meadows', cities: ['Coquitlam', 'Port Coquitlam', 'Port Moody', 'Maple Ridge', 'Pitt Meadows'] },
  { label: 'Metro Vancouver', cities: ['Vancouver', 'Burnaby', 'Richmond', 'New Westminster', 'North Vancouver'] },
] as const;

/** Flat list of every municipality above, for the structured data. */
export const serviceArea = serviceAreaGroups.flatMap((g) => g.cities);

/** Short form for meta descriptions and title tags, where space is tight. */
export const areaShort = 'Vancouver & the Lower Mainland';

/**
 * The four services, in the order they appear on the home page tiles and the
 * Services page. `id` is the anchor on /services (e.g. /services#assessment).
 * The Services page carries the long-form copy; `summary` is the one-liner
 * used on the home page tiles. `title` also feeds the schema's offer catalog.
 * Each service's icon is set in src/components/ServiceIcon.astro.
 */
export const services = [
  {
    id: 'assessment',
    title: 'Productivity Assessment',
    summary: 'A short on-site audit that ends with a savings and payback estimate.',
  },
  {
    id: 'robot-cells',
    title: 'Cobot and robot cells',
    summary: 'Machine tending, pick-and-place, and repetitive manual stations.',
  },
  {
    id: 'controls-retrofits',
    title: 'Controls retrofits',
    summary: 'New controls for older machines that are still mechanically sound.',
  },
  {
    id: 'machine-monitoring',
    title: 'Machine monitoring',
    summary: 'Running numbers on when each machine runs, stops, and makes parts.',
    inDevelopment: true,
  },
] as const;

/** Canonical service names for the schema's `hasOfferCatalog`. */
export const serviceNames = services.map((s) => s.title);

/**
 * Options in the contact form's "Service of interest" dropdown. The first one
 * is selected by default.
 *
 * Each option's text is sent as the `service` field: it becomes the email
 * subject and the Notion `Service` multi-select value. A new value creates a
 * new Notion option automatically, so editing this list is safe.
 */
export const serviceOptions = [
  'Productivity Assessment',
  'Cobot or robot cell',
  'Controls retrofit',
  'Machine monitoring',
  'Not sure yet',
] as const;

/** Topics the business is credible on — feeds `knowsAbout` in the schema. */
export const knowsAbout = [
  'Industrial automation',
  'Collaborative robots (cobots)',
  'Robot cell integration',
  'Machine tending',
  'Controls retrofits',
  'PLC programming',
  'Overall Equipment Effectiveness (OEE)',
  'Time studies',
  'Manufacturing productivity',
  'Machine monitoring',
  'Welding and fabrication',
  'Millwrighting',
] as const;
