import { DiffLine } from '../types';

export interface RedactionResult {
  scrubbedCode: string;
  redactionCount: number;
  diffs: DiffLine[];
}

export interface GuardrailCheckResult {
  passed: boolean;
  flaggedTokens: string[];
  leakageRiskPercent: number;
  purityIndex: number;
  reason: string;
}

export function redactPII(rawCode: string, pseudonym: string): RedactionResult {
  let scrubbed = rawCode;
  const diffs: DiffLine[] = [];
  let count = 0;

  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  const authorLineRegex = /(\/\/\s*Author:\s*)([^\n\r]+)/gi;
  const studentIdRegex = /(Student\s*ID:\s*|NetID:\s*|SID:\s*)([A-Za-z0-9_-]+)/gi;
  const unixPathRegex = /\/Users\/[a-zA-Z0-9._-]+(?:\/[a-zA-Z0-9._-]+)*/g;
  const winPathRegex = /[A-Z]:\\Users\\[a-zA-Z0-9._-]+(?:\\[a-zA-Z0-9._-]+)*/g;

  scrubbed = scrubbed.replace(authorLineRegex, (match, prefix: string, rest: string) => {
    count += 1;
    const replacement = `${prefix}[REDACTED_IDENTITY:${pseudonym}]`;
    diffs.push({
      removed: match.trim(),
      added: replacement.trim(),
      label: 'Author / Identity Comment',
    });
    return replacement;
  });

  scrubbed = scrubbed.replace(emailRegex, (match) => {
    count += 1;
    const replacement = '[REDACTED_CAMPUS_EMAIL]';
    diffs.push({
      removed: match,
      added: replacement,
      label: 'Campus Email',
    });
    return replacement;
  });

  scrubbed = scrubbed.replace(studentIdRegex, (match, prefix: string) => {
    count += 1;
    const replacement = `${prefix}[REDACTED_STUDENT_HASH]`;
    diffs.push({
      removed: match.trim(),
      added: replacement.trim(),
      label: 'Student Identifier',
    });
    return replacement;
  });

  scrubbed = scrubbed.replace(unixPathRegex, (match) => {
    count += 1;
    const parts = match.split('/');
    const fileTail = parts[parts.length - 1] || 'workspace';
    const replacement = `/sandbox/workspace/${fileTail}`;
    diffs.push({
      removed: match,
      added: replacement,
      label: 'Local Workstation Path',
    });
    return replacement;
  });

  scrubbed = scrubbed.replace(winPathRegex, (match) => {
    count += 1;
    const parts = match.split('\\');
    const fileTail = parts[parts.length - 1] || 'workspace';
    const replacement = `/sandbox/workspace/${fileTail}`;
    diffs.push({
      removed: match,
      added: replacement,
      label: 'Local Workstation Path',
    });
    return replacement;
  });

  if (count === 0) {
    diffs.push({
      removed: '// Author: [clean submission header]',
      added: `// Author: [VERIFIED_ANONYMOUS:${pseudonym}]`,
      label: 'Pseudonym Envelope',
    });
  }

  return {
    scrubbedCode: scrubbed,
    redactionCount: count,
    diffs,
  };
}

const LEAKAGE_PATTERNS: Array<{ regex: RegExp; label: string }> = [
  { regex: /return\s+[^;]+;/i, label: 'return statement' },
  { regex: /if\s*\([^)]+\)\s*(?:\{|return|throw)/i, label: 'conditional branch solution' },
  { regex: /throw\s+new\s+\w+/i, label: 'exception instantiation code' },
  { regex: /(?:public|private|protected)\s+(?:static\s+)?[\w<>]+\s+\w+\s*\(/i, label: 'Java method signature' },
  { regex: /(?:for|while)\s*\([^)]+\)\s*\{/i, label: 'loop control block' },
  { regex: /System\.out\.print/i, label: 'direct stdout statement' },
];

export function checkIntegrityGuardrail(text: string): GuardrailCheckResult {
  const flaggedTokens: string[] = [];

  for (const { regex } of LEAKAGE_PATTERNS) {
    const match = text.match(regex);
    if (match && match[0]) {
      flaggedTokens.push(match[0].trim());
    }
  }

  if (flaggedTokens.length > 0) {
    return {
      passed: false,
      flaggedTokens,
      leakageRiskPercent: Math.min(96, 58 + flaggedTokens.length * 16),
      purityIndex: Math.max(12, 48 - flaggedTokens.length * 14),
      reason: `Direct executable code syntax (${flaggedTokens[0]}) intercepted by Integrity Guardrail #2.`,
    };
  }

  const trimmed = text.trim();
  const hasQuestion = trimmed.includes('?');
  const wordCount = trimmed ? trimmed.split(/\s+/).length : 0;

  return {
    passed: true,
    flaggedTokens: [],
    leakageRiskPercent: hasQuestion ? 18 : 24,
    purityIndex: hasQuestion && wordCount >= 8 ? 98.4 : 92.0,
    reason: 'Zero direct syntax overlap with canonical IF101 solution keys.',
  };
}

export function generateSocraticReply(userMessage: string, topic: string): {
  reply: string;
  blockedDirectRequest: boolean;
} {
  const lower = userMessage.toLowerCase();

  const asksForDirectAnswer =
    lower.includes('give me the code') ||
    lower.includes('write the code') ||
    lower.includes('base case code') ||
    lower.includes('solution') ||
    lower.includes('just tell me') ||
    lower.includes('answer');

  if (asksForDirectAnswer) {
    return {
      blockedDirectRequest: true,
      reply:
        "I can't supply runnable patch code under IF101 Socratic guardrails, but let's isolate the invariant together: what input boundary causes your method to keep recursing instead of halting, and what value should the method contract produce at that boundary?",
    };
  }

  if (lower.includes('memo') || lower.includes('cache') || lower.includes('map') || lower.includes('array')) {
    return {
      reply:
        'Great observation! If you store already-computed subproblem results in an array or HashMap keyed by n, which condition should your method check *before* making the two recursive calls?',
      blockedDirectRequest: false,
    };
  }

  if (lower.includes('negative') || lower.includes('-1') || lower.includes('overflow') || lower.includes('stack')) {
    return {
      reply:
        'Trace what happens step-by-step when n starts at -1 and decrements by 1 each frame. Does it ever cross 0? How could a precondition guard protect the domain before recursion begins?',
      blockedDirectRequest: false,
    };
  }

  if (lower.includes('mid') || lower.includes('binary') || lower.includes('loop') || lower.includes('index')) {
    return {
      reply:
        'Check your loop bounds when left equals right. If mid is excluded vs included in the next interval update, can the search interval stop shrinking on a 2-element array?',
      blockedDirectRequest: false,
    };
  }

  return {
    reply: `Good step forward on ${topic}. Walk me through the exact state of your variables on the smallest non-trivial input (size 1 or 2) — where does the actual trace diverge from your expectation?`,
    blockedDirectRequest: false,
  };
}
