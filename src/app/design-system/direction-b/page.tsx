import type { Metadata } from 'next';
import { DirectionB } from '@/components/landing/system/directions/direction-b';

export const metadata: Metadata = {
  title: 'Direction B — Premium Enterprise',
  description:
    'Landing-page prototype B: premium enterprise. Preview only; the production landing page is unchanged.',
};

export default function DirectionBPage() {
  return <DirectionB />;
}
