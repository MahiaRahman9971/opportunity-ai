import type { Metadata } from 'next'
import { Nunito } from 'next/font/google'
import './globals.css'
import { locales } from '@/i18n'
import ChatWidget from '@/components/ChatWidget'

// Initialize the Nunito font
const nunito = Nunito({ 
  subsets: ['latin'],
  weight: ['400', '600', '700', '800'],
  variable: '--font-nunito',
})

export const metadata: Metadata = {
  title: 'Opportunity AI',
  description: 'A friendly guide to creating opportunities for your family',
}

// Generate static params for all supported locales
export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  
  return (
    <html lang="en">
      <body className={`${nunito.variable} font-nunito`}>
        {children}
        <ChatWidget />
      </body>
    </html>
  )
}