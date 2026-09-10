import { notFound } from 'next/navigation';
import { headers } from 'next/headers';
import { isSupportedLocale, SupportedLocale } from '@/lib/types';
import {
  CohortVariant,
  CurrencyCode,
  CURRENCY_RATES,
  GEO_CURRENCY_MAP,
} from '@/lib/experiment-config';
import { PaywallTrigger } from './components/PaywallTrigger';
import { PricingImpressionTracker } from './components/PricingImpressionTracker';
import { CrossRouterNav } from '@/components/CrossRouterNav';
import fs from 'fs';
import path from 'path';

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

interface BaseTier {
  id: string;
  name: string;
  usdBase: number;
  highlight?: boolean;
  features: string[];
}

const TIERS: BaseTier[] = [
  {
    id: 'starter',
    name: 'Starter Gateway',
    usdBase: 29,
    features: ['V8 Edge Execution', 'Basic i18n Routing', 'Single-region cache'],
  },
  {
    id: 'growth',
    name: 'Growth Scale',
    usdBase: 79,
    highlight: true,
    features: [
      'Deterministic Cohort Hashing',
      'Multi-CDN Header Normalization',
      'HMAC Tamper-Proof Sessions',
      'Zero-CLS Edge Inlining',
    ],
  },
  {
    id: 'enterprise',
    name: 'Enterprise Frontier',
    usdBase: 199,
    features: [
      'Dedicated Edge PoP Tag Purging',
      'Streaming Suspense Skeletons',
      'Non-blocking Beacon Telemetry',
      '24/7 SLA & Custom Proxies',
    ],
  },
];

const LOCALE_COUNTRY_DEFAULTS: Record<SupportedLocale, string> = {
  en: 'US',
  de: 'DE',
  fr: 'FR',
  es: 'ES',
};

