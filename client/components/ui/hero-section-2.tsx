"use client";

import React from "react";
import Link from "next/link";
import { ChevronRight, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnimatedGroup } from "@/components/ui/animated-group";
import { cn } from "@/lib/utils";
import { useScroll } from "framer-motion";

export function HeroSection2() {
  return (
    <>
      <HeroHeader />
      <main className="overflow-hidden bg-[#050914] text-slate-100">
        <section>
          <div className="relative pt-24">
            <div className="absolute inset-0 -z-10 size-full [background:radial-gradient(95%_125%_at_50%_100%,transparent_0%,#050914_75%)]" />
            <div className="mx-auto max-w-5xl px-6">
              <div className="sm:mx-auto lg:mr-auto">
                <AnimatedGroup preset="blur-slide">
                  <h1 className="mt-8 max-w-2xl text-balance text-5xl font-medium md:text-6xl lg:mt-16">
                    Ship freelance projects with measurable trust, not guesswork
                  </h1>
                  <p className="mt-8 max-w-2xl text-pretty text-lg text-slate-300">
                    Convert vague briefs into milestones, lock escrow safely, validate deliveries, and release payouts with transparent scoring.
                  </p>
                  <div className="mt-12 flex items-center gap-2">
                    <div className="bg-white/20 rounded-[14px] border border-white/20 p-0.5">
                      <Button asChild size="lg" className="rounded-xl px-5 text-base">
                        <Link href="/register">
                          <span className="text-nowrap">Start a Project</span>
                        </Link>
                      </Button>
                    </div>
                    <Button asChild size="lg" variant="ghost" className="h-[42px] rounded-xl px-5 text-base text-slate-100 hover:text-slate-900">
                      <Link href="/login">
                        <span className="text-nowrap">Sign In</span>
                      </Link>
                    </Button>
                  </div>
                </AnimatedGroup>
              </div>
            </div>
            <AnimatedGroup preset="blur-slide">
              <div className="relative -mr-56 mt-8 overflow-hidden px-2 sm:mr-0 sm:mt-12 md:mt-20">
                <div aria-hidden className="bg-gradient-to-b to-[#050914] absolute inset-0 z-10 from-transparent from-35%" />
                <div className="bg-slate-900/70 relative mx-auto max-w-5xl overflow-hidden rounded-2xl border border-slate-700 p-4 shadow-lg shadow-black/40 ring-1 ring-slate-700">
                  <img
                    className="aspect-[15/8] relative rounded-2xl"
                    src="https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1600&q=80"
                    alt="TrustEscrow project workflow dashboard"
                    width="2700"
                    height="1440"
                  />
                </div>
              </div>
            </AnimatedGroup>
          </div>
        </section>
        <section className="pb-16 pt-16 md:pb-24">
          <div className="group relative m-auto max-w-5xl px-6">
            <div className="absolute inset-0 z-10 flex scale-95 items-center justify-center opacity-0 duration-500 group-hover:scale-100 group-hover:opacity-100">
              <Link href="/" className="block text-sm duration-150 hover:opacity-75">
                <span>Explore product capabilities</span>
                <ChevronRight className="ml-1 inline-block size-3" />
              </Link>
            </div>
            <div className="mx-auto mt-8 grid max-w-2xl grid-cols-2 gap-6 text-slate-400 sm:grid-cols-4">
              <span className="rounded-lg border border-slate-700 px-3 py-2 text-center">Escrow Protection</span>
              <span className="rounded-lg border border-slate-700 px-3 py-2 text-center">AI Validation</span>
              <span className="rounded-lg border border-slate-700 px-3 py-2 text-center">Dispute Readiness</span>
              <span className="rounded-lg border border-slate-700 px-3 py-2 text-center">Reputation Scoring</span>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}

const menuItems = [
  { name: "Features", href: "#features" },
  { name: "Workflow", href: "#showcase" },
  { name: "Dashboard", href: "/dashboard" },
  { name: "Freelancers", href: "/freelancers" },
];

export const HeroHeader = () => {
  const [menuState, setMenuState] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);
  const { scrollYProgress } = useScroll();

  React.useEffect(() => {
    const unsubscribe = scrollYProgress.on("change", (latest) => {
      setScrolled(latest > 0.05);
    });
    return () => unsubscribe();
  }, [scrollYProgress]);

  return (
    <header>
      <nav
        data-state={menuState && "active"}
        className={cn(
          "group fixed z-30 w-full border-b border-slate-800 transition-colors duration-150",
          scrolled && "bg-[#050914]/70 backdrop-blur-3xl",
        )}
      >
        <div className="mx-auto max-w-5xl px-6 transition-all duration-300">
          <div className="relative flex flex-wrap items-center justify-between gap-6 py-3 lg:gap-0 lg:py-4">
            <div className="flex w-full items-center justify-between gap-12 lg:w-auto">
              <Link href="/" aria-label="home" className="flex items-center space-x-2 text-slate-100 font-semibold">
                TrustEscrow AI
              </Link>

              <button
                onClick={() => setMenuState(!menuState)}
                aria-label={menuState ? "Close Menu" : "Open Menu"}
                className="relative z-20 -m-2.5 -mr-4 block cursor-pointer p-2.5 lg:hidden"
              >
                <Menu className="group-data-[state=active]:rotate-180 group-data-[state=active]:scale-0 group-data-[state=active]:opacity-0 m-auto size-6 duration-200" />
                <X className="group-data-[state=active]:rotate-0 group-data-[state=active]:scale-100 group-data-[state=active]:opacity-100 absolute inset-0 m-auto size-6 -rotate-180 scale-0 opacity-0 duration-200" />
              </button>

              <div className="hidden lg:block">
                <ul className="flex gap-8 text-sm text-slate-300">
                  {menuItems.map((item) => (
                    <li key={item.name}>
                      <Link href={item.href} className="hover:text-white block duration-150">
                        <span>{item.name}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="bg-[#050914] group-data-[state=active]:block lg:group-data-[state=active]:flex mb-6 hidden w-full flex-wrap items-center justify-end space-y-8 rounded-3xl border border-slate-700 p-6 shadow-2xl md:flex-nowrap lg:m-0 lg:flex lg:w-fit lg:gap-6 lg:space-y-0 lg:border-transparent lg:bg-transparent lg:p-0 lg:shadow-none">
              <div className="lg:hidden">
                <ul className="space-y-6 text-base text-slate-300">
                  {menuItems.map((item) => (
                    <li key={item.name}>
                      <Link href={item.href} className="hover:text-white block duration-150">
                        <span>{item.name}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex w-full flex-col space-y-3 sm:flex-row sm:gap-3 sm:space-y-0 md:w-fit">
                <Button asChild variant="outline" size="sm" className="border-slate-600 bg-transparent text-slate-100 hover:bg-slate-800">
                  <Link href="/login">
                    <span>Login</span>
                  </Link>
                </Button>
                <Button asChild size="sm">
                  <Link href="/register">
                    <span>Sign Up</span>
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
};
