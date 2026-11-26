import type {
  Course,
  CredentialCandidate,
  DemoStoreState,
  HourLogEntry,
  Ticket,
  Topic,
} from "./types";

export const MENTOR_WEEKLY_TICKET_CAP = 3;
export const MENTOR_WEEKLY_HOUR_CAP = 2.0;

export const DEMO_COURSE: Course = {
  id: "IF101",
  code: "IF101",
  name: "Algorithms (Java)",
  language: "java",
};

export const DEMO_TOPICS: Topic[] = [
  {
    id: "recursion",
    course_id: "IF101",
    name: "Recursion",
    description: "Base case, recursive step, call stack, preventing StackOverflowError.",
  },
  {
    id: "loops",
    course_id: "IF101",
    name: "Loops",
    description: "for, while, do-while loop bounds, off-by-one errors, infinite loops.",
  },
  {
    id: "arrays",
    course_id: "IF101",
    name: "Arrays",
    description: "0-based indexing, array.length, ArrayIndexOutOfBoundsException.",
  },
  {
    id: "sorting",
    course_id: "IF101",
    name: "Sorting",
    description: "Bubble sort, selection sort, insertion sort, swap logic, loop boundaries.",
  },
  {
    id: "searching",
    course_id: "IF101",
    name: "Searching",
    description: "Linear search, binary search mid-point calculation, loop termination.",
  },
  {
    id: "basic-complexity",
    course_id: "IF101",
    name: "Basic Complexity",
    description: "Nested loop growth, O(1), O(n), O(n^2) time intuition.",
  },
];

export const HERO_SAMPLE_TICKET_INPUT = {
  topic_id: "recursion",
  code: `// Author: Budi Santoso | NIM: 24010099 | Email: budi.demo@example.com
// Debug key: AIzaSyFakeKeyForDemo1234567890123456789
public class FactorialDemo {
    public static int factorial(int n) {
        return n * factorial(n - 1);
    }

    public static void main(String[] args) {
        System.out.println(factorial(5));
    }
}`,
  error_log: `Exception in thread "main" java.lang.StackOverflowError
    at FactorialDemo.factorial(FactorialDemo.java:5)
    at FactorialDemo.factorial(FactorialDemo.java:5)
    at FactorialDemo.factorial(FactorialDemo.java:5)`,
  description:
    "I tried changing int to long because I thought 5! was too large, and checked my syntax, but it still throws a StackOverflowError immediately when I run it.",
};

export const INITIAL_TICKETS: Ticket[] = [
  {
    id: "T-101",
    mentee_id: "mentee-a42",
    mentee_pseudonym: "Mentee-A42",
    course_id: "IF101",
    topic_id: "arrays",
    topic_name: "Arrays",
    description_sanitized:
      "I checked that my array has 4 integers, and I tested printing scores[0], which works. However, the loop crashes right at the end when summing all elements.",
    code_sanitized: `// Author: [REDACTED_NAME] | Email: [REDACTED_EMAIL]
public class ArraySum {
    public static int sumScores(int[] scores) {
        int total = 0;
        for (int i = 0; i <= scores.length; i++) {
            total += scores[i];
        }
        return total;
    }

    public static void main(String[] args) {
        int[] scores = {80, 90, 75, 85};
        System.out.println(sumScores(scores));
    }
}`,
    error_log_sanitized: `Exception in thread "main" java.lang.ArrayIndexOutOfBoundsException: Index 4 out of bounds for length 4
    at ArraySum.sumScores(ArraySum.java:6)
    at ArraySum.main(ArraySum.java:13)`,
    redactions_count: 2,
    redacted_types: ["NAME", "EMAIL"],
    status: "pending_review",
    arm: "assisted",
    triage_summary:
      "Simulated Triage: Off-by-one boundary condition in the array traversal loop on line 5 causes access at index equal to scores.length.",
    highlighted_lines: [5, 6],
    similar_ticket_note:
      "Simulated: 1 similar past ticket found in IF101 (Arrays - upper bound <= array.length).",
    ai_draft: {
      hint_1:
        "If an array has length 4, what are the valid index numbers from the first element to the last element? Check what value i reaches on the final iteration of your loop.",
      hint_2:
        "Look closely at the loop condition on line 5 (i <= scores.length). When i equals scores.length, does scores[i] point to a valid element in a 0-indexed Java array?",
      guardrail_1: {
        verdict: "pass",
        reason: "Passed - 0 full solutions detected.",
        matchedRules: [],
      },
    },
    delivered_message: null,
    followup: null,
    rating: null,
    claimed_by: null,
    claimed_at: null,
    delivered_at: null,
    review_minutes: null,
    created_at: "2026-11-26T09:15:00+07:00",
    is_synthetic: true,
  },
  {
    id: "T-102",
    mentee_id: "mentee-a42",
    mentee_pseudonym: "Mentee-A42",
    course_id: "IF101",
    topic_id: "sorting",
    topic_name: "Sorting",
    description_sanitized:
      "I wrote two nested loops for bubble sort and compared adjacent elements, but the output array overwrites values with duplicates instead of swapping them.",
    code_sanitized: `public class BubbleSortBug {
    public static void sort(int[] arr) {
        for (int i = 0; i < arr.length - 1; i++) {
            for (int j = 0; j < arr.length - i - 1; j++) {
                if (arr[j] > arr[j + 1]) {
                    arr[j] = arr[j + 1];
                    arr[j + 1] = arr[j];
                }
            }
        }
    }
}`,
    error_log_sanitized: `Expected output: [1, 2, 4, 8]
Actual output:   [1, 1, 1, 1]`,
    redactions_count: 0,
    redacted_types: [],
    status: "pending_review",
    arm: "manual",
    triage_summary:
      "Manual Arm ticket: AI draft intentionally withheld for baseline comparison (Metric M1).",
    highlighted_lines: [6, 7],
    similar_ticket_note: null,
    ai_draft: null,
    delivered_message: null,
    followup: null,
    rating: null,
    claimed_by: null,
    claimed_at: null,
    delivered_at: null,
    review_minutes: null,
    created_at: "2026-11-26T09:42:00+07:00",
    is_synthetic: true,
  },
  {
    id: "T-103",
    mentee_id: "mentee-a42",
    mentee_pseudonym: "Mentee-A42",
    course_id: "IF101",
    topic_id: "loops",
    topic_name: "Loops",
    description_sanitized:
      "I tried adding a print statement inside my while loop to see why it never finishes, and it keeps printing count = 1 forever.",
    code_sanitized: `public class CountdownLoop {
    public static void main(String[] args) {
        int count = 5;
        while (count > 0) {
            System.out.println("count = " + count);
        }
    }
}`,
    error_log_sanitized: `Process timed out after printing "count = 5" repeatedly.`,
    redactions_count: 0,
    redacted_types: [],
    status: "closed",
    arm: "assisted",
    triage_summary:
      "Simulated Triage: Infinite while loop because loop control variable count is never updated inside the loop body.",
    highlighted_lines: [4, 5],
    similar_ticket_note:
      "Simulated: 2 similar past tickets found in IF101 (Loops - missing decrement).",
    ai_draft: {
      hint_1:
        "Trace the value of count after each iteration of the while loop. What changes inside lines 4-6 to make the condition count > 0 eventually become false?",
      hint_2:
        "Look at lines 4-6 inside the while block. You read count when printing, but does anything update count toward 0 on each pass?",
      guardrail_1: {
        verdict: "pass",
        reason: "Passed - 0 full solutions detected.",
        matchedRules: [],
      },
    },
    delivered_message: {
      hint_1:
        "Trace the value of count after each iteration of the while loop. What changes inside lines 4-6 to make the condition count > 0 eventually become false?",
      hint_2:
        "Look at lines 4-6 inside the while block. You read count when printing, but does anything update count toward 0 on each pass?",
      action: "approved",
      guardrail_2: {
        verdict: "pass",
        reason: "Passed - 0 full solutions detected.",
        matchedRules: [],
      },
    },
    followup: null,
    rating: {
      clarity: 5,
      unblocked: "yes",
      rated_at: "2026-11-26T08:45:00+07:00",
    },
    claimed_by: "mentor-raka",
    claimed_at: "2026-11-26T08:10:00+07:00",
    delivered_at: "2026-11-26T08:34:00+07:00",
    review_minutes: 24,
    created_at: "2026-11-26T08:00:00+07:00",
    is_synthetic: true,
  },
];

