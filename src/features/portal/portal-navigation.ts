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

const permissions: Record<PortalSection['slug'], string> = {
  sales: 'sales.manage',
  preparation: 'sales.manage',
  'study-room-bookings': 'sales.manage',
  shifts: 'sales.manage',
  events: 'events.manage',
  'event-check-in': 'events.manage',
  employees: 'users.manage',
  menu: 'menu.manage',
  tables: 'tables.manage',
  'study-rooms': 'rooms.manage',
  adjustments: 'refunds.approve',
  revenue: 'reports.read',
  expenses: 'expenses.manage',
  policies: 'policies.manage',
  'audit-log': 'audit.read',
};
export function permittedSections(grants: readonly string[]) {
  return portalSections.filter((section) => grants.includes(permissions[section.slug]));
}

export function getPortalSection(pathname: string): PortalSection | undefined {
  return portalSections.find((section) => {
    const href = `/portal/${section.slug}`;
    return pathname === href || pathname.startsWith(`${href}/`);
  });
}
