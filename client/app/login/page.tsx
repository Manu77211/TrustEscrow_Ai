"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "../../store/auth-store";
import { Button, Card, Input, PageIntro } from "../../components/ui/primitives";
import { motion } from "framer-motion";

export default function LoginPage() {
  const router = useRouter();
  const { login, loading, error, token, hydrate } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (token) {
      router.replace("/dashboard");
    }
  }, [token, router]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      await login({ email, password });
      router.replace("/dashboard");
    } catch {
      // Error message is managed in the store.
    }
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(120%_80%_at_50%_-20%,#0f766e_0%,#111827_45%,#020617_100%)] px-6 py-10 text-slate-100">
      <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-2 md:items-start">
        <PageIntro
          title="Login"
          subtitle="Access your TrustEscrow workspace and continue escrow-backed project execution."
        />
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Card>
            <form className="space-y-4" onSubmit={onSubmit}>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-300" htmlFor="email">Email</label>
                <Input id="email" type="email" required value={email} onChange={(event) => setEmail(event.target.value)} />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-300" htmlFor="password">Password</label>
                <Input id="password" type="password" required value={password} onChange={(event) => setPassword(event.target.value)} />
              </div>

              {error ? <p className="text-sm text-rose-400">{error}</p> : null}

              <Button type="submit" disabled={loading} className="w-full">
                {loading ? "Logging in..." : "Login"}
              </Button>
            </form>

            <p className="mt-4 text-sm text-slate-400">
              New here? <Link className="font-medium text-cyan-300 hover:underline" href="/register">Create account</Link>
            </p>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
