'use client'

import Link from 'next/link'
import { RefObject } from 'react'
import { useTranslations } from 'next-intl'
import LanguageSelector from './LanguageSelector'

interface NavbarProps {
  progressBarRef: RefObject<HTMLDivElement>
}

export default function Navbar({ progressBarRef }: NavbarProps) {
  const t = useTranslations('navbar');

  return (
    <header className="fixed top-0 left-0 w-full bg-white z-50">
      <nav className="w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="text-primary text-3xl font-bold pl-4 md:pl-10">{t('title')}</div>
          <div className="hidden md:flex items-center space-x-8 pr-4 md:pr-10">
            <Link href="#welcome" className="hover:text-primary transition-colors">{t('welcome')}</Link>
            <Link href="#quiz-section" className="hover:text-primary transition-colors">{t('assess')}</Link>
            <Link href="#opportunity-map" className="hover:text-primary transition-colors">{t('opportunityMap')}</Link>
            <Link href="#take-action" className="hover:text-primary transition-colors">{t('takeAction')}</Link>
            <Link href="#next-steps" className="hover:text-primary transition-colors">{t('nextSteps')}</Link>
            <Link href="#additional-resources" className="hover:text-primary transition-colors">{t('resources')}</Link>
            <Link href="#community-connections" className="hover:text-primary transition-colors">{t('community')}</Link>
            <LanguageSelector />
          </div>
        </div>
      </nav>
      <div className="h-0.5 w-full bg-gray-100">
        <div className="h-full bg-primary w-0" ref={progressBarRef}></div>
      </div>
    </header>
  )
}