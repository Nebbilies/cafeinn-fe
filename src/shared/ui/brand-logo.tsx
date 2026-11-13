import Image from 'next/image';
import type { CSSProperties } from 'react';
import classes from '../styles/foundations.module.css';

export function BrandLogo({ height = 64 }: { height?: number }) {
  return (
    <span className={classes.brand} style={{ '--brand-logo-height': `${height / 16}rem` } as CSSProperties}>
      <Image src="/brand/cafeinn-lockup-light.svg" width={353} height={128} alt="CafeInn · Cafe & Acoustic" className={classes.brandLight} unoptimized />
      <Image src="/brand/cafeinn-lockup-dark.svg" width={217} height={77} alt="CafeInn · Cafe & Acoustic" className={classes.brandDark} unoptimized />
    </span>
  );
}
