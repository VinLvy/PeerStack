export type TabRoute =
  | 'landing'
  | 'mentee-pipeline'
  | 'mentor-workspace'
  | 'hint-delivery'
  | 'admin-and-metrics';

export type UserRole = 'Mentee' | 'Mentor' | 'Supervisor/Admin';

export type TicketStatus = 'Pending' | 'Socratic' | 'Verified' | 'Flagged';

export type TopicModule = 'Recursion' | 'Arrays' | 'Object-Oriented' | 'Sorting' | 'Graphs';

export type ResolutionStatus = 'full' | 'partial' | 'stuck';

export interface DiffLine {
  removed: string;
  added: string;
  label: string;
}

export interface Ticket {
  id: string;
  sessionCode: string;
  studentId: string;
  status: TicketStatus;
  topic: string;
  moduleCategory: TopicModule;
  assignedMentor: string;
  mentorInitials: string;
  submittedDate: string;
  submittedAgo: string;
  severity: string;
  fileName: string;
  methodName: string;
  title: string;
  rawCode: string;
  scrubbedCode: string;
  redactionCount: number;
  redactionDiffs: DiffLine[];
  faultLine: number;
  faultSummary: string;
  stackTrace: string[];
  testVector: string;
  studentHypothesis: string;
  curricularObjective: string;
  curricularGoal: string;
  aiTriageDiagnosis: string;
  hint1: string;
  hint1Exercise: string;
  hint1Target: string;
  hint2: string;
  hint2Consideration: string;
  hint1Acknowledged: boolean;
  clarificationUsed: boolean;
  clarificationQuestion: string;
  resolutionStatus: ResolutionStatus;
  clarityRating: number;
  ticketClosed: boolean;
  hintsDelivered: boolean;
  deliveredAgo?: string;
}

export interface KanbanCard {
  id: string;
  studentId: string;
  column: 'Submitted' | 'Socratic Review' | 'Verified Pass';
  tagRight: string;
  description: string;
  category: string;
  mentorInitials: string;
  avatarStyle: 'gradient' | 'tertiary' | 'secondary';
}

export interface ChatMessage {
  id: string;
  sender: 'mentee' | 'ai';
  label: string;
  text: string;
  timestamp: string;
}

export interface MentorCandidate {
  id: string;
  code: string;
  name: string;
  initials: string;
  year: string;
  status: 'Pending Review' | 'Verified' | 'Flagged' | 'Revoked';
  javaProficiency: string;
  socraticTraining: string;
  avatarUrl?: string;
}

export interface CurriculumMilestone {
  id: string;
  code: string;
  title: string;
  subtitle: string;
  status: 'Completed' | 'Active' | 'Upcoming';
  activeStudents: number;
  avgTurns: number;
  guardrailFlagPct: number;
}

export interface GuardrailConfig {
  regexRedactionEnabled: boolean;
  regexPattern: string;
  maxConcurrentSessions: number;
  autoEscalationTurns: number;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  detail: string;
  severity: 'info' | 'warning' | 'success';
}

export interface SampleBugPreset {
  id: string;
  label: string;
  course: string;
  topicDomain: string;
  moduleCategory: TopicModule;
  fileName: string;
  methodName: string;
  rawCode: string;
  faultLine: number;
  faultSummary: string;
  stackTrace: string[];
  testVector: string;
  hypothesis: string;
}
