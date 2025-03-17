'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { FaGlobe } from 'react-icons/fa';

export default function LanguageSelector() {
  const t = useTranslations('languageSelector');
  const locale = useLocale();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const languages = [
    { code: 'en', name: t('english') },
    { code: 'es', name: t('spanish') },
    { code: 'zh', name: t('chinese') }
  ];

  const handleLanguageChange = (newLocale: string) => {
    // Navigate to the same path but with a different locale
    router.push(`/${newLocale}${window.location.pathname.substring(3)}`);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        className="flex items-center space-x-1 text-gray-700 hover:text-primary transition-colors"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label={t('language')}
      >
        <FaGlobe className="mr-1" />
        <span>{t('language')}</span>
      </button>

      {isOpen && (
        <div 
          className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-50"
          role="listbox"
          aria-label={t('language')}
        >
          <ul className="py-1">
            {languages.map((language) => (
              <li key={language.code}>
                <button
                  className={`block w-full text-left px-4 py-2 text-sm ${
                    locale === language.code
                      ? 'bg-primary text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  onClick={() => handleLanguageChange(language.code)}
                  aria-selected={locale === language.code}
                  role="option"
                >
                  {language.name}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
