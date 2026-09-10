import React from 'react';
import { GetStaticPaths, GetStaticProps } from 'next';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { SupportedLocale, SUPPORTED_LOCALES, isSupportedLocale } from '@/lib/types';
import { CrossRouterNav } from '@/components/CrossRouterNav';
import fs from 'fs';
import path from 'path';

interface Props {
  locale: SupportedLocale;
  dict: {
    heroTitle: string;
    heroSubtitle: string;
    ctaButton: string;
  };
}

export default function MarketingPage({ locale, dict }: Props) {
  const router = useRouter();
  const activeLocale = (router.query.locale as SupportedLocale) || locale;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-purple-500 selection:text-white">
      {/* Background radial glow */}
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(circle_at_top,var(--tw-gradient-stops))] from-purple-950/25 via-slate-950/0 to-transparent -z-10" />

      {/* Navigation Bar */}
      <header className="w-full max-w-6xl mx-auto px-6 py-6 flex items-center justify-between border-b border-slate-800/80">
     <div className="flex items-center gap-3">
  <div className="w-8 h-8 rounded-lg bg-linear-to-tr from-purple-600 to-indigo-500 flex items-center justify-center font-black text-sm text-white shadow-lg shadow-purple-600/30">
    GS
  </div>
  <span className="font-bold text-base tracking-tight">GlobalScale</span>
  <span data-testid="router-badge" className="ml-2 px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20 text-[10px] font-mono font-semibold">
    PAGES ROUTER (SSG)
  </span>
</div>

        {/* Locale Selector */}
        <div className="flex items-center bg-slate-900/90 border border-slate-800 rounded-full p-1 shadow-inner">
          {SUPPORTED_LOCALES.map((l) => (
            <a
              key={l}
              href={`/${l}/marketing`}
              className={`px-3 py-1 rounded-full text-xs font-mono uppercase transition-all duration-150 ${
                l === activeLocale
                  ? 'bg-purple-600 text-white font-bold shadow-md shadow-purple-600/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {l}
            </a>
          ))}
        </div>
      </header>

      {/* Hero Section */}
      <main className="w-full max-w-5xl mx-auto px-6 py-20 flex flex-col items-center text-center my-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs text-slate-300 mb-8 font-mono">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          Zero-CLS Edge Frontier Architecture v16
        </div>

        <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight leading-[1.1] max-w-4xl text-transparent bg-clip-text bg-gradient-to-b from-white via-slate-100 to-slate-400">
          {dict.heroTitle}
        </h1>

        <p className="mt-6 text-lg sm:text-xl text-slate-400 max-w-2xl leading-relaxed">
          {dict.heroSubtitle}
        </p>

        {/* CTA Button Group */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <CrossRouterNav
            href={`/${activeLocale}/dashboard`}
            isPagesRouterContext={true}
            className="px-8 py-3.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-sm transition-all duration-200 shadow-xl shadow-purple-600/25 hover:shadow-purple-600/40 hover:-translate-y-0.5 active:translate-y-0"
          >
            {dict.ctaButton} →
          </CrossRouterNav>

          <Link
            href={`/${activeLocale}/blog`}
            className="px-6 py-3.5 rounded-xl bg-slate-900/90 hover:bg-slate-800/90 text-slate-300 hover:text-white font-medium text-sm transition-all border border-slate-800"
          >
            Architecture Blog
          </Link>
        </div>

        {/* Feature Highlights Grid */}
        <div className="mt-20 grid grid-cols-1 sm:grid-cols-3 gap-6 w-full text-left">
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur">
            <div className="text-purple-400 font-mono text-xs uppercase font-bold mb-2">01 / Deterministic</div>
            <h3 className="text-base font-semibold mb-1">V8 Cohort Hashing</h3>
            <p className="text-sm text-slate-400">HMAC-signed cookies partition visitors without database roundtrips.</p>
          </div>
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur">
            <div className="text-sky-400 font-mono text-xs uppercase font-bold mb-2">02 / Performance</div>
            <h3 className="text-base font-semibold mb-1">Zero-CLS Paywalls</h3>
            <p className="text-sm text-slate-400">Dynamic pricing tables rendered on demand at the edge with CLS &lt; 0.05.</p>
          </div>
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur">
            <div className="text-emerald-400 font-mono text-xs uppercase font-bold mb-2">03 / Cross-Router</div>
            <h3 className="text-base font-semibold mb-1">Pages + App Router</h3>
            <p className="text-sm text-slate-400">Seamless boundary crossing between SSG marketing and RSC dashboards.</p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-6xl mx-auto px-6 py-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 font-mono gap-4">
        <div>GlobalScale v16 • High-Performance Hybrid Frontier</div>
        <div className="flex gap-6">
          <Link href={`/${activeLocale}/pricing`} className="hover:text-slate-300 transition-colors">Pricing Matrix</Link>
          <Link href={`/${activeLocale}/blog`} className="hover:text-slate-300 transition-colors">Blog Hub</Link>
        </div>
      </footer>
    </div>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: SUPPORTED_LOCALES.map((locale) => ({ params: { locale } })),
    fallback: false,
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const locale = (params?.locale as string) || 'en';

  if (!isSupportedLocale(locale)) {
    return { notFound: true };
  }

  const filePath = path.join(process.cwd(), 'messages', locale, 'marketing.json');
  const raw = fs.readFileSync(filePath, 'utf8');
  const dict = JSON.parse(raw).Marketing;

  return {
    props: {
      locale,
      dict,
    },
  };
};