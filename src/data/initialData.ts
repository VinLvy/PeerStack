import {
  AuditLogEntry,
  ChatMessage,
  CurriculumMilestone,
  GuardrailConfig,
  KanbanCard,
  MentorCandidate,
  SampleBugPreset,
  Ticket,
} from '../types';

export const ASSETS = {
  menteeAvatar: '/src/assets/images/avatar_mentee_a42_1795816672330.jpg',
  labShowcase: '/src/assets/images/lab_collaboration_showcase_1795816672730.jpg',
  drVanceAvatar: '/src/assets/images/avatar_dr_vance_1795816672910.jpg',
  marcusBrodyAvatar: '/src/assets/images/avatar_marcus_brody_1795816672814.jpg',
  elenaRostovaAvatar: '/src/assets/images/avatar_elena_rostova_1795816673468.jpg',
  dariusChenAvatar: '/src/assets/images/avatar_darius_chen_1795816673636.jpg',
};

export const INITIAL_TICKETS: Ticket[] = [
  {
    id: 'T-104',
    sessionCode: '#892-MC4',
    studentId: 'Mentee-A42',
    status: 'Pending',
    topic: 'Recursion',
    moduleCategory: 'Recursion',
    assignedMentor: 'Mentor-B12',
    mentorInitials: 'B12',
    submittedDate: 'Nov 27, 2026',
    submittedAgo: '42m AGO',
    severity: 'SEV-2',
    fileName: 'FactorialCalculator.java',
    methodName: 'compute(int n)',
    title: 'Recursion StackOverflow in RecursiveFactorial.java',
    rawCode: `// Author: Marcus Vance <mvance@inst.edu>
// File: /Users/marcus/cs101/FactorialCalculator.java
public class FactorialCalculator {
  public static int compute(int n) {
    // Student bug: Missing boundary condition check
    if (n == 0) return 1;
    return n * compute(n - 1);
  }
}`,
    scrubbedCode: `// Author: [REDACTED_IDENTITY:Mentee-A42]
// File: /sandbox/workspace/FactorialCalculator.java
public class FactorialCalculator {
  public static int compute(int n) {
    // Student bug: Missing boundary condition check
    if (n == 0) return 1;
    return n * compute(n - 1);
  }
}`,
    redactionCount: 3,
    redactionDiffs: [
      {
        removed: '- Author: Marcus Vance <mvance@inst.edu>',
        added: '+ Author: [REDACTED_IDENTITY:Mentee-A42]',
        label: 'Student Name & Campus Email',
      },
      {
        removed: '- File: /Users/marcus/cs101/FactorialCalculator.java',
        added: '+ File: /sandbox/workspace/FactorialCalculator.java',
        label: 'Local Directory Hash',
      },
    ],
    faultLine: 7,
    faultSummary: 'Line 7: Unbounded recursion on n <= 0',
    stackTrace: [
      'java.lang.StackOverflowError: Recursion depth limit (1024 frames) exceeded',
      'at FactorialCalculator.compute(FactorialCalculator.java:7)',
      'at FactorialCalculator.compute(FactorialCalculator.java:7)',
      'at FactorialCalculator.compute(FactorialCalculator.java:7)',
    ],
    testVector: 'Invoked with test vector: compute(-1) -> Next: compute(-2) -> compute(-3)',
    studentHypothesis:
      'I added a base case for n == 0 earlier, but when running unit tests with negative inputs like compute(-1), it triggers an infinite recursive call stack. How do I make the method stop for negative integers without just breaking the formula?',
    curricularObjective: 'IF101 Module 4: Recursion & Well-Founded Orders',
    curricularGoal:
      'Goal: Student independently identifies valid termination predicates and input domain preconditions (IllegalArgumentException vs base return condition). Mentors must NOT provide literal if clauses.',
    aiTriageDiagnosis:
      'Student correctly comprehends recursive descent multiplication n * (n - 1), but omitted lower-bound boundary predicate.',
    hint1:
      'Notice what happens when compute() receives an input that is already less than zero (e.g., n = -1). What stops the function from calling compute(-2)?',
    hint1Exercise:
      'Try paper tracing compute(-1) step-by-step in your notebook. Track stack frame activation registers until depth = 4.',
    hint1Target: 'Targeting: Base Case Termination Guards',
    hint2:
      'Think about the domain of the factorial function. What is the mathematical definition of factorial for non-positive integers, and how should Java signal invalid input?',
    hint2Consideration: 'Consider: IllegalArgumentException vs defensive base condition check (n <= 0).',
    hint1Acknowledged: false,
    clarificationUsed: false,
    clarificationQuestion: '',
    resolutionStatus: 'full',
    clarityRating: 5,
    ticketClosed: false,
    hintsDelivered: true,
    deliveredAgo: 'RELEASED • T+12m',
  },
  {
    id: 'T-105',
    sessionCode: '#893-BS2',
    studentId: 'Mentee-C88',
    status: 'Socratic',
    topic: 'BinarySearch',
    moduleCategory: 'Arrays',
    assignedMentor: 'Mentor-F04',
    mentorInitials: 'F04',
    submittedDate: 'Nov 27, 2026',
    submittedAgo: '28m AGO',
    severity: 'SEV-3',
    fileName: 'BinarySearchLab.java',
    methodName: 'findIndex(int[] arr, int target)',
    title: 'Infinite Loop in Binary Search Midpoint Update',
    rawCode: `public class BinarySearchLab {
  public static int findIndex(int[] arr, int target) {
    int left = 0, right = arr.length - 1;
    while (left < right) {
      int mid = (left + right) / 2;
      if (arr[mid] < target) left = mid;
      else right = mid;
    }
    return arr[left] == target ? left : -1;
  }
}`,
    scrubbedCode: `public class BinarySearchLab {
  public static int findIndex(int[] arr, int target) {
    int left = 0, right = arr.length - 1;
    while (left < right) {
      int mid = (left + right) / 2;
      if (arr[mid] < target) left = mid;
      else right = mid;
    }
    return arr[left] == target ? left : -1;
  }
}`,
    redactionCount: 1,
    redactionDiffs: [
      {
        removed: '- NetID: cchen88',
        added: '+ Author: [REDACTED_IDENTITY:Mentee-C88]',
        label: 'NetID Scrubbed',
      },
    ],
    faultLine: 6,
    faultSummary: 'Line 6: Interval fails to shrink when right - left == 1',
    stackTrace: [
      'TimeoutException: Execution exceeded 2000ms limit in BinarySearchLab.findIndex',
      'at BinarySearchLab.findIndex(BinarySearchLab.java:4)',
      'Last state: left=2, right=3, mid=2 -> left=2 (no progress)',
    ],
    testVector: 'Invoked with test vector: findIndex(new int[]{2, 5, 8, 12}, 10)',
    studentHypothesis:
      'It works on odd-length arrays, but hangs forever when searching near the right end of an even-length array.',
    curricularObjective: 'IF101 Module 2: Loop Invariants & Interval Reduction',
    curricularGoal:
      'Goal: Student verifies strict interval shrinkage on a 2-element boundary without receiving explicit index arithmetic patch.',
    aiTriageDiagnosis:
      'Student maintains sorted invariant correctly, but integer division floors mid to left, stalling left = mid.',
    hint1:
      'Suppose left = 2 and right = 3. What does integer division (2 + 3) / 2 evaluate to for mid, and if arr[mid] < target, what changes on the next loop iteration?',
    hint1Exercise:
      'Trace left, right, and mid on paper for array [5, 8] when searching for target = 8.',
    hint1Target: 'Targeting: Loop Interval Shrinkage',
    hint2:
      'If arr[mid] is strictly less than target, can mid itself still be a valid candidate answer? What happens to the search interval if you exclude mid?',
    hint2Consideration: 'Consider: Does excluding mid guarantee right - left strictly decreases?',
    hint1Acknowledged: false,
    clarificationUsed: false,
    clarificationQuestion: '',
    resolutionStatus: 'partial',
    clarityRating: 5,
    ticketClosed: false,
    hintsDelivered: true,
    deliveredAgo: 'RELEASED • T+8m',
  },
  {
    id: 'T-106',
    sessionCode: '#890-MS1',
    studentId: 'Mentee-B19',
    status: 'Verified',
    topic: 'MergeSort',
    moduleCategory: 'Sorting',
    assignedMentor: 'Mentor-A03',
    mentorInitials: 'A03',
    submittedDate: 'Nov 26, 2026',
    submittedAgo: '1d AGO',
    severity: 'SEV-3',
    fileName: 'MergeSortAux.java',
    methodName: 'merge(int[] a, int[] aux, int lo, int mid, int hi)',
    title: 'Auxiliary Array Offset in MergeSort Partition',
    rawCode: `public class MergeSortAux {
  public static void merge(int[] a, int[] aux, int lo, int mid, int hi) {
    for (int k = lo; k <= hi; k++) aux[k] = a[k];
    int i = lo, j = mid + 1;
    for (int k = lo; k <= hi; k++) {
      if (i > mid) a[k] = aux[j++];
      else if (j > hi) a[k] = aux[i++];
      else if (aux[j] < aux[i]) a[k] = aux[j++];
      else a[k] = aux[i++];
    }
  }
}`,
    scrubbedCode: `public class MergeSortAux {
  public static void merge(int[] a, int[] aux, int lo, int mid, int hi) {
    for (int k = lo; k <= hi; k++) aux[k] = a[k];
    int i = lo, j = mid + 1;
    for (int k = lo; k <= hi; k++) {
      if (i > mid) a[k] = aux[j++];
      else if (j > hi) a[k] = aux[i++];
      else if (aux[j] < aux[i]) a[k] = aux[j++];
      else a[k] = aux[i++];
    }
  }
}`,
    redactionCount: 2,
    redactionDiffs: [
      {
        removed: '- File: /Users/bchen/if101/MergeSortAux.java',
        added: '+ File: /sandbox/workspace/MergeSortAux.java',
        label: 'Local Path Scrubbed',
      },
    ],
    faultLine: 6,
    faultSummary: 'Verified pass after 2 Socratic pointer checks',
    stackTrace: ['All 18 JUnit assertions passed in 14ms (0 regressions).'],
    testVector: 'Invoked with test vector: merge([1, 4, 2, 5], aux, 0, 1, 3)',
    studentHypothesis:
      'Previously forgot to check i > mid before reading aux[i], causing ArrayIndexOutOfBounds.',
    curricularObjective: 'IF101 Module 3: Divide & Conquer Stability',
    curricularGoal: 'Goal: Student verifies half-subarray exhaustion guards before value comparison.',
    aiTriageDiagnosis: 'Resolved cleanly after Socratic boundary ordering check.',
    hint1:
      'Before comparing aux[j] and aux[i], what guarantees that neither i nor j has already walked past the end of its subarray?',
    hint1Exercise: 'Trace the final two iterations when left subarray is strictly smaller than right.',
    hint1Target: 'Targeting: Boundary Guard Ordering',
    hint2: 'Check the order of your four if / else-if conditions inside the k loop.',
    hint2Consideration: 'Consider: Exhaustion guards before element comparison.',
    hint1Acknowledged: true,
    clarificationUsed: false,
    clarificationQuestion: '',
    resolutionStatus: 'full',
    clarityRating: 5,
    ticketClosed: true,
    hintsDelivered: true,
    deliveredAgo: 'VERIFIED • 1d AGO',
  },
  {
    id: 'T-107',
    sessionCode: '#889-NP9',
    studentId: 'Mentee-F03',
    status: 'Flagged',
    topic: 'NullPointer',
    moduleCategory: 'Object-Oriented',
    assignedMentor: 'Mentor-E99',
    mentorInitials: 'E99',
    submittedDate: 'Nov 26, 2026',
    submittedAgo: '3h AGO',
    severity: 'SEV-1',
    fileName: 'NodeList.java',
    methodName: 'insertTail(Node head, int val)',
    title: 'NullPointerException on Empty LinkedList Head',
    rawCode: `public class NodeList {
  public Node insertTail(Node head, int val) {
    Node curr = head;
    while (curr.next != null) {
      curr = curr.next;
    }
    curr.next = new Node(val);
    return head;
  }
}`,
    scrubbedCode: `public class NodeList {
  public Node insertTail(Node head, int val) {
    Node curr = head;
    while (curr.next != null) {
      curr = curr.next;
    }
    curr.next = new Node(val);
    return head;
  }
}`,
    redactionCount: 2,
    redactionDiffs: [
      {
        removed: '- Author: F. Okafor <fokafor@inst.edu>',
        added: '+ Author: [REDACTED_IDENTITY:Mentee-F03]',
        label: 'Email & Name Scrubbed',
      },
    ],
    faultLine: 4,
    faultSummary: 'Line 4: Dereferencing curr.next when head is null',
    stackTrace: [
      'java.lang.NullPointerException: Cannot read field "next" because "curr" is null',
      'at NodeList.insertTail(NodeList.java:4)',
    ],
    testVector: 'Invoked with test vector: insertTail(null, 42)',
    studentHypothesis:
      'When the list already has 1 or more nodes it passes, but an empty list throws NullPointerException.',
    curricularObjective: 'IF101 Module 2: Object References & Null Guards',
    curricularGoal:
      'Goal: Student identifies why dereferencing head before null-checking fails on an empty list.',
    aiTriageDiagnosis:
      'Flagged for direct reference guard guidance; student attempted solution snippet in prompt.',
    hint1:
      'When insertTail receives head = null (an empty list), what is the value of curr when line 4 evaluates curr.next?',
    hint1Exercise: 'Draw the reference box for head = null before the while loop starts.',
    hint1Target: 'Targeting: Null Reference Precondition',
    hint2:
      'If the list starts empty, what should insertTail return as the new head reference?',
    hint2Consideration: 'Consider: Separating the empty-list case from tail traversal.',
    hint1Acknowledged: false,
    clarificationUsed: false,
    clarificationQuestion: '',
    resolutionStatus: 'stuck',
    clarityRating: 4,
    ticketClosed: false,
    hintsDelivered: false,
  },
];

