'use client';

import React from 'react';
import { useRouter as usePagesRouter } from 'next/router';
import { useRouter as useAppRouter } from 'next/navigation';
import { SupportedLocale } from '@/lib/types';
import { setClientSession } from '@/shared-state';

interface Props {
  href: string;
  targetLocale?: SupportedLocale;
  isPagesRouterContext?: boolean;
  children: React.ReactNode;
  className?: string;
}

export const CrossRouterNav: React.FC<Props> = ({
  href,
  targetLocale,
  isPagesRouterContext = false,
  children,
  className = '',
}) => {
  // Gracefully grab routers depending on current execution tree
  const pagesRouter = isPagesRouterContext ? usePagesRouter() : null;
  const appRouter = !isPagesRouterContext ? useAppRouter() : null;

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();

    if (targetLocale) {
      setClientSession({ preferredLocale: targetLocale });
    }

    const isCurrentPages = isPagesRouterContext;
    const isTargetApp = href.includes('/dashboard') || href.includes('/pricing');

    // 1. Soft-navigate if staying within the same router architecture
    if (isCurrentPages && !isTargetApp) {
      pagesRouter?.push(href);
      return;
    }

    if (!isCurrentPages && isTargetApp) {
      appRouter?.push(href);
      return;
    }

    // 2. Perform clean hard boundary crossing when switching between Pages and App router
    window.location.href = href;
  };

  return (
    <a href={href} onClick={handleClick} className={className}>
      {children}
    </a>
  );
};