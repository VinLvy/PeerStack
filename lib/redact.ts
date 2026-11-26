import type { RedactionResult } from "./types";

/**
 * Deterministic client-side PII and secret redaction for Java help tickets.
 * Runs in-browser before any simulated or production AI step receives ticket text.
 */
export function redact(input: string): RedactionResult {
  if (!input) {
    return {
      sanitizedText: "",
      redactionsCount: 0,
      redactedTypes: [],
    };
  }

  let text = input;
  let redactionsCount = 0;
  const typesFound = new Set<string>();

  const applyReplace = (
    pattern: RegExp,
    replacer: string | ((...args: string[]) => string),
    typeLabel: string
  ) => {
    let matchedInRule = false;
    text = text.replace(pattern, (...args) => {
      const fullMatch = args[0] as string;
      const replaced =
        typeof replacer === "function"
          ? replacer(...(args as string[]))
          : replacer.replace(/\$(\d+)/g, (_, idx) => {
              const groupIndex = Number(idx);
              return typeof args[groupIndex] === "string" ? args[groupIndex] : "";
            });
      if (replaced !== fullMatch) {
        redactionsCount += 1;
        matchedInRule = true;
      }
      return replaced;
    });
    if (matchedInRule) {
      typesFound.add(typeLabel);
    }
  };

  // 1. Google API keys first so embedded digit sequences are not split by ID rules.
  applyReplace(/\bAIza[0-9A-Za-z_-]{20,}\b/g, "[REDACTED_API_KEY]", "API_KEY");

  // 2. Explicit secret/key/token/password assignments (avoid re-matching already redacted tokens).
  applyReplace(
    /\b(api[_-]?key|secret|token|password)\b\s*[:=]\s*(?!\[REDACTED_)(?:"[^"\r\n]*"|'[^'\r\n]*'|[^\s,;]+)/gi,
    "$1=[REDACTED_SECRET]",
    "SECRET"
  );

  // 3. Email addresses.
  applyReplace(
    /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g,
    "[REDACTED_EMAIL]",
    "EMAIL"
  );

  // 4. Author / Name comments (stops cleanly before pipe, comma, semicolon, or newline).
  applyReplace(
    /(\bAuthor\s*:\s*)(?!\[REDACTED_)([A-Za-z][A-Za-z .'-]{0,60}?)(?=\s*(?:\||$|[\r\n,;]))/gi,
    "$1[REDACTED_NAME]",
    "NAME"
  );

  // 5. Indonesian phone numbers (+62... / 08...) before standalone numeric campus IDs.
  applyReplace(
    /(?<!\w)(?:\+62[\s-]?|0)8(?:[\s-]?\d){7,12}(?!\d)/g,
    "[REDACTED_PHONE]",
    "PHONE"
  );

  // 6. Explicit NIM / Student ID labels and standalone 8-10 digit campus ID patterns.
  applyReplace(
    /\b(?:NIM|Student\s*ID)\s*[:=#]?\s*\d{6,12}\b/gi,
    "[REDACTED_STUDENT_ID]",
    "STUDENT_ID"
  );
  applyReplace(
    /(?<![A-Za-z0-9_])\d{8,10}(?![A-Za-z0-9_])/g,
    "[REDACTED_STUDENT_ID]",
    "STUDENT_ID"
  );

  // 7. OS file paths (/home/<user>/, /Users/<user>/, C:\Users\<user>\).
  applyReplace(
    /(?:\/(?:home|Users)\/[A-Za-z0-9._-]+(?:\/[^\s,"';:)]*)?|[A-Za-z]:\\Users\\[A-Za-z0-9._-]+(?:\\[^\s,"';:)]*)?)/g,
    "[REDACTED_PATH]",
    "PATH"
  );

  // 8. Non-standard Java stack trace package prefixes (preserve java.* and javax.* frames).
  applyReplace(
    /^(\s*at\s+)((?:[a-z0-9_]+\/)+)?((?:[A-Za-z_$][\w$]*\.)+)([A-Za-z_$][\w$]*\.[A-Za-z_$<>][\w$]*\([^)\r\n]+\))/gm,
    (fullMatch, atPrefix, modulePrefix, pkgPrefix, classMethodAndLoc) => {
      const normalizedPkg = pkgPrefix ?? "";
      const normalizedMod = modulePrefix ?? "";
      if (
        normalizedPkg.startsWith("java.") ||
        normalizedPkg.startsWith("javax.") ||
        normalizedMod.startsWith("java.") ||
        normalizedMod.startsWith("jdk.")
      ) {
        return fullMatch;
      }
      return `${atPrefix}[REDACTED_PACKAGE].${classMethodAndLoc}`;
    },
    "PACKAGE"
  );

  return {
    sanitizedText: text,
    redactionsCount,
    redactedTypes: Array.from(typesFound),
  };
}
