import type { Metadata } from 'next';
import { DirectionC } from '@/components/landing/system/directions/direction-c';

export const metadata: Metadata = {
  title: 'Direction C — Operational Intelligence',
  description:
    'Landing-page prototype C: operational intelligence. Preview only; the production landing page is unchanged.',
};

export default function DirectionCPage() {
  return <DirectionC />;
}
