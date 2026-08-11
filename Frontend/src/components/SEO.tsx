import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const SITE_URL = 'https://we-4-climate.org';
const SITE_NAME = 'We4Climate';
const DEFAULT_IMAGE = `${SITE_URL}/logo.jpeg`;

type PageType = 'website' | 'ContactPage';

type PageSEO = {
  title: string;
  description: string;
  type?: PageType;
  image?: string;
};

const PUBLIC_PAGES: Record<string, PageSEO> = {
  '/': {
    title: 'Youth-Led Climate Action in Rwanda',
    description:
      'We4Climate is a youth-led organization in Rwanda advancing regenerative agriculture, ecosystem restoration, climate education, and resilient communities.',
  },
  '/about': {
    title: 'About We4Climate | Community Climate Action in Rwanda',
    description:
      'Learn how We4Climate empowers communities in Rwanda through restoration, environmental education, research, storytelling, and sustainable livelihoods.',
  },
  '/programs': {
    title: 'Climate & Regenerative Agriculture Programs | We4Climate',
    description:
      'Explore We4Climate programs in Rwanda, including regenerative agriculture, tree nurseries, rainwater harvesting, ecosystem restoration, Kids4Food, and community apiaries.',
  },
  '/impact': {
    title: 'Our Climate Impact in Rwanda | We4Climate',
    description:
      'See We4Climate results in landscape restoration, climate resilience, community empowerment, environmental education, and nature-based solutions across Rwanda.',
  },
  '/resources': {
    title: 'Climate Resources & Stories from Rwanda | We4Climate',
    description:
      'Read We4Climate stories and find practical resources on agroforestry, ecosystem restoration, climate action, and community-led sustainability in Rwanda.',
  },
  '/donate': {
    title: 'Support Climate Action in Rwanda | We4Climate',
    description:
      'Support We4Climate’s community-led work in regenerative agriculture, ecosystem restoration, climate education, and sustainable livelihoods in Rwanda.',
  },
  '/action': {
    title: 'Take Action for the Climate | We4Climate',
    description:
      'Make a climate pledge with We4Climate and join people across Rwanda taking practical action for trees, healthy ecosystems, and resilient communities.',
  },
  '/advocacy-passport': {
    title: 'Climate Advocacy Passport | We4Climate',
    description:
      'Test your climate knowledge, learn about environmental action in Rwanda, and earn a We4Climate digital advocacy certificate.',
  },
  '/opportunities': {
    title: 'Climate Jobs, Internships & Volunteering in Rwanda | We4Climate',
    description:
      'Find climate, conservation, environmental education, internship, and volunteering opportunities with We4Climate and its community partners in Rwanda.',
  },
  '/contact': {
    title: 'Contact We4Climate | Climate Action in Rwanda',
    description:
      'Contact We4Climate in Kigali, Rwanda about partnerships, environmental programs, volunteering, climate education, and community-led restoration.',
    type: 'ContactPage',
  },
  '/volunteer': {
    title: 'Volunteer with We4Climate | Climate Action in Rwanda',
    description:
      'Apply to volunteer with We4Climate on regenerative agriculture, agroforestry, environmental education, research, storytelling, and ecosystem restoration projects.',
  },
};

const SOCIAL_PROFILES = [
  'https://www.facebook.com/profile.php?id=100064125695533',
  'https://x.com/we4climate',
  'https://www.instagram.com/we4climate_/',
  'https://www.linkedin.com/company/108184046/',
];

function normalizePath(pathname: string) {
  if (pathname === '/') return pathname;
  return pathname.replace(/\/+$/, '') || '/';
}

function setMeta(attribute: 'name' | 'property', key: string, content: string) {
  let element = document.head.querySelector<HTMLMetaElement>(`meta[${attribute}="${key}"]`);
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attribute, key);
    element.dataset.seo = 'true';
    document.head.appendChild(element);
  }
  element.setAttribute('content', content);
}

function setCanonical(url: string) {
  let element = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!element) {
    element = document.createElement('link');
    element.rel = 'canonical';
    element.dataset.seo = 'true';
    document.head.appendChild(element);
  }
  element.href = url;
}

