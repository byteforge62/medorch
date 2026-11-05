import type { Metadata } from 'next';
import { CaseJourneyConcept } from '@/components/landing/system/concepts/case-journey';

export const metadata: Metadata = {
  title: 'Concept B — Surgical case journey',
  description:
    'Creative concept B: one surgical case followed through seven scroll-linked stages. Preview only; the production landing page is unchanged.',
};

export default function ConceptJourneyPage() {
  return <CaseJourneyConcept />;
}
