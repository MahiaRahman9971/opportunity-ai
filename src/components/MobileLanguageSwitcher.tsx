'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { FaGlobe, FaTimes } from 'react-icons/fa';

export default function MobileLanguageSwitcher() {
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
    <>
      {/* Floating button */}
      <button
        className="fixed bottom-6 right-6 w-12 h-12 bg-primary text-white rounded-full shadow-lg flex items-center justify-center z-40"
        onClick={() => setIsOpen(true)}
        aria-label={t('language')}
      >
        <FaGlobe size={20} />
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-80 max-w-full">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-lg font-semibold">{t('language')}</h2>
              <button 
                onClick={() => setIsOpen(false)}
                aria-label="Close"
                className="text-gray-500 hover:text-gray-700"
              >
                <FaTimes />
              </button>
            </div>
            <div className="p-4">
              <ul className="space-y-2">
                {languages.map((language) => (
                  <li key={language.code}>
                    <button
                      className={`w-full text-left px-4 py-3 rounded-md ${
                        locale === language.code
                          ? 'bg-primary text-white'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                      onClick={() => handleLanguageChange(language.code)}
                    >
                      {language.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