function setStructuredData(data: Record<string, unknown>) {
  let element = document.head.querySelector<HTMLScriptElement>('script[data-seo-jsonld]');
  if (!element) {
    element = document.createElement('script');
    element.type = 'application/ld+json';
    element.dataset.seoJsonld = 'true';
    document.head.appendChild(element);
  }
  element.textContent = JSON.stringify(data);
}

function buildStructuredData(path: string, page: PageSEO, canonicalUrl: string) {
  const organization = {
    '@type': 'NGO',
    '@id': `${SITE_URL}/#organization`,
    name: SITE_NAME,
    alternateName: 'We 4 Climate',
    url: SITE_URL,
    logo: DEFAULT_IMAGE,
    email: 'info@we4climate.org',
    telephone: '+250 787 712 266',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'KK 508 St',
      addressLocality: 'Kicukiro, Kigali',
      addressCountry: 'RW',
    },
    areaServed: {
      '@type': 'Country',
      name: 'Rwanda',
    },
    sameAs: SOCIAL_PROFILES,
  };

  const graph: Record<string, unknown>[] = [organization];
  graph.push({
    '@type': page.type ?? 'WebPage',
    '@id': `${canonicalUrl}#webpage`,
    url: canonicalUrl,
    name: page.title,
    description: page.description,
    isPartOf: { '@id': `${SITE_URL}/#website` },
    about: { '@id': `${SITE_URL}/#organization` },
  });

  if (path !== '/') {
    graph.push({
      '@type': 'BreadcrumbList',
      '@id': `${canonicalUrl}#breadcrumb`,
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
        {
          '@type': 'ListItem',
          position: 2,
          name: page.title.split(' | ')[0],
          item: canonicalUrl,
        },
      ],
    });
  }

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': `${SITE_URL}/#website`,
        url: SITE_URL,
        name: SITE_NAME,
        publisher: { '@id': `${SITE_URL}/#organization` },
        inLanguage: 'en',
      },
      ...graph,
    ],
  };
}

export default function SEO() {
  const { pathname } = useLocation();

  useEffect(() => {
    const path = normalizePath(pathname);
    const isAdmin = path === '/admin' || path.startsWith('/admin/');
    const page = PUBLIC_PAGES[path];
    const isNotFound = !page && !isAdmin;
    const currentPage: PageSEO = page ?? {
      title: isNotFound ? 'Page Not Found | We4Climate' : 'Admin | We4Climate',
      description: 'We4Climate — community-led climate action and ecosystem restoration in Rwanda.',
    };
    const canonicalUrl = `${SITE_URL}${path === '/' ? '/' : path}`;
    const shouldIndex = Boolean(page) && !isAdmin;

    document.title = `${currentPage.title}${path === '/' ? ' | We4Climate' : ''}`;
    setMeta('name', 'description', currentPage.description);
    setMeta('name', 'robots', shouldIndex ? 'index, follow' : 'noindex, nofollow');
    setMeta('name', 'googlebot', shouldIndex ? 'index, follow' : 'noindex, nofollow');
    setMeta('property', 'og:title', currentPage.title);
    setMeta('property', 'og:description', currentPage.description);
    setMeta('property', 'og:type', 'website');
    setMeta('property', 'og:url', canonicalUrl);
    setMeta('property', 'og:site_name', SITE_NAME);
    setMeta('property', 'og:image', currentPage.image ?? DEFAULT_IMAGE);
    setMeta('property', 'og:image:alt', 'We4Climate logo');
    setMeta('name', 'twitter:card', 'summary_large_image');
    setMeta('name', 'twitter:title', currentPage.title);
    setMeta('name', 'twitter:description', currentPage.description);
    setMeta('name', 'twitter:image', currentPage.image ?? DEFAULT_IMAGE);
    setCanonical(canonicalUrl);

    setStructuredData(
      shouldIndex
        ? buildStructuredData(path, currentPage, canonicalUrl)
        : { '@context': 'https://schema.org', '@graph': [] },
    );
  }, [pathname]);

  return null;
}
