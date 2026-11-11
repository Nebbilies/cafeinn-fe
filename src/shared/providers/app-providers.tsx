'use client';

import { useState, type ReactNode } from 'react';
import { MantineProvider } from '@mantine/core';
import { QueryClientProvider } from '@tanstack/react-query';
import { I18nextProvider } from 'react-i18next';
import { theme } from '@/shared/config/theme';
import { createI18n } from '@/shared/i18n/create-instance';
import type { Locale } from '@/shared/i18n/config';
import { getQueryClient } from './query-client';

export function AppProviders({ locale, children }: { locale: Locale; children: ReactNode }) {
  const [queryClient] = useState(getQueryClient);
  const [i18n] = useState(() => createI18n(locale));
  return (
    <MantineProvider theme={theme} defaultColorScheme="light">
      <QueryClientProvider client={queryClient}>
        <I18nextProvider i18n={i18n}>{children}</I18nextProvider>
      </QueryClientProvider>
    </MantineProvider>
  );
}
