export const locales = ['vi', 'en'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'vi';
export const localeCookie = 'cafeinn-locale';

export function isLocale(value: unknown): value is Locale {
  return value === 'vi' || value === 'en';
}
