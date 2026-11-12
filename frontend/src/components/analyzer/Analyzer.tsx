"use client";

import { useRef, useState } from "react";
import clsx from "clsx";
import ResumeUpload from "@/components/forms/ResumeUpload";
import JobDescriptionForm from "@/components/forms/JobDescriptionForm";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { analyzeResume } from "@/lib/api";
import { SAMPLE_JOB_DESCRIPTION, loadSampleResume } from "@/lib/samples";
import ResultPanel, { type ResultState } from "./ResultPanel";

const JOB_FIELD_ID = "job-description";

/** The whole app on one page: inputs on the left, the report on the right. */
export default function Analyzer() {
  const [resume, setResume] = useState<File | null>(null);
  const [job, setJob] = useState("");
  const [state, setState] = useState<ResultState>({ kind: "idle" });
  const [sampleError, setSampleError] = useState<string | null>(null);
  const reportRef = useRef<HTMLDivElement>(null);

  const loading = state.kind === "loading";
  const canRun = resume !== null && job.trim() !== "" && !loading;

  const run = async () => {
    if (!canRun) return;
    setState({ kind: "loading" });
    revealReport();
    try {
      setState({ kind: "done", result: await analyzeResume(resume, job) });
    } catch (err) {
      setState({
        kind: "error",
        message: err instanceof Error ? err.message : "Analysis failed",
      });
    }
  };

  // On narrow screens the report sits below the inputs: bring it into view.
  const revealReport = () => {
    const report = reportRef.current;
    if (report && report.getBoundingClientRect().top > window.innerHeight * 0.5) {
      report.scrollIntoView?.({ behavior: "smooth", block: "start" });
    }
  };

  const useSampleResume = async () => {
    setSampleError(null);
    try {
      setResume(await loadSampleResume());
    } catch (err) {
      setSampleError(err instanceof Error ? err.message : "Could not load the sample");
    }
  };

  return (
    <main className="bg-grid min-h-dvh px-4 py-6 sm:px-8 sm:py-8">
      <div className="mx-auto max-w-6xl">
        <Header state={state} />

        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
          <section aria-label="Input" className="flex flex-col gap-6 border border-rule bg-panel p-5 sm:p-6">
            <div>
              <ChannelHeader
                channel="A"
                title={<h2>Resume.pdf</h2>}
                action={
                  <SampleButton onClick={useSampleResume} label="Load sample resume" />
                }
              />
              <ResumeUpload file={resume} onUpload={setResume} />
              {sampleError && <p className="mt-2 text-xs text-red">{sampleError}</p>}
            </div>

            <div>
              <ChannelHeader
                channel="B"
                title={
                  <h2>
                    <label htmlFor={JOB_FIELD_ID}>Job description</label>
                  </h2>
                }
                action={
                  <SampleButton
                    onClick={() => setJob(SAMPLE_JOB_DESCRIPTION)}
                    label="Load sample job"
                  />
                }
              />
              <JobDescriptionForm id={JOB_FIELD_ID} value={job} onChange={setJob} onSubmit={run} />
            </div>

            <div>
              <button
                type="button"
                onClick={run}
                disabled={!canRun}
                className="flex w-full items-center justify-between bg-amber px-5 py-4 text-sm font-semibold uppercase tracking-[0.2em] text-panel transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber disabled:cursor-not-allowed disabled:bg-panel-raised disabled:text-dim"
              >
                <span>{loading ? "Measuring..." : "Run analysis"}</span>
                <span aria-hidden className="hidden text-xs tracking-normal sm:inline">Ctrl+Enter</span>
              </button>
              <p className="mt-4 text-xs leading-relaxed text-dim">
                Skills are read by Google Gemini (free tier) when available, so
                texts may be processed by Google. Email addresses, phone numbers
                and links are removed first, and nothing is stored. Use the
                samples if you would rather not upload your own resume.
              </p>
            </div>
          </section>

          <div ref={reportRef} className="scroll-mt-4">
            <ErrorBoundary>
              <ResultPanel state={state} />
            </ErrorBoundary>
          </div>
        </div>
      </div>
    </main>
  );
}

function Header({ state }: { state: ResultState }) {
  const lamp = {
    idle: { text: "READY", className: "bg-ok/60" },
    loading: { text: "ANALYZING", className: "bg-amber animate-blink" },
    done: { text: "DONE", className: "bg-ok" },
    error: { text: "ERROR", className: "bg-red" },
  }[state.kind];

  return (
    <header className="flex flex-wrap items-center justify-between gap-3 border-b border-rule pb-4">
      <div className="flex items-baseline gap-4">
        <h1 className="font-display text-2xl font-bold tracking-tight">ATS/OPT</h1>
        <p className="hidden text-xs uppercase tracking-[0.2em] text-dim sm:block">
          Resume × job ad · skill coverage
        </p>
      </div>
      <div className="flex items-center gap-2 text-xs tracking-[0.2em]" aria-live="polite">
        <span aria-hidden className={clsx("h-2.5 w-2.5 rounded-full", lamp.className)} />
        <span>{lamp.text}</span>
      </div>
    </header>
  );
}

function ChannelHeader({
  channel,
  title,
  action,
}: {
  channel: string;
  title: React.ReactNode;
  action: React.ReactNode;
}) {
  return (
    <div className="mb-3 flex items-center justify-between gap-3">
      <div className="flex items-center gap-3 text-xs uppercase tracking-[0.2em]">
        <span className="border border-rule px-1.5 py-0.5 text-dim">{channel}</span>
        <div className="[&_h2]:font-medium">{title}</div>
      </div>
      {action}
    </div>
  );
}

function SampleButton({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="text-xs uppercase tracking-widest text-amber underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-amber"
    >
      Use sample
    </button>
  );
}