export const INITIAL_KANBAN: KanbanCard[] = [
  {
    id: 'k1',
    studentId: 'Mentee-A10',
    column: 'Submitted',
    tagRight: 'JDK 21',
    description: 'QuickSort Pivot Strategy',
    category: 'Sorting',
    mentorInitials: 'M1',
    avatarStyle: 'gradient',
  },
  {
    id: 'k2',
    studentId: 'Mentee-K91',
    column: 'Submitted',
    tagRight: 'JDK 21',
    description: 'BreadthFirstSearch Queue Loop',
    category: 'Graphs',
    mentorInitials: 'M2',
    avatarStyle: 'tertiary',
  },
  {
    id: 'k3',
    studentId: 'Mentee-D44',
    column: 'Submitted',
    tagRight: 'JDK 21',
    description: 'MinHeap Insertion Invariant',
    category: 'PriorityQueue',
    mentorInitials: 'M3',
    avatarStyle: 'secondary',
  },
  {
    id: 'k4',
    studentId: 'Mentee-Z12',
    column: 'Submitted',
    tagRight: 'JDK 21',
    description: 'LinkedList Cycle Detection',
    category: 'Pointers',
    mentorInitials: 'M4',
    avatarStyle: 'gradient',
  },
  {
    id: 'k5',
    studentId: 'Mentee-C88',
    column: 'Socratic Review',
    tagRight: 'Dialectic AI',
    description: 'Binary Search Boundary Off-By-One',
    category: 'Search',
    mentorInitials: 'F4',
    avatarStyle: 'gradient',
  },
  {
    id: 'k6',
    studentId: 'Mentee-E22',
    column: 'Socratic Review',
    tagRight: 'Dialectic AI',
    description: 'AVL Tree Double Rotation Cases',
    category: 'Trees',
    mentorInitials: 'R1',
    avatarStyle: 'tertiary',
  },
  {
    id: 'k7',
    studentId: 'Mentee-G73',
    column: 'Socratic Review',
    tagRight: 'Dialectic AI',
    description: 'Dijkstra Priority Re-Weighting',
    category: 'Greedy',
    mentorInitials: 'L9',
    avatarStyle: 'gradient',
  },
  {
    id: 'k8',
    studentId: 'Mentee-W15',
    column: 'Socratic Review',
    tagRight: 'Dialectic AI',
    description: 'Dynamic Knapsack Subproblem Matrix',
    category: 'DP',
    mentorInitials: 'T2',
    avatarStyle: 'secondary',
  },
  {
    id: 'k9',
    studentId: 'Mentee-B19',
    column: 'Verified Pass',
    tagRight: 'PASSED TEST',
    description: 'MergeSort In-Place Auxiliary Array',
    category: 'Algorithms',
    mentorInitials: 'A3',
    avatarStyle: 'gradient',
  },
  {
    id: 'k10',
    studentId: 'Mentee-H50',
    column: 'Verified Pass',
    tagRight: 'PASSED TEST',
    description: 'HashMap Open Addressing Collisions',
    category: 'Hashing',
    mentorInitials: 'P6',
    avatarStyle: 'tertiary',
  },
  {
    id: 'k11',
    studentId: 'Mentee-P08',
    column: 'Verified Pass',
    tagRight: 'PASSED TEST',
    description: 'Trie String Prefix Lookups',
    category: 'Strings',
    mentorInitials: 'V8',
    avatarStyle: 'gradient',
  },
  {
    id: 'k12',
    studentId: 'Mentee-X82',
    column: 'Verified Pass',
    tagRight: 'PASSED TEST',
    description: "Topological Sorting with Kahn's Algo",
    category: 'DAG',
    mentorInitials: 'K4',
    avatarStyle: 'gradient',
  },
];

