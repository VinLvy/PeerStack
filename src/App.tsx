/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { AdminMetricsView } from './components/AdminMetricsView';
import { HintDeliveryView } from './components/HintDeliveryView';
import { LandingView } from './components/LandingView';
import { MenteePipelineView } from './components/MenteePipelineView';
import { MentorWorkspaceView } from './components/MentorWorkspaceView';
import { Shell } from './components/Shell';
import {
  INITIAL_AUDIT_LOGS,
  INITIAL_CHAT_MESSAGES,
  INITIAL_GUARDRAIL_CONFIG,
  INITIAL_KANBAN,
  INITIAL_MENTORS,
  INITIAL_MILESTONES,
  INITIAL_TICKETS,
} from './data/initialData';
import {
  AuditLogEntry,
  ChatMessage,
  CurriculumMilestone,
  GuardrailConfig,
  KanbanCard,
  MentorCandidate,
  ResolutionStatus,
  TabRoute,
  Ticket,
  UserRole,
} from './types';

function formatNowTime(): string {
  const now = new Date();
  return now.toTimeString().slice(0, 8);
}

export default function App() {
  const [activeTab, setActiveTab] = useState<TabRoute>('landing');
  const [activeRole, setActiveRole] = useState<UserRole>('Mentee');

  const [tickets, setTickets] = useState<Ticket[]>(INITIAL_TICKETS);
  const [activeTicketId, setActiveTicketId] = useState<string>(INITIAL_TICKETS[0].id);
  const [kanbanCards, setKanbanCards] = useState<KanbanCard[]>(INITIAL_KANBAN);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(INITIAL_CHAT_MESSAGES);
  const [milestones] = useState<CurriculumMilestone[]>(INITIAL_MILESTONES);
  const [mentors, setMentors] = useState<MentorCandidate[]>(INITIAL_MENTORS);
  const [guardrailConfig, setGuardrailConfig] = useState<GuardrailConfig>(INITIAL_GUARDRAIL_CONFIG);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(INITIAL_AUDIT_LOGS);

  const appendAudit = (
    actor: string,
    action: string,
    detail: string,
    severity: AuditLogEntry['severity'] = 'info'
  ) => {
    const entry: AuditLogEntry = {
      id: `aud-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: formatNowTime(),
      actor,
      action,
      detail,
      severity,
    };
    setAuditLogs((prev) => [entry, ...prev]);
  };

  const handleTabChange = (tab: TabRoute) => {
    setActiveTab(tab);
    if (tab === 'mentor-workspace') {
      setActiveRole('Mentor');
    } else if (tab === 'admin-and-metrics') {
      setActiveRole('Supervisor/Admin');
    } else if (tab === 'mentee-pipeline' || tab === 'hint-delivery') {
      setActiveRole('Mentee');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRoleChange = (role: UserRole) => {
    setActiveRole(role);
    if (role === 'Mentor') {
      setActiveTab('mentor-workspace');
    } else if (role === 'Supervisor/Admin') {
      setActiveTab('admin-and-metrics');
    } else if (activeTab === 'mentor-workspace' || activeTab === 'admin-and-metrics') {
      setActiveTab('mentee-pipeline');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleInspectTicket = (ticketId: string, targetTab: TabRoute) => {
    setActiveTicketId(ticketId);
    handleTabChange(targetTab);
  };

  const handleSendChat = (msg: ChatMessage) => {
    setChatMessages((prev) => [...prev, msg]);
  };

  const handleSubmitTicket = (newTicket: Ticket) => {
    setTickets((prev) => [newTicket, ...prev]);
    setActiveTicketId(newTicket.id);

    const newCard: KanbanCard = {
      id: `k-${Date.now()}`,
      studentId: newTicket.studentId,
      column: 'Submitted',
      tagRight: 'JDK 21',
      description: newTicket.title,
      category: newTicket.topic,
      mentorInitials: newTicket.mentorInitials,
      avatarStyle: 'gradient',
    };
    setKanbanCards((prev) => [newCard, ...prev]);

    appendAudit(
      'Regex Engine',
      `Ticket #${newTicket.id} Scrubbed (${newTicket.redactionCount} tokens)`,
      `Dispatched ${newTicket.fileName} (${newTicket.moduleCategory}) into Socratic review queue.`,
      'success'
    );
  };

  const handleAdvanceKanban = (cardId: string) => {
    setKanbanCards((prev) =>
      prev.map((card) => {
        if (card.id !== cardId) return card;
        if (card.column === 'Submitted') {
          appendAudit(
            'Socratic Router',
            'Card Advanced to Review',
            `${card.studentId} (${card.description}) moved to Socratic Review.`,
            'info'
          );
          return { ...card, column: 'Socratic Review', tagRight: 'Dialectic AI' };
        }
        if (card.column === 'Socratic Review') {
          appendAudit(
            'Peer Mentor',
            'Card Verified Pass',
            `${card.studentId} (${card.description}) marked Verified Pass.`,
            'success'
          );
          return { ...card, column: 'Verified Pass', tagRight: 'PASSED TEST' };
        }
        return { ...card, column: 'Submitted', tagRight: 'JDK 21' };
      })
    );
  };

  const handleApplyMentor = (candidate: Omit<MentorCandidate, 'id' | 'code' | 'status'>) => {
    const num = Math.floor(8860 + Math.random() * 130);
    const created: MentorCandidate = {
      ...candidate,
      id: String(num),
      code: `M-${num}`,
      status: 'Pending Review',
    };
    setMentors((prev) => [created, ...prev]);
    appendAudit(
      'Applicant Portal',
      'New Mentor Application',
      `${created.name} (${created.code}, ${created.javaProficiency}) queued for Dr. Vance verification.`,
      'info'
    );
  };

  const handleSaveDraft = (ticketId: string, h1: string, h2: string) => {
    setTickets((prev) =>
      prev.map((t) => (t.id === ticketId ? { ...t, hint1: h1, hint2: h2 } : t))
    );
    appendAudit(
      'Mentor-B12',
      'Socratic Draft Saved',
      `Saved intermediate hint drafts for Ticket #${ticketId}.`,
      'info'
    );
  };

  const handleApproveHints = (ticketId: string, h1: string, h2: string) => {
    setTickets((prev) =>
      prev.map((t) =>
        t.id === ticketId
          ? {
              ...t,
              hint1: h1,
              hint2: h2,
              status: 'Socratic',
              hintsDelivered: true,
              deliveredAgo: 'RELEASED • JUST NOW',
            }
          : t
      )
    );
    appendAudit(
      'Guardrail #2',
      `Hints Approved for #${ticketId}`,
      `Verified zero syntax leakage and dispatched Socratic Hint 1 & 2 to mentee.`,
      'success'
    );
  };

  const handleFlagTicket = (ticketId: string) => {
    setTickets((prev) =>
      prev.map((t) => (t.id === ticketId ? { ...t, status: 'Flagged' } : t))
    );
    appendAudit(
      'Mentor-B12',
      `Ticket #${ticketId} Escalated`,
      `Flagged Ticket #${ticketId} to Dr. Vance for manual rubric supervision.`,
      'warning'
    );
  };

  const handleAcknowledgeHint1 = (ticketId: string) => {
    setTickets((prev) =>
      prev.map((t) =>
        t.id === ticketId ? { ...t, hint1Acknowledged: !t.hint1Acknowledged } : t
      )
    );
  };

  const handleSubmitClarification = (ticketId: string, question: string) => {
    setTickets((prev) =>
      prev.map((t) =>
        t.id === ticketId
          ? {
              ...t,
              clarificationUsed: true,
              clarificationQuestion: question,
            }
          : t
      )
    );
    appendAudit(
      'Mentee Follow-up',
      `Clarification Logged on #${ticketId}`,
      `Student submitted 1-round conceptual check: "${question.slice(0, 72)}${
        question.length > 72 ? '…' : ''
      }"`,
      'info'
    );
  };

  const handleCloseTicketFeedback = (
    ticketId: string,
    resolution: ResolutionStatus,
    rating: number
  ) => {
    setTickets((prev) =>
      prev.map((t) =>
        t.id === ticketId
          ? {
              ...t,
              resolutionStatus: resolution,
              clarityRating: rating,
              ticketClosed: true,
              status: 'Verified',
              deliveredAgo: 'VERIFIED • JUST NOW',
            }
          : t
      )
    );
    appendAudit(
      'Mentee Feedback',
      `Ticket #${ticketId} Closed (${rating}.0 / 5.0)`,
      `Resolution status recorded as "${resolution}" and archived for mastery telemetry.`,
      'success'
    );
  };

  const handleVerifyMentor = (id: string) => {
    const target = mentors.find((m) => m.id === id);
    setMentors((prev) =>
      prev.map((m) => (m.id === id ? { ...m, status: 'Verified' } : m))
    );
    if (target) {
      appendAudit(
        'Dr. Vance',
        'Credential Verified',
        `Issued IF101 Peer Mentor badge to ${target.name} (${target.code}).`,
        'success'
      );
    }
  };

  const handleRejectMentor = (id: string) => {
    const target = mentors.find((m) => m.id === id);
    setMentors((prev) =>
      prev.map((m) => (m.id === id ? { ...m, status: 'Revoked' } : m))
    );
    if (target) {
      appendAudit(
        'Dr. Vance',
        'Candidate Rejected',
        `Withheld IF101 credential for ${target.name} (${target.code}).`,
        'warning'
      );
    }
  };

  const handleUpdateConfig = (next: GuardrailConfig) => {
    setGuardrailConfig(next);
    appendAudit(
      'Dr. Vance',
      'Guardrail Policy Updated',
      `Regex redaction ${next.regexRedactionEnabled ? 'ON' : 'OFF'}, max sessions ${
        next.maxConcurrentSessions
      }, auto-escalation ${next.autoEscalationTurns} turns.`,
      'info'
    );
  };

  return (
    <Shell
      activeTab={activeTab}
      onTabChange={handleTabChange}
      activeRole={activeRole}
      onRoleChange={handleRoleChange}
      auditLogs={auditLogs}
    >
      {activeTab === 'landing' && (
        <LandingView
          tickets={tickets}
          kanbanCards={kanbanCards}
          chatMessages={chatMessages}
          onSendChat={handleSendChat}
          onNavigate={handleTabChange}
          onInspectTicket={handleInspectTicket}
          onAdvanceKanban={handleAdvanceKanban}
          onApplyMentor={handleApplyMentor}
        />
      )}

      {activeTab === 'mentee-pipeline' && (
        <MenteePipelineView
          onNavigate={handleTabChange}
          onSubmitTicket={handleSubmitTicket}
          tickets={tickets}
        />
      )}

      {activeTab === 'mentor-workspace' && (
        <MentorWorkspaceView
          tickets={tickets}
          activeTicketId={activeTicketId}
          onSelectTicket={setActiveTicketId}
          onSaveDraft={handleSaveDraft}
          onApproveHints={handleApproveHints}
          onFlagTicket={handleFlagTicket}
        />
      )}

      {activeTab === 'hint-delivery' && (
        <HintDeliveryView
          tickets={tickets}
          activeTicketId={activeTicketId}
          onSelectTicket={setActiveTicketId}
          onAcknowledgeHint1={handleAcknowledgeHint1}
          onSubmitClarification={handleSubmitClarification}
          onCloseTicketFeedback={handleCloseTicketFeedback}
        />
      )}

      {activeTab === 'admin-and-metrics' && (
        <AdminMetricsView
          tickets={tickets}
          milestones={milestones}
          mentors={mentors}
          config={guardrailConfig}
          auditLogs={auditLogs}
          onVerifyMentor={handleVerifyMentor}
          onRejectMentor={handleRejectMentor}
          onUpdateConfig={handleUpdateConfig}
        />
      )}
    </Shell>
  );
}
