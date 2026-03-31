"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "../../store/auth-store";

export default function RegisterPage() {
  const router = useRouter();
  const { register, loading, error } = useAuthStore();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"CLIENT" | "FREELANCER">("CLIENT");
  const [skills, setSkills] = useState("");
  const [experience, setExperience] = useState("");
  const [portfolio, setPortfolio] = useState("");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      await register({
        name,
        email,
        password,
        role,
        skills: skills
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
        experience,
        portfolio: portfolio
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
      });
      router.push("/");
    } catch {
      // Error message is managed in the store.
    }
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-lg items-center px-6 py-12">
      <div className="w-full rounded-xl border border-black/10 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold">Create Account</h1>
        <p className="mt-2 text-sm text-black/60">Join as a client or freelancer.</p>

        <form className="mt-6 space-y-4" onSubmit={onSubmit}>
          <input
            type="text"
            required
            placeholder="Full name"
            className="w-full rounded-md border border-black/15 px-3 py-2"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />

          <input
            type="email"
            required
            placeholder="Email"
            className="w-full rounded-md border border-black/15 px-3 py-2"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />

          <input
            type="password"
            required
            placeholder="Password"
            className="w-full rounded-md border border-black/15 px-3 py-2"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />

          <select
            className="w-full rounded-md border border-black/15 px-3 py-2"
            value={role}
            onChange={(event) => setRole(event.target.value as "CLIENT" | "FREELANCER")}
          >
            <option value="CLIENT">Client</option>
            <option value="FREELANCER">Freelancer</option>
          </select>

          <input
            type="text"
            placeholder="Skills (comma-separated)"
            className="w-full rounded-md border border-black/15 px-3 py-2"
            value={skills}
            onChange={(event) => setSkills(event.target.value)}
          />

          <textarea
            placeholder="Experience summary"
            className="w-full rounded-md border border-black/15 px-3 py-2"
            value={experience}
            onChange={(event) => setExperience(event.target.value)}
          />

          <input
            type="text"
            placeholder="Portfolio URLs (comma-separated)"
            className="w-full rounded-md border border-black/15 px-3 py-2"
            value={portfolio}
            onChange={(event) => setPortfolio(event.target.value)}
          />

          {error ? <p className="text-sm text-red-600">{error}</p> : null}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-black px-4 py-2 text-white disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create account"}
          </button>
        </form>

        <p className="mt-4 text-sm text-black/70">
          Already have an account? <Link className="underline" href="/login">Login</Link>
        </p>
      </div>
    </main>
  );
}
