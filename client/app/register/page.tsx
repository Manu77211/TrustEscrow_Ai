"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "../../store/auth-store";
import { Button, Card, Input, PageIntro, Select, Textarea } from "../../components/ui/primitives";
import { motion } from "framer-motion";

export default function RegisterPage() {
  const router = useRouter();
  const { register, loading, error, token, hydrate } = useAuthStore();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"CLIENT" | "FREELANCER">("CLIENT");
  const [skills, setSkills] = useState("");
  const [experience, setExperience] = useState("");
  const [portfolio, setPortfolio] = useState("");

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const queryRole = new URLSearchParams(window.location.search).get("role");
    if (queryRole === "CLIENT" || queryRole === "FREELANCER") {
      setRole(queryRole);
    }
  }, []);

  useEffect(() => {
    if (token) {
      router.replace("/dashboard");
    }
  }, [token, router]);

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
      router.replace("/dashboard");
    } catch {
      // Error message is managed in the store.
    }
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(120%_80%_at_50%_-20%,#0f766e_0%,#111827_45%,#020617_100%)] px-6 py-10 text-slate-100">
      <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-2 md:items-start">
        <PageIntro
          title="Register"
          subtitle="Create your profile as Client or Freelancer and enter the trust-based delivery workflow."
        />
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Card>
            <form className="space-y-4" onSubmit={onSubmit}>
              <Input type="text" required placeholder="Name" value={name} onChange={(event) => setName(event.target.value)} />
              <Input type="email" required placeholder="Email" value={email} onChange={(event) => setEmail(event.target.value)} />
              <Input type="password" required placeholder="Password" value={password} onChange={(event) => setPassword(event.target.value)} />

              <Select value={role} onChange={(event) => setRole(event.target.value as "CLIENT" | "FREELANCER")}>
                <option value="CLIENT">Client</option>
                <option value="FREELANCER">Freelancer</option>
              </Select>

              <Input type="text" placeholder="Skills (comma-separated)" value={skills} onChange={(event) => setSkills(event.target.value)} />
              <Textarea placeholder="Experience" value={experience} onChange={(event) => setExperience(event.target.value)} />
              <Input type="text" placeholder="Portfolio URLs (comma-separated)" value={portfolio} onChange={(event) => setPortfolio(event.target.value)} />

              {error ? <p className="text-sm text-rose-400">{error}</p> : null}

              <Button type="submit" disabled={loading} className="w-full">
                {loading ? "Creating account..." : "Create account"}
              </Button>
            </form>

            <p className="mt-4 text-sm text-slate-400">
              Already have an account? <Link className="font-medium text-cyan-300 hover:underline" href="/login">Login</Link>
            </p>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
