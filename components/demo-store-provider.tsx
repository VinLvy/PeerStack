"use client";

import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { createInitialDemoState } from "@/lib/mock-data";
import type {
  CredentialStatus,
  DemoStoreState,
  GuardrailResult,
  HourLogEntry,
  MentorDeliveryAction,
  Ticket,
  TicketArm,
  UnblockedStatus,
  UserRole,
} from "@/lib/types";

const STORAGE_KEY = "peerstack_demo_store_v1";

export interface SubmitTicketPayload {
  topic_id: string;
  topic_name: string;
  description_sanitized: string;
  code_sanitized: string;
  error_log_sanitized: string;
  redactions_count: number;
  redacted_types: string[];
  arm?: TicketArm;
  triage_summary: string;
  highlighted_lines: number[];
  similar_ticket_note: string;
  hint_1: string;
  hint_2: string;
  guardrail_1: GuardrailResult;
}

export interface DeliverHintsPayload {
  hint_1: string;
  hint_2: string;
  action: MentorDeliveryAction;
  rejection_reason?: string;
  guardrail_2: GuardrailResult;
  mentor_confirmed_flag?: boolean;
  review_minutes: number;
}

interface DemoStoreContextValue {
  state: DemoStoreState;
  hydrated: boolean;
  setRole: (role: UserRole) => void;
  acceptConsent: (role?: UserRole) => void;
  toggleMenteeConsent: () => void;
  resetDemo: () => void;
  submitMenteeTicket: (payload: SubmitTicketPayload) => Ticket;
  claimTicket: (ticketId: string) => { ok: boolean; error?: string };
  deliverHints: (ticketId: string, payload: DeliverHintsPayload) => { ok: boolean; error?: string };
  submitFollowUp: (ticketId: string, questionSanitized: string) => void;
  submitRating: (ticketId: string, clarity: 1 | 2 | 3 | 4 | 5, unblocked: UnblockedStatus) => void;
  updateCredentialStatus: (candidateId: string, status: CredentialStatus) => void;
}

const DemoStoreContext = createContext<DemoStoreContextValue | null>(null);

function readPersistedState(): DemoStoreState | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as DemoStoreState;
    if (!parsed || !Array.isArray(parsed.tickets) || !parsed.mentee || !parsed.mentor) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function writePersistedState(next: DemoStoreState): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Ignore storage write errors in restricted browser contexts.
  }
}

