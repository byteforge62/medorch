import type { Metadata } from 'next';
import { ClinicalLanding } from '@/components/landing/clinical/clinical-landing';

export const metadata: Metadata = {
  title: 'Clinical direction',
  description:
    'Landing-page direction for MedOrch: a light clinical operations interface, a working theatre-day preview, module index, role scopes and audit trail.',
};

export default function ClinicalDirectionPage() {
  return <ClinicalLanding />;
}
