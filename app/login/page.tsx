"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, KeyRound } from "lucide-react";
import { useDemoStore } from "@/components/demo-store-provider";
import type { UserRole } from "@/lib/types";

const DEMO_CREDENTIALS: Record<UserRole, { email: string; label: string; route: string }> = {
  mentee: {
    email: "student.a42@demo.peerstack.local",
    label: "Student #A42 (Pseudonym: Mentee-A42)",
    route: "/mentee/new",
  },
  mentor: {
    email: "raka.pratama@demo.peerstack.local",
    label: "Raka Pratama (Verified Algorithms Mentor)",
    route: "/mentor/queue",
  },
  admin: {
    email: "supervisor@demo.peerstack.local",
    label: "Supervisor (Demo) - Informatics",
    route: "/admin/metrics",
  },
};

export default function LoginPage() {
  const router = useRouter();
  const { state, setRole } = useDemoStore();
  const [selectedRole, setSelectedRole] = useState<UserRole>(state.activeRole);
  const [password, setPassword] = useState("demo-prototype-2026");

  const activeCred = DEMO_CREDENTIALS[selectedRole];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRole(selectedRole);

    if (selectedRole === "admin") {
      router.push(activeCred.route);
      return;
    }

    const consentDone =
      selectedRole === "mentee"
        ? state.mentee.consent_accepted
        : state.mentor.consent_accepted;

    if (consentDone) {
      router.push(activeCred.route);
    } else {
      router.push("/consent");
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white border border-[#E2E8F0] rounded-xl p-6 sm:p-8 shadow-xs space-y-6">
      <div className="space-y-1.5">
        <div className="inline-flex items-center gap-2 text-xs font-semibold text-[#1D4ED8] bg-[#EFF6FF] px-2.5 py-1 rounded-full border border-blue-200">
          <KeyRound className="w-3.5 h-3.5" />
          <span>Mock Prototype Sign-In</span>
        </div>
        <h1 className="text-xl font-bold text-[#0F172A]">Sign In to PeerStack Demo</h1>
        <p className="text-sm text-slate-600">
          No external authentication is required. Select a pre-filled demo persona to continue.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label htmlFor="demo-role" className="block text-sm font-semibold text-[#0F172A]">
            Demo Role
          </label>
          <select
            id="demo-role"
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value as UserRole)}
            className="w-full rounded-lg border border-[#E2E8F0] bg-white px-3 py-2 text-sm text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
          >
            <option value="mentee">Mentee - Student #A42</option>
            <option value="mentor">Peer Mentor - Raka Pratama</option>
            <option value="admin">Course Supervisor (Demo)</option>
          </select>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="demo-email" className="block text-sm font-semibold text-[#0F172A]">
            Demo Account
          </label>
          <input
            id="demo-email"
            type="text"
            readOnly
            value={activeCred.email}
            className="w-full rounded-lg border border-[#E2E8F0] bg-slate-50 px-3 py-2 text-sm text-slate-700"
          />
          <p className="text-xs text-slate-500">{activeCred.label}</p>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="demo-password" className="block text-sm font-semibold text-[#0F172A]">
            Demo Passcode
          </label>
          <input
            id="demo-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-[#E2E8F0] bg-white px-3 py-2 text-sm text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
          />
        </div>

        <button
          type="submit"
          className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#2563EB] hover:bg-blue-700 text-white font-semibold text-sm transition-colors cursor-pointer"
        >
          <span>Sign In</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
