"use client";

import type { ComponentProps, ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  AudioLines,
  BarChart2,
  FrameIcon,
  Globe,
  Video,
} from "lucide-react";

interface FooterLink {
  title: string;
  href: string;
  icon?: React.ComponentType<{ className?: string }>;
}

interface FooterSection {
  label: string;
  links: FooterLink[];
}

const footerLinks: FooterSection[] = [
  {
    label: "Product",
    links: [
      { title: "Features", href: "#features" },
      { title: "Workflow", href: "#showcase" },
      { title: "Dashboard", href: "/dashboard" },
      { title: "Freelancers", href: "/freelancers" },
    ],
  },
  {
    label: "Company",
    links: [
      { title: "Mission", href: "#features" },
      { title: "Trust Model", href: "#showcase" },
      { title: "Open Project", href: "/projects/create" },
      { title: "Sign In", href: "/login" },
    ],
  },
  {
    label: "Resources",
    links: [
      { title: "Validation Reports", href: "/dashboard" },
      { title: "Milestone Planning", href: "/projects/create" },
      { title: "Freelancer Fit", href: "/freelancers" },
      { title: "Account Setup", href: "/register" },
    ],
  },
  {
    label: "Core Signals",
    links: [
      { title: "Trust Score", href: "#", icon: BarChart2 },
      { title: "Platform Metrics", href: "#", icon: Globe },
      { title: "Submission Proof", href: "#", icon: Video },
      { title: "Dispute Context", href: "#", icon: AudioLines },
    ],
  },
];

export function FooterSectionBlock() {
  return (
    <footer className="relative w-full max-w-6xl mx-auto flex flex-col items-center justify-center rounded-t-3xl border-t border-slate-700 bg-[radial-gradient(35%_128px_at_50%_0%,rgba(255,255,255,0.08),transparent)] px-6 py-12 lg:py-16">
      <div className="bg-white/20 absolute top-0 right-1/2 left-1/2 h-px w-1/3 -translate-x-1/2 -translate-y-1/2 rounded-full blur" />

      <div className="grid w-full gap-8 xl:grid-cols-3 xl:gap-8">
        <AnimatedContainer className="space-y-4 text-slate-200">
          <FrameIcon className="size-8" />
          <p className="text-slate-400 mt-8 text-sm md:mt-0">
            Copyright {new Date().getFullYear()} TrustEscrow AI. All rights reserved.
          </p>
        </AnimatedContainer>

        <div className="mt-10 grid grid-cols-2 gap-8 md:grid-cols-4 xl:col-span-2 xl:mt-0">
          {footerLinks.map((section, index) => (
            <AnimatedContainer key={section.label} delay={0.1 + index * 0.1}>
              <div className="mb-10 md:mb-0">
                <h3 className="text-xs text-slate-200">{section.label}</h3>
                <ul className="text-slate-400 mt-4 space-y-2 text-sm">
                  {section.links.map((link) => (
                    <li key={link.title}>
                      <a href={link.href} className="hover:text-white inline-flex items-center transition-all duration-300">
                        {link.icon && <link.icon className="me-1 size-4" />}
                        {link.title}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </AnimatedContainer>
          ))}
        </div>
      </div>
    </footer>
  );
}

type ViewAnimationProps = {
  delay?: number;
  className?: ComponentProps<typeof motion.div>["className"];
  children: ReactNode;
};

function AnimatedContainer({ className, delay = 0.1, children }: ViewAnimationProps) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <>{children}</>;
  }

  return (
    <motion.div
      initial={{ filter: "blur(4px)", y: -8, opacity: 0 }}
      whileInView={{ filter: "blur(0px)", y: 0, opacity: 1 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.8 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
