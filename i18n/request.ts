import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing';
import { SupportedLocale } from '@/lib/types';

const messageLoaders: Record<SupportedLocale, () => Promise<{ default: Record<string, any> }[]>> = {
  en: () =>
    Promise.all([
      import('../messages/en/common.json'),
      import('../messages/en/marketing.json'),
      import('../messages/en/dashboard.json'),
      import('../messages/en/pricing.json'),
    ]),
  es: () =>
    Promise.all([
      import('../messages/es/common.json'),
      import('../messages/es/marketing.json'),
      import('../messages/es/dashboard.json'),
      import('../messages/es/pricing.json'),
    ]),
  de: () =>
    Promise.all([
      import('../messages/de/common.json'),
      import('../messages/de/marketing.json'),
      import('../messages/de/dashboard.json'),
      import('../messages/de/pricing.json'),
    ]),
  fr: () =>
    Promise.all([
      import('../messages/fr/common.json'),
      import('../messages/fr/marketing.json'),
      import('../messages/fr/dashboard.json'),
      import('../messages/fr/pricing.json'),
    ]),
};

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;

  if (!locale || !routing.locales.includes(locale as SupportedLocale)) {
    locale = routing.defaultLocale;
  }

  const validLocale = locale as SupportedLocale;
  const modules = await messageLoaders[validLocale]();

  const messages = modules.reduce((acc, current) => {
    return { ...acc, ...current.default };
  }, {});

  return {
    locale: validLocale,
    messages,
  };
});