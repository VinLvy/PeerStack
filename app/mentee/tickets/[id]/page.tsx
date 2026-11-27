"use client";

import React, { use, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  Lock,
  MessageSquare,
  Sparkles,
  Star,
} from "lucide-react";
import { useDemoStore } from "@/components/demo-store-provider";
import { JavaCodeEditor } from "@/components/java-code-editor";
import { redact } from "@/lib/redact";
import type { TicketStatus, UnblockedStatus } from "@/lib/types";

const STATUS_META: Record<TicketStatus, { label: string; style: string }> = {
  pending_review: {
    label: "Pending Review",
    style: "bg-amber-50 text-[#D97706] border-amber-200",
  },
  in_review: {
    label: "Mentor Reviewing",
    style: "bg-[#EFF6FF] text-[#1D4ED8] border-blue-200",
  },
  delivered: {
    label: "Hints Delivered",
    style: "bg-emerald-50 text-[#059669] border-emerald-200",
  },
  closed: {
    label: "Closed",
    style: "bg-slate-100 text-slate-700 border-slate-300",
  },
};

export default function MenteeTicketDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { state, setRole, submitFollowUp, submitRating } = useDemoStore();

  const ticket = state.tickets.find((t) => t.id === id);

  const [showHint2, setShowHint2] = useState(false);
  const [followUpText, setFollowUpText] = useState("");
  const [clarity, setClarity] = useState<1 | 2 | 3 | 4 | 5>(5);
  const [unblocked, setUnblocked] = useState<UnblockedStatus>("yes");

  if (!ticket) {
    return (
      <div className="max-w-3xl mx-auto bg-white border border-[#E2E8F0] rounded-xl p-8 space-y-4">
        <h1 className="text-xl font-bold text-[#0F172A]">Ticket #{id} Not Found</h1>
        <p className="text-sm text-slate-600">
          This ticket may have been cleared when Demo Data was reset.
        </p>
        <Link
          href="/mentee/tickets"
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#2563EB] hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to My Tickets</span>
        </Link>
      </div>
    );
  }

  const statusMeta = STATUS_META[ticket.status];
  const hasHints =
    (ticket.status === "delivered" || ticket.status === "closed") &&
    ticket.delivered_message !== null;

  const handleFollowUpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!followUpText.trim() || ticket.followup) return;
    const sanitized = redact(followUpText.trim()).sanitizedText;
    submitFollowUp(ticket.id, sanitized);
    setFollowUpText("");
  };

  const handleRatingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitRating(ticket.id, clarity, unblocked);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            href="/mentee/tickets"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-[#0F172A]"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>My Tickets</span>
          </Link>
          <span className="text-slate-300">/</span>
          <h1 className="text-lg sm:text-xl font-bold text-[#0F172A]">
            Ticket #{ticket.id} - {ticket.topic_name}
          </h1>
          <span
            className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${statusMeta.style}`}
          >
            {statusMeta.label}
          </span>
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-[#64748B] border border-slate-200">
            <Lock className="w-3 h-3" />
            <span>{ticket.redactions_count} item(s) redacted</span>
          </span>
        </div>

        <span className="inline-flex items-center gap-1.5 text-xs text-slate-500">
          <Clock className="w-3.5 h-3.5" />
          <span>{ticket.created_at.slice(0, 16).replace("T", " ")}</span>
        </span>
      </div>

      {/* Hints Delivery Area */}
      {!hasHints ? (
        <section className="bg-[#EFF6FF] border border-blue-200 rounded-xl p-6 space-y-3">
          <div className="flex items-center gap-2 text-sm font-bold text-[#1D4ED8]">
            <Sparkles className="w-4 h-4" />
            <span>Waiting for Peer Mentor Review</span>
          </div>
          <p className="text-sm text-slate-700">
            Your redacted ticket is in the Peer Mentor queue. Once a verified senior mentor reviews the Socratic hints and passes Integrity Guardrail #2, your hints will appear here.
          </p>
          <button
            type="button"
            onClick={() => {
              setRole("mentor");
              router.push(`/mentor/tickets/${ticket.id}`);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#059669] hover:bg-emerald-700 text-white font-semibold text-sm cursor-pointer"
          >
            <span>Switch to Mentor View to Review This Ticket -&gt;</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </section>
      ) : (
        <section className="space-y-4">
          {/* Hint 1 */}
          <div className="bg-white border border-emerald-200 rounded-xl p-6 space-y-2 shadow-xs">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-[#059669] border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Hint 1 - Guiding Question (Guardrail #2 Passed)</span>
              </span>
              <span className="text-xs text-slate-500">
                Reviewed by {state.mentor.name}
              </span>
            </div>
            <p className="text-base text-[#0F172A] font-medium leading-relaxed">
              {ticket.delivered_message?.hint_1}
            </p>
          </div>

          {/* Expandable Hint 2 */}
          <div className="bg-white border border-[#E2E8F0] rounded-xl overflow-hidden shadow-xs">
            <button
              type="button"
              onClick={() => setShowHint2((prev) => !prev)}
              className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <div>
                <div className="text-sm font-bold text-[#2563EB]">
                  Need a closer pointer?
                </div>
                <div className="text-xs text-slate-500">
                  Try answering Hint 1 first, or expand Hint 2 for a specific line-level pointer.
                </div>
              </div>
              {showHint2 ? (
                <ChevronUp className="w-5 h-5 text-slate-500" />
              ) : (
                <ChevronDown className="w-5 h-5 text-slate-500" />
              )}
            </button>
            {showHint2 && (
              <div className="px-6 pb-5 pt-3 border-t border-[#E2E8F0] bg-[#EFF6FF]/60 space-y-1.5">
                <div className="text-xs font-semibold text-[#1D4ED8]">
                  Hint 2 - Specific Pointer
                </div>
                <p className="text-base text-[#0F172A] leading-relaxed">
                  {ticket.delivered_message?.hint_2}
                </p>
              </div>
            )}
          </div>

          {/* Clarity Rating & Unblocked Status (Primary Action) */}
          <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 space-y-4 shadow-xs">
            <h2 className="text-base font-bold text-[#0F172A]">
              Rate Clarity &amp; Unblocked Outcome
            </h2>

            {ticket.rating ? (
              <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-4 flex flex-wrap items-center justify-between gap-3">
                <div className="space-y-1 text-sm text-[#059669]">
                  <div className="font-bold">
                    Feedback Recorded: {ticket.rating.clarity}/5 Clarity | Unblocked:{" "}
                    {ticket.rating.unblocked === "yes"
                      ? "Yes, unblocked"
                      : ticket.rating.unblocked === "partly"
                        ? "Partly"
                        : "No, still stuck"}
                  </div>
                  <div className="text-xs">
                    Mentor Hour Log and Admin Pilot Metrics have been updated live.
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setRole("admin");
                    router.push("/admin/metrics");
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#0F172A] hover:bg-slate-800 text-white text-xs sm:text-sm font-semibold cursor-pointer"
                >
                  <span>View Live Admin Metrics -&gt;</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <form onSubmit={handleRatingSubmit} className="space-y-4">
                <div className="space-y-2">
                  <div className="text-sm font-semibold text-[#0F172A]">
                    Clarity Rating (1-5 Stars)
                  </div>
                  <div className="flex items-center gap-2">
                    {([1, 2, 3, 4, 5] as const).map((score) => (
                      <button
                        key={score}
                        type="button"
                        onClick={() => setClarity(score)}
                        aria-label={`Rate ${score} out of 5`}
                        className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border text-sm font-semibold cursor-pointer ${
                          clarity >= score
                            ? "bg-amber-50 border-amber-300 text-[#D97706]"
                            : "bg-white border-[#E2E8F0] text-slate-400"
                        }`}
                      >
                        <Star
                          className={`w-4 h-4 ${
                            clarity >= score ? "fill-amber-400 text-amber-500" : ""
                          }`}
                        />
                        <span>{score}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-sm font-semibold text-[#0F172A]">
                    Did these hints unblock your debugging?
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {(
                      [
                        { value: "yes", label: "Yes, unblocked" },
                        { value: "partly", label: "Partly" },
                        { value: "no", label: "No, still stuck" },
                      ] as const
                    ).map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setUnblocked(opt.value)}
                        className={`px-3.5 py-2 rounded-lg border text-sm font-semibold cursor-pointer ${
                          unblocked === opt.value
                            ? "bg-[#EFF6FF] border-[#2563EB] text-[#1D4ED8]"
                            : "bg-white border-[#E2E8F0] text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#2563EB] hover:bg-blue-700 text-white font-semibold text-sm cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Submit Rating &amp; Close Ticket</span>
                </button>
              </form>
            )}
          </div>

          {/* Optional 1-Round Follow-Up (Simulated) */}
          <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 space-y-3 shadow-xs">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-sm font-bold text-[#0F172A]">
                <MessageSquare className="w-4 h-4 text-[#2563EB]" />
                <span>Optional 1-Round Follow-Up</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-[#EFF6FF] text-[#1D4ED8] border border-blue-200">
                  Simulated
                </span>
                <span className="text-xs font-semibold text-slate-600">
                  {ticket.followup ? "1/1 used" : "0/1 used"}
                </span>
              </div>
            </div>

            {ticket.followup ? (
              <div className="space-y-2 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] p-4 text-sm">
                <div>
                  <strong className="text-[#0F172A]">Your follow-up:</strong>{" "}
                  <span className="text-slate-700">{ticket.followup.question_sanitized}</span>
                </div>
                <div className="text-xs text-[#1D4ED8] bg-[#EFF6FF] border border-blue-200 rounded-md p-2.5">
                  {ticket.followup.simulated_reply}
                </div>
              </div>
            ) : (
              <form onSubmit={handleFollowUpSubmit} className="space-y-2.5">
                <textarea
                  rows={2}
                  value={followUpText}
                  onChange={(e) => setFollowUpText(e.target.value)}
                  placeholder="Ask one concise clarifying question if you are still unsure after trying Hint 1 and Hint 2 (Simulated - no live reply in prototype)..."
                  className="w-full rounded-lg border border-[#E2E8F0] px-3 py-2 text-sm text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                />
                <button
                  type="submit"
                  disabled={!followUpText.trim()}
                  className="px-4 py-2 rounded-lg border border-[#E2E8F0] bg-white hover:bg-slate-50 disabled:opacity-50 text-xs font-semibold text-[#0F172A] cursor-pointer"
                >
                  Log Follow-Up (Simulated, 0/1)
                </button>
              </form>
            )}
          </div>
        </section>
      )}

      {/* Sanitized Ticket Reference */}
      <section className="bg-white border border-[#E2E8F0] rounded-xl p-6 space-y-4 shadow-xs">
        <h2 className="text-base font-bold text-[#0F172A]">Sanitized Ticket Summary</h2>

        <JavaCodeEditor
          value={ticket.code_sanitized}
          readOnly
          highlightedLines={ticket.highlighted_lines}
          height="230px"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Sanitized Error Log
            </div>
            <pre className="rounded-lg bg-[#0F172A] text-slate-100 font-mono text-sm p-3 overflow-x-auto whitespace-pre-wrap">
              {ticket.error_log_sanitized || "(No error log provided)"}
            </pre>
          </div>
          <div className="space-y-1">
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              What I Already Tried
            </div>
            <div className="rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] p-3 text-sm text-[#0F172A]">
              {ticket.description_sanitized}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
