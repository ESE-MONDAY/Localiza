'use client';

import React, { useTransition, useState } from 'react';
import { telemetry } from '@/lib/telemetry-buffer';
import { SupportedLocale } from '@/lib/types';

interface Props {
  tierId: string;
  userId: string;
  cohort: string;
  currency: string;
  locale: SupportedLocale;
  ctaText: string;
}

export const PaywallTrigger: React.FC<Props> = ({
  tierId,
  userId,
  cohort,
  currency,
  locale,
  ctaText,
}) => {
  const [isPending, startTransition] = useTransition();
  const [converted, setConverted] = useState(false);

  const handleSelect = () => {
    startTransition(() => {
      setConverted(true);

      telemetry.track({
        eventType: 'tier_select',
        userId,
        cohort,
        currency,
        locale,
        metadata: { tierId },
      });
    });
  };

  return (
    <button
      onClick={handleSelect}
      disabled={isPending || converted}
      className={`w-full py-2.5 px-4 rounded-lg font-semibold text-sm transition-all duration-150 ${
        converted
          ? 'bg-emerald-600 text-white cursor-default'
          : 'bg-sky-500 hover:bg-sky-400 text-slate-950 cursor-pointer shadow-lg shadow-sky-500/20 active:scale-[0.98]'
      }`}
    >
      {converted ? '✓ Enrolled' : isPending ? 'Allocating...' : ctaText}
    </button>
  );
};