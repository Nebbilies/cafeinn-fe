import { useTranslation } from 'react-i18next';

/** Formats whole-dong amounts for the current locale ("80.000 ₫" in Vietnamese). */
export function useFormatMoney() {
  const { i18n } = useTranslation();
  const formatter = new Intl.NumberFormat(i18n.language === 'en' ? 'en-US' : 'vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 });
  return (amount: number) => formatter.format(amount);
}
