/**
 * Fixture constants shared by the seed (Node) and the Playwright suite.
 * Keep this module free of application imports: Playwright loads it with its
 * own TypeScript transform, which does not use the Next.js path aliases.
 */
export const FIXTURE_PASSWORD = 'QaPass!2345';

export const ACCOUNT_EMAILS = {
  admin: 'qa.admin@medorch.test',
  doctor: 'qa.doctor@medorch.test',
  ot: 'qa.ot@medorch.test',
  patientOne: 'qa.patient.one@medorch.test',
  patientTwo: 'qa.patient.two@medorch.test',
} as const;
