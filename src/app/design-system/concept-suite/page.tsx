import type { Metadata } from 'next';
import { SuitePlanConcept } from '@/features/landing/components/system/concepts/suite-plan';

export const metadata: Metadata = {
  title: 'Concept C — Interactive hospital suite',
  description:
    'Creative concept C: a spatial theatre suite plan with contextual records. Preview only; the production landing page is unchanged.',
};

export default function ConceptSuitePage() {
  return <SuitePlanConcept />;
}
