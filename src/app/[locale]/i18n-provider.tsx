'use client';

import { NextIntlClientProvider } from 'next-intl';
import { ReactNode, useEffect, useState } from 'react';

type I18nProviderWrapperProps = {
  locale: string;
  children: ReactNode;
};

export default function I18nProviderWrapper({ locale, children }: I18nProviderWrapperProps) {
  const [messages, setMessages] = useState({});
  
  useEffect(() => {
    // Load messages dynamically on the client side using dynamic import
    const loadMessages = async () => {
      try {
        const importedMessages = await import(`../../messages/${locale}.json`);
        setMessages(importedMessages.default);
      } catch (error) {
        console.error('Failed to load messages:', error);
        setMessages({});
      }
    };
    
    loadMessages();
  }, [locale]);
  
  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      {children}
    </NextIntlClientProvider>
  );
}
