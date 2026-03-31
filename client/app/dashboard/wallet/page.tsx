"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { listProjectsRequest, meRequest } from "../../../lib/api";
import { useAuthStore } from "../../../store/auth-store";
import { Button, Card, PageIntro, Pill } from "../../../components/ui/primitives";

export default function DashboardWalletPage() {
  const { token, user, hydrate } = useAuthStore();
  const [balance, setBalance] = useState(0);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    async function load() {
      if (!token) {
        return;
      }

      setLoading(true);
      try {
        const [profile, projectList] = await Promise.all([meRequest(token), listProjectsRequest(token)]);
        setBalance(profile.walletBalance ?? 0);
        setProjects(projectList);
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, [token]);

  const lockedAmount = useMemo(() => {
    return projects.reduce((sum, project) => {
      const amount = (project.milestones ?? [])
        .filter((milestone: any) => milestone.status !== "APPROVED")
        .reduce((inner: number, milestone: any) => inner + Number(milestone.amount ?? 0), 0);
      return sum + amount;
    }, 0);
  }, [projects]);

  const releasedAmount = useMemo(() => {
    return projects.reduce((sum, project) => {
      const amount = (project.milestones ?? [])
        .filter((milestone: any) => milestone.status === "APPROVED")
        .reduce((inner: number, milestone: any) => inner + Number(milestone.amount ?? 0), 0);
      return sum + amount;
    }, 0);
  }, [projects]);

  return (
    <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <PageIntro
        title="Wallet"
        subtitle={user?.role === "FREELANCER" ? "Track earnings, releases, and withdrawal readiness." : "Track funded escrow, locked amounts, and releases."}
      />

      {loading ? <p className="text-slate-400">Loading wallet...</p> : null}

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-5">
          <p className="text-sm text-slate-400">Current Balance</p>
          <p className="mt-2 text-3xl font-semibold">${balance.toFixed(2)}</p>
        </Card>
        <Card className="p-5">
          <p className="text-sm text-slate-400">Locked</p>
          <p className="mt-2 text-3xl font-semibold">${lockedAmount.toFixed(2)}</p>
        </Card>
        <Card className="p-5">
          <p className="text-sm text-slate-400">Released</p>
          <p className="mt-2 text-3xl font-semibold">${releasedAmount.toFixed(2)}</p>
        </Card>
      </div>

      <Card>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">Transaction History</h2>
          <Button variant="secondary">{user?.role === "FREELANCER" ? "Withdraw" : "Add Funds"}</Button>
        </div>

        <div className="mt-4 space-y-2">
          {projects.flatMap((project) =>
            (project.milestones ?? []).map((milestone: any) => {
              const type = milestone.status === "APPROVED" ? "Released" : "Locked";
              return (
                <div key={`${project.id}-${milestone.id}`} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-800 bg-slate-900/60 p-3">
                  <div>
                    <p className="text-sm font-medium">{project.title} - {milestone.title}</p>
                    <p className="text-xs text-slate-400">{new Date(milestone.updatedAt ?? Date.now()).toLocaleString()}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Pill text={type} />
                    <span className="text-sm">${Number(milestone.amount ?? 0).toFixed(2)}</span>
                  </div>
                </div>
              );
            }),
          )}
          {projects.length === 0 ? <p className="text-sm text-slate-400">No transactions yet.</p> : null}
        </div>
      </Card>
    </motion.section>
  );
}