export const INITIAL_CHAT_MESSAGES: ChatMessage[] = [
  {
    id: 'c1',
    sender: 'mentee',
    label: 'MENTEE · RECURSIVE FIBONACCI',
    text: 'My recursive Fibonacci method keeps hitting a StackOverflowError when n gets above 40. Can you give me the base case code?',
    timestamp: '13:41',
  },
  {
    id: 'c2',
    sender: 'ai',
    label: 'SOCRATIC AI AGENT',
    text: "I can't write the base case for you, but let's look at what happens when n reaches 0 or 1. What value should fib(0) return?",
    timestamp: '13:41',
  },
  {
    id: 'c3',
    sender: 'mentee',
    label: 'MENTEE',
    text: 'It should return 0, because the sequence starts with 0 and 1.',
    timestamp: '13:42',
  },
  {
    id: 'c4',
    sender: 'ai',
    label: 'SOCRATIC AI AGENT',
    text: 'Spot on. Now, what does your recursive step do after checking those base conditions? Are you making the problem smaller?',
    timestamp: '13:43',
  },
  {
    id: 'c5',
    sender: 'mentee',
    label: 'MENTEE',
    text: "I am calling fib(n-1) + fib(n-2), but I forgot to memoize the results, so it's recalculating the same subtree millions of times.",
    timestamp: '13:44',
  },
];

