"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ActionSearchBar } from "@/components/ui/action-search-bar";
import { FooterSectionBlock } from "@/components/ui/footer-section";
import { HeroSection2 } from "@/components/ui/hero-section-2";
import { Hero1 } from "@/components/ui/hero-1";

export default function Home() {
  return (
    <div className="bg-[#050914] text-slate-100">
      <HeroSection2 />

      <section id="features" className="relative mx-auto max-w-6xl px-6 py-16 md:py-24">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45 }}
          className="rounded-3xl border border-slate-700 bg-slate-900/70 p-8 shadow-2xl shadow-black/30"
        >
          <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Action Workspace</p>
          <h2 className="mt-3 text-2xl font-semibold md:text-3xl">
            Command center for escrow, milestones, and delivery validation
          </h2>
          <p className="mt-3 max-w-2xl text-slate-300">
            Search core actions quickly, then jump into project workflows with consistent transitions and responsive layouts.
          </p>
          <div className="mt-8">
            <ActionSearchBar />
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/register" className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-200">
              Create account
            </Link>
            <Link href="/login" className="rounded-xl border border-slate-600 px-4 py-2 text-sm font-semibold text-slate-100 hover:bg-slate-800">
              Login
            </Link>
            <Link href="/dashboard" className="rounded-xl border border-slate-600 px-4 py-2 text-sm font-semibold text-slate-100 hover:bg-slate-800">
              Open dashboard
            </Link>
          </div>
        </motion.div>
      </section>

      <section id="showcase" className="py-12">
        <Hero1 />
      </section>

      <section className="px-6 pb-8">
        <FooterSectionBlock />
      </section>
    </div>
  );
}
