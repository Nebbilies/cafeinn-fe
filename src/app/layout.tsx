import '@mantine/core/styles.css';
import './globals.css';
import type { Metadata } from 'next';
import { ColorSchemeScript, mantineHtmlProps } from '@mantine/core';
import { AppProviders } from '@/shared/providers/app-providers';
import { getLocale } from '@/shared/i18n/locale.server';

export const metadata: Metadata = { title: 'CafeInn' };

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();
  return (
    <html lang={locale} {...mantineHtmlProps}>
      <head><ColorSchemeScript defaultColorScheme="light" /></head>
      <body><AppProviders locale={locale}>{children}</AppProviders></body>
    </html>
  );
}
