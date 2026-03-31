"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { AppShell } from "../../../components/app-shell";
import { Protected } from "../../../components/protected";
import { assignFreelancerRequest, getProjectRequest, listFreelancersRequest } from "../../../lib/api";
import { Button, Card, PageIntro, Pill, Select } from "../../../components/ui/primitives";
import { useAuthStore } from "../../../store/auth-store";

type Milestone = {
  id: string;
  title: string;
  amount: number;
  status: string;
  description: string | null;
};

type ProjectDetail = {
  id: string;
  title: string;
  description: string;
  status: string;
  client: { name: string };
  freelancer: { name: string } | null;
  milestones: Milestone[];
};

type Freelancer = {
  id: string;
  name: string;
  rating: number;
  trustScore: number;
};

export default function ProjectDetailPage() {
  const params = useParams<{ id: string }>();
  const { token, user, hydrate } = useAuthStore();

  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [freelancers, setFreelancers] = useState<Freelancer[]>([]);
  const [selectedFreelancerId, setSelectedFreelancerId] = useState("");
  const [assignLoading, setAssignLoading] = useState(false);
  const [assignError, setAssignError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  async function loadPage() {
    if (!token || !params.id) {
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const [projectData, freelancerData] = await Promise.all([
        getProjectRequest(token, params.id),
        listFreelancersRequest({}),
      ]);
      setProject(projectData as ProjectDetail);
      setFreelancers(freelancerData as Freelancer[]);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadPage();
  }, [token, params.id]);

  async function onAssignFreelancer() {
    if (!token || !selectedFreelancerId || !params.id) {
      return;
    }

    setAssignLoading(true);
    setAssignError(null);
    try {
      await assignFreelancerRequest(token, params.id, selectedFreelancerId);
      await loadPage();
      setSelectedFreelancerId("");
    } catch (e) {
      setAssignError((e as Error).message);
    } finally {
      setAssignLoading(false);
    }
  }

  const canAssign = user?.role === "CLIENT" && !project?.freelancer;

  return (
    <Protected>
      <AppShell>
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="space-y-6"
        >
          <PageIntro
            title={project?.title ?? "Project Details"}
            subtitle="Review milestones, team assignment, and project readiness before escrow funding."
          />

          {loading ? <p>Loading project...</p> : null}
          {error ? <p className="text-red-600">{error}</p> : null}

          {project ? (
            <>
              <Card>
                <h1 className="text-2xl font-semibold text-slate-100">{project.title}</h1>
                <p className="mt-2 text-slate-400">{project.description}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Pill text={project.status} />
                  <Pill text={`Client ${project.client.name}`} />
                  <Pill text={project.freelancer ? `Freelancer ${project.freelancer.name}` : "Freelancer not assigned"} />
                </div>
              </Card>

              {canAssign ? (
                <Card>
                  <h2 className="text-xl font-semibold text-slate-100">Assign Freelancer</h2>
                  <div className="mt-3 flex flex-wrap items-center gap-3">
                    <Select
                      value={selectedFreelancerId}
                      onChange={(e) => setSelectedFreelancerId(e.target.value)}
                    >
                      <option value="">Select freelancer</option>
                      {freelancers.map((freelancer) => (
                        <option key={freelancer.id} value={freelancer.id}>
                          {freelancer.name} (rating {freelancer.rating})
                        </option>
                      ))}
                    </Select>
                    <Button
                      onClick={onAssignFreelancer}
                      disabled={assignLoading || !selectedFreelancerId}
                    >
                      {assignLoading ? "Assigning..." : "Assign"}
                    </Button>
                    {assignError ? <p className="text-sm text-red-600">{assignError}</p> : null}
                  </div>
                </Card>
              ) : null}

              <Card>
                <h2 className="text-xl font-semibold text-slate-100">Milestones</h2>
                <div className="mt-4 grid gap-3">
                  {project.milestones.length === 0 ? <p className="text-slate-400">No milestones yet.</p> : null}
                  {project.milestones.map((milestone) => (
                    <div key={milestone.id} className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
                      <p className="font-medium text-slate-100">{milestone.title}</p>
                      <p className="mt-1 text-sm text-slate-400">Amount: ${milestone.amount.toFixed(2)}</p>
                      <p className="text-sm text-slate-400">Status: {milestone.status}</p>
                      {milestone.description ? (
                        <p className="mt-1 text-sm text-slate-400">{milestone.description}</p>
                      ) : null}
                    </div>
                  ))}
                </div>
              </Card>
            </>
          ) : null}
        </motion.section>
      </AppShell>
    </Protected>
  );
}
