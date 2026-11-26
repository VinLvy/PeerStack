import { describe, expect, it } from "vitest";
import { checkGuardrail } from "../guardrail";
import { runSimulatedPipeline } from "../mock-ai";
import { HERO_SAMPLE_TICKET_INPUT } from "../mock-data";

describe("checkGuardrail() deterministic integrity guardrail", () => {
  it("blocks empty hint text", () => {
    const res = checkGuardrail("   ");
    expect(res.verdict).toBe("block");
    expect(res.matchedRules).toContain("empty_hint");
  });

  it("blocks fenced markdown code blocks", () => {
    const res = checkGuardrail("Try writing this:\n```java\nreturn 1;\n```");
    expect(res.verdict).toBe("block");
    expect(res.matchedRules).toContain("fenced_code_block");
  });

  it("blocks full public static Java method signatures with body", () => {
    const res = checkGuardrail(
      "Use public static int factorial(int n) { if (n <= 1) return 1; return n * factorial(n - 1); }"
    );
    expect(res.verdict).toBe("block");
    expect(res.matchedRules).toContain("java_method_signature");
  });

  it("blocks package-private Java method signatures with body", () => {
    const res = checkGuardrail("Replace your helper with int sum(int[] nums) { return 0; }");
    expect(res.verdict).toBe("block");
    expect(res.matchedRules).toContain("java_method_signature");
  });

  it("blocks direct factorial base-case return solution", () => {
    const res = checkGuardrail("Add if (n <= 1) return 1; at the top of factorial.");
    expect(res.verdict).toBe("block");
    expect(res.matchedRules).toContain("factorial_base_case_solution");
  });

  it("blocks generic conditional return solutions", () => {
    const res = checkGuardrail("Just write if (index >= arr.length) return 0; before accessing arr.");
    expect(res.verdict).toBe("block");
    expect(res.matchedRules).toContain("direct_if_return_solution");
  });

  it("blocks full for/while loop code blocks with braces", () => {
    const res = checkGuardrail("Use for (int i = 0; i < arr.length; i++) { total += arr[i]; }");
    expect(res.verdict).toBe("block");
    expect(res.matchedRules).toContain("java_loop_block");
  });

  it("blocks multi-line code containing more than 2 semicolon lines", () => {
    const res = checkGuardrail(
      "Line 1: int temp = arr[j];\nLine 2: arr[j] = arr[j + 1];\nLine 3: arr[j + 1] = temp;"
    );
    expect(res.verdict).toBe("block");
    expect(res.matchedRules).toContain("multi_line_semicolons");
  });

  it("flags 2 or more long inline code spans over 35 characters", () => {
    const res = checkGuardrail(
      "Compare `int mid = low + (high - low) / 2; // check bounds` with `while (low <= high && target != arr[mid])`."
    );
    expect(res.verdict).toBe("flag");
    expect(res.matchedRules).toContain("multiple_long_inline_code_spans");
  });

  it("passes when there is only 1 long inline code span", () => {
    const res = checkGuardrail(
      "Look at `for (int i = 0; i <= scores.length; i++)` and ask what happens on the last step."
    );
    expect(res.verdict).toBe("pass");
    expect(res.matchedRules).toEqual([]);
  });

  it("passes legitimate Socratic hints with short inline code references", () => {
    const res = checkGuardrail(
      "Trace `factorial(5)` down to `factorial(1)` and `factorial(0)`. What value should stop the recursion?"
    );
    expect(res.verdict).toBe("pass");
    expect(res.reason).toContain("Passed");
  });

  it("passes the simulated Hero FactorialDemo Socratic hints", () => {
    const pipeline = runSimulatedPipeline({
      topic_id: HERO_SAMPLE_TICKET_INPUT.topic_id,
      topic_name: "Recursion",
      code: HERO_SAMPLE_TICKET_INPUT.code,
      error_log: HERO_SAMPLE_TICKET_INPUT.error_log,
      description: HERO_SAMPLE_TICKET_INPUT.description,
    });
    expect(pipeline.guardrail_1.verdict).toBe("pass");
    expect(checkGuardrail(`${pipeline.hint_1}\n\n${pipeline.hint_2}`).verdict).toBe("pass");
  });
});
