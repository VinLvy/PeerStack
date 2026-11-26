"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Code2,
  Lock,
  ShieldAlert,
  Sparkles,
  UserCheck,
} from "lucide-react";
import { useDemoStore } from "@/components/demo-store-provider";
import type { UserRole } from "@/lib/types";

export default function LandingPage() {
  const router = useRouter();
  const { setRole } = useDemoStore();

  const enterAsRole = (role: UserRole, destination: string) => {
    setRole(role);
    router.push(destination);
  };

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <section className="bg-white border border-[#E2E8F0] rounded-xl p-6 sm:p-8 shadow-xs">
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EFF6FF] text-[#1D4ED8] border border-blue-200 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>STACK 2026 Semifinal Prototype | IF101 Algorithms (Java)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#0F172A] tracking-tight">
            Agentic Socratic Peer-Mentoring Without Giving Away the Answer
          </h1>
          <p className="text-base text-slate-600">
            PeerStack helps first-semester students debug Java assignments outside lab hours through deterministic PII redaction, Socratic hint drafting, integrity guardrails, and verified senior peer mentors with weekly burnout caps.
          </p>
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <button
              type="button"
              onClick={() => enterAsRole("mentee", "/mentee/new")}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#2563EB] hover:bg-blue-700 text-white font-semibold text-sm transition-colors cursor-pointer"
            >
              <span>Start Live Demo as Mentee</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-[#E2E8F0] bg-white hover:bg-slate-50 text-[#0F172A] font-medium text-sm transition-colors"
            >
              <span>Open Demo Sign-In &amp; Consent Flow</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Architecture Flow Strip */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 space-y-2">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#64748B]">
            <Lock className="w-4 h-4" />
            <span>1. Real Regex Redaction</span>
          </div>
          <p className="text-sm text-slate-600">
            Strips student names, NIM, emails, API keys, and paths in-browser before any AI step runs.
          </p>
        </div>

        <div className="bg-[#EFF6FF] border border-blue-200 rounded-xl p-4 space-y-2">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1D4ED8]">
            <Sparkles className="w-4 h-4" />
            <span>2. Socratic Draft (Simulated)</span>
          </div>
          <p className="text-sm text-slate-700">
            Isolates failing Java lines and drafts a Guiding Question plus a Specific Pointer.
          </p>
        </div>

        <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 space-y-2">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#DC2626]">
            <ShieldAlert className="w-4 h-4" />
            <span>3. Integrity Guardrail</span>
          </div>
          <p className="text-sm text-slate-600">
            Blocks fenced code blocks, full Java methods, or direct solutions on both AI drafts and mentor edits.
          </p>
        </div>

        <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 space-y-2">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#059669]">
            <CheckCircle2 className="w-4 h-4" />
            <span>4. Capped Mentor Gate</span>
          </div>
          <p className="text-sm text-slate-600">
            Verified senior mentors review within a 3 tickets/week cap and log verified mentoring hours.
          </p>
        </div>
      </section>

      {/* 3 Quick-Entry Role Cards */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-[#0F172A]">Choose a Demo Perspective</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Mentee Card */}
          <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 flex flex-col justify-between gap-4">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 text-sm font-semibold text-[#2563EB]">
                <Code2 className="w-4 h-4" />
                <span>First-Semester Student</span>
              </div>
              <h3 className="text-base font-bold text-[#0F172A]">Mentee (Student #A42)</h3>
              <p className="text-sm text-slate-600">
                Submit a Java bug with one-click sample code, see live redaction and the 5-step pipeline, then receive and rate Socratic hints.
              </p>
            </div>
            <button
              type="button"
              onClick={() => enterAsRole("mentee", "/mentee/new")}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#2563EB] hover:bg-blue-700 text-white font-semibold text-sm transition-colors cursor-pointer"
            >
              <span>Enter as Mentee</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Mentor Card */}
          <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 flex flex-col justify-between gap-4">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 text-sm font-semibold text-[#059669]">
                <UserCheck className="w-4 h-4" />
                <span>Senior Algorithms Grader</span>
              </div>
              <h3 className="text-base font-bold text-[#0F172A]">Peer Mentor (Raka Pratama)</h3>
              <p className="text-sm text-slate-600">
                Review sanitized Java tickets in a 2-column workspace, test Guardrail #2 leak blocking, respect the 3-ticket weekly cap, and export CSV hours.
              </p>
            </div>
            <button
              type="button"
              onClick={() => enterAsRole("mentor", "/mentor/queue")}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#059669] hover:bg-emerald-700 text-white font-semibold text-sm transition-colors cursor-pointer"
            >
              <span>Enter as Peer Mentor</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Admin Card */}
          <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 flex flex-col justify-between gap-4">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 text-sm font-semibold text-[#1D4ED8]">
                <BarChart3 className="w-4 h-4" />
                <span>Informatics Course Lead</span>
              </div>
              <h3 className="text-base font-bold text-[#0F172A]">Course Supervisor (Demo)</h3>
              <p className="text-sm text-slate-600">
                Verify senior mentor grade credentials and inspect live-updating M1-M8 pilot evaluation metrics (simulated data).
              </p>
            </div>
            <button
              type="button"
              onClick={() => enterAsRole("admin", "/admin/metrics")}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#0F172A] hover:bg-slate-800 text-white font-semibold text-sm transition-colors cursor-pointer"
            >
              <span>Enter as Course Supervisor</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
