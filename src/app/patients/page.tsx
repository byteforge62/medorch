import { AppShell } from "@/components/layout/AppShell";
import { requirePermission } from "@/lib/auth/authorization";

import { PatientRegistry } from "./PatientRegistry";

export default async function PatientsPage() {
  await requirePermission("patients:read");

  return (
    <AppShell>
      <PatientRegistry />
    </AppShell>
  );
}