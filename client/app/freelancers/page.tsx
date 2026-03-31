"use client";

import { motion } from "framer-motion";
import { FormEvent, useEffect, useState } from "react";
import { AppShell } from "../../components/app-shell";
import { Protected } from "../../components/protected";
import { listFreelancersRequest } from "../../lib/api";
import { Button, Card, Input, PageIntro, Pill } from "../../components/ui/primitives";

export default function FreelancersPage() {
  const [skills, setSkills] = useState("");
  const [rating, setRating] = useState("0");
  const [freelancers, setFreelancers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  async function fetchFreelancers() {
    setLoading(true);
    try {
      const data = await listFreelancersRequest({
        skills,
        rating: Number(rating),
      });
      setFreelancers(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void fetchFreelancers();
  }, []);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await fetchFreelancers();
  }

  return (
    <Protected>
      <AppShell>
        <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="space-y-6">
          <PageIntro
            title="Freelancer Discovery"
            subtitle="Filter by skills and trust signals, then assign the right freelancer to each project milestone." 
          />

          <Card>
            <form onSubmit={onSubmit} className="grid gap-3 sm:grid-cols-3">
              <Input
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                placeholder="Skills (react,node)"
              />
              <Input
                value={rating}
                onChange={(e) => setRating(e.target.value)}
                type="number"
                min="0"
                max="5"
                step="0.1"
                placeholder="Min rating"
              />
              <Button type="submit">{loading ? "Searching..." : "Search"}</Button>
            </form>
          </Card>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {freelancers.map((item) => (
              <Card key={item.id} className="p-4">
                <p className="font-medium text-slate-100">{item.name}</p>
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
              </Card>
            ))}
          </div>
        </motion.section>
      </AppShell>
    </Protected>
  );
}
