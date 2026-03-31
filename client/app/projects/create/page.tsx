"use client";

import { motion } from "framer-motion";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "../../../components/app-shell";
import { Protected } from "../../../components/protected";
import { createProjectRequest } from "../../../lib/api";
import { Button, Card, Input, PageIntro, Textarea } from "../../../components/ui/primitives";
import { useAuthStore } from "../../../store/auth-store";

export default function CreateProjectPage() {
  const router = useRouter();
  const { token, user, hydrate } = useAuthStore();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [workType, setWorkType] = useState<"STRUCTURED" | "CREATIVE">("STRUCTURED");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!token || user?.role !== "CLIENT") {
      setError("Only clients can create projects");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const created = await createProjectRequest(token, {
        title,
        description,
        workType,
      });
      router.push(`/projects/${created.id}`);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Protected>
      <AppShell>
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-6"
        >
          <PageIntro
            title="Create Project"
            subtitle="Capture scope clearly, then let TrustEscrow AI draft initial milestone structure and criteria."
          />

          <Card>
            <form onSubmit={onSubmit} className="grid gap-3">
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Project title"
                required
                disabled={user?.role !== "CLIENT"}
              />
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe goals, deliverables, and expected output quality"
                rows={6}
                required
                disabled={user?.role !== "CLIENT"}
              />
              <select
                className="h-11 rounded-xl border border-slate-700 bg-slate-900/80 px-3 text-sm text-slate-100 outline-none ring-offset-2 transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
                value={workType}
                onChange={(e) => setWorkType(e.target.value as "STRUCTURED" | "CREATIVE")}
                disabled={user?.role !== "CLIENT"}
              >
                <option value="STRUCTURED">Structured Work</option>
                <option value="CREATIVE">Creative Work</option>
              </select>
              <div className="flex items-center gap-3">
                <Button type="submit" disabled={loading || user?.role !== "CLIENT"}>
                  {loading ? "Creating..." : "Create with AI parser"}
                </Button>
                {error ? <p className="text-sm text-red-600">{error}</p> : null}
              </div>
            </form>
          </Card>
        </motion.section>
      </AppShell>
    </Protected>
  );
}
