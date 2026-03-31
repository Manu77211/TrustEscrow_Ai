"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { meRequest } from "../../../lib/api";
import { useAuthStore } from "../../../store/auth-store";
import { Button, Card, Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, Input, PageIntro, Textarea } from "../../../components/ui/primitives";

export default function DashboardProfilePage() {
  const { token, hydrate } = useAuthStore();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [openEdit, setOpenEdit] = useState(false);

  const [name, setName] = useState("");
  const [skills, setSkills] = useState("");
  const [experience, setExperience] = useState("");

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
        const data = await meRequest(token);
        setProfile(data);
        setName(data.name ?? "");
        setSkills((data.skills ?? []).join(", "));
        setExperience(data.experience ?? "");
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, [token]);

  function onSaveProfile() {
    setProfile((current: any) => ({
      ...current,
      name,
      skills: skills.split(",").map((item) => item.trim()).filter(Boolean),
      experience,
    }));
    setOpenEdit(false);
  }

  return (
    <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <PageIntro title="Profile" subtitle="Your trust identity, delivery strengths, and professional context." />

      {loading ? <p className="text-slate-400">Loading profile...</p> : null}

      {profile ? (
        <Card>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-2xl font-semibold">{profile.name}</p>
              <p className="mt-1 text-sm text-slate-400">{profile.email}</p>
            </div>
            <Dialog open={openEdit} onOpenChange={setOpenEdit}>
              <DialogTrigger asChild>
                <Button>Edit Profile</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="text-lg font-semibold">Edit Profile</DialogTitle>
                  <DialogDescription className="text-sm text-slate-400">
                    Update visible profile fields for collaboration context.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-3">
                  <Input value={name} onChange={(event) => setName(event.target.value)} placeholder="Name" />
                  <Input value={skills} onChange={(event) => setSkills(event.target.value)} placeholder="Skills (comma-separated)" />
                  <Textarea rows={4} value={experience} onChange={(event) => setExperience(event.target.value)} placeholder="Experience" />
                  <Button className="w-full" onClick={onSaveProfile}>Save</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
              <p className="text-xs text-slate-400">Rating</p>
              <p className="mt-1 text-2xl font-semibold">{Number(profile.rating ?? 0).toFixed(1)}</p>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
              <p className="text-xs text-slate-400">Trust Score</p>
              <p className="mt-1 text-2xl font-semibold">{Number(profile.trustScore ?? 0).toFixed(1)}</p>
            </div>
          </div>

          <div className="mt-4 rounded-xl border border-slate-800 bg-slate-900/70 p-4">
            <p className="text-sm text-slate-400">Skills</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {(profile.skills ?? []).map((skill: string) => (
                <span key={skill} className="rounded-full border border-slate-700 px-2.5 py-1 text-xs text-slate-200">
                  {skill}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-4 rounded-xl border border-slate-800 bg-slate-900/70 p-4">
            <p className="text-sm text-slate-400">Experience</p>
            <p className="mt-2 text-sm text-slate-200">{profile.experience || "No summary added."}</p>
          </div>
        </Card>
      ) : null}
    </motion.section>
  );
}