export const SAMPLE_BUG_PRESETS: SampleBugPreset[] = [
  {
    id: 'factorial-neg',
    label: 'Recursion: Negative Factorial Overflow',
    course: 'Algorithms (Java) - IF101',
    topicDomain: 'Recursion',
    moduleCategory: 'Recursion',
    fileName: 'FactorialCalculator.java',
    methodName: 'compute(int n)',
    rawCode: `// Author: Alicia Lin <alin@cs.inst.edu>
// Student ID: SID-904128
// Path: /Users/alicia/if101/lab4/FactorialCalculator.java
public class FactorialCalculator {
    public static int compute(int n) {
        // Missing base case check: negative recursion hazard
        if (n == 0) return 1;
        return n * compute(n - 1);
    }
}`,
    faultLine: 8,
    faultSummary: 'Unbounded recursion on negative integers (n < 0)',
    stackTrace: [
      'java.lang.StackOverflowError',
      'at FactorialCalculator.compute(FactorialCalculator.java:8)',
      'at FactorialCalculator.compute(FactorialCalculator.java:8)',
      'at FactorialCalculator.compute(FactorialCalculator.java:8)',
    ],
    testVector: 'compute(-1) -> compute(-2) -> compute(-3)',
    hypothesis:
      'I added a base case for n == 0 earlier, but when running unit tests with negative inputs like compute(-1), it triggers an infinite recursive call stack.',
  },
  {
    id: 'bsearch-bounds',
    label: 'Arrays: Binary Search Stalled Midpoint',
    course: 'Algorithms (Java) - IF101',
    topicDomain: 'Arrays & Sliding Window',
    moduleCategory: 'Arrays',
    fileName: 'BinarySearchBound.java',
    methodName: 'search(int[] nums, int key)',
    rawCode: `// Author: Devon Park <dpark@cs.inst.edu>
// NetID: dpark22
// Path: /Users/devon/workspace/BinarySearchBound.java
public class BinarySearchBound {
    public static int search(int[] nums, int key) {
        int lo = 0, hi = nums.length - 1;
        while (lo < hi) {
            int mid = (lo + hi) / 2;
            if (nums[mid] < key) lo = mid;
            else hi = mid;
        }
        return nums[lo] == key ? lo : -1;
    }
}`,
    faultLine: 9,
    faultSummary: 'lo = mid fails to advance on 2-element subrange',
    stackTrace: [
      'java.util.concurrent.TimeoutException: Loop did not terminate within 2000ms',
      'at BinarySearchBound.search(BinarySearchBound.java:9)',
    ],
    testVector: 'search(new int[]{3, 7}, 7)',
    hypothesis:
      'Tested on 5-element arrays and it found targets in the left half, but searching for the last element hangs indefinitely.',
  },
  {
    id: 'mergesort-range',
    label: 'Sorting: MergeSort Out-of-Bounds Read',
    course: 'Data Structures - CS102',
    topicDomain: 'Divide & Conquer Sorting',
    moduleCategory: 'Sorting',
    fileName: 'MergeHelper.java',
    methodName: 'mergeRange(int[] a, int lo, int mid, int hi)',
    rawCode: `// Author: Priya Nair <pnair@cs.inst.edu>
// Path: /Users/priya/cs102/MergeHelper.java
public class MergeHelper {
    public static void mergeRange(int[] a, int[] aux, int lo, int mid, int hi) {
        int i = lo, j = mid + 1;
        for (int k = lo; k <= hi; k++) {
            if (aux[j] < aux[i]) a[k] = aux[j++];
            else a[k] = aux[i++];
        }
    }
}`,
    faultLine: 7,
    faultSummary: 'Missing subarray exhaustion check before reading aux[i] or aux[j]',
    stackTrace: [
      'java.lang.ArrayIndexOutOfBoundsException: Index 4 out of bounds for length 4',
      'at MergeHelper.mergeRange(MergeHelper.java:7)',
    ],
    testVector: 'mergeRange([2, 4, 1, 3], aux, 0, 1, 3)',
    hypothesis:
      'I compared aux[j] and aux[i] directly inside the loop, assuming both pointers stay inside their bounds until the loop ends.',
  },
];

