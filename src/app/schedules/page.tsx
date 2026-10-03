import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth/authorization";
import { AppShell } from "@/components/layout/AppShell";
import { SchedulePage } from "@/components/schedules/SchedulePage";

export default async function Page() {
  const session = await requireAuth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <AppShell>
      <SchedulePage />
    </AppShell>
  );
}
