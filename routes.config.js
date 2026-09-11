// @ts-check

export const SITE_ORIGIN = 'https://deepiq.lk';

/**
 * @typedef {'home' | 'cloudmon' | 'miphi'} ViewName
 * @typedef {{
 *   path: string;
 *   view: ViewName;
 *   anchor?: string;
 *   title: string;
 *   description: string;
 *   priority: number;
 * }} AppRoute
 */

/** @type {readonly AppRoute[]} */
export const APP_ROUTES = Object.freeze([
  {
    path: '/',
    view: 'home',
    title: 'DeepIQ | AI, Data & Digital Systems',
    description: 'DeepIQ turns complex data into clear, intelligent business outcomes.',
    priority: 1,
  },
  {
    path: '/story',
    view: 'home',
    anchor: 'story',
    title: 'Our Story | DeepIQ',
    description:
      'Discover how DeepIQ connects global technology, local innovation and AI expertise in Sri Lanka.',
    priority: 0.8,
  },
  {
    path: '/solutions',
    view: 'home',
    anchor: 'solutions',
    title: 'Technology Solutions | DeepIQ',
    description:
      'Explore DeepIQ solutions across observability, enterprise storage, AI and cyber resilience.',
    priority: 0.9,
  },
  {
    path: '/services',
    view: 'home',
    anchor: 'services',
    title: 'Technology Services | DeepIQ',
    description: 'DeepIQ helps organisations discover, design, build and evolve intelligent digital systems.',
    priority: 0.8,
  },
  {
    path: '/contact',
    view: 'home',
    anchor: 'contact',
    title: 'Contact DeepIQ',
    description: 'Talk to DeepIQ about AI, data, infrastructure, observability and digital transformation.',
    priority: 0.9,
  },
  {
    path: '/cloudmon',
    view: 'cloudmon',
    title: 'Cloudmon Unified Observability | DeepIQ',
    description:
      'Cloudmon unified observability from DeepIQ connects infrastructure, cloud, applications, networks and edge systems.',
    priority: 0.9,
  },
  {
    path: '/cloudmon/why',
    view: 'cloudmon',
    anchor: 'why',
    title: 'Why Cloudmon Observability | DeepIQ',
    description:
      'See how Cloudmon turns monitoring signals into context, root-cause insight and intelligent action.',
    priority: 0.7,
  },
  {
    path: '/cloudmon/coverage',
    view: 'cloudmon',
    anchor: 'coverage',
    title: 'Cloudmon Coverage | DeepIQ',
    description:
      'Explore Cloudmon coverage across data centres, SD-WAN, cloud, applications, OT, IoT and AI infrastructure.',
    priority: 0.8,
  },
  {
    path: '/cloudmon/outcomes',
    view: 'cloudmon',
    anchor: 'outcomes',
    title: 'Cloudmon Outcomes | DeepIQ',
    description:
      'Reduce complexity, respond faster and improve resilience with Cloudmon unified observability.',
    priority: 0.7,
  },
  {
    path: '/cloudmon/deepiq-advantage',
    view: 'cloudmon',
    anchor: 'deepiq-advantage',
    title: 'The DeepIQ Cloudmon Advantage',
    description:
      'Work with DeepIQ for Cloudmon demonstrations, proofs of concept, deployment and ongoing regional support.',
    priority: 0.7,
  },
  {
    path: '/miphi',
    view: 'miphi',
    title: 'MiPhi Enterprise Storage | DeepIQ',
    description:
      'MiPhi enterprise storage from DeepIQ powers AI, cloud, data centres and demanding business workloads.',
    priority: 0.9,
  },
  {
    path: '/miphi/foundation',
    view: 'miphi',
    anchor: 'foundation',
    title: 'MiPhi Data Foundation | DeepIQ',
    description:
      'Discover the enterprise storage foundation behind modern AI, cloud and high-performance applications.',
    priority: 0.7,
  },
  {
    path: '/miphi/workloads',
    view: 'miphi',
    anchor: 'workloads',
    title: 'MiPhi Storage Workloads | DeepIQ',
    description:
      'Explore MiPhi storage for AI, cloud computing, enterprise applications, data centres and HPC.',
    priority: 0.8,
  },
  {
    path: '/miphi/engineering',
    view: 'miphi',
    anchor: 'engineering',
    title: 'MiPhi Storage Engineering | DeepIQ',
    description: 'MiPhi enterprise SSDs are engineered for performance, endurance, capacity and reliability.',
    priority: 0.7,
  },
  {
    path: '/miphi/sri-lanka',
    view: 'miphi',
    anchor: 'sri-lanka',
    title: 'MiPhi in Sri Lanka | DeepIQ',
    description: 'Access MiPhi enterprise storage in Sri Lanka through authorised local agent DeepIQ.',
    priority: 0.8,
  },
]);

export const ROUTE_ALIASES = Object.freeze({
  '/index.html': '/',
  '/cloudmon.html': '/cloudmon',
  '/cloudmon/index.html': '/cloudmon',
  '/miphi.html': '/miphi',
  '/miphi/index.html': '/miphi',
});

export const APP_ROUTE_PATHS = Object.freeze(APP_ROUTES.map(({ path }) => path));
export const ROUTES_BY_PATH = new Map(APP_ROUTES.map((route) => [route.path, route]));
