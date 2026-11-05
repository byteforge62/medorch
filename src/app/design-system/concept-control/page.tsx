import type { Metadata } from 'next';
import { ControlRoomConcept } from '@/components/landing/system/concepts/control-room';

export const metadata: Metadata = {
  title: 'Concept A — Theatre control room',
  description:
    'Creative concept A: an interactive theatre control room. Preview only; the production landing page is unchanged.',
};

export default function ConceptControlPage() {
  return <ControlRoomConcept />;
}
