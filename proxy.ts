import { NextRequest, NextResponse } from 'next/server';
import {
  hashStringToCohort,
  CohortVariant,
  CurrencyCode,
  GEO_CURRENCY_MAP,
} from './lib/experiment-config';
import { SupportedLocale, isSupportedLocale } from './lib/types';

const COOKIE_USER_ID = 'x-edge-uid';
const EDGE_SECRET_KEY = process.env.EDGE_SECRET_KEY || 'super-secret-hmac-key-for-edge';

const LOCALE_DEFAULT_COUNTRY: Record<SupportedLocale, string> = {
  en: 'US',
  de: 'DE',
  fr: 'FR',
  es: 'ES',
};

async function signId(id: string): Promise<string> {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(EDGE_SECRET_KEY),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', keyMaterial, encoder.encode(id));
  const hashArray = Array.from(new Uint8Array(signature));
  return `${id}.${hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')}`;
}

async function verifyId(signedCookie: string): Promise<string | null> {
  const parts = signedCookie.split('.');
  if (parts.length !== 2) return null;
  const [id] = parts;
  const expectedSignature = await signId(id);
  if (signedCookie === expectedSignature) return id;
  return null;
}

export async function proxy(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  // 1. Bypass static and internal assets
  if (pathname.startsWith('/_next') || pathname.startsWith('/api') || pathname.includes('.')) {
    return NextResponse.next();
  }

  // 2. Cryptographic Identity Resolution
  const rawCookie = request.cookies.get(COOKIE_USER_ID)?.value;
  let userId: string | null = null;
  let isNewUser = false;

  if (rawCookie) {
    userId = await verifyId(rawCookie);
  }

  if (!userId) {
    userId = `usr_${crypto.randomUUID()}`;
    isNewUser = true;
  }

  // 3. Resolve active locale from path
  const segments = pathname.split('/').filter(Boolean);
  const detectedLocale = segments[0];
  const hasLocale = isSupportedLocale(detectedLocale);
  const currentLocale: SupportedLocale = hasLocale ? detectedLocale : 'en';

  // 4. Resolve Country: Query override -> CDN Headers -> Route Locale Fallback
  const queryCountry = searchParams.get('country')?.toUpperCase();
  const cdnCountry =
    request.headers.get('x-vercel-ip-country') ||
    request.headers.get('cf-ipcountry') ||
    request.headers.get('x-real-ip-country');

  const country = queryCountry || cdnCountry || LOCALE_DEFAULT_COUNTRY[currentLocale];

  // 5. Resolve Currency: Query override -> Country Map -> USD default
  const queryCurrency = searchParams.get('currency')?.toUpperCase() as CurrencyCode | undefined;
  const currency: CurrencyCode =
    queryCurrency && ['USD', 'EUR', 'GBP'].includes(queryCurrency)
      ? queryCurrency
      : GEO_CURRENCY_MAP[country] || 'USD';

  // 6. Deterministic Cohort Assignment (with QA override)
  const queryCohort = searchParams.get('cohort') as CohortVariant | undefined;
  const variant: CohortVariant =
    queryCohort && ['control', 'annual_discount', 'feature_bundle'].includes(queryCohort)
      ? queryCohort
      : hashStringToCohort(userId);

  // 7. Inject Headers for React Server Components
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-edge-uid', userId);
  requestHeaders.set('x-edge-cohort', variant);
  requestHeaders.set('x-edge-currency', currency);
  requestHeaders.set('x-edge-country', country);

  // 8. Redirect missing locale prefixes to default (/en)
  const response = hasLocale
    ? NextResponse.next({ request: { headers: requestHeaders } })
    : NextResponse.redirect(new URL(`/en${pathname}`, request.url));

  // 9. Cache partitioning & tags
  response.headers.set('Vary', 'x-edge-cohort, x-edge-currency');
  response.headers.set('Cache-Tag', `pricing,pricing-${variant},pricing-${currency}`);

  // 10. Issue signed cookie for new identity
  if (isNewUser) {
    const signedValue = await signId(userId);
    response.cookies.set(COOKIE_USER_ID, signedValue, {
      path: '/',
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 365,
    });
  }

  return response;
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};