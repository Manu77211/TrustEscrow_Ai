"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { AppShell } from "../../components/app-shell";
import { Protected } from "../../components/protected";
import { listProjectsRequest, meRequest } from "../../lib/api";
import { useAuthStore } from "../../store/auth-store";
import { Button, Card, PageIntro, Pill } from "../../components/ui/primitives";

export default function DashboardPage() {
  const { token, user, hydrate } = useAuthStore();
  const [projects, setProjects] = useState<any[]>([]);
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    async function load() {
      if (!token) {
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const [profile, projectList] = await Promise.all([
          meRequest(token),
          listProjectsRequest(token),
        ]);
        setWalletBalance(profile.walletBalance ?? 0);
        setProjects(projectList);
      } catch (e) {
        setError((e as Error).message);
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, [token]);

  return (
    <Protected>
      <AppShell>
        <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="space-y-6">
          <PageIntro
            title="Workspace Dashboard"
            subtitle="Track escrow readiness, milestone progression, and assignment state in one operational view."
          />

          <Card>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-slate-400">{user ? `Welcome, ${user.name}` : "Loading user..."}</p>
                <div className="mt-2 flex items-center gap-2">
                  {user?.role ? <Pill text={user.role} /> : null}
                  <p className="text-sm text-slate-400">Wallet balance: ${walletBalance.toFixed(2)}</p>
                </div>
              </div>
              {user?.role === "CLIENT" ? (
                <div className="flex flex-wrap gap-2">
                  <Link href="/projects/create"><Button>Create Project</Button></Link>
                  <Link href="/freelancers"><Button variant="secondary">Find Freelancer</Button></Link>
                </div>
              ) : null}
            </div>
          </Card>

          <Card>
            <h2 className="text-xl font-semibold text-slate-100">Projects</h2>
            {loading ? <p className="mt-3 text-slate-400">Loading projects...</p> : null}
            {error ? <p className="mt-3 text-red-600">{error}</p> : null}
            {!loading && !error && projects.length === 0 ? (
              <p className="mt-3 text-slate-400">No projects yet.</p>
            ) : null}
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {projects.map((project) => (
                <Link
                  key={project.id}
                  href={`/projects/${project.id}`}
                  className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 transition hover:-translate-y-0.5 hover:bg-slate-800"
                >
                  <p className="font-medium text-slate-100">{project.title}</p>
                  <p className="text-sm text-slate-400">{project.status}</p>
                </Link>
              ))}
            </div>
          </Card>
        </motion.section>
      </AppShell>
    </Protected>
  );
}
