import { notFound } from 'next/navigation';
import { headers } from 'next/headers';
import Link from 'next/link';
import { isSupportedLocale, SUPPORTED_LOCALES } from '@/lib/types';
import { getTranslations } from 'next-intl/server';
import { CrossRouterNav } from '@/components/CrossRouterNav';

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function HomePage({ params }: Props) {
  const { locale } = await params;

  if (!isSupportedLocale(locale)) {
    notFound();
  }

  const headerList = await headers();
  const cohort = headerList.get('x-edge-cohort') || 'control';
  const currency = headerList.get('x-edge-currency') || 'USD';
  const country = headerList.get('x-edge-country') || 'US';
  const uid = headerList.get('x-edge-uid') || 'usr_anonymous';

  const t = await getTranslations('System');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-sky-500 selection:text-slate-950">
      {/* Background radial glow */}
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-sky-950/20 via-slate-950/0 to-transparent -z-10" />

      {/* Top Header Bar */}
      <header className="w-full max-w-6xl mx-auto px-6 py-6 flex items-center justify-between border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-sky-500 to-indigo-500 flex items-center justify-center font-black text-sm text-slate-950 shadow-lg shadow-sky-500/25">
            GS
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-base tracking-tight">GlobalScale Engine</span>
              <span className="px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20 text-[10px] font-mono font-semibold uppercase">
                v16 Edge Core
              </span>
            </div>
          </div>
        </div>

        {/* Locale Pill Switcher */}
        <div className="flex items-center bg-slate-900/90 border border-slate-800 rounded-full p-1 shadow-inner">
          {SUPPORTED_LOCALES.map((l) => (
            <Link
              key={l}
              href={`/${l}`}
              className={`px-3 py-1 rounded-full text-xs font-mono uppercase transition-all duration-150 ${
                l === locale
                  ? 'bg-sky-500 text-slate-950 font-bold shadow-md shadow-sky-500/25'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {l}
            </Link>
          ))}
        </div>
      </header>

      {/* Main Content */}
      <main className="w-full max-w-5xl mx-auto px-6 py-12 my-auto space-y-10">
        {/* Status Badge & Hero */}
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            {t('loaded')}
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-tight text-transparent bg-clip-text bg-gradient-to-b from-white via-slate-100 to-slate-400">
            Next.js 16 Edge Gateway
          </h1>

          <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
            Deterministic cohort routing, cross-router session synchronization, and zero-CLS paywall matrices running at the V8 edge.
          </p>
        </div>

        {/* Edge Context Diagnostics Terminal */}
        <div className="p-6 sm:p-8 rounded-2xl bg-slate-900/70 border border-slate-800/80 backdrop-blur shadow-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80 inline-block" />
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block" />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block" />
              <span className="ml-2 font-mono text-xs text-slate-400 font-semibold uppercase tracking-wider">
                Edge Resolved Telemetry HUD
              </span>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
              Active Path: /{locale}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono text-xs pt-2">
            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1">
              <div className="text-slate-500 uppercase text-[10px] font-bold">Identity (UID)</div>
              <div className="text-sky-400 font-semibold truncate" title={uid}>
                {uid}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1">
              <div className="text-slate-500 uppercase text-[10px] font-bold">Assigned Cohort</div>
              <div className="text-amber-400 font-bold uppercase">
                {cohort}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1">
              <div className="text-slate-500 uppercase text-[10px] font-bold">Currency Code</div>
              <div className="text-emerald-400 font-bold">
                {currency}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1">
              <div className="text-slate-500 uppercase text-[10px] font-bold">Resolved Geo</div>
              <div className="text-purple-400 font-bold">
                {country} (PoP Edge)
              </div>
            </div>
          </div>
        </div>

        {/* Quick Launchpad Navigation */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <CrossRouterNav
            href={`/${locale}/marketing`}
            isPagesRouterContext={false}
            className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800 hover:border-purple-500/40 hover:bg-slate-900/70 transition-all duration-200 group text-left space-y-2 block"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-purple-400 uppercase">Pages Router</span>
              <span className="text-purple-400 group-hover:translate-x-1 transition-transform">→</span>
            </div>
            <h3 className="text-base font-bold text-white group-hover:text-purple-300 transition-colors">
              Marketing SSG
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Pre-rendered static HTML frontier running on standard static export pipelines.
            </p>
          </CrossRouterNav>

          <Link
            href={`/${locale}/dashboard`}
            className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800 hover:border-emerald-500/40 hover:bg-slate-900/70 transition-all duration-200 group text-left space-y-2 block"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-emerald-400 uppercase">App Router</span>
              <span className="text-emerald-400 group-hover:translate-x-1 transition-transform">→</span>
            </div>
            <h3 className="text-base font-bold text-white group-hover:text-emerald-300 transition-colors">
              RSC Telemetry Engine
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Server-rendered React 19 components reading HMAC edge session cookies live.
            </p>
          </Link>

          <Link
            href={`/${locale}/pricing`}
            className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800 hover:border-sky-500/40 hover:bg-slate-900/70 transition-all duration-200 group text-left space-y-2 block"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-sky-400 uppercase">Monetization</span>
              <span className="text-sky-400 group-hover:translate-x-1 transition-transform">→</span>
            </div>
            <h3 className="text-base font-bold text-white group-hover:text-sky-300 transition-colors">
              Zero-CLS Paywall
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Sub-0.05 CLS layout with inlined multi-currency calculations and background beacons.
            </p>
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-6xl mx-auto px-6 py-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 font-mono gap-4">
        <div>GlobalScale Engine • Core Edge Gateway</div>
        <div className="flex gap-6">
          <Link href={`/${locale}/blog`} className="hover:text-slate-300 transition-colors">
            Architecture Blog
          </Link>
          <Link href={`/${locale}/pricing`} className="hover:text-slate-300 transition-colors">
            Pricing Plans
          </Link>
        </div>
      </footer>
    </div>
  );
}