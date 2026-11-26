"use client";

import React from "react";
import Link from "next/link";
import { Award, CheckCircle2, Clock, Download, Info, Star } from "lucide-react";
import { useDemoStore } from "@/components/demo-store-provider";

function escapeCsvCell(value: string | number): string {
  const str = String(value);
  if (/[",\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export default function MentorHoursPage() {
  const { state } = useDemoStore();
  const logs = state.hourLogs.filter((l) => l.mentor_id === state.mentor.id);

  const totalMinutes = logs.reduce((acc, item) => acc + item.review_minutes, 0);
  const totalHours = totalMinutes / 60;

  const ratedLogs = logs.filter((l) => l.clarity_rating !== null);
  const avgClarity =
    ratedLogs.length > 0
      ? (
          ratedLogs.reduce((acc, item) => acc + (item.clarity_rating ?? 0), 0) /
          ratedLogs.length
        ).toFixed(1)
      : "N/A";

  const handleExportCsv = () => {
    const headers = [
      "Date",
      "Mentor",
      "Ticket ID",
      "Topic",
      "Review Minutes",
      "Hours Equivalent",
      "Action",
      "Clarity Rating",
      "Record Type",
    ];
    const rows = logs.map((entry) => [
      entry.date,
      state.mentor.name,
      entry.ticket_id,
      entry.topic_name,
      entry.review_minutes,
      (entry.review_minutes / 60).toFixed(2),
      entry.action,
      entry.clarity_rating ?? "Unrated",
      entry.is_synthetic ? "Synthetic Seed" : "Live Demo Session",
    ]);

    const csv = [
      headers.map(escapeCsvCell).join(","),
      ...rows.map((row) => row.map(escapeCsvCell).join(",")),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "peerstack-verified-hour-log.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-xl sm:text-2xl font-bold text-[#0F172A]">
            Verified Mentoring Hour Log ({state.mentor.name})
          </h1>
          <p className="text-sm text-slate-600">
            Track verified peer-mentoring sessions and export local verification records.
          </p>
        </div>

        <div className="space-y-1.5 text-right">
          <button
            type="button"
            onClick={handleExportCsv}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#059669] hover:bg-emerald-700 text-white font-semibold text-sm transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Export Verification Record (CSV)</span>
          </button>
          <p className="text-xs text-slate-500">
            Planned incentive format - subject to Study Program SKPI/certificate approval
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 space-y-1">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500">
            <Clock className="w-4 h-4 text-[#2563EB]" />
            <span>Total Verified Hours</span>
          </div>
          <div className="text-2xl font-bold text-[#0F172A]">
            {totalHours.toFixed(2)} hrs
          </div>
          <div className="text-xs text-slate-500">
            {totalMinutes} mins / {state.mentor.weekly_hour_cap.toFixed(1)} hrs weekly cap
          </div>
        </div>

        <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 space-y-1">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500">
            <CheckCircle2 className="w-4 h-4 text-[#059669]" />
            <span>Tickets Resolved</span>
          </div>
          <div className="text-2xl font-bold text-[#0F172A]">{logs.length}</div>
          <div className="text-xs text-slate-500">
            Weekly ticket cap: {logs.length} / {state.mentor.weekly_cap}
          </div>
        </div>

        <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 space-y-1">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500">
            <Star className="w-4 h-4 text-[#D97706]" />
            <span>Avg. Clarity Rating</span>
          </div>
          <div className="text-2xl font-bold text-[#0F172A]">
            {avgClarity === "N/A" ? "N/A" : `${avgClarity} / 5`}
          </div>
          <div className="text-xs text-slate-500">
            Based on {ratedLogs.length} rated ticket(s)
          </div>
        </div>
      </div>

      {/* Log Table */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl overflow-hidden shadow-xs">
        <div className="px-5 py-3.5 border-b border-[#E2E8F0] flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-bold text-[#0F172A]">
            <Award className="w-4 h-4 text-[#059669]" />
            <span>Reviewed Tickets Ledger</span>
          </div>
          <span className="inline-flex items-center gap-1 text-xs text-slate-500">
            <Info className="w-3.5 h-3.5" />
            <span>Includes synthetic seed data + live session reviews</span>
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-[#E2E8F0] text-xs font-semibold text-slate-600">
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Ticket</th>
                <th className="py-3 px-4">Topic</th>
                <th className="py-3 px-4">Review Minutes</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Rating</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0]">
              {logs.map((entry) => (
                <tr key={entry.id} className="hover:bg-slate-50/70">
                  <td className="py-3 px-4 text-slate-700">{entry.date}</td>
                  <td className="py-3 px-4 font-mono font-semibold text-[#2563EB]">
                    <Link href={`/mentor/tickets/${entry.ticket_id}`} className="hover:underline">
                      #{entry.ticket_id}
                    </Link>
                  </td>
                  <td className="py-3 px-4 text-[#0F172A]">{entry.topic_name}</td>
                  <td className="py-3 px-4 text-slate-700">{entry.review_minutes} min</td>
                  <td className="py-3 px-4 capitalize text-slate-700">
                    {entry.action.replace("_", " ")}
                  </td>
                  <td className="py-3 px-4 text-slate-700">
                    {entry.clarity_rating ? `${entry.clarity_rating} / 5` : "Pending"}
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
