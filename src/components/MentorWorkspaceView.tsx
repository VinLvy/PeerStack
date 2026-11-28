import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowUpRight,
  Ban,
  BookOpen,
  Bot,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  FastForward,
  Flag,
  Lock,
  Quote,
  Send,
  Shield,
  ShieldCheck,
  Terminal,
  UserX,
  X,
  XCircle,
} from 'lucide-react';
import { Ticket } from '../types';
import { checkIntegrityGuardrail } from '../utils/socraticEngine';
import { JavaCodeBlock } from './JavaCodeBlock';

interface MentorWorkspaceViewProps {
  tickets: Ticket[];
  activeTicketId: string;
  onSelectTicket: (id: string) => void;
  onSaveDraft: (ticketId: string, hint1: string, hint2: string) => void;
  onApproveHints: (ticketId: string, hint1: string, hint2: string) => void;
  onFlagTicket: (ticketId: string) => void;
}

export const MentorWorkspaceView: React.FC<MentorWorkspaceViewProps> = ({
  tickets,
  activeTicketId,
  onSelectTicket,
  onSaveDraft,
  onApproveHints,
  onFlagTicket,
}) => {
  const activeTicket = tickets.find((t) => t.id === activeTicketId) || tickets[0];

  const [hint1, setHint1] = useState(activeTicket.hint1);
  const [hint2, setHint2] = useState(activeTicket.hint2);
  const [diffOpen, setDiffOpen] = useState(false);
  const [traceOpen, setTraceOpen] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(45);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);

  // Sync editors when switching ticket
  useEffect(() => {
    setHint1(activeTicket.hint1);
    setHint2(activeTicket.hint2);
    setElapsedSeconds(45);
  }, [activeTicket.id, activeTicket.hint1, activeTicket.hint2]);

  // SLA live timer
  useEffect(() => {
    const id = setInterval(() => {
      setElapsedSeconds((s) => s + 1);
    }, 1000);
    return () => clearInterval(id);
  }, [activeTicket.id]);

  const guardrail1 = useMemo(() => checkIntegrityGuardrail(hint1), [hint1]);
  const guardrail2 = useMemo(() => checkIntegrityGuardrail(hint2), [hint2]);
  const combinedGuardrailPassed = guardrail1.passed && guardrail2.passed;
  const combinedFlaggedTokens = [...guardrail1.flaggedTokens, ...guardrail2.flaggedTokens];
  const combinedLeakageRisk = Math.max(guardrail1.leakageRiskPercent, guardrail2.leakageRiskPercent);
  const combinedPurity = Math.min(guardrail1.purityIndex, guardrail2.purityIndex);

  const formattedTime = `${String(Math.floor(elapsedSeconds / 60)).padStart(2, '0')}:${String(
    elapsedSeconds % 60
  ).padStart(2, '0')}`;

  const handleSkip = () => {
    const idx = tickets.findIndex((t) => t.id === activeTicket.id);
    const next = tickets[(idx + 1) % tickets.length];
    onSelectTicket(next.id);
  };

  const handleFlag = () => {
    onFlagTicket(activeTicket.id);
    setToastMsg(`Ticket #${activeTicket.id} flagged for Course Supervisor Dr. Vance.`);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleDraft = () => {
    onSaveDraft(activeTicket.id, hint1, hint2);
    setToastMsg(`Draft saved for #${activeTicket.id}.`);
    setTimeout(() => setToastMsg(null), 2600);
  };

  const handleApprove = useCallback(() => {
    if (!combinedGuardrailPassed || isSending) return;
    setIsSending(true);
    setTimeout(() => {
      onApproveHints(activeTicket.id, hint1, hint2);
      setIsSending(false);
      setToastMsg(
        `Socratic Hints Delivered to ${activeTicket.studentId}. Ticket #${activeTicket.id} marked Socratic.`
      );
    }, 450);
  }, [combinedGuardrailPassed, isSending, onApproveHints, activeTicket.id, activeTicket.studentId, hint1, hint2]);

  // Cmd / Ctrl + Enter shortcut
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault();
        handleApprove();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handleApprove]);

  const wordCount = (s: string) => (s.trim() ? s.trim().split(/\s+/).length : 0);

  return (
    <>
      {/* ==================== DESKTOP VIEW (lg+) ==================== */}
      <div className="hidden lg:flex flex-col w-full space-y-5">
        {/* Top Workspace Utility & Diagnostics Ribbon */}
        <div className="w-full bg-white rounded-2xl shadow-[0_4px_20px_-2px_rgba(124,58,237,0.06)] border border-[#CCC3D8]/30 p-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex items-center gap-1.5 text-[#4A4455] font-mono text-xs whitespace-nowrap">
                <span>IF101 Algorithms</span>
                <span className="text-[#CCC3D8]">/</span>
                <span>Mentee Queue</span>
                <span className="text-[#CCC3D8]">/</span>
                <select
                  aria-label="Select active review ticket"
                  value={activeTicket.id}
                  onChange={(e) => onSelectTicket(e.target.value)}
                  className="font-semibold text-[#1A1B23] bg-[#F4F2FE] rounded-lg px-2 py-1 border border-[#CCC3D8]/40 focus:outline-none focus:border-[#7C3AED]"
                >
                  {tickets.map((t) => (
                    <option key={t.id} value={t.id}>
                      Ticket #{t.id} ({t.studentId})
                    </option>
                  ))}
                </select>
              </div>

              <div className="h-4 w-px bg-[#E9E7F3]" />

              <div className="flex items-center gap-2 font-mono text-xs text-[#4A4455] whitespace-nowrap">
                <span className="px-2 py-0.5 rounded bg-[#18181B] text-white font-semibold">
                  AI Draft Ready
                </span>
                <span aria-hidden="true">·</span>
                <span>Topic: {activeTicket.topic}</span>
                <span aria-hidden="true">·</span>
                <span className="inline-flex items-center gap-1">
                  <UserX className="w-3.5 h-3.5" />
                  {activeTicket.studentId} (Anonymous)
                </span>
              </div>
            </div>

            {/* Live Review Timer & Controls */}
            <div className="flex items-center gap-3 shrink-0">
              <div className="flex items-center gap-2 bg-[#F4F2FE] px-3 py-1.5 rounded-xl font-mono text-xs">
                <span className="text-[10px] uppercase tracking-wider text-[#5F5E61]">
                  Live Review SLA
                </span>
                <span
                  className={`text-sm font-semibold tabular-nums ${
                    elapsedSeconds > 180 ? 'text-[#BA1A1A]' : 'text-[#1A1B23]'
                  }`}
                >
                  {formattedTime}
                </span>
                <span className="text-[11px] text-[#5F5E61]">(Target &lt; 03:00)</span>
              </div>

              <button
                type="button"
                onClick={handleSkip}
                className="px-3 py-1.5 rounded-xl bg-[#F4F2FE] hover:bg-[#E9E7F3] text-[#4A4455] text-xs font-medium transition-colors flex items-center gap-1 whitespace-nowrap"
              >
                <FastForward className="w-3.5 h-3.5" />
                <span>Skip</span>
              </button>
              <button
                type="button"
                onClick={handleFlag}
                className="px-3 py-1.5 rounded-xl bg-[#FFDAD6] text-[#93000A] text-xs font-medium hover:opacity-90 transition-opacity flex items-center gap-1 whitespace-nowrap"
              >
                <Flag className="w-3.5 h-3.5" />
                <span>Flag for Instructor</span>
              </button>
            </div>
          </div>
        </div>

        {/* Main 2-Column Split Console */}
        <div className="grid grid-cols-12 gap-5 items-start">
          {/* LEFT COLUMN (6 Cols) */}
          <div className="col-span-6 flex flex-col gap-4">
            {/* Regex Redaction Active */}
            <div className="bg-white rounded-2xl shadow-sm border border-[#CCC3D8]/30 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-4 h-4 text-emerald-700" />
                  </div>
                  <div>
                    <p className="text-[14px] font-semibold text-[#1A1B23]">
                      Regex Redaction Active
                    </p>
                    <p className="text-xs text-[#4A4455]">
                      {activeTicket.redactionCount} PII instances scrubbed: student name, campus
                      email, local directory hash.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setDiffOpen((prev) => !prev)}
                  className="font-mono text-xs text-[#7C3AED] hover:underline flex items-center gap-0.5 font-medium shrink-0"
                >
                  <span>{diffOpen ? 'Hide Sanitized Diff' : 'View Sanitized Diff'}</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {diffOpen && (
                <div className="mt-3 bg-[#F4F2FE] rounded-xl p-3 font-mono text-xs space-y-1">
                  <div className="text-[10px] text-[#5F5E61] uppercase font-semibold mb-1">
                    Regex Pipeline Log (Audit Shield)
                  </div>
                  {activeTicket.redactionDiffs.map((d, i) => (
                    <div key={i} className="space-y-0.5">
                      <p className="text-[#BA1A1A]">{d.removed}</p>
                      <p className="text-emerald-700">{d.added}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Code Inspection Viewer */}
            <JavaCodeBlock
              code={activeTicket.scrubbedCode}
              fileName={activeTicket.fileName}
              faultLine={activeTicket.faultLine}
              faultBadge={activeTicket.faultSummary}
              footerLeft={`Target Symbol: ${activeTicket.methodName}`}
              footerRight={`Status: ${activeTicket.status}`}
            />

            {/* Execution Trace */}
            <div className="bg-white rounded-2xl shadow-sm border border-[#CCC3D8]/30 p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-[#BA1A1A]" />
                  <h3 className="text-[14px] font-semibold text-[#1A1B23]">
                    Execution Trace / JVM Crash
                  </h3>
                </div>
                <span className="px-2 py-0.5 rounded bg-[#FFDAD6] text-[#93000A] font-mono text-[10px] font-semibold uppercase">
                  Runtime Trap
                </span>
              </div>
              <div className="bg-[#0F172A] rounded-xl p-3 text-rose-300 font-mono text-xs space-y-1">
                {activeTicket.stackTrace.map((line, i) => (
                  <div key={i} className={i === 0 ? 'text-rose-400 font-semibold' : 'text-slate-300 pl-3'}>
                    {line}
                  </div>
                ))}
                <div className="text-amber-300/90 pt-1 text-[11px]">{activeTicket.testVector}</div>
              </div>
            </div>

            {/* Student Self-Diagnosis */}
            <div className="bg-white rounded-2xl shadow-sm border border-[#CCC3D8]/30 p-4">
              <h3 className="text-[14px] font-semibold text-[#1A1B23] mb-2">
                Student Stated Self-Diagnosis
              </h3>
              <div className="bg-[#F4F2FE] rounded-xl p-3.5 text-[#4A4455] text-[13px] relative">
                <Quote className="w-5 h-5 text-[#CCC3D8] absolute top-2.5 right-2.5" />
                <p className="pr-6 italic leading-relaxed">&ldquo;{activeTicket.studentHypothesis}&rdquo;</p>
              </div>
            </div>

            {/* Curricular Objective */}
            <div className="bg-[#F4F2FE] border border-[#E9E7F3] rounded-2xl p-4 flex items-start gap-3">
              <BookOpen className="w-5 h-5 text-[#7C3AED] shrink-0 mt-0.5" />
              <div>
                <span className="font-mono text-[10px] text-[#5F5E61] uppercase tracking-wider">
                  Curricular Objective
                </span>
                <p className="text-[14px] font-semibold text-[#1A1B23]">
                  {activeTicket.curricularObjective}
                </p>
                <p className="text-xs text-[#4A4455] mt-0.5">{activeTicket.curricularGoal}</p>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN (6 Cols) */}
          <div className="col-span-6 flex flex-col gap-4">
            {/* AI Triage Classification */}
            <div className="bg-white rounded-2xl shadow-sm border border-[#CCC3D8]/30 p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Bot className="w-5 h-5 text-[#7C3AED]" />
                  <h3 className="text-[15px] font-semibold text-[#1A1B23]">
                    Socratic Diagnostic Assistant
                  </h3>
                </div>
                <span className="px-2.5 py-0.5 rounded bg-[#18181B] text-white font-mono text-[11px] font-semibold">
                  Dialectic NLP: Verified
                </span>
              </div>
              <p className="text-[13px] text-[#4A4455]">{activeTicket.aiTriageDiagnosis}</p>

              <div className="grid grid-cols-2 gap-3 mt-3 bg-[#F4F2FE] rounded-xl p-3">
                <div>
                  <span className="font-mono text-[10px] text-[#5F5E61] uppercase block">
                    Code Leakage Risk
                  </span>
                  <span
                    className={`font-mono text-[15px] font-semibold tabular-nums ${
                      combinedGuardrailPassed ? 'text-amber-700' : 'text-[#BA1A1A]'
                    }`}
                  >
                    {combinedGuardrailPassed ? 'Moderate' : 'Critical'} ({combinedLeakageRisk}%)
                  </span>
                </div>
                <div>
                  <span className="font-mono text-[10px] text-[#5F5E61] uppercase block">
                    Socratic Purity Index
                  </span>
                  <span
                    className={`font-mono text-[15px] font-semibold tabular-nums ${
                      combinedGuardrailPassed ? 'text-[#7C3AED]' : 'text-[#BA1A1A]'
                    }`}
                  >
                    {combinedPurity.toFixed(1)}% Dialectic
                  </span>
                </div>
              </div>
            </div>

            {/* Hint 1 Editor */}
            <div className="bg-white rounded-2xl shadow-sm border border-[#CCC3D8]/30 p-4">
              <div className="flex items-center justify-between mb-1.5 gap-2">
                <label
                  htmlFor="hint-1-editor"
                  className="text-[14px] font-semibold text-[#1A1B23] flex items-center gap-2"
                >
                  <span className="w-5 h-5 rounded-full bg-gradient-to-br from-[#7C3AED] to-[#8B5CF6] text-white font-mono text-xs flex items-center justify-center">
                    1
                  </span>
                  <span>Hint 1: Discovery Question (Primary Prompt)</span>
                </label>
                <span
                  className={`px-2 py-0.5 rounded font-mono text-[11px] font-medium whitespace-nowrap ${
                    guardrail1.passed
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'bg-[#FFDAD6] text-[#93000A]'
                  }`}
                >
                  {guardrail1.passed ? '98% Alignment · Zero Leakage' : 'Code Syntax Flagged'}
                </span>
              </div>
              <p className="text-xs text-[#4A4455] mb-2">
                Guides mentee to deduce step progression without handing out executable code.
              </p>
              <textarea
                id="hint-1-editor"
                value={hint1}
                onChange={(e) => setHint1(e.target.value)}
                rows={3}
                className={`w-full bg-[#FBF8FF] border rounded-xl p-3 text-[13px] text-[#1A1B23] focus:outline-none focus:bg-white transition-colors leading-relaxed ${
                  guardrail1.passed
                    ? 'border-[#E9E7F3] focus:border-[#7C3AED]'
                    : 'border-[#BA1A1A] bg-rose-50/40'
                }`}
              />
              <div className="flex items-center justify-between mt-1.5 px-1 font-mono text-[11px] text-[#4A4455]">
                <span className="tabular-nums">Tokens: {wordCount(hint1)} words</span>
                <span
                  className={`flex items-center gap-1 ${
                    guardrail1.passed ? 'text-emerald-700' : 'text-[#BA1A1A]'
                  }`}
                >
                  {guardrail1.passed ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" /> Safe inquiry
                    </>
                  ) : (
                    <>
                      <Ban className="w-3.5 h-3.5" /> Blocked token detected
                    </>
                  )}
                </span>
              </div>
            </div>

            {/* Hint 2 Editor */}
            <div className="bg-white rounded-2xl shadow-sm border border-[#CCC3D8]/30 p-4">
              <div className="flex items-center justify-between mb-1.5 gap-2">
                <label
                  htmlFor="hint-2-editor"
                  className="text-[14px] font-semibold text-[#1A1B23] flex items-center gap-2"
                >
                  <span className="w-5 h-5 rounded-full bg-[#E9E7F3] text-[#1A1B23] font-mono text-xs flex items-center justify-center">
                    2
                  </span>
                  <span>Hint 2: Deeper Pointer (Tiered Fallback)</span>
                </label>
                <span className="font-mono text-[11px] text-[#4A4455] whitespace-nowrap">
                  Unlocks if stuck &gt; 5m
                </span>
              </div>
              <p className="text-xs text-[#4A4455] mb-2">
                Contextualizes mathematical domain bounds vs runtime preconditions.
              </p>
              <textarea
                id="hint-2-editor"
                value={hint2}
                onChange={(e) => setHint2(e.target.value)}
                rows={3}
                className={`w-full bg-[#FBF8FF] border rounded-xl p-3 text-[13px] text-[#1A1B23] focus:outline-none focus:bg-white transition-colors leading-relaxed ${
                  guardrail2.passed
                    ? 'border-[#E9E7F3] focus:border-[#7C3AED]'
                    : 'border-[#BA1A1A] bg-rose-50/40'
                }`}
              />
              <div className="flex items-center justify-between mt-1.5 px-1 font-mono text-[11px] text-[#4A4455]">
                <span className="tabular-nums">Tokens: {wordCount(hint2)} words</span>
                <span
                  className={`flex items-center gap-1 ${
                    guardrail2.passed ? 'text-[#7C3AED]' : 'text-[#BA1A1A]'
                  }`}
                >
                  {guardrail2.passed ? (
                    <>
                      <Lock className="w-3.5 h-3.5" /> Secondary gate active
                    </>
                  ) : (
                    <>
                      <Ban className="w-3.5 h-3.5" /> Code leakage intercepted
                    </>
                  )}
                </span>
              </div>
            </div>

            {/* Integrity Guardrail #2 Real-Time Scanner */}
            <div
              className={`rounded-2xl p-4 border ${
                combinedGuardrailPassed
                  ? 'bg-rose-50/70 border-rose-100 text-rose-900'
                  : 'bg-[#FFDAD6] border-[#BA1A1A]/40 text-[#93000A]'
              }`}
            >
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-[#BA1A1A] shrink-0 mt-0.5" />
                <div className="flex-1 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <h4 className="text-[14px] font-semibold">
                      Integrity Guardrail #2{' '}
                      {combinedGuardrailPassed ? 'Active' : 'BLOCKING TRANSMISSION'}
                    </h4>
                    <span className="px-2 py-0.5 rounded bg-rose-200 text-rose-900 font-mono text-[10px] font-bold uppercase">
                      Realtime Interceptor
                    </span>
                  </div>
                  <p className="text-xs leading-relaxed">
                    AI scanner parses mentor edits continuously. Direct executable code like{' '}
                    <code className="bg-rose-200/80 px-1 py-0.5 rounded font-mono">
                      if (n &lt;= 0) return 1;
                    </code>{' '}
                    is intercepted and disallows transmission.
                  </p>
                  <div className="bg-white/70 rounded-xl p-2.5 font-mono text-[11px] flex items-center justify-between gap-2">
                    {combinedGuardrailPassed ? (
                      <span>
                        Live Scan Clean · Try typing{' '}
                        <code className="text-[#BA1A1A] font-semibold">return 1;</code> above to
                        test live interception.
                      </span>
                    ) : (
                      <span className="text-[#BA1A1A] font-semibold">
                        INTERCEPTED: &ldquo;{combinedFlaggedTokens.join(', ')}&rdquo; — remove
                        executable Java syntax to send.
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Global Decision Footer */}
            <div className="bg-white rounded-2xl shadow-sm border border-[#CCC3D8]/30 p-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleFlag}
                  className="px-3.5 py-2 rounded-xl bg-[#FBF8FF] hover:bg-[#FFDAD6] text-[#BA1A1A] text-xs font-medium transition-colors flex items-center gap-1 whitespace-nowrap"
                >
                  <XCircle className="w-4 h-4" />
                  <span>Reject / Escalate</span>
                </button>
                <button
                  type="button"
                  onClick={handleDraft}
                  className="px-3.5 py-2 rounded-xl bg-[#F4F2FE] hover:bg-[#E9E7F3] text-[#1A1B23] text-xs font-medium transition-colors whitespace-nowrap"
                >
                  Save Draft
                </button>
              </div>

              <button
                type="button"
                onClick={handleApprove}
                disabled={!combinedGuardrailPassed || isSending}
                className={`px-5 py-2.5 rounded-xl text-white text-[13px] font-semibold transition-all flex items-center gap-2 whitespace-nowrap ${
                  combinedGuardrailPassed
                    ? 'bg-gradient-to-r from-[#7C3AED] to-[#8B5CF6] hover:opacity-95 shadow-md shadow-purple-500/25'
                    : 'bg-slate-400 cursor-not-allowed'
                }`}
              >
                <Send className="w-4 h-4" />
                <span>
                  {isSending ? 'Validating Dialectics...' : 'Approve & Send Hints to Mentee'}
                </span>
                <span className="px-1.5 py-0.5 rounded bg-white/20 font-mono text-[10px]">
                  Cmd+Enter
                </span>
              </button>
            </div>

            {toastMsg && (
              <div className="w-full bg-emerald-600 text-white rounded-xl p-3.5 shadow-lg flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-medium">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{toastMsg}</span>
                </div>
                <button type="button" onClick={() => setToastMsg(null)} aria-label="Dismiss">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ==================== MOBILE VIEW (< lg) ==================== */}
      <div className="lg:hidden flex flex-col w-full space-y-4 pb-4">
        <div className="bg-white rounded-xl p-4 shadow-sm space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 font-mono text-xs">
              <span className="font-bold text-[#1A1B23]">#{activeTicket.id}</span>
              <span aria-hidden="true">·</span>
              <span className="text-[#630ED4] font-semibold">{activeTicket.topic}</span>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#E9DDFF] text-[#23005C] font-mono text-xs font-semibold tabular-nums">
              <span>{formattedTime}</span>
              <span className="text-[10px] text-[#5516BE]">(&lt; 03:00)</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="text-[15px] font-semibold text-[#1A1B23]">{activeTicket.studentId}</div>
              <div className="text-xs text-[#4A4455]">Anonymous Student Submission</div>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleSkip}
                className="min-h-[40px] px-3 rounded-lg bg-[#EEECF8] text-[#4A4455] text-xs font-medium"
              >
                Skip
              </button>
              <button
                type="button"
                onClick={handleFlag}
                className="min-h-[40px] px-3 rounded-lg bg-[#FFDAD6] text-[#93000A] text-xs font-medium"
              >
                Escalate
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between bg-[#F4F2FE] px-3 py-2 rounded-lg text-xs">
            <span className="flex items-center gap-1.5 text-[#4A4455]">
              <ShieldCheck className="w-4 h-4 text-[#630ED4]" /> Privacy Shield Applied
            </span>
            <span className="font-mono font-semibold text-[#1A1B23]">
              {activeTicket.redactionCount} PII scrubbed
            </span>
          </div>
        </div>

        <JavaCodeBlock
          code={activeTicket.scrubbedCode}
          fileName={activeTicket.fileName}
          faultLine={activeTicket.faultLine}
          compact
        />

        {/* Execution Trace Collapsible */}
        <div className="bg-white rounded-xl overflow-hidden shadow-sm">
          <button
            type="button"
            onClick={() => setTraceOpen((p) => !p)}
            className="w-full px-4 py-3 flex items-center justify-between bg-[#FFDAD6]/45 text-[#93000A] text-left"
          >
            <span className="text-sm font-semibold flex items-center gap-2 truncate">
              <AlertTriangle className="w-4 h-4 text-[#BA1A1A] shrink-0" />
              JVM Crash: {activeTicket.stackTrace[0].slice(0, 32)}...
            </span>
            {traceOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          {traceOpen && (
            <div className="p-3 font-mono text-[11px] bg-[#F4F2FE] text-[#4A4455] space-y-1">
              {activeTicket.stackTrace.map((line, i) => (
                <div key={i} className={i === 0 ? 'text-[#BA1A1A] font-semibold' : ''}>
                  {line}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Socratic Diagnostic Model */}
        <div className="bg-white rounded-xl p-4 shadow-sm space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-[#1A1B23]">Socratic Diagnostic Model</span>
            <span className="font-mono text-xs text-[#5516BE] font-bold">Audited</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-[#F4F2FE] rounded-xl p-3">
              <span className="text-xs text-[#4A4455] block">Dialectic Purity</span>
              <span className="text-lg font-bold text-[#630ED4] tabular-nums">
                {combinedPurity.toFixed(1)}%
              </span>
            </div>
            <div className="bg-[#F4F2FE] rounded-xl p-3">
              <span className="text-xs text-[#4A4455] block">Leakage Risk</span>
              <span className="text-lg font-bold text-amber-600 tabular-nums">
                {combinedLeakageRisk}%
              </span>
            </div>
          </div>
        </div>

        {/* Mobile Hint 1 & 2 Editors */}
        <div className="bg-white rounded-xl p-4 shadow-sm space-y-3">
          <span className="text-sm font-semibold text-[#1A1B23] block">
            Hint 1 · Discovery Question
          </span>
          <textarea
            value={hint1}
            onChange={(e) => setHint1(e.target.value)}
            rows={3}
            className="w-full bg-[#F4F2FE] rounded-xl p-3 text-xs text-[#1A1B23] focus:outline-none focus:ring-2 focus:ring-[#630ED4]"
          />
          <span className="text-sm font-semibold text-[#1A1B23] block">
            Hint 2 · Deeper Pointer
          </span>
          <textarea
            value={hint2}
            onChange={(e) => setHint2(e.target.value)}
            rows={3}
            className="w-full bg-[#F4F2FE] rounded-xl p-3 text-xs text-[#1A1B23] focus:outline-none focus:ring-2 focus:ring-[#630ED4]"
          />
        </div>

        {!combinedGuardrailPassed && (
          <div className="bg-[#FFDAD6] text-[#93000A] rounded-xl p-3.5 text-xs">
            <strong>Integrity Guardrail #2 Triggered:</strong> Direct code syntax (
            <code className="font-mono">{combinedFlaggedTokens.join(', ')}</code>) intercepted.
          </div>
        )}

        <div className="bg-white rounded-2xl p-4 shadow-md space-y-2.5">
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={handleDraft}
              className="min-h-[44px] rounded-xl bg-[#E9E7F3] text-[#1A1B23] text-xs font-semibold"
            >
              Save Draft
            </button>
            <button
              type="button"
              onClick={handleFlag}
              className="min-h-[44px] rounded-xl bg-[#FFDAD6]/70 text-[#93000A] text-xs font-semibold"
            >
              Reject / Flag
            </button>
          </div>
          <button
            type="button"
            onClick={handleApprove}
            disabled={!combinedGuardrailPassed}
            className={`w-full min-h-[48px] rounded-xl text-white text-sm font-semibold flex items-center justify-center gap-2 ${
              combinedGuardrailPassed ? 'bg-[#630ED4]' : 'bg-slate-400'
            }`}
          >
            <Send className="w-4 h-4" />
            <span>Approve &amp; Send Hints to Mentee</span>
          </button>
          {toastMsg && (
            <div className="p-2.5 rounded-xl bg-emerald-600 text-white text-xs text-center font-medium">
              {toastMsg}
            </div>
          )}
        </div>
      </div>
    </>
  );
};
