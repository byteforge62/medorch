import { LoginForm } from "@/components/auth/LoginForm"

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-md">
        <div className="mb-8">
          <p className="mb-2 text-sm font-medium">
            MedOrch
          </p>

          <h1 className="text-3xl font-bold">
            Sign in
          </h1>

          <p className="mt-2 text-sm">
            Access the operating theatre management system.
          </p>
        </div>

        <LoginForm />
      </div>
    </main>
  )
}
