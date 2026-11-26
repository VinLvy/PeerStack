import { checkGuardrail } from "./guardrail";
import { redact } from "./redact";
import type { GuardrailResult } from "./types";

export interface SimulatedPipelineOutput {
  code_sanitized: string;
  error_log_sanitized: string;
  description_sanitized: string;
  redactions_count: number;
  redacted_types: string[];
  triage_summary: string;
  highlighted_lines: number[];
  similar_ticket_note: string;
  hint_1: string;
  hint_2: string;
  guardrail_1: GuardrailResult;
}

const TOPIC_HINTS: Record<
  string,
  {
    triage: string;
    similar: string;
    hint_1: string;
    hint_2: string;
  }
> = {
  recursion: {
    triage:
      "Simulated Triage: Recursive call pattern detected without an evident stopping condition or base-case check.",
    similar:
      "Simulated: 1 similar past ticket found in IF101 (Recursion - missing base case).",
    hint_1:
      "Trace the recursive calls on paper with a small input (like 3 or 2). When does the method stop calling itself?",
    hint_2:
      "Check the top of your recursive method. Every recursive function needs a base case that returns a known value before calling itself on a smaller input.",
  },
  loops: {
    triage:
      "Simulated Triage: Loop termination condition or counter update may be preventing normal exit.",
    similar:
      "Simulated: 1 similar past ticket found in IF101 (Loops - loop bound or update check).",
    hint_1:
      "Write down the loop variable value before the loop starts and after the first two iterations. Does it always move closer to the stopping condition?",
    hint_2:
      "Inspect your loop header and the last line inside the loop braces. Verify whether the boundary operator (< vs <=) or counter update matches your intended iteration count.",
  },
  arrays: {
    triage:
      "Simulated Triage: Array indexing expression likely steps outside valid bounds (0 to array.length - 1).",
    similar:
      "Simulated: 1 similar past ticket found in IF101 (Arrays - 0-based index bounds).",
    hint_1:
      "If a Java array has length N, what are the indices of its very first and very last elements?",
    hint_2:
      "Check the upper bound of your index variable against array.length. Make sure you do not read or write at index array.length.",
  },
  sorting: {
    triage:
      "Simulated Triage: Element comparison or swap sequence may overwrite a value before preserving it.",
    similar:
      "Simulated: 1 similar past ticket found in IF101 (Sorting - temporary swap variable / bounds).",
    hint_1:
      "Trace what happens to both adjacent elements during a swap if you assign the first element directly over the second.",
    hint_2:
      "Walk through your swap lines with concrete numbers like [8, 3]. Check whether you preserve the original value before overwriting it, and check the inner loop upper bound.",
  },
  searching: {
    triage:
      "Simulated Triage: Search boundary update or mid-point check may skip the target or loop infinitely.",
    similar:
      "Simulated: 1 similar past ticket found in IF101 (Searching - boundary update).",
    hint_1:
      "Test your search logic on a 3-element array when the target is at the first index, last index, or missing completely.",
    hint_2:
      "Check how your low and high bounds update after comparing with the middle element, and whether your loop condition handles a 1-element remaining range.",
  },
  "basic-complexity": {
    triage:
      "Simulated Triage: Nested iteration structure affects how operations scale with input size N.",
    similar:
      "Simulated: 1 similar past ticket found in IF101 (Basic Complexity - nested loop growth).",
    hint_1:
      "Count how many times the innermost line executes when N doubles from 10 to 20.",
    hint_2:
      "Look at how the inner loop limit depends on N. Check whether each outer pass triggers a constant amount of work or another full scan over N.",
  },
};

function detectInterestingLines(code: string): number[] {
  const lines = code.split(/\r?\n/);
  const hits: number[] = [];
  lines.forEach((line, idx) => {
    const trimmed = line.trim();
    if (
      /factorial\s*\(|for\s*\(|while\s*\(|if\s*\(|return\s+/.test(trimmed) &&
      hits.length < 3
    ) {
      hits.push(idx + 1);
    }
  });
  return hits.length > 0 ? hits : [1];
}

export function runSimulatedPipeline(params: {
  topic_id: string;
  topic_name: string;
  code: string;
  error_log: string;
  description: string;
}): SimulatedPipelineOutput {
  const codeRes = redact(params.code);
  const errorRes = redact(params.error_log);
  const descRes = redact(params.description);

  const combinedTypes = Array.from(
    new Set([...codeRes.redactedTypes, ...errorRes.redactedTypes, ...descRes.redactedTypes])
  );
  const redactionsCount =
    codeRes.redactionsCount + errorRes.redactionsCount + descRes.redactionsCount;

  const isHeroFactorial =
    /FactorialDemo/.test(codeRes.sanitizedText) ||
    /factorial\s*\(\s*n\s*-\s*1\s*\)/.test(codeRes.sanitizedText);

  let triage_summary: string;
  let highlighted_lines: number[];
  let similar_ticket_note: string;
  let hint_1: string;
  let hint_2: string;

  if (isHeroFactorial) {
    triage_summary =
      "Simulated Triage: Topic Recursion confirmed. Lines 4-6 show factorial(n) calling factorial(n - 1) unconditionally, causing StackOverflowError.";
    highlighted_lines = [4, 5, 6];
    similar_ticket_note =
      "Simulated: 1 similar past ticket found in IF101 (Recursion - FactorialDemo missing base case).";
    hint_1 =
      "Trace factorial(5) step by step on paper: what values of n get passed into factorial(n - 1) after n reaches 1 and 0? When does the method stop calling itself?";
    hint_2 =
      "Look closely at lines 4-6. Every recursive method in our Algorithms syllabus needs a stopping condition (base case) before making the recursive call. What should factorial(0) or factorial(1) return?";
  } else {
    const preset = TOPIC_HINTS[params.topic_id] ?? TOPIC_HINTS.recursion;
    triage_summary = `${preset.triage} (Topic: ${params.topic_name})`;
    highlighted_lines = detectInterestingLines(codeRes.sanitizedText);
    similar_ticket_note = preset.similar;
    hint_1 = preset.hint_1;
    hint_2 = preset.hint_2;
  }

  const guardrail_1 = checkGuardrail(`${hint_1}\n\n${hint_2}`);

  return {
    code_sanitized: codeRes.sanitizedText,
    error_log_sanitized: errorRes.sanitizedText,
    description_sanitized: descRes.sanitizedText,
    redactions_count: redactionsCount,
    redacted_types: combinedTypes,
    triage_summary,
    highlighted_lines,
    similar_ticket_note,
    hint_1,
    hint_2,
    guardrail_1,
  };
}
