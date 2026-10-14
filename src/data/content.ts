// Collection queries shared by pages, the header, and the sitemap.
import { getCollection, type CollectionEntry } from 'astro:content';

type Draftable = { data: { draft: boolean } };

/** Published entries only. Used wherever a draft must never leak (the sitemap). */
export const isPublished = ({ data }: Draftable) => !data.draft;

/** What pages render: drafts too under `astro dev`, so they can be previewed. */
const isVisible = (entry: Draftable) => import.meta.env.DEV || isPublished(entry);

const newestFirst = <T extends { data: { pubDate: Date } }>(a: T, b: T) =>
  b.data.pubDate.valueOf() - a.data.pubDate.valueOf();

export const learnCategories = [
  { id: 'benefits', label: 'Benefits', blurb: 'What automation can do for a shop your size.' },
  { id: 'methods', label: 'Methods', blurb: 'How to measure and check the numbers before you spend.' },
] as const;

export const getLearnArticles = async (): Promise<CollectionEntry<'learn'>[]> =>
  (await getCollection('learn', isVisible)).sort(newestFirst);

const loadCaseStudies = async (): Promise<CollectionEntry<'case-studies'>[]> =>
  (await getCollection('case-studies', isVisible)).sort(newestFirst);

// Every page's header asks for case studies, and getCollection logs a warning
// on each call while the collection is empty. Cache for the build so it logs
// once; dev skips the cache so new files show up straight away.
let caseStudiesCache: ReturnType<typeof loadCaseStudies> | undefined;
export const getCaseStudies = () =>
  import.meta.env.DEV ? loadCaseStudies() : (caseStudiesCache ??= loadCaseStudies());
