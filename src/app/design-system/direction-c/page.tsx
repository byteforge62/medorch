import type { Metadata } from 'next';
import { DirectionC } from '@/features/landing/components/system/directions/direction-c';

export const metadata: Metadata = {
  title: 'Direction C — Operational Intelligence',
  description:
    'Landing-page prototype C: operational intelligence. Preview only; the production landing page is unchanged.',
};

export default function DirectionCPage() {
  return <DirectionC />;
}
