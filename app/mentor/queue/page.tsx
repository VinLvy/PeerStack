"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock,
  Lock,
  Sparkles,
  UserCheck,
} from "lucide-react";
import { useDemoStore } from "@/components/demo-store-provider";

export default function MentorQueuePage() {
  const router = useRouter();
  const { state, claimTicket } = useDemoStore();
  const [claimError, setClaimError] = useState<string>("");

  const claimedTickets = state.tickets.filter(
    (t) => t.claimed_by === state.mentor.id
  );
  const claimedCount = claimedTickets.length;
  const capReached = claimedCount >= state.mentor.weekly_cap;

  const totalMinutes = state.hourLogs
    .filter((l) => l.mentor_id === state.mentor.id)
    .reduce((acc, item) => acc + item.review_minutes, 0);
  const totalHours = totalMinutes / 60;

  const openQueueTickets = state.tickets.filter(
    (t) => t.status === "pending_review" || t.status === "in_review"
  );
  const resolvedTickets = state.tickets.filter(
    (t) => t.status === "delivered" || t.status === "closed"
  );

  const handleClaimAndReview = (ticketId: string) => {
    const res = claimTicket(ticketId);
    if (!res.ok) {
      setClaimError(res.error ?? "Unable to claim ticket.");
      return;
    }
    setClaimError("");
    router.push(`/mentor/tickets/${ticketId}`);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Mentor Profile & Weekly Cap Header */}
      <section className="bg-white border border-[#E2E8F0] rounded-xl p-6 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-[#059669] border border-emerald-200 text-xs font-semibold">
              <UserCheck className="w-3.5 h-3.5" />
              <span>{state.mentor.verified_badge}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#0F172A]">
              Peer Mentor Queue ({state.mentor.name})
            </h1>
            <p className="text-sm text-slate-600">
              Review redacted Java tickets, check Integrity Guardrail #2, and keep mentoring hours sustainable.
            </p>
          </div>

          {/* Weekly Cap Widget */}
          <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4 min-w-[240px] space-y-2">
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Weekly Cap Widget
            </div>
            <div className="flex items-baseline justify-between gap-4">
              <div>
                <div className="text-lg font-bold text-[#0F172A]">
                  {claimedCount} / {state.mentor.weekly_cap} Tickets
                </div>
                <div className="text-xs text-slate-600">
                  {totalHours.toFixed(2)} / {state.mentor.weekly_hour_cap.toFixed(1)} hrs logged
                </div>
              </div>
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${
                  capReached
                    ? "bg-amber-50 text-[#D97706] border-amber-200"
                    : "bg-emerald-50 text-[#059669] border-emerald-200"
                }`}
              >
                {capReached ? "Cap Reached" : "Available"}
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
              <div
                className={`h-full transition-all ${
                  capReached ? "bg-[#D97706]" : "bg-[#059669]"
                }`}
                style={{
                  width: `${Math.min(100, (claimedCount / state.mentor.weekly_cap) * 100)}%`,
                }}
              />
            </div>
          </div>
        </div>

        {capReached && (
          <div className="rounded-lg bg-amber-50 border border-amber-200 p-3.5 flex items-center gap-2.5 text-sm text-[#D97706] font-medium">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>
              Weekly cap reached ({claimedCount}/{state.mentor.weekly_cap} tickets). Queue paused to prevent mentor burnout.
            </span>
          </div>
        )}

        {claimError && (
          <div className="rounded-lg bg-red-50 border border-red-200 p-3.5 text-sm text-[#DC2626]">
            {claimError}
          </div>
        )}
      </section>

      {/* Open Queue */}
      <section className="space-y-3">
        <h2 className="text-lg font-bold text-[#0F172A]">
          Open Review Queue ({openQueueTickets.length})
        </h2>

        {openQueueTickets.length === 0 ? (
          <div className="bg-white border border-[#E2E8F0] rounded-xl p-8 text-center text-sm text-slate-600">
            No pending tickets in the queue. Submit a ticket as Mentee or Reset Demo to reload seed tickets.
          </div>
        ) : (
          <div className="space-y-3">
            {openQueueTickets.map((ticket) => {
              const alreadyClaimedByMe = ticket.claimed_by === state.mentor.id;
              const claimDisabled = capReached && !alreadyClaimedByMe;

              return (
                <div
                  key={ticket.id}
                  className="bg-white border border-[#E2E8F0] rounded-xl p-5 flex flex-wrap items-center justify-between gap-4"
                >
                  <div className="space-y-1.5 max-w-2xl">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-sm font-bold text-[#0F172A]">
                        #{ticket.id}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                        {ticket.mentee_pseudonym}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                        {ticket.topic_name}
                      </span>
                      {ticket.arm === "assisted" ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#EFF6FF] text-[#1D4ED8] border border-blue-200">
                          <Sparkles className="w-3 h-3" />
                          <span>AI Draft Ready (Simulated)</span>
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-[#D97706] border border-amber-200">
                          Manual Arm (No AI Draft)
                        </span>
                      )}
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-slate-50 text-[#64748B] border border-slate-200">
                        <Lock className="w-3 h-3" />
                        <span>{ticket.redactions_count} stripped</span>
                      </span>
                    </div>

                    <p className="text-sm text-slate-700 line-clamp-2">
                      {ticket.description_sanitized}
                    </p>

                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      <span className="inline-flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Submitted {ticket.created_at.slice(0, 16).replace("T", " ")}</span>
                      </span>
                      {alreadyClaimedByMe && (
                        <span className="text-[#059669] font-semibold">
                          Claimed by you
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={claimDisabled}
                    onClick={() => handleClaimAndReview(ticket.id)}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#059669] hover:bg-emerald-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-semibold text-sm transition-colors cursor-pointer"
                  >
                    <span>
                      {alreadyClaimedByMe ? "Continue Review" : "Claim & Review"}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Recently Delivered / Closed */}
      {resolvedTickets.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-base font-bold text-[#0F172A]">
            Recently Delivered / Closed ({resolvedTickets.length})
          </h2>
          <div className="space-y-2">
            {resolvedTickets.map((ticket) => (
              <div
                key={ticket.id}
                className="bg-white border border-[#E2E8F0] rounded-xl p-4 flex flex-wrap items-center justify-between gap-3"
              >
                <div className="flex flex-wrap items-center gap-2 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-[#059669]" />
                  <span className="font-mono font-bold">#{ticket.id}</span>
                  <span className="text-slate-600">
                    {ticket.topic_name} | {ticket.mentee_pseudonym}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-[#059669] border border-emerald-200 capitalize">
                    {ticket.status}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => router.push(`/mentor/tickets/${ticket.id}`)}
                  className="text-sm font-semibold text-[#2563EB] hover:underline cursor-pointer"
                >
                  Inspect Record
                </button>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
