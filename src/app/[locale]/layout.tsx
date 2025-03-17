import { notFound } from 'next/navigation';
import { ReactNode } from 'react';
import I18nProvider from '@/components/I18nProvider';
import ChatWidget from '@/components/ChatWidget';

// Import the messages for the requested locale
async function getMessages(locale: string) {
  try {
    return (await import(`../../messages/${locale}.json`)).default;
  } catch {
    notFound();
  }
}

export default async function LocaleLayout({
  children,
  params: { locale }
}: {
  children: ReactNode;
  params: { locale: string };
}) {
  const messages = await getMessages(locale);

  return (
    <I18nProvider locale={locale} messages={messages}>
      {children}
      <ChatWidget />
    </I18nProvider>
  );
}
