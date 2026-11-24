import type { CSSProperties } from 'react';
import classes from './cafe-icon.module.css';

export const cafeIconNames = [
  'chevron-down', 'chevron-left', 'chevron-right', 'chevrons-left', 'chevrons-right',
  'eye', 'info', 'pencil', 'plus', 'trash',
] as const;

export type CafeIconName = (typeof cafeIconNames)[number];

/** Decorative Cafe icon from `public/icons/`, tinted with the current text color. */
export function CafeIcon({ name, size = 16 }: { name: CafeIconName; size?: number }) {
  return (
    <span
      aria-hidden="true"
      className={classes.icon}
      style={{ '--cafe-icon': `url('/icons/${name}.svg')`, '--cafe-icon-size': `${size / 16}rem` } as CSSProperties}
    />
  );
}
