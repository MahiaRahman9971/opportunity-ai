'use client';

import { NextIntlClientProvider } from 'next-intl';
import { ReactNode, useEffect, useState } from 'react';

type I18nProviderClientProps = {
  locale: string;
  children: ReactNode;
};

export default function I18nProviderClient({ locale, children }: I18nProviderClientProps) {
  const [messages, setMessages] = useState<Record<string, Record<string, string>>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadMessages() {
      try {
        // Dynamic import for the messages
        const importedMessages = await import(`../messages/${locale}.json`);
        setMessages(importedMessages.default);
      } catch (error) {
        console.error(`Failed to load messages for locale ${locale}:`, error);
        // Fallback to empty messages
        setMessages({});
      } finally {
        setIsLoading(false);
      }
    }

    loadMessages();
  }, [locale]);

  // Show a minimal loading state or return children directly
  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      {children}
    </NextIntlClientProvider>
  );
}
