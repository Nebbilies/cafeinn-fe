import type { CSSVariablesResolver } from '@mantine/core';
import { semanticColors } from './design-tokens.ts';

function schemeVariables(scheme: keyof typeof semanticColors) {
  const colors = semanticColors[scheme];
  return {
    ...Object.fromEntries(Object.entries(colors).map(([role, color]) => [`--cafe-${role}`, color])),
    '--mantine-color-body': colors['background-body'],
    '--mantine-color-text': colors['text-default'],
    '--mantine-color-dimmed': colors['text-dimmed'],
    '--mantine-color-placeholder': colors['text-placeholder'],
    '--mantine-color-disabled': colors['background-disabled'],
    '--mantine-color-disabled-color': colors['text-disabled'],
    '--mantine-color-disabled-border': colors['border-default'],
    '--mantine-color-default': colors['background-surface'],
    '--mantine-color-default-hover': colors['background-hover'],
    '--mantine-color-default-color': colors['text-default'],
    '--mantine-color-default-border': colors['border-control'],
    '--mantine-color-error': colors['status-error'],
    '--mantine-color-success': colors['status-success'],
    '--mantine-primary-color-filled': colors['background-primary-filled'],
    '--mantine-primary-color-filled-hover': colors['background-primary-filled-hover'],
    '--mantine-primary-color-light': colors['background-primary-light'],
    '--mantine-primary-color-light-hover': colors['background-primary-light-hover'],
    '--mantine-primary-color-light-color': colors['text-primary'],
    '--mantine-primary-color-contrast': colors['text-on-primary'],
    '--mantine-color-anchor': colors['text-primary'],
  };
}

export const themeVariables: CSSVariablesResolver = () => ({
  variables: {},
  light: schemeVariables('light'),
  dark: schemeVariables('dark'),
});
