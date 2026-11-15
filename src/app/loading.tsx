import { BrandMark } from '@/components/shared/Brand';

export default function Loading() {
  return (
    <main
      role="status"
      aria-label="Opening MedOrch"
      className="bg-paper flex min-h-screen flex-col items-center justify-center px-6 py-12"
    >
      <div className="border-rule bg-sheet flex h-14 w-14 items-center justify-center rounded-[16px] border shadow-sm">
        <BrandMark className="h-9 w-9" title="MedOrch" />
      </div>
      <p className="text-ink mt-4 text-sm font-semibold">Opening MedOrch</p>
      <p className="text-ink-muted mt-1 text-[12px]">
        Preparing the clinical workspace…
      </p>
      <div className="bg-surface-muted mt-5 h-1 w-40 overflow-hidden rounded-full">
        <span className="bg-primary block h-full w-1/2 animate-pulse rounded-full" />
      </div>
    </main>
  );
}
