import createMiddleware from 'next-intl/middleware';
import {locales} from './i18n';

export default createMiddleware({
  // A list of all locales that are supported
  locales: locales,
  
  // If this locale is matched, pathnames work without a prefix (e.g. `/about`)
  defaultLocale: 'en',
  
  // Automatically redirect to the preferred locale
  localePrefix: 'as-needed',
  
  // Detect locale from browser settings
  localeDetection: true
});
 
export const config = {
  // Match all pathnames except for
  // - files with extensions (e.g. images, CSS)
  // - API routes
  // - _next (internal Next.js paths)
  // - static files in the public folder
  matcher: ['/((?!api|_next|.*\\..*).*)']
};
