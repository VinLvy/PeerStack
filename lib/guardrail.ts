import type { GuardrailResult } from "./types";

/**
 * Deterministic rule-based Integrity Guardrail.
 * Heuristic check (not a formal proof) applied to both simulated AI drafts and mentor edits.
 */
export function checkGuardrail(text: string): GuardrailResult {
  const normalized = text.trim();
  if (!normalized) {
    return {
      verdict: "block",
      reason: "Hint text cannot be empty.",
      matchedRules: ["empty_hint"],
    };
  }

  const blockReasons: string[] = [];
  const matchedRules: string[] = [];

  // 1. Block fenced markdown code blocks.
  if (/```/.test(normalized)) {
    matchedRules.push("fenced_code_block");
    blockReasons.push("Contains a fenced code block (```).");
  }

  // 2. Block full Java method signatures with a body brace.
  if (
    /\b(?:public|private|protected)?\s*(?:static)?\s*(?:int|void|long|double|boolean|String|char|float)(?:\[\])?\s+\w+\s*\([^)]*\)\s*\{/.test(
      normalized
    )
  ) {
    matchedRules.push("java_method_signature");
    blockReasons.push("Contains a full Java method signature with body.");
  }

  // 3. Block complete base-case/solution return statements and full loop code blocks.
  if (/\bif\s*\(\s*n\s*<=\s*[01]\s*\)\s*\{?\s*return\s*1\b/.test(normalized)) {
    matchedRules.push("factorial_base_case_solution");
    blockReasons.push("Contains a direct factorial base-case solution (if (n <= 1) return 1).");
  } else if (/\bif\s*\([^)\r\n]{1,45}\)\s*\{?\s*return\s+[^;\r\n]{1,40};/.test(normalized)) {
    matchedRules.push("direct_if_return_solution");
    blockReasons.push("Contains a complete conditional return solution statement.");
  }

  if (/\b(?:for|while)\s*\([^)\r\n]+\)\s*\{/.test(normalized)) {
    matchedRules.push("java_loop_block");
    blockReasons.push("Contains a full Java loop block with body.");
  }

  // 4. Block multi-line replacement code (> 2 lines containing semicolons).
  const semicolonLines = normalized
    .split(/\r?\n/)
    .filter((line) => line.includes(";")).length;
  if (semicolonLines > 2) {
    matchedRules.push("multi_line_semicolons");
    blockReasons.push(`Contains ${semicolonLines} lines with semicolons (max 2 allowed).`);
  }

  if (blockReasons.length > 0) {
    return {
      verdict: "block",
      reason: `Blocked: ${blockReasons.join(" ")} Rewrite as a guiding Socratic question without full code.`,
      matchedRules,
    };
  }

  // 5. Flag 2 or more long inline code spans (> 35 chars).
  const inlineCodeMatches = Array.from(normalized.matchAll(/`([^`\r\n]+)`/g));
  const longSpans = inlineCodeMatches.filter((m) => m[1].trim().length > 35);
  if (longSpans.length >= 2) {
    return {
      verdict: "flag",
      reason: `Flagged: Contains ${longSpans.length} long inline code spans (>35 chars). Confirm this does not give away the full solution.`,
      matchedRules: ["multiple_long_inline_code_spans"],
    };
  }

  return {
    verdict: "pass",
    reason: "Passed - 0 full solutions detected.",
    matchedRules: [],
  };
}
