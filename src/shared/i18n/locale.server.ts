import 'server-only';
import { cookies } from 'next/headers';
import { defaultLocale, isLocale, localeCookie } from './config';

export async function getLocale() {
  const selected = (await cookies()).get(localeCookie)?.value;
  return isLocale(selected) ? selected : defaultLocale;
}
