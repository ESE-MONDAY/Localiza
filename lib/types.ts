export const SUPPORTED_LOCALES = ['en', 'es', 'de', 'fr'] as const;
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

export interface SharedSessionState {
  userId: string;
  tier: 'starter' | 'growth' | 'enterprise';
  preferredLocale: SupportedLocale;
  geoCountry?: string;
}

export function isSupportedLocale(locale: string | undefined): locale is SupportedLocale {
  return typeof locale === 'string' && (SUPPORTED_LOCALES as readonly string[]).includes(locale);
}
export type TelemetryEventType =
  | 'page_view'
  | 'paywall_impression'
  | 'paywall_click'
  | 'tier_select'
  | 'router_boundary_cross';

export interface TelemetryPayload {
  eventId: string;
  eventType: TelemetryEventType;
  userId: string;
  cohort: string;
  currency: string;
  locale: SupportedLocale;
  timestamp: number;
  metadata?: Record<string, string | number | boolean>;
}