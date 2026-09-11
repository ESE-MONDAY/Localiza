import { notFound } from 'next/navigation';
import { headers, cookies } from 'next/headers';
import Link from 'next/link';
import { isSupportedLocale, SupportedLocale } from '@/lib/types';
import { parseSessionCookie, SESSION_COOKIE_NAME } from '@/shared-state';
import { CrossRouterNav } from '@/components/CrossRouterNav';
import fs from 'fs';
import path from 'path';

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function DashboardPage({ params }: Props) {
  const { locale } = await params;

  if (!isSupportedLocale(locale)) {
    notFound();
  }

  const headerList = await headers();
  const cookieStore = await cookies();

  const userId = headerList.get('x-edge-uid') || 'usr_dev_sample';
  const cohort = headerList.get('x-edge-cohort') || 'control';
  const currency = headerList.get('x-edge-currency') || 'USD';
  const country = headerList.get('x-edge-country') || 'US';

  const rawSession = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  const session = parseSessionCookie(rawSession);

  // Load translations
  const filePath = path.join(process.cwd(), 'messages', locale, 'dashboard.json');
  const dict = JSON.parse(fs.readFileSync(filePath, 'utf8')).Dashboard;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans p-6 sm:p-10 selection:bg-emerald-500 selection:text-slate-950">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Top App Router Bar */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-800 gap-4">
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-mono font-bold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              APP ROUTER (RSC)
            </span>
            <h1 className="text-2xl font-black tracking-tight">{dict.title}</h1>
          </div>

          <div className="flex items-center gap-3">
            <CrossRouterNav
              href={`/${locale}/marketing`}
              isPagesRouterContext={false}
              className="text-xs font-mono text-slate-400 hover:text-purple-400 transition-colors px-3 py-1.5 rounded-lg border border-slate-800 hover:border-slate-700 bg-slate-900"
            >
              ← Pages Router Marketing
            </CrossRouterNav>

            <Link
              href={`/${locale}/pricing`}
              className="text-xs font-mono font-semibold bg-sky-500 hover:bg-sky-400 text-slate-950 px-3.5 py-1.5 rounded-lg transition-colors shadow-md shadow-sky-500/20"
            >
              View Paywall →
            </Link>
          </div>
        </header>

        {/* Live Identity & Telemetry Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Card 1: Edge Cryptographic Identity */}
          <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800/80 backdrop-blur space-y-5 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-xs font-mono text-slate-400 uppercase tracking-wider font-bold">
                Active Edge Identity
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20">
                HMAC-SHA256
              </span>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div className="flex justify-between py-1 border-b border-slate-800/50">
                <span className="text-slate-400">User Identity (UID)</span>
                <span className="text-sky-400 font-semibold">{userId}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/50">
                <span className="text-slate-400">Assigned Cohort</span>
                <span className="text-amber-400 font-semibold uppercase">{cohort}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/50">
                <span className="text-slate-400">Geo Resolution</span>
                <span className="text-emerald-400 font-semibold">{country}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Mapped Currency</span>
                <span className="text-sky-400 font-bold">{currency}</span>
              </div>
            </div>
          </div>

          {/* Card 2: Cross-Router Session Bus */}
          <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800/80 backdrop-blur space-y-5 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-xs font-mono text-slate-400 uppercase tracking-wider font-bold">
                Cross-Router Session Bus
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Lax Cookie Bus
              </span>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div className="flex justify-between py-1 border-b border-slate-800/50">
                <span className="text-slate-400">Sync Status</span>
                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Synchronized
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/50">
                <span className="text-slate-400">Active Tier Plan</span>
                <span className="text-sky-400 font-bold uppercase">{session.tier}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/50">
                <span className="text-slate-400">Active Locale</span>
                <span className="text-amber-400 font-bold uppercase">{locale}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Hydration Drift</span>
                <span className="text-emerald-400 font-mono">0.00ms (RSC Native)</span>
              </div>
            </div>
          </div>

        </div>

        {/* Direct Links to Other Routes */}
        <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800/50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-slate-400">
            Experimentation cohort and regional currency are persisted deterministically across all pages.
          </div>
          <div className="flex gap-3">
            <Link
              href={`/${locale}/blog`}
              className="text-xs font-mono px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
            >
              Browse Blog Articles →
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}