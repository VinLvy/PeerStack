"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, CheckCircle2, Info, ShieldCheck } from "lucide-react";
import { useDemoStore } from "@/components/demo-store-provider";

export default function ConsentPage() {
  const router = useRouter();
  const { state, acceptConsent } = useDemoStore();
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const [pseudonymPolicy, setPseudonymPolicy] = useState(false);
  const [aiRetentionPolicy, setAiRetentionPolicy] = useState(false);

  const allChecked = ageConfirmed && pseudonymPolicy && aiRetentionPolicy;

  const targetRole = state.activeRole === "mentor" ? "mentor" : "mentee";
  const dashboardRoute = targetRole === "mentor" ? "/mentor/queue" : "/mentee/new";

  const handleAccept = (e: React.FormEvent) => {
    e.preventDefault();
    if (!allChecked) return;
    acceptConsent(targetRole);
    router.push(dashboardRoute);
  };

  return (
    <div className="max-w-2xl mx-auto bg-white border border-[#E2E8F0] rounded-xl p-6 sm:p-8 shadow-xs space-y-6">
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 text-xs font-semibold text-[#059669] bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Data Privacy &amp; Ethics Consent</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-[#0F172A]">
          Participant Consent &amp; Data Handling Notice
        </h1>
        <p className="text-sm text-slate-600">
          Active Role: <strong className="text-[#0F172A] capitalize">{targetRole}</strong>. Please review and accept all three terms before continuing to the workspace.
        </p>
      </div>

      <div className="rounded-lg bg-[#EFF6FF] border border-blue-200 p-4 flex items-start gap-3">
        <Info className="w-5 h-5 text-[#1D4ED8] shrink-0 mt-0.5" />
        <div className="text-sm text-[#1D4ED8]">
          <strong>Prototype Privacy Notice:</strong> In this interactive Semifinal prototype, all state is stored locally in your browser via <code className="font-mono">localStorage</code> and <strong>no data leaves the browser</strong>.
        </div>
      </div>

      <form onSubmit={handleAccept} className="space-y-4">
        <label className="flex items-start gap-3 p-4 rounded-lg border border-[#E2E8F0] hover:bg-slate-50 cursor-pointer">
          <input
            type="checkbox"
            checked={ageConfirmed}
            onChange={(e) => setAgeConfirmed(e.target.checked)}
            className="mt-1 h-4 w-4 rounded border-slate-300 text-[#2563EB] focus:ring-[#2563EB]"
          />
          <span className="text-sm text-[#0F172A]">
            <strong>1. Age Confirmation (18+):</strong> I confirm that I am at least 18 years old and participating in an undergraduate Informatics course pilot.
          </span>
        </label>

        <label className="flex items-start gap-3 p-4 rounded-lg border border-[#E2E8F0] hover:bg-slate-50 cursor-pointer">
          <input
            type="checkbox"
            checked={pseudonymPolicy}
            onChange={(e) => setPseudonymPolicy(e.target.checked)}
            className="mt-1 h-4 w-4 rounded border-slate-300 text-[#2563EB] focus:ring-[#2563EB]"
          />
          <span className="text-sm text-[#0F172A]">
            <strong>2. Pseudonymous Visibility &amp; Supervisor Override:</strong> I understand my identity is masked to Peer Mentors (e.g., <code className="font-mono">Mentee-A42</code>), while Course Supervisors retain abuse-override access in cases of academic misconduct or safety escalation.
          </span>
        </label>

        <label className="flex items-start gap-3 p-4 rounded-lg border border-[#E2E8F0] hover:bg-slate-50 cursor-pointer">
          <input
            type="checkbox"
            checked={aiRetentionPolicy}
            onChange={(e) => setAiRetentionPolicy(e.target.checked)}
            className="mt-1 h-4 w-4 rounded border-slate-300 text-[#2563EB] focus:ring-[#2563EB]"
          />
          <span className="text-sm text-[#0F172A]">
            <strong>3. Redacted AI Processing &amp; 30-Day Retention:</strong> I consent to redacted code snippets and error logs being processed by AI (Google Gemini API in production) with a 30-day retention policy. In this prototype, no data leaves the browser.
          </span>
        </label>

        <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
          {state.mentee.consent_accepted || state.mentor.consent_accepted ? (
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#059669]">
              <CheckCircle2 className="w-4 h-4" />
              <span>Consent status saved in local prototype state.</span>
            </span>
          ) : (
            <span className="text-xs text-slate-500">
              All 3 confirmations are required to continue.
            </span>
          )}

          <button
            type="submit"
            disabled={!allChecked}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#2563EB] hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-semibold text-sm transition-colors cursor-pointer"
          >
            <span>Accept &amp; Continue</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
}
