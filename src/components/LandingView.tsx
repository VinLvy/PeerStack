import React, { useMemo, useState } from 'react';
import {
  ArrowRight,
  Award,
  BookOpen,
  Bot,
  ChevronRight,
  Code2,
  GitBranch,
  Hourglass,
  Lightbulb,
  Lock,
  RefreshCw,
  Search,
  Send,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Star,
  Terminal,
  UserCheck,
  X,
} from 'lucide-react';
import { ASSETS, SAMPLE_BUG_PRESETS } from '../data/initialData';
import {
  ChatMessage,
  KanbanCard,
  MentorCandidate,
  TabRoute,
  Ticket,
} from '../types';
import { generateSocraticReply, redactPII } from '../utils/socraticEngine';
import { JavaCodeBlock } from './JavaCodeBlock';

interface LandingViewProps {
  tickets: Ticket[];
  kanbanCards: KanbanCard[];
  chatMessages: ChatMessage[];
  onSendChat: (msg: ChatMessage) => void;
  onNavigate: (tab: TabRoute) => void;
  onInspectTicket: (ticketId: string, targetTab: TabRoute) => void;
  onAdvanceKanban: (cardId: string) => void;
  onApplyMentor: (candidate: Omit<MentorCandidate, 'id' | 'code' | 'status'>) => void;
}

type ModuleFilter = 'All Modules' | 'Arrays' | 'Recursion' | 'Object-Oriented';
type MobileQueueFilter = 'All' | 'Recursion' | 'BinarySearch' | 'Sorting';

