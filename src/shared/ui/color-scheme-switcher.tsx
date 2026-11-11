'use client';

import { Group, Button, useMantineColorScheme } from '@mantine/core';
import { useTranslation } from 'react-i18next';

export function ColorSchemeSwitcher() {
  const { setColorScheme } = useMantineColorScheme();
  const { t } = useTranslation();
  return (
    <Group gap="xs" role="group" aria-label={t('foundations.colorScheme')}>
      <Button variant="default" onClick={() => setColorScheme('light')}>{t('foundations.light')}</Button>
      <Button variant="default" onClick={() => setColorScheme('dark')}>{t('foundations.dark')}</Button>
    </Group>
  );
}
