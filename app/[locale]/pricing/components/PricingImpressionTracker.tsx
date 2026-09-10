'use client';

import { useEffect, useRef } from 'react';
import { telemetry } from '@/lib/telemetry-buffer';
import { SupportedLocale } from '@/lib/types';

interface Props {
  userId: string;
  cohort: string;
  currency: string;
  locale: SupportedLocale;
}

export function PricingImpressionTracker({ userId, cohort, currency, locale }: Props) {
  const hasFired = useRef<string | null>(null);

  useEffect(() => {
    // Unique key representing this exact view state
    const impressionKey = `${userId}:${cohort}:${currency}:${locale}`;

    if (hasFired.current === impressionKey) {
      return;
    }

    hasFired.current = impressionKey;

    telemetry.track({
      eventType: 'paywall_impression',
      userId,
      cohort,
      currency,
      locale,
    });
  }, [userId, cohort, currency, locale]);

  return null;
}