import React, { useState } from 'react';
import { Check, Copy } from 'lucide-react';

interface JavaCodeBlockProps {
  code: string;
  fileName: string;
  faultLine?: number;
  faultBadge?: string;
  versionBadge?: string;
  footerLeft?: string;
  footerRight?: string;
  showCopy?: boolean;
  compact?: boolean;
}

const JAVA_KEYWORDS = new Set([
  'public',
  'private',
  'protected',
  'class',
  'static',
  'void',
  'int',
  'long',
  'boolean',
  'if',
  'else',
  'while',
  'for',
  'return',
  'new',
  'throw',
]);

function renderHighlightedLine(line: string) {
  const trimmed = line.trim();
  if (trimmed.startsWith('//')) {
    const isFlag = trimmed.includes('HAZARD') || trimmed.includes('FLAGGED') || trimmed.includes('Missing');
    return (
      <span className={isFlag ? 'text-rose-300 italic' : 'text-slate-400 italic'}>
        {line}
      </span>
    );
  }

  const tokens = line.split(/(\s+|[(){}[\].,;=<>*+-])/g);
  return tokens.map((token, idx) => {
    if (!token) return null;
    if (JAVA_KEYWORDS.has(token)) {
      return (
        <span key={idx} className="text-violet-300 font-medium">
          {token}
        </span>
      );
    }
    if (/^\d+$/.test(token)) {
      return (
        <span key={idx} className="text-emerald-300">
          {token}
        </span>
      );
    }
    if (
      token === 'FactorialCalculator' ||
      token === 'RecursionLab' ||
      token === 'RecursiveFactorial' ||
      token === 'BinarySearchLab' ||
      token === 'BinarySearchBound' ||
      token === 'MergeSortAux' ||
      token === 'MergeHelper' ||
      token === 'NodeList' ||
      token === 'Node'
    ) {
      return (
        <span key={idx} className="text-amber-300">
          {token}
        </span>
      );
    }
    if (
      token === 'compute' ||
      token === 'calculateFactorial' ||
      token === 'findIndex' ||
      token === 'search' ||
      token === 'merge' ||
      token === 'mergeRange' ||
      token === 'insertTail'
    ) {
      return (
        <span key={idx} className="text-sky-300">
          {token}
        </span>
      );
    }
    return <span key={idx}>{token}</span>;
  });
}

export const JavaCodeBlock: React.FC<JavaCodeBlockProps> = ({
  code,
  fileName,
  faultLine,
  faultBadge,
  versionBadge = 'JAVA 21',
  footerLeft,
  footerRight,
  showCopy = true,
  compact = false,
}) => {
  const [copied, setCopied] = useState(false);
  const lines = code.split('\n');

  const handleCopy = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(code).catch(() => {});
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="w-full bg-[#0F172A] rounded-2xl overflow-hidden shadow-lg text-slate-100 border border-slate-800/80">
      <div className="bg-[#1E293B] px-4 py-2.5 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="flex items-center gap-1.5 shrink-0" aria-hidden="true">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500/90" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400/90" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400/90" />
          </div>
          <span className="font-mono text-xs text-slate-200 font-medium truncate ml-1">
            {fileName}
          </span>
          <span className="px-1.5 py-0.5 rounded bg-[#0F172A] text-slate-300 font-mono text-[10px] font-semibold shrink-0">
            {versionBadge}
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {faultBadge && (
            <span className="hidden sm:inline-flex items-center gap-1 font-mono text-[10px] font-semibold text-rose-300 bg-rose-950/70 px-2 py-0.5 rounded">
              {faultBadge}
            </span>
          )}
          {showCopy && (
            <button
              type="button"
              onClick={handleCopy}
              aria-label="Copy Java source code"
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-[11px] transition-colors whitespace-nowrap shrink-0"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-300">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      <div
        className={`${
          compact ? 'p-3 text-[12px]' : 'p-4 text-[13px]'
        } font-mono leading-relaxed overflow-x-auto select-text`}
      >
        <div className="min-w-fit">
          {lines.map((line, i) => {
            const lineNum = i + 1;
            const isFault = faultLine === lineNum;
            return (
              <div
                key={lineNum}
                className={`flex items-start px-2 -mx-2 rounded ${
                  isFault ? 'bg-rose-500/20 text-rose-100' : ''
                }`}
              >
                <span
                  className={`w-7 shrink-0 select-none text-right pr-3 tabular-nums ${
                    isFault ? 'text-rose-400 font-bold' : 'text-slate-500'
                  }`}
                >
                  {String(lineNum).padStart(2, '0')}
                </span>
                <pre className="whitespace-pre font-mono flex-1">{renderHighlightedLine(line)}</pre>
              </div>
            );
          })}
        </div>
      </div>

      {(footerLeft || footerRight) && (
        <div className="bg-[#131E35] px-4 py-2 flex flex-wrap items-center justify-between gap-2 text-slate-400 font-mono text-[11px] border-t border-slate-800/80">
          <span>{footerLeft}</span>
          <span>{footerRight}</span>
        </div>
      )}
    </div>
  );
};
