"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "../../store/auth-store";
import { AppShell } from "../../components/app-shell";
import { Button, Card, Input, PageIntro, Select, Textarea } from "../../components/ui/primitives";
import { motion } from "framer-motion";

export default function RegisterPage() {
  const router = useRouter();
  const { register, loading, error } = useAuthStore();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"CLIENT" | "FREELANCER">("CLIENT");
  const [skills, setSkills] = useState("");
  const [experience, setExperience] = useState("");
  const [portfolio, setPortfolio] = useState("");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      await register({
        name,
        email,
        password,
        role,
        skills: skills
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
        experience,
        portfolio: portfolio
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
      });
      router.push("/");
    } catch {
      // Error message is managed in the store.
    }
  }

  return (
    <AppShell>
      <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-2 md:items-start">
        <PageIntro
          title="Create Your TrustEscrow Profile"
          subtitle="Register as client or freelancer to start milestone-based collaboration with objective validation."
        />
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Card>
            <div className="mb-5 rounded-xl border border-slate-700 bg-slate-900/60 p-3 text-xs text-slate-300">
              Clients create projects and assign freelancers. Freelancers deliver evidence-backed submissions for milestone release.
            </div>
            <form className="space-y-4" onSubmit={onSubmit}>
              <Input
                type="text"
                required
                placeholder="Full name"
                value={name}
                onChange={(event) => setName(event.target.value)}
              />

              <Input
                type="email"
                required
                placeholder="Email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />

              <Input
                type="password"
                required
                placeholder="Password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />

              <Select
                value={role}
                onChange={(event) => setRole(event.target.value as "CLIENT" | "FREELANCER")}
              >
                <option value="CLIENT">Client</option>
                <option value="FREELANCER">Freelancer</option>
              </Select>

              <Input
                type="text"
                placeholder="Skills (comma-separated, e.g. react,node,ui)"
                value={skills}
                onChange={(event) => setSkills(event.target.value)}
              />

              <Textarea
                placeholder="Experience summary (domain, years, delivery strengths)"
                value={experience}
                onChange={(event) => setExperience(event.target.value)}
              />

              <Input
                type="text"
                placeholder="Portfolio URLs (comma-separated)"
                value={portfolio}
                onChange={(event) => setPortfolio(event.target.value)}
              />

              {error ? <p className="text-sm text-red-600">{error}</p> : null}

              <Button type="submit" disabled={loading} className="w-full">
                {loading ? "Creating..." : "Create account"}
              </Button>
            </form>

            <p className="mt-4 text-sm text-slate-600">
              Already have an account? <Link className="font-medium text-sky-300 hover:underline" href="/login">Login</Link>
            </p>
          </Card>
        </motion.div>
      </div>
    </AppShell>
  );
}
