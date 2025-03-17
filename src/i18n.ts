import {notFound} from 'next/navigation';
import {getRequestConfig} from 'next-intl/server';
 
// Define the supported locales
export const locales = ['en', 'es', 'zh'] as const;
export type Locale = (typeof locales)[number];

export default getRequestConfig(async ({locale}) => {
  // Validate that the locale is supported
  if (!locales.includes(locale as Locale)) {
    notFound();
  }
 
  // Since we've validated the locale, we know it's one of our supported locales
  return {
    locale: locale as string,
    messages: (await import(`./messages/${locale}.json`)).default
  };
});
