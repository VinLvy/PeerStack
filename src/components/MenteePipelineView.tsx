import React, { useMemo, useState } from 'react';
import {
  ArrowRight,
  Bug,
  Calendar,
  CheckCircle2,
  Edit3,
  Eye,
  FileCode2,
  Fingerprint,
  History,
  Lightbulb,
  Loader2,
  Lock,
  RotateCcw,
  Search,
  ShieldCheck,
  Sparkles,
  Users,
  Workflow,
  X,
  Zap,
} from 'lucide-react';
import { SAMPLE_BUG_PRESETS } from '../data/initialData';
import { TabRoute, Ticket, TicketStatus } from '../types';
import { redactPII } from '../utils/socraticEngine';
import { JavaCodeBlock } from './JavaCodeBlock';

interface MenteePipelineViewProps {
  onNavigate: (tab: TabRoute) => void;
  onSubmitTicket: (ticket: Ticket) => void;
  tickets: Ticket[];
}

export const MenteePipelineView: React.FC<MenteePipelineViewProps> = ({
  onNavigate,
  onSubmitTicket,
  tickets,
}) => {
  const [presetIdx, setPresetIdx] = useState(0);
  const [courseContext, setCourseContext] = useState('Algorithms (Java) - IF101');
  const [topicDomain, setTopicDomain] = useState('Recursion');
  const [javaCode, setJavaCode] = useState(SAMPLE_BUG_PRESETS[0].rawCode);
  const [isEditingCode, setIsEditingCode] = useState(false);
  const [hypothesis, setHypothesis] = useState(SAMPLE_BUG_PRESETS[0].hypothesis);
  const [pipelineStage, setPipelineStage] = useState<number>(3);
  const [isDispatching, setIsDispatching] = useState(false);
  const [dispatchedTicketId, setDispatchedTicketId] = useState<string | null>(null);
  const [logModalOpen, setLogModalOpen] = useState(false);
  const [ticketSearchQuery, setTicketSearchQuery] = useState('');
  const [ticketStatusFilter, setTicketStatusFilter] = useState<'All' | TicketStatus>('All');

  const activePreset = SAMPLE_BUG_PRESETS[presetIdx];
  const redactionPreview = useMemo(() => redactPII(javaCode, 'Mentee-A42'), [javaCode]);

  const filteredTickets = useMemo(() => {
    const q = ticketSearchQuery.trim().toLowerCase();
    return tickets.filter((ticket) => {
      const matchesStatusPill =
        ticketStatusFilter === 'All' || ticket.status === ticketStatusFilter;
      if (!matchesStatusPill) return false;
      if (!q) return true;
      const haystack = [
        ticket.id,
        ticket.title,
        ticket.fileName,
        ticket.methodName,
        ticket.studentId,
        ticket.assignedMentor,
        ticket.topic,
        ticket.moduleCategory,
        ticket.status,
        ticket.submittedDate,
        ticket.submittedAgo,
      ]
        .join(' ')
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [tickets, ticketSearchQuery, ticketStatusFilter]);

  const handleLoadSample = () => {
    const nextIdx = (presetIdx + 1) % SAMPLE_BUG_PRESETS.length;
    const next = SAMPLE_BUG_PRESETS[nextIdx];
    setPresetIdx(nextIdx);
    setCourseContext(next.course);
    setTopicDomain(next.topicDomain);
    setJavaCode(next.rawCode);
    setHypothesis(next.hypothesis);
    setPipelineStage(3);
    setDispatchedTicketId(null);
  };

  const handleSubmitPipeline = () => {
    if (isDispatching) return;
    setIsDispatching(true);
    setPipelineStage(1);

    setTimeout(() => setPipelineStage(2), 300);
    setTimeout(() => setPipelineStage(3), 600);
    setTimeout(() => setPipelineStage(4), 900);
    setTimeout(() => {
      setPipelineStage(5);
      const newId = `T-${108 + tickets.length}`;
      const newTicket: Ticket = {
        id: newId,
        sessionCode: `#${894 + tickets.length}-MC`,
        studentId: 'Mentee-A42',
        status: 'Pending',
        topic: topicDomain.split(' ')[0],
        moduleCategory: activePreset.moduleCategory,
        assignedMentor: 'Mentor-B12',
        mentorInitials: 'B12',
        submittedDate: 'Nov 27, 2026',
        submittedAgo: 'JUST NOW',
        severity: 'SEV-2',
        fileName: activePreset.fileName,
        methodName: activePreset.methodName,
        title: `${topicDomain} Issue in ${activePreset.fileName}`,
        rawCode: javaCode,
        scrubbedCode: redactionPreview.scrubbedCode,
        redactionCount: redactionPreview.redactionCount,
        redactionDiffs: redactionPreview.diffs,
        faultLine: activePreset.faultLine,
        faultSummary: activePreset.faultSummary,
        stackTrace: activePreset.stackTrace,
        testVector: activePreset.testVector,
        studentHypothesis: hypothesis,
        curricularObjective: `IF101: ${topicDomain}`,
        curricularGoal:
          'Goal: Student isolates failing invariant without receiving direct Java patch lines.',
        aiTriageDiagnosis: `Classified: ${activePreset.faultSummary}.`,
        hint1: `Trace ${activePreset.methodName} on ${activePreset.testVector}. Where does your termination or boundary check fail to advance?`,
        hint1Exercise: `Trace 3 iterations on paper for ${activePreset.testVector}.`,
        hint1Target: `Targeting: ${topicDomain} Invariant`,
        hint2: `What defensive precondition or boundary ordering ensures ${activePreset.fileName} terminates cleanly on edge inputs?`,
        hint2Consideration: 'Check boundary predicates before recursive or iterative steps.',
        hint1Acknowledged: false,
        clarificationUsed: false,
        clarificationQuestion: '',
        resolutionStatus: 'full',
        clarityRating: 5,
        ticketClosed: false,
        hintsDelivered: false,
      };
      onSubmitTicket(newTicket);
      setIsDispatching(false);
      setDispatchedTicketId(newId);
    }, 1250);
  };

  return (
    <>
      {/* ==================== DESKTOP VIEW (lg+) ==================== */}
      <div className="hidden lg:flex flex-col w-full pb-8">
        {/* Sub-header & Context Bar */}
        <section className="flex items-center justify-between gap-4 py-3 mb-5">
          <div>
            <div className="flex items-center gap-2 mb-1 font-mono text-[11px]">
              <span className="font-semibold text-[#7C3AED] uppercase tracking-wider">
                Dialectic Workstation
              </span>
              <span aria-hidden="true">·</span>
              <span className="text-[#5F5E61]">Session #892-MC4</span>
            </div>
            <h1 className="text-[24px] leading-[32px] font-semibold text-[#1A1B23]">
              New Mentoring Ticket &amp; Socratic Pipeline
            </h1>
            <p className="text-[14px] text-[#4A4455] mt-0.5">
              Submit algorithmic Java bugs for automated regex PII sanitization and guided Socratic
              assistance.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-[#18181B] text-white px-4 py-2.5 rounded-2xl shadow-md">
            <Sparkles className="w-5 h-5 text-[#A78BFA]" />
            <div className="flex flex-col">
              <span className="font-mono text-[10px] text-[#C4B5FD] uppercase">
                Environment State
              </span>
              <span className="font-mono text-xs text-white">
                Prototype Mode: Mentee-A42 Simulation
              </span>
            </div>
          </div>
        </section>

        {/* Role Context Cards Mosaic */}
        <section className="grid grid-cols-3 gap-5 mb-7">
          {/* Mentee Card (Active) */}
          <button
            type="button"
            onClick={() => onNavigate('mentee-pipeline')}
            className="text-left relative bg-white p-5 rounded-2xl shadow-[0_8px_24px_-4px_rgba(99,14,212,0.08)] flex flex-col justify-between overflow-hidden border border-[#7C3AED]/30"
          >
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#7C3AED] to-[#8B5CF6]" />
            <div>
              <div className="flex items-center justify-between mb-2 pt-1">
                <span className="text-[15px] font-semibold text-[#1A1B23]">Mentee Portal</span>
                <span className="font-mono text-[11px] font-semibold text-[#630ED4]">
                  Active Queue
                </span>
              </div>
              <p className="text-xs text-[#4A4455] mb-4">
                Submit Java code bugs for Socratic peer-mentoring and privacy-sanitized feedback
                loops.
              </p>
            </div>
            <div className="flex items-center justify-between font-mono text-xs">
              <span className="text-[#7C3AED] font-semibold inline-flex items-center gap-1">
                Open Mentee View <ArrowRight className="w-3.5 h-3.5" />
              </span>
              <span className="text-[#5F5E61]">P-01</span>
            </div>
          </button>

          {/* Mentor Card */}
          <button
            type="button"
            onClick={() => onNavigate('mentor-workspace')}
            className="text-left bg-white p-5 rounded-2xl shadow-[0_4px_20px_-2px_rgba(99,14,212,0.05)] hover:shadow-md transition-all flex flex-col justify-between border border-[#CCC3D8]/30"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[15px] font-semibold text-[#1A1B23]">Peer Mentor</span>
                <span className="font-mono text-[11px] text-[#4A4455]">14 Online</span>
              </div>
              <p className="text-xs text-[#4A4455] mb-4">
                Review AI drafts and guide students dialectically without direct code leakage or
                answer reveals.
              </p>
            </div>
            <div className="flex items-center justify-between font-mono text-xs">
              <span className="text-[#4A4455] hover:text-[#7C3AED] inline-flex items-center gap-1">
                Open Mentor View <ArrowRight className="w-3.5 h-3.5" />
              </span>
              <span className="text-[#5F5E61]">M-09</span>
            </div>
          </button>

          {/* Course Supervisor Card */}
          <button
            type="button"
            onClick={() => onNavigate('admin-and-metrics')}
            className="text-left bg-white p-5 rounded-2xl shadow-[0_4px_20px_-2px_rgba(99,14,212,0.05)] hover:shadow-md transition-all flex flex-col justify-between border border-[#CCC3D8]/30"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[15px] font-semibold text-[#1A1B23]">Course Supervisor</span>
                <span className="font-mono text-[11px] text-[#4A4455]">IF101 Fall</span>
              </div>
              <p className="text-xs text-[#4A4455] mb-4">
                Monitor pilot metrics, automated guardrail block rate, and mentor token
                accreditation logs.
              </p>
            </div>
            <div className="flex items-center justify-between font-mono text-xs">
              <span className="text-[#4A4455] hover:text-[#7C3AED] inline-flex items-center gap-1">
                Open Admin View <ArrowRight className="w-3.5 h-3.5" />
              </span>
              <span className="text-[#5F5E61]">ADM-SYS</span>
            </div>
          </button>
        </section>

        {/* Two-Column Primary Workspace Split */}
        <div className="grid grid-cols-12 gap-6 items-start">
          {/* LEFT COLUMN (7 Cols) */}
          <section className="col-span-7 flex flex-col gap-5">
            <div className="bg-white p-6 rounded-2xl shadow-[0_8px_28px_-4px_rgba(99,14,212,0.06)] border border-[#CCC3D8]/30">
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#E9E7F3]">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#F4F2FE] flex items-center justify-center text-[#7C3AED] font-mono text-xs font-bold">
                    01
                  </div>
                  <div>
                    <h2 className="text-[18px] font-semibold text-[#1A1B23]">
                      Ticket Configuration
                    </h2>
                    <span className="font-mono text-[11px] text-[#4A4455]">
                      Session Target: Redaction &amp; Guidance Dispatch
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleLoadSample}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#18181B] text-white hover:bg-[#27272A] font-mono text-xs font-medium transition-colors shadow-sm whitespace-nowrap shrink-0"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Load Sample Java Bug</span>
                </button>
              </div>

              {/* Meta Selectors */}
              <div className="grid grid-cols-3 gap-4 mb-5">
                <div className="flex flex-col gap-1">
                  <label className="font-mono text-[10px] font-semibold uppercase tracking-wider text-[#4A4455]">
                    Assigned Pseudonym
                  </label>
                  <div className="flex items-center px-3 py-2 rounded-xl bg-[#F4F2FE] text-[#1A1B23] font-mono text-[13px]">
                    <Fingerprint className="w-4 h-4 text-[#5F5E61] mr-2 shrink-0" />
                    <span>Mentee-A42</span>
                  </div>
                  <span className="text-[11px] text-[#5F5E61]">Assigned for grading privacy</span>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-mono text-[10px] font-semibold uppercase tracking-wider text-[#4A4455]">
                    Course Context
                  </label>
                  <select
                    value={courseContext}
                    onChange={(e) => setCourseContext(e.target.value)}
                    className="w-full bg-[#F4F2FE] text-[#1A1B23] text-[13px] px-3 py-2 rounded-xl border border-transparent focus:outline-none focus:border-[#7C3AED]"
                  >
                    <option>Algorithms (Java) - IF101</option>
                    <option>Data Structures - CS102</option>
                    <option>Concurrent Systems - CS304</option>
                  </select>
                  <span className="text-[11px] text-[#5F5E61]">Fall 2026 Core Syllabus</span>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-mono text-[10px] font-semibold uppercase tracking-wider text-[#4A4455]">
                    Topic Domain
                  </label>
                  <select
                    value={topicDomain}
                    onChange={(e) => setTopicDomain(e.target.value)}
                    className="w-full bg-[#F4F2FE] text-[#1A1B23] text-[13px] px-3 py-2 rounded-xl border border-transparent focus:outline-none focus:border-[#7C3AED]"
                  >
                    <option>Recursion</option>
                    <option>Arrays &amp; Sliding Window</option>
                    <option>Binary Trees &amp; BST</option>
                    <option>Divide &amp; Conquer Sorting</option>
                  </select>
                  <span className="text-[11px] text-[#5F5E61]">Dialectic archetype: Tree Call</span>
                </div>
              </div>

              {/* Code Editor Toggle Bar */}
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-[11px] font-semibold text-[#4A4455]">
                  JAVA SOURCE INPUT ({redactionPreview.redactionCount} PII TOKENS DETECTED)
                </span>
                <button
                  type="button"
                  onClick={() => setIsEditingCode((prev) => !prev)}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-[#7C3AED] hover:underline"
                >
                  {isEditingCode ? (
                    <>
                      <Eye className="w-3.5 h-3.5" />
                      <span>Preview Highlighted Code</span>
                    </>
                  ) : (
                    <>
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit Java Source</span>
                    </>
                  )}
                </button>
              </div>

              <div className="mb-5">
                {isEditingCode ? (
                  <textarea
                    value={javaCode}
                    onChange={(e) => setJavaCode(e.target.value)}
                    rows={10}
                    spellCheck={false}
                    className="w-full p-4 rounded-2xl bg-[#0F172A] text-slate-100 font-mono text-[13px] leading-relaxed focus:outline-none focus:ring-2 focus:ring-[#7C3AED]"
                  />
                ) : (
                  <JavaCodeBlock
                    code={javaCode}
                    fileName={activePreset.fileName}
                    faultLine={activePreset.faultLine}
                    versionBadge="JVM 21"
                  />
                )}
              </div>

              {/* Compiler Diagnostic */}
              <div className="flex flex-col mb-4">
                <div className="flex items-center justify-between mb-1">
                  <label className="font-mono text-[10px] font-semibold uppercase tracking-wider text-[#4A4455] flex items-center gap-1.5">
                    <Bug className="w-4 h-4 text-[#BA1A1A]" />
                    <span>Compiler Diagnostic / Stack Trace</span>
                  </label>
                  <span className="font-mono text-[11px] text-[#5F5E61]">Raw output from stderr</span>
                </div>
                <div className="bg-[#F4F2FE] p-3.5 rounded-xl font-mono text-xs text-[#1A1B23] space-y-0.5">
                  {activePreset.stackTrace.map((line, i) => (
                    <div key={i} className={i === 0 ? 'text-[#BA1A1A] font-semibold' : 'pl-3'}>
                      {line}
                    </div>
                  ))}
                </div>
              </div>

              {/* Self-Reflection */}
              <div className="flex flex-col mb-5">
                <div className="flex items-center justify-between mb-1">
                  <label className="font-mono text-[10px] font-semibold uppercase tracking-wider text-[#4A4455] flex items-center gap-1.5">
                    <Lightbulb className="w-4 h-4 text-[#7C3AED]" />
                    <span>What I already tried &amp; My Hypothesis</span>
                  </label>
                  <span className="font-mono text-[11px] text-[#5F5E61]">Dialectic Requirement</span>
                </div>
                <textarea
                  value={hypothesis}
                  onChange={(e) => setHypothesis(e.target.value)}
                  rows={3}
                  placeholder="Explain your current reasoning..."
                  className="w-full bg-[#F4F2FE] text-[#1A1B23] text-[13px] p-3.5 rounded-xl border border-transparent focus:outline-none focus:border-[#7C3AED] focus:bg-white resize-none"
                />
              </div>

              {/* Action Bar */}
              <div className="flex items-center justify-between gap-4 pt-2 border-t border-[#E9E7F3]">
                <div className="flex items-center gap-1.5 text-xs text-[#4A4455]">
                  <ShieldCheck className="w-4 h-4 text-[#7C3AED]" />
                  <span>Zero-PII Token Redaction is applied automatically</span>
                </div>
                <button
                  type="button"
                  onClick={handleSubmitPipeline}
                  disabled={isDispatching}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#8B5CF6] text-white text-[14px] font-semibold shadow-[0_6px_20px_-4px_rgba(124,58,237,0.45)] hover:opacity-95 transition-all flex items-center gap-2 whitespace-nowrap shrink-0"
                >
                  {isDispatching ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Dispatching Pipeline...</span>
                    </>
                  ) : dispatchedTicketId ? (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Queued #{dispatchedTicketId}</span>
                    </>
                  ) : (
                    <>
                      <span>Submit to Agentic Pipeline</span>
                      <Zap className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>

              {dispatchedTicketId && (
                <div className="mt-4 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
                  <span className="text-xs font-medium text-emerald-900">
                    Ticket <strong>#{dispatchedTicketId}</strong> scrubbed ({redactionPreview.redactionCount}{' '}
                    PII tokens removed) and routed to Peer Mentor Queue.
                  </span>
                  <button
                    type="button"
                    onClick={() => onNavigate('mentor-workspace')}
                    className="text-xs font-semibold text-[#630ED4] hover:underline whitespace-nowrap"
                  >
                    Open in Mentor Desk -&gt;
                  </button>
                </div>
              )}
            </div>

            {/* Historical Session Redaction Preview & Filterable Ticket Queue */}
            <div className="bg-white p-5 rounded-2xl shadow-[0_4px_20px_-2px_rgba(99,14,212,0.05)] border border-[#CCC3D8]/30 space-y-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#F4F2FE] flex items-center justify-center text-[#7C3AED] shrink-0">
                    <History className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[14px] font-semibold text-[#1A1B23] block">
                      Recent Scrubbed Submissions &amp; Ticket Queue
                    </span>
                    <span className="text-xs text-[#4A4455]">
                      Filter pipeline tickets by name, file, mentee ID, status, or submission date
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setLogModalOpen(true)}
                  className="px-4 py-1.5 rounded-xl bg-[#18181B] hover:bg-[#27272A] text-white font-mono text-xs transition-colors shadow-sm whitespace-nowrap shrink-0"
                >
                  Inspect Log
                </button>
              </div>

              {/* Search Bar & Status Filters */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                <div className="relative flex-1 min-w-[240px]">
                  <Search className="w-4 h-4 text-[#5F5E61] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="search"
                    value={ticketSearchQuery}
                    onChange={(e) => setTicketSearchQuery(e.target.value)}
                    placeholder="Search tickets by name, status (Pending, Verified), or date (Nov 27, 2026)..."
                    aria-label="Filter tickets by name, status, or date"
                    className="w-full pl-9 pr-8 py-2 rounded-xl bg-[#F4F2FE] text-[13px] text-[#1A1B23] placeholder:text-[#5F5E61] border border-transparent focus:outline-none focus:border-[#7C3AED] focus:bg-white transition-colors"
                  />
                  {ticketSearchQuery && (
                    <button
                      type="button"
                      onClick={() => setTicketSearchQuery('')}
                      aria-label="Clear ticket search"
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#5F5E61] hover:text-[#1A1B23]"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-1.5 flex-wrap">
                  {(['All', 'Pending', 'Socratic', 'Verified', 'Flagged'] as const).map((status) => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => setTicketStatusFilter(status)}
                      className={`px-2.5 py-1 rounded-lg font-mono text-[11px] font-medium transition-colors ${
                        ticketStatusFilter === status
                          ? 'bg-[#7C3AED] text-white'
                          : 'bg-[#F4F2FE] text-[#4A4455] hover:text-[#1A1B23]'
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>

              {/* Filtered Tickets List */}
              <div className="divide-y divide-[#E9E7F3] border-t border-[#E9E7F3]">
                {filteredTickets.length === 0 ? (
                  <div className="py-6 text-center text-xs text-[#5F5E61]">
                    No tickets match &ldquo;{ticketSearchQuery || ticketStatusFilter}&rdquo;. Try searching by file name, mentee handle, status, or date.
                  </div>
                ) : (
                  filteredTickets.map((ticket) => (
                    <div
                      key={ticket.id}
                      className="py-3 flex items-center justify-between gap-4 hover:bg-[#F4F2FE]/50 px-2 rounded-xl transition-colors"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-[#7C3AED]">
                            #{ticket.id}
                          </span>
                          <span className="text-[13px] font-semibold text-[#1A1B23] truncate">
                            {ticket.title}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 mt-0.5 font-mono text-[11px] text-[#5F5E61]">
                          <span>{ticket.studentId}</span>
                          <span>·</span>
                          <span>{ticket.fileName}</span>
                          <span>·</span>
                          <span className="inline-flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {ticket.submittedDate} ({ticket.submittedAgo})
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5 shrink-0">
                        <span
                          className={`px-2.5 py-0.5 rounded-md font-mono text-[11px] font-semibold ${
                            ticket.status === 'Verified'
                              ? 'bg-emerald-50 text-emerald-700'
                              : ticket.status === 'Socratic'
                              ? 'bg-[#EADDFF]/60 text-[#630ED4]'
                              : ticket.status === 'Flagged'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-amber-100 text-amber-900'
                          }`}
                        >
                          {ticket.status}
                        </span>
                        <button
                          type="button"
                          onClick={() => onNavigate('hint-delivery')}
                          className="text-xs font-mono font-semibold text-[#7C3AED] hover:underline"
                        >
                          View Hints -&gt;
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </section>

          {/* RIGHT COLUMN: 5-Step Socratic Pipeline Stepper (5 Cols) */}
          <aside className="col-span-5 flex flex-col gap-4">
            <div className="bg-white p-6 rounded-2xl shadow-[0_8px_28px_-4px_rgba(99,14,212,0.06)] border border-[#CCC3D8]/30">
              <div className="flex items-center justify-between pb-3 mb-3">
                <div className="flex items-center gap-2">
                  <Workflow className="w-5 h-5 text-[#7C3AED]" />
                  <h2 className="text-[18px] font-semibold text-[#1A1B23]">Socratic Pipeline</h2>
                </div>
                <span className="px-2.5 py-0.5 rounded-lg bg-gradient-to-r from-[#7C3AED] to-[#8B5CF6] text-white font-mono text-[11px] font-semibold tabular-nums">
                  STAGE {pipelineStage} OF 5
                </span>
              </div>

              <p className="text-xs text-[#4A4455] mb-5">
                The IF101 AI dialectic engine sanitizes raw code, diagnoses root pedagogical
                bottlenecks, and curates non-solution hints.
              </p>

              <div className="space-y-4">
                {/* Step 1 */}
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full bg-[#F4F2FE] text-[#7C3AED] flex items-center justify-center shrink-0 mt-1">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div className="flex-1 bg-[#F4F2FE] p-3 rounded-xl">
                    <div className="flex items-center justify-between">
                      <span className="text-[14px] font-semibold text-[#1A1B23]">
                        1. Regex Redaction
                      </span>
                      <span className="font-mono text-[11px] font-semibold text-[#630ED4] tabular-nums">
                        Scrubbed ({redactionPreview.redactionCount})
                      </span>
                    </div>
                    <p className="text-xs text-[#4A4455] mt-1">
                      Scrubbed {redactionPreview.redactionCount} PII items: Student ID, campus email,
                      and local file paths.
                    </p>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full bg-[#F4F2FE] text-[#7C3AED] flex items-center justify-center shrink-0 mt-1">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div className="flex-1 bg-[#F4F2FE] p-3 rounded-xl">
                    <div className="flex items-center justify-between">
                      <span className="text-[14px] font-semibold text-[#1A1B23]">
                        2. Misconception Triage
                      </span>
                      <span className="font-mono text-[11px] font-semibold text-[#4A4455]">
                        Classified
                      </span>
                    </div>
                    <p className="text-xs text-[#4A4455] mt-1">
                      Classified: {activePreset.faultSummary}.
                    </p>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#7C3AED] to-[#8B5CF6] text-white flex items-center justify-center shrink-0 mt-1 shadow-sm">
                    {pipelineStage > 3 ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : (
                      <Sparkles className="w-4 h-4" />
                    )}
                  </div>
                  <div className="flex-1 bg-[#EADDFF]/40 p-3 rounded-xl border border-[#7C3AED]/20">
                    <div className="flex items-center justify-between">
                      <span className="text-[14px] font-semibold text-[#630ED4]">
                        3. Socratic Hint Synthesis
                      </span>
                      <span className="font-mono text-[11px] font-semibold text-[#18181B]">
                        {pipelineStage > 3 ? 'Ready' : 'Synthesizing'}
                      </span>
                    </div>
                    <p className="text-xs text-[#1A1B23] mt-1">
                      Drafting 2 progressive dialectic questions without leaking solution code.
                    </p>
                    <div className="mt-2 bg-white p-2.5 rounded-lg text-xs text-[#4A4455] italic">
                      &ldquo;Trace {activePreset.methodName} on {activePreset.testVector}. Where does
                      your termination or boundary check fail to advance?&rdquo;
                    </div>
                  </div>
                </div>

                {/* Step 4 */}
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full bg-[#F4F2FE] text-[#7C3AED] flex items-center justify-center shrink-0 mt-1">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div className="flex-1 bg-[#F4F2FE] p-3 rounded-xl">
                    <div className="flex items-center justify-between">
                      <span className="text-[14px] font-semibold text-[#1A1B23]">
                        4. Integrity Guardrail Check
                      </span>
                      <span className="font-mono text-[11px] font-semibold text-[#4A4455]">
                        0% Overlap
                      </span>
                    </div>
                    <p className="text-xs text-[#4A4455] mt-1">
                      Verified: 0 direct code solutions detected against canonical assignment keys.
                    </p>
                  </div>
                </div>

                {/* Step 5 */}
                <div className="flex items-start gap-3">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-1 font-mono text-xs font-semibold ${
                      pipelineStage >= 5
                        ? 'bg-emerald-600 text-white'
                        : 'bg-[#EEECF8] text-[#5F5E61]'
                    }`}
                  >
                    {pipelineStage >= 5 ? <CheckCircle2 className="w-4 h-4" /> : '05'}
                  </div>
                  <div
                    className={`flex-1 p-3 rounded-xl border border-[#E9E7F3] ${
                      pipelineStage >= 5 ? 'bg-emerald-50/70' : 'bg-white opacity-80'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[14px] font-semibold text-[#1A1B23]">
                        5. Peer Mentor Gate Routing
                      </span>
                      <span className="font-mono text-[11px] text-[#5F5E61]">
                        {pipelineStage >= 5 ? 'Dispatched' : 'Queued'}
                      </span>
                    </div>
                    <p className="text-xs text-[#4A4455] mt-1">
                      Scheduled for dispatch to active senior mentor queue (max 3 concurrent
                      sessions).
                    </p>
                  </div>
                </div>
              </div>

              {/* Telemetry Snapshot */}
              <div className="mt-6 bg-[#F4F2FE] p-4 rounded-2xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-[10px] font-semibold uppercase tracking-wider text-[#1A1B23]">
                    Telemetry Snapshot
                  </span>
                  <span className="font-mono text-[11px] text-[#7C3AED] font-semibold">
                    Zero-PII Verified
                  </span>
                </div>
                <div className="space-y-1.5 font-mono text-[11px]">
                  <div className="flex justify-between text-[#4A4455]">
                    <span>Redacted Code Preview:</span>
                    <span className="text-[#1A1B23] font-medium">Scrubbed Clean</span>
                  </div>
                  <div className="flex justify-between text-[#4A4455]">
                    <span>Socratic Policy Ruleset:</span>
                    <span className="text-[#7C3AED] font-medium">Section 4.2 Compliant</span>
                  </div>
                  <div className="flex justify-between text-[#4A4455]">
                    <span>Estimated Mentor Wait:</span>
                    <span className="text-[#1A1B23] font-medium tabular-nums">~3 mins</span>
                  </div>
                </div>
                <div className="mt-3 pt-2">
                  <div className="flex justify-between text-xs text-[#4A4455] mb-1 font-mono tabular-nums">
                    <span>Agent Guardrail Confidence</span>
                    <span className="text-[#7C3AED] font-bold">98.4%</span>
                  </div>
                  <div className="w-full bg-[#E9E7F3] h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-[#7C3AED] to-[#8B5CF6] h-full rounded-full"
                      style={{ width: '98.4%' }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl shadow-sm border border-[#CCC3D8]/30 flex items-start gap-3">
              <Users className="w-5 h-5 text-[#7C3AED] shrink-0 mt-0.5" />
              <div>
                <span className="text-[14px] font-semibold text-[#1A1B23]">
                  IF101 Pedagogical Invariant
                </span>
                <p className="text-xs text-[#4A4455] mt-0.5">
                  Mentors are prohibited from pasting patch code. All automated and human hints must
                  provoke structural mental model reconciliation.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* ==================== MOBILE VIEW (< lg) ==================== */}
      <div className="lg:hidden flex flex-col w-full space-y-4 pb-4">
        <div className="rounded-2xl bg-gradient-to-br from-[#7C3AED] via-[#5D25C7] to-[#630ED4] p-4 text-white shadow-md">
          <div className="flex items-center justify-between text-[11px] font-medium mb-2">
            <span className="font-mono text-[#EDE0FF]">Session #892-MC4</span>
            <span className="font-mono font-bold text-white">IF101 Algorithms</span>
          </div>
          <div className="flex items-end justify-between">
            <div>
              <h1 className="text-lg font-bold text-white">New Diagnostic Ticket</h1>
              <p className="text-xs text-[#EDE0FF]">Automated Socratic peer review ready</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
          </div>
        </div>

        {/* Anonymous Identity Card */}
        <div className="rounded-2xl bg-white p-4 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#630ED4]" />
              <span className="text-[15px] font-semibold text-[#1A1B23]">Anonymous Identity</span>
            </div>
            <span className="inline-flex items-center gap-1 text-xs font-mono text-[#5D25C7]">
              <Lock className="w-3.5 h-3.5" /> Zero-PII active
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div className="bg-[#F4F2FE] p-2.5 rounded-xl">
              <span className="text-[10px] font-mono uppercase text-[#4A4455] block">
                Assigned Handle
              </span>
              <span className="text-sm font-bold text-[#630ED4]">Mentee-A42</span>
            </div>
            <div className="bg-[#F4F2FE] p-2.5 rounded-xl">
              <span className="text-[10px] font-mono uppercase text-[#4A4455] block">
                Module Context
              </span>
              <span className="text-sm font-semibold text-[#1A1B23] truncate block">
                Algorithms Java
              </span>
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-[#4A4455]">Topic Domain</label>
              <button
                type="button"
                onClick={handleLoadSample}
                className="text-xs font-semibold text-[#630ED4] inline-flex items-center gap-1"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Load Sample Bug
              </button>
            </div>
            <select
              value={topicDomain}
              onChange={(e) => setTopicDomain(e.target.value)}
              className="w-full h-11 px-3 rounded-xl bg-[#F4F2FE] text-sm text-[#1A1B23] focus:outline-none focus:ring-2 focus:ring-[#630ED4]"
            >
              <option>Recursion</option>
              <option>Arrays &amp; Sliding Window</option>
              <option>Divide &amp; Conquer Sorting</option>
            </select>
          </div>
        </div>

        <JavaCodeBlock
          code={javaCode}
          fileName={activePreset.fileName}
          faultLine={activePreset.faultLine}
          versionBadge="Java 21"
          compact
        />

        {/* Compiler Diagnostic */}
        <div className="rounded-2xl bg-[#FFDAD6]/45 p-4 space-y-2">
          <div className="flex items-center justify-between text-[#93000A]">
            <span className="text-sm font-bold flex items-center gap-1.5">
              <Bug className="w-4 h-4 text-[#BA1A1A]" /> Compiler Diagnostic
            </span>
            <span className="font-mono text-[10px] font-bold text-[#BA1A1A]">CRASH</span>
          </div>
          <div className="bg-white/90 rounded-xl p-2.5 font-mono text-[11px] text-[#1A1B23]">
            {activePreset.stackTrace.map((line, i) => (
              <p key={i} className={i === 0 ? 'text-[#BA1A1A] font-semibold' : 'text-[#4A4455]'}>
                {line}
              </p>
            ))}
          </div>
        </div>

        {/* Hypothesis */}
        <div className="rounded-2xl bg-white p-4 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold text-[#1A1B23]">
              What I tried &amp; my hypothesis
            </label>
            <span className="text-[11px] font-mono text-[#5F5E61] tabular-nums">
              {hypothesis.length} chars
            </span>
          </div>
          <textarea
            value={hypothesis}
            onChange={(e) => setHypothesis(e.target.value)}
            rows={3}
            className="w-full p-3 rounded-xl bg-[#F4F2FE] text-sm text-[#1A1B23] focus:outline-none focus:ring-2 focus:ring-[#630ED4] resize-none"
          />
        </div>

        {/* Socratic Pipeline Mobile Card */}
        <div className="rounded-2xl bg-white p-4 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-[#1A1B23]">Socratic Pipeline</span>
            <span className="font-mono text-xs font-bold text-[#630ED4] tabular-nums">
              Step {pipelineStage} of 5
            </span>
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#F4F2FE]">
              <span className="font-medium">1. Regex Redaction</span>
              <span className="font-mono text-emerald-700 font-semibold">
                Scrubbed ({redactionPreview.redactionCount})
              </span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#F4F2FE]">
              <span className="font-medium">2. Misconception Triage</span>
              <span className="font-mono text-emerald-700 font-semibold">Classified</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#EADDFF]/50">
              <span className="font-semibold text-[#630ED4]">3. Socratic Synthesis</span>
              <span className="font-mono text-[#630ED4] font-bold">
                {pipelineStage > 3 ? 'Ready' : 'Active'}
              </span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#F4F2FE]">
              <span className="font-medium">4. Integrity Guardrail</span>
              <span className="font-mono text-[#4A4455]">0% Overlap</span>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleSubmitPipeline}
          disabled={isDispatching}
          className="w-full min-h-[52px] rounded-2xl bg-[#630ED4] hover:bg-[#7645E0] text-white font-semibold flex items-center justify-center gap-2 shadow-lg shadow-purple-500/25 transition-all"
        >
          {isDispatching ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Routing to Socratic Desk...</span>
            </>
          ) : dispatchedTicketId ? (
            <>
              <CheckCircle2 className="w-5 h-5" />
              <span>Ticket #{dispatchedTicketId} Enqueued!</span>
            </>
          ) : (
            <>
              <FileCode2 className="w-5 h-5" />
              <span>Submit to Agentic Pipeline</span>
            </>
          )}
        </button>

        {/* Mobile Searchable Ticket Queue */}
        <div className="rounded-2xl bg-white p-4 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-[#1A1B23]">
              Recent Submissions ({filteredTickets.length})
            </span>
            <span className="font-mono text-[11px] text-[#5F5E61]">Filter by name, status, date</span>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 text-[#5F5E61] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="search"
              value={ticketSearchQuery}
              onChange={(e) => setTicketSearchQuery(e.target.value)}
              placeholder="Search tickets by name, status, or date..."
              aria-label="Search tickets on mobile"
              className="w-full pl-9 pr-8 py-2 rounded-xl bg-[#F4F2FE] text-xs text-[#1A1B23] placeholder:text-[#5F5E61] focus:outline-none focus:ring-2 focus:ring-[#630ED4]"
            />
            {ticketSearchQuery && (
              <button
                type="button"
                onClick={() => setTicketSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#5F5E61]"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="space-y-2">
            {filteredTickets.length === 0 ? (
              <p className="text-xs text-[#5F5E61] text-center py-3">
                No matching tickets found.
              </p>
            ) : (
              filteredTickets.map((ticket) => (
                <div
                  key={ticket.id}
                  className="p-2.5 rounded-xl bg-[#F4F2FE] flex items-center justify-between gap-2"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-[11px] font-bold text-[#630ED4]">
                        #{ticket.id}
                      </span>
                      <span className="text-xs font-semibold text-[#1A1B23] truncate">
                        {ticket.title}
                      </span>
                    </div>
                    <span className="font-mono text-[10px] text-[#5F5E61] block">
                      {ticket.studentId} · {ticket.submittedDate}
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-white font-mono text-[10px] font-semibold text-[#630ED4] shrink-0">
                    {ticket.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Redaction Audit Modal */}
      {logModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-[#1A1B23]">
                Regex Redaction Audit Diff (Live Preview)
              </h3>
              <button
                type="button"
                onClick={() => setLogModalOpen(false)}
                className="p-1 text-[#5F5E61]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-2 bg-[#F4F2FE] p-4 rounded-xl font-mono text-xs">
              {redactionPreview.diffs.map((d, i) => (
                <div key={i} className="space-y-0.5 pb-2 border-b border-[#CCC3D8]/40 last:border-0">
                  <div className="text-[10px] text-[#5F5E61] uppercase">{d.label}</div>
                  <div className="text-[#BA1A1A]">{d.removed}</div>
                  <div className="text-emerald-700">{d.added}</div>
                </div>
              ))}
            </div>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setLogModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-[#18181B] text-white text-xs font-semibold"
              >
                Close Log
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
