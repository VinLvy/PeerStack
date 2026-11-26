"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { BookOpen, RotateCcw, ShieldCheck } from "lucide-react";
import { useDemoStore } from "./demo-store-provider";
import type { UserRole } from "@/lib/types";

const ROLE_NAV_LINKS: Record<UserRole, { href: string; label: string }[]> = {
  mentee: [
    { href: "/mentee/new", label: "New Ticket" },
    { href: "/mentee/tickets", label: "My Tickets" },
  ],
  mentor: [
    { href: "/mentor/queue", label: "Ticket Queue" },
    { href: "/mentor/hours", label: "My Hours" },
  ],
  admin: [
    { href: "/admin/credentials", label: "Credentials" },
    { href: "/admin/metrics", label: "Pilot Metrics" },
  ],
};

const ROLE_DEFAULT_HOME: Record<UserRole, string> = {
  mentee: "/mentee/new",
  mentor: "/mentor/queue",
  admin: "/admin/metrics",
};

const ROLE_LABELS: { role: UserRole; label: string }[] = [
  { role: "mentee", label: "Mentee" },
  { role: "mentor", label: "Mentor" },
  { role: "admin", label: "Admin" },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { state, setRole, resetDemo } = useDemoStore();

  const currentRole: UserRole = pathname.startsWith("/mentor")
    ? "mentor"
    : pathname.startsWith("/admin")
      ? "admin"
      : pathname.startsWith("/mentee")
        ? "mentee"
        : state.activeRole;

  const navLinks = ROLE_NAV_LINKS[currentRole];

  const handleRoleSwitch = (role: UserRole) => {
    setRole(role);
    router.push(ROLE_DEFAULT_HOME[role]);
  };

  const handleResetDemo = () => {
    resetDemo();
    if (pathname.startsWith("/mentee/tickets/")) {
      router.push("/mentee/tickets");
    } else if (pathname.startsWith("/mentor/tickets/")) {
      router.push("/mentor/queue");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-[#0F172A]">
      {/* Prototype Honesty Banner - Visible on Every Page */}
      <div className="bg-[#0F172A] text-slate-100 text-xs sm:text-sm py-2 px-4 text-center border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>
            Interactive Frontend Prototype for STACK 2026 Semifinal | Simulated AI &amp; Synthetic Data | Live Backend Planned for Final Round
          </span>
        </div>
      </div>

      {/* Main Navigation Header + Demo Role Switcher */}
      <header className="bg-white border-b border-[#E2E8F0] sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-6">
            <Link
              href="/"
              className="flex items-center gap-2 font-bold text-lg text-[#0F172A] tracking-tight"
            >
              <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-[#2563EB] text-white">
                <BookOpen className="w-4 h-4" />
              </span>
              <span>PeerStack</span>
            </Link>

            <nav className="flex items-center gap-1 sm:gap-2" aria-label="Role navigation">
              {navLinks.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/" && pathname.startsWith(item.href + "/"));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-[#EFF6FF] text-[#1D4ED8] border border-blue-200"
                        : "text-slate-600 hover:text-[#0F172A] hover:bg-slate-100"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <div
              className="inline-flex items-center rounded-lg bg-slate-100 p-1 border border-[#E2E8F0]"
              role="group"
              aria-label="Demo Role Switcher"
            >
              <span className="text-xs font-medium text-slate-500 px-2 hidden sm:inline">
                Demo Role:
              </span>
              {ROLE_LABELS.map(({ role, label }) => {
                const active = currentRole === role;
                return (
                  <button
                    key={role}
                    type="button"
                    onClick={() => handleRoleSwitch(role)}
                    className={`px-2.5 py-1 rounded-md text-xs sm:text-sm font-medium transition-colors cursor-pointer ${
                      active
                        ? "bg-[#2563EB] text-white shadow-xs"
                        : "text-slate-700 hover:text-[#0F172A] hover:bg-white/70"
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={handleResetDemo}
              title="Reset all demo tickets, ratings, and mentor hours to seed data"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E2E8F0] bg-white hover:bg-slate-50 text-xs sm:text-sm font-medium text-slate-700 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
              <span>Reset Demo</span>
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {children}
      </main>
    </div>
  );
}