export default async function PricingPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const search = await searchParams;

  if (!isSupportedLocale(locale)) {
    notFound();
  }

  const headerList = await headers();
  const userId = headerList.get('x-edge-uid') || 'usr_anonymous';

  const isCdnEdge = Boolean(
    headerList.get('x-vercel-ip-country') ||
    headerList.get('cf-ipcountry') ||
    headerList.get('x-real-ip-country')
  );

  // 1. Resolve Country
  const queryCountry = typeof search.country === 'string' ? search.country.toUpperCase() : null;
  const headerCountry = headerList.get('x-edge-country');
  const country =
    queryCountry ||
    (isCdnEdge && headerCountry ? headerCountry : LOCALE_COUNTRY_DEFAULTS[locale]);

  // 2. Resolve Currency
  const queryCurrency =
    typeof search.currency === 'string'
      ? (search.currency.toUpperCase() as CurrencyCode)
      : null;
  const headerCurrency = headerList.get('x-edge-currency') as CurrencyCode | null;
  const currency: CurrencyCode =
    queryCurrency ||
    GEO_CURRENCY_MAP[country] ||
    headerCurrency ||
    'USD';

  // 3. Resolve Cohort
  const queryCohort = typeof search.cohort === 'string' ? (search.cohort as CohortVariant) : null;
  const headerCohort = headerList.get('x-edge-cohort') as CohortVariant | null;
  const cohort: CohortVariant = queryCohort || headerCohort || 'control';

  const { symbol, rate } = CURRENCY_RATES[currency] || CURRENCY_RATES.USD;

  // Load translations safely
  const filePath = path.join(process.cwd(), 'messages', locale, 'pricing.json');
  const dict = JSON.parse(fs.readFileSync(filePath, 'utf8')).Pricing;

  return (
    <div className="max-w-6xl mx-auto p-8 space-y-8 font-sans">
      {/* Non-blocking background telemetry impression beacon */}
      <PricingImpressionTracker
        userId={userId}
        cohort={cohort}
        currency={currency}
        locale={locale}
      />

      {/* Top Header & Breadcrumb */}
      <header className="flex justify-between items-center pb-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <span className="px-2.5 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/30 text-xs font-mono font-bold">
            ZERO-CLS PAYWALL GATE
          </span>
          <h1 className="text-xl font-bold">Edge Monetization</h1>
        </div>

        <CrossRouterNav
          href={`/${locale}/dashboard`}
          isPagesRouterContext={false}
          className="text-sm font-medium text-slate-400 hover:text-slate-100 transition-colors"
        >
          ← Dashboard
        </CrossRouterNav>
      </header>

      {/* Edge Simulation & QA Control Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-slate-400">Simulate Region / Currency:</span>
          <div className="flex gap-1.5">
            <a
              href={`/${locale}/pricing?country=US`}
              className={`px-2.5 py-1 rounded transition-colors ${
                currency === 'USD'
                  ? 'bg-sky-500 text-slate-950 font-bold'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              US ($ USD)
            </a>
            <a
              href={`/${locale}/pricing?country=DE`}
              className={`px-2.5 py-1 rounded transition-colors ${
                currency === 'EUR'
                  ? 'bg-sky-500 text-slate-950 font-bold'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              EU (€ EUR)
            </a>
            <a
              href={`/${locale}/pricing?country=GB`}
              className={`px-2.5 py-1 rounded transition-colors ${
                currency === 'GBP'
                  ? 'bg-sky-500 text-slate-950 font-bold'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              UK (£ GBP)
            </a>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-slate-400">Simulate Cohort:</span>
          <div className="flex gap-1.5">
            <a
              href={`/${locale}/pricing?cohort=control`}
              className={`px-2.5 py-1 rounded transition-colors ${
                cohort === 'control'
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Control
            </a>
            <a
              href={`/${locale}/pricing?cohort=annual_discount`}
              className={`px-2.5 py-1 rounded transition-colors ${
                cohort === 'annual_discount'
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              -20% Discount
            </a>
            <a
              href={`/${locale}/pricing?cohort=feature_bundle`}
              className={`px-2.5 py-1 rounded transition-colors ${
                cohort === 'feature_bundle'
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Bundle
            </a>
          </div>
        </div>
      </div>

      {/* Cohort Promotional Banners */}
      {cohort === 'annual_discount' && (
        <div className="p-4 rounded-xl bg-gradient-to-r from-amber-500/20 to-orange-500/10 border border-amber-500/40 text-amber-200 text-sm font-medium text-center">
          {dict.discountBanner}
        </div>
      )}

      {cohort === 'feature_bundle' && (
        <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-500/20 to-teal-500/10 border border-emerald-500/40 text-emerald-200 text-sm font-medium text-center">
          {dict.bundleBanner}
        </div>
      )}

      {/* Hero Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-100">
          {dict.title}
        </h2>
        <p className="text-slate-400 text-sm sm:text-base">{dict.subtitle}</p>

        <div className="inline-flex flex-wrap items-center justify-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs font-mono text-slate-400 mt-2">
          <span>
            Resolved Region: <strong className="text-sky-400">{country}</strong>
          </span>
          <span>•</span>
          <span>
            Currency: <strong className="text-sky-400">{currency}</strong>
          </span>
          <span>•</span>
          <span>
            Cohort: <strong className="text-amber-400">{cohort}</strong>
          </span>
        </div>
      </div>

      {/* Pricing Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
        {TIERS.map((tier) => {
          let calculatedPrice = Math.round(tier.usdBase * rate);

          if (cohort === 'annual_discount') {
            calculatedPrice = Math.round(calculatedPrice * 0.8);
          }

          return (
            <div
              key={tier.id}
              className={`relative rounded-2xl p-6 flex flex-col justify-between transition-all duration-200 ${
                tier.highlight
                  ? 'bg-slate-900 border-2 border-sky-500 shadow-xl shadow-sky-500/10'
                  : 'bg-slate-900/50 border border-slate-800'
              }`}
            >
              {tier.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-sky-500 text-slate-950 text-xs font-extrabold tracking-wide uppercase">
                  {dict.popularBadge}
                </div>
              )}

              <div>
                <h3 className="text-lg font-bold text-slate-200">{tier.name}</h3>

                <div className="mt-4 mb-6 flex items-baseline gap-1">
                  <span className="text-4xl font-black text-slate-100">
                    {symbol}{calculatedPrice}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">/month</span>
                </div>

                <div className="h-px bg-slate-800 my-4" />

                <ul className="space-y-2.5 text-xs text-slate-300">
                  {tier.features.map((feat, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <span className="text-sky-400 font-bold">✓</span>
                      <span>{feat}</span>
                    </li>
                  ))}
                  {cohort === 'feature_bundle' && (
                    <li className="flex items-center gap-2 text-emerald-400 font-semibold">
                      <span>★</span>
                      <span>Free Micro-Frontier Audit Module</span>
                    </li>
                  )}
                </ul>
              </div>

              <div className="pt-8">
                <PaywallTrigger
                  tierId={tier.id}
                  userId={userId}
                  cohort={cohort}
                  currency={currency}
                  locale={locale}
                  ctaText={dict.cta}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}