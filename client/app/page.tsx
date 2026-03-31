"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useEffect } from "react";
import { useAuthStore } from "@/store/auth-store";
import { Button } from "@/components/ui/primitives";

export default function Home() {
  const { user, hydrate, logout } = useAuthStore();

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  return (
    <div className="min-h-screen bg-[radial-gradient(130%_90%_at_50%_-20%,#0f766e_0%,#0f172a_42%,#020617_100%)] text-slate-100">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6">
        <p className="text-lg font-semibold">TrustEscrow AI</p>
        <div className="flex items-center gap-2">
          {user ? (
            <>
              <Button asChild variant="secondary">
                <Link href="/dashboard">Dashboard</Link>
              </Button>
              <Button variant="ghost" onClick={logout}>Logout</Button>
            </>
          ) : (
            <>
              <Button asChild variant="ghost">
                <Link href="/login">Login</Link>
              </Button>
              <Button asChild>
                <Link href="/register">Register</Link>
              </Button>
            </>
          )}
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl space-y-20 px-6 pb-20 pt-4">
        <motion.section initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }} className="rounded-3xl border border-slate-700/70 bg-slate-950/60 p-8 md:p-12">
          <p className="text-xs uppercase tracking-[0.25em] text-cyan-300">Escrow + Validation</p>
          <h1 className="mt-3 max-w-3xl text-4xl font-semibold leading-tight md:text-6xl">
            Trust freelance work without blind trust
          </h1>
          <p className="mt-4 max-w-3xl text-lg text-slate-300">
            AI-powered escrow and validation system that ensures fair payments based on proof-of-work.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild>
              <Link href="/register?role=CLIENT">Get Started as Client</Link>
            </Button>
            <Button asChild variant="secondary">
              <Link href="/register?role=FREELANCER">Join as Freelancer</Link>
            </Button>
          </div>
        </motion.section>

        <section className="grid gap-4 md:grid-cols-3">
          {["Freelance trust issues", "Payment disputes", "No objective validation"].map((item, index) => (
            <motion.div
              key={item}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08 }}
              className="rounded-2xl border border-slate-800 bg-slate-950/70 p-5"
            >
              <p className="text-sm text-slate-300">{item}</p>
            </motion.div>
          ))}
        </section>

        <section>
          <h2 className="text-2xl font-semibold">Solution in 3 Steps</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {["Fund project in escrow", "Work gets AI validated", "Payment auto-released"].map((item, index) => (
              <div key={item} className="rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-5">
                <p className="text-xs text-cyan-300">Step {index + 1}</p>
                <p className="mt-2 font-medium">{item}</p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold">Core Features</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {["AI Validation", "Milestone Payments", "Real-time Chat", "Dispute Protection"].map((feature) => (
              <div key={feature} className="rounded-2xl border border-slate-800 bg-slate-950/70 p-5">
                <p className="font-medium">{feature}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-800 bg-slate-950/70 p-6">
          <h2 className="text-2xl font-semibold">Demo Flow</h2>
          <div className="mt-4 flex flex-wrap gap-2 text-sm">
            {["Login", "Create Project", "Hire Freelancer", "Chat", "Submit Work", "Validation", "Release"].map((step) => (
              <span key={step} className="rounded-full border border-slate-700 px-3 py-1 text-slate-300">
                {step}
              </span>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
