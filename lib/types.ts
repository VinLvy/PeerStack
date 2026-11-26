export type UserRole = "mentee" | "mentor" | "admin";

export type TicketArm = "assisted" | "manual";

export type TicketStatus = "pending_review" | "in_review" | "delivered" | "closed";

export type GuardrailVerdict = "pass" | "flag" | "block";

export type UnblockedStatus = "yes" | "partly" | "no";

export type MentorDeliveryAction = "approved" | "edited" | "rejected_rewritten";

export type CredentialStatus = "verified" | "pending" | "rejected";

export interface Course {
  id: string;
  code: string;
  name: string;
  language: "java";
}

export interface Topic {
  id: string;
  course_id: string;
  name: string;
  description: string;
}

export interface MenteeProfile {
  id: string;
  display_label: string;
  pseudonym: string;
  semester: number;
  consent_accepted: boolean;
}

export interface MentorProfile {
  id: string;
  name: string;
  semester: number;
  course_id: string;
  verified_badge: string;
  weekly_cap: number;
  weekly_hour_cap: number;
  consent_accepted: boolean;
}

export interface AdminProfile {
  id: string;
  name: string;
  department: string;
}

export interface RedactionResult {
  sanitizedText: string;
  redactionsCount: number;
  redactedTypes: string[];
}

export interface GuardrailResult {
  verdict: GuardrailVerdict;
  reason: string;
  matchedRules: string[];
}

export interface AiDraft {
  hint_1: string;
  hint_2: string;
  guardrail_1: GuardrailResult;
}

export interface DeliveredMessage {
  hint_1: string;
  hint_2: string;
  action: MentorDeliveryAction;
  rejection_reason?: string;
  guardrail_2: GuardrailResult;
  mentor_confirmed_flag?: boolean;
}

export interface TicketFollowUp {
  question_sanitized: string;
  simulated_reply: string;
  created_at: string;
}

export interface TicketRating {
  clarity: 1 | 2 | 3 | 4 | 5;
  unblocked: UnblockedStatus;
  rated_at: string;
}

export interface Ticket {
  id: string;
  mentee_id: string;
  mentee_pseudonym: string;
  course_id: string;
  topic_id: string;
  topic_name: string;
  description_sanitized: string;
  code_sanitized: string;
  error_log_sanitized: string;
  redactions_count: number;
  redacted_types: string[];
  status: TicketStatus;
  arm: TicketArm;
  triage_summary: string | null;
  highlighted_lines: number[];
  similar_ticket_note: string | null;
  ai_draft: AiDraft | null;
  delivered_message: DeliveredMessage | null;
  followup: TicketFollowUp | null;
  rating: TicketRating | null;
  claimed_by: string | null;
  claimed_at: string | null;
  delivered_at: string | null;
  review_minutes: number | null;
  created_at: string;
  is_synthetic: boolean;
}

export interface HourLogEntry {
  id: string;
  mentor_id: string;
  ticket_id: string;
  topic_name: string;
  date: string;
  review_minutes: number;
  action: MentorDeliveryAction;
  clarity_rating: number | null;
  is_synthetic: boolean;
}

export interface CredentialCandidate {
  id: string;
  name: string;
  semester: number;
  course_name: string;
  grade: "A" | "AB" | "B";
  academic_integrity: string;
  status: CredentialStatus;
}

export interface DemoStoreState {
  activeRole: UserRole;
  mentee: MenteeProfile;
  mentor: MentorProfile;
  admin: AdminProfile;
  tickets: Ticket[];
  hourLogs: HourLogEntry[];
  credentials: CredentialCandidate[];
  nextTicketNumber: number;
}