export function DemoStoreProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<DemoStoreState>(() => createInitialDemoState());
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const saved = readPersistedState();
    if (saved) {
      setState(saved);
    }
    setHydrated(true);
  }, []);

  const updateState = useCallback((updater: (prev: DemoStoreState) => DemoStoreState) => {
    setState((prev) => {
      const next = updater(prev);
      writePersistedState(next);
      return next;
    });
  }, []);

  const setRole = useCallback(
    (role: UserRole) => {
      updateState((prev) => ({
        ...prev,
        activeRole: role,
      }));
    },
    [updateState]
  );

  const acceptConsent = useCallback(
    (role?: UserRole) => {
      updateState((prev) => {
        const target = role ?? prev.activeRole;
        return {
          ...prev,
          mentee:
            target === "mentee"
              ? { ...prev.mentee, consent_accepted: true }
              : prev.mentee,
          mentor:
            target === "mentor"
              ? { ...prev.mentor, consent_accepted: true }
              : prev.mentor,
        };
      });
    },
    [updateState]
  );

  const toggleMenteeConsent = useCallback(() => {
    updateState((prev) => ({
      ...prev,
      mentee: {
        ...prev.mentee,
        consent_accepted: !prev.mentee.consent_accepted,
      },
    }));
  }, [updateState]);

  const resetDemo = useCallback(() => {
    const fresh = createInitialDemoState();
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore storage cleanup errors.
    }
    writePersistedState(fresh);
    setState(fresh);
  }, []);

  const submitMenteeTicket = useCallback(
    (payload: SubmitTicketPayload): Ticket => {
      const nowIso = new Date().toISOString();
      const ticketId = `T-${state.nextTicketNumber}`;
      const newTicket: Ticket = {
        id: ticketId,
        mentee_id: state.mentee.id,
        mentee_pseudonym: state.mentee.pseudonym,
        course_id: "IF101",
        topic_id: payload.topic_id,
        topic_name: payload.topic_name,
        description_sanitized: payload.description_sanitized,
        code_sanitized: payload.code_sanitized,
        error_log_sanitized: payload.error_log_sanitized,
        redactions_count: payload.redactions_count,
        redacted_types: payload.redacted_types,
        status: "pending_review",
        arm: payload.arm ?? "assisted",
        triage_summary: payload.triage_summary,
        highlighted_lines: payload.highlighted_lines,
        similar_ticket_note: payload.similar_ticket_note,
        ai_draft:
          (payload.arm ?? "assisted") === "assisted"
            ? {
                hint_1: payload.hint_1,
                hint_2: payload.hint_2,
                guardrail_1: payload.guardrail_1,
              }
            : null,
        delivered_message: null,
        followup: null,
        rating: null,
        claimed_by: null,
        claimed_at: null,
        delivered_at: null,
        review_minutes: null,
        created_at: nowIso,
        is_synthetic: false,
      };

      updateState((prev) => ({
        ...prev,
        tickets: [newTicket, ...prev.tickets],
        nextTicketNumber: prev.nextTicketNumber + 1,
      }));

      return newTicket;
    },
    [state.mentee.id, state.mentee.pseudonym, state.nextTicketNumber, updateState]
  );

  const claimTicket = useCallback(
    (ticketId: string): { ok: boolean; error?: string } => {
      const target = state.tickets.find((t) => t.id === ticketId);
      if (!target) {
        return { ok: false, error: "Ticket not found." };
      }

      const claimedCount = state.tickets.filter(
        (t) => t.claimed_by === state.mentor.id
      ).length;

      if (target.claimed_by !== state.mentor.id && claimedCount >= state.mentor.weekly_cap) {
        return {
          ok: false,
          error: `Weekly cap reached (${state.mentor.weekly_cap}/${state.mentor.weekly_cap} tickets). Queue paused to prevent mentor burnout.`,
        };
      }

      const nowIso = new Date().toISOString();
      updateState((prev) => ({
        ...prev,
        tickets: prev.tickets.map((t) =>
          t.id === ticketId
            ? {
                ...t,
                claimed_by: prev.mentor.id,
                claimed_at: t.claimed_at ?? nowIso,
                status: t.status === "pending_review" ? "in_review" : t.status,
              }
            : t
        ),
      }));

      return { ok: true };
    },
    [state.mentor.id, state.mentor.weekly_cap, state.tickets, updateState]
  );

  const deliverHints = useCallback(
    (ticketId: string, payload: DeliverHintsPayload): { ok: boolean; error?: string } => {
      if (payload.guardrail_2.verdict === "block") {
        return { ok: false, error: payload.guardrail_2.reason };
      }
      if (payload.guardrail_2.verdict === "flag" && !payload.mentor_confirmed_flag) {
        return {
          ok: false,
          error: "Please confirm that this hint does not give away the full solution.",
        };
      }

      const nowIso = new Date().toISOString();
      const dateStr = nowIso.slice(0, 10);
      const target = state.tickets.find((t) => t.id === ticketId);
      if (!target) {
        return { ok: false, error: "Ticket not found." };
      }

      const claimedCount = state.tickets.filter(
        (t) => t.claimed_by === state.mentor.id
      ).length;
      if (target.claimed_by !== state.mentor.id && claimedCount >= state.mentor.weekly_cap) {
        return {
          ok: false,
          error: `Weekly cap reached (${state.mentor.weekly_cap}/${state.mentor.weekly_cap} tickets).`,
        };
      }

      const minutes = Math.max(1, payload.review_minutes);

      updateState((prev) => {
        const updatedTickets = prev.tickets.map((t) =>
          t.id === ticketId
            ? {
                ...t,
                status: "delivered" as const,
                claimed_by: t.claimed_by ?? prev.mentor.id,
                claimed_at: t.claimed_at ?? nowIso,
                delivered_at: nowIso,
                review_minutes: minutes,
                delivered_message: {
                  hint_1: payload.hint_1,
                  hint_2: payload.hint_2,
                  action: payload.action,
                  rejection_reason: payload.rejection_reason,
                  guardrail_2: payload.guardrail_2,
                  mentor_confirmed_flag: payload.mentor_confirmed_flag,
                },
              }
            : t
        );

        const existingLogIndex = prev.hourLogs.findIndex((l) => l.ticket_id === ticketId);
        const newLog: HourLogEntry = {
          id: `LOG-${ticketId}`,
          mentor_id: prev.mentor.id,
          ticket_id: ticketId,
          topic_name: target.topic_name,
          date: dateStr,
          review_minutes: minutes,
          action: payload.action,
          clarity_rating: target.rating?.clarity ?? null,
          is_synthetic: target.is_synthetic,
        };

        const updatedLogs =
          existingLogIndex >= 0
            ? prev.hourLogs.map((l, idx) => (idx === existingLogIndex ? newLog : l))
            : [newLog, ...prev.hourLogs];

        return {
          ...prev,
          tickets: updatedTickets,
          hourLogs: updatedLogs,
        };
      });

      return { ok: true };
    },
    [state.mentor.id, state.mentor.weekly_cap, state.tickets, updateState]
  );

  const submitFollowUp = useCallback(
    (ticketId: string, questionSanitized: string) => {
      const nowIso = new Date().toISOString();
      updateState((prev) => ({
        ...prev,
        tickets: prev.tickets.map((t) =>
          t.id === ticketId && !t.followup
            ? {
                ...t,
                followup: {
                  question_sanitized: questionSanitized,
                  simulated_reply:
                    "Simulated Follow-Up Acknowledgement: Your follow-up question has been logged (1/1 round used). In production, the assigned Peer Mentor reviews this clarification within your course SLA.",
                  created_at: nowIso,
                },
              }
            : t
        ),
      }));
    },
    [updateState]
  );

  const submitRating = useCallback(
    (ticketId: string, clarity: 1 | 2 | 3 | 4 | 5, unblocked: UnblockedStatus) => {
      const nowIso = new Date().toISOString();
      updateState((prev) => ({
        ...prev,
        tickets: prev.tickets.map((t) =>
          t.id === ticketId
            ? {
                ...t,
                status: "closed",
                rating: {
                  clarity,
                  unblocked,
                  rated_at: nowIso,
                },
              }
            : t
        ),
        hourLogs: prev.hourLogs.map((l) =>
          l.ticket_id === ticketId ? { ...l, clarity_rating: clarity } : l
        ),
      }));
    },
    [updateState]
  );

  const updateCredentialStatus = useCallback(
    (candidateId: string, status: CredentialStatus) => {
      updateState((prev) => ({
        ...prev,
        credentials: prev.credentials.map((c) =>
          c.id === candidateId ? { ...c, status } : c
        ),
      }));
    },
    [updateState]
  );

  return (
    <DemoStoreContext.Provider
      value={{
        state,
        hydrated,
        setRole,
        acceptConsent,
        toggleMenteeConsent,
        resetDemo,
        submitMenteeTicket,
        claimTicket,
        deliverHints,
        submitFollowUp,
        submitRating,
        updateCredentialStatus,
      }}
    >
      {children}
    </DemoStoreContext.Provider>
  );
}

export function useDemoStore(): DemoStoreContextValue {
  const ctx = useContext(DemoStoreContext);
  if (!ctx) {
    throw new Error("useDemoStore must be used inside DemoStoreProvider");
  }
  return ctx;
}
