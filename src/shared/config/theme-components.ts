import {
  Badge, Button, Card, Input, InputWrapper, Modal, Paper, Table,
  defaultVariantColorsResolver, rem,
  type MantineTheme, type VariantColorsResolver, type ButtonProps,
} from '@mantine/core';
import {
  badgeFontSize, badgeHeight, badgePadding, buttonPadding, controlHeight,
  fontSizes, inputPadding, modalWidth, type FoundationSize,
} from './design-tokens';
import classes from '../styles/foundations.module.css';

const roles = ['success', 'warning', 'error', 'info', 'neutral'] as const;

function semanticRole(color: string | undefined) {
  if (!color || color === 'cafe') return 'primary';
  return roles.find((role) => role === color);
}

export const foundationVariantColors: VariantColorsResolver = (input) => {
  const role = semanticRole(input.color);
  if (!role) return defaultVariantColorsResolver(input);
  const primary = role === 'primary';
  const neutral = role === 'neutral';
  const filled = primary ? 'background-primary-filled' : neutral ? 'background-filled' : `status-${role}`;
  const text = primary ? 'text-primary' : neutral ? 'text-default' : `status-${role}`;
  const light = primary ? 'background-primary-light' : neutral ? 'background-filled' : `status-${role}-light`;
  const onFilled = neutral ? 'text-default' : `text-on-${role}`;
  const color = (name: string) => `var(--cafe-${name})`;
  const transparent = '1px solid transparent';
  switch (input.variant) {
    case 'filled':
      return { background: color(filled), hover: color(neutral ? 'background-hover' : `${filled}-hover`), color: color(onFilled), border: transparent };
    case 'light':
      return { background: color(light), hover: color(primary ? 'background-primary-light-hover' : light), color: color(text), border: transparent };
    case 'outline':
      return { background: 'transparent', hover: color(light), color: color(text), border: `1px solid ${color(text)}` };
    case 'subtle':
      return { background: 'transparent', hover: color(light), color: color(text), border: transparent };
    case 'white':
      return { background: color('background-white'), hover: color('background-white-hover'), color: color('text-on-white'), border: transparent };
    case 'default':
      return { background: color('background-surface'), hover: color('background-hover'), color: color('text-default'), border: `1px solid ${color('border-control')}` };
    case 'dot':
      return { background: color('background-surface'), hover: color('background-hover'), color: color('text-default'), border: `1px solid ${color('border-control')}` };
    default:
      return defaultVariantColorsResolver(input);
  }
};

function variantColors(theme: MantineTheme, props: Pick<ButtonProps, 'color' | 'gradient' | 'autoContrast'> & { variant?: string }) {
  return theme.variantColorResolver({ theme, color: props.color ?? theme.primaryColor, variant: props.variant ?? 'filled', gradient: props.gradient, autoContrast: props.autoContrast });
}

function sizeValue(values: Record<FoundationSize, number>, size: string | undefined) {
  return size && size in values ? rem(values[size as FoundationSize]) : undefined;
}

export const themeComponents = {
  Button: Button.extend({
    classNames: { root: classes.button },
    vars: (theme, props) => {
      const colors = variantColors(theme, props);
      return { root: {
        '--button-height': sizeValue(controlHeight, props.size),
        '--button-padding-x': sizeValue(buttonPadding, props.size),
        '--button-fz': sizeValue(fontSizes, props.size),
        '--button-bg': colors.background,
        '--button-hover': colors.hover,
        '--button-color': colors.color,
        '--button-hover-color': colors.hoverColor,
        '--button-bd': colors.border,
      } };
    },
  }),
  Badge: Badge.extend({
    classNames: { root: classes.badge },
    vars: (theme, props) => {
      const colors = variantColors(theme, props);
      const role = semanticRole(props.color);
      return { root: {
        '--badge-height': sizeValue(badgeHeight, props.size ?? 'md'),
        '--badge-padding-x': sizeValue(badgePadding, props.size ?? 'md'),
        '--badge-fz': sizeValue(badgeFontSize, props.size ?? 'md'),
        '--badge-bg': colors.background,
        '--badge-color': colors.color,
        '--badge-bd': colors.border,
        '--badge-dot-color': role ? `var(--cafe-${role === 'primary' ? 'text-primary' : role === 'neutral' ? 'text-dimmed' : `status-${role}`})` : undefined,
      } };
    },
  }),
  Input: Input.extend({
    classNames: { input: classes.input },
    vars: (_, props) => ({ wrapper: {
      '--input-height': sizeValue(controlHeight, props.size),
      '--input-padding': props.variant === 'unstyled' ? '0' : sizeValue(inputPadding, props.size),
      '--input-bg': props.variant === 'unstyled' ? 'transparent' : `var(--cafe-background-${props.variant === 'filled' ? 'filled' : 'surface'})`,
      '--input-bd': props.variant === 'unstyled' ? 'transparent' : props.disabled ? 'var(--cafe-border-default)' : props.error && props.withErrorStyles !== false ? 'var(--cafe-border-error)' : props.variant === 'filled' ? 'transparent' : 'var(--cafe-border-control)',
      '--input-bd-focus': 'var(--cafe-border-focus)',
    } }),
  }),
  InputWrapper: InputWrapper.extend({ classNames: { label: classes.inputLabel } }),
  Paper: Paper.extend({ classNames: { root: classes.surface } }),
  Card: Card.extend({ classNames: { root: classes.surface } }),
  Modal: Modal.extend({
    defaultProps: { padding: 'md', shadow: 'md', overlayProps: { backgroundOpacity: 1, color: 'var(--cafe-background-overlay)' } },
    classNames: { content: classes.modalContent, header: classes.modalHeader, title: classes.modalTitle },
    vars: (_, props) => ({ root: { '--modal-size': sizeValue(modalWidth, typeof props.size === 'string' ? props.size : undefined) } }),
  }),
  Table: Table.extend({
    vars: (_, props) => ({ table: {
      '--table-border-color': props.borderColor ? undefined : 'var(--cafe-border-default)',
      '--table-hover-color': 'var(--cafe-background-hover)',
      '--table-striped-color': props.stripedColor ? undefined : 'var(--cafe-background-filled)',
    } }),
  }),
};
