import Image from 'next/image';
import classes from '../styles/foundations.module.css';

export function BrandLogo() {
  return (
    <span className={classes.brand}>
      <Image src="/brand/cafeinn-lockup-light.svg" width={353} height={128} alt="CafeInn · Cafe & Acoustic" className={classes.brandLight} unoptimized />
      <Image src="/brand/cafeinn-lockup-dark.svg" width={217} height={77} alt="CafeInn · Cafe & Acoustic" className={classes.brandDark} unoptimized />
    </span>
  );
}