export const INITIAL_MILESTONES: CurriculumMilestone[] = [
  {
    id: 'm1',
    code: 'M1',
    title: 'M1: Basic Syntax & Types',
    subtitle: 'Module IF101-A · Primitive Types, Memory Model',
    status: 'Completed',
    activeStudents: 338,
    avgTurns: 2.1,
    guardrailFlagPct: 1.2,
  },
  {
    id: 'm2',
    code: 'M2',
    title: 'M2: Control Flow & Loops',
    subtitle: 'Module IF101-B · While/For Invariants, Branching',
    status: 'Completed',
    activeStudents: 325,
    avgTurns: 3.4,
    guardrailFlagPct: 2.8,
  },
  {
    id: 'm3',
    code: 'M3',
    title: 'M3: Methods & Scope',
    subtitle: 'Module IF101-C · Stack Frames, Pass-by-Value',
    status: 'Active',
    activeStudents: 310,
    avgTurns: 4.8,
    guardrailFlagPct: 3.1,
  },
  {
    id: 'm4',
    code: 'M4',
    title: 'M4: Recursion & Base Cases',
    subtitle: 'Module IF101-D · Divide & Conquer, Inductive Proof',
    status: 'Upcoming',
    activeStudents: 0,
    avgTurns: 0.0,
    guardrailFlagPct: 0.0,
  },
];

