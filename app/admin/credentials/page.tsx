"use client";

import React from "react";
import { CheckCircle2, ShieldAlert, UserCheck, XCircle } from "lucide-react";
import { useDemoStore } from "@/components/demo-store-provider";
import type { CredentialStatus } from "@/lib/types";

const STATUS_STYLE: Record<CredentialStatus, string> = {
  verified: "bg-emerald-50 text-[#059669] border-emerald-200",
  pending: "bg-amber-50 text-[#D97706] border-amber-200",
  rejected: "bg-red-50 text-[#DC2626] border-red-200",
};

export default function AdminCredentialsPage() {
  const { state, updateCredentialStatus } = useDemoStore();

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#EFF6FF] text-[#1D4ED8] border border-blue-200">
            <UserCheck className="w-3.5 h-3.5" />
            <span>Course Supervisor ({state.admin.name}) | Simulated Seed Queue</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#0F172A]">
            Senior Peer Mentor Credential Verification
          </h1>
          <p className="text-sm text-slate-600">
            Only senior Informatics students with verified high grades (A/AB) and clean academic integrity records receive Peer Mentor badges.
          </p>
        </div>
      </div>

      <div className="bg-white border border-[#E2E8F0] rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-[#E2E8F0] text-xs font-semibold text-slate-600">
                <th className="py-3.5 px-4">Mentor Candidate</th>
                <th className="py-3.5 px-4">Semester</th>
                <th className="py-3.5 px-4">Course</th>
                <th className="py-3.5 px-4">Grade</th>
                <th className="py-3.5 px-4">Academic Integrity</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Supervisor Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0]">
              {state.credentials.map((candidate) => (
                <tr key={candidate.id} className="hover:bg-slate-50/70">
                  <td className="py-3.5 px-4 font-semibold text-[#0F172A]">
                    {candidate.name}
                  </td>
                  <td className="py-3.5 px-4 text-slate-700">
                    Semester {candidate.semester}
                  </td>
                  <td className="py-3.5 px-4 text-slate-700">
                    {candidate.course_name}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded-md font-mono font-bold bg-slate-100 text-[#0F172A]">
                      {candidate.grade}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center gap-1 text-xs font-semibold ${
                        candidate.academic_integrity.includes("Flagged")
                          ? "text-[#DC2626]"
                          : "text-[#059669]"
                      }`}
                    >
                      {candidate.academic_integrity.includes("Flagged") ? (
                        <ShieldAlert className="w-3.5 h-3.5" />
                      ) : (
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      )}
                      <span>{candidate.academic_integrity}</span>
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border capitalize ${
                        STATUS_STYLE[candidate.status]
                      }`}
                    >
                      {candidate.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="inline-flex items-center gap-2">
                      <button
                        type="button"
                        disabled={candidate.status === "verified"}
                        onClick={() => updateCredentialStatus(candidate.id, "verified")}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#059669] hover:bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white text-xs font-semibold cursor-pointer"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Verify Badge</span>
                      </button>
                      <button
                        type="button"
                        disabled={candidate.status === "rejected"}
                        onClick={() => updateCredentialStatus(candidate.id, "rejected")}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-red-200 bg-white hover:bg-red-50 disabled:opacity-40 disabled:cursor-not-allowed text-[#DC2626] text-xs font-semibold cursor-pointer"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Reject</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
