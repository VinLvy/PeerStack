"use client";

import React, { use, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  Lock,
  RotateCcw,
  Send,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { useDemoStore } from "@/components/demo-store-provider";
import { JavaCodeEditor } from "@/components/java-code-editor";
import { checkGuardrail } from "@/lib/guardrail";
import type { MentorDeliveryAction } from "@/lib/types";

const FULL_SOLUTION_DEMO_SNIPPET = `Use this full method:
\`\`\`java
public static int factorial(int n) {
    if (n <= 1) return 1;
    return n * factorial(n - 1);
}
\`\`\``;

function formatDuration(totalSeconds: number): string {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

export default function MentorTicketWorkspacePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { state, setRole, deliverHints } = useDemoStore();

  const ticket = state.tickets.find((t) => t.id === id);

  const [hint1, setHint1] = useState<string>("");
  const [hint2, setHint2] = useState<string>("");
  const [initializedForId, setInitializedForId] = useState<string>("");
  const [rejectMode, setRejectMode] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [confirmFlagged, setConfirmFlagged] = useState(false);
  const [showSimilar, setShowSimilar] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [submitError, setSubmitError] = useState("");
  const [deliveredNow, setDeliveredNow] = useState(false);

  useEffect(() => {
    if (!ticket) return;
    if (initializedForId !== ticket.id) {
      if (ticket.delivered_message) {
        setHint1(ticket.delivered_message.hint_1);
        setHint2(ticket.delivered_message.hint_2);
      } else if (ticket.ai_draft) {
        setHint1(ticket.ai_draft.hint_1);
        setHint2(ticket.ai_draft.hint_2);
      } else {
        setHint1("");
        setHint2("");
      }
      setInitializedForId(ticket.id);
      setRejectMode(false);
      setRejectionReason("");
      setConfirmFlagged(false);
      setSubmitError("");
      setDeliveredNow(false);
      setElapsedSeconds(0);
    }
  }, [initializedForId, ticket]);

  const isAlreadyDelivered =
    ticket?.status === "delivered" || ticket?.status === "closed";

  useEffect(() => {
    if (!ticket || isAlreadyDelivered) return;
    const interval = window.setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => window.clearInterval(interval);
  }, [isAlreadyDelivered, ticket]);

  if (!ticket) {
    return (
      <div className="max-w-3xl mx-auto bg-white border border-[#E2E8F0] rounded-xl p-8 space-y-4">
        <h1 className="text-xl font-bold text-[#0F172A]">Ticket #{id} Not Found</h1>
        <p className="text-sm text-slate-600">
          This ticket may have been cleared when Demo Data was reset.
        </p>
        <Link
          href="/mentor/queue"
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#2563EB] hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Mentor Queue</span>
        </Link>
      </div>
    );
  }

  const combinedText = `${hint1}\n\n${hint2}`;
  const guardrail2 = checkGuardrail(combinedText);
  const isBlocked = guardrail2.verdict === "block";
  const isFlagged = guardrail2.verdict === "flag";
  const draftEdited =
    ticket.ai_draft !== null &&
    (hint1.trim() !== ticket.ai_draft.hint_1.trim() ||
      hint2.trim() !== ticket.ai_draft.hint_2.trim());

  const handleTestGuardrailBlock = () => {
    setHint2(FULL_SOLUTION_DEMO_SNIPPET);
    setConfirmFlagged(false);
    setSubmitError("");
  };

  const handleRestoreAiDraft = () => {
    if (ticket.ai_draft) {
      setHint1(ticket.ai_draft.hint_1);
      setHint2(ticket.ai_draft.hint_2);
      setRejectMode(false);
      setConfirmFlagged(false);
      setSubmitError("");
    }
  };

  const handleStartReject = () => {
    setRejectMode(true);
    setHint1("");
    setHint2("");
    setConfirmFlagged(false);
    setSubmitError("");
  };

  const handleDeliver = (action: MentorDeliveryAction) => {
    if (!hint1.trim() || !hint2.trim()) {
      setSubmitError("Both Hint 1 and Hint 2 are required before sending.");
      return;
    }
    if (action === "rejected_rewritten" && rejectionReason.trim().length < 5) {
      setSubmitError("Please enter a short reason for rejecting the AI draft.");
      return;
    }
    const freshCheck = checkGuardrail(`${hint1}\n\n${hint2}`);
    if (freshCheck.verdict === "block") {
      setSubmitError(freshCheck.reason);
      return;
    }
    if (freshCheck.verdict === "flag" && !confirmFlagged) {
      setSubmitError(
        'Please tick "I confirm this does not give away the full solution" before sending.'
      );
      return;
    }

    const reviewMinutes = Math.max(1, Math.round(elapsedSeconds / 60));
    const res = deliverHints(ticket.id, {
      hint_1: hint1.trim(),
      hint_2: hint2.trim(),
      action,
      rejection_reason:
        action === "rejected_rewritten" ? rejectionReason.trim() : undefined,
      guardrail_2: freshCheck,
      mentor_confirmed_flag: confirmFlagged,
      review_minutes: reviewMinutes,
    });

    if (!res.ok) {
      setSubmitError(res.error ?? "Delivery failed.");
      return;
    }

    setSubmitError("");
    setDeliveredNow(true);
  };

  return (
    <div className="space-y-5">
      {/* Top Breadcrumb & Status */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/mentor/queue"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-[#0F172A]"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Queue</span>
          </Link>
          <span className="text-slate-300">/</span>
          <h1 className="text-lg sm:text-xl font-bold text-[#0F172A]">
            Review Ticket #{ticket.id} ({ticket.topic_name})
          </h1>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
            {ticket.mentee_pseudonym}
          </span>
          <span
            className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
              ticket.arm === "assisted"
                ? "bg-[#EFF6FF] text-[#1D4ED8] border-blue-200"
                : "bg-amber-50 text-[#D97706] border-amber-200"
            }`}
          >
            {ticket.arm === "assisted" ? "Assisted Arm (Simulated AI)" : "Manual Arm"}
          </span>
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white border border-[#E2E8F0] text-sm font-mono font-semibold text-[#0F172A]">
          <Clock className="w-4 h-4 text-[#059669]" />
          <span>Review Timer: {formatDuration(elapsedSeconds)}</span>
        </div>
      </div>

      {deliveredNow && (
        <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 text-sm font-semibold text-[#059669]">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>
              Hints delivered to {ticket.mentee_pseudonym}! Weekly load and Verified Hour Log updated.
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/mentor/queue"
              className="px-3 py-1.5 rounded-lg border border-emerald-300 bg-white text-xs sm:text-sm font-semibold text-[#059669]"
            >
              Back to Queue
            </Link>
            <button
              type="button"
              onClick={() => {
                setRole("mentee");
                router.push(`/mentee/tickets/${ticket.id}`);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-[#2563EB] hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold cursor-pointer"
            >
              <span>Switch to Mentee View -&gt;</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* 2-Column Workspace */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        {/* Left Column: Sanitized Ticket */}
        <section className="bg-white border border-[#E2E8F0] rounded-xl p-5 space-y-4 shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-base font-bold text-[#0F172A]">
              Sanitized Student Submission
            </h2>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-[#64748B] border border-slate-200">
              <Lock className="w-3.5 h-3.5" />
              <span>
                {ticket.redactions_count} sensitive item(s) stripped
                {ticket.redacted_types.length > 0
                  ? ` (${ticket.redacted_types.join(", ")})`
                  : ""}
              </span>
            </span>
          </div>

          <div className="space-y-1.5">
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Sanitized Java Code (Read-Only)
            </div>
            <JavaCodeEditor
              value={ticket.code_sanitized}
              readOnly
              highlightedLines={ticket.highlighted_lines}
              height="250px"
            />
          </div>

          <div className="space-y-1.5">
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Sanitized Error Log
            </div>
            <pre className="rounded-lg bg-[#0F172A] text-slate-100 font-mono text-sm p-3 overflow-x-auto whitespace-pre-wrap border border-slate-700">
              {ticket.error_log_sanitized || "(No error log provided)"}
            </pre>
          </div>

          <div className="space-y-1.5">
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              What the Mentee Already Tried
            </div>
            <div className="rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] p-3 text-sm text-[#0F172A]">
              {ticket.description_sanitized}
            </div>
          </div>

          {ticket.similar_ticket_note && (
            <div className="rounded-lg border border-blue-200 bg-[#EFF6FF] overflow-hidden">
              <button
                type="button"
                onClick={() => setShowSimilar((prev) => !prev)}
                className="w-full px-3.5 py-2.5 flex items-center justify-between text-xs font-semibold text-[#1D4ED8] cursor-pointer"
              >
                <span>Similar Past Ticket (Simulated)</span>
                {showSimilar ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>
              {showSimilar && (
                <div className="px-3.5 pb-3 text-sm text-slate-700 border-t border-blue-200 pt-2">
                  {ticket.similar_ticket_note}
                </div>
              )}
            </div>
          )}
        </section>

        {/* Right Column: Review, Hint Editor & Integrity Guardrail #2 */}
        <section className="bg-white border border-[#E2E8F0] rounded-xl p-5 space-y-4 shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-base font-bold text-[#0F172A]">
              Mentor Socratic Review
            </h2>
            {ticket.ai_draft && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-[#059669] border border-emerald-200">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Guardrail #1: {ticket.ai_draft.guardrail_1.verdict.toUpperCase()}</span>
              </span>
            )}
          </div>

          {ticket.triage_summary && (
            <div className="rounded-lg bg-[#EFF6FF] border border-blue-200 p-3.5 space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-[#1D4ED8]">
                <Sparkles className="w-3.5 h-3.5" />
                <span>
                  {ticket.arm === "assisted" ? "Triage Summary (Simulated)" : "Arm Context"}
                </span>
              </div>
              <p className="text-sm text-slate-700">{ticket.triage_summary}</p>
            </div>
          )}

          {/* Demo Guardrail Helper Toolbar */}
          {!isAlreadyDelivered && (
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleTestGuardrailBlock}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-200 bg-red-50 hover:bg-red-100 text-xs font-semibold text-[#DC2626] cursor-pointer"
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Test Guardrail (Paste Full Solution)</span>
              </button>
              {ticket.ai_draft && (
                <button
                  type="button"
                  onClick={handleRestoreAiDraft}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E2E8F0] bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Restore Draft</span>
                </button>
              )}
            </div>
          )}

          {/* Hint Editors */}
          <div className="space-y-3">
            <div className="space-y-1.5">
              <label htmlFor="hint-1" className="block text-sm font-semibold text-[#0F172A]">
                Hint 1 - Guiding Question
              </label>
              <textarea
                id="hint-1"
                rows={3}
                disabled={isAlreadyDelivered}
                value={hint1}
                onChange={(e) => {
                  setHint1(e.target.value);
                  setConfirmFlagged(false);
                }}
                placeholder="Ask a focused Socratic question to guide the student's trace..."
                className="w-full rounded-lg border border-[#E2E8F0] bg-white disabled:bg-slate-50 px-3 py-2 text-sm text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="hint-2" className="block text-sm font-semibold text-[#0F172A]">
                Hint 2 - Specific Pointer (Expandable for Mentee)
              </label>
              <textarea
                id="hint-2"
                rows={4}
                disabled={isAlreadyDelivered}
                value={hint2}
                onChange={(e) => {
                  setHint2(e.target.value);
                  setConfirmFlagged(false);
                }}
                placeholder="Point to the exact line range or concept without pasting replacement Java code..."
                className="w-full rounded-lg border border-[#E2E8F0] bg-white disabled:bg-slate-50 px-3 py-2 text-sm text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
              />
            </div>
          </div>

          {rejectMode && !isAlreadyDelivered && (
            <div className="space-y-1.5 rounded-lg bg-amber-50/70 border border-amber-200 p-3">
              <label
                htmlFor="rejection-reason"
                className="block text-xs font-semibold text-[#D97706]"
              >
                Reason for Rejecting AI Draft (Required)
              </label>
              <input
                id="rejection-reason"
                type="text"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="e.g., Draft missed off-by-one loop focus; writing clearer pointer."
                className="w-full rounded-lg border border-amber-300 bg-white px-3 py-2 text-sm text-[#0F172A]"
              />
            </div>
          )}

          {/* Live Integrity Guardrail #2 Feedback */}
          {isBlocked && (
            <div
              role="alert"
              className="rounded-lg bg-red-50 border border-red-300 p-4 space-y-1 text-sm text-[#DC2626]"
            >
              <div className="flex items-center gap-2 font-bold">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>Integrity Guardrail #2: BLOCKED</span>
              </div>
              <p>{guardrail2.reason}</p>
            </div>
          )}

          {isFlagged && (
            <div
              role="alert"
              className="rounded-lg bg-amber-50 border border-amber-300 p-4 space-y-2.5 text-sm text-[#D97706]"
            >
              <div className="flex items-center gap-2 font-bold">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>Integrity Guardrail #2: FLAGGED</span>
              </div>
              <p>{guardrail2.reason}</p>
              {!isAlreadyDelivered && (
                <label className="flex items-center gap-2 text-xs font-semibold text-[#0F172A] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={confirmFlagged}
                    onChange={(e) => setConfirmFlagged(e.target.checked)}
                    className="h-4 w-4 rounded border-amber-400 text-[#D97706]"
                  />
                  <span>I confirm this does not give away the full solution</span>
                </label>
              )}
            </div>
          )}

          {guardrail2.verdict === "pass" && (
            <div className="rounded-lg bg-emerald-50 border border-emerald-200 px-3.5 py-2.5 flex items-center gap-2 text-xs font-semibold text-[#059669]">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>Integrity Guardrail #2: {guardrail2.reason}</span>
            </div>
          )}

          {submitError && (
            <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-[#DC2626]">
              {submitError}
            </div>
          )}

          {/* Action Buttons */}
          {!isAlreadyDelivered ? (
            <div className="pt-2 flex flex-wrap items-center gap-2.5 border-t border-[#E2E8F0]">
              {ticket.arm === "assisted" && !rejectMode ? (
                <>
                  <button
                    type="button"
                    disabled={isBlocked || draftEdited || (isFlagged && !confirmFlagged)}
                    onClick={() => handleDeliver("approved")}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#059669] hover:bg-emerald-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-semibold text-sm cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                    <span>Approve &amp; Send</span>
                  </button>
                  <button
                    type="button"
                    disabled={isBlocked || !draftEdited || (isFlagged && !confirmFlagged)}
                    onClick={() => handleDeliver("edited")}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#2563EB] hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-semibold text-sm cursor-pointer"
                  >
                    <span>Save Edits &amp; Send</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleStartReject}
                    className="px-3.5 py-2.5 rounded-lg border border-red-200 bg-white hover:bg-red-50 text-[#DC2626] font-semibold text-sm cursor-pointer"
                  >
                    Reject Draft &amp; Write Own
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  disabled={isBlocked || (isFlagged && !confirmFlagged)}
                  onClick={() =>
                    handleDeliver(
                      ticket.arm === "manual" ? "edited" : "rejected_rewritten"
                    )
                  }
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#059669] hover:bg-emerald-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-semibold text-sm cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>
                    {rejectMode ? "Submit Own Hints & Send" : "Send Socratic Hints"}
                  </span>
                </button>
              )}
            </div>
          ) : (
            <div className="pt-2 border-t border-[#E2E8F0] flex flex-wrap items-center justify-between gap-3">
              <span className="text-xs font-medium text-slate-600">
                Delivered via action: <strong>{ticket.delivered_message?.action}</strong>
              </span>
              <button
                type="button"
                onClick={() => {
                  setRole("mentee");
                  router.push(`/mentee/tickets/${ticket.id}`);
                }}
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#2563EB] hover:underline cursor-pointer"
              >
                <span>Open in Mentee View -&gt;</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
