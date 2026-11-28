import React, { useMemo, useState } from 'react';
import {
  CheckCircle2,
  Download,
  FileJson,
  LineChart,
  Lock,
  PieChart as PieChartIcon,
  Play,
  Search,
  Shield,
  Sliders,
  Verified,
  X,
} from 'lucide-react';
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { ASSETS } from '../data/initialData';
import {
  AuditLogEntry,
  CurriculumMilestone,
  GuardrailConfig,
  MentorCandidate,
  Ticket,
} from '../types';

interface AdminMetricsViewProps {
  tickets: Ticket[];
  milestones: CurriculumMilestone[];
  mentors: MentorCandidate[];
  config: GuardrailConfig;
  auditLogs: AuditLogEntry[];
  onVerifyMentor: (id: string) => void;
  onRejectMentor: (id: string) => void;
  onUpdateConfig: (next: GuardrailConfig) => void;
}

export const AdminMetricsView: React.FC<AdminMetricsViewProps> = ({
  tickets,
  milestones,
  mentors,
  config,
  auditLogs,
  onVerifyMentor,
  onRejectMentor,
  onUpdateConfig,
}) => {
  const [toast, setToast] = useState<string | null>(null);
  const [auditModalOpen, setAuditModalOpen] = useState(false);
  const [rulesModalOpen, setRulesModalOpen] = useState(false);
  const [draftConfig, setDraftConfig] = useState<GuardrailConfig>(config);
  const [mentorSearchQuery, setMentorSearchQuery] = useState('');
  const [mentorStatusFilter, setMentorStatusFilter] = useState<
    'All' | MentorCandidate['status']
  >('All');
  const [selectedMentorIds, setSelectedMentorIds] = useState<string[]>([]);

  const filteredMentors = useMemo(() => {
    const q = mentorSearchQuery.trim().toLowerCase();
    return mentors.filter((m) => {
      const matchesStatus =
        mentorStatusFilter === 'All' || m.status === mentorStatusFilter;
      if (!matchesStatus) return false;
      if (!q) return true;
      const haystack = [
        m.name,
        m.code,
        m.year,
        m.status,
        m.javaProficiency,
        m.socraticTraining,
      ]
        .join(' ')
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [mentors, mentorSearchQuery, mentorStatusFilter]);

  const allFilteredSelected =
    filteredMentors.length > 0 &&
    filteredMentors.every((m) => selectedMentorIds.includes(m.id));

  const toggleSelectMentor = (id: string) => {
    setSelectedMentorIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleSelectAllFiltered = () => {
    if (allFilteredSelected) {
      const filteredSet = new Set(filteredMentors.map((m) => m.id));
      setSelectedMentorIds((prev) => prev.filter((id) => !filteredSet.has(id)));
    } else {
      const merged = new Set([...selectedMentorIds, ...filteredMentors.map((m) => m.id)]);
      setSelectedMentorIds(Array.from(merged));
    }
  };

  const handleBulkMentorAction = (targetStatus: 'Verified' | 'Revoked') => {
    if (selectedMentorIds.length === 0) return;
    const count = selectedMentorIds.length;
    selectedMentorIds.forEach((id) => {
      if (targetStatus === 'Verified') {
        onVerifyMentor(id);
      } else {
        onRejectMentor(id);
      }
    });
    setSelectedMentorIds([]);
    showToast(`Bulk Action: Updated ${count} mentor candidate(s) to ${targetStatus}.`);
  };

  // Dynamic KPI computations tied to live ticket state
  const closedTickets = tickets.filter((t) => t.ticketClosed);
  const avgClarity =
    closedTickets.length > 0
      ? (
          (4.88 * 12 + closedTickets.reduce((acc, t) => acc + t.clarityRating, 0)) /
          (12 + closedTickets.length)
        ).toFixed(2)
      : '4.88';
  const unblockedRate = (94.2 + closedTickets.length * 0.2).toFixed(1);

  const resolutionChartData = useMemo(() => {
    const counts = {
      full: 0,
      partial: 0,
      stuck: 0,
    };
    for (const t of tickets) {
      counts[t.resolutionStatus] = (counts[t.resolutionStatus] || 0) + 1;
    }
    const total = tickets.length || 1;
    return [
      {
        key: 'full',
        name: 'Fully Unblocked',
        value: counts.full,
        percent: Math.round((counts.full / total) * 100),
        color: '#7C3AED',
      },
      {
        key: 'partial',
        name: 'Partially Unblocked',
        value: counts.partial,
        percent: Math.round((counts.partial / total) * 100),
        color: '#10B981',
      },
      {
        key: 'stuck',
        name: 'Still Stuck',
        value: counts.stuck,
        percent: Math.round((counts.stuck / total) * 100),
        color: '#BA1A1A',
      },
    ];
  }, [tickets]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2600);
  };

  const handleExportJson = () => {
    const payload = {
      cohort: 'IF101-Algorithms-Fall-2026',
      exportedAt: new Date().toISOString(),
      supervisor: 'Dr. Vance',
      kpis: {
        avgTurnTimeMinutes: 4.2,
        clarityRating: Number(avgClarity),
        unblockedRatePercent: Number(unblockedRate),
        guardrailBlockRatePercent: 3.1,
      },
      guardrailConfig: config,
      mentors: mentors.map((m) => ({ id: m.code, name: m.name, status: m.status })),
      auditLogs,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'if101-pilot-audit.json';
    a.click();
    URL.revokeObjectURL(url);
    showToast('Downloaded IF101 Pilot Audit JSON.');
  };

  const handleExportCsv = () => {
    const header = 'Milestone,Status,ActiveStudents,AvgSocraticTurns,GuardrailFlagPct\n';
    const rows = milestones
      .map((m) => `"${m.title}",${m.status},${m.activeStudents},${m.avgTurns},${m.guardrailFlagPct}%`)
      .join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'if101-fall2026-pilot-report.csv';
    a.click();
    URL.revokeObjectURL(url);
    showToast('Downloaded Fall 2026 Pilot CSV Report.');
  };

  const handleExportAuditCsv = () => {
    const escapeCsv = (val: string) => `"${String(val).replace(/"/g, '""')}"`;
    const header = 'ID,Timestamp,Actor,Action,Severity,Detail\n';
    const rows = auditLogs
      .map((log) =>
        [
          escapeCsv(log.id),
          escapeCsv(log.timestamp),
          escapeCsv(log.actor),
          escapeCsv(log.action),
          escapeCsv(log.severity),
          escapeCsv(log.detail),
        ].join(',')
      )
      .join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'if101-compliance-audit-logs.csv';
    a.click();
    URL.revokeObjectURL(url);
    showToast(`Downloaded Compliance Audit Logs CSV (${auditLogs.length} records).`);
  };

  const handleSaveRules = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateConfig(draftConfig);
    setRulesModalOpen(false);
    showToast('System Guardrail configuration updated.');
  };

  return (
    <>
      {/* ==================== DESKTOP VIEW (lg+) ==================== */}
      <div className="hidden lg:flex flex-col w-full space-y-6 pb-8">
        {/* Top Announcement Banner */}
        <div className="w-full bg-gradient-to-r from-[#F4F2FE] via-[#EDE9FE] to-[#F4F2FE] border border-[#DDD6FE]/70 rounded-[20px] p-4 shadow-[0_8px_30px_rgb(124,58,237,0.06)] flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <span className="font-mono text-xs text-[#7C3AED] font-semibold uppercase tracking-wider shrink-0">
              Active Pilot Mode
            </span>
            <span aria-hidden="true" className="text-[#5F5E61]">
              ·
            </span>
            <span className="text-[13px] text-[#1A1B23] truncate">
              IF101 Fall 2026 Semester Pilot Active — Simulating agentic Socratic guardrails across
              340 active students.
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleExportAuditCsv}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white border border-[#CCC3D8]/70 text-[#1A1B23] text-xs font-semibold hover:bg-[#F4F2FE] transition-colors shrink-0 shadow-2xs"
            >
              <Download className="w-3.5 h-3.5 text-[#7C3AED]" />
              <span>Export Audit Logs (CSV)</span>
            </button>
            <button
              type="button"
              onClick={handleExportJson}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-[#18181B] text-white text-xs font-medium hover:bg-[#27272A] transition-colors shrink-0"
            >
              <FileJson className="w-4 h-4 text-[#C4B5FD]" />
              <span>Export Audit JSON</span>
            </button>
          </div>
        </div>

        {/* Page Header & Supervisor Context Bar */}
        <div className="flex items-end justify-between gap-6 pb-2">
          <div className="space-y-1 max-w-3xl">
            <div className="flex items-center gap-3 font-mono text-xs">
              <span className="px-2.5 py-0.5 rounded bg-[#18181B] text-white font-semibold uppercase tracking-wider">
                Academic Lead Console
              </span>
              <span className="text-[#5F5E61]">ID: CSR-IF101-FALL26</span>
            </div>
            <h1 className="text-[24px] leading-[32px] font-semibold text-[#1A1B23] tracking-tight">
              Simulated Pilot Data &amp; Mentor Credentials
            </h1>
            <p className="text-[15px] text-[#4A4455]">
              Review algorithmic review time savings, milestone progression, and senior student
              mentor verification requests.
            </p>
            <div className="flex items-center gap-2 text-xs text-[#4A4455] pt-1">
              <img
                src={ASSETS.drVanceAvatar}
                alt="Dr. Vance"
                referrerPolicy="no-referrer"
                className="w-6 h-6 rounded-full object-cover bg-[#EADDFF]"
              />
              <span className="font-semibold text-[#1A1B23]">
                Welcome, Course Supervisor Dr. Vance
              </span>
              <span>(IF101 Algorithms Lead, CSE Dept)</span>
            </div>
          </div>

          <div className="flex items-center gap-4 shrink-0">
            <div className="px-4 py-2 rounded-[18px] bg-white border border-[#E3E1ED] shadow-sm flex items-center gap-3">
              <div>
                <span className="font-mono text-[10px] text-[#5F5E61] uppercase block">
                  Active Dialectic Load
                </span>
                <span className="font-mono text-[15px] font-semibold text-[#1A1B23] tabular-nums">
                  42 Sessions Concurrent
                </span>
              </div>
              <div className="w-8 h-8 rounded-full bg-[#F4F2FE] flex items-center justify-center">
                <LineChart className="w-4 h-4 text-[#7C3AED]" />
              </div>
            </div>

            <button
              type="button"
              onClick={handleExportCsv}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#8B5CF6] text-white text-[13px] font-medium shadow-[0_8px_20px_rgba(124,58,237,0.28)] hover:opacity-95 transition-all whitespace-nowrap"
            >
              <Download className="w-4 h-4" />
              <span>Export Pilot Report (CSV)</span>
            </button>
          </div>
        </div>

        {/* 4 KPI Stat Cards */}
        <div className="grid grid-cols-4 gap-5">
          <div className="p-5 rounded-[20px] bg-white shadow-[0_10px_30px_rgb(124,58,237,0.06)] relative overflow-hidden flex flex-col justify-between">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#7C3AED] to-[#8B5CF6]" />
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-[10px] text-[#5F5E61] uppercase">
                  Dialectic Turn Time
                </span>
                <span className="font-mono text-[11px] font-semibold text-emerald-700">
                  -77% savings
                </span>
              </div>
              <div className="text-[16px] font-semibold text-[#1A1B23] mb-1">
                Assisted vs Manual Review
              </div>
              <div className="flex items-baseline gap-2 font-mono text-[24px] font-semibold text-[#1A1B23] tabular-nums">
                <span>4.2m</span>
                <span className="text-xs text-[#5F5E61] font-normal">vs 18.5m manual</span>
              </div>
            </div>
            <div className="pt-3 mt-3 border-t border-[#E3E1ED] flex justify-between font-mono text-[11px] text-[#4A4455]">
              <span>vs manual TA queue</span>
              <span className="text-[#7C3AED] font-semibold">Target: &lt; 5.0m</span>
            </div>
          </div>

          <div className="p-5 rounded-[20px] bg-white shadow-[0_10px_30px_rgb(124,58,237,0.06)] relative overflow-hidden flex flex-col justify-between">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#7C3AED] to-[#8B5CF6]" />
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-[10px] text-[#5F5E61] uppercase">
                  Pedagogical Clarity
                </span>
                <span className="font-mono text-[11px] font-semibold text-emerald-700">
                  +0.35 pts
                </span>
              </div>
              <div className="text-[16px] font-semibold text-[#1A1B23] mb-1">Clarity Rating</div>
              <div className="flex items-baseline gap-2 font-mono text-[24px] font-semibold text-[#1A1B23] tabular-nums">
                <span>{avgClarity}</span>
                <span className="text-xs text-[#5F5E61] font-normal">/ 5.0 index</span>
              </div>
            </div>
            <div className="pt-3 mt-3 border-t border-[#E3E1ED] flex justify-between font-mono text-[11px] text-[#4A4455]">
              <span>Student feedback</span>
              <span className="text-[#7C3AED] font-semibold">Target: &gt; 4.5</span>
            </div>
          </div>

          <div className="p-5 rounded-[20px] bg-white shadow-[0_10px_30px_rgb(124,58,237,0.06)] relative overflow-hidden flex flex-col justify-between">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#7C3AED] to-[#8B5CF6]" />
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-[10px] text-[#5F5E61] uppercase">
                  Self-Sufficiency
                </span>
                <span className="font-mono text-[11px] font-semibold text-emerald-700">
                  +4.1% MoM
                </span>
              </div>
              <div className="text-[16px] font-semibold text-[#1A1B23] mb-1">Unblocked Rate</div>
              <div className="flex items-baseline gap-2 font-mono text-[24px] font-semibold text-[#1A1B23] tabular-nums">
                <span>{unblockedRate}%</span>
                <span className="text-xs text-[#5F5E61] font-normal">autonomous</span>
              </div>
            </div>
            <div className="pt-3 mt-3 border-t border-[#E3E1ED] flex justify-between font-mono text-[11px] text-[#4A4455]">
              <span>Resolved w/o leak</span>
              <span className="text-[#7C3AED] font-semibold">Target: &gt; 90%</span>
            </div>
          </div>

          <div className="p-5 rounded-[20px] bg-white shadow-[0_10px_30px_rgb(124,58,237,0.06)] relative overflow-hidden flex flex-col justify-between">
            <div className="absolute top-0 left-0 right-0 h-1 bg-[#BA1A1A]" />
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-[10px] text-[#5F5E61] uppercase">
                  Intervention Security
                </span>
                <span className="font-mono text-[11px] font-semibold text-emerald-700">
                  -0.8% leakage
                </span>
              </div>
              <div className="text-[16px] font-semibold text-[#1A1B23] mb-1">
                Guardrail Block Rate
              </div>
              <div className="flex items-baseline gap-2 font-mono text-[24px] font-semibold text-[#1A1B23] tabular-nums">
                <span>3.1%</span>
                <span className="text-xs text-[#5F5E61] font-normal">intercepted</span>
              </div>
            </div>
            <div className="pt-3 mt-3 border-t border-[#E3E1ED] flex justify-between font-mono text-[11px] text-[#4A4455]">
              <span>Regex &amp; NLP blocks</span>
              <span className="text-[#BA1A1A] font-semibold">Target: &lt; 5.0%</span>
            </div>
          </div>
        </div>

        {/* Curriculum Milestone Progression & Ticket Resolution Distribution Grid */}
        <div className="grid grid-cols-12 gap-6">
          {/* Curriculum Milestone Progression Table (8 Cols) */}
          <div className="col-span-8 bg-white rounded-[20px] p-6 shadow-[0_10px_30px_rgb(124,58,237,0.06)]">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#E3E1ED]">
              <div>
                <h2 className="text-[15px] font-semibold text-[#1A1B23]">
                  Curriculum Milestone Progression &amp; Guardrail Health
                </h2>
                <span className="text-xs text-[#4A4455]">
                  Real-time dialectic state transitions for IF101 algorithms core modules (M1–M4)
                </span>
              </div>
              <span className="font-mono text-xs text-emerald-700 font-semibold">Active Track</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#F4F2FE] text-[#5F5E61] font-mono text-[10px] uppercase tracking-wider">
                    <th className="py-2.5 px-4 rounded-l-xl">Milestone Stage</th>
                    <th className="py-2.5 px-4">Status</th>
                    <th className="py-2.5 px-4">Active Students</th>
                    <th className="py-2.5 px-4">Avg Socratic Turns</th>
                    <th className="py-2.5 px-4 rounded-r-xl">Guardrail Flag %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E3E1ED]/60 text-[13px]">
                  {milestones.map((m) => (
                    <tr
                      key={m.id}
                      className={
                        m.status === 'Active'
                          ? 'bg-[#F4F2FE]/80 font-medium'
                          : m.status === 'Upcoming'
                          ? 'opacity-65'
                          : 'hover:bg-[#F4F2FE]/40'
                      }
                    >
                      <td className="py-3.5 px-4">
                        <div className="flex flex-col">
                          <span
                            className={
                              m.status === 'Active' ? 'font-semibold text-[#7C3AED]' : 'font-medium'
                            }
                          >
                            {m.title}
                          </span>
                          <span className="font-mono text-[11px] text-[#5F5E61]">{m.subtitle}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex px-2.5 py-0.5 rounded-md font-mono text-xs font-medium ${
                            m.status === 'Completed'
                              ? 'bg-emerald-50 text-emerald-700'
                              : m.status === 'Active'
                              ? 'bg-gradient-to-r from-[#7C3AED] to-[#8B5CF6] text-white'
                              : 'bg-[#E4E1E6] text-[#1B1B1E]'
                          }`}
                        >
                          {m.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono tabular-nums">
                        {m.activeStudents}{' '}
                        <span className="text-[#5F5E61] font-sans text-xs">students</span>
                      </td>
                      <td className="py-3.5 px-4 font-mono tabular-nums">
                        {m.avgTurns.toFixed(1)}{' '}
                        <span className="text-[#5F5E61] font-sans text-xs">turns</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2 font-mono tabular-nums">
                          <span>{m.guardrailFlagPct.toFixed(1)}%</span>
                          <div className="w-16 h-1.5 rounded-full bg-[#EEECF8] overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                m.status === 'Active' ? 'bg-[#7C3AED]' : 'bg-emerald-500'
                              }`}
                              style={{ width: `${Math.min(100, m.guardrailFlagPct * 10)}%` }}
                            />
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Ticket Resolution Status Distribution PieChart Card (4 Cols) */}
          <div className="col-span-4 bg-white rounded-[20px] p-6 shadow-[0_10px_30px_rgb(124,58,237,0.06)] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#E3E1ED]">
                <div className="flex items-center gap-2">
                  <PieChartIcon className="w-5 h-5 text-[#7C3AED]" />
                  <div>
                    <h2 className="text-[15px] font-semibold text-[#1A1B23]">
                      Ticket Resolution Status
                    </h2>
                    <span className="text-[11px] text-[#4A4455]">
                      Live distribution across {tickets.length} tickets
                    </span>
                  </div>
                </div>
                <span className="font-mono text-[11px] font-semibold text-[#7C3AED] tabular-nums">
                  {tickets.length} Total
                </span>
              </div>

              <div className="h-52 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={resolutionChartData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={46}
                      outerRadius={74}
                      paddingAngle={3}
                      stroke="#FFFFFF"
                      strokeWidth={2}
                    >
                      {resolutionChartData.map((entry) => (
                        <Cell key={entry.key} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: unknown, name: unknown) => [
                        `${value} ticket(s)`,
                        String(name),
                      ]}
                      contentStyle={{
                        backgroundColor: '#18181B',
                        border: 'none',
                        borderRadius: '12px',
                        color: '#FFFFFF',
                        fontSize: '12px',
                        fontFamily: 'JetBrains Mono, monospace',
                      }}
                      itemStyle={{ color: '#FFFFFF' }}
                    />
                    <Legend
                      verticalAlign="bottom"
                      height={28}
                      iconType="circle"
                      wrapperStyle={{ fontSize: '11px', fontFamily: 'JetBrains Mono, monospace' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="space-y-2 pt-3 border-t border-[#E3E1ED]">
              {resolutionChartData.map((item) => (
                <div
                  key={item.key}
                  className="flex items-center justify-between text-xs px-2.5 py-1.5 rounded-xl bg-[#F4F2FE]"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="font-medium text-[#1A1B23]">{item.name}</span>
                  </div>
                  <span className="font-mono text-[11px] font-semibold text-[#4A4455] tabular-nums">
                    {item.value} ({item.percent}%)
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Grid: Mentor Credential Verification & System Configuration */}
        <div className="grid grid-cols-12 gap-6">
          {/* Mentor Credentials Table (8 Cols) */}
          <div className="col-span-8 bg-white rounded-[20px] p-6 shadow-[0_10px_30px_rgb(124,58,237,0.06)] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#E3E1ED]">
                <div>
                  <h2 className="text-[15px] font-semibold text-[#1A1B23]">
                    Senior Student Mentor Credential Verification
                  </h2>
                  <p className="text-xs text-[#4A4455]">
                    Approve or flag senior peer mentors for IF101 Socratic review permissions.
                  </p>
                </div>
                <span className="font-mono text-xs text-[#5F5E61] tabular-nums">
                  {filteredMentors.length} of {mentors.length} Candidates
                </span>
              </div>

              {/* Mentor Search Bar & Status Filters */}
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <div className="relative flex-1 min-w-[240px]">
                  <Search className="w-4 h-4 text-[#5F5E61] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="search"
                    value={mentorSearchQuery}
                    onChange={(e) => setMentorSearchQuery(e.target.value)}
                    placeholder="Search candidates by name, status (Verified, Pending), or training date (Nov 20)..."
                    aria-label="Filter mentor candidates by name, status, or date"
                    className="w-full pl-9 pr-8 py-2 rounded-xl bg-[#F4F2FE] text-[13px] text-[#1A1B23] placeholder:text-[#5F5E61] border border-transparent focus:outline-none focus:border-[#7C3AED] focus:bg-white transition-colors"
                  />
                  {mentorSearchQuery && (
                    <button
                      type="button"
                      onClick={() => setMentorSearchQuery('')}
                      aria-label="Clear mentor search"
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#5F5E61] hover:text-[#1A1B23]"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-1.5 flex-wrap">
                  {(
                    ['All', 'Pending Review', 'Verified', 'Flagged', 'Revoked'] as const
                  ).map((status) => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => setMentorStatusFilter(status)}
                      className={`px-2.5 py-1 rounded-lg font-mono text-[11px] font-medium transition-colors ${
                        mentorStatusFilter === status
                          ? 'bg-[#7C3AED] text-white'
                          : 'bg-[#F4F2FE] text-[#4A4455] hover:text-[#1A1B23]'
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>

              {/* Bulk Action Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-3 mb-3 px-3.5 py-2.5 rounded-xl bg-[#F4F2FE] border border-[#CCC3D8]/50">
                <div className="flex items-center gap-2.5">
                  <input
                    type="checkbox"
                    checked={allFilteredSelected}
                    onChange={toggleSelectAllFiltered}
                    aria-label="Select all visible mentor candidates"
                    className="w-4 h-4 rounded accent-[#7C3AED] cursor-pointer"
                  />
                  <span className="font-mono text-xs font-semibold text-[#1A1B23] tabular-nums">
                    {selectedMentorIds.length > 0
                      ? `${selectedMentorIds.length} candidate(s) selected for Bulk Action`
                      : 'Bulk Action: Select candidates below to batch verify or revoke'}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={selectedMentorIds.length === 0}
                    onClick={() => handleBulkMentorAction('Verified')}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 disabled:pointer-events-none text-white text-xs font-semibold transition-all whitespace-nowrap"
                  >
                    Bulk Verify ({selectedMentorIds.length})
                  </button>
                  <button
                    type="button"
                    disabled={selectedMentorIds.length === 0}
                    onClick={() => handleBulkMentorAction('Revoked')}
                    className="px-3 py-1.5 rounded-lg bg-[#FFDAD6] hover:bg-rose-200 disabled:opacity-40 disabled:pointer-events-none text-[#BA1A1A] text-xs font-semibold transition-all whitespace-nowrap"
                  >
                    Bulk Revoke ({selectedMentorIds.length})
                  </button>
                  {selectedMentorIds.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setSelectedMentorIds([])}
                      className="px-2.5 py-1.5 rounded-lg bg-white text-[#4A4455] hover:text-[#1A1B23] text-xs font-medium border border-[#CCC3D8]/60"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#F4F2FE] text-[#5F5E61] font-mono text-[10px] uppercase tracking-wider">
                      <th className="py-2.5 pl-3 pr-1 rounded-l-xl w-9">
                        <input
                          type="checkbox"
                          checked={allFilteredSelected}
                          onChange={toggleSelectAllFiltered}
                          aria-label="Toggle select all mentor rows"
                          className="w-4 h-4 rounded accent-[#7C3AED] cursor-pointer align-middle"
                        />
                      </th>
                      <th className="py-2.5 px-3">Mentor Name</th>
                      <th className="py-2.5 px-3">Credential Status</th>
                      <th className="py-2.5 px-3">Java Proficiency</th>
                      <th className="py-2.5 px-3">Socratic Training</th>
                      <th className="py-2.5 px-3 rounded-r-xl text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E3E1ED]/60 text-[13px]">
                    {filteredMentors.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-6 text-center text-xs text-[#5F5E61]">
                          No mentor candidates match &ldquo;{mentorSearchQuery || mentorStatusFilter}&rdquo;. Try searching by mentor name, credential status, or training date.
                        </td>
                      </tr>
                    ) : (
                      filteredMentors.map((m) => {
                        const isSelected = selectedMentorIds.includes(m.id);
                        return (
                          <tr
                            key={m.id}
                            className={
                              isSelected
                                ? 'bg-[#EDE9FE]/60'
                                : m.status === 'Pending Review'
                                ? 'bg-amber-50/40'
                                : m.status === 'Flagged'
                                ? 'bg-rose-50/40'
                                : m.status === 'Revoked'
                                ? 'opacity-65'
                                : 'hover:bg-[#F4F2FE]/40'
                            }
                          >
                            <td className="py-3 pl-3 pr-1">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => toggleSelectMentor(m.id)}
                                aria-label={`Select ${m.name}`}
                                className="w-4 h-4 rounded accent-[#7C3AED] cursor-pointer align-middle"
                              />
                            </td>
                            <td className="py-3 px-3">
                              <div className="flex items-center gap-2.5">
                                {m.avatarUrl ? (
                                  <img
                                    src={m.avatarUrl}
                                    alt={m.name}
                                    referrerPolicy="no-referrer"
                                    className="w-8 h-8 rounded-full object-cover shrink-0 bg-[#EADDFF]"
                                  />
                                ) : (
                                  <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center font-mono text-xs text-rose-800 font-semibold shrink-0">
                                    {m.initials}
                                  </div>
                                )}
                                <div>
                                  <span className="font-medium text-[#1A1B23] block">{m.name}</span>
                                  <span className="font-mono text-[11px] text-[#5F5E61]">
                                    {m.code} · {m.year}
                                  </span>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-3">
                              <span
                                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-mono text-xs font-medium ${
                                  m.status === 'Verified'
                                    ? 'bg-emerald-50 text-emerald-700'
                                    : m.status === 'Pending Review'
                                    ? 'bg-amber-100 text-amber-900'
                                    : m.status === 'Flagged'
                                    ? 'bg-rose-100 text-rose-800'
                                    : 'bg-[#E4E1E6] text-[#1B1B1E]'
                                }`}
                              >
                                {m.status === 'Verified' && <CheckCircle2 className="w-3.5 h-3.5" />}
                                {m.status}
                              </span>
                            </td>
                            <td className="py-3 px-3 font-mono text-xs font-semibold text-[#1A1B23]">
                              {m.javaProficiency}
                            </td>
                            <td className="py-3 px-3 text-xs text-[#4A4455]">{m.socraticTraining}</td>
                            <td className="py-3 px-3 text-right">
                              {m.status === 'Verified' ? (
                                <span className="inline-flex items-center gap-1 font-mono text-xs text-[#5F5E61]">
                                  <Verified className="w-3.5 h-3.5 text-emerald-600" /> Verified
                                </span>
                              ) : m.status === 'Revoked' ? (
                                <span className="font-mono text-xs text-[#BA1A1A]">Access Denied</span>
                              ) : (
                                <div className="inline-flex items-center gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      onVerifyMentor(m.id);
                                      showToast(`Mentor ${m.code} granted active Socratic permissions.`);
                                    }}
                                    className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium whitespace-nowrap"
                                  >
                                    Verify Badge
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      onRejectMentor(m.id);
                                      showToast(`Mentor ${m.code} access revoked from cohort.`);
                                    }}
                                    className="px-3 py-1 rounded-lg bg-[#FFDAD6] hover:bg-rose-200 text-[#BA1A1A] text-xs font-medium whitespace-nowrap"
                                  >
                                    Reject
                                  </button>
                                </div>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-[#E3E1ED] flex flex-wrap items-center justify-between gap-3 font-mono text-xs text-[#5F5E61]">
              <span>FERPA &amp; Academic Integrity Sign-off: Required before badge release</span>
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={handleExportAuditCsv}
                  className="inline-flex items-center gap-1 text-[#1A1B23] hover:text-[#7C3AED] font-semibold transition-colors"
                >
                  <Download className="w-3.5 h-3.5 text-[#7C3AED]" />
                  <span>Download Audit CSV</span>
                </button>
                <button
                  type="button"
                  onClick={() => setAuditModalOpen(true)}
                  className="text-[#7C3AED] hover:underline font-medium"
                >
                  View Verification Audit Log -&gt;
                </button>
              </div>
            </div>
          </div>

          {/* System Configuration Card (4 Cols) */}
          <div className="col-span-4 bg-white rounded-[20px] p-6 shadow-[0_10px_30px_rgb(124,58,237,0.06)] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#E3E1ED]">
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-[#7C3AED]" />
                  <h2 className="text-[15px] font-semibold text-[#1A1B23]">System Configuration</h2>
                </div>
                <span className="font-mono text-[11px] font-semibold text-[#1A1B23]">
                  IF101 Policy
                </span>
              </div>

              <p className="text-xs text-[#4A4455] mb-4">
                Zero-trust dialectic filter intercepting literal syntax injections and canonical
                solution dumps.
              </p>

              <div className="space-y-3">
                <div className="p-3 rounded-xl bg-[#F4F2FE] space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-semibold text-[#1A1B23]">
                      Regex Solution Redaction
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        onUpdateConfig({
                          ...config,
                          regexRedactionEnabled: !config.regexRedactionEnabled,
                        })
                      }
                      className={`px-2 py-0.5 rounded font-mono text-[10px] font-semibold ${
                        config.regexRedactionEnabled
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {config.regexRedactionEnabled ? 'ACTIVE' : 'PAUSED'}
                    </button>
                  </div>
                  <p className="text-xs text-[#4A4455]">
                    Filters full Java method bodies and direct syntactic code copy.
                  </p>
                  <span className="font-mono text-[11px] text-[#7C3AED] block">
                    {config.regexPattern}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-[#F4F2FE] space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-semibold text-[#1A1B23]">
                      Max Concurrent Dialectics
                    </span>
                    <span className="font-mono text-xs font-semibold text-[#7C3AED] tabular-nums">
                      {config.maxConcurrentSessions} / Mentor
                    </span>
                  </div>
                  <p className="text-xs text-[#4A4455]">
                    Restricts active student dialogue sessions per verified senior mentor.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-[#F4F2FE] space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-semibold text-[#1A1B23]">
                      Auto-Escalation Threshold
                    </span>
                    <span className="font-mono text-xs font-semibold text-[#5F5E61] tabular-nums">
                      &gt; {config.autoEscalationTurns} Turns
                    </span>
                  </div>
                  <p className="text-xs text-[#4A4455]">
                    Sessions exceeding threshold without milestone advancement flag course staff.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-[#E3E1ED] flex items-center justify-between">
              <span className="font-mono text-xs text-[#5F5E61]">Policy Revision: 2026-F.09</span>
              <button
                type="button"
                onClick={() => {
                  setDraftConfig(config);
                  setRulesModalOpen(true);
                }}
                className="text-[#7C3AED] text-xs font-semibold hover:underline"
              >
                Edit Rules -&gt;
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ==================== MOBILE VIEW (< lg) ==================== */}
      <div className="lg:hidden flex flex-col w-full space-y-4 pb-4">
        <div className="bg-[#630ED4] text-white rounded-xl p-3 flex items-center justify-between">
          <div className="min-w-0">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#E9DDFF] block">
              Active Pilot Mode
            </span>
            <span className="text-xs text-[#EDE0FF] truncate block">
              IF101 Fall 2026 Semester Pilot (340 active students)
            </span>
          </div>
          <Verified className="w-5 h-5 text-[#E9DDFF] shrink-0" />
        </div>

        {/* Dr. Vance Card */}
        <div className="bg-white rounded-2xl p-4 shadow-sm space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-3 min-w-0">
              <img
                src={ASSETS.drVanceAvatar}
                alt="Dr. Vance"
                referrerPolicy="no-referrer"
                className="w-12 h-12 rounded-full object-cover ring-2 ring-[#630ED4]/20 shrink-0"
              />
              <div className="min-w-0">
                <h2 className="text-base font-bold text-[#1A1B23] truncate">Dr. Vance</h2>
                <span className="text-xs text-[#4A4455] truncate block">
                  Course Supervisor · IF101 Algorithms
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={handleExportCsv}
              className="min-h-[40px] px-3.5 py-2 rounded-xl bg-[#1A1B23] text-white text-xs font-semibold flex items-center gap-1.5 shrink-0"
            >
              <Download className="w-4 h-4" /> Export
            </button>
          </div>

          <div className="bg-[#E9E7F3] rounded-xl p-3 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-[#1A1B23] block">
                Dialectic Pipeline Load
              </span>
              <span className="text-[11px] text-[#4A4455]">Real-time Socratic threads</span>
            </div>
            <span className="text-lg font-bold text-[#630ED4] tabular-nums">42 concurrent</span>
          </div>
        </div>

        {/* 2x2 KPI Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-2xl p-3.5 shadow-sm">
            <span className="text-xs text-[#4A4455] block">Review Speed</span>
            <div className="text-xl font-bold text-[#1A1B23] tabular-nums mt-1">
              4.2m <span className="text-xs text-[#5F5E61] line-through font-normal">18.5m</span>
            </div>
            <span className="text-[11px] font-semibold text-[#630ED4]">-77% time</span>
          </div>
          <div className="bg-white rounded-2xl p-3.5 shadow-sm">
            <span className="text-xs text-[#4A4455] block">Clarity Rating</span>
            <div className="text-xl font-bold text-[#1A1B23] tabular-nums mt-1">
              {avgClarity} <span className="text-xs text-[#4A4455] font-normal">/ 5.0</span>
            </div>
            <span className="text-[11px] font-semibold text-[#630ED4]">+0.35 pts</span>
          </div>
          <div className="bg-white rounded-2xl p-3.5 shadow-sm">
            <span className="text-xs text-[#4A4455] block">Unblocked</span>
            <div className="text-xl font-bold text-[#1A1B23] tabular-nums mt-1">
              {unblockedRate}%
            </div>
            <span className="text-[11px] font-semibold text-[#630ED4]">+4.1% MoM</span>
          </div>
          <div className="bg-white rounded-2xl p-3.5 shadow-sm">
            <span className="text-xs text-[#4A4455] block">Guardrail Filter</span>
            <div className="text-xl font-bold text-[#1A1B23] tabular-nums mt-1">3.1%</div>
            <span className="text-[11px] font-semibold text-[#4A4455]">-0.8% leak</span>
          </div>
        </div>

        {/* Mobile Ticket Resolution Status Pie Chart */}
        <div className="bg-white rounded-2xl p-4 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-[15px] font-bold text-[#1A1B23]">Ticket Resolution Status</h3>
            <span className="text-xs font-mono text-[#4A4455] tabular-nums">
              {tickets.length} Tickets
            </span>
          </div>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={resolutionChartData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={66}
                  paddingAngle={3}
                  stroke="#FFFFFF"
                  strokeWidth={2}
                >
                  {resolutionChartData.map((entry) => (
                    <Cell key={entry.key} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: unknown, name: unknown) => [
                    `${value} ticket(s)`,
                    String(name),
                  ]}
                  contentStyle={{
                    backgroundColor: '#18181B',
                    border: 'none',
                    borderRadius: '10px',
                    color: '#FFFFFF',
                    fontSize: '11px',
                  }}
                  itemStyle={{ color: '#FFFFFF' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {resolutionChartData.map((item) => (
              <div key={item.key} className="p-2 rounded-xl bg-[#F4F2FE] text-center">
                <div className="flex items-center justify-center gap-1 mb-0.5">
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="font-mono text-xs font-bold text-[#1A1B23] tabular-nums">
                    {item.value}
                  </span>
                </div>
                <span className="text-[10px] text-[#4A4455] block truncate">{item.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Curriculum Milestones */}
        <div className="bg-white rounded-2xl p-4 shadow-sm space-y-2.5">
          <div className="flex items-center justify-between">
            <h3 className="text-[15px] font-bold text-[#1A1B23]">Curriculum Milestones</h3>
            <span className="text-xs text-[#4A4455]">Fall 2026</span>
          </div>
          {milestones.map((m) => (
            <div
              key={m.id}
              className={`flex items-center justify-between p-2.5 rounded-xl ${
                m.status === 'Active' ? 'bg-[#EADDFF]/35' : 'bg-[#F4F2FE]'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                    m.status === 'Completed'
                      ? 'bg-[#630ED4] text-white'
                      : m.status === 'Active'
                      ? 'bg-[#7C3AED] text-white'
                      : 'bg-[#E9E7F3] text-[#5F5E61]'
                  }`}
                >
                  {m.status === 'Completed' ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : m.status === 'Active' ? (
                    <Play className="w-3.5 h-3.5" />
                  ) : (
                    <Lock className="w-3.5 h-3.5" />
                  )}
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-semibold text-[#1A1B23] block truncate">
                    {m.title}
                  </span>
                  <span className="text-[11px] text-[#4A4455] tabular-nums">
                    {m.activeStudents} students
                  </span>
                </div>
              </div>
              <span className="font-mono text-[11px] font-medium text-[#4A4455] tabular-nums shrink-0">
                {m.guardrailFlagPct.toFixed(1)}% flag
              </span>
            </div>
          ))}
        </div>

        {/* Mobile Mentor Credentials */}
        <div className="bg-white rounded-2xl p-4 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-[15px] font-bold text-[#1A1B23]">Mentor Credentials</h3>
            <span className="text-xs font-mono text-[#4A4455]">
              {filteredMentors.length} of {mentors.length} Candidates
            </span>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 text-[#5F5E61] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="search"
              value={mentorSearchQuery}
              onChange={(e) => setMentorSearchQuery(e.target.value)}
              placeholder="Search candidates by name, status, or date..."
              aria-label="Search mentor candidates on mobile"
              className="w-full pl-9 pr-8 py-2 rounded-xl bg-[#F4F2FE] text-xs text-[#1A1B23] placeholder:text-[#5F5E61] focus:outline-none focus:ring-2 focus:ring-[#630ED4]"
            />
            {mentorSearchQuery && (
              <button
                type="button"
                onClick={() => setMentorSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#5F5E61]"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Mobile Bulk Action Bar */}
          <div className="p-2.5 rounded-xl bg-[#F4F2FE] flex flex-wrap items-center justify-between gap-2">
            <label className="flex items-center gap-2 text-xs font-semibold text-[#1A1B23] cursor-pointer">
              <input
                type="checkbox"
                checked={allFilteredSelected}
                onChange={toggleSelectAllFiltered}
                className="w-4 h-4 rounded accent-[#630ED4]"
              />
              <span>
                {selectedMentorIds.length > 0
                  ? `${selectedMentorIds.length} Selected`
                  : 'Select All'}
              </span>
            </label>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={selectedMentorIds.length === 0}
                onClick={() => handleBulkMentorAction('Verified')}
                className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white text-[11px] font-semibold disabled:opacity-40"
              >
                Bulk Verify
              </button>
              <button
                type="button"
                disabled={selectedMentorIds.length === 0}
                onClick={() => handleBulkMentorAction('Revoked')}
                className="px-2.5 py-1 rounded-lg bg-[#FFDAD6] text-[#BA1A1A] text-[11px] font-semibold disabled:opacity-40"
              >
                Bulk Revoke
              </button>
            </div>
          </div>

          {filteredMentors.length === 0 ? (
            <p className="text-xs text-[#5F5E61] text-center py-4">
              No mentor candidates match &ldquo;{mentorSearchQuery || mentorStatusFilter}&rdquo;.
            </p>
          ) : (
            filteredMentors.map((m) => {
              const isSelected = selectedMentorIds.includes(m.id);
              return (
                <div
                  key={m.id}
                  className={`p-3 rounded-xl space-y-2.5 ${
                    isSelected ? 'bg-[#EDE9FE] ring-1 ring-[#630ED4]/40' : 'bg-[#F4F2FE]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelectMentor(m.id)}
                        aria-label={`Select ${m.name} on mobile`}
                        className="w-4 h-4 rounded accent-[#630ED4] shrink-0"
                      />
                      {m.avatarUrl ? (
                        <img
                          src={m.avatarUrl}
                          alt={m.name}
                          referrerPolicy="no-referrer"
                          className="w-10 h-10 rounded-full object-cover shrink-0"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-[#E3E1ED] flex items-center justify-center font-bold text-xs text-[#4A4455] shrink-0">
                          {m.initials}
                        </div>
                      )}
                      <div className="min-w-0">
                        <span className="text-sm font-bold text-[#1A1B23] block truncate">
                          {m.name}
                        </span>
                        <span className="text-xs text-[#4A4455] block">
                          {m.year} · {m.javaProficiency}
                        </span>
                        <span className="font-mono text-[11px] text-[#5F5E61] block">
                          {m.socraticTraining}
                        </span>
                      </div>
                    </div>
                    <span className="font-mono text-[11px] font-semibold text-[#630ED4] shrink-0">
                      {m.status}
                    </span>
                  </div>

                  {m.status === 'Pending Review' && (
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => onVerifyMentor(m.id)}
                        className="flex-1 min-h-[44px] rounded-xl bg-[#630ED4] text-white text-xs font-semibold"
                      >
                        Verify Badge
                      </button>
                      <button
                        type="button"
                        onClick={() => onRejectMentor(m.id)}
                        className="min-h-[44px] px-4 rounded-xl bg-[#E3E1ED] text-[#4A4455] text-xs font-medium"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Mobile System Configuration */}
        <div className="bg-white rounded-2xl p-4 shadow-sm space-y-2.5">
          <div className="flex items-center justify-between">
            <h3 className="text-[15px] font-bold text-[#1A1B23]">System Configuration</h3>
            <Sliders className="w-4 h-4 text-[#4A4455]" />
          </div>
          <div className="flex items-center justify-between p-3 rounded-xl bg-[#F4F2FE]">
            <div>
              <span className="text-xs font-semibold text-[#1A1B23] block">
                Regex Solution Redaction
              </span>
              <span className="text-[11px] text-[#4A4455]">Auto-obfuscates raw code dumps</span>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={config.regexRedactionEnabled}
              onClick={() =>
                onUpdateConfig({
                  ...config,
                  regexRedactionEnabled: !config.regexRedactionEnabled,
                })
              }
              className={`w-11 h-6 rounded-full p-0.5 flex items-center transition-colors shrink-0 ${
                config.regexRedactionEnabled ? 'bg-[#630ED4] justify-end' : 'bg-[#CCC3D8] justify-start'
              }`}
            >
              <span className="w-5 h-5 rounded-full bg-white shadow-sm" />
            </button>
          </div>
          <button
            type="button"
            onClick={handleExportAuditCsv}
            className="w-full min-h-[42px] px-3.5 py-2 rounded-xl bg-[#F4F2FE] hover:bg-[#E9E7F3] text-[#1A1B23] text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-[#630ED4]" />
            <span>Export Audit Logs (CSV)</span>
          </button>
        </div>
      </div>

      {/* Toast Overlay */}
      {toast && (
        <div className="fixed bottom-20 lg:bottom-6 right-6 z-50 px-4 py-2.5 rounded-xl bg-[#18181B] text-white shadow-xl flex items-center gap-2 text-xs font-medium">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toast}</span>
        </div>
      )}

      {/* Verification Audit Log Modal */}
      {auditModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-[#1A1B23]">
                FERPA &amp; Credential Audit Log
              </h3>
              <button type="button" onClick={() => setAuditModalOpen(false)}>
                <X className="w-5 h-5 text-[#5F5E61]" />
              </button>
            </div>
            <div className="space-y-2 max-h-72 overflow-y-auto">
              {auditLogs.map((log) => (
                <div key={log.id} className="p-3 rounded-xl bg-[#F4F2FE] text-xs space-y-0.5">
                  <div className="flex justify-between font-mono text-[10px] text-[#5F5E61]">
                    <span className="font-semibold text-[#630ED4]">{log.actor}</span>
                    <span>{log.timestamp}</span>
                  </div>
                  <div className="font-semibold text-[#1A1B23]">{log.action}</div>
                  <div className="text-[#4A4455]">{log.detail}</div>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between gap-2 pt-2">
              <button
                type="button"
                onClick={handleExportAuditCsv}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#F4F2FE] hover:bg-[#E9E7F3] text-[#630ED4] text-xs font-semibold transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Audit Logs CSV</span>
              </button>
              <button
                type="button"
                onClick={() => setAuditModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-[#18181B] text-white text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Rules Modal */}
      {rulesModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveRules}
            className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-[#1A1B23]">Edit IF101 Guardrail Rules</h3>
              <button type="button" onClick={() => setRulesModalOpen(false)}>
                <X className="w-5 h-5 text-[#5F5E61]" />
              </button>
            </div>
            <div className="space-y-3 text-sm">
              <div>
                <label className="block text-xs font-semibold text-[#4A4455] mb-1">
                  Max Concurrent Sessions per Mentor
                </label>
                <input
                  type="number"
                  min={1}
                  max={6}
                  value={draftConfig.maxConcurrentSessions}
                  onChange={(e) =>
                    setDraftConfig({
                      ...draftConfig,
                      maxConcurrentSessions: Number(e.target.value) || 3,
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-[#F4F2FE] border border-[#CCC3D8]/50 font-mono text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#4A4455] mb-1">
                  Auto-Escalation Turn Threshold
                </label>
                <input
                  type="number"
                  min={2}
                  max={12}
                  value={draftConfig.autoEscalationTurns}
                  onChange={(e) =>
                    setDraftConfig({
                      ...draftConfig,
                      autoEscalationTurns: Number(e.target.value) || 6,
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-[#F4F2FE] border border-[#CCC3D8]/50 font-mono text-sm"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setRulesModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-[#F4F2FE] text-xs font-semibold text-[#4A4455]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-[#630ED4] text-white text-xs font-semibold"
              >
                Save Policy
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
};
