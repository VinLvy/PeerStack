import React, { useState } from 'react';
import {
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  Lightbulb,
  MessageSquare,
  PenLine,
  Send,
  ShieldCheck,
  Star,
  Terminal,
  Verified,
} from 'lucide-react';
import { ResolutionStatus, Ticket } from '../types';
import { JavaCodeBlock } from './JavaCodeBlock';

interface HintDeliveryViewProps {
  tickets: Ticket[];
  activeTicketId: string;
  onSelectTicket: (id: string) => void;
  onAcknowledgeHint1: (ticketId: string) => void;
  onSubmitClarification: (ticketId: string, question: string) => void;
  onCloseTicketFeedback: (
    ticketId: string,
    resolution: ResolutionStatus,
    rating: number
  ) => void;
}

export const HintDeliveryView: React.FC<HintDeliveryViewProps> = ({
  tickets,
  activeTicketId,
  onSelectTicket,
  onAcknowledgeHint1,
  onSubmitClarification,
  onCloseTicketFeedback,
}) => {
  const activeTicket = tickets.find((t) => t.id === activeTicketId) || tickets[0];
  const [hint2Open, setHint2Open] = useState(false);
  const [clarifyText, setClarifyText] = useState('');
  const [draftSaved, setDraftSaved] = useState(false);
  const [resolution, setResolution] = useState<ResolutionStatus>(activeTicket.resolutionStatus);
  const [rating, setRating] = useState<number>(activeTicket.clarityRating);

  const handleClarifySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = clarifyText.trim();
    if (!trimmed || activeTicket.clarificationUsed) return;
    onSubmitClarification(activeTicket.id, trimmed);
    setClarifyText('');
  };

  const handleCloseSubmit = () => {
    onCloseTicketFeedback(activeTicket.id, resolution, rating);
  };

  return (
    <>
      {/* ==================== DESKTOP VIEW (lg+) ==================== */}
      <div className="hidden lg:flex flex-col w-full space-y-6 pb-8">
        {/* Top Ticket Metadata Strip */}
        <section className="w-full bg-white rounded-[20px] p-6 shadow-[0_8px_30px_rgb(124,58,237,0.06)] border border-[#CCC3D8]/30">
          <div className="flex items-center justify-between gap-4">
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-3 font-mono text-xs text-[#4A4455]">
                <select
                  aria-label="Choose delivered ticket"
                  value={activeTicket.id}
                  onChange={(e) => onSelectTicket(e.target.value)}
                  className="bg-[#F4F2FE] text-[#1A1B23] font-semibold px-2.5 py-1 rounded-lg border border-[#CCC3D8]/50"
                >
                  {tickets.map((t) => (
                    <option key={t.id} value={t.id}>
                      Ticket #{t.id} ({t.topic})
                    </option>
                  ))}
                </select>
                <span aria-hidden="true">·</span>
                <span className="text-[#7C3AED] font-semibold">IF101 Algorithms · Fall 2026</span>
                <span aria-hidden="true">·</span>
                <span className="px-2.5 py-0.5 rounded bg-[#18181B] text-white font-medium">
                  Hints Delivered by {activeTicket.assignedMentor}
                </span>
              </div>

              <div className="flex items-baseline gap-3 mt-1">
                <h1 className="text-[24px] leading-[32px] font-semibold text-[#1A1B23] tracking-tight">
                  {activeTicket.title}
                </h1>
                <span className="font-mono text-xs text-[#5F5E61]">
                  {activeTicket.severity} · Submitted {activeTicket.submittedAgo}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <div className="flex flex-col items-end">
                <span className="font-mono text-[10px] text-[#5F5E61] uppercase">
                  Assigned Pedagogy Lead
                </span>
                <span className="text-[15px] font-semibold text-[#1A1B23] flex items-center gap-1">
                  <Verified className="w-4 h-4 text-[#7C3AED]" />
                  {activeTicket.assignedMentor} (Senior TA)
                </span>
              </div>
              <div className="w-10 h-10 rounded-full bg-[#F4F2FE] border border-[#CCC3D8]/40 flex items-center justify-center text-[#7C3AED] font-mono font-semibold text-sm">
                {activeTicket.mentorInitials}
              </div>
            </div>
          </div>

          {/* 4-Stage Stepper Tracker */}
          <div className="mt-5 bg-[#F4F2FE] rounded-2xl p-4 grid grid-cols-4 gap-4">
            {[
              { stage: 'Stage 01', label: 'Ticket Submitted', done: true },
              { stage: 'Stage 02', label: 'AI Socratic Drafted', done: true },
              { stage: 'Stage 03', label: 'Mentor Verified', done: activeTicket.hintsDelivered },
              {
                stage: activeTicket.ticketClosed ? 'Completed' : 'Active Stage',
                label: activeTicket.ticketClosed ? 'Ticket Resolved' : 'Student Debugging',
                active: !activeTicket.ticketClosed,
                done: activeTicket.ticketClosed,
              },
            ].map((s, idx) => (
              <div
                key={idx}
                className={`flex items-center gap-3 rounded-xl p-2 ${
                  s.active ? 'bg-white shadow-sm border border-[#7C3AED]/20' : ''
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                    s.done
                      ? 'bg-gradient-to-br from-[#7C3AED] to-[#8B5CF6] text-white'
                      : s.active
                      ? 'bg-[#630ED4] text-white'
                      : 'bg-[#E3E1ED] text-[#5F5E61]'
                  }`}
                >
                  <Check className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span
                    className={`font-mono text-[10px] uppercase block ${
                      s.active ? 'text-[#7C3AED] font-bold' : 'text-[#5F5E61]'
                    }`}
                  >
                    {s.stage}
                  </span>
                  <span className="text-[13px] font-semibold text-[#1A1B23] truncate block">
                    {s.label}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Main Grid Workspace */}
        <div className="grid grid-cols-12 gap-6 items-start">
          {/* Left Column (8 Cols) */}
          <div className="col-span-8 flex flex-col gap-5">
            {/* Hint 1 Card */}
            <article className="bg-white rounded-[20px] shadow-[0_8px_30px_rgb(124,58,237,0.06)] border border-[#CCC3D8]/30 overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 bg-[#F4F2FE] border-b border-[#CCC3D8]/30">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-[#18181B] flex items-center justify-center text-white">
                    <Lightbulb className="w-4 h-4" />
                  </div>
                  <h2 className="text-[15px] font-semibold text-[#1A1B23]">
                    Socratic Hint 1 — Guiding Question from {activeTicket.assignedMentor}
                  </h2>
                </div>
                <span className="font-mono text-xs text-[#5F5E61]">
                  {activeTicket.deliveredAgo || 'READY'}
                </span>
              </div>

              <div className="p-6 space-y-4">
                <div className="p-4 rounded-2xl bg-[#F4F2FE] text-[#1A1B23] text-[15px] leading-relaxed">
                  &ldquo;{activeTicket.hint1}&rdquo;
                </div>

                <div className="flex items-start gap-3 p-4 rounded-2xl bg-[#E9DDFF]/65 text-[#23005C] border border-[#7C3AED]/15">
                  <PenLine className="w-5 h-5 text-[#7C3AED] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-mono text-[10px] font-semibold uppercase text-[#5516BE]">
                      Recommended Pedagogical Exercise
                    </span>
                    <p className="text-[13px] mt-0.5">{activeTicket.hint1Exercise}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="font-mono text-xs text-[#5F5E61]">{activeTicket.hint1Target}</span>
                  <button
                    type="button"
                    onClick={() => onAcknowledgeHint1(activeTicket.id)}
                    className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-medium transition-all ${
                      activeTicket.hint1Acknowledged
                        ? 'bg-[#18181B] text-white'
                        : 'bg-gradient-to-r from-[#7C3AED] to-[#8B5CF6] text-white shadow-md shadow-purple-500/20 hover:opacity-95'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>
                      {activeTicket.hint1Acknowledged
                        ? 'Checked! Stack trace analyzed'
                        : 'I checked this — I see the issue!'}
                    </span>
                  </button>
                </div>
              </div>
            </article>

            {/* Hint 2 Progressive Disclosure Accordion */}
            <section className="bg-white rounded-[20px] shadow-[0_8px_30px_rgb(124,58,237,0.06)] border border-[#CCC3D8]/30 overflow-hidden">
              <button
                type="button"
                onClick={() => setHint2Open((prev) => !prev)}
                className="w-full p-5 flex items-center justify-between text-left hover:bg-[#F4F2FE]/60 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#F4F2FE] text-[#7C3AED] flex items-center justify-center">
                    <HelpCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-mono text-[10px] text-[#5F5E61] uppercase block">
                      Progressive Disclosure Layer
                    </span>
                    <h3 className="text-[15px] font-semibold text-[#1A1B23]">
                      Reveal Hint 2 (Optional Deeper Guidance)
                    </h3>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-[#5F5E61] font-mono text-xs">
                  <span>Need a closer pointer?</span>
                  {hint2Open ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </div>
              </button>

              {hint2Open && (
                <div className="px-5 pb-5 pt-1 space-y-3">
                  <div className="p-4 rounded-2xl bg-[#F4F2FE] text-[#1A1B23] text-[15px] leading-relaxed">
                    &ldquo;{activeTicket.hint2}&rdquo;
                  </div>
                  <div className="flex items-center gap-2.5 p-3 rounded-xl bg-[#EEECF8] text-[#4A4455] font-mono text-xs">
                    <Terminal className="w-4 h-4 text-[#7C3AED] shrink-0" />
                    <span>{activeTicket.hint2Consideration}</span>
                  </div>
                </div>
              )}
            </section>

            {/* One-Round Follow-up Clarification */}
            <section className="bg-white rounded-[20px] p-6 shadow-[0_8px_30px_rgb(124,58,237,0.06)] border border-[#CCC3D8]/30">
              <div className="flex items-center justify-between pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-[#7C3AED]" />
                  <h3 className="text-[15px] font-semibold text-[#1A1B23]">
                    One-Round Follow-Up Clarification
                  </h3>
                </div>
                <span className="px-2.5 py-0.5 rounded bg-[#18181B] text-white font-mono text-xs font-semibold tabular-nums">
                  {activeTicket.clarificationUsed ? '1 / 1 Used' : '0 / 1 Used'}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-[#F4F2FE] text-[#4A4455] mb-4 flex items-start gap-2.5 text-xs">
                <ShieldCheck className="w-4 h-4 text-[#7C3AED] shrink-0 mt-0.5" />
                <p>
                  To promote independent algorithmic problem solving, each ticket allows one
                  follow-up query before scheduling a live lab desk session.
                </p>
              </div>

              {activeTicket.clarificationUsed ? (
                <div className="p-4 rounded-2xl bg-[#F4F2FE] text-[#1A1B23] space-y-1">
                  <span className="text-[14px] font-semibold block">Clarification Dispatched</span>
                  <p className="text-[13px] text-[#4A4455]">
                    &ldquo;{activeTicket.clarificationQuestion}&rdquo;
                  </p>
                  <span className="font-mono text-xs text-[#7C3AED] font-medium block pt-1">
                    Awaiting {activeTicket.assignedMentor} reply · Response expected &lt; 20m
                  </span>
                </div>
              ) : (
                <form onSubmit={handleClarifySubmit} className="space-y-3">
                  <div>
                    <label
                      htmlFor="mentee-clarify"
                      className="font-mono text-[10px] text-[#5F5E61] uppercase block mb-1.5"
                    >
                      Student Dialectic Clarification
                    </label>
                    <textarea
                      id="mentee-clarify"
                      value={clarifyText}
                      onChange={(e) => setClarifyText(e.target.value.slice(0, 280))}
                      rows={4}
                      placeholder={`Type your clarifying question to ${activeTicket.assignedMentor}...`}
                      className="w-full p-4 rounded-2xl bg-[#FBF8FF] border border-[#CCC3D8]/60 text-[#1A1B23] text-[13px] focus:outline-none focus:border-[#7C3AED] focus:bg-white resize-none"
                    />
                    <div className="flex justify-between text-[#5F5E61] font-mono text-[11px] mt-1 px-1">
                      <span>Ask about concepts, edge cases, or test cases.</span>
                      <span className="tabular-nums">{clarifyText.length} / 280</span>
                    </div>
                  </div>

                  <div className="flex justify-end items-center gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setDraftSaved(true);
                        setTimeout(() => setDraftSaved(false), 1800);
                      }}
                      className="px-4 py-2 rounded-xl bg-[#F4F2FE] text-[#1A1B23] text-xs font-medium hover:bg-[#E9E7F3]"
                    >
                      {draftSaved ? 'Draft Saved' : 'Save Draft'}
                    </button>
                    <button
                      type="submit"
                      className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#8B5CF6] text-white text-[13px] font-medium shadow-md shadow-purple-500/20 hover:opacity-95"
                    >
                      <Send className="w-4 h-4" />
                      <span>Send Clarification Question</span>
                    </button>
                  </div>
                </form>
              )}
            </section>
          </div>

          {/* Right Column (4 Cols) */}
          <div className="col-span-4 flex flex-col gap-5">
            <JavaCodeBlock
              code={activeTicket.scrubbedCode}
              fileName={activeTicket.fileName}
              faultLine={activeTicket.faultLine}
              faultBadge={`Line ${activeTicket.faultLine} Fault`}
              showCopy={false}
              compact
            />

            {/* Resolution & Clarity Rating */}
            <section className="bg-white rounded-[20px] p-5 shadow-[0_8px_30px_rgb(124,58,237,0.06)] border border-[#CCC3D8]/30 space-y-4">
              <h3 className="text-[15px] font-semibold text-[#1A1B23]">
                Resolution &amp; Clarity Rating
              </h3>

              <div>
                <span className="font-mono text-[10px] text-[#5F5E61] uppercase block mb-2">
                  Did this Socratic guidance unblock your Java code?
                </span>
                <div className="space-y-2">
                  {(
                    [
                      { id: 'full', label: 'Yes, Fully Unblocked' },
                      { id: 'partial', label: 'Partially Unblocked' },
                      { id: 'stuck', label: 'Still Stuck (Request TA Office Hours)' },
                    ] as Array<{ id: ResolutionStatus; label: string }>
                  ).map((opt) => {
                    const selected = resolution === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setResolution(opt.id)}
                        className={`w-full py-2.5 px-3.5 rounded-xl text-left text-[13px] flex items-center justify-between transition-all ${
                          selected
                            ? 'bg-gradient-to-r from-[#7C3AED] to-[#8B5CF6] text-white font-medium shadow-md shadow-purple-500/20'
                            : 'bg-[#F4F2FE] text-[#1A1B23] hover:bg-[#E9E7F3]'
                        }`}
                      >
                        <span>{opt.label}</span>
                        {selected && <Check className="w-4 h-4" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 5-Star Clarity Rating */}
              <div className="bg-[#F4F2FE] rounded-2xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-[10px] text-[#5F5E61] uppercase">
                    Rate clarity of Socratic hints
                  </span>
                  <span className="font-mono text-[15px] text-[#7C3AED] font-bold tabular-nums">
                    {rating}.0 / 5.0
                  </span>
                </div>
                <div className="flex items-center justify-between py-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      aria-label={`Rate ${star} stars`}
                      className="p-1 hover:scale-110 transition-transform"
                    >
                      <Star
                        className={`w-7 h-7 ${
                          star <= rating
                            ? 'text-[#7C3AED] fill-[#7C3AED]'
                            : 'text-[#7B7487]'
                        }`}
                      />
                    </button>
                  ))}
                </div>
                <p className="font-mono text-[11px] text-[#5F5E61] mt-2 text-center">
                  &ldquo;Exceptional prompt guiding directly to domain boundaries.&rdquo;
                </p>
              </div>

              <button
                type="button"
                onClick={handleCloseSubmit}
                disabled={activeTicket.ticketClosed}
                className={`w-full py-2.5 rounded-xl text-white text-[13px] font-semibold flex items-center justify-center gap-2 transition-all ${
                  activeTicket.ticketClosed
                    ? 'bg-[#18181B]'
                    : 'bg-gradient-to-r from-[#7C3AED] to-[#8B5CF6] shadow-md shadow-purple-500/20 hover:opacity-95'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>
                  {activeTicket.ticketClosed
                    ? 'Feedback Logged · Ticket Archived'
                    : 'Submit Feedback & Close Ticket'}
                </span>
              </button>
            </section>

            {/* Cohort Telemetry Quick Glance */}
            <div className="bg-white rounded-[20px] p-4 shadow-sm border border-[#CCC3D8]/30 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#F4F2FE] text-[#7C3AED] flex items-center justify-center font-mono text-xs font-bold">
                  IF
                </div>
                <div>
                  <span className="text-[13px] font-semibold text-[#1A1B23] block">
                    Cohort Resolution Rate
                  </span>
                  <span className="font-mono text-[11px] text-[#5F5E61]">Recursion modules</span>
                </div>
              </div>
              <span className="font-mono text-lg text-[#7C3AED] font-bold tabular-nums">89.4%</span>
            </div>
          </div>
        </div>
      </div>

      {/* ==================== MOBILE VIEW (< lg) ==================== */}
      <div className="lg:hidden flex flex-col w-full space-y-4 pb-4">
        <div className="flex items-center justify-between text-xs">
          <span className="font-mono font-semibold text-[#4A4455]">
            #{activeTicket.id} Debug Session
          </span>
          <span className="font-mono font-semibold text-[#630ED4]">Stage 4 Active</span>
        </div>

        {/* Lavender Hero Header */}
        <div className="rounded-2xl bg-gradient-to-br from-[#7645E0] via-[#7C3AED] to-[#630ED4] p-5 text-white shadow-md space-y-2">
          <span className="font-mono text-[11px] text-[#EDE0FF] uppercase block">
            Ticket #{activeTicket.id} · {activeTicket.topic}
          </span>
          <h1 className="text-lg font-bold leading-snug text-white">{activeTicket.title}</h1>
          <p className="text-xs text-[#EDE0FF]">
            Assigned Pedagogy Lead: <strong className="text-white">{activeTicket.assignedMentor}</strong>
          </p>
        </div>

        {/* Hint 1 Card */}
        <div className="bg-white rounded-2xl p-4 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[15px] font-semibold text-[#1A1B23]">Socratic Hint 1</span>
            <span className="font-mono text-[11px] text-[#47464A]">Base Case Audit</span>
          </div>
          <div className="bg-[#F4F2FE] rounded-xl p-3 text-sm text-[#1A1B23] leading-relaxed">
            {activeTicket.hint1}
          </div>
          <button
            type="button"
            onClick={() => onAcknowledgeHint1(activeTicket.id)}
            className={`w-full min-h-[44px] rounded-xl text-sm font-medium flex items-center justify-center gap-2 ${
              activeTicket.hint1Acknowledged
                ? 'bg-[#E9E7F3] text-[#1A1B23]'
                : 'bg-[#630ED4] text-white'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>
              {activeTicket.hint1Acknowledged
                ? 'Acknowledged — Base case revisited'
                : 'I checked this — I see the issue!'}
            </span>
          </button>
        </div>

        <JavaCodeBlock
          code={activeTicket.scrubbedCode}
          fileName={activeTicket.fileName}
          faultLine={activeTicket.faultLine}
          compact
        />

        {/* Collapsible Hint 2 */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <button
            type="button"
            onClick={() => setHint2Open((p) => !p)}
            className="w-full p-4 flex items-center justify-between text-left"
          >
            <div>
              <span className="text-[15px] font-semibold text-[#1A1B23] block">Reveal Hint 2</span>
              <span className="text-xs text-[#4A4455]">Optional Deeper Guidance</span>
            </div>
            {hint2Open ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
          {hint2Open && (
            <div className="px-4 pb-4">
              <div className="p-3 bg-[#F4F2FE] rounded-xl text-xs text-[#1A1B23] leading-relaxed">
                {activeTicket.hint2}
              </div>
            </div>
          )}
        </div>

        {/* Mobile Clarification */}
        <div className="bg-white rounded-2xl p-4 shadow-sm space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[15px] font-semibold text-[#1A1B23]">Clarification Round</span>
            <span className="font-mono text-xs font-bold text-[#630ED4]">
              {activeTicket.clarificationUsed ? '1 / 1 Used' : '0 / 1 Used'}
            </span>
          </div>
          {activeTicket.clarificationUsed ? (
            <div className="p-3 rounded-xl bg-[#F4F2FE] text-xs text-[#1A1B23]">
              Sent: &ldquo;{activeTicket.clarificationQuestion}&rdquo;
            </div>
          ) : (
            <form onSubmit={handleClarifySubmit} className="space-y-2">
              <textarea
                value={clarifyText}
                onChange={(e) => setClarifyText(e.target.value.slice(0, 180))}
                rows={2}
                placeholder="Ask Mentor-B12 one clarification..."
                className="w-full p-2.5 bg-[#F4F2FE] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#630ED4] resize-none"
              />
              <button
                type="submit"
                className="w-full min-h-[44px] rounded-xl bg-[#18181B] text-white text-sm font-medium"
              >
                Send Clarification Question ({clarifyText.length}/180)
              </button>
            </form>
          )}
        </div>

        {/* Mobile Resolution & Rating */}
        <div className="bg-white rounded-2xl p-4 shadow-sm space-y-3">
          <span className="text-[15px] font-semibold text-[#1A1B23] block">
            Resolution &amp; Feedback
          </span>
          <div className="space-y-2">
            {(
              [
                { id: 'full', label: 'Yes, Fully Unblocked' },
                { id: 'partial', label: 'Partially Unblocked' },
                { id: 'stuck', label: 'Still Stuck (Office Hours)' },
              ] as Array<{ id: ResolutionStatus; label: string }>
            ).map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setResolution(opt.id)}
                className={`w-full min-h-[44px] px-3.5 rounded-xl text-left text-sm flex items-center justify-between ${
                  resolution === opt.id
                    ? 'bg-[#630ED4] text-white font-semibold'
                    : 'bg-[#EEECF8] text-[#1A1B23]'
                }`}
              >
                <span>{opt.label}</span>
                {resolution === opt.id && <Check className="w-4 h-4" />}
              </button>
            ))}
          </div>

          <div className="bg-[#F4F2FE] rounded-xl p-3 flex flex-col items-center space-y-1.5">
            <div className="flex justify-between w-full text-xs font-semibold">
              <span>Clarity Rating</span>
              <span className="text-[#630ED4] tabular-nums">{rating}.0 / 5.0</span>
            </div>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="p-1"
                  aria-label={`Rate ${star} stars`}
                >
                  <Star
                    className={`w-6 h-6 ${
                      star <= rating ? 'text-[#630ED4] fill-[#630ED4]' : 'text-[#7B7487]'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={handleCloseSubmit}
            disabled={activeTicket.ticketClosed}
            className="w-full min-h-[48px] rounded-xl bg-[#630ED4] text-white font-semibold text-sm"
          >
            {activeTicket.ticketClosed
              ? 'Feedback Logged & Ticket Closed!'
              : 'Submit Feedback & Close Ticket'}
          </button>
        </div>
      </div>
    </>
  );
};
