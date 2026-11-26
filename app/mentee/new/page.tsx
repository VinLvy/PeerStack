"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Bug, Lock, Send, Sparkles } from "lucide-react";
import { useDemoStore } from "@/components/demo-store-provider";
import { JavaCodeEditor } from "@/components/java-code-editor";
import { PipelineStepper } from "@/components/pipeline-stepper";
import {
  DEMO_COURSE,
  DEMO_TOPICS,
  HERO_SAMPLE_TICKET_INPUT,
} from "@/lib/mock-data";
import { runSimulatedPipeline, type SimulatedPipelineOutput } from "@/lib/mock-ai";

const MIN_TRIED_LENGTH = 20;

export default function MenteeNewTicketPage() {
  const router = useRouter();
  const { state, setRole, toggleMenteeConsent, submitMenteeTicket } = useDemoStore();

  const [topicId, setTopicId] = useState<string>(DEMO_TOPICS[0].id);
  const [code, setCode] = useState<string>("");
  const [errorLog, setErrorLog] = useState<string>("");
  const [whatITried, setWhatITried] = useState<string>("");
  const [formError, setFormError] = useState<string>("");
  const [submittedResult, setSubmittedResult] = useState<{
    ticketId: string;
    pipeline: SimulatedPipelineOutput;
  } | null>(null);

  const selectedTopic = DEMO_TOPICS.find((t) => t.id === topicId) ?? DEMO_TOPICS[0];

  const handleLoadSample = () => {
    setTopicId(HERO_SAMPLE_TICKET_INPUT.topic_id);
    setCode(HERO_SAMPLE_TICKET_INPUT.code);
    setErrorLog(HERO_SAMPLE_TICKET_INPUT.error_log);
    setWhatITried(HERO_SAMPLE_TICKET_INPUT.description);
    setFormError("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) {
      setFormError("Please paste your Java code snippet before submitting.");
      return;
    }
    if (whatITried.trim().length < MIN_TRIED_LENGTH) {
      setFormError(
        `Please describe what you already tried (at least ${MIN_TRIED_LENGTH} characters).`
      );
      return;
    }

    setFormError("");
    const pipeline = runSimulatedPipeline({
      topic_id: selectedTopic.id,
      topic_name: selectedTopic.name,
      code,
      error_log: errorLog,
      description: whatITried,
    });

    const created = submitMenteeTicket({
      topic_id: selectedTopic.id,
      topic_name: selectedTopic.name,
      description_sanitized: pipeline.description_sanitized,
      code_sanitized: pipeline.code_sanitized,
      error_log_sanitized: pipeline.error_log_sanitized,
      redactions_count: pipeline.redactions_count,
      redacted_types: pipeline.redacted_types,
      arm: "assisted",
      triage_summary: pipeline.triage_summary,
      highlighted_lines: pipeline.highlighted_lines,
      similar_ticket_note: pipeline.similar_ticket_note,
      hint_1: pipeline.hint_1,
      hint_2: pipeline.hint_2,
      guardrail_1: pipeline.guardrail_1,
    });

    setSubmittedResult({
      ticketId: created.id,
      pipeline,
    });
  };

  if (submittedResult) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <PipelineStepper
          ticketId={submittedResult.ticketId}
          pipeline={submittedResult.pipeline}
          onViewTicket={() => router.push(`/mentee/tickets/${submittedResult.ticketId}`)}
          onSwitchToMentor={() => {
            setRole("mentor");
            router.push(`/mentor/tickets/${submittedResult.ticketId}`);
          }}
        />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header Bar */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
              <Lock className="w-3.5 h-3.5" />
              <span>Pseudonym: {state.mentee.pseudonym}</span>
            </span>
            <button
              type="button"
              onClick={toggleMenteeConsent}
              className={`px-2.5 py-1 rounded-full text-xs font-semibold border cursor-pointer ${
                state.mentee.consent_accepted
                  ? "bg-emerald-50 text-[#059669] border-emerald-200"
                  : "bg-amber-50 text-[#D97706] border-amber-200"
              }`}
              title="Toggle demo consent status"
            >
              Consent: {state.mentee.consent_accepted ? "Accepted" : "Demo Mode (Click to Toggle)"}
            </button>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#0F172A]">
            Submit a Java Debugging Ticket
          </h1>
          <p className="text-sm text-slate-600">
            Sensitive names, NIM, emails, API keys, and file paths are stripped in-browser before AI drafting.
          </p>
        </div>

        <button
          type="button"
          onClick={handleLoadSample}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#EFF6FF] hover:bg-blue-100 text-[#1D4ED8] border border-blue-200 font-semibold text-sm transition-colors cursor-pointer"
        >
          <Bug className="w-4 h-4" />
          <span>Load Sample Java Bug</span>
        </button>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-white border border-[#E2E8F0] rounded-xl p-6 space-y-5 shadow-xs"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label htmlFor="course" className="block text-sm font-semibold text-[#0F172A]">
              Course (Locked)
            </label>
            <input
              id="course"
              type="text"
              readOnly
              value={`${DEMO_COURSE.code} - ${DEMO_COURSE.name}`}
              className="w-full rounded-lg border border-[#E2E8F0] bg-slate-50 px-3 py-2 text-sm text-slate-700 font-medium"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="topic" className="block text-sm font-semibold text-[#0F172A]">
              Syllabus Topic
            </label>
            <select
              id="topic"
              value={topicId}
              onChange={(e) => setTopicId(e.target.value)}
              className="w-full rounded-lg border border-[#E2E8F0] bg-white px-3 py-2 text-sm text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
            >
              {DEMO_TOPICS.map((topic) => (
                <option key={topic.id} value={topic.id}>
                  {topic.name}
                </option>
              ))}
            </select>
            <p className="text-xs text-slate-500">{selectedTopic.description}</p>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="block text-sm font-semibold text-[#0F172A]">
            Java Code Snippet
          </label>
          <JavaCodeEditor value={code} onChange={setCode} height="280px" />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="error-log" className="block text-sm font-semibold text-[#0F172A]">
            Error Log / Output
          </label>
          <textarea
            id="error-log"
            rows={4}
            value={errorLog}
            onChange={(e) => setErrorLog(e.target.value)}
            placeholder="Paste compiler error, exception stack trace, or actual vs expected output..."
            className="w-full rounded-lg border border-[#E2E8F0] bg-[#0F172A] text-slate-100 font-mono text-sm p-3 focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
          />
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label htmlFor="what-i-tried" className="block text-sm font-semibold text-[#0F172A]">
              What I Already Tried <span className="text-[#DC2626]">*</span>
            </label>
            <span
              className={`text-xs font-medium ${
                whatITried.trim().length >= MIN_TRIED_LENGTH
                  ? "text-[#059669]"
                  : "text-slate-500"
              }`}
            >
              {whatITried.trim().length}/{MIN_TRIED_LENGTH} min chars
            </span>
          </div>
          <textarea
            id="what-i-tried"
            rows={3}
            value={whatITried}
            onChange={(e) => setWhatITried(e.target.value)}
            placeholder="Describe the debugging steps or hypotheses you already tested (minimum 20 characters)..."
            className="w-full rounded-lg border border-[#E2E8F0] bg-white px-3 py-2 text-sm text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
          />
        </div>

        {formError && (
          <div className="rounded-lg bg-red-50 border border-red-200 p-3 flex items-center gap-2 text-sm text-[#DC2626]">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-[#E2E8F0]">
          <div className="inline-flex items-center gap-1.5 text-xs text-slate-500">
            <Sparkles className="w-3.5 h-3.5 text-[#1D4ED8]" />
            <span>Runs Real Regex Redaction + Simulated Socratic Pipeline + Guardrail #1</span>
          </div>

          <button
            type="submit"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#2563EB] hover:bg-blue-700 text-white font-semibold text-sm transition-colors cursor-pointer"
          >
            <Send className="w-4 h-4" />
            <span>Run Redaction &amp; Submit Ticket</span>
          </button>
        </div>
      </form>
    </div>
  );
}