export const INITIAL_MENTORS: MentorCandidate[] = [
  {
    id: '8841',
    code: 'M-8841',
    name: 'Marcus Brody',
    initials: 'MB',
    year: 'CS Junior',
    status: 'Pending Review',
    javaProficiency: 'A Grade (IF101)',
    socraticTraining: 'Completed Nov 20',
    avatarUrl: ASSETS.marcusBrodyAvatar,
  },
  {
    id: '8832',
    code: 'M-8832',
    name: 'Elena Rostova',
    initials: 'ER',
    year: 'CS Senior',
    status: 'Verified',
    javaProficiency: 'A+ Grade (IF101)',
    socraticTraining: 'Completed Nov 15',
    avatarUrl: ASSETS.elenaRostovaAvatar,
  },
  {
    id: '8839',
    code: 'M-8839',
    name: 'Darius Chen',
    initials: 'DC',
    year: 'CS Junior',
    status: 'Verified',
    javaProficiency: 'A Grade (IF101)',
    socraticTraining: 'Completed Nov 18',
    avatarUrl: ASSETS.dariusChenAvatar,
  },
  {
    id: '8850',
    code: 'M-8850',
    name: 'Aisha Patel',
    initials: 'AP',
    year: 'CS Sophomore',
    status: 'Flagged',
    javaProficiency: 'B+ Grade (IF101)',
    socraticTraining: 'Incomplete Nov 22',
  },
];

