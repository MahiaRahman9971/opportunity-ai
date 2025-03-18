'use client';

import { useParams } from 'next/navigation';
import { ReactNode, useEffect, useState } from 'react';
import { NextIntlClientProvider } from 'next-intl';

type ClientPageProps = {
  children: ReactNode;
};

export default function ClientPage({ children }: ClientPageProps) {
  const params = useParams();
  const locale = params.locale as string || 'en';
  const [messages, setMessages] = useState<Record<string, Record<string, string>>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadMessages() {
      try {
        // Dynamic import for the messages
        const importedMessages = await import(`../../messages/${locale}.json`);
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

  // Show a minimal loading state
  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      {children}
    </NextIntlClientProvider>
  );
}
