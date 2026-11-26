"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Clock, Lock, PlusCircle } from "lucide-react";
import { useDemoStore } from "@/components/demo-store-provider";
import type { TicketStatus } from "@/lib/types";

const STATUS_BADGE: Record<TicketStatus, { label: string; style: string }> = {
  pending_review: {
    label: "Pending Review",
    style: "bg-amber-50 text-[#D97706] border-amber-200",
  },
  in_review: {
    label: "Pending Review (Claimed)",
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

export default function MenteeTicketsPage() {
  const { state } = useDemoStore();
  const myTickets = state.tickets.filter((t) => t.mentee_id === state.mentee.id);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#0F172A]">
            My Help Tickets ({state.mentee.pseudonym})
          </h1>
          <p className="text-sm text-slate-600">
            Track sanitization, mentor review progress, and Socratic hint deliveries.
          </p>
        </div>

        <Link
          href="/mentee/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#2563EB] hover:bg-blue-700 text-white font-semibold text-sm transition-colors"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Java Ticket</span>
        </Link>
      </div>

      {myTickets.length === 0 ? (
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-8 text-center text-sm text-slate-600">
          No tickets found. Submit a Java bug from New Ticket to get started.
        </div>
      ) : (
        <div className="space-y-3">
          {myTickets.map((ticket) => {
            const badge = STATUS_BADGE[ticket.status];
            return (
              <div
                key={ticket.id}
                className="bg-white border border-[#E2E8F0] rounded-xl p-5 flex flex-wrap items-center justify-between gap-4 hover:border-slate-300 transition-colors"
              >
                <div className="space-y-1.5 max-w-2xl">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-sm font-bold text-[#0F172A]">
                      #{ticket.id}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                      {ticket.topic_name}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${badge.style}`}
                    >
                      {badge.label}
                    </span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-slate-50 text-[#64748B] border border-slate-200">
                      <Lock className="w-3 h-3" />
                      <span>{ticket.redactions_count} redacted</span>
                    </span>
                  </div>

                  <p className="text-sm text-slate-700 line-clamp-2">
                    {ticket.description_sanitized}
                  </p>

                  <div className="flex items-center gap-3 text-xs text-slate-500">
                    <span className="inline-flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{ticket.created_at.slice(0, 16).replace("T", " ")}</span>
                    </span>
                    {ticket.rating && (
                      <span className="text-[#059669] font-medium">
                        Rated {ticket.rating.clarity}/5 Clarity
                      </span>
                    )}
                  </div>
                </div>

                <Link
                  href={`/mentee/tickets/${ticket.id}`}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-[#E2E8F0] bg-white hover:bg-slate-50 text-sm font-semibold text-[#2563EB] transition-colors"
                >
                  <span>
                    {ticket.status === "delivered" ? "Read Hints & Rate" : "Open Ticket"}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