export const INITIAL_GUARDRAIL_CONFIG: GuardrailConfig = {
  regexRedactionEnabled: true,
  regexPattern: '/public|private.*\\{.*\\}/s',
  maxConcurrentSessions: 3,
  autoEscalationTurns: 6,
};

export const INITIAL_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: 'aud-1',
    timestamp: '13:44:10',
    actor: 'Guardrail #2',
    action: 'Intercepted Code Leakage',
    detail: 'Blocked "return 1;" in mentor draft for Ticket #T-104.',
    severity: 'warning',
  },
  {
    id: 'aud-2',
    timestamp: '13:38:22',
    actor: 'Regex Engine',
    action: 'PII Scrubbed (3 tokens)',
    detail: 'Redacted campus email, student name, and /Users path for Mentee-A42.',
    severity: 'success',
  },
  {
    id: 'aud-3',
    timestamp: '13:15:04',
    actor: 'Dr. Vance',
    action: 'Credential Verified',
    detail: 'Issued IF101 Peer Mentor badge to Elena Rostova (M-8832).',
    severity: 'info',
  },
  {
    id: 'aud-4',
    timestamp: '12:51:49',
    actor: 'Mentor-A03',
    action: 'Ticket Closed',
    detail: 'Mentee-B19 marked MergeSortAux.java Fully Unblocked (5.0 / 5.0).',
    severity: 'success',
  },
];
