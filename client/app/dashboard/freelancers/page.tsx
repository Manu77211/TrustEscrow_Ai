"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  assignFreelancerRequest,
  listFreelancersRequest,
  listProjectsRequest,
} from "../../../lib/api";
import { useAuthStore } from "../../../store/auth-store";
import {
  Button,
  Card,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Input,
  PageIntro,
  Pill,
  Select,
} from "../../../components/ui/primitives";

export default function DashboardFreelancersPage() {
  const router = useRouter();
  const { token, user, hydrate } = useAuthStore();

  const [skills, setSkills] = useState("");
  const [rating, setRating] = useState("0");
  const [freelancers, setFreelancers] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [selectedFreelancerId, setSelectedFreelancerId] = useState("");
  const [selectedProjectId, setSelectedProjectId] = useState("");

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (user?.role === "FREELANCER") {
      router.replace("/dashboard");
    }
  }, [user?.role, router]);

  async function fetchFreelancers() {
    setLoading(true);
    setError(null);
    try {
      const data = await listFreelancersRequest({
        skills,
        rating: Number(rating),
      });
      setFreelancers(data);
      if (token && user?.role === "CLIENT") {
        const projectList = await listProjectsRequest(token);
        setProjects(projectList.filter((project: any) => !project.freelancerId));
      }
      setSuccess(null);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (user?.role === "CLIENT") {
      void fetchFreelancers();
    }
  }, [user?.role, token]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await fetchFreelancers();
  }

  async function onHireFreelancer() {
    if (!token || !selectedProjectId || !selectedFreelancerId) {
      setError("Select a project before hiring.");
      return;
    }

    setAssigning(true);
    setError(null);
    setSuccess(null);

    try {
      await assignFreelancerRequest(token, selectedProjectId, selectedFreelancerId);
      setSuccess("Freelancer assigned successfully.");
      setSelectedFreelancerId("");
      setSelectedProjectId("");
      await fetchFreelancers();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setAssigning(false);
    }
  }

  if (user?.role === "FREELANCER") {
    return null;
  }

  return (
    <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <PageIntro
        title="Freelancer Discovery"
        subtitle="Search and filter talent by skills, rating, and trust score before assignment."
      />

      <Card>
        <form onSubmit={onSubmit} className="grid gap-3 md:grid-cols-3">
          <Input value={skills} onChange={(event) => setSkills(event.target.value)} placeholder="Skills (react,node,ai)" />
          <Input value={rating} onChange={(event) => setRating(event.target.value)} type="number" min="0" max="5" step="0.1" placeholder="Minimum rating" />
          <Button type="submit">{loading ? "Searching..." : "Search"}</Button>
        </form>
        {error ? <p className="mt-3 text-sm text-rose-400">{error}</p> : null}
        {success ? <p className="mt-3 text-sm text-emerald-300">{success}</p> : null}
      </Card>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {freelancers.map((item) => (
          <Card key={item.id} className="p-4">
            <p className="text-lg font-semibold">{item.name}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <Pill text={`Rating ${item.rating}`} />
              <Pill text={`Trust ${item.trustScore}`} />
            </div>
            <p className="mt-3 text-sm text-slate-400">{item.experience || "No experience added"}</p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {(item.skills ?? []).map((skill: string) => (
                <span key={skill} className="rounded-full border border-slate-700 bg-slate-900/80 px-2.5 py-1 text-xs font-medium text-slate-300">
                  {skill}
                </span>
              ))}
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button className="mt-4 w-full" onClick={() => setSelectedFreelancerId(item.id)}>Hire</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="text-lg font-semibold">Assign Freelancer</DialogTitle>
                  <DialogDescription className="text-sm text-slate-400">
                    Choose one of your unassigned projects to hire {item.name}.
                  </DialogDescription>
                </DialogHeader>
                {projects.length === 0 ? (
                  <div className="space-y-3">
                    <p className="text-sm text-slate-300">No unassigned projects available. Create a project first.</p>
                    <Button asChild variant="secondary" className="w-full">
                      <a href="/dashboard/projects">Go to Projects</a>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Select value={selectedProjectId} onChange={(event) => setSelectedProjectId(event.target.value)}>
                      <option value="">Select project</option>
                      {projects.map((project) => (
                        <option key={project.id} value={project.id}>
                          {project.title}
                        </option>
                      ))}
                    </Select>
                    <Button onClick={onHireFreelancer} disabled={assigning || !selectedProjectId} className="w-full">
                      {assigning ? "Assigning..." : "Confirm Hire"}
                    </Button>
                  </div>
                )}
              </DialogContent>
            </Dialog>
          </Card>
        ))}
      </div>
    </motion.section>
  );
}
