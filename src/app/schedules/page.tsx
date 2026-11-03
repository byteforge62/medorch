import { redirect } from 'next/navigation'
import { requireAuth } from '@/lib/auth/authorization'
import { AppShell } from '@/components/layout/AppShell'
import { PageHeader } from '@/components/ui/PageHeader'
import { SchedulePage } from '@/components/schedules/SchedulePage'

export default async function SchedulesPage() {
  const session = await requireAuth()

  if (!session?.user) {
    redirect('/login')
  }

  return (
    <AppShell>
      <PageHeader
        eyebrow="Operation scheduling"
        title="Schedules"
        description="Manage and view operating room schedules and procedure timelines."
      />
      <SchedulePage />
    </AppShell>
  )
}