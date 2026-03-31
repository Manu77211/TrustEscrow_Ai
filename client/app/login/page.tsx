"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "../../store/auth-store";
import { AppShell } from "../../components/app-shell";
import { Button, Card, Input, PageIntro } from "../../components/ui/primitives";
import { motion } from "framer-motion";

export default function LoginPage() {
  const router = useRouter();
  const { login, loading, error } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      await login({ email, password });
      router.push("/");
    } catch {
      // Error message is managed in the store.
    }
  }

  return (
    <AppShell>
      <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-2 md:items-start">
        <PageIntro
          title="Sign In To Your Trust Workspace"
          subtitle="Access escrow status, project milestones, and validation history from one secure dashboard."
        />
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Card>
            <div className="mb-5 rounded-xl border border-sky-500/30 bg-sky-500/10 p-3 text-xs text-sky-300">
              Use your registered account to continue project funding, assignment, and delivery review.
            </div>
            <form className="space-y-4" onSubmit={onSubmit}>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-300" htmlFor="email">Email</label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-300" htmlFor="password">Password</label>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                />
              </div>

              {error ? <p className="text-sm text-red-600">{error}</p> : null}

              <Button type="submit" disabled={loading} className="w-full">
                {loading ? "Signing in..." : "Sign in"}
              </Button>
            </form>

            <p className="mt-4 text-sm text-slate-600">
              New here? <Link className="font-medium text-sky-300 hover:underline" href="/register">Create account</Link>
            </p>
          </Card>
        </motion.div>
      </div>
    </AppShell>
  );
}
