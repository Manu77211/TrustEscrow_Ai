"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { useAuthStore } from "../store/auth-store";
import { Button } from "./ui/primitives";
import { FooterSectionBlock } from "./ui/footer-section";

const clientLinks = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/freelancers", label: "Freelancers" },
  { href: "/projects/create", label: "Create Project" },
];

const freelancerLinks = [{ href: "/dashboard", label: "Dashboard" }];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, hydrate, logout } = useAuthStore();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  const links = user?.role === "CLIENT" ? clientLinks : freelancerLinks;

  return (
    <div className="flex min-h-screen flex-col bg-[radial-gradient(110%_70%_at_50%_-10%,#1e3a8a_0%,#0b1120_35%,#020617_100%)] text-slate-100">
      <header className="sticky top-0 z-30 border-b border-slate-800/80 bg-slate-950/75 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <Link href="/" className="text-lg font-semibold tracking-tight text-slate-100">
            TrustEscrow AI
          </Link>

          <nav className="hidden gap-1 md:flex">
            {links.map((link) => {
              const active = pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`rounded-xl px-3 py-2 text-sm font-medium transition ${
                    active
                      ? "bg-sky-500/20 text-sky-300"
                      : "text-slate-300 hover:bg-slate-800 hover:text-slate-100"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <button
            type="button"
            className="rounded-lg border border-slate-700 p-2 text-slate-200 md:hidden"
            onClick={() => setMobileOpen((value) => !value)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>

          <div className="hidden items-center gap-2 md:flex">
            {user ? (
              <>
                <span className="rounded-full border border-sky-500/30 bg-sky-500/10 px-3 py-1 text-xs font-medium text-sky-300">
                  {user.role}
                </span>
                <Button variant="ghost" onClick={logout}>Logout</Button>
              </>
            ) : (
              <>
                <Link href="/login"><Button variant="ghost">Login</Button></Link>
                <Link href="/register"><Button>Register</Button></Link>
              </>
            )}
          </div>
        </div>

        {mobileOpen ? (
          <div className="border-t border-slate-800 px-4 py-3 md:hidden">
            <div className="flex flex-col gap-2">
              {links.map((link) => {
                const active = pathname.startsWith(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={`rounded-lg px-3 py-2 text-sm ${active ? "bg-sky-500/20 text-sky-300" : "text-slate-300"}`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>
          </div>
        ) : null}
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">{children}</main>

      <section className="px-6 pb-8 pt-4">
        <FooterSectionBlock />
      </section>
    </div>
  );
}
