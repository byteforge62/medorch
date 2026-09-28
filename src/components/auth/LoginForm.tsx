"use client"

import { FormEvent, useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"


export function LoginForm() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false)
  
  async function handleSubmit(event: FormEvent<HTMLFormElement>){
     event.preventDefault();

     setError("");
     setIsLoading(true);

     try{
        const result = await signIn("credentials",{
            email,
            password,
            redirect: false,
        });

        if(!result || result.error){
            setError("Invalid email or password");
            return;
        }

        router.push("/dashboard");
        router.refresh();
     }catch{
        setError("Something went wrong.Please try again");
     }finally{
        setIsLoading(false);
     }
  }
    return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label
          htmlFor="email"
          className="mb-2 block text-sm font-medium"
        >
          Email
        </label>

        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="admin@medorch.local"
          required
          className="w-full rounded-lg border px-4 py-3 outline-none transition focus:ring-2"
        />
      </div>

      <div>
        <label
          htmlFor="password"
          className="mb-2 block text-sm font-medium"
        >
          Password
        </label>

        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Enter your password"
          required
          className="w-full rounded-lg border px-4 py-3 outline-none transition focus:ring-2"
        />
      </div>

      {error && (
        <div
          role="alert"
          className="rounded-lg border px-4 py-3 text-sm"
        >
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="w-full rounded-lg px-4 py-3 font-medium transition disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isLoading ? "Signing in..." : "Sign in"}
      </button>
    </form>
  )
}
