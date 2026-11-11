import { createTheme } from '@mantine/core';
import { cafePalette, fontSizes, headings, lineHeights, modalShadow, radius, spacing } from './design-tokens';
import { foundationVariantColors, themeComponents } from './theme-components';

export const theme = createTheme({
  primaryColor: 'cafe',
  primaryShade: { light: 6, dark: 3 },
  colors: { cafe: [...cafePalette] },
  defaultRadius: 'md',
  fontFamily: 'var(--font-be-vietnam-pro), Arial, sans-serif',
  fontWeights: { regular: '400', medium: '500', bold: '600', semibold: '600' },
  fontSizes: Object.fromEntries(Object.entries(fontSizes).map(([size, value]) => [size, `${value / 16}rem`])),
  lineHeights: Object.fromEntries(Object.entries(lineHeights).map(([size, value]) => [size, String(value)])),
  spacing: Object.fromEntries(Object.entries(spacing).map(([size, value]) => [size, `${value / 16}rem`])),
  radius: Object.fromEntries(Object.entries(radius).map(([size, value]) => [size, `${value / 16}rem`])),
  headings: { fontFamily: 'var(--font-be-vietnam-pro), Arial, sans-serif', fontWeight: '600', sizes: headings },
  shadows: { md: modalShadow },
  variantColorResolver: foundationVariantColors,
  components: themeComponents,
});
