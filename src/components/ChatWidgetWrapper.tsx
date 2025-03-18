'use client';

import React, { useEffect, useState } from 'react';
import { NextIntlClientProvider } from 'next-intl';
import { useParams } from 'next/navigation';
import ChatWidget from './ChatWidget';

export default function ChatWidgetWrapper() {
  const params = useParams();
  const locale = params.locale as string || 'en';
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

  // Show nothing while loading
  if (isLoading) {
    return null;
  }

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <ChatWidget />
    </NextIntlClientProvider>
  );
}
