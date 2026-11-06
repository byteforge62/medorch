export default function SchedulesLoading() {
  return (
    <main className="animate-pulse pb-8" aria-busy="true" aria-label="Loading theatre schedule">
      <div className="pb-5">
        <div className="bg-surface-muted h-2 w-20 rounded-full" />
        <div className="bg-surface-muted mt-3 h-9 w-48 rounded-sm" />
        <div className="bg-surface-muted mt-3 h-3 w-full max-w-lg rounded-full" />
        <div className="border-rule mt-6 flex flex-col gap-4 border-y py-4 md:flex-row md:items-center md:justify-between">
          <div className="flex gap-2">
            <div className="bg-surface-muted h-9 w-9 rounded-[var(--radius-control)]" />
            <div className="bg-surface-muted h-9 w-36 rounded-[var(--radius-control)]" />
            <div className="bg-surface-muted h-9 w-9 rounded-[var(--radius-control)]" />
            <div className="bg-surface-muted h-9 w-16 rounded-[var(--radius-control)]" />
          </div>
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-5">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="space-y-1.5">
                <div className="bg-surface-muted h-2 w-16 rounded-full" />
                <div className="bg-surface-muted h-3.5 w-14 rounded-sm" />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="border-rule grid grid-cols-7 overflow-hidden rounded-[var(--radius-panel)] border">
        {Array.from({ length: 7 }).map((_, index) => (
          <div key={index} className="border-rule border-r p-3 last:border-r-0">
            <div className="bg-surface-muted mx-auto h-2 w-7 rounded-full" />
            <div className="bg-surface-muted mx-auto mt-2 h-4 w-5 rounded-sm" />
            <div className="bg-surface-muted mx-auto mt-2 h-3 w-4 rounded-full" />
          </div>
        ))}
      </div>

      <div className="border-rule bg-surface mt-5 overflow-hidden rounded-[var(--radius-panel)] border">
        <div className="grid gap-3 p-4 sm:grid-cols-2 xl:grid-cols-5">
          {Array.from({ length: 5 }).map((_, index) => (
            <div
              key={index}
              className="bg-surface-muted h-9 rounded-[var(--radius-control)]"
            />
          ))}
        </div>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="border-rule bg-surface overflow-hidden rounded-[var(--radius-panel)] border">
          <div className="border-rule flex items-center justify-between border-b px-5 py-4">
            <div className="bg-surface-muted h-3 w-28 rounded-full" />
            <div className="bg-surface-muted h-2.5 w-40 rounded-full" />
          </div>
          {Array.from({ length: 5 }).map((_, index) => (
            <div
              key={index}
              className="border-rule grid grid-cols-[9rem_minmax(0,1fr)] border-b last:border-b-0"
            >
              <div className="border-rule space-y-2 border-r px-4 py-4">
                <div className="bg-surface-muted h-2.5 w-20 rounded-full" />
                <div className="bg-surface-muted h-2 w-24 rounded-full" />
              </div>
              <div className="p-3">
                <div className="bg-surface-muted h-16 w-2/5 rounded-sm" />
              </div>
            </div>
          ))}
        </div>
        <div className="border-rule bg-surface hidden rounded-[var(--radius-panel)] border xl:block">
          <div className="space-y-3 px-4 py-4">
            <div className="bg-surface-muted h-2 w-16 rounded-full" />
            <div className="bg-surface-muted h-4 w-40 rounded-sm" />
            <div className="bg-surface-muted h-2.5 w-full rounded-full" />
            <div className="bg-surface-muted h-2.5 w-4/5 rounded-full" />
          </div>
        </div>
      </div>
    </main>
  );
}
