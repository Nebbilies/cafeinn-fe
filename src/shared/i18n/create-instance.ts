import { createInstance } from 'i18next';
import { initReactI18next } from 'react-i18next';
import vi from './locales/vi/common.json';
import en from './locales/en/common.json';
import { defaultLocale, locales, type Locale } from './config';

export function createI18n(locale: Locale) {
  const instance = createInstance();
  void instance.use(initReactI18next).init({
    resources: { vi: { common: vi }, en: { common: en } },
    lng: locale,
    fallbackLng: defaultLocale,
    supportedLngs: [...locales],
    defaultNS: 'common',
    initAsync: false,
    interpolation: { escapeValue: false },
    react: { useSuspense: false },
  });
  return instance;
}
