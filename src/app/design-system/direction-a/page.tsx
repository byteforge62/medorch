import type { Metadata } from 'next';
import { DirectionA } from '@/features/landing/components/system/directions/direction-a';

export const metadata: Metadata = {
  title: 'Direction A — Clinical Technology',
  description:
    'Landing-page prototype A: clinical technology. Preview only; the production landing page is unchanged.',
};

export default function DirectionAPage() {
  return <DirectionA />;
}