export const LandingView: React.FC<LandingViewProps> = ({
  tickets,
  kanbanCards,
  chatMessages,
  onSendChat,
  onNavigate,
  onInspectTicket,
  onAdvanceKanban,
  onApplyMentor,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [moduleFilter, setModuleFilter] = useState<ModuleFilter>('All Modules');
  const [mobileQueueFilter, setMobileQueueFilter] = useState<MobileQueueFilter>('All');
  const [chatInput, setChatInput] = useState('');
  const [mobileAskInput, setMobileAskInput] = useState('');
  const [mobileAiReply, setMobileAiReply] = useState<string | null>(null);
  const [previewBugIdx, setPreviewBugIdx] = useState(0);
  const [hintsReleasedCount, setHintsReleasedCount] = useState(2);

  // Modals
  const [syllabusOpen, setSyllabusOpen] = useState(false);
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [frameworkModal, setFrameworkModal] = useState<
    null | 'regex' | 'socratic' | 'integrity' | 'gate' | 'guidelines'
  >(null);

  // Mentor application form
  const [applicantName, setApplicantName] = useState('');
  const [applicantYear, setApplicantYear] = useState('CS Junior');
  const [applicantGrade, setApplicantGrade] = useState('A Grade (IF101)');
  const [applicationSubmitted, setApplicationSubmitted] = useState(false);

  const pendingCount = tickets.filter((t) => t.status === 'Pending' || t.status === 'Socratic').length;

  const filteredTickets = useMemo(() => {
    return tickets.filter((t) => {
      const matchesModule =
        moduleFilter === 'All Modules' ||
        (moduleFilter === 'Arrays' && t.moduleCategory === 'Arrays') ||
        (moduleFilter === 'Recursion' && t.moduleCategory === 'Recursion') ||
        (moduleFilter === 'Object-Oriented' && t.moduleCategory === 'Object-Oriented');
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !q ||
        t.studentId.toLowerCase().includes(q) ||
        t.topic.toLowerCase().includes(q) ||
        t.methodName.toLowerCase().includes(q) ||
        t.fileName.toLowerCase().includes(q);
      return matchesModule && matchesSearch;
    });
  }, [tickets, moduleFilter, searchQuery]);

  const mobileFilteredTickets = useMemo(() => {
    return tickets.filter((t) => {
      if (mobileQueueFilter === 'All') return true;
      if (mobileQueueFilter === 'Recursion') return t.topic === 'Recursion';
      if (mobileQueueFilter === 'BinarySearch') return t.topic === 'BinarySearch';
      if (mobileQueueFilter === 'Sorting') return t.topic === 'MergeSort';
      return true;
    });
  }, [tickets, mobileQueueFilter]);

  const activePreset = SAMPLE_BUG_PRESETS[previewBugIdx];

  const handleChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = chatInput.trim();
    if (!trimmed) return;

    const menteeMsg: ChatMessage = {
      id: `m-${Date.now()}`,
      sender: 'mentee',
      label: 'MENTEE',
      text: trimmed,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    onSendChat(menteeMsg);
    setChatInput('');

    const { reply } = generateSocraticReply(trimmed, 'Recursive Fibonacci');
    setTimeout(() => {
      onSendChat({
        id: `a-${Date.now() + 1}`,
        sender: 'ai',
        label: 'SOCRATIC AI AGENT',
        text: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      });
    }, 220);
  };

  const handleReleaseHint = () => {
    setHintsReleasedCount((c) => c + 1);
    onSendChat({
      id: `h-${Date.now()}`,
      sender: 'ai',
      label: 'SOCRATIC AI AGENT · HINT RELEASED',
      text: `Guiding Check #${hintsReleasedCount + 1}: Look at line ${activePreset.faultLine} in ${activePreset.fileName}. What input state causes the method to repeat without reaching a termination invariant?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    });
  };

  const handleMobileAskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = mobileAskInput.trim();
    if (!trimmed) return;
    const { reply } = generateSocraticReply(trimmed, 'IF101 Recursion');
    setMobileAiReply(reply);
    setMobileAskInput('');
  };

  const handleApplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!applicantName.trim()) return;
    const parts = applicantName.trim().split(/\s+/);
    const initials = parts
      .map((p) => p[0]?.toUpperCase() || '')
      .join('')
      .slice(0, 2);
    onApplyMentor({
      name: applicantName.trim(),
      initials: initials || 'PM',
      year: applicantYear,
      javaProficiency: applicantGrade,
      socraticTraining: 'Completed Nov 27',
    });
    setApplicationSubmitted(true);
    setTimeout(() => {
      setApplyModalOpen(false);
      setApplicationSubmitted(false);
      setApplicantName('');
    }, 1400);
  };

  const kanbanColumns: Array<KanbanCard['column']> = [
    'Submitted',
    'Socratic Review',
    'Verified Pass',
  ];

  return (
    <>
      {/* ==================== DESKTOP VIEW (lg+) ==================== */}
      <div className="hidden lg:flex flex-col w-full space-y-6">
        {/* 1. Top Notice Banner */}
        <section className="w-full bg-[#F4F2FE] rounded-2xl p-4 shadow-[0_4px_20px_rgba(124,58,237,0.05)] border border-[#CCC3D8]/40">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <span className="font-mono text-[10px] font-semibold tracking-wider uppercase text-[#5A00C6] bg-[#EADDFF] px-2.5 py-1 rounded-full shrink-0">
                Alpha Cohort Notice
              </span>
              <p className="text-[13px] text-[#1A1B23] truncate">
                <strong className="font-semibold">IF101 Algorithms Fall 2026</strong> semester is
                now live with automated Socratic guardrails.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setSyllabusOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white text-[#7C3AED] hover:bg-[#EADDFF]/50 transition-colors text-xs font-semibold shadow-sm border border-[#CCC3D8]/40 whitespace-nowrap shrink-0"
            >
              <BookOpen className="w-4 h-4" />
              <span>View Syllabus</span>
            </button>
          </div>
        </section>

        {/* 2. Hero Section with Asymmetric Balance */}
        <section className="relative w-full rounded-[20px] bg-white p-10 overflow-hidden shadow-[0_12px_40px_rgba(124,58,237,0.08)] border border-[#CCC3D8]/30">
          <div className="absolute -right-16 -top-16 w-96 h-96 rounded-full bg-gradient-to-br from-[#7C3AED]/15 to-[#8B5CF6]/20 blur-3xl pointer-events-none" />
          <div className="absolute right-1/4 -bottom-20 w-80 h-80 rounded-full bg-[#EADDFF]/40 blur-3xl pointer-events-none" />

          <div className="relative z-10 grid grid-cols-12 gap-8 items-center">
            <div className="col-span-8 flex flex-col gap-4">
              <div className="flex items-center gap-2 text-[11px] font-mono">
                <span className="text-[#4A4455] font-semibold">COHORT IF101.A1</span>
                <span aria-hidden="true" className="text-[#7B7487]">
                  ·
                </span>
                <span className="text-[#7C3AED] font-medium">Java 21 LTS Dialectic</span>
              </div>

              <h1 className="text-[36px] leading-[44px] font-bold text-[#1A1B23] tracking-tight max-w-3xl [text-wrap:balance]">
                Agentic Socratic Peer-Mentoring Without Giving Away the Answer
              </h1>

              <p className="text-[15px] leading-[24px] text-[#4A4455] max-w-2xl">
                Empower introductory Java students to debug algorithms through guided AI questioning
                and verified peer review.
              </p>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => onNavigate('mentee-pipeline')}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-[#7C3AED] to-[#8B5CF6] text-white text-[14px] font-semibold shadow-lg shadow-purple-500/25 hover:opacity-95 transition-all whitespace-nowrap shrink-0"
                >
                  <Terminal className="w-4 h-4" />
                  <span>Launch Mentee Queue</span>
                </button>
                <button
                  type="button"
                  onClick={() => setApplyModalOpen(true)}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-[#F4F2FE] text-[#1A1B23] text-[14px] font-semibold hover:bg-[#E9E7F3] transition-all border border-[#CCC3D8]/40 whitespace-nowrap shrink-0"
                >
                  <Award className="w-4 h-4 text-[#7C3AED]" />
                  <span>Apply as Peer Mentor</span>
                </button>
              </div>
            </div>

            {/* Mini Live Metric Slate */}
            <div className="col-span-4 flex flex-col gap-3 bg-[#F4F2FE] p-5 rounded-2xl shadow-sm border border-[#CCC3D8]/40">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] font-semibold uppercase tracking-wider text-[#4A4455]">
                  Active Socratic Kernel
                </span>
                <span className="font-mono text-[11px] font-semibold text-[#630ED4]">
                  AST Sandbox
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2.5 pt-1">
                <div className="bg-white p-3 rounded-xl shadow-sm">
                  <div className="font-mono text-lg font-semibold text-[#1A1B23] tabular-nums">
                    99.4%
                  </div>
                  <div className="font-mono text-[10px] uppercase tracking-wider text-[#5F5E61]">
                    Guardrail Efficacy
                  </div>
                </div>
                <div className="bg-white p-3 rounded-xl shadow-sm">
                  <div className="font-mono text-lg font-semibold text-[#7C3AED] tabular-nums">
                    0
                  </div>
                  <div className="font-mono text-[10px] uppercase tracking-wider text-[#5F5E61]">
                    Direct Sol Leakage
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 pt-1 text-xs text-[#4A4455]">
                <ShieldCheck className="w-4 h-4 text-[#7C3AED] shrink-0" />
                <span>Sandboxed with AST verification</span>
              </div>
            </div>
          </div>
        </section>

        {/* 3. 4 Workflow Feature Cards */}
        <section className="w-full">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-baseline gap-2.5">
              <span className="font-mono text-[10px] font-semibold tracking-wider uppercase text-[#5F5E61]">
                Core Architecture
              </span>
              <h2 className="text-[18px] font-semibold text-[#1A1B23]">
                Pedagogical Guardrail Framework
              </h2>
            </div>
            <span className="font-mono text-[11px] text-[#5F5E61]">4 Pipeline Stages</span>
          </div>

          <div className="grid grid-cols-4 gap-4">
            {/* Card 1 */}
            <div className="flex flex-col justify-between bg-white rounded-2xl p-5 shadow-[0_8px_30px_rgba(124,58,237,0.05)] border border-[#CCC3D8]/30 overflow-hidden">
              <div>
                <div className="flex items-center justify-between mb-3 font-mono text-[11px]">
                  <span className="text-[#4A4455]">Module 1–6</span>
                  <span className="inline-flex items-center gap-1 font-semibold text-[#1A1B23] tabular-nums">
                    <Star className="w-3.5 h-3.5 text-[#7C3AED] fill-[#7C3AED]" /> 4.9
                  </span>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <Lock className="w-5 h-5 text-[#7C3AED] shrink-0" />
                  <h3 className="text-[15px] font-semibold text-[#1A1B23]">Regex Redaction</h3>
                </div>
                <p className="text-[13px] text-[#4A4455] leading-relaxed">
                  Automatically strips student IDs and credentials from pasted Java source files.
                </p>
              </div>
              <div className="flex items-center justify-between pt-4 mt-4 border-t border-[#E9E7F3]">
                <span className="font-mono text-[11px] font-semibold text-[#5D25C7]">Active</span>
                <button
                  type="button"
                  onClick={() => setFrameworkModal('regex')}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-[#7C3AED] hover:text-[#630ED4] whitespace-nowrap"
                >
                  <span>Inspect Filter</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Card 2 */}
            <div className="flex flex-col justify-between bg-white rounded-2xl p-5 shadow-[0_8px_30px_rgba(124,58,237,0.05)] border border-[#CCC3D8]/30 overflow-hidden">
              <div>
                <div className="flex items-center justify-between mb-3 font-mono text-[11px]">
                  <span className="text-[#4A4455]">Java AST Engine</span>
                  <span className="inline-flex items-center gap-1 font-semibold text-[#1A1B23] tabular-nums">
                    <Star className="w-3.5 h-3.5 text-[#7C3AED] fill-[#7C3AED]" /> 4.8
                  </span>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <Bot className="w-5 h-5 text-[#7C3AED] shrink-0" />
                  <h3 className="text-[15px] font-semibold text-[#1A1B23]">Socratic Draft</h3>
                </div>
                <p className="text-[13px] text-[#4A4455] leading-relaxed">
                  AI agent generates guiding questions instead of direct solutions for recursion and
                  loops.
                </p>
              </div>
              <div className="flex items-center justify-between pt-4 mt-4 border-t border-[#E9E7F3]">
                <span className="font-mono text-[11px] font-semibold text-[#630ED4]">Core</span>
                <button
                  type="button"
                  onClick={() => setFrameworkModal('socratic')}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-[#7C3AED] hover:text-[#630ED4] whitespace-nowrap"
                >
                  <span>Test Prompt</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Card 3 */}
            <div className="flex flex-col justify-between bg-white rounded-2xl p-5 shadow-[0_8px_30px_rgba(124,58,237,0.05)] border border-[#CCC3D8]/30 overflow-hidden">
              <div>
                <div className="flex items-center justify-between mb-3 font-mono text-[11px]">
                  <span className="text-[#4A4455]">Zero-Trust</span>
                  <span className="inline-flex items-center gap-1 font-semibold text-[#1A1B23] tabular-nums">
                    <Star className="w-3.5 h-3.5 text-[#7C3AED] fill-[#7C3AED]" /> 5.0
                  </span>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="w-5 h-5 text-[#7C3AED] shrink-0" />
                  <h3 className="text-[15px] font-semibold text-[#1A1B23]">Integrity Guardrail</h3>
                </div>
                <p className="text-[13px] text-[#4A4455] leading-relaxed">
                  Flags direct copy-pasting of instructor solution keys and blocks instant
                  submissions.
                </p>
              </div>
              <div className="flex items-center justify-between pt-4 mt-4 border-t border-[#E9E7F3]">
                <span className="font-mono text-[11px] font-semibold text-[#BA1A1A]">Strict</span>
                <button
                  type="button"
                  onClick={() => setFrameworkModal('integrity')}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-[#7C3AED] hover:text-[#630ED4] whitespace-nowrap"
                >
                  <span>View Policy</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Card 4 */}
            <div className="flex flex-col justify-between bg-white rounded-2xl p-5 shadow-[0_8px_30px_rgba(124,58,237,0.05)] border border-[#CCC3D8]/30 overflow-hidden">
              <div>
                <div className="flex items-center justify-between mb-3 font-mono text-[11px]">
                  <span className="text-[#4A4455]">Max 3 Sessions</span>
                  <span className="inline-flex items-center gap-1 font-semibold text-[#1A1B23] tabular-nums">
                    <Star className="w-3.5 h-3.5 text-[#7C3AED] fill-[#7C3AED]" /> 4.9
                  </span>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <Hourglass className="w-5 h-5 text-[#7C3AED] shrink-0" />
                  <h3 className="text-[15px] font-semibold text-[#1A1B23]">Capped Mentor Gate</h3>
                </div>
                <p className="text-[13px] text-[#4A4455] leading-relaxed">
                  Limits senior peer mentors to 3 active review sessions to prevent cognitive
                  burnout.
                </p>
              </div>
              <div className="flex items-center justify-between pt-4 mt-4 border-t border-[#E9E7F3]">
                <span className="font-mono text-[11px] font-semibold text-[#5F5E61]">Balanced</span>
                <button
                  type="button"
                  onClick={() => setFrameworkModal('gate')}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-[#7C3AED] hover:text-[#630ED4] whitespace-nowrap"
                >
                  <span>Check Schedule</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* 4. Session Queue Section */}
        <section className="w-full bg-white rounded-[20px] p-6 shadow-[0_8px_30px_rgba(124,58,237,0.06)] border border-[#CCC3D8]/30">
          <div className="flex items-center justify-between gap-4 pb-5">
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-[18px] font-semibold text-[#1A1B23]">
                  IF101 Algorithms Session Queue
                </h2>
                <span className="font-mono text-[11px] font-semibold text-[#630ED4] tabular-nums">
                  {pendingCount} Active
                </span>
              </div>
              <div className="flex items-center gap-2 pt-1 font-mono text-[11px] text-[#5F5E61]">
                <span className="text-[#7C3AED] font-medium">Queue (current)</span>
                <span aria-hidden="true">·</span>
                <button
                  type="button"
                  onClick={() => onNavigate('mentee-pipeline')}
                  className="hover:text-[#1A1B23]"
                >
                  Redactions
                </button>
                <span aria-hidden="true">·</span>
                <button
                  type="button"
                  onClick={() => onNavigate('mentor-workspace')}
                  className="hover:text-[#1A1B23]"
                >
                  Guardrails
                </button>
                <span aria-hidden="true">·</span>
                <button
                  type="button"
                  onClick={() => onNavigate('admin-and-metrics')}
                  className="hover:text-[#1A1B23]"
                >
                  Metrics
                </button>
              </div>
            </div>

            <div className="relative min-w-[300px]">
              <Search className="w-4 h-4 text-[#5F5E61] absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search student ID or Java method..."
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#F4F2FE] text-[#1A1B23] text-[13px] placeholder:text-[#5F5E61] focus:outline-none focus:bg-white border border-[#CCC3D8]/50 focus:border-[#7C3AED]"
              />
            </div>
          </div>

          {/* Interactive Module Filter Tabs */}
          <div className="flex flex-wrap items-center gap-2 pb-4">
            {(['All Modules', 'Arrays', 'Recursion', 'Object-Oriented'] as ModuleFilter[]).map(
              (chip) => {
                const active = moduleFilter === chip;
                return (
                  <button
                    key={chip}
                    type="button"
                    onClick={() => setModuleFilter(chip)}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap shrink-0 ${
                      active
                        ? 'bg-gradient-to-r from-[#7C3AED] to-[#8B5CF6] text-white shadow-sm shadow-purple-500/20'
                        : 'bg-[#F4F2FE] text-[#4A4455] hover:text-[#1A1B23]'
                    }`}
                  >
                    {chip}
                  </button>
                );
              }
            )}
          </div>

          {/* Data Table */}
          <div className="overflow-x-auto rounded-2xl border border-[#CCC3D8]/40">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F4F2FE] font-mono text-[10px] uppercase tracking-wider text-[#5F5E61]">
                  <th className="py-3 px-4">Student ID</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Java Topic</th>
                  <th className="py-3 px-4">Assigned Mentor</th>
                  <th className="py-3 px-4">Submitted</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#CCC3D8]/30 text-[13px]">
                {filteredTickets.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-[#5F5E61]">
                      No matching tickets in queue.{' '}
                      <button
                        type="button"
                        onClick={() => {
                          setSearchQuery('');
                          setModuleFilter('All Modules');
                        }}
                        className="text-[#7C3AED] font-semibold underline"
                      >
                        Reset filters
                      </button>
                    </td>
                  </tr>
                ) : (
                  filteredTickets.map((ticket) => (
                    <tr key={ticket.id} className="hover:bg-[#F4F2FE]/50 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-semibold text-[#1A1B23]">
                        {ticket.studentId}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-md font-mono text-[11px] font-medium ${
                            ticket.status === 'Pending'
                              ? 'bg-[#E4E1E6] text-[#1B1B1E]'
                              : ticket.status === 'Socratic'
                              ? 'bg-[#E9DDFF] text-[#23005C]'
                              : ticket.status === 'Verified'
                              ? 'bg-[#EADDFF] text-[#25005A]'
                              : 'bg-[#FFDAD6] text-[#93000A]'
                          }`}
                        >
                          {ticket.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-xs text-[#4A4455]">
                        {ticket.topic}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-xs text-[#1A1B23]">
                        {ticket.assignedMentor}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-xs text-[#5F5E61] tabular-nums">
                        {ticket.submittedDate}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => onInspectTicket(ticket.id, 'mentor-workspace')}
                          className="px-3.5 py-1.5 rounded-lg bg-[#F4F2FE] hover:bg-gradient-to-r hover:from-[#7C3AED] hover:to-[#8B5CF6] hover:text-white text-[#4A4455] font-mono text-xs font-medium transition-all whitespace-nowrap"
                        >
                          Inspect
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* 5 & 6. Side-by-side Dialectic Chat & Active Review Code Preview */}
        <section className="grid grid-cols-12 gap-5 items-stretch">
          {/* 5. Interactive Socratic Chat Preview */}
          <div className="col-span-6 flex flex-col justify-between bg-white rounded-[20px] p-6 shadow-[0_8px_30px_rgba(124,58,237,0.06)] border border-[#CCC3D8]/30">
            <div>
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#E9E7F3]">
                <h3 className="text-[15px] font-semibold text-[#1A1B23]">
                  Socratic Dialectic Session #4029
                </h3>
                <span className="px-2.5 py-0.5 rounded bg-[#18181B] text-white font-mono text-[10px] font-semibold">
                  Strict Guardrail
                </span>
              </div>

              <div className="space-y-3.5 max-h-[420px] overflow-y-auto pr-1">
                {chatMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${
                      msg.sender === 'mentee' ? 'items-start' : 'items-end'
                    }`}
                  >
                    <span className="font-mono text-[10px] uppercase tracking-wider text-[#5F5E61] mb-1">
                      {msg.label} · {msg.timestamp}
                    </span>
                    <div
                      className={`p-3.5 rounded-2xl max-w-[90%] text-[13px] leading-relaxed ${
                        msg.sender === 'mentee'
                          ? 'bg-[#F4F2FE] text-[#1A1B23] rounded-tl-sm'
                          : 'bg-[#EADDFF]/45 text-[#1A1B23] rounded-tr-sm border border-[#EADDFF]'
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <form onSubmit={handleChatSubmit} className="pt-4 mt-4 border-t border-[#E9E7F3]">
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Ask your Socratic AI mentor a guiding question..."
                  className="w-full pl-4 pr-14 py-3 rounded-2xl bg-[#F4F2FE] text-[#1A1B23] text-[13px] placeholder:text-[#5F5E61] focus:outline-none focus:bg-white border border-[#CCC3D8]/50 focus:border-[#7C3AED]"
                />
                <button
                  type="submit"
                  aria-label="Send Socratic message"
                  className="absolute right-2 p-2 rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#8B5CF6] text-white hover:opacity-95 transition-opacity shadow-sm"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
              <div className="flex items-center justify-between pt-2 px-1 text-[#5F5E61] font-mono text-[10px]">
                <span>Direct syntax code blocks deactivated</span>
                <span>IF101 Dialectic Sandbox</span>
              </div>
            </form>
          </div>

          {/* 6. Active Review Status Card & Redaction Code Preview */}
          <div className="col-span-6 flex flex-col gap-4">
            <div className="bg-white rounded-[20px] p-5 shadow-[0_8px_30px_rgba(124,58,237,0.06)] border border-[#CCC3D8]/30">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-[11px] font-semibold text-[#5D25C7] bg-[#E9DDFF] px-2 py-0.5 rounded">
                      Active Review
                    </span>
                    <span className="font-mono text-[13px] font-semibold text-[#1A1B23]">
                      {activePreset.fileName}
                    </span>
                  </div>
                  <p className="text-xs text-[#4A4455]">
                    Method{' '}
                    <code className="font-mono text-[#7C3AED] bg-[#EADDFF]/40 px-1.5 py-0.5 rounded">
                      {activePreset.methodName}
                    </code>
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleReleaseHint}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#18181B] text-white text-xs font-medium hover:bg-zinc-800 transition-colors shadow-sm whitespace-nowrap shrink-0"
                >
                  <Lightbulb className="w-4 h-4 text-[#D0BCFF]" />
                  <span>Release Hint</span>
                </button>
              </div>
              <div className="font-mono text-xs text-[#7C3AED] tabular-nums">
                Socratic Guardrail Active · {hintsReleasedCount} guiding hints provided
              </div>
            </div>

            <div className="flex-1 flex flex-col bg-[#18181B] rounded-[20px] p-5 text-[#F1EFFB] shadow-[0_12px_36px_rgba(24,24,27,0.18)]">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <Code2 className="w-4 h-4 text-[#E9DDFF]" />
                  <span className="font-mono text-xs font-semibold text-white">
                    Java Source Code Preview
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setPreviewBugIdx((prev) => (prev + 1) % SAMPLE_BUG_PRESETS.length)
                  }
                  className="inline-flex items-center gap-1 font-mono text-xs text-[#E9DDFF] hover:text-white transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Reload Sample Bug</span>
                </button>
              </div>

              <p className="font-mono text-[11px] text-[#C8C5CA] mb-3">
                IF101 Algorithms Fall 2026 Sandbox · Sanitized by Regex Redaction
              </p>

              <JavaCodeBlock
                code={redactPII(activePreset.rawCode, 'Mentee-A42').scrubbedCode}
                fileName={activePreset.fileName}
                faultLine={activePreset.faultLine}
                showCopy={false}
                compact
              />

              <div className="mt-4 bg-[#FFDAD6] text-[#93000A] p-3.5 rounded-xl flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <ShieldAlert className="w-5 h-5 text-[#BA1A1A] shrink-0" />
                  <div className="min-w-0">
                    <div className="font-mono text-[10px] font-bold tracking-wider uppercase text-[#BA1A1A]">
                      Integrity Guardrail Block
                    </div>
                    <div className="text-xs text-[#93000A]">
                      Direct solution snippet flagged on line {activePreset.faultLine}. Socratic
                      filter engaged.
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setFrameworkModal('guidelines')}
                  className="shrink-0 px-3 py-1.5 rounded-lg bg-white text-[#BA1A1A] text-xs font-semibold hover:bg-[#F4F2FE] transition-colors shadow-sm"
                >
                  Review Guidelines
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* 7. Pilot Kanban Board Overview */}
        <section className="w-full bg-white rounded-[20px] p-6 shadow-[0_8px_30px_rgba(124,58,237,0.06)] border border-[#CCC3D8]/30">
          <div className="flex items-center justify-between gap-4 mb-5">
            <div>
              <h2 className="text-[18px] font-semibold text-[#1A1B23]">
                Fall 2026 Pilot Cohort Board
              </h2>
              <p className="text-[13px] text-[#4A4455]">
                Click any session card to advance its dialectic stage across the 12 active lab
                tickets
              </p>
            </div>
            <span className="font-mono text-xs text-[#630ED4] font-semibold">
              {kanbanCards.length} Tracked Sessions
            </span>
          </div>

          <div className="grid grid-cols-3 gap-5">
            {kanbanColumns.map((col) => {
              const items = kanbanCards.filter((c) => c.column === col);
              return (
                <div key={col} className="flex flex-col gap-3 bg-[#F4F2FE] p-4 rounded-2xl">
                  <div className="flex items-center justify-between px-1">
                    <span className="text-[14px] font-semibold text-[#1A1B23]">{col}</span>
                    <span className="font-mono text-xs font-semibold text-[#4A4455] tabular-nums">
                      {items.length}
                    </span>
                  </div>
                  {items.map((card) => (
                    <button
                      key={card.id}
                      type="button"
                      onClick={() => onAdvanceKanban(card.id)}
                      className="text-left bg-white p-4 rounded-2xl shadow-sm hover:shadow-md transition-all flex flex-col gap-2 border border-transparent hover:border-[#7C3AED]/30"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[13px] font-semibold text-[#1A1B23]">
                          {card.studentId}
                        </span>
                        <span
                          className={`font-mono text-[10px] font-semibold ${
                            col === 'Verified Pass'
                              ? 'text-[#7C3AED]'
                              : col === 'Socratic Review'
                              ? 'text-[#18181B]'
                              : 'text-[#5F5E61]'
                          }`}
                        >
                          {card.tagRight}
                        </span>
                      </div>
                      <p className="text-[13px] text-[#4A4455]">{card.description}</p>
                      <div className="flex items-center justify-between pt-1">
                        <span className="font-mono text-[11px] text-[#5D25C7]">{card.category}</span>
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center font-mono text-[10px] font-bold text-white ${
                            card.avatarStyle === 'gradient'
                              ? 'bg-gradient-to-r from-[#7C3AED] to-[#8B5CF6]'
                              : card.avatarStyle === 'tertiary'
                              ? 'bg-[#5D25C7]'
                              : 'bg-[#5F5E61]'
                          }`}
                        >
                          {card.mentorInitials}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              );
            })}
          </div>
        </section>
      </div>

      {/* ==================== MOBILE VIEW (< lg) ==================== */}
      <div className="lg:hidden flex flex-col w-full space-y-5 pb-4">
        {/* Welcome Purple Gradient Card */}
        <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#630ED4] via-[#7C3AED] to-[#7645E0] text-white p-5 shadow-lg">
          <div className="relative z-10 flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <img
                src={ASSETS.menteeAvatar}
                alt="Mentee-A42 student portrait"
                referrerPolicy="no-referrer"
                className="w-12 h-12 rounded-full object-cover shadow-md ring-2 ring-white/30 bg-[#7C3AED]"
              />
              <div>
                <div className="text-[11px] font-medium text-[#EDE0FF]">
                  Fall 2026 Pilot · IF101
                </div>
                <h1 className="text-lg font-semibold text-white tracking-tight leading-snug">
                  Welcome back, Mentee-A42
                </h1>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('mentee-pipeline')}
              aria-label="Open Mentee Pipeline"
              className="w-11 h-11 rounded-full bg-white/15 hover:bg-white/25 transition-all flex items-center justify-center text-white"
            >
              <Terminal className="w-5 h-5" />
            </button>
          </div>

          {/* Socratic AI Assistant Floating Prompt Container */}
          <div className="relative z-10 bg-white text-[#1A1B23] rounded-xl p-4 shadow-lg">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-1">
                  <Sparkles className="w-4 h-4 text-[#630ED4]" />
                  <span className="text-[11px] text-[#630ED4] font-bold uppercase tracking-wider">
                    Agentic Socratic Mentoring
                  </span>
                </div>
                <p className="text-xs text-[#4A4455]">
                  Debug Java algorithms without giving away answers. Guided reasoning preserves
                  academic integrity.
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-[#E9DDFF] flex items-center justify-center shrink-0">
                <Bot className="w-5 h-5 text-[#5D25C7]" />
              </div>
            </div>

            <form
              onSubmit={handleMobileAskSubmit}
              className="flex items-center gap-2 bg-[#F4F2FE] rounded-full p-1.5 pl-3.5"
            >
              <input
                type="text"
                value={mobileAskInput}
                onChange={(e) => setMobileAskInput(e.target.value)}
                placeholder="Ask Socratic AI about your recursion tree..."
                className="flex-1 min-w-0 bg-transparent text-[#1A1B23] placeholder:text-[#7B7487] text-xs focus:outline-none"
              />
              <button
                type="submit"
                className="px-3.5 py-2 rounded-full bg-[#1B1B1E] text-white text-xs font-medium shrink-0"
              >
                Ask AI
              </button>
            </form>

            {mobileAiReply && (
              <div className="mt-3 p-3 rounded-xl bg-[#F4F2FE] text-xs text-[#1A1B23] border border-[#EADDFF]">
                <span className="font-semibold text-[#630ED4] block mb-0.5">
                  Socratic Guidance:
                </span>
                {mobileAiReply}
              </div>
            )}
          </div>
        </section>

        {/* Quick Action Launcher Cards */}
        <section className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => onNavigate('mentee-pipeline')}
            className="flex items-center justify-between p-3.5 rounded-xl bg-white shadow-sm text-left min-h-[56px]"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-[#EADDFF] text-[#630ED4] flex items-center justify-center shrink-0">
                <GitBranch className="w-5 h-5" />
              </div>
              <div className="truncate">
                <span className="text-sm font-semibold text-[#1A1B23] block leading-tight">
                  Mentee Queue
                </span>
                <span className="text-[11px] text-[#4A4455] tabular-nums">
                  {pendingCount} pending
                </span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-[#7B7487] shrink-0" />
          </button>

          <button
            type="button"
            onClick={() => setApplyModalOpen(true)}
            className="flex items-center justify-between p-3.5 rounded-xl bg-white shadow-sm text-left min-h-[56px]"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-[#E4E1E6] text-[#47464A] flex items-center justify-center shrink-0">
                <UserCheck className="w-5 h-5" />
              </div>
              <div className="truncate">
                <span className="text-sm font-semibold text-[#1A1B23] block leading-tight">
                  Mentor Gate
                </span>
                <span className="text-[11px] text-[#4A4455]">Earn IF101 Badge</span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-[#7B7487] shrink-0" />
          </button>
        </section>

        {/* Institutional Efficacy */}
        <section className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[15px] font-semibold text-[#1A1B23]">Institutional Efficacy</h2>
            <span className="text-[11px] text-[#630ED4] font-medium">Real-time Telemetry</span>
          </div>
          <div className="grid grid-cols-3 gap-2.5">
            <div className="flex flex-col p-3 rounded-xl bg-[#F4F2FE] text-center">
              <span className="text-lg text-[#630ED4] font-bold tabular-nums">99.4%</span>
              <span className="text-[11px] text-[#4A4455] mt-0.5">Guardrail Accuracy</span>
            </div>
            <div className="flex flex-col p-3 rounded-xl bg-[#F4F2FE] text-center">
              <span className="text-lg text-emerald-700 font-bold tabular-nums">0%</span>
              <span className="text-[11px] text-[#4A4455] mt-0.5">Code Leakage</span>
            </div>
            <div className="flex flex-col p-3 rounded-xl bg-[#F4F2FE] text-center">
              <span className="text-lg text-[#1A1B23] font-bold tabular-nums">142</span>
              <span className="text-[11px] text-[#4A4455] mt-0.5">Active Solvers</span>
            </div>
          </div>
        </section>

        {/* Live Socratic Prompting */}
        <section className="rounded-2xl bg-white p-4 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[15px] font-semibold text-[#1A1B23]">Live Socratic Prompting</span>
            <span className="text-[11px] font-mono text-[#630ED4] font-semibold">Java Stack</span>
          </div>
          <div className="space-y-2.5 bg-[#F4F2FE] p-3.5 rounded-xl">
            <div className="bg-white p-3 rounded-xl shadow-sm">
              <span className="text-[11px] text-[#4A4455] font-medium block mb-1">
                Mentee-A42 · Problem Statement
              </span>
              <p className="text-xs text-[#1A1B23]">
                &ldquo;My recursive fibonacci(n) runs out of memory for n=50. Should I just share my
                return line?&rdquo;
              </p>
            </div>
            <div className="bg-gradient-to-r from-[#630ED4]/10 to-white p-3 rounded-xl shadow-sm">
              <span className="text-[11px] font-semibold text-[#630ED4] block mb-1">
                Socratic Peer Agent · Zero-Code Leakage
              </span>
              <p className="text-xs text-[#1A1B23] mb-2">
                Let&apos;s trace your call tree! When calculating fib(5), how many times is fib(3)
                evaluated independently? What data structure could remember prior answers?
              </p>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() =>
                    setMobileAiReply(
                      'Overlapping subproblems repeat identical recursive calls; try drawing the call tree for fib(4).'
                    )
                  }
                  className="px-2.5 py-1 rounded-lg bg-white text-[#630ED4] text-[11px] font-medium shadow-sm"
                >
                  Overlapping Subproblems
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setMobileAiReply(
                      'A fixed-size int[] or HashMap keyed by n lets you check cached values before recursing.'
                    )
                  }
                  className="px-2.5 py-1 rounded-lg bg-white text-[#630ED4] text-[11px] font-medium shadow-sm"
                >
                  Memoization Map
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Active Algorithm Queue */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-[15px] font-semibold text-[#1A1B23]">
              Active Algorithm Queue ({mobileFilteredTickets.length})
            </h2>
            <button
              type="button"
              onClick={() => onNavigate('mentee-pipeline')}
              className="text-xs text-[#630ED4] font-semibold"
            >
              View Pipeline
            </button>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            {(
              [
                { id: 'All', label: 'All Queues' },
                { id: 'Recursion', label: 'Recursion' },
                { id: 'BinarySearch', label: 'Binary Search' },
                { id: 'Sorting', label: 'Sorting Arrays' },
              ] as Array<{ id: MobileQueueFilter; label: string }>
            ).map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setMobileQueueFilter(f.id)}
                className={`px-3.5 py-2 rounded-lg text-xs font-medium whitespace-nowrap shrink-0 transition-colors ${
                  mobileQueueFilter === f.id
                    ? 'bg-[#630ED4] text-white'
                    : 'bg-[#E9E7F3] text-[#4A4455]'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="space-y-2.5">
            {mobileFilteredTickets.map((ticket) => (
              <div
                key={ticket.id}
                className="p-3.5 rounded-xl bg-white shadow-sm flex items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-semibold text-[#1A1B23]">{ticket.studentId}</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono text-[11px] text-[#630ED4]">{ticket.status}</span>
                  </div>
                  <p className="text-xs text-[#4A4455] truncate mt-0.5">{ticket.title}</p>
                </div>
                <button
                  type="button"
                  onClick={() => onInspectTicket(ticket.id, 'mentor-workspace')}
                  className="min-h-[40px] px-3.5 py-1.5 rounded-lg bg-[#EEECF8] text-[#630ED4] text-xs font-semibold hover:bg-[#EADDFF] transition-colors shrink-0"
                >
                  {ticket.status === 'Pending'
                    ? 'Assist'
                    : ticket.status === 'Socratic'
                    ? 'Tune'
                    : 'Audit'}
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Academic Lab Showcase Image */}
        <section className="rounded-2xl overflow-hidden bg-white shadow-sm">
          <div className="relative h-40 w-full bg-[#18181B]">
            <img
              src={ASSETS.labShowcase}
              alt="University computer science lab collaboration around dual monitor code editors"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            <div className="absolute bottom-3 left-4 right-4 text-white">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#EADDFF]">
                Department of Computer Science
              </span>
            </div>
          </div>
          <div className="p-4">
            <p className="text-xs text-[#4A4455] leading-relaxed">
              PeerStack is integrated into CS101/IF101 recitation sessions. Mentors gain verified
              instructional hours while safeguarding student cognitive problem-solving workflows.
            </p>
          </div>
        </section>
      </div>

      {/* ==================== MODALS ==================== */}
      {syllabusOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-[#1A1B23]">IF101 Algorithms Fall 2026 Syllabus</h3>
              <button
                type="button"
                onClick={() => setSyllabusOpen(false)}
                className="p-1 text-[#5F5E61] hover:text-[#1A1B23]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-2.5 text-sm text-[#4A4455]">
              <div className="p-3 rounded-xl bg-[#F4F2FE]">
                <span className="font-semibold text-[#1A1B23] block">M1: Basic Syntax &amp; Types</span>
                <span className="text-xs">Java 21 memory model, primitives, reference semantics.</span>
              </div>
              <div className="p-3 rounded-xl bg-[#F4F2FE]">
                <span className="font-semibold text-[#1A1B23] block">M2: Control Flow &amp; Loop Invariants</span>
                <span className="text-xs">Binary search intervals, sliding windows, termination proofs.</span>
              </div>
              <div className="p-3 rounded-xl bg-[#F4F2FE]">
                <span className="font-semibold text-[#1A1B23] block">M3: Methods &amp; Divide-and-Conquer</span>
                <span className="text-xs">Stack frames, MergeSort, QuickSort partitioning.</span>
              </div>
              <div className="p-3 rounded-xl bg-[#EADDFF]/50 border border-[#7C3AED]/20">
                <span className="font-semibold text-[#630ED4] block">M4: Recursion &amp; Base Cases (Active)</span>
                <span className="text-xs">Well-founded induction, memoization, defensive preconditions.</span>
              </div>
            </div>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setSyllabusOpen(false)}
                className="px-4 py-2 rounded-xl bg-[#630ED4] text-white text-xs font-semibold"
              >
                Close Syllabus
              </button>
            </div>
          </div>
        </div>
      )}

      {applyModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-[#1A1B23]">Apply as IF101 Peer Mentor</h3>
              <button
                type="button"
                onClick={() => setApplyModalOpen(false)}
                className="p-1 text-[#5F5E61] hover:text-[#1A1B23]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {applicationSubmitted ? (
              <div className="p-4 rounded-xl bg-emerald-50 text-emerald-800 text-sm font-medium">
                Application logged! You now appear in the Admin Credential Verification queue.
              </div>
            ) : (
              <form onSubmit={handleApplySubmit} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-[#4A4455] mb-1">
                    Full Student Name
                  </label>
                  <input
                    type="text"
                    required
                    value={applicantName}
                    onChange={(e) => setApplicantName(e.target.value)}
                    placeholder="e.g. Jordan Alvarez"
                    className="w-full px-3 py-2 rounded-xl bg-[#F4F2FE] border border-[#CCC3D8]/50 text-sm focus:outline-none focus:border-[#7C3AED]"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#4A4455] mb-1">
                      Academic Standing
                    </label>
                    <select
                      value={applicantYear}
                      onChange={(e) => setApplicantYear(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-[#F4F2FE] border border-[#CCC3D8]/50 text-sm"
                    >
                      <option>CS Junior</option>
                      <option>CS Senior</option>
                      <option>CS Graduate TA</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#4A4455] mb-1">
                      IF101 Proficiency
                    </label>
                    <select
                      value={applicantGrade}
                      onChange={(e) => setApplicantGrade(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-[#F4F2FE] border border-[#CCC3D8]/50 text-sm"
                    >
                      <option>A+ Grade (IF101)</option>
                      <option>A Grade (IF101)</option>
                      <option>A- Grade (IF101)</option>
                    </select>
                  </div>
                </div>
                <p className="text-xs text-[#5F5E61]">
                  Verified mentors commit to Socratic non-leakage rules and a cap of 3 concurrent
                  sessions.
                </p>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setApplyModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-[#F4F2FE] text-xs font-semibold text-[#4A4455]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#8B5CF6] text-white text-xs font-semibold"
                  >
                    Submit Credentials
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {frameworkModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-[#1A1B23]">
                {frameworkModal === 'regex' && 'Regex PII Redaction Filter'}
                {frameworkModal === 'socratic' && 'Socratic Draft Synthesizer'}
                {frameworkModal === 'integrity' && 'Integrity Guardrail #2 Policy'}
                {frameworkModal === 'gate' && 'Capped Mentor Gate Schedule'}
                {frameworkModal === 'guidelines' && 'IF101 Socratic Review Guidelines'}
              </h3>
              <button
                type="button"
                onClick={() => setFrameworkModal(null)}
                className="p-1 text-[#5F5E61] hover:text-[#1A1B23]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 rounded-xl bg-[#F4F2FE] text-xs text-[#1A1B23] space-y-2 leading-relaxed">
              {frameworkModal === 'regex' && (
                <>
                  <p>
                    All Java source files pass through deterministic regex sanitization before AI
                    or peer mentor visibility:
                  </p>
                  <code className="block bg-[#0F172A] text-slate-200 p-3 rounded-lg font-mono">
                    Email · Student ID · NetID · /Users/* Paths -&gt; [REDACTED_IDENTITY]
                  </code>
                </>
              )}
              {frameworkModal === 'socratic' && (
                <p>
                  Generates tiered discovery questions (Hint 1: Primary trace check, Hint 2: Domain
                  invariant pointer) grounded in IF101 Java AST diagnostics.
                </p>
              )}
              {(frameworkModal === 'integrity' || frameworkModal === 'guidelines') && (
                <p>
                  Outbound mentor hints are continuously scanned for executable Java syntax such as{' '}
                  <code className="font-mono text-[#BA1A1A]">return ...;</code>,{' '}
                  <code className="font-mono text-[#BA1A1A]">if (...)</code>, or method bodies. Any
                  match halts transmission until rephrased as a guiding question.
                </p>
              )}
              {frameworkModal === 'gate' && (
                <p>
                  Each verified senior mentor is capped at 3 concurrent review sessions with a
                  3-minute target SLA window and automatic escalation after 6 turns.
                </p>
              )}
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setFrameworkModal(null);
                  onNavigate(frameworkModal === 'regex' ? 'mentee-pipeline' : 'mentor-workspace');
                }}
                className="px-4 py-2 rounded-xl bg-[#630ED4] text-white text-xs font-semibold"
              >
                Open Live Tool
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
