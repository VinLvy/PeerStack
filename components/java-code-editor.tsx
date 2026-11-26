"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";

const MONACO_LOAD_TIMEOUT_MS = 5000;

const MonacoEditor = dynamic(
  async () => {
    const [{ default: Editor, loader }, monaco] = await Promise.all([
      import("@monaco-editor/react"),
      import("monaco-editor"),
    ]);
    loader.config({ monaco });
    return Editor;
  },
  { ssr: false }
);

interface JavaCodeEditorProps {
  value: string;
  onChange?: (next: string) => void;
  readOnly?: boolean;
  highlightedLines?: number[];
  height?: string;
}

function FallbackLineNumberedEditor({
  value,
  onChange,
  readOnly,
  highlightedLines = [],
  height = "260px",
}: JavaCodeEditorProps) {
  const lines = value.split("\n");
  const highlightSet = new Set(highlightedLines);

  if (readOnly) {
    return (
      <div
        className="rounded-lg border border-slate-700 bg-[#0F172A] text-slate-100 font-mono text-sm overflow-auto"
        style={{ minHeight: height, maxHeight: "420px" }}
      >
        <div className="py-3">
          {lines.map((line, index) => {
            const lineNum = index + 1;
            const isHighlighted = highlightSet.has(lineNum);
            return (
              <div
                key={lineNum}
                className={`flex px-3 py-0.5 ${
                  isHighlighted ? "bg-amber-500/20 border-l-2 border-amber-400" : ""
                }`}
              >
                <span className="w-9 shrink-0 select-none text-right pr-3 text-slate-500">
                  {lineNum}
                </span>
                <pre className="whitespace-pre text-slate-100">{line || " "}</pre>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <textarea
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      spellCheck={false}
      aria-label="Java code editor"
      className="w-full rounded-lg border border-slate-700 bg-[#0F172A] text-slate-100 font-mono text-sm p-3 focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
      style={{ minHeight: height }}
    />
  );
}

export function JavaCodeEditor({
  value,
  onChange,
  readOnly = false,
  highlightedLines = [],
  height = "280px",
}: JavaCodeEditorProps) {
  const [useFallback, setUseFallback] = useState(false);
  const [monacoReady, setMonacoReady] = useState(false);

  useEffect(() => {
    if (useFallback || monacoReady) {
      return;
    }
    const timer = window.setTimeout(() => {
      setUseFallback(true);
    }, MONACO_LOAD_TIMEOUT_MS);

    return () => window.clearTimeout(timer);
  }, [useFallback, monacoReady]);

  if (useFallback) {
    return (
      <div className="space-y-1.5">
        <FallbackLineNumberedEditor
          value={value}
          onChange={onChange}
          readOnly={readOnly}
          highlightedLines={highlightedLines}
          height={height}
        />
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>
            Plain dark editor (fallback){highlightedLines.length > 0 ? ` | Focus lines: ${highlightedLines.join(", ")}` : ""}
          </span>
          <button
            type="button"
            onClick={() => {
              setMonacoReady(false);
              setUseFallback(false);
            }}
            className="text-slate-500 hover:text-slate-700 underline cursor-pointer"
          >
            Try Monaco editor
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      <div className="rounded-lg overflow-hidden border border-slate-700 bg-[#0F172A]">
        <MonacoEditor
          height={height}
          language="java"
          theme="vs-dark"
          value={value}
          onChange={(nextValue) => {
            if (!readOnly && onChange) {
              onChange(nextValue ?? "");
            }
          }}
          loading={
            <div className="p-4 text-sm text-slate-300 font-mono">
              Loading Java editor...
            </div>
          }
          onMount={(editor, monaco) => {
            setMonacoReady(true);
            if (highlightedLines.length > 0) {
              const decorations = highlightedLines.map((lineNumber) => ({
                range: new monaco.Range(lineNumber, 1, lineNumber, 1),
                options: {
                  isWholeLine: true,
                  className: "bg-amber-500/20",
                  glyphMarginClassName: "bg-amber-400",
                },
              }));
              editor.createDecorationsCollection(decorations);
            }
          }}
          options={{
            readOnly,
            minimap: { enabled: false },
            fontSize: 14,
            lineNumbers: "on",
            scrollBeyondLastLine: false,
            automaticLayout: true,
            wordWrap: "on",
            padding: { top: 12, bottom: 12 },
          }}
        />
      </div>
      <div className="flex items-center justify-between text-xs text-slate-500">
        <span>
          Language: Java (vs-dark){highlightedLines.length > 0 ? ` | Focus lines: ${highlightedLines.join(", ")}` : ""}
        </span>
        <button
          type="button"
          onClick={() => setUseFallback(true)}
          className="text-slate-500 hover:text-slate-700 underline cursor-pointer"
        >
          Switch to plain dark editor
        </button>
      </div>
    </div>
  );
}
