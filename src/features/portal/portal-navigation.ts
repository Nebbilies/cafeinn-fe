export const portalSections = [
  { slug: 'sales', icon: 'sales' },
  { slug: 'preparation', icon: 'preparation' },
  { slug: 'study-room-bookings', icon: 'room' },
  { slug: 'shifts', icon: 'shifts' },
  { slug: 'events', icon: 'microphone' },
  { slug: 'event-check-in', icon: 'check-in' },
  { slug: 'employees', icon: 'users' },
  { slug: 'menu', icon: 'menu-book' },
  { slug: 'tables', icon: 'table' },
  { slug: 'study-rooms', icon: 'room' },
  { slug: 'adjustments', icon: 'refund' },
  { slug: 'revenue', icon: 'bar-chart' },
  { slug: 'expenses', icon: 'receipt' },
  { slug: 'policies', icon: 'policy' },
  { slug: 'audit-log', icon: 'history' },
] as const;

export type PortalSection = (typeof portalSections)[number];

export function getPortalSection(pathname: string): PortalSection | undefined {
  return portalSections.find((section) => {
    const href = `/portal/${section.slug}`;
    return pathname === href || pathname.startsWith(`${href}/`);
  });
}