export const INITIAL_HOUR_LOGS: HourLogEntry[] = [
  {
    id: "LOG-103",
    mentor_id: "mentor-raka",
    ticket_id: "T-103",
    topic_name: "Loops",
    date: "2026-11-26",
    review_minutes: 24,
    action: "approved",
    clarity_rating: 5,
    is_synthetic: true,
  },
];

export const INITIAL_CREDENTIALS: CredentialCandidate[] = [
  {
    id: "mentor-raka",
    name: "Raka Pratama",
    semester: 5,
    course_name: "Algorithms (Java)",
    grade: "A",
    academic_integrity: "Clean Record",
    status: "verified",
  },
  {
    id: "cand-nadia",
    name: "Nadia Kusuma",
    semester: 5,
    course_name: "Algorithms (Java)",
    grade: "A",
    academic_integrity: "Clean Record",
    status: "pending",
  },
  {
    id: "cand-dimas",
    name: "Dimas Pratoyo",
    semester: 4,
    course_name: "Algorithms (Java)",
    grade: "AB",
    academic_integrity: "Clean Record",
    status: "pending",
  },
  {
    id: "cand-bima",
    name: "Bima Aditya",
    semester: 6,
    course_name: "Algorithms (Java)",
    grade: "B",
    academic_integrity: "Flagged (Prior Plagiarism Note)",
    status: "pending",
  },
];

export function createInitialDemoState(): DemoStoreState {
  return {
    activeRole: "mentee",
    mentee: {
      id: "mentee-a42",
      display_label: "Student #A42",
      pseudonym: "Mentee-A42",
      semester: 1,
      consent_accepted: false,
    },
    mentor: {
      id: "mentor-raka",
      name: "Raka Pratama",
      semester: 5,
      course_id: "IF101",
      verified_badge: "Verified Mentor: Algorithms (Grade A)",
      weekly_cap: MENTOR_WEEKLY_TICKET_CAP,
      weekly_hour_cap: MENTOR_WEEKLY_HOUR_CAP,
      consent_accepted: false,
    },
    admin: {
      id: "admin-demo",
      name: "Supervisor (Demo)",
      department: "Informatics",
    },
    tickets: INITIAL_TICKETS.map((t) => ({ ...t })),
    hourLogs: INITIAL_HOUR_LOGS.map((l) => ({ ...l })),
    credentials: INITIAL_CREDENTIALS.map((c) => ({ ...c })),
    nextTicketNumber: 104,
  };
}
