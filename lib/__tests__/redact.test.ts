import { describe, expect, it } from "vitest";
import { redact } from "../redact";
import { HERO_SAMPLE_TICKET_INPUT } from "../mock-data";

describe("redact() deterministic PII and secret sanitizer", () => {
  it("strips email addresses", () => {
    const res = redact("Contact me at student.a42@campus.ac.id for help.");
    expect(res.sanitizedText).toBe("Contact me at [REDACTED_EMAIL] for help.");
    expect(res.redactionsCount).toBe(1);
    expect(res.redactedTypes).toContain("EMAIL");
  });

  it("strips explicit NIM and Student ID labels", () => {
    const res = redact("// NIM: 24010099 and Student ID: 230912345");
    expect(res.sanitizedText).toBe("// [REDACTED_STUDENT_ID] and [REDACTED_STUDENT_ID]");
    expect(res.redactionsCount).toBe(2);
    expect(res.redactedTypes).toContain("STUDENT_ID");
  });

  it("strips standalone 8-10 digit campus IDs without breaking small numbers", () => {
    const res = redact("My ID 24010099 failed on array size 10 and index 5.");
    expect(res.sanitizedText).toBe("My ID [REDACTED_STUDENT_ID] failed on array size 10 and index 5.");
    expect(res.redactionsCount).toBe(1);
  });

  it("strips Author name comments before pipe or newline", () => {
    const res = redact("// Author: Budi Santoso | Topic: Recursion\n// Author: Andi Wijaya");
    expect(res.sanitizedText).toBe("// Author: [REDACTED_NAME] | Topic: Recursion\n// Author: [REDACTED_NAME]");
    expect(res.redactionsCount).toBe(2);
    expect(res.redactedTypes).toContain("NAME");
  });

  it("strips Indonesian +62 and 08 phone numbers", () => {
    const res = redact("WA +62 812-3456-7890 or 081234567890");
    expect(res.sanitizedText).toBe("WA [REDACTED_PHONE] or [REDACTED_PHONE]");
    expect(res.redactionsCount).toBe(2);
    expect(res.redactedTypes).toContain("PHONE");
  });

  it("strips Google API keys cleanly without splitting embedded digits", () => {
    const res = redact("key = AIzaSyFakeKeyForDemo1234567890123456789");
    expect(res.sanitizedText).toBe("key = [REDACTED_API_KEY]");
    expect(res.redactionsCount).toBe(1);
    expect(res.redactedTypes).toEqual(["API_KEY"]);
  });

  it("strips generic api_key, secret, token, and password assignments", () => {
    const res = redact('String token = "tok_live_987654";\npassword: myPass123\napi_key=abc12345');
    expect(res.sanitizedText).toBe("String token=[REDACTED_SECRET];\npassword=[REDACTED_SECRET]\napi_key=[REDACTED_SECRET]");
    expect(res.redactionsCount).toBe(3);
    expect(res.redactedTypes).toContain("SECRET");
  });

  it("strips Linux, macOS, and Windows user home file paths", () => {
    const res = redact(
      "Compiled from /home/budi/algo/Main.java, /Users/alvin/Desktop/Sort.java, and C:\\Users\\davin\\code\\Test.java"
    );
    expect(res.sanitizedText).toBe(
      "Compiled from [REDACTED_PATH], [REDACTED_PATH], and [REDACTED_PATH]"
    );
    expect(res.redactionsCount).toBe(3);
    expect(res.redactedTypes).toContain("PATH");
  });

  it("redacts non-java stack trace package prefixes while keeping class, method, file, and line", () => {
    const trace = "    at id.ac.ubhi.budi.FactorialDemo.factorial(FactorialDemo.java:5)";
    const res = redact(trace);
    expect(res.sanitizedText).toBe(
      "    at [REDACTED_PACKAGE].FactorialDemo.factorial(FactorialDemo.java:5)"
    );
    expect(res.redactionsCount).toBe(1);
    expect(res.redactedTypes).toContain("PACKAGE");
  });

  it("preserves java.* and javax.* stack trace frames", () => {
    const trace = [
      "Exception in thread \"main\" java.lang.NullPointerException",
      "    at java.base/java.util.Scanner.nextInt(Scanner.java:2167)",
      "    at java.lang.Thread.run(Thread.java:833)",
      "    at javax.swing.JPanel.paint(JPanel.java:42)",
    ].join("\n");
    const res = redact(trace);
    expect(res.sanitizedText).toBe(trace);
    expect(res.redactionsCount).toBe(0);
    expect(res.redactedTypes).toEqual([]);
  });

  it("preserves default-package stack traces like FactorialDemo.factorial", () => {
    const res = redact(HERO_SAMPLE_TICKET_INPUT.error_log);
    expect(res.sanitizedText).toBe(HERO_SAMPLE_TICKET_INPUT.error_log);
    expect(res.redactionsCount).toBe(0);
  });

  it("sanitizes the complete Hero Java bug sample completely", () => {
    const res = redact(HERO_SAMPLE_TICKET_INPUT.code);
    expect(res.redactionsCount).toBe(4);
    expect(res.sanitizedText).not.toContain("Budi Santoso");
    expect(res.sanitizedText).not.toContain("24010099");
    expect(res.sanitizedText).not.toContain("budi.demo@example.com");
    expect(res.sanitizedText).not.toContain("AIzaSyFakeKeyForDemo1234567890123456789");
    expect(res.sanitizedText).toContain("[REDACTED_NAME]");
    expect(res.sanitizedText).toContain("[REDACTED_STUDENT_ID]");
    expect(res.sanitizedText).toContain("[REDACTED_EMAIL]");
    expect(res.sanitizedText).toContain("[REDACTED_API_KEY]");
    expect(res.sanitizedText).toContain("public static int factorial(int n)");
  });

  it("leaves ordinary Java code completely unchanged", () => {
    const javaCode = `public class LoopCheck {
    public static int sum(int[] arr) {
        int total = 0;
        for (int i = 0; i < arr.length; i++) {
            total += arr[i];
        }
        return total;
    }
}`;
    const res = redact(javaCode);
    expect(res.sanitizedText).toBe(javaCode);
    expect(res.redactionsCount).toBe(0);
    expect(res.redactedTypes).toEqual([]);
  });

  it("handles empty strings safely", () => {
    const res = redact("");
    expect(res).toEqual({ sanitizedText: "", redactionsCount: 0, redactedTypes: [] });
  });

  it("handles mixed PII and Java code in a single description", () => {
    const input =
      "I am Student ID: 24010088 (email test@ubhi.ac.id, phone 081398765432). Error in C:\\Users\\budi\\Lab1.java when n = 100.";
    const res = redact(input);
    expect(res.redactionsCount).toBe(4);
    expect(res.sanitizedText).toBe(
      "I am [REDACTED_STUDENT_ID] (email [REDACTED_EMAIL], phone [REDACTED_PHONE]). Error in [REDACTED_PATH] when n = 100."
    );
  });
});
