"use client";

import React, { useEffect, useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  FastForward,
  Lock,
  ShieldCheck,
  Sparkles,
  UserCheck,
} from "lucide-react";
import type { SimulatedPipelineOutput } from "@/lib/mock-ai";

interface PipelineStepperProps {
  ticketId: string;
  pipeline: SimulatedPipelineOutput;
  onSwitchToMentor: () => void;
  onViewTicket: () => void;
}

export function PipelineStepper({
  ticketId,
  pipeline,
  onSwitchToMentor,
  onViewTicket,
}: PipelineStepperProps) {
  const [completedStep, setCompletedStep] = useState(0);

  useEffect(() => {
    if (completedStep >= 5) return;
    const timer = window.setTimeout(() => {
      setCompletedStep((prev) => Math.min(5, prev + 1));
    }, 500);
    return () => window.clearTimeout(timer);
  }, [completedStep]);

  const isFinished = completedStep >= 5;

  const steps = [
    {
      title: "Step 1 - Deterministic Redaction (No AI)",
      badge: "Real Browser Logic",
      badgeStyle: "bg-slate-100 text-slate-700 border-slate-300",
      icon: Lock,
      detail: `${pipeline.redactions_count} sensitive item(s) removed before AI step${
        pipeline.redacted_types.length > 0
          ? ` (${pipeline.redacted_types.join(", ")})`
          : ""
      }.`,
    },
    {
      title: "Step 2 - Triage Agent",
      badge: "Simulated",
      badgeStyle: "bg-[#EFF6FF] text-[#1D4ED8] border-blue-200",
      icon: Sparkles,
      detail: `${pipeline.triage_summary} Highlighted lines: ${pipeline.highlighted_lines.join(", ")}. ${pipeline.similar_ticket_note}`,
    },
    {
      title: "Step 3 - Socratic Hinting Agent",
      badge: "Simulated",
      badgeStyle: "bg-[#EFF6FF] text-[#1D4ED8] border-blue-200",
      icon: Sparkles,
      detail:
        "Drafted 2 syllabus-aligned Socratic hints (Guiding Question + Specific Pointer) without full code solutions.",
    },
    {
      title: "Step 4 - Integrity Guardrail #1",
      badge: "Real Rule Check",
      badgeStyle: "bg-emerald-50 text-[#059669] border-emerald-200",
      icon: ShieldCheck,
      detail: pipeline.guardrail_1.reason,
    },
    {
      title: "Step 5 - Routed to Mentor Queue",
      badge: `Ticket #${ticketId}`,
      badgeStyle: "bg-emerald-50 text-[#059669] border-emerald-200",
      icon: UserCheck,
      detail: "Status set to pending_review. Waiting for Peer Mentor approval before delivery.",
    },
  ];

  return (
    <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 shadow-xs space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-[#0F172A]">
            Agentic Pipeline Progress (Ticket #{ticketId})
          </h2>
          <p className="text-sm text-slate-600">
            Redaction and Guardrail #1 run locally in your browser; Triage and Hint drafting are simulated.
          </p>
        </div>

        {!isFinished && (
          <button
            type="button"
            onClick={() => setCompletedStep(5)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E2E8F0] bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 cursor-pointer"
          >
            <FastForward className="w-3.5 h-3.5" />
            <span>Skip Animation</span>
          </button>
        )}
      </div>

      <ol className="space-y-3">
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const done = completedStep >= stepNumber;
          const active = completedStep === index;
          const Icon = step.icon;

          return (
            <li
              key={step.title}
              className={`rounded-lg border p-4 transition-colors ${
                done
                  ? "border-emerald-200 bg-emerald-50/40"
                  : active
                    ? "border-blue-300 bg-[#EFF6FF]"
                    : "border-[#E2E8F0] bg-slate-50/60 opacity-60"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">
                    {done ? (
                      <CheckCircle2 className="w-5 h-5 text-[#059669]" />
                    ) : (
                      <Icon className="w-5 h-5 text-[#2563EB]" />
                    )}
                  </div>
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-bold text-[#0F172A]">
                        {step.title}
                      </span>
                      <span
                        className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${step.badgeStyle}`}
                      >
                        {step.badge}
                      </span>
                    </div>
                    <p className="text-sm text-slate-700">{step.detail}</p>
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ol>

      {isFinished && (
        <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-[#E2E8F0]">
          <button
            type="button"
            onClick={onViewTicket}
            className="px-4 py-2 rounded-lg border border-[#E2E8F0] bg-white hover:bg-slate-50 text-sm font-medium text-[#0F172A] cursor-pointer"
          >
            View My Sanitized Ticket
          </button>

          <button
            type="button"
            onClick={onSwitchToMentor}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#059669] hover:bg-emerald-700 text-white font-semibold text-sm transition-colors cursor-pointer"
          >
            <span>Switch to Mentor View to Review This Ticket -&gt;</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
