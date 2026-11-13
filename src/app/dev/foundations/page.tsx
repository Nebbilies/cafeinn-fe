import { notFound } from 'next/navigation';
import { FoundationsShowcase } from '@/features/foundations/components/foundations-showcase';

export default function FoundationsPage() {
  if (process.env.NODE_ENV !== 'development') notFound();
  return <FoundationsShowcase />;
}
