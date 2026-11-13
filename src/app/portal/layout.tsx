import type { Metadata } from 'next';
import { PortalShell } from '@/features/portal/components/portal-shell';

export const metadata: Metadata = { title: { default: 'Portal · CafeInn', template: '%s · CafeInn' } };

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return <PortalShell>{children}</PortalShell>;
}
