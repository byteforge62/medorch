import Link from "next/link";

export default function UnauthorizedPage() {
  return (
<main className="flex min-h-screen items-center justify-center px-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold">
          Access denied
        </h1>

        <p className="mt-3">
          You do not have permission to access this resource.
        </p>

        <Link
          href="/dashboard"
          className="mt-6 inline-block underline"
        >
          Return to dashboard
        </Link>
      </div>
    </main>  )
}
