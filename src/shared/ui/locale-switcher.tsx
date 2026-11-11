'use client';

import { SegmentedControl } from '@mantine/core';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { isLocale, localeCookie } from '@/shared/i18n/config';

export function LocaleSwitcher() {
  const { t, i18n } = useTranslation();
  const router = useRouter();

  function changeLocale(value: string) {
    if (!isLocale(value)) return;
    document.cookie = localeCookie + '=' + value + '; Path=/; Max-Age=31536000; SameSite=Lax' +
      (location.protocol === 'https:' ? '; Secure' : '');
    document.documentElement.lang = value;
    void i18n.changeLanguage(value);
    router.refresh();
  }

  return (
    <SegmentedControl
      aria-label={t('language')}
      value={i18n.resolvedLanguage ?? 'vi'}
      onChange={changeLocale}
      data={[{ value: 'vi', label: 'Tiếng Việt' }, { value: 'en', label: 'English' }]}
    />
  );
}
