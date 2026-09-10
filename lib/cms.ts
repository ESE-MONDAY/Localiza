import { SupportedLocale } from './types';

export interface BlogPost {
  slug: string;
  publishedAt: string;
  author: string;
  title: Record<SupportedLocale, string>;
  summary: Record<SupportedLocale, string>;
  body: Record<SupportedLocale, string>;
}

export interface LocalizedBlogPost {
  slug: string;
  publishedAt: string;
  author: string;
  title: string;
  summary: string;
  body: string;
}

const POSTS_DATABASE: BlogPost[] = [
  {
    slug: 'zero-cls-edge-monetization',
    publishedAt: '2026-03-15',
    author: 'Platform Architecture Team',
    title: {
      en: 'Architecting Zero-CLS Edge Paywalls with Next.js 16 and RSC',
      es: 'Arquitectura de Paywalls en el Edge con Cero CLS usando Next.js 16 y RSC',
      de: 'Architektur von Zero-CLS Edge-Paywalls mit Next.js 16 und RSC',
      fr: 'Architecture de Paywalls à l’Edge Sans CLS avec Next.js 16 et RSC',
    },
    summary: {
      en: 'How we eliminate Cumulative Layout Shift by resolving deterministic cohorts at the V8 edge gateway.',
      es: 'Cómo eliminamos el Cumulative Layout Shift resolviendo cohortes deterministas en la puerta de enlace V8.',
      de: 'Wie wir Cumulative Layout Shift durch deterministisches Cohort-Hashing am V8-Edge-Gateway eliminieren.',
      fr: 'Comment nous éliminons le Cumulative Layout Shift en résolvant des cohortes déterministes à l’edge V8.',
    },
    body: {
      en: 'By computing cryptographic HMAC user cookies and running FNV-1a hashing directly in the edge middleware, initial HTML is injected with the exact variant and converted regional currency before the browser paint cycle begins.',
      es: 'Al calcular cookies de usuario HMAC criptográficas y ejecutar el hashing FNV-1a en el middleware del edge, el HTML inicial se inyecta con la variante exacta y la divisa convertida antes del primer pintado.',
      de: 'Durch die Berechnung kryptografischer HMAC-Benutzer-Cookies und das Ausführen von FNV-1a-Hashing direkt in der Edge-Middleware wird das anfängliche HTML vor Beginn des Browser-Paint-Zyklus mit der exakten Variante gerendert.',
      fr: 'En calculant des cookies HMAC cryptographiques et en exécutant le hachage FNV-1a directement dans le middleware edge, le HTML initial est injecté avec la variante exacte avant le début du cycle de rendu.',
    },
  },
  {
    slug: 'micro-frontier-hybrid-routing',
    publishedAt: '2026-04-02',
    author: 'Growth Engineering',
    title: {
      en: 'The Micro-Frontier: Bridging Pages and App Routers in Production',
      es: 'La Micro-Frontera: Uniendo Pages y App Routers en Producción',
      de: 'Die Micro-Frontier: Verknüpfung von Pages- und App-Routern in Produktion',
      fr: 'La Micro-Frontière : Relier Pages et App Routers en Production',
    },
    summary: {
      en: 'Overcoming React hydration drift and session synchronization across hybrid Next.js architectures.',
      es: 'Superando los desfases de hidratación de React y la sincronización de sesiones en arquitecturas híbridas.',
      de: 'Überwindung von React Hydration Drift und Sitzungssynchronisation in hybriden Architekturen.',
      fr: 'Surmonter les dérives d’hydratation React et la synchronisation de session à travers des architectures hybrides.',
    },
    body: {
      en: 'A hybrid migration avoids the risks of all-at-once rewrites. By using a shared-state cookie bus and router-aware orchestration links, teams can keep legacy marketing SSG pages intact while scaling React 19 RSC growth suites.',
      es: 'Una migración híbrida evita los riesgos de las reescrituras totales. Al utilizar un bus de estado en cookies y enlaces conscientes del enrutador, los equipos mantienen páginas SSG heredadas mientras escalan con RSC.',
      de: 'Eine hybride Migration vermeidet Risiken großer Rewrites. Durch Shared-State-Cookies und Router-Links können Teams Legacy-SSG-Seiten intakt halten und gleichzeitig React 19 RSC skalieren.',
      fr: 'Une migration hybride évite les risques d’une réécriture complète. Grâce à un bus d’état par cookie et des liens orchestrés, les équipes préservent les pages SSG tout en déployant React 19 RSC.',
    },
  },
];

export async function getPostBySlug(
  slug: string,
  locale: SupportedLocale
): Promise<LocalizedBlogPost | null> {
  const post = POSTS_DATABASE.find((p) => p.slug === slug);
  if (!post) return null;

  return {
    slug: post.slug,
    publishedAt: post.publishedAt,
    author: post.author,
    title: post.title[locale] || post.title.en,
    summary: post.summary[locale] || post.summary.en,
    body: post.body[locale] || post.body.en,
  };
}

export async function getAllPosts(locale: SupportedLocale): Promise<LocalizedBlogPost[]> {
  return POSTS_DATABASE.map((post) => ({
    slug: post.slug,
    publishedAt: post.publishedAt,
    author: post.author,
    title: post.title[locale] || post.title.en,
    summary: post.summary[locale] || post.summary.en,
    body: post.body[locale] || post.body.en,
  }));
}

export async function getAllPostSlugs(): Promise<string[]> {
  return POSTS_DATABASE.map((p) => p.slug);
}

// Unified CMS export interface
export const cms = {
  getPost: getPostBySlug,
  getAllPosts,
  getAllSlugs: getAllPostSlugs,
};