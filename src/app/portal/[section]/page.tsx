import { notFound } from 'next/navigation';
import { portalSections } from '@/features/portal/portal-navigation';
import { PortalSectionPage } from '@/features/portal/components/portal-pages';

export default async function SectionPage({ params }: { params: Promise<{ section: string }> }) {
  const { section } = await params;
  const destination = portalSections.find((item) => item.slug === section);
  if (!destination) notFound();
  return <PortalSectionPage section={destination.slug} />;
}
