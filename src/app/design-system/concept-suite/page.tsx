import type { Metadata } from 'next';
import { SuitePlanConcept } from '@/components/landing/system/concepts/suite-plan';

export const metadata: Metadata = {
  title: 'Concept C — Interactive hospital suite',
  description:
    'Creative concept C: a spatial theatre suite plan with contextual records. Preview only; the production landing page is unchanged.',
};

export default function ConceptSuitePage() {
  return <SuitePlanConcept />;
}
