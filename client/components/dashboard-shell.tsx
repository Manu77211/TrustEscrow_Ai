"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useEffect, useMemo, useState } from "react";
import { Bell, ChevronDown, LayoutDashboard, Menu, User, Wallet, BriefcaseBusiness, Search, LogOut } from "lucide-react";
import { meRequest } from "../lib/api";
import { useAuthStore } from "../store/auth-store";
import { Button, Pill } from "./ui/primitives";

type NavItem = {
  href: string;
  label: string;
  icon: ReactNode;
  clientOnly?: boolean;
};

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { token, user, hydrate, logout } = useAuthStore();
  const [walletBalance, setWalletBalance] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    hydrate();
    setIsReady(true);
  }, [hydrate]);

  useEffect(() => {
    if (!isReady) {
      return;
    }

    if (!token) {
      router.replace("/login");
    }
  }, [token, isReady, router]);

  useEffect(() => {
    async function loadProfile() {
      if (!token) {
        return;
      }

      try {
        const profile = await meRequest(token);
        setWalletBalance(profile.walletBalance ?? 0);
      } catch {
        setWalletBalance(0);
      }
    }

    void loadProfile();
  }, [token, pathname]);

  const navItems = useMemo<NavItem[]>(
    () => [
      {
        href: "/dashboard",
        label: "Dashboard",
        icon: <LayoutDashboard size={16} />,
      },
      {
        href: "/dashboard/projects",
        label: user?.role === "FREELANCER" ? "My Work" : "Projects",
        icon: <BriefcaseBusiness size={16} />,
      },
      {
        href: "/dashboard/freelancers",
        label: "Freelancers",
        icon: <Search size={16} />,
        clientOnly: true,
      },
      {
        href: "/dashboard/wallet",
        label: "Wallet",
        icon: <Wallet size={16} />,
      },
      {
        href: "/dashboard/profile",
        label: "Profile",
        icon: <User size={16} />,
      },
    ],
    [user?.role],
  );

  const visibleNav = navItems.filter((item) => !(item.clientOnly && user?.role !== "CLIENT"));

  if (!isReady || !token || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-300">
        Loading workspace...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(130%_90%_at_10%_-10%,#0e7490_0%,#111827_38%,#020617_100%)] text-slate-100">
      <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-slate-950/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="rounded-lg border border-slate-700 p-2 text-slate-200 lg:hidden"
              onClick={() => setMobileOpen((value) => !value)}
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
            >
              <Menu size={16} />
            </button>
            <Link href="/dashboard" className="text-lg font-semibold tracking-tight text-slate-100">
              TrustEscrow AI
            </Link>
          </div>

          <nav className="hidden items-center gap-2 lg:flex">
            {visibleNav
              .filter((item) => ["/dashboard", "/dashboard/projects", "/dashboard/freelancers"].includes(item.href))
              .map((item) => {
                const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`rounded-xl px-3 py-2 text-sm font-medium transition ${
                      active
                        ? "bg-cyan-500/20 text-cyan-300"
                        : "text-slate-300 hover:bg-slate-800 hover:text-slate-100"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
          </nav>

          <div className="flex items-center gap-2">
            <span className="hidden rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-3 py-1.5 text-xs text-emerald-300 sm:inline-flex">
              Wallet ${walletBalance.toFixed(2)}
            </span>
            <button type="button" className="rounded-lg border border-slate-700 p-2 text-slate-300 hover:bg-slate-800" aria-label="Notifications">
              <Bell size={16} />
            </button>

            <div className="relative">
              <button
                type="button"
                onClick={() => setProfileOpen((value) => !value)}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900/80 px-3 py-2 text-sm"
              >
                <Pill text={user.role === "CLIENT" ? "Client" : "Freelancer"} />
                <ChevronDown size={14} />
              </button>

              {profileOpen ? (
                <div className="absolute right-0 mt-2 w-48 rounded-xl border border-slate-800 bg-slate-950 p-2 shadow-xl">
                  <Link
                    href="/dashboard/profile"
                    onClick={() => setProfileOpen(false)}
                    className="block rounded-lg px-3 py-2 text-sm text-slate-200 hover:bg-slate-800"
                  >
                    View Profile
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      setProfileOpen(false);
                      logout();
                      router.replace("/login");
                    }}
                    className="mt-1 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-rose-300 hover:bg-slate-800"
                  >
                    <LogOut size={14} />
                    Logout
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-7xl gap-6 px-4 py-6 sm:px-6">
        <aside
          className={`${mobileOpen ? "block" : "hidden"} fixed inset-x-4 top-24 z-30 rounded-2xl border border-slate-800 bg-slate-950 p-3 shadow-2xl lg:static lg:block lg:w-64 lg:rounded-none lg:border-0 lg:bg-transparent lg:p-0 lg:shadow-none`}
        >
          <div className="space-y-1 rounded-2xl border border-slate-800 bg-slate-950/80 p-3 lg:sticky lg:top-24">
            {visibleNav.map((item) => {
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm transition ${
                    active
                      ? "bg-cyan-500/20 text-cyan-300"
                      : "text-slate-300 hover:bg-slate-800 hover:text-slate-100"
                  }`}
                >
                  {item.icon}
                  {item.label}
                </Link>
              );
            })}
          </div>
        </aside>

        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
