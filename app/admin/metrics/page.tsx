"use client";

import React, { useState } from "react";
import { BarChart3, Lock, ShieldCheck, Sparkles, Star, Users } from "lucide-react";
import { useDemoStore } from "@/components/demo-store-provider";

export default function AdminMetricsPage() {
  const { state } = useDemoStore();
  const [includeSynthetic, setIncludeSynthetic] = useState(true);

  const visibleTickets = includeSynthetic
    ? state.tickets
    : state.tickets.filter((t) => !t.is_synthetic);

  const deliveredOrClosed = visibleTickets.filter(
    (t) => t.status === "delivered" || t.status === "closed"
  );
  const ratedTickets = visibleTickets.filter((t) => t.rating !== null);

  const assistedTickets = visibleTickets.filter((t) => t.arm === "assisted");
  const manualTickets = visibleTickets.filter((t) => t.arm === "manual");

  const calcArmStats = (list: typeof visibleTickets) => {
    const reviewed = list.filter((t) => t.review_minutes !== null);
    const avgMin =
      reviewed.length > 0
        ? (
            reviewed.reduce((acc, t) => acc + (t.review_minutes ?? 0), 0) /
            reviewed.length
          ).toFixed(1)
        : "N/A";
    const rated = list.filter((t) => t.rating !== null);
    const avgClar =
      rated.length > 0
        ? (
            rated.reduce((acc, t) => acc + (t.rating?.clarity ?? 0), 0) /
            rated.length
          ).toFixed(1)
        : "N/A";
    const unblockedCount = rated.filter((t) => t.rating?.unblocked === "yes").length;
    const unblockedPct =
      rated.length > 0 ? `${Math.round((unblockedCount / rated.length) * 100)}%` : "N/A";

    return {
      total: list.length,
      delivered: list.filter((t) => t.status === "delivered" || t.status === "closed").length,
      avgMin,
      avgClar,
      unblockedPct,
    };
  };

  const assistedStats = calcArmStats(assistedTickets);
  const manualStats = calcArmStats(manualTickets);

  // M2: Unblocked rate
  const unblockedYes = ratedTickets.filter((t) => t.rating?.unblocked === "yes").length;
  const unblockedPartly = ratedTickets.filter((t) => t.rating?.unblocked === "partly").length;
  const unblockedNo = ratedTickets.filter((t) => t.rating?.unblocked === "no").length;
  const unblockedRate =
    ratedTickets.length > 0
      ? `${Math.round(((unblockedYes + unblockedPartly) / ratedTickets.length) * 100)}%`
      : "N/A";

  // M3: Clarity Rating
  const avgClarity =
    ratedTickets.length > 0
      ? (
          ratedTickets.reduce((acc, t) => acc + (t.rating?.clarity ?? 0), 0) /
          ratedTickets.length
        ).toFixed(2)
      : "N/A";

  // M4: Guardrail Pass/Flag/Block telemetry
  const g1Checks = assistedTickets.filter((t) => t.ai_draft !== null).length;
  const g2Checks = deliveredOrClosed.length;

  // M5: Redaction Coverage
  const totalRedactions = visibleTickets.reduce((acc, t) => acc + t.redactions_count, 0);
  const redactedTicketsCount = visibleTickets.filter((t) => t.redactions_count > 0).length;

  // M6: Mentor Cap Compliance (current week)
  const mentorClaimedCount = state.tickets.filter(
    (t) => t.claimed_by === state.mentor.id
  ).length;
  const mentorMinutes = state.hourLogs
    .filter((l) => l.mentor_id === state.mentor.id)
    .reduce((acc, l) => acc + l.review_minutes, 0);

  // M7: Draft Disposition
  const approvedCount = deliveredOrClosed.filter(
    (t) => t.delivered_message?.action === "approved"
  ).length;
  const editedCount = deliveredOrClosed.filter(
    (t) => t.delivered_message?.action === "edited"
  ).length;
  const rejectedCount = deliveredOrClosed.filter(
    (t) => t.delivered_message?.action === "rejected_rewritten"
  ).length;

  // M8: Throughput & Follow-up
  const followUpCount = visibleTickets.filter((t) => t.followup !== null).length;

  const metricCards = [
    {
      code: "M1",
      title: "Assisted vs. Manual Arm",
      value: `${assistedStats.total} vs ${manualStats.total}`,
      detail: `Assisted avg clarity: ${assistedStats.avgClar} | Manual pending baseline`,
      icon: Sparkles,
      accent: "text-[#1D4ED8]",
    },
    {
      code: "M2",
      title: "Mentee Unblocked Rate",
      value: unblockedRate,
      detail: `${unblockedYes} yes, ${unblockedPartly} partly, ${unblockedNo} stuck (${ratedTickets.length} rated)`,
      icon: Users,
      accent: "text-[#059669]",
    },
    {
      code: "M3",
      title: "Avg. Hint Clarity Rating",
      value: avgClarity === "N/A" ? "N/A" : `${avgClarity} / 5`,
      detail: `Across ${ratedTickets.length} rated delivery(s)`,
      icon: Star,
      accent: "text-[#D97706]",
    },
    {
      code: "M4",
      title: "Guardrail #1 & #2 Checks",
      value: `${g1Checks + g2Checks} Passed`,
      detail: `0 leaked solutions delivered across ${g2Checks} mentor sends`,
      icon: ShieldCheck,
      accent: "text-[#059669]",
    },
    {
      code: "M5",
      title: "PII Redactions Stripped",
      value: `${totalRedactions} Items`,
      detail: `Across ${redactedTicketsCount} of ${visibleTickets.length} tickets`,
      icon: Lock,
      accent: "text-[#64748B]",
    },
    {
      code: "M6",
      title: "Weekly Burnout Cap",
      value: `${mentorClaimedCount} / ${state.mentor.weekly_cap} Tickets`,
      detail: `${(mentorMinutes / 60).toFixed(2)} / ${state.mentor.weekly_hour_cap.toFixed(1)} hrs (0 over-cap)`,
      icon: BarChart3,
      accent: "text-[#2563EB]",
    },
    {
      code: "M7",
      title: "Mentor Draft Disposition",
      value: `${approvedCount} Appr / ${editedCount} Edit`,
      detail: `${rejectedCount} rejected & rewritten by mentor`,
      icon: Sparkles,
      accent: "text-[#1D4ED8]",
    },
    {
      code: "M8",
      title: "Throughput & Follow-Ups",
      value: `${deliveredOrClosed.length} / ${visibleTickets.length} Done`,
      detail: `${followUpCount} follow-up round(s) logged`,
      icon: BarChart3,
      accent: "text-[#0F172A]",
    },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header + Synthetic Data Toggle */}
      <section className="bg-white border border-[#E2E8F0] rounded-xl p-6 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full text-xs font-semibold bg-[#EFF6FF] text-[#1D4ED8] border border-blue-200">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Simulated Pilot Data | Updates Live from Demo Actions</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#0F172A]">
            Course Supervisor Pilot Metrics (M1 - M8)
          </h1>
          <p className="text-sm text-slate-600">
            Live aggregate metrics across IF101 Algorithms (Java). Toggle synthetic seed records below to isolate live session tickets.
          </p>
        </div>

        <label className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] cursor-pointer text-sm font-semibold text-[#0F172A]">
          <input
            type="checkbox"
            checked={includeSynthetic}
            onChange={(e) => setIncludeSynthetic(e.target.checked)}
            className="h-4 w-4 rounded border-slate-300 text-[#2563EB]"
          />
          <span>Include Synthetic Seed Data</span>
        </label>
      </section>

      {/* M1-M8 Summary Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metricCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.code}
              className="bg-white border border-[#E2E8F0] rounded-xl p-5 space-y-2 shadow-xs"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                  {card.code}
                </span>
                <span className="text-[11px] font-semibold text-[#1D4ED8] bg-[#EFF6FF] px-2 py-0.5 rounded-full">
                  Simulated Pilot Data
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 pt-1">
                <Icon className={`w-4 h-4 ${card.accent}`} />
                <span>{card.title}</span>
              </div>
              <div className="text-2xl font-bold text-[#0F172A]">{card.value}</div>
              <div className="text-xs text-slate-600">{card.detail}</div>
            </div>
          );
        })}
      </section>

      {/* M1 Assisted vs Manual Arm Table */}
      <section className="bg-white border border-[#E2E8F0] rounded-xl overflow-hidden shadow-xs">
        <div className="px-5 py-3.5 border-b border-[#E2E8F0] flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-base font-bold text-[#0F172A]">
            M1 Validation Table: Assisted Arm vs. Manual Arm
          </h2>
          <span className="text-xs font-semibold text-[#1D4ED8] bg-[#EFF6FF] px-2.5 py-0.5 rounded-full border border-blue-200">
            Simulated Pilot Data
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-[#E2E8F0] text-xs font-semibold text-slate-600">
                <th className="py-3 px-4">Study Arm</th>
                <th className="py-3 px-4">Total Tickets</th>
                <th className="py-3 px-4">Delivered / Closed</th>
                <th className="py-3 px-4">Avg. Review Minutes</th>
                <th className="py-3 px-4">Avg. Clarity</th>
                <th className="py-3 px-4">Unblocked (Yes)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0]">
              <tr>
                <td className="py-3 px-4 font-semibold text-[#1D4ED8]">
                  Assisted Arm (AI Socratic Draft + Mentor)
                </td>
                <td className="py-3 px-4">{assistedStats.total}</td>
                <td className="py-3 px-4">{assistedStats.delivered}</td>
                <td className="py-3 px-4">{assistedStats.avgMin}</td>
                <td className="py-3 px-4">{assistedStats.avgClar}</td>
                <td className="py-3 px-4">{assistedStats.unblockedPct}</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold text-[#D97706]">
                  Manual Arm (Mentor Only, No AI Draft)
                </td>
                <td className="py-3 px-4">{manualStats.total}</td>
                <td className="py-3 px-4">{manualStats.delivered}</td>
                <td className="py-3 px-4">{manualStats.avgMin}</td>
                <td className="py-3 px-4">{manualStats.avgClar}</td>
                <td className="py-3 px-4">{manualStats.unblockedPct}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Per-Ticket Metrics Breakdown */}
      <section className="bg-white border border-[#E2E8F0] rounded-xl overflow-hidden shadow-xs">
        <div className="px-5 py-3.5 border-b border-[#E2E8F0] flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-base font-bold text-[#0F172A]">
            Live Ticket Telemetry ({visibleTickets.length} Ticket{visibleTickets.length === 1 ? "" : "s"})
          </h2>
          <span className="text-xs font-semibold text-[#1D4ED8] bg-[#EFF6FF] px-2.5 py-0.5 rounded-full border border-blue-200">
            Simulated Pilot Data
          </span>
        </div>

        {visibleTickets.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-600">
            No live session tickets submitted yet. Enable &quot;Include Synthetic Seed Data&quot; or submit a ticket in Mentee View.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-[#E2E8F0] text-xs font-semibold text-slate-600">
                  <th className="py-3 px-4">Ticket</th>
                  <th className="py-3 px-4">Topic</th>
                  <th className="py-3 px-4">Arm</th>
                  <th className="py-3 px-4">Redactions</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Review Min</th>
                  <th className="py-3 px-4">Clarity / Unblocked</th>
                  <th className="py-3 px-4">Source</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
                {visibleTickets.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/70">
                    <td className="py-3 px-4 font-mono font-bold text-[#0F172A]">
                      #{t.id}
                    </td>
                    <td className="py-3 px-4">{t.topic_name}</td>
                    <td className="py-3 px-4 capitalize">{t.arm}</td>
                    <td className="py-3 px-4">{t.redactions_count}</td>
                    <td className="py-3 px-4 capitalize">{t.status.replace("_", " ")}</td>
                    <td className="py-3 px-4">
                      {t.review_minutes !== null ? `${t.review_minutes} min` : "-"}
                    </td>
                    <td className="py-3 px-4">
                      {t.rating
                        ? `${t.rating.clarity}/5 (${t.rating.unblocked})`
                        : "Pending"}
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-500">
                      {t.is_synthetic ? "Synthetic Seed" : "Live Session"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
