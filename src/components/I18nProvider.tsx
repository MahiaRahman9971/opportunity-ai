'use client';

import { NextIntlClientProvider } from 'next-intl';
import { ReactNode } from 'react';

interface I18nProviderProps {
  locale: string;
  messages: Record<string, Record<string, unknown>>;
  children: ReactNode;
}

export default function I18nProvider({ locale, messages, children }: I18nProviderProps) {
  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      {children}
    </NextIntlClientProvider>
  );
}
